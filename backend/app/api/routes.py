from __future__ import annotations

from typing import Any

import pandas as pd
from fastapi import APIRouter, Query, Request

from app.api.errors import InsufficientRatingsError, ModelNotReadyError, UserNotFoundError
from app.api.schemas import RecommendationRequest, RecommendationResponse
from app.config import settings
from app.models.collaborative import (
    item_based_recommendations,
    predict_user_movie_score,
    user_based_recommendations,
)
from app.utils.metrics import mae, precision_recall_at_k, rmse
from app.utils.visualizer import heatmap_sample

router = APIRouter(prefix="/api", tags=["recommender"])


def _engine(request: Request) -> dict[str, Any]:
    engine = getattr(request.app.state, "engine", None)
    if engine is None:
        raise ModelNotReadyError()
    return engine


def _poster_placeholder(title: str) -> str:
    return f"https://placehold.co/320x480/12121a/e50914?text={title[:25].replace(' ', '+')}&font=roboto"


@router.get("/health")
def healthcheck() -> dict:
    return {"status": "ok"}


@router.post("/recommend", response_model=RecommendationResponse)
def recommend(payload: RecommendationRequest, request: Request) -> dict:
    engine = _engine(request)
    user_movie = engine["user_movie"]
    ratings = engine["ratings"]

    if payload.user_id not in user_movie.index:
        raise UserNotFoundError("We couldn't find this user in our filtered dataset.")

    rating_count = int(ratings[ratings["userId"] == payload.user_id].shape[0])
    if rating_count < settings.min_ratings_user:
        raise InsufficientRatingsError("This user hasn't rated enough movies yet.")

    steps = [
        "Loading user rating history...",
        "Building User-Movie Matrix...",
        "Calculating Pearson Correlations...",
        "Finding Top-K Similar Users..." if payload.method == "user" else "Finding Similar Movies...",
        "Ranking & Filtering Recommendations...",
    ]

    if payload.method == "user":
        recs = user_based_recommendations(
            user_id=payload.user_id,
            user_movie_matrix=user_movie,
            user_similarity=engine["user_similarity"],
            movies_df=engine["movies"],
            top_n=payload.top_n,
            k=settings.top_k_neighbors,
        )
    else:
        recs = item_based_recommendations(
            user_id=payload.user_id,
            user_movie_matrix=user_movie,
            item_similarity=engine["item_similarity"],
            movies_df=engine["movies"],
            top_n=payload.top_n,
        )

    for rec in recs:
        rec["poster_url"] = _poster_placeholder(rec["title"])

    return {"recommendations": recs, "steps": steps}


@router.get("/movies")
def movies(
    request: Request,
    search: str = Query(default=""),
    genre: str = Query(default=""),
    page: int = Query(default=1, ge=1),
) -> dict:
    engine = _engine(request)
    movies_df = engine["movies"].copy()
    if search:
        movies_df = movies_df[movies_df["title"].str.contains(search, case=False, na=False)]
    if genre:
        movies_df = movies_df[movies_df["genres"].str.contains(genre, case=False, na=False)]

    total = int(len(movies_df))
    start = (page - 1) * settings.page_size
    end = start + settings.page_size
    page_df = movies_df.iloc[start:end].copy()
    page_df["poster_url"] = page_df["title"].map(_poster_placeholder)
    return {"movies": page_df.to_dict(orient="records"), "total": total}


@router.get("/users")
def users(request: Request, page: int = Query(default=1, ge=1)) -> dict:
    engine = _engine(request)
    ratings = engine["ratings"]
    summary = (
        ratings.groupby("userId")["rating"]
        .agg(num_ratings="count", avg_rating="mean")
        .reset_index()
        .sort_values("userId")
    )
    total = int(summary.shape[0])
    start = (page - 1) * settings.page_size
    end = start + settings.page_size
    out = summary.iloc[start:end].copy()
    out["avg_rating"] = out["avg_rating"].round(3)
    return {"users": out.to_dict(orient="records"), "total": total}


@router.get("/stats")
def stats(request: Request) -> dict:
    engine = _engine(request)
    ratings = engine["ratings"]
    movies_df = engine["movies"]
    user_movie = engine["user_movie"]

    sparsity = 1.0 - (ratings.shape[0] / (user_movie.shape[0] * user_movie.shape[1]))
    genre_counts: dict[str, int] = {}
    for row in movies_df["genres"].dropna():
        for genre in str(row).split("|"):
            genre_counts[genre] = genre_counts.get(genre, 0) + 1
    top_genres = sorted(genre_counts.items(), key=lambda x: x[1], reverse=True)[:5]

    return {
        "total_users": int(user_movie.shape[0]),
        "total_movies": int(user_movie.shape[1]),
        "total_ratings": int(ratings.shape[0]),
        "sparsity": round(float(sparsity), 4),
        "top_genres": [{"genre": g, "count": c} for g, c in top_genres],
        "heatmap": heatmap_sample(user_movie, size=20),
    }


@router.get("/metrics")
def metrics(request: Request, user_id: int = Query(ge=1), k: int = Query(default=10, ge=1, le=20)) -> dict:
    engine = _engine(request)
    user_movie: pd.DataFrame = engine["user_movie"]
    user_similarity: pd.DataFrame = engine["user_similarity"]

    if user_id not in user_movie.index:
        raise UserNotFoundError("Metrics unavailable for unknown user")

    user_ratings = user_movie.loc[user_id].dropna()
    if len(user_ratings) < settings.min_ratings_user:
        raise InsufficientRatingsError("Not enough ratings to evaluate metrics")

    held_out = user_ratings.sample(frac=0.3, random_state=42)
    y_true: list[float] = []
    y_pred: list[float] = []
    for movie_id, true_rating in held_out.items():
        pred = predict_user_movie_score(
            user_id,
            int(movie_id),
            user_movie,
            user_similarity,
            k=settings.top_k_neighbors,
        )
        if pred == pred:
            y_true.append(float(true_rating))
            y_pred.append(float(pred))

    recs = user_based_recommendations(
        user_id=user_id,
        user_movie_matrix=user_movie,
        user_similarity=user_similarity,
        movies_df=engine["movies"],
        top_n=k,
        k=settings.top_k_neighbors,
    )
    predicted_ids = [x["movieId"] for x in recs]
    actual_relevant = set(user_ratings[user_ratings >= 4.0].index.astype(int).tolist())
    precision, recall = precision_recall_at_k(actual_relevant, predicted_ids, k=k)

    return {
        "rmse": round(rmse(y_true, y_pred), 4),
        "mae": round(mae(y_true, y_pred), 4),
        "precision_at_k": round(precision, 4),
        "recall_at_k": round(recall, 4),
    }


@router.get("/correlation")
def correlation(request: Request, movie: str = Query(min_length=1)) -> dict:
    engine = _engine(request)
    movies_df = engine["movies"]
    item_similarity = engine["item_similarity"]

    matches = movies_df[movies_df["title"].str.contains(movie, case=False, na=False)]
    if matches.empty:
        return {"correlations": []}

    movie_id = int(matches.iloc[0]["movieId"])
    if movie_id not in item_similarity.index:
        return {"correlations": []}

    sims = item_similarity.loc[movie_id].sort_values(ascending=False).iloc[1:11]
    lookup = movies_df.set_index("movieId")
    correlations = [
        {
            "title": lookup.at[mid, "title"] if mid in lookup.index else f"Movie {int(mid)}",
            "score": round(float(score), 4),
        }
        for mid, score in sims.items()
    ]
    return {"correlations": correlations}

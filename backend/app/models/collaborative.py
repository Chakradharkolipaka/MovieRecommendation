from __future__ import annotations

import numpy as np
import pandas as pd


def _safe_weighted_average(scores: list[tuple[float, float]]) -> float:
    if not scores:
        return float("nan")
    numerator = sum(sim * rating for sim, rating in scores)
    denominator = sum(abs(sim) for sim, _ in scores)
    if denominator == 0:
        return float("nan")
    return numerator / denominator


def predict_user_movie_score(
    user_id: int,
    movie_id: int,
    user_movie_matrix: pd.DataFrame,
    user_similarity: pd.DataFrame,
    k: int = 10,
) -> float:
    if user_id not in user_movie_matrix.index or movie_id not in user_movie_matrix.columns:
        return float("nan")

    if user_id not in user_similarity.index:
        return float("nan")

    similarities = user_similarity.loc[user_id].drop(index=user_id, errors="ignore").dropna()
    neighbors = similarities.sort_values(ascending=False).head(k)

    candidates: list[tuple[float, float]] = []
    for neighbor_id, sim in neighbors.items():
        rating = user_movie_matrix.loc[neighbor_id, movie_id]
        if not np.isnan(rating):
            candidates.append((float(sim), float(rating)))

    return _safe_weighted_average(candidates)


def user_based_recommendations(
    user_id: int,
    user_movie_matrix: pd.DataFrame,
    user_similarity: pd.DataFrame,
    movies_df: pd.DataFrame,
    top_n: int = 10,
    k: int = 10,
) -> list[dict]:
    if user_id not in user_movie_matrix.index:
        return []

    seen = user_movie_matrix.loc[user_id].dropna().index
    unseen_movies = [movie for movie in user_movie_matrix.columns if movie not in seen]

    scored: list[tuple[int, float]] = []
    for movie_id in unseen_movies:
        score = predict_user_movie_score(user_id, movie_id, user_movie_matrix, user_similarity, k)
        if not np.isnan(score):
            scored.append((int(movie_id), float(score)))

    scored.sort(key=lambda x: x[1], reverse=True)
    movie_lookup = movies_df.set_index("movieId")
    return [
        {
            "movieId": mid,
            "title": movie_lookup.at[mid, "title"] if mid in movie_lookup.index else f"Movie {mid}",
            "genres": movie_lookup.at[mid, "genres"] if mid in movie_lookup.index else "Unknown",
            "score": round(score, 4),
        }
        for mid, score in scored[:top_n]
    ]


def item_based_recommendations(
    user_id: int,
    user_movie_matrix: pd.DataFrame,
    item_similarity: pd.DataFrame,
    movies_df: pd.DataFrame,
    top_n: int = 10,
    min_like_rating: float = 4.0,
) -> list[dict]:
    if user_id not in user_movie_matrix.index:
        return []

    user_ratings = user_movie_matrix.loc[user_id].dropna()
    liked = user_ratings[user_ratings >= min_like_rating]
    if liked.empty:
        return []

    seen = set(user_ratings.index.tolist())
    aggregate: dict[int, float] = {}

    for liked_movie, rating in liked.items():
        if liked_movie not in item_similarity.index:
            continue
        sims = item_similarity.loc[liked_movie].sort_values(ascending=False)
        for movie_id, sim in sims.items():
            if movie_id == liked_movie or movie_id in seen:
                continue
            aggregate[int(movie_id)] = aggregate.get(int(movie_id), 0.0) + float(sim) * float(rating)

    ranked = sorted(aggregate.items(), key=lambda x: x[1], reverse=True)
    movie_lookup = movies_df.set_index("movieId")
    return [
        {
            "movieId": mid,
            "title": movie_lookup.at[mid, "title"] if mid in movie_lookup.index else f"Movie {mid}",
            "genres": movie_lookup.at[mid, "genres"] if mid in movie_lookup.index else "Unknown",
            "score": round(score, 4),
        }
        for mid, score in ranked[:top_n]
    ]

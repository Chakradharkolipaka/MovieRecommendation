from __future__ import annotations

import numpy as np
import pandas as pd


MOOD_GENRE_MAP = {
    "😂 Comedy": ["Comedy"],
    "😱 Thriller": ["Thriller", "Horror", "Mystery"],
    "😢 Drama": ["Drama"],
    "🚀 Sci-Fi": ["Science Fiction", "Adventure", "Action", "Sci-Fi"],
    "❤️ Romance": ["Romance", "Drama"],
    "🎭 Mystery": ["Mystery", "Crime", "Thriller"],
    "🌍 World": [],
}

RUNTIME_MAP = {
    "short": (0, 89),
    "normal": (90, 140),
    "epic": (141, 999),
}


def _safe_weighted_average(scores: list[tuple[float, float]]) -> float:
    if not scores:
        return float("nan")
    numerator = sum(sim * rating for sim, rating in scores)
    denominator = sum(abs(sim) for sim, _ in scores)
    if denominator == 0:
        return float("nan")
    return numerator / denominator


def pre_filter_candidates(
    movies_df: pd.DataFrame,
    moods: list[str] | None,
    era_start: int | None,
    era_end: int | None,
    runtime: str | None,
    rating_floor: float,
    min_vote_count: int,
    language: str | None,
) -> pd.DataFrame:
    """
    Applies user profile filters before CF scoring.
    Never over-filters into an empty set: only applies a filter when enough rows remain.
    """
    df = movies_df.copy()

    if moods:
        allowed_genres = set()
        for mood in moods:
            allowed_genres.update(MOOD_GENRE_MAP.get(mood, []))
        if allowed_genres:
            mask = df["genres"].fillna("").apply(lambda g: any(ag.lower() in g.lower() for ag in allowed_genres))
            filtered = df[mask]
            if len(filtered) >= 10:
                df = filtered

    if era_start and "year" in df.columns:
        filtered = df[df["year"] >= era_start]
        if len(filtered) >= 10:
            df = filtered
    if era_end and "year" in df.columns:
        filtered = df[df["year"] <= era_end]
        if len(filtered) >= 10:
            df = filtered

    if runtime and runtime in RUNTIME_MAP and "runtime" in df.columns:
        lo, hi = RUNTIME_MAP[runtime]
        filtered = df[df["runtime"].between(lo, hi)]
        if len(filtered) >= 10:
            df = filtered

    if "avg_rating" in df.columns:
        filtered = df[df["avg_rating"] >= rating_floor]
        if len(filtered) >= 10:
            df = filtered

    if "rating_count" in df.columns:
        filtered = df[df["rating_count"] >= min_vote_count]
        if len(filtered) >= 10:
            df = filtered

    if language and language != "any" and "language" in df.columns:
        filtered = df[df["language"] == language]
        if len(filtered) >= 5:
            df = filtered

    return df


def build_explanation(
    user_id: int,
    movie_id: int,
    similar_users: list[tuple[int, float]],
    ratings_df: pd.DataFrame,
    movies_df: pd.DataFrame,
    user_genres: list[str],
) -> dict:
    raters = ratings_df[
        (ratings_df["movieId"] == movie_id)
        & (ratings_df["userId"].isin([u for u, _ in similar_users]))
    ]
    neighbor_count = int(len(raters))
    avg_neighbor_rating = round(float(raters["rating"].mean()), 2) if not raters.empty else 0.0

    movie_rows = movies_df[movies_df["movieId"] == movie_id]
    movie_genre_list = []
    if not movie_rows.empty:
        movie_genre_list = str(movie_rows.iloc[0].get("genres", "")).split("|")
    overlap = [g for g in movie_genre_list if g in user_genres]

    top_sim_score = round(max([s for _, s in similar_users], default=0.0), 3)
    human = (
        f"{neighbor_count} viewers with similar taste rated this {avg_neighbor_rating}★"
        + (f" · matches your {overlap[0]} preference" if overlap else "")
    )

    return {
        "neighbor_count": neighbor_count,
        "avg_neighbor_rating": avg_neighbor_rating,
        "genre_overlap": overlap[:3],
        "top_similarity": top_sim_score,
        "human": human,
    }


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
    candidate_movies = set(movies_df["movieId"].astype(int).tolist())
    unseen_movies = [movie for movie in user_movie_matrix.columns if movie not in seen and int(movie) in candidate_movies]

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
            "similarity_score": round(min(max(score / 5.0, 0.0), 1.0), 4),
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
    candidate_movies = set(movies_df["movieId"].astype(int).tolist())
    aggregate: dict[int, float] = {}

    for liked_movie, rating in liked.items():
        if liked_movie not in item_similarity.index:
            continue
        sims = item_similarity.loc[liked_movie].sort_values(ascending=False)
        for movie_id, sim in sims.items():
            if movie_id == liked_movie or movie_id in seen or int(movie_id) not in candidate_movies:
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
            "similarity_score": round(min(max(score / 25.0, 0.0), 1.0), 4),
        }
        for mid, score in ranked[:top_n]
    ]

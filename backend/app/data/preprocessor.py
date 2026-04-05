from __future__ import annotations

import pandas as pd


def filter_ratings(
    ratings_df: pd.DataFrame,
    min_ratings_user: int,
    min_ratings_movie: int,
) -> pd.DataFrame:
    user_counts = ratings_df.groupby("userId")["rating"].count()
    movie_counts = ratings_df.groupby("movieId")["rating"].count()

    valid_users = user_counts[user_counts >= min_ratings_user].index
    valid_movies = movie_counts[movie_counts >= min_ratings_movie].index

    filtered = ratings_df[
        ratings_df["userId"].isin(valid_users) & ratings_df["movieId"].isin(valid_movies)
    ].copy()
    return filtered


def build_user_movie_matrix(ratings_df: pd.DataFrame) -> pd.DataFrame:
    return ratings_df.pivot_table(index="userId", columns="movieId", values="rating")


def normalize_by_user_mean(user_movie_matrix: pd.DataFrame) -> pd.DataFrame:
    user_means = user_movie_matrix.mean(axis=1)
    return user_movie_matrix.sub(user_means, axis=0)

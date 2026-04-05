from __future__ import annotations

from pathlib import Path

import pandas as pd


DATA_DIR = Path(__file__).resolve().parent / "movielens"


def load_movielens(data_dir: Path | None = None) -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    base = data_dir or DATA_DIR
    movies_path = base / "movies.csv"
    ratings_path = base / "ratings.csv"

    if not movies_path.exists() or not ratings_path.exists():
        raise FileNotFoundError(
            "MovieLens files not found. Expected movies.csv and ratings.csv under app/data/movielens"
        )

    movies = pd.read_csv(movies_path)
    ratings = pd.read_csv(ratings_path)
    merged = ratings.merge(movies, on="movieId", how="inner")
    return movies, ratings, merged

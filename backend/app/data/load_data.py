from __future__ import annotations

from pathlib import Path

import pandas as pd
from sqlalchemy import select

from app.db import Base, SessionLocal, engine
from app.models import Movie, Rating


DATA_DIR = Path(__file__).resolve().parent / "movielens"


def init_db() -> None:
    Base.metadata.create_all(bind=engine)


def load_csv_data(data_dir: Path | None = None) -> None:
    base = data_dir or DATA_DIR
    movies_path = base / "movies.csv"
    ratings_path = base / "ratings.csv"

    if not movies_path.exists() or not ratings_path.exists():
        return

    movies_df = pd.read_csv(movies_path)
    ratings_df = pd.read_csv(ratings_path)

    with SessionLocal() as db:
        existing_movie_ids = set(db.scalars(select(Movie.id)).all())
        movie_rows = [
            Movie(id=int(row.movieId), title=str(row.title), genres=str(row.genres))
            for row in movies_df.itertuples(index=False)
            if int(row.movieId) not in existing_movie_ids
        ]
        if movie_rows:
            db.add_all(movie_rows)
            db.commit()

        existing_key_rows = db.execute(select(Rating.user_id, Rating.movie_id)).all()
        existing_rating_keys = {(int(u), int(m)) for u, m in existing_key_rows}
        rating_rows = []
        for row in ratings_df.itertuples(index=False):
            key = (int(row.userId), int(row.movieId))
            if key in existing_rating_keys:
                continue
            rating_rows.append(
                Rating(
                    user_id=int(row.userId),
                    movie_id=int(row.movieId),
                    rating=float(row.rating),
                    timestamp=int(row.timestamp),
                )
            )

        if rating_rows:
            db.add_all(rating_rows)
            db.commit()

from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.errors import AppError, app_error_handler, unhandled_error_handler
from app.api.routes import router
from app.config import settings
from app.data.load_data import init_db, load_csv_data
from app.data.loader import load_movielens
from app.data.preprocessor import build_user_movie_matrix, filter_ratings, normalize_by_user_mean
from app.models.similarity import cosine_item_similarity, pearson_user_similarity


def build_engine() -> dict:
    movies, ratings, _ = load_movielens()
    filtered = filter_ratings(
        ratings,
        min_ratings_user=settings.min_ratings_user,
        min_ratings_movie=settings.min_ratings_movie,
    )
    user_movie = build_user_movie_matrix(filtered)
    normalized = normalize_by_user_mean(user_movie)
    user_similarity = pearson_user_similarity(normalized)
    item_similarity = cosine_item_similarity(user_movie)
    return {
        "movies": movies,
        "ratings": filtered,
        "user_movie": user_movie,
        "normalized": normalized,
        "user_similarity": user_similarity,
        "item_similarity": item_similarity,
    }


app = FastAPI(title=settings.app_name)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_exception_handler(AppError, app_error_handler)
app.add_exception_handler(Exception, unhandled_error_handler)
app.include_router(router)


@app.on_event("startup")
def startup_event() -> None:
    init_db()
    load_csv_data()
    app.state.engine = build_engine()

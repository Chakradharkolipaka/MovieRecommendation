from __future__ import annotations

import os
from dataclasses import dataclass

from dotenv import load_dotenv

load_dotenv()


def _csv_env(key: str, default: str) -> list[str]:
    raw = os.getenv(key, default)
    return [item.strip() for item in raw.split(",") if item.strip()]


@dataclass(frozen=True)
class Settings:
    app_name: str = os.getenv("APP_NAME", "Movie Recommender API")
    cors_origins: list[str] = None
    min_ratings_user: int = int(os.getenv("MIN_RATINGS_USER", "5"))
    min_ratings_movie: int = int(os.getenv("MIN_RATINGS_MOVIE", "10"))
    default_top_n: int = int(os.getenv("DEFAULT_TOP_N", "10"))
    top_k_neighbors: int = int(os.getenv("TOP_K_NEIGHBORS", "10"))
    page_size: int = int(os.getenv("PAGE_SIZE", "20"))
    tmdb_api_key: str | None = os.getenv("TMDB_API_KEY")

    def __post_init__(self) -> None:
        if self.cors_origins is None:
            object.__setattr__(
                self,
                "cors_origins",
                _csv_env("CORS_ORIGINS", "http://localhost:5173"),
            )


settings = Settings()

from __future__ import annotations

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field


class RecommendationRequest(BaseModel):
    user_id: int = Field(gt=0)
    method: Literal["user", "item"] = "user"
    top_n: int = Field(default=10, ge=5, le=20)
    moods: list[str] | None = None
    age_group: Literal["teen", "adult", "senior"] | None = None
    era_start: int | None = Field(default=None, ge=1900, le=2024)
    era_end: int | None = Field(default=None, ge=1900, le=2024)
    runtime: Literal["short", "normal", "epic", "any"] | None = None
    rating_floor: float = Field(default=3.0, ge=0.5, le=5.0)
    min_vote_count: int = Field(default=50, ge=10, le=5000)
    language: Literal["en", "hi", "ko", "es", "fr", "any"] | None = None
    force_refresh: bool = False


class RecommendationItem(BaseModel):
    movieId: int
    title: str
    genres: str
    score: float
    similarity_score: float | None = None
    poster_url: str | None = None
    explanation: dict[str, Any] | None = None


class RecommendationResponse(BaseModel):
    recommendations: list[RecommendationItem]
    steps: list[str]


class ErrorResponse(BaseModel):
    error: str
    message: str
    code: int
    timestamp: datetime


class RateRequest(BaseModel):
    user_id: int = Field(gt=0)
    movie_id: int = Field(gt=0)
    rating: float = Field(ge=0.5, le=5.0)


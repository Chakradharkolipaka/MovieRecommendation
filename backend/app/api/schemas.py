from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class RecommendationRequest(BaseModel):
    user_id: int = Field(gt=0)
    method: Literal["user", "item"] = "user"
    top_n: int = Field(default=10, ge=1, le=50)


class RecommendationItem(BaseModel):
    movieId: int
    title: str
    genres: str
    score: float
    poster_url: str | None = None


class RecommendationResponse(BaseModel):
    recommendations: list[RecommendationItem]
    steps: list[str]


class ErrorResponse(BaseModel):
    error: str
    message: str
    code: int
    timestamp: datetime

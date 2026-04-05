from __future__ import annotations

from datetime import datetime, timezone

from fastapi import Request
from fastapi.responses import JSONResponse


class AppError(Exception):
    code = 500
    error = "INTERNAL_ERROR"
    message = "Unexpected error"

    def __init__(self, message: str | None = None) -> None:
        if message:
            self.message = message


class UserNotFoundError(AppError):
    code = 404
    error = "USER_NOT_FOUND"
    message = "User was not found"


class InsufficientRatingsError(AppError):
    code = 422
    error = "INSUFFICIENT_DATA"
    message = "User does not have enough ratings"


class ModelNotReadyError(AppError):
    code = 503
    error = "MODEL_NOT_READY"
    message = "Recommendation model is not ready"


def _payload(error: AppError) -> dict:
    return {
        "error": error.error,
        "message": error.message,
        "code": error.code,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


async def app_error_handler(_: Request, exc: AppError) -> JSONResponse:
    return JSONResponse(status_code=exc.code, content=_payload(exc))


async def unhandled_error_handler(_: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=500,
        content={
            "error": "INTERNAL_ERROR",
            "message": str(exc),
            "code": 500,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        },
    )

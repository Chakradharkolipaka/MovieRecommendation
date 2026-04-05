from __future__ import annotations

from sqlalchemy import Float, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class Rating(Base):
    __tablename__ = "ratings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, index=True, nullable=False)
    movie_id: Mapped[int] = mapped_column(ForeignKey("movies.id"), index=True, nullable=False)
    rating: Mapped[float] = mapped_column(Float, nullable=False)
    timestamp: Mapped[int] = mapped_column(Integer, nullable=False)

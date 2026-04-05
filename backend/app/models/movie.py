from __future__ import annotations

from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class Movie(Base):
    __tablename__ = "movies"

    id: Mapped[int] = mapped_column("id", Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    genres: Mapped[str] = mapped_column(String(255), nullable=False, default="Unknown")

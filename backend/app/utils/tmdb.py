from __future__ import annotations

import asyncio
import os
import re
from functools import lru_cache

import httpx


TMDB_KEY = os.getenv("TMDB_API_KEY")
TMDB_BASE = "https://api.themoviedb.org/3"
TMDB_IMG = "https://image.tmdb.org/t/p/w300"


def _parse_year(title: str) -> tuple[str, int | None]:
    match = re.search(r"\((\d{4})\)\s*$", title)
    if match:
        year = int(match.group(1))
        clean_title = title[: match.start()].strip()
        return clean_title, year
    return title, None


@lru_cache(maxsize=2000)
def _fetch_poster_sync(title: str) -> str | None:
    if not TMDB_KEY:
        return None

    clean_title, year = _parse_year(title)
    params: dict[str, str | int] = {"api_key": TMDB_KEY, "query": clean_title}
    if year:
        params["year"] = year

    try:
        res = httpx.get(f"{TMDB_BASE}/search/movie", params=params, timeout=3.0)
        results = res.json().get("results", [])
        for movie in results:
            poster = movie.get("poster_path")
            if poster:
                return f"{TMDB_IMG}{poster}"
    except Exception:
        return None
    return None


async def get_poster_url(title: str) -> str | None:
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, _fetch_poster_sync, title)


async def enrich_recommendations_with_posters(recommendations: list[dict]) -> list[dict]:
    tasks = [get_poster_url(r.get("title", "")) for r in recommendations]
    posters = await asyncio.gather(*tasks, return_exceptions=True)
    for rec, url in zip(recommendations, posters):
        rec["poster_url"] = url if isinstance(url, str) else None
    return recommendations

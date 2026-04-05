from __future__ import annotations

import pandas as pd


def build_movie_user_matrix(user_movie_matrix: pd.DataFrame) -> pd.DataFrame:
    return user_movie_matrix.T

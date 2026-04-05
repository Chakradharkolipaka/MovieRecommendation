from __future__ import annotations

import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity


def pearson_user_similarity(normalized_user_movie: pd.DataFrame) -> pd.DataFrame:
    return normalized_user_movie.T.corr(method="pearson", min_periods=2)


def cosine_item_similarity(user_movie_matrix: pd.DataFrame) -> pd.DataFrame:
    matrix = user_movie_matrix.fillna(0)
    sims = cosine_similarity(matrix.T)
    return pd.DataFrame(sims, index=matrix.columns, columns=matrix.columns)

from __future__ import annotations

import pandas as pd


def heatmap_sample(user_movie_matrix: pd.DataFrame, size: int = 20) -> list[dict]:
    sample = user_movie_matrix.iloc[:size, :size].fillna(0)
    points: list[dict] = []
    for r, row_label in enumerate(sample.index.tolist()):
        for c, col_label in enumerate(sample.columns.tolist()):
            points.append(
                {
                    "row": int(r),
                    "col": int(c),
                    "userId": int(row_label),
                    "movieId": int(col_label),
                    "value": float(sample.iat[r, c]),
                }
            )
    return points

from __future__ import annotations

from pathlib import Path

import pandas as pd


def generate_sparse_ratings(drop_ratio: float = 0.3, seed: int = 42) -> None:
    data_path = (
        Path(__file__).resolve().parents[1]
        / "app"
        / "data"
        / "movielens"
        / "ratings.csv"
    )
    ratings = pd.read_csv(data_path)

    keep_rows = []
    for user_id, group in ratings.groupby("userId"):
        group = group.sample(frac=1, random_state=seed + int(user_id)).reset_index(drop=True)
        keep_count = max(5, int(round(len(group) * (1 - drop_ratio))))
        keep_rows.append(group.iloc[:keep_count])

    sparse = pd.concat(keep_rows, ignore_index=True).sort_values(["userId", "movieId"])
    sparse.to_csv(data_path, index=False)
    print(f"Wrote sparse ratings to {data_path} with {len(sparse)} rows")


if __name__ == "__main__":
    generate_sparse_ratings()

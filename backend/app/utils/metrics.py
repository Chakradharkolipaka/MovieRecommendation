from __future__ import annotations

import math

import numpy as np


def rmse(y_true: list[float], y_pred: list[float]) -> float:
    if not y_true:
        return 0.0
    mse = np.mean([(t - p) ** 2 for t, p in zip(y_true, y_pred)])
    return float(math.sqrt(mse))


def mae(y_true: list[float], y_pred: list[float]) -> float:
    if not y_true:
        return 0.0
    return float(np.mean([abs(t - p) for t, p in zip(y_true, y_pred)]))


def precision_recall_at_k(
    actual_relevant: set[int],
    predicted_ranked: list[int],
    k: int = 10,
) -> tuple[float, float]:
    if k <= 0:
        return 0.0, 0.0
    pred_top_k = set(predicted_ranked[:k])
    if not pred_top_k:
        return 0.0, 0.0
    tp = len(actual_relevant.intersection(pred_top_k))
    precision = tp / max(len(pred_top_k), 1)
    recall = tp / max(len(actual_relevant), 1)
    return float(precision), float(recall)

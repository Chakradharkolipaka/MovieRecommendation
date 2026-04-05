from app.data.loader import load_movielens
from app.data.preprocessor import build_user_movie_matrix, filter_ratings, normalize_by_user_mean
from app.models.collaborative import item_based_recommendations, user_based_recommendations
from app.models.similarity import cosine_item_similarity, pearson_user_similarity


def _build_context():
    movies, ratings, _ = load_movielens()
    filtered = filter_ratings(ratings, min_ratings_user=5, min_ratings_movie=10)
    matrix = build_user_movie_matrix(filtered)
    normalized = normalize_by_user_mean(matrix)
    user_sim = pearson_user_similarity(normalized)
    item_sim = cosine_item_similarity(matrix)
    return movies, matrix, user_sim, item_sim


def test_pearson_diagonal_is_one():
    _, _, user_sim, _ = _build_context()
    assert float(user_sim.iloc[0, 0]) == 1.0


def test_user_based_recommendations_schema():
    movies, matrix, user_sim, _ = _build_context()
    recs = user_based_recommendations(1, matrix, user_sim, movies, top_n=3, k=5)
    assert isinstance(recs, list)
    if recs:
        assert {"movieId", "title", "genres", "score"}.issubset(recs[0].keys())


def test_item_based_recommendations_list():
    movies, matrix, _, item_sim = _build_context()
    recs = item_based_recommendations(9, matrix, item_sim, movies, top_n=3)
    assert isinstance(recs, list)

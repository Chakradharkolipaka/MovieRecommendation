from fastapi.testclient import TestClient

from app.main import app
import app.api.routes as routes
from app.data.load_data import init_db, load_csv_data
from app.main import build_engine


init_db()
load_csv_data()
app.state.engine = build_engine()
client = TestClient(app)


def test_healthcheck():
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"


def test_stats_endpoint_shape():
    res = client.get("/api/stats")
    assert res.status_code == 200
    body = res.json()
    assert body["total_users"] > 0
    assert body["total_movies"] > 0


def test_recommend_endpoint_ok():
    payload = {"user_id": 1, "method": "user", "top_n": 5}
    res = client.post("/api/recommend", json=payload)
    assert res.status_code == 200
    body = res.json()
    assert "recommendations" in body
    assert "steps" in body
    assert len(body["recommendations"]) > 0


def test_recommend_fallback_when_cf_returns_empty(monkeypatch):
    monkeypatch.setattr(routes, "user_based_recommendations", lambda **_: [])
    payload = {"user_id": 1, "method": "user", "top_n": 5}
    res = client.post("/api/recommend", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert len(data["recommendations"]) > 0


def test_rate_endpoint_success_sets_dirty_user():
    payload = {"user_id": 1, "movie_id": 30, "rating": 4.0}
    res = client.post("/api/rate", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "saved"
    assert 1 in app.state.dirty_users


def test_rate_endpoint_rejects_out_of_range_rating():
    payload = {"user_id": 1, "movie_id": 10, "rating": 7.0}
    res = client.post("/api/rate", json=payload)
    assert res.status_code == 422


def test_rate_endpoint_unknown_user():
    payload = {"user_id": 9999, "movie_id": 10, "rating": 4.0}
    res = client.post("/api/rate", json=payload)
    assert res.status_code == 404

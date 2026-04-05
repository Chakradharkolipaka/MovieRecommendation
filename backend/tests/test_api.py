from fastapi.testclient import TestClient

from app.main import app


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

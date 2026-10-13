import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1] / "backend"))
from app import app


def test_health():
    r = app.test_client().get("/api/health")
    assert r.status_code == 200
    assert r.get_json()["status"] == "ok"

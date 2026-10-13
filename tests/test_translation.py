import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1] / "backend"))
from app import app

def test_translate_missing_text():
    client = app.test_client()
    res = client.post("/api/translate", json={})
    assert res.status_code == 400

def test_translate_valid_payload():
    client = app.test_client()
    res = client.post("/api/translate", json={"text": "Space station habitat", "language_mode": "en-zu"})
    assert res.status_code == 200
    data = res.get_json()
    assert data["original_text"] == "Space station habitat"
    assert "translated_text" in data
    assert data["target_lang"] == "zulu"

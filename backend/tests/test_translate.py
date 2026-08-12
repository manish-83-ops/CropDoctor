"""Tests for /api/translate endpoint."""

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_translate_endpoint():
    """Test translate endpoint fallback behavior."""
    payload = {
        "text": "Early Blight",
        "targetLanguage": "hi",
    }
    response = client.post("/api/translate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "translatedText" in data
    assert "targetLanguage" in data

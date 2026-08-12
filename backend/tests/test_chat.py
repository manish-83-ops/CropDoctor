"""Tests for /api/chat endpoint."""

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_chat_endpoint_fallback():
    """Test chat fallback response when no API key is provided."""
    payload = {
        "message": "How do I treat tomato early blight?",
        "diseaseContext": "Tomato Early Blight",
        "language": "en",
    }
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    assert len(data["reply"]) > 0


def test_chat_endpoint_hindi():
    """Test chat fallback response in Hindi."""
    payload = {
        "message": "टमाटर के रोग का इलाज क्या है?",
        "diseaseContext": "Tomato Early Blight",
        "language": "hi",
    }
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    assert data["language"] == "hi"

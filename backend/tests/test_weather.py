"""Tests for /api/weather endpoint."""

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_weather_endpoint_unconfigured():
    """Test weather endpoint when API key is not configured."""
    response = client.get("/api/weather?lat=28.6139&lon=77.2090")
    assert response.status_code == 200
    data = response.json()
    assert "available" in data

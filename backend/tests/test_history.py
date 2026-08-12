"""Tests for /api/history endpoint."""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_history_list_and_save():
    """Test getting history list and saving a new prediction entry."""
    # 1. Get history (should return list)
    resp = client.get("/api/history")
    assert resp.status_code == 200
    data = resp.json()
    assert "predictions" in data
    assert "count" in data

    # 2. Save a prediction
    payload = {
        "imageUrl": "/static/uploads/test.jpg",
        "imagePath": "test.jpg",
        "topPrediction": "Tomato___healthy",
        "farmerName": "Tomato Healthy",
        "confidence": 0.95,
        "severity": "green",
        "gradcamUrl": None,
        "diseaseInfo": None,
        "predictions": [{"className": "Tomato___healthy", "confidence": 0.95}],
        "isUnknown": False,
    }
    post_resp = client.post("/api/history", json=payload)
    assert post_resp.status_code == 200
    saved_data = post_resp.json()
    assert saved_data.get("saved") is True
    item_id = saved_data.get("id")
    assert item_id is not None

    # 3. Get specific item
    get_resp = client.get(f"/api/history/{item_id}")
    assert get_resp.status_code == 200
    assert get_resp.json()["id"] == item_id

    # 4. Delete item
    del_resp = client.delete(f"/api/history/{item_id}")
    assert del_resp.status_code == 200
    assert del_resp.json().get("deleted") is True


def test_get_nonexistent_history_item():
    """Test getting an item that does not exist."""
    resp = client.get("/api/history/non_existent_id_9999")
    assert resp.status_code == 404

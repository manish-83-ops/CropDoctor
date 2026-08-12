"""Tests for /api/predict endpoint."""

import io
import pytest
import numpy as np
from fastapi.testclient import TestClient
from PIL import Image

from app.main import app

client = TestClient(app)


def create_leaf_test_image_bytes(size=(300, 300)) -> bytes:
    """Helper to generate a textured green image for testing image quality gate."""
    # Create textured green image (high laplacian variance, high green ratio, balanced brightness)
    arr = np.random.randint(50, 200, (size[1], size[0], 3), dtype=np.uint8)
    # Enhance green channel
    arr[:, :, 1] = np.clip(arr[:, :, 1] + 80, 0, 255)
    img = Image.fromarray(arr, "RGB")
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()


def test_predict_endpoint_success():
    """Test /api/predict with a valid image."""
    img_bytes = create_leaf_test_image_bytes()
    files = {"file": ("test_leaf.jpg", img_bytes, "image/jpeg")}

    response = client.post("/api/predict", files=files)
    assert response.status_code == 200

    data = response.json()
    assert "success" in data
    assert data["success"] is True
    assert "predictions" in data
    assert len(data["predictions"]) > 0
    assert "className" in data["predictions"][0]
    assert "confidence" in data["predictions"][0]
    assert "imageUrl" in data
    assert "inferenceTimeMs" in data


def test_predict_endpoint_invalid_file_type():
    """Test /api/predict with an invalid file type (e.g. text file)."""
    files = {"file": ("test.txt", b"hello world", "text/plain")}

    response = client.post("/api/predict", files=files)
    assert response.status_code == 400
    data = response.json()
    assert data["error"] is True
    assert "is not allowed" in data["message"]

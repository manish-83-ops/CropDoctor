"""CropDoctor AI — History API Endpoint.

GET  /api/history     — List all past predictions
GET  /api/history/:id — Get a single prediction
POST /api/history     — Save a new prediction record
"""

from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from app.db.repositories import (
    get_all_predictions,
    get_prediction_by_id,
    save_prediction,
    delete_prediction,
)

router = APIRouter(tags=["history"])


class SavePredictionRequest(BaseModel):
    """Request body for saving a prediction to history."""
    image_url: str = Field(..., alias="imageUrl")
    image_path: str = Field("", alias="imagePath")
    top_prediction: str = Field(..., alias="topPrediction")
    farmer_name: str = Field(..., alias="farmerName")
    confidence: float
    severity: str
    gradcam_url: str | None = Field(None, alias="gradcamUrl")
    disease_info: dict | None = Field(None, alias="diseaseInfo")
    predictions: list[dict] = []
    is_unknown: bool = Field(False, alias="isUnknown")

    model_config = {"populate_by_name": True}


@router.get("/api/history")
async def list_history(limit: int = 50):
    """List all past predictions, most recent first."""
    predictions = await get_all_predictions(limit=limit)
    return {"predictions": predictions, "count": len(predictions)}


@router.get("/api/history/{prediction_id}")
async def get_history_item(prediction_id: str):
    """Get a single prediction by ID."""
    prediction = await get_prediction_by_id(prediction_id)
    if prediction is None:
        return JSONResponse(
            status_code=404,
            content={"error": True, "message": "Prediction not found"},
        )
    return prediction


@router.post("/api/history")
async def save_history_item(body: SavePredictionRequest):
    """Save a prediction to history."""
    prediction_id = await save_prediction(
        image_url=body.image_url,
        image_path=body.image_path,
        top_prediction=body.top_prediction,
        farmer_name=body.farmer_name,
        confidence=body.confidence,
        severity=body.severity,
        gradcam_url=body.gradcam_url,
        disease_info=body.disease_info,
        predictions=body.predictions,
        is_unknown=body.is_unknown,
    )
    return {"id": prediction_id, "saved": True}


@router.delete("/api/history/{prediction_id}")
async def delete_history_item(prediction_id: str):
    """Delete a prediction from history."""
    deleted = await delete_prediction(prediction_id)
    if not deleted:
        return JSONResponse(
            status_code=404,
            content={"error": True, "message": "Prediction not found"},
        )
    return {"deleted": True}

"""CropDoctor AI — Data Access Layer (Repository Pattern).

All database operations go through here.
Never put SQL in route handlers or services.
"""

import json
import uuid
from datetime import datetime

from app.db.database import get_db, close_db


async def save_prediction(
    image_url: str,
    image_path: str,
    top_prediction: str,
    farmer_name: str,
    confidence: float,
    severity: str,
    gradcam_url: str | None,
    disease_info: dict | None,
    predictions: list[dict],
    is_unknown: bool,
) -> str:
    """Save a prediction record to the database.

    Returns the generated prediction ID.
    """
    prediction_id = uuid.uuid4().hex[:12]
    db = await get_db()

    try:
        await db.execute(
            """
            INSERT INTO predictions (
                id, image_path, image_url, top_prediction, farmer_name,
                confidence, severity, gradcam_url, disease_info_json,
                predictions_json, is_unknown, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                prediction_id,
                image_path,
                image_url,
                top_prediction,
                farmer_name,
                confidence,
                severity,
                gradcam_url,
                json.dumps(disease_info) if disease_info else None,
                json.dumps(predictions),
                1 if is_unknown else 0,
                datetime.utcnow().isoformat(),
            ),
        )
        await db.commit()
    finally:
        await close_db(db)

    return prediction_id


async def get_all_predictions(limit: int = 50) -> list[dict]:
    """Get all predictions, most recent first."""
    db = await get_db()

    try:
        cursor = await db.execute(
            """
            SELECT id, image_url, top_prediction, farmer_name, confidence,
                   severity, gradcam_url, disease_info_json, predictions_json,
                   is_unknown, created_at
            FROM predictions
            ORDER BY created_at DESC
            LIMIT ?
            """,
            (limit,),
        )
        rows = await cursor.fetchall()
    finally:
        await close_db(db)

    results = []
    for row in rows:
        results.append({
            "id": row["id"],
            "imageUrl": row["image_url"],
            "topPrediction": row["top_prediction"],
            "farmerName": row["farmer_name"],
            "confidence": row["confidence"],
            "severity": row["severity"],
            "gradcamUrl": row["gradcam_url"],
            "diseaseInfo": json.loads(row["disease_info_json"]) if row["disease_info_json"] else None,
            "predictions": json.loads(row["predictions_json"]) if row["predictions_json"] else [],
            "isUnknown": bool(row["is_unknown"]),
            "createdAt": row["created_at"],
        })

    return results


async def get_prediction_by_id(prediction_id: str) -> dict | None:
    """Get a single prediction by ID."""
    db = await get_db()

    try:
        cursor = await db.execute(
            """
            SELECT id, image_url, top_prediction, farmer_name, confidence,
                   severity, gradcam_url, disease_info_json, predictions_json,
                   is_unknown, created_at
            FROM predictions
            WHERE id = ?
            """,
            (prediction_id,),
        )
        row = await cursor.fetchone()
    finally:
        await close_db(db)

    if row is None:
        return None

    return {
        "id": row["id"],
        "imageUrl": row["image_url"],
        "topPrediction": row["top_prediction"],
        "farmerName": row["farmer_name"],
        "confidence": row["confidence"],
        "severity": row["severity"],
        "gradcamUrl": row["gradcam_url"],
        "diseaseInfo": json.loads(row["disease_info_json"]) if row["disease_info_json"] else None,
        "predictions": json.loads(row["predictions_json"]) if row["predictions_json"] else [],
        "isUnknown": bool(row["is_unknown"]),
        "createdAt": row["created_at"],
    }


async def delete_prediction(prediction_id: str) -> bool:
    """Delete a prediction by ID. Returns True if deleted."""
    db = await get_db()

    try:
        cursor = await db.execute(
            "DELETE FROM predictions WHERE id = ?",
            (prediction_id,),
        )
        await db.commit()
        deleted = cursor.rowcount > 0
    finally:
        await close_db(db)

    return deleted

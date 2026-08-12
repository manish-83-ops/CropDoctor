"""CropDoctor AI — Prediction API Endpoint.

POST /api/predict — Full prediction pipeline:
1. Upload validation (type, size)
2. Image quality gate (blur, brightness, leaf presence)
3. Model inference (with temperature scaling)
4. OOD detection
5. Grad-CAM generation
6. Disease info lookup
7. Response assembly
"""

import uuid
from pathlib import Path

from fastapi import APIRouter, UploadFile, File
from fastapi.responses import JSONResponse

from app.core.security import validate_upload, validate_upload_size, sanitize_filename
from app.services.image_quality import check_image_quality
from app.services.inference import predict
from app.services.ood_detector import detect_ood
from app.services.gradcam import generate_gradcam
from app.services.disease_info import get_disease_info
from app.models.prediction import (
    PredictionResponse,
    QualityResult,
    ClassPrediction,
    DiseaseInfo,
)

router = APIRouter(tags=["prediction"])

UPLOADS_DIR = Path("./data/uploads")
GRADCAM_DIR = Path("./data/uploads/gradcam")


@router.post("/api/predict")
async def predict_disease(file: UploadFile = File(...)):
    """Full prediction pipeline from image upload to disease diagnosis."""

    # Step 1: Validate upload
    validate_upload(file)
    image_bytes = await validate_upload_size(file)

    # Step 2: Save uploaded file
    safe_name = sanitize_filename(file.filename)
    upload_path = UPLOADS_DIR / safe_name
    upload_path.parent.mkdir(parents=True, exist_ok=True)
    with open(upload_path, "wb") as f:
        f.write(image_bytes)

    image_url = f"/static/uploads/{safe_name}"

    # Step 3: Image quality gate
    quality = check_image_quality(image_bytes)

    if not quality["passed"]:
        # Quality failed — return early with quality feedback + debug scores
        return JSONResponse(
            status_code=200,
            content=PredictionResponse(
                success=False,
                quality=QualityResult(
                    passed=False,
                    reason=quality["reason"],
                    remediationIcon=quality["remediation_icon"],
                    remediationText=quality["remediation_text"],
                    remediationTextHi=quality["remediation_text_hi"],
                    debugScores=quality.get("scores"),
                ),
                isUnknown=False,
                predictions=[],
                diseaseInfo=None,
                gradcamUrl=None,
                imageUrl=image_url,
            ).model_dump(by_alias=True),
        )

    # Step 4: Run inference
    result = predict(image_bytes)

    # Step 5: OOD detection
    ood = detect_ood(result["raw_probs"])

    # Step 6: Generate Grad-CAM
    gradcam_filename = f"gradcam_{uuid.uuid4().hex[:8]}.png"
    gradcam_path = GRADCAM_DIR / gradcam_filename
    gradcam_saved = generate_gradcam(image_bytes, gradcam_path)
    gradcam_url = f"/static/uploads/gradcam/{gradcam_filename}" if gradcam_saved else None

    # Step 7: Look up disease info for top prediction
    top_class = result["predictions"][0]["className"]
    disease_info_raw = get_disease_info(top_class)

    # Build disease info
    disease_info = None
    if disease_info_raw and not ood["is_unknown"]:
        disease_info = DiseaseInfo(
            technicalName=disease_info_raw["technicalName"],
            farmerName=disease_info_raw["farmerName"],
            farmerNameHi=disease_info_raw["farmerNameHi"],
            description=disease_info_raw["description"],
            descriptionHi=disease_info_raw["descriptionHi"],
            remedy=disease_info_raw["remedy"],
            remedyHi=disease_info_raw["remedyHi"],
            remedyCost=disease_info_raw.get("remedyCost", ""),
            severity=disease_info_raw["severity"],
            cropName=disease_info_raw["cropName"],
            cause=disease_info_raw.get("cause"),
            causeHi=disease_info_raw.get("causeHi"),
            stage=disease_info_raw.get("stage"),
            stageHi=disease_info_raw.get("stageHi"),
            preventable=disease_info_raw.get("preventable", True),
            preventionTip=disease_info_raw.get("preventionTip"),
            preventionTipHi=disease_info_raw.get("preventionTipHi"),
        )


    # Build class predictions with farmer-friendly names
    predictions = []
    for pred in result["predictions"]:
        class_name = pred["className"]
        info = get_disease_info(class_name)
        predictions.append(
            ClassPrediction(
                className=class_name,
                confidence=pred["confidence"],
                farmerName=info["farmerName"] if info else class_name.replace("___", " - ").replace("_", " "),
                farmerNameHi=info["farmerNameHi"] if info else class_name,
            )
        )

    # Step 8: Assemble response
    response = PredictionResponse(
        success=True,
        quality=QualityResult(passed=True, debugScores=quality.get("scores")),
        isUnknown=ood["is_unknown"],
        predictions=predictions,
        diseaseInfo=disease_info,
        gradcamUrl=gradcam_url,
        imageUrl=image_url,
        inferenceTimeMs=result["inference_time_ms"],
        modelVersion=result["model_version"],
        temperature=result["temperature"],
    )

    return JSONResponse(
        status_code=200,
        content=response.model_dump(by_alias=True),
    )

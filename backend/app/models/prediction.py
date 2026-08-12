"""CropDoctor AI — Prediction Pydantic Schemas.

Request/response models for the prediction pipeline.
These mirror the frontend TypeScript interfaces exactly.
"""

from pydantic import BaseModel, Field


class ClassPrediction(BaseModel):
    """A single class prediction with confidence."""

    class_name: str = Field(..., alias="className")
    confidence: float
    farmer_name: str = Field(..., alias="farmerName")
    farmer_name_hi: str = Field(..., alias="farmerNameHi")

    model_config = {"populate_by_name": True}


class QualityResult(BaseModel):
    """Image quality check result."""

    passed: bool
    reason: str | None = None
    remediation_icon: str | None = Field(None, alias="remediationIcon")
    remediation_text: str | None = Field(None, alias="remediationText")
    remediation_text_hi: str | None = Field(None, alias="remediationTextHi")
    debug_scores: dict | None = Field(None, alias="debugScores")

    model_config = {"populate_by_name": True}


class DiseaseInfo(BaseModel):
    """Disease information from the knowledge base."""

    technical_name: str = Field(..., alias="technicalName")
    farmer_name: str = Field(..., alias="farmerName")
    farmer_name_hi: str = Field(..., alias="farmerNameHi")
    description: str
    description_hi: str = Field(..., alias="descriptionHi")
    remedy: str
    remedy_hi: str = Field(..., alias="remedyHi")
    remedy_cost: str | None = Field(None, alias="remedyCost")
    severity: str
    crop_name: str = Field(..., alias="cropName")
    cause: str | None = None
    cause_hi: str | None = Field(None, alias="causeHi")
    stage: str | None = None
    stage_hi: str | None = Field(None, alias="stageHi")
    preventable: bool | None = True
    prevention_tip: str | None = Field(None, alias="preventionTip")
    prevention_tip_hi: str | None = Field(None, alias="preventionTipHi")

    model_config = {"populate_by_name": True}



class PredictionResponse(BaseModel):
    """Full prediction response sent to the frontend."""

    success: bool
    quality: QualityResult
    is_unknown: bool = Field(False, alias="isUnknown")
    predictions: list[ClassPrediction]
    disease_info: DiseaseInfo | None = Field(None, alias="diseaseInfo")
    gradcam_url: str | None = Field(None, alias="gradcamUrl")
    image_url: str = Field(..., alias="imageUrl")
    inference_time_ms: float | None = Field(None, alias="inferenceTimeMs")
    model_version: str | None = Field(None, alias="modelVersion")
    temperature: float | None = None

    model_config = {"populate_by_name": True}

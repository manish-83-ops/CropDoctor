/**
 * CropDoctor AI — TypeScript interfaces for prediction data.
 *
 * Shared between frontend components. Mirrors backend Pydantic schemas.
 */

import { StatusColor } from "@/lib/constants";

/** A single class prediction with confidence */
export interface ClassPrediction {
  className: string;
  confidence: number;
  farmerName: string;
  farmerNameHi: string;
}

/** Image quality check result */
export interface QualityResult {
  passed: boolean;
  reason?: string;
  remediationIcon?: string;
  remediationText?: string;
  remediationTextHi?: string;
  debugScores?: Record<string, unknown>;
}

/** Disease information from the knowledge base */
export interface DiseaseInfo {
  technicalName: string;
  farmerName: string;
  farmerNameHi: string;
  description: string;
  descriptionHi: string;
  remedy: string;
  remedyHi: string;
  remedyCost?: string;
  severity: StatusColor;
  cropName: string;
  cause?: string;
  causeHi?: string;
  stage?: string;
  stageHi?: string;
  preventable?: boolean;
  preventionTip?: string;
  preventionTipHi?: string;
}


/** Full prediction response from the backend */
export interface PredictionResponse {
  /** Whether the prediction was successful */
  success: boolean;

  /** Image quality check result */
  quality: QualityResult;

  /** Whether this is an out-of-distribution / unknown detection */
  isUnknown: boolean;

  /** Top-3 predictions */
  predictions: ClassPrediction[];

  /** Disease info for the top prediction */
  diseaseInfo?: DiseaseInfo;

  /** Grad-CAM overlay image URL */
  gradcamUrl?: string;

  /** Uploaded image URL */
  imageUrl: string;

  /** Inference time in milliseconds */
  inferenceTimeMs?: number;

  /** Model version */
  modelVersion?: string;

  /** Temperature scaling parameter used */
  temperature?: number;
}

/** History item — stored prediction record */
export interface HistoryItem {
  id: string;
  imageUrl: string;
  topPrediction: string;
  farmerName: string;
  confidence: number;
  severity: StatusColor;
  gradcamUrl?: string;
  diseaseInfo?: DiseaseInfo;
  predictions: ClassPrediction[];
  isUnknown: boolean;
  createdAt: string;
}

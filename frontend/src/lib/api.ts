/**
 * CropDoctor AI — Typed API Client
 *
 * Centralized fetch wrapper for all backend calls.
 * Handles errors, timeouts, and response typing.
 */

import { API_BASE_URL } from "./constants";
import type { PredictionResponse, HistoryItem } from "@/types/prediction";

class ApiError extends Error {
  constructor(
    public status: number,
    public data: unknown,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(response.status, data, data.message || "API Error");
  }

  return data as T;
}

/**
 * Upload an image for disease prediction.
 */
export async function predictDisease(
  file: File | Blob
): Promise<PredictionResponse> {
  const formData = new FormData();
  const filename = file instanceof File ? file.name : "crop_leaf.jpg";
  formData.append("file", file, filename);

  const url = `${API_BASE_URL}/api/predict`;
  const response = await fetch(url, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();
  return data as PredictionResponse;
}

/**
 * Save a prediction to history.
 */
export async function saveToHistory(prediction: {
  imageUrl: string;
  topPrediction: string;
  farmerName: string;
  confidence: number;
  severity: string;
  gradcamUrl?: string;
  diseaseInfo?: Record<string, unknown>;
  predictions: Array<Record<string, unknown>>;
  isUnknown: boolean;
}): Promise<{ id: string; saved: boolean }> {
  return request("/api/history", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(prediction),
  });
}

/**
 * Get prediction history.
 */
export async function getHistory(
  limit = 50
): Promise<{ predictions: HistoryItem[]; count: number }> {
  return request(`/api/history?limit=${limit}`);
}

/**
 * Get a single prediction from history.
 */
export async function getHistoryItem(id: string): Promise<HistoryItem> {
  return request(`/api/history/${id}`);
}

/**
 * Get location-based weather advisory.
 */
export async function getWeather(lat: number, lon: number): Promise<{
  available: boolean;
  temperature?: number;
  humidity?: number;
  description?: string;
  advisories?: Array<{ icon: string; text: string; textHi: string; type: string }>;
}> {
  return request(`/api/weather?lat=${lat}&lon=${lon}`);
}

/**
 * Translate text via Sarvam AI API backend proxy.
 */
export async function translateText(
  text: string,
  targetLanguage: "en" | "hi" = "hi"
): Promise<{ translatedText: string; sourceLanguage: string; targetLanguage: string; cached: boolean }> {
  return request("/api/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, targetLanguage }),
  });
}

/**
 * Check backend health.
 */
export async function checkHealth(): Promise<{
  status: string;
  service: string;
  version: string;
}> {
  return request("/api/health");
}

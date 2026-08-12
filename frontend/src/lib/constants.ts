/**
 * CropDoctor AI — Shared Constants
 *
 * Single source of truth for colors, API URLs, and configuration.
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.hostname}:8000`
    : "http://localhost:8000");


// Status color mapping — THE visual language of the app
export const STATUS_COLORS = {
  green: {
    bg: "bg-status-healthy-light",
    text: "text-status-healthy-dark",
    border: "border-status-healthy",
    dot: "bg-status-healthy",
    badge: "badge-healthy",
    label: "Healthy",
    labelHi: "स्वस्थ पौधा",
  },
  yellow: {
    bg: "bg-status-caution-light",
    text: "text-status-caution-dark",
    border: "border-status-caution",
    dot: "bg-status-caution",
    badge: "badge-caution",
    label: "Needs Attention",
    labelHi: "ध्यान दें (बीमारी के लक्षण)",
  },
  red: {
    bg: "bg-status-danger-light",
    text: "text-status-danger-dark",
    border: "border-status-danger",
    dot: "bg-status-danger",
    badge: "badge-danger",
    label: "Act Now",
    labelHi: "खतरा (तुरंत इलाज करें)",
  },
  unknown: {
    bg: "bg-status-unknown-light",
    text: "text-status-unknown-dark",
    border: "border-status-unknown",
    dot: "bg-status-unknown",
    badge: "badge-unknown",
    label: "Unknown",
    labelHi: "पहचान नहीं हुई",
  },
} as const;


export type StatusColor = keyof typeof STATUS_COLORS;

// Supported languages
export const LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧", nativeLabel: "English" },
  { code: "hi", label: "Hindi", flag: "🇮🇳", nativeLabel: "हिंदी" },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];

// Upload limits (must match backend)
export const MAX_UPLOAD_SIZE_MB = 10;
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

// UI constants
export const MIN_ANALYZING_DURATION_MS = 2000; // 2 second minimum loading
export const CONFIDENCE_HIGH_THRESHOLD = 0.7;
export const CONFIDENCE_MEDIUM_THRESHOLD = 0.4;

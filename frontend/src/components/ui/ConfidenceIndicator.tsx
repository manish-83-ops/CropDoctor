"use client";

import {
  CONFIDENCE_HIGH_THRESHOLD,
  CONFIDENCE_MEDIUM_THRESHOLD,
} from "@/lib/constants";

interface ConfidenceIndicatorProps {
  /** Confidence value 0-1 */
  confidence: number;
  /** Whether to show exact percentage (Expert Mode) */
  showExact?: boolean;
  /** Language code for labels */
  lang?: "en" | "hi";
  className?: string;
}

const labels = {
  en: {
    high: "Confident match",
    medium: "Possible match",
    low: "Not fully sure",
  },
  hi: {
    high: "पक्की जांच (सही मिला)",
    medium: "मिलता-जुलता लक्षण",
    low: "थोड़ा संदेह है",
  },
};


/**
 * ConfidenceIndicator — Shows confidence in TWO modes:
 *
 * Farmer Mode: 3-dot scale (●●○) with plain-language label
 * Expert Mode: Exact percentage with progress bar
 *
 * Never shows raw numbers to farmers.
 */
export default function ConfidenceIndicator({
  confidence,
  showExact = false,
  lang = "en",
  className = "",
}: ConfidenceIndicatorProps) {
  const isHigh = confidence >= CONFIDENCE_HIGH_THRESHOLD;
  const isMedium = confidence >= CONFIDENCE_MEDIUM_THRESHOLD;

  const dots = isHigh ? 3 : isMedium ? 2 : 1;
  const label = isHigh
    ? labels[lang].high
    : isMedium
    ? labels[lang].medium
    : labels[lang].low;

  const dotColor = isHigh
    ? "bg-status-healthy"
    : isMedium
    ? "bg-status-caution"
    : "bg-status-danger";

  if (showExact) {
    // Expert Mode: percentage + bar
    return (
      <div className={`space-y-1 ${className}`}>
        <div className="flex justify-between items-center text-farmer-xs">
          <span className="text-ink-secondary">{label}</span>
          <span className="font-mono font-semibold text-ink">
            {(confidence * 100).toFixed(1)}%
          </span>
        </div>
        <div className="h-2 bg-surface-tertiary rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${dotColor}`}
            style={{ width: `${confidence * 100}%` }}
          />
        </div>
      </div>
    );
  }

  // Farmer Mode: 3-dot scale
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex gap-1">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-colors duration-300 ${
              i <= dots ? dotColor : "bg-surface-tertiary"
            }`}
          />
        ))}
      </div>
      <span className="text-farmer-xs text-ink-secondary">{label}</span>
    </div>
  );
}

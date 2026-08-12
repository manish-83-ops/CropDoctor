"use client";

import { Sprout, FlaskConical } from "lucide-react";

interface ModeToggleProps {
  /** Current mode */
  isExpertMode: boolean;
  /** Toggle handler */
  onToggle: () => void;
  /** Language */
  lang?: "en" | "hi";
  className?: string;
}

/**
 * ModeToggle — Farmer ↔ Expert mode toggle.
 *
 * Always visible in top-right. Switching re-renders in place, no navigation.
 * Farmer Mode: green with sprout icon.
 * Expert Mode: blue with flask icon.
 */
export default function ModeToggle({
  isExpertMode,
  onToggle,
  lang = "en",
  className = "",
}: ModeToggleProps) {
  const farmerLabel = lang === "hi" ? "किसान" : "Farmer";
  const expertLabel = lang === "hi" ? "विशेषज्ञ" : "Expert";

  return (
    <button
      onClick={onToggle}
      className={`
        inline-flex items-center gap-1.5
        px-3 py-1.5 rounded-badge
        text-farmer-xs font-semibold
        transition-all duration-300 ease-out
        no-select min-h-[36px]
        ${
          isExpertMode
            ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
            : "bg-brand-100 text-brand-800 hover:bg-brand-200"
        }
        ${className}
      `}
      aria-label={`Switch to ${isExpertMode ? "Farmer" : "Expert"} mode`}
    >
      {isExpertMode ? (
        <>
          <FlaskConical className="w-4 h-4" />
          <span>{expertLabel}</span>
        </>
      ) : (
        <>
          <Sprout className="w-4 h-4" />
          <span>{farmerLabel}</span>
        </>
      )}
    </button>
  );
}

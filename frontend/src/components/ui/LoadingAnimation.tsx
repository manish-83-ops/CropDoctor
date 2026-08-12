"use client";

import { Leaf } from "lucide-react";

interface LoadingAnimationProps {
  /** Message to show while loading */
  message?: string;
  /** Hindi message */
  messageHi?: string;
  /** Which language to show */
  lang?: "en" | "hi";
}

/**
 * LoadingAnimation — The "Analyzing" screen animation.
 *
 * Shows a leaf being examined with a reassuring message.
 * Minimum 2-second display ensures it doesn't feel broken on fast inference.
 * Pure CSS animation — no Lottie dependency.
 */
export default function LoadingAnimation({
  message = "Checking your leaf...",
  messageHi = "आपकी पत्ती की जांच हो रही है...",
  lang = "en",
}: LoadingAnimationProps) {
  const displayMessage = lang === "hi" ? messageHi : message;

  return (
    <div className="flex flex-col items-center justify-center gap-8 py-16 animate-fade-in">
      {/* Leaf animation */}
      <div className="relative">
        {/* Outer ring — pulsing */}
        <div className="absolute inset-0 -m-4 rounded-full bg-brand-100 animate-pulse-slow" />
        <div className="absolute inset-0 -m-8 rounded-full bg-brand-50 animate-pulse-slow [animation-delay:0.5s]" />

        {/* Leaf icon — bouncing */}
        <div className="relative z-10 w-20 h-20 rounded-full bg-brand-500 flex items-center justify-center animate-bounce-gentle shadow-button">
          <Leaf className="w-10 h-10 text-white" strokeWidth={2} />
        </div>

        {/* Scanning line effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-0.5 bg-gradient-to-r from-transparent via-brand-400 to-transparent animate-scan opacity-60" />
      </div>

      {/* Message */}
      <div className="text-center space-y-2">
        <p className="text-farmer-lg font-medium text-ink">
          {displayMessage}
        </p>

        {/* Animated dots */}
        <div className="flex justify-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-brand-400 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

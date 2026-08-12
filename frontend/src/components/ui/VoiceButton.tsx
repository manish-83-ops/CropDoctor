"use client";

import { Volume2, Loader2 } from "lucide-react";
import { useState, useRef } from "react";
import { API_BASE_URL } from "@/lib/constants";

interface VoiceButtonProps {
  /** Text to speak */
  text: string;
  /** Language code for speech synthesis */
  lang?: "en" | "hi";
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Label text */
  label?: string;
  className?: string;
}

/**
  * VoiceButton — "Speak This" button.
  *
  * Uses Sarvam AI Bulbul v2 TTS (anushka voice) for authentic Indian voice synthesis,
  * with fallback to browser SpeechSynthesis tuned for Indian voices (en-IN / hi-IN).
  */
export default function VoiceButton({
  text,
  lang = "en",
  size = "md",
  label,
  className = "",
}: VoiceButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const defaultLabel = lang === "hi" ? "आवाज सुनें" : "Listen in Indian Voice";
  const displayLabel = label || defaultLabel;

  const handleSpeak = async () => {
    // If currently playing, stop audio
    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlaying(false);
      return;
    }

    setIsLoading(true);

    // Try Sarvam AI TTS first
    try {
      const response = await fetch(`${API_BASE_URL}/api/tts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          language: lang,
          speaker: "anushka",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.audio_base64) {
          const audio = new Audio(data.audio_base64);
          audioRef.current = audio;
          
          audio.onended = () => setIsPlaying(false);
          audio.onerror = () => fallbackBrowserSpeech();

          await audio.play();
          setIsLoading(false);
          setIsPlaying(true);
          return;
        }
      }
    } catch {
      // Fallback if Sarvam API network fails
    }

    setIsLoading(false);
    fallbackBrowserSpeech();
  };

  const fallbackBrowserSpeech = () => {
    if (!("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === "hi" ? "hi-IN" : "en-IN";
    utterance.rate = 0.88; // Natural, clear speed
    utterance.pitch = 1.0;

    // Prioritize Indian accent voices in browser
    const voices = window.speechSynthesis.getVoices();
    const indianVoice = voices.find(
      (v) =>
        v.lang.includes("IN") ||
        v.name.includes("India") ||
        v.name.includes("Hindi") ||
        v.name.includes("Swara") ||
        v.name.includes("Heera") ||
        v.name.includes("Ravi") ||
        v.name.includes("Google hi-IN") ||
        v.name.includes("Google en-IN")
    );

    if (indianVoice) {
      utterance.voice = indianVoice;
    }

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-farmer-xs gap-1.5",
    md: "px-4 py-2 text-farmer-sm gap-2",
    lg: "px-5 py-3 text-farmer-base gap-2",
  };

  return (
    <button
      onClick={handleSpeak}
      disabled={isLoading}
      className={`
        inline-flex items-center justify-center
        ${sizeClasses[size]}
        min-h-[48px]
        ${isPlaying ? "bg-emerald-100 text-emerald-800 border-emerald-300" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"}
        font-semibold rounded-button border border-emerald-200
        transition-all duration-200 ease-out
        active:scale-[0.98]
        no-select
        ${className}
      `}
      aria-label={displayLabel}
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
      ) : (
        <Volume2 className={`w-5 h-5 ${isPlaying ? "animate-pulse" : ""}`} />
      )}
      <span>{isLoading ? (lang === "hi" ? "आवाज लोड हो रही है..." : "Loading voice...") : isPlaying ? (lang === "hi" ? "रुकें" : "Stop") : displayLabel}</span>
    </button>
  );
}


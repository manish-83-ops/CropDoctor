"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { LANGUAGES } from "@/lib/constants";
import { Leaf } from "lucide-react";

/**
 * Root page — Language selection (first launch only).
 *
 * If already onboarded, redirects to /home immediately.
 * Full-screen, 2 large language buttons. One tap, done.
 * No sign-up wall. No forms. Just pick your language.
 */
export default function OnboardingPage() {
  const router = useRouter();
  const { isOnboarded, setLang, setOnboarded } = useLanguage();

  useEffect(() => {
    if (isOnboarded) {
      router.replace("/home");
    }
  }, [isOnboarded, router]);

  // Already onboarded → return null while redirecting
  if (isOnboarded) {
    return null;
  }

  const handleLanguageSelect = (code: "en" | "hi") => {
    setLang(code);
    setOnboarded();
    router.push("/home");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-gradient-to-b from-brand-50 via-white to-brand-50">
      {/* Logo + Branding */}
      <div className="flex flex-col items-center gap-4 mb-12 animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-brand-500 flex items-center justify-center shadow-button">
          <Leaf className="w-10 h-10 text-white" strokeWidth={2} />
        </div>
        <div className="text-center">
          <h1 className="text-farmer-3xl font-bold text-ink tracking-tight">
            CropDoctor
          </h1>
          <p className="text-farmer-lg text-brand-600 font-medium mt-1">
            AI
          </p>
        </div>
      </div>

      {/* Language Selection */}
      <div className="w-full max-w-sm space-y-3 animate-slide-up">
        <p className="text-center text-farmer-base text-ink-secondary mb-6">
          Choose your language / अपनी भाषा चुनें
        </p>

        {LANGUAGES.map((language) => (
          <button
            key={language.code}
            onClick={() => handleLanguageSelect(language.code)}
            className="w-full flex items-center gap-4 px-6 py-5 
                       bg-white border-2 border-surface-border rounded-card
                       text-left transition-all duration-200 ease-out
                       hover:border-brand-400 hover:shadow-card-hover hover:-translate-y-0.5
                       active:scale-[0.99]
                       min-h-[64px]"
          >
            <span className="text-3xl" role="img" aria-label={language.label}>
              {language.flag}
            </span>
            <div>
              <span className="text-farmer-lg font-semibold text-ink block">
                {language.nativeLabel}
              </span>
              <span className="text-farmer-xs text-ink-secondary">
                {language.label}
              </span>
            </div>
          </button>
        ))}

        {/* Roadmap-aware placeholder */}
        <button
          disabled
          className="w-full flex items-center gap-4 px-6 py-5 
                     bg-surface-secondary border-2 border-dashed border-surface-border rounded-card
                     text-left opacity-50 cursor-not-allowed
                     min-h-[64px]"
        >
          <span className="text-3xl">🌐</span>
          <div>
            <span className="text-farmer-lg font-semibold text-ink-muted block">
              More coming soon
            </span>
            <span className="text-farmer-xs text-ink-muted">
              और भाषाएं जल्द आ रही हैं
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}

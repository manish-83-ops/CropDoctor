"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { LanguageCode } from "@/lib/constants";

interface LanguageContextType {
  lang: LanguageCode;
  setLang: (lang: LanguageCode) => void;
  isOnboarded: boolean;
  setOnboarded: () => void;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

const STORAGE_KEY_LANG = "cropdoctor_lang";
const STORAGE_KEY_ONBOARDED = "cropdoctor_onboarded";

/**
 * LanguageProvider — Manages language selection and onboarding state.
 *
 * Language persists in localStorage. Onboarding screen shown only on first visit.
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LanguageCode>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem(STORAGE_KEY_LANG) as LanguageCode) || "en";
    }
    return "en";
  });
  const [isOnboarded, setIsOnboarded] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(STORAGE_KEY_ONBOARDED) === "true";
    }
    return false;
  });
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsHydrated(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const setLang = (newLang: LanguageCode) => {
    setLangState(newLang);
    localStorage.setItem(STORAGE_KEY_LANG, newLang);
  };

  const setOnboarded = () => {
    setIsOnboarded(true);
    localStorage.setItem(STORAGE_KEY_ONBOARDED, "true");
  };

  // Prevent flash of wrong language on hydration
  if (!isHydrated) {
    return null;
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, isOnboarded, setOnboarded }}>
      {children}
    </LanguageContext.Provider>
  );
}

/**
 * Hook to access language context.
 * Must be used within LanguageProvider.
 */
export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

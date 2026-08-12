"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

interface ModeContextType {
  isExpertMode: boolean;
  toggleMode: () => void;
  setExpertMode: (value: boolean) => void;
}

const ModeContext = createContext<ModeContextType | null>(null);

/**
 * ModeProvider — Manages Farmer ↔ Expert mode toggle.
 *
 * Default: Farmer Mode. Switching never loses context — same prediction,
 * same screen, just re-rendered with different detail level.
 */
export function ModeProvider({ children }: { children: ReactNode }) {
  const [isExpertMode, setIsExpertMode] = useState(false);

  const toggleMode = () => setIsExpertMode((prev) => !prev);
  const setExpertMode = (value: boolean) => setIsExpertMode(value);

  return (
    <ModeContext.Provider value={{ isExpertMode, toggleMode, setExpertMode }}>
      {children}
    </ModeContext.Provider>
  );
}

/**
 * Hook to access mode context.
 * Must be used within ModeProvider.
 */
export function useMode(): ModeContextType {
  const context = useContext(ModeContext);
  if (!context) {
    throw new Error("useMode must be used within a ModeProvider");
  }
  return context;
}

"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, History, Camera, MessageSquare, Settings } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface BottomNavProps {
  onOpenSettings?: () => void;
}

export default function BottomNav({ onOpenSettings }: BottomNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { lang } = useLanguage();

  // Don't show bottom nav on onboarding or live capture pages to maximize viewfinder space
  if (pathname === "/" || pathname === "/capture") {
    return null;
  }

  const t = {
    en: {
      home: "Home",
      history: "History",
      scan: "Scan",
      chat: "Chat",
      settings: "Settings",
    },
    hi: {
      home: "होम",
      history: "इतिहास",
      scan: "स्कैन",
      chat: "चैट",
      settings: "सेटिंग्स",
    },
  };

  const text = t[lang];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-surface-border safe-bottom shadow-lg">
      <div className="max-w-md mx-auto flex items-center justify-around h-16 px-2 relative">
        {/* Home */}
        <button
          onClick={() => router.push("/home")}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-xs transition-colors ${
            pathname === "/home"
              ? "text-emerald-600 font-bold"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span>{text.home}</span>
        </button>

        {/* History */}
        <button
          onClick={() => router.push("/history")}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-xs transition-colors ${
            pathname === "/history"
              ? "text-emerald-600 font-bold"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <History className="w-5 h-5 mb-0.5" />
          <span>{text.history}</span>
        </button>

        {/* Center Elevated Scan Button (PhonePe Style) */}
        <div className="relative -top-5 flex-1 flex justify-center">
          <button
            onClick={() => router.push("/capture")}
            className="w-14 h-14 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 text-white flex flex-col items-center justify-center shadow-xl shadow-emerald-500/30 ring-4 ring-white hover:scale-105 active:scale-95 transition-all"
            aria-label={text.scan}
          >
            <Camera className="w-6 h-6" />
          </button>
        </div>

        {/* Chat */}
        <button
          onClick={() => router.push("/chat")}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-xs transition-colors ${
            pathname === "/chat"
              ? "text-emerald-600 font-bold"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <MessageSquare className="w-5 h-5 mb-0.5" />
          <span>{text.chat}</span>
        </button>

        {/* Settings */}
        <button
          onClick={() => {
            if (onOpenSettings) {
              onOpenSettings();
            } else {
              router.push("/settings");
            }
          }}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-xs transition-colors ${
            pathname === "/settings"
              ? "text-emerald-600 font-bold"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Settings className="w-5 h-5 mb-0.5" />
          <span>{text.settings}</span>
        </button>
      </div>
    </div>
  );
}

"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useMode } from "@/context/ModeContext";
import { X, Globe, Eye, Volume2, Trash2, Info } from "lucide-react";
import { useState } from "react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { lang, setLang } = useLanguage();
  const { isExpertMode, toggleMode } = useMode();
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [clearedNotice, setClearedNotice] = useState(false);

  if (!isOpen) return null;

  const handleClearHistory = () => {
    sessionStorage.removeItem("cropdoctor_last_result");
    setClearedNotice(true);
    setTimeout(() => setClearedNotice(false), 3000);
  };

  const t = {
    en: {
      title: "Settings & Preferences",
      language: "Language / भाषा",
      mode: "Default Display Mode",
      farmerMode: "Farmer Mode (Simple)",
      expertMode: "Expert Mode (Technical)",
      voice: "Voice Auto-Play",
      voiceDesc: "Automatically read diagnoses out loud",
      clearHistory: "Clear Recent Diagnosis Session",
      clearSuccess: "Session cleared successfully!",
      about: "About CropDoctor AI",
      aboutDesc: "EfficientNetB0 v1.0 • Calibrated Temperature T=1.0 • Supports 14 Leaf Crops (PlantVillage)",
      close: "Close",
    },
    hi: {
      title: "सेटिंग्स और प्राथमिकताएं",
      language: "भाषा / Language",
      mode: "डिफ़ॉल्ट प्रदर्शन मोड",
      farmerMode: "किसान मोड (सरल)",
      expertMode: "विशेषज्ञ मोड (तकनीकी)",
      voice: "आवाज से बोलकर सुनाएं",
      voiceDesc: "निदान को स्वचालित रूप से बोलकर सुनाएं",
      clearHistory: "हाल का निदान सत्र साफ़ करें",
      clearSuccess: "सत्र सफलतापूर्वक साफ़ किया गया!",
      about: "CropDoctor AI के बारे में",
      aboutDesc: "EfficientNetB0 v1.0 • तापमान कैलिब्रेटेड T=1.0 • 14 पत्ती वाली फसलों का समर्थन",
      close: "बंद करें",
    },
  };

  const text = t[lang];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-fade-in">
      <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span>⚙️</span> {text.title}
          </h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6">
          {/* Language Selection */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-600" />
              {text.language}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setLang("en")}
                className={`py-3 px-4 rounded-xl border font-medium text-sm transition-all ${
                  lang === "en"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-800 shadow-sm"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                🇬🇧 English
              </button>
              <button
                onClick={() => setLang("hi")}
                className={`py-3 px-4 rounded-xl border font-medium text-sm transition-all ${
                  lang === "hi"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-800 shadow-sm"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                🇮🇳 हिंदी (Hindi)
              </button>
            </div>
          </div>

          {/* Mode Preference */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-600" />
              {text.mode}
            </label>
            <div className="flex rounded-xl p-1 bg-slate-100 border border-slate-200">
              <button
                onClick={() => isExpertMode && toggleMode()}
                className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                  !isExpertMode
                    ? "bg-white text-emerald-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                👨‍🌾 {text.farmerMode}
              </button>
              <button
                onClick={() => !isExpertMode && toggleMode()}
                className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                  isExpertMode
                    ? "bg-white text-emerald-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                🔬 {text.expertMode}
              </button>
            </div>
          </div>

          {/* Voice Preference */}
          <div className="flex items-center justify-between py-2 border-t border-slate-100">
            <div className="space-y-0.5">
              <div className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-emerald-600" />
                {text.voice}
              </div>
              <p className="text-xs text-slate-500">{text.voiceDesc}</p>
            </div>
            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className={`w-12 h-7 flex items-center rounded-full p-1 transition-colors ${
                voiceEnabled ? "bg-emerald-600" : "bg-slate-300"
              }`}
            >
              <div
                className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${
                  voiceEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Clear Session */}
          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={handleClearHistory}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm font-semibold hover:bg-red-100 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              {text.clearHistory}
            </button>
            {clearedNotice && (
              <p className="text-center text-xs text-emerald-600 mt-2 font-medium">
                {text.clearSuccess}
              </p>
            )}
          </div>

          {/* About / Model Info */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-1.5">
            <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-slate-500" />
              {text.about}
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              {text.aboutDesc}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-colors"
          >
            {text.close}
          </button>
        </div>
      </div>
    </div>
  );
}

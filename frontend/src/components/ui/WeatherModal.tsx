"use client";

import { useLanguage } from "@/context/LanguageContext";
import { X, CloudSun, Droplets, Thermometer, Info } from "lucide-react";
import { useEffect, useState } from "react";
import { getWeather } from "@/lib/api";

interface WeatherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WeatherModal({ isOpen, onClose }: WeatherModalProps) {
  const { lang } = useLanguage();
  const [data, setData] = useState<{
    available: boolean;
    temperature?: number;
    humidity?: number;
    description?: string;
    advisories?: Array<{ icon: string; text: string; textHi: string; type: string }>;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    // Use default coordinates for New Delhi / Central India or geolocation
    async function fetchWeatherData() {
      setLoading(true);
      try {
        const res = await getWeather(28.6139, 77.2090);
        setData(res);
      } catch {
        setData({ available: false });
      } finally {
        setLoading(false);
      }
    }

    fetchWeatherData();
  }, [isOpen]);

  if (!isOpen) return null;

  const t = {
    en: {
      title: "Crop Weather Advisory",
      temp: "Temperature",
      humidity: "Humidity",
      condition: "Condition",
      disclaimer: "Based on agricultural weather rules, not AI prediction",
      close: "Close",
    },
    hi: {
      title: "फसल मौसम सलाह",
      temp: "तापमान",
      humidity: "नमी",
      condition: "स्थिति",
      disclaimer: "कृषि मौसम नियमों पर आधारित, AI पूर्वानुमान नहीं",
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
            <CloudSun className="w-6 h-6 text-amber-500" /> {text.title}
          </h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-slate-500">Loading weather data...</p>
            </div>
          ) : data?.available ? (
            <>
              {/* Weather Stats Card */}
              <div className="bg-gradient-to-r from-sky-500 to-blue-600 rounded-2xl p-5 text-white shadow-lg shadow-sky-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wider opacity-80">{text.condition}</p>
                    <h3 className="text-2xl font-bold capitalize mt-0.5">{data.description || "Clear Sky"}</h3>
                  </div>
                  <CloudSun className="w-12 h-12 text-amber-300 opacity-90" />
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-white/20">
                  <div className="flex items-center gap-2">
                    <Thermometer className="w-5 h-5 opacity-80" />
                    <div>
                      <p className="text-xs opacity-80">{text.temp}</p>
                      <p className="text-lg font-bold">{data.temperature}°C</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Droplets className="w-5 h-5 opacity-80" />
                    <div>
                      <p className="text-xs opacity-80">{text.humidity}</p>
                      <p className="text-lg font-bold">{data.humidity}%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Advisories List */}
              <div className="space-y-3 pt-2">
                <h4 className="text-sm font-bold text-slate-800">
                  {lang === "hi" ? "आज की कृषि सलाह" : "Agricultural Advice for Today"}
                </h4>

                {data.advisories && data.advisories.length > 0 ? (
                  data.advisories.map((adv, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-4 rounded-2xl border border-slate-200/80 bg-slate-50 shadow-sm"
                    >
                      <span className="text-2xl">{adv.icon}</span>
                      <p className="text-sm text-slate-700 font-medium leading-relaxed">
                        {lang === "hi" ? adv.textHi : adv.text}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-sm font-medium flex items-center gap-2">
                    <span>✅</span>
                    {lang === "hi"
                      ? "मौसम की स्थिति आपकी फसलों के लिए अनुकूल है।"
                      : "Weather conditions look favorable for your crops."}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-6 text-center space-y-3 bg-amber-50 rounded-2xl border border-amber-200">
              <span className="text-3xl">🌤️</span>
              <p className="text-sm font-medium text-amber-900">
                {lang === "hi"
                  ? "मौसम सेवा अभी उपलब्ध नहीं है। कृपया बाद में प्रयास करें।"
                  : "Weather advisory service temporarily unavailable. Using default agricultural guidelines."}
              </p>
            </div>
          )}

          {/* Honest Disclaimer */}
          <div className="flex items-center gap-2 p-3 bg-slate-100 rounded-xl text-xs text-slate-500">
            <Info className="w-4 h-4 flex-shrink-0" />
            <span>{text.disclaimer}</span>
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

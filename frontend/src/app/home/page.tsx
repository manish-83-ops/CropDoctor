"use client";

import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useMode } from "@/context/ModeContext";
import { useState, useEffect } from "react";
import {
  Camera,
  History,
  CloudSun,
  MessageSquare,
  Settings,
  Globe,
  Sliders,
  HelpCircle,
  Bell,
  User,
  Leaf,
  Wifi,
  WifiOff,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import BottomNav from "@/components/ui/BottomNav";
import SettingsModal from "@/components/ui/SettingsModal";
import WeatherModal from "@/components/ui/WeatherModal";
import AboutModal from "@/components/ui/AboutModal";
import { getHistory } from "@/lib/api";
import { STATUS_COLORS, type StatusColor, API_BASE_URL } from "@/lib/constants";
import type { HistoryItem } from "@/types/prediction";

export default function HomePage() {
  const router = useRouter();
  const { lang, setLang } = useLanguage();
  const { isExpertMode, toggleMode } = useMode();

  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [recentScans, setRecentScans] = useState<HistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isWeatherOpen, setIsWeatherOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [showNotificationNotice, setShowNotificationNotice] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    async function loadRecentHistory() {
      try {
        const data = await getHistory(10);
        setRecentScans(data.predictions || []);
      } catch {
        // fail gracefully
      } finally {
        setLoadingHistory(false);
      }
    }
    loadRecentHistory();
  }, []);

  const handleRecentScanClick = (item: HistoryItem) => {
    const result = {
      success: true,
      quality: { passed: true },
      isUnknown: item.isUnknown,
      predictions: item.predictions,
      diseaseInfo: item.diseaseInfo,
      gradcamUrl: item.gradcamUrl,
      imageUrl: item.imageUrl,
    };
    sessionStorage.setItem("cropdoctor_last_result", JSON.stringify(result));
    router.push("/result");
  };

  const toggleLanguage = () => {
    setLang(lang === "en" ? "hi" : "en");
  };

  const t = {
    en: {
      greeting: "Namaste, Ramesh 👋",
      subGreeting: "Let's check your crop health today",
      scanCardTitle: "Scan Leaf for Instant Diagnosis",
      scanCardSub: "Supported: 14 leaf crops • Instant AI result",
      scanBtn: "Scan Leaf",
      quickActions: "Quick Services",
      recentScans: "Recent Scans",
      seeAll: "See All",
      emptyScans: "No recent scans yet",
      emptyScansSub: "Tap 'Scan Leaf' to diagnose your crop!",
      tipTitle: "🌾 Agriculture Tip",
      tipDesc: "Hold phone steady under indirect sunlight for 99%+ diagnosis accuracy.",
      online: "Online",
      offline: "Offline Mode",
      notificationMsg: "No new notifications today!",
    },
    hi: {
      greeting: "नमस्ते, रमेश 👋",
      subGreeting: "आज अपनी फसल के स्वास्थ्य की जांच करें",
      scanCardTitle: "त्वरित निदान के लिए पत्ती स्कैन करें",
      scanCardSub: "समर्थित: 14 पत्ती फसलें • त्वरित AI परिणाम",
      scanBtn: "पत्ती स्कैन करें",
      quickActions: "त्वरित सेवाएं",
      recentScans: "हाल के स्कैन",
      seeAll: "सभी देखें",
      emptyScans: "अभी कोई हाल का स्कैन नहीं",
      emptyScansSub: "'पत्ती स्कैन करें' पर टैप करके निदान शुरू करें!",
      tipTitle: "🌾 कृषि सुझाव",
      tipDesc: "उत्कृष्ट सटीकता के लिए छायादार रोशनी में पत्ती की फोटो लें।",
      online: "ऑनलाइन",
      offline: "ऑफलाइन मोड",
      notificationMsg: "आज कोई नया अलर्ट नहीं!",
    },
  };

  const text = t[lang];

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* ─── 1. PhonePe-Style Rich Header Band ─── */}
      <div className="bg-gradient-to-r from-emerald-700 via-green-600 to-teal-600 text-white pt-6 pb-12 px-5 rounded-b-[2.5rem] shadow-xl relative overflow-hidden">
        {/* Decorative background glow elements */}
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-emerald-400/20 blur-2xl pointer-events-none" />

        {/* Top Header Row */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-inner">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight block leading-tight">
                CropDoctor <span className="text-amber-300">AI</span>
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                {isOnline ? (
                  <span className="flex items-center gap-1 text-[11px] font-semibold bg-emerald-500/40 text-emerald-100 px-2 py-0.5 rounded-full border border-emerald-400/30">
                    <Wifi className="w-3 h-3 text-emerald-200" /> {text.online}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[11px] font-semibold bg-amber-500/40 text-amber-100 px-2 py-0.5 rounded-full border border-amber-400/30">
                    <WifiOff className="w-3 h-3 text-amber-200" /> {text.offline}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action icons (Notifications & Profile) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setShowNotificationNotice(true);
                setTimeout(() => setShowNotificationNotice(false), 3000);
              }}
              className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center hover:bg-white/25 active:scale-95 transition-all relative"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-white" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-emerald-700" />
            </button>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-200 text-slate-900 font-bold flex items-center justify-center shadow-md active:scale-95 transition-all"
              aria-label="Profile Settings"
            >
              <User className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Personalized Greeting */}
        <div className="mt-6 relative z-10">
          <h1 className="text-2xl font-black text-white tracking-tight">{text.greeting}</h1>
          <p className="text-sm text-emerald-100/90 font-medium mt-1">{text.subGreeting}</p>
        </div>

        {/* Notification Alert Toast */}
        {showNotificationNotice && (
          <div className="absolute top-16 right-5 z-30 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-2xl animate-fade-in border border-slate-700">
            {text.notificationMsg}
          </div>
        )}
      </div>

      {/* ─── Main Content Container (Shifted Upwards over Header) ─── */}
      <div className="px-5 -mt-8 relative z-20 space-y-6">

        {/* ─── 2. PhonePe-Style Primary Scan Card ─── */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 text-center flex flex-col items-center relative overflow-hidden">
          <div className="w-full flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
              ⚡ Primary Action
            </span>
            <span className="text-xs text-slate-400 font-medium">100% Free</span>
          </div>

          {/* Big Iconic Scan Button */}
          <div className="relative my-2">
            {/* Outer animated glow pulses */}
            <div className="absolute inset-0 rounded-full bg-emerald-400/30 blur-xl animate-pulse" />
            <button
              onClick={() => router.push("/capture")}
              className="group relative w-32 h-32 rounded-full bg-gradient-to-tr from-emerald-600 via-green-500 to-emerald-400 text-white flex flex-col items-center justify-center shadow-2xl shadow-emerald-500/40 hover:scale-105 active:scale-95 transition-all duration-300 ring-8 ring-emerald-50"
              aria-label={text.scanBtn}
            >
              <Camera className="w-10 h-10 stroke-[2] mb-1 group-hover:rotate-12 transition-transform" />
              <span className="text-xs font-extrabold tracking-wide uppercase">{text.scanBtn}</span>
            </button>
          </div>

          <h2 className="text-lg font-black text-slate-800 mt-3">{text.scanCardTitle}</h2>
          <p className="text-xs text-slate-500 font-medium mt-1">{text.scanCardSub}</p>
        </div>

        {/* ─── 3. PhonePe-Style 8-Icon Quick Services Grid ─── */}
        <div>
          <h3 className="text-sm font-extrabold text-slate-800 mb-3 px-1 flex items-center justify-between">
            <span>{text.quickActions}</span>
            <Sparkles className="w-4 h-4 text-emerald-600" />
          </h3>

          <div className="grid grid-cols-4 gap-3">
            {/* 1. Scan Leaf */}
            <button
              onClick={() => router.push("/capture")}
              className="flex flex-col items-center p-3 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-200 active:scale-95 transition-all group"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1.5 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Camera className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-700 text-center leading-tight">Scan Leaf</span>
            </button>

            {/* 2. History */}
            <button
              onClick={() => router.push("/history")}
              className="flex flex-col items-center p-3 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-200 active:scale-95 transition-all group"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-1.5 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <History className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-700 text-center leading-tight">History</span>
            </button>

            {/* 3. Weather */}
            <button
              onClick={() => setIsWeatherOpen(true)}
              className="flex flex-col items-center p-3 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-200 active:scale-95 transition-all group"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-1.5 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <CloudSun className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-700 text-center leading-tight">Weather</span>
            </button>

            {/* 4. Ask AI */}
            <button
              onClick={() => router.push("/chat")}
              className="flex flex-col items-center p-3 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-200 active:scale-95 transition-all group"
            >
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-1.5 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <MessageSquare className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-700 text-center leading-tight">Ask AI</span>
            </button>

            {/* 5. Settings */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex flex-col items-center p-3 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-200 active:scale-95 transition-all group"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center mb-1.5 group-hover:bg-slate-700 group-hover:text-white transition-colors">
                <Settings className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-700 text-center leading-tight">Settings</span>
            </button>

            {/* 6. Language */}
            <button
              onClick={toggleLanguage}
              className="flex flex-col items-center p-3 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-200 active:scale-95 transition-all group relative"
            >
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-1.5 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                <Globe className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-700 text-center leading-tight">
                {lang === "en" ? "Hindi" : "English"}
              </span>
              <span className="absolute top-2 right-2 text-[9px] font-black uppercase bg-teal-100 text-teal-800 px-1.5 rounded-full">
                {lang.toUpperCase()}
              </span>
            </button>

            {/* 7. Expert Mode */}
            <button
              onClick={toggleMode}
              className="flex flex-col items-center p-3 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-200 active:scale-95 transition-all group relative"
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-1.5 transition-colors ${
                isExpertMode ? "bg-indigo-600 text-white" : "bg-indigo-50 text-indigo-600"
              }`}>
                <Sliders className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-700 text-center leading-tight">Expert Mode</span>
              <span className={`absolute top-2 right-2 text-[9px] font-black uppercase px-1.5 rounded-full ${
                isExpertMode ? "bg-indigo-100 text-indigo-800" : "bg-slate-100 text-slate-500"
              }`}>
                {isExpertMode ? "ON" : "OFF"}
              </span>
            </button>

            {/* 8. Help / About */}
            <button
              onClick={() => setIsAboutOpen(true)}
              className="flex flex-col items-center p-3 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-200 active:scale-95 transition-all group"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-1.5 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                <HelpCircle className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-700 text-center leading-tight">About</span>
            </button>
          </div>
        </div>

        {/* ─── 4. PhonePe-Style "Recent Scans" Horizontal Card Carousel ─── */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-sm font-extrabold text-slate-800">{text.recentScans}</h3>
            <button
              onClick={() => router.push("/history")}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5"
            >
              {text.seeAll} <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {loadingHistory ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : recentScans.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
              {recentScans.map((item) => {
                const severity = (item.severity || "unknown") as StatusColor;
                const colors = STATUS_COLORS[severity] || STATUS_COLORS.unknown;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleRecentScanClick(item)}
                    className="flex-shrink-0 w-44 bg-white rounded-2xl p-3 border border-slate-100 shadow-sm hover:shadow-md text-left transition-all active:scale-95"
                  >
                    <div className="w-full h-24 rounded-xl bg-slate-100 overflow-hidden mb-2 relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`${API_BASE_URL}${item.imageUrl}`}
                        alt={item.farmerName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                      <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${colors.dot} ring-2 ring-white`} />
                    </div>
                    <h4 className="text-xs font-bold text-slate-800 truncate">{item.farmerName}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {new Date(item.createdAt).toLocaleDateString(lang === "hi" ? "hi-IN" : "en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm text-center flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                <History className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-700">{text.emptyScans}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{text.emptyScansSub}</p>
              </div>
            </div>
          )}
        </div>

        {/* ─── 5. PhonePe-Style Agriculture Tip Banner Card ─── */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-4 text-white shadow-lg shadow-amber-500/20 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0 text-xl">
            💡
          </div>
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider">{text.tipTitle}</h4>
            <p className="text-xs font-medium text-amber-50 leading-relaxed mt-0.5">
              {text.tipDesc}
            </p>
          </div>
        </div>
      </div>

      {/* Modals */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <WeatherModal isOpen={isWeatherOpen} onClose={() => setIsWeatherOpen(false)} />
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />

      {/* ─── 6. Fixed Bottom Navigation Bar ─── */}
      <BottomNav onOpenSettings={() => setIsSettingsOpen(true)} />
    </div>
  );
}

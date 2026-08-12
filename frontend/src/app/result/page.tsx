"use client";

import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useMode } from "@/context/ModeContext";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Info,
  Leaf,
  Tag,
  AlertCircle,
  CheckCircle2,
  XCircle,
  CloudSun,
  Clock,
  ShieldCheck,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import ConfidenceIndicator from "@/components/ui/ConfidenceIndicator";
import ModeToggle from "@/components/ui/ModeToggle";
import VoiceButton from "@/components/ui/VoiceButton";
import BottomNav from "@/components/ui/BottomNav";
import type { PredictionResponse } from "@/types/prediction";
import { STATUS_COLORS, type StatusColor, API_BASE_URL } from "@/lib/constants";

/**
 * Result Page — Dual-mode display of prediction results.
 *
 * Clean, professional UI without emoji clutter:
 * - Uses SVG Lucide icons (CheckCircle2, XCircle, Clock, CloudSun, ShieldCheck) instead of emojis.
 * - Clean bullet points and color-coded status badges.
 */
export default function ResultPage() {
  const router = useRouter();
  const { lang } = useLanguage();
  const { isExpertMode, toggleMode } = useMode();

  const [result] = useState<PredictionResponse | null>(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("cropdoctor_last_result");
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return null;
        }
      }
    }
    return null;
  });
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [showGradcam, setShowGradcam] = useState(false);
  const [showCauseModal, setShowCauseModal] = useState(false);

  useEffect(() => {
    if (!result) {
      router.replace("/home");
    }
  }, [result, router]);

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-brand-50 via-white to-white">
        <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Quality failure screen
  if (!result.success || !result.quality.passed) {
    return <QualityFailure result={result} lang={lang} onRetry={() => router.push("/capture")} />;
  }

  // Unknown disease screen
  if (result.isUnknown) {
    return <UnknownResult result={result} lang={lang} onRetry={() => router.push("/capture")} onBack={() => router.push("/home")} />;
  }

  const top = result.predictions[0];
  const severity = (result.diseaseInfo?.severity || "unknown") as StatusColor;
  const colors = STATUS_COLORS[severity] || STATUS_COLORS.unknown;

  const farmerName = lang === "hi"
    ? top.farmerNameHi || top.farmerName
    : top.farmerName;

  const badgeLabel = lang === "hi"
    ? colors.labelHi
    : colors.label;

  const description = lang === "hi"
    ? result.diseaseInfo?.descriptionHi || result.diseaseInfo?.description || ""
    : result.diseaseInfo?.description || "";

  const remedy = lang === "hi"
    ? result.diseaseInfo?.remedyHi || result.diseaseInfo?.remedy || ""
    : result.diseaseInfo?.remedy || "";

  const causeSummary = lang === "hi"
    ? result.diseaseInfo?.causeHi || "हवा में नमी व फफूंद के बीजाणु"
    : result.diseaseInfo?.cause || "High humidity & airborne spores";

  const stageSummary = lang === "hi"
    ? result.diseaseInfo?.stageHi || "शुरुआती चरण (रोकथाम संभव)"
    : result.diseaseInfo?.stage || "Early Stage (Preventable)";

  const voiceText = `${farmerName}. ${description}. ${remedy}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 via-white to-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 sticky top-0 bg-white/80 backdrop-blur-sm z-10 border-b border-surface-border">
        <button
          onClick={() => router.push("/home")}
          className="w-10 h-10 rounded-full flex items-center justify-center
                     hover:bg-surface-tertiary transition-colors active:scale-90"
        >
          <ArrowLeft className="w-5 h-5 text-ink" />
        </button>

        <ModeToggle
          isExpertMode={isExpertMode}
          onToggle={toggleMode}
          lang={lang}
        />
      </div>

      <div className="px-4 py-4 pb-8 space-y-4 animate-fade-in">
        {/* Main Result Card with Uploaded Leaf Thumbnail */}
        <Card className="relative overflow-hidden">
          <div className="flex items-start gap-3.5">
            {/* Small Uploaded Leaf Image Thumbnail */}
            {result.imageUrl && (
              <div className="flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${API_BASE_URL}${result.imageUrl}`}
                  alt="Scanned leaf thumbnail"
                  className="w-16 h-16 rounded-xl object-cover border-2 border-brand-200 shadow-sm"
                />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <Badge status={severity} size="sm">
                {badgeLabel}
              </Badge>

              <h1 className="text-farmer-lg font-bold text-ink mt-1.5 leading-snug">
                {farmerName}
              </h1>

              {result.diseaseInfo?.cropName && (
                <p className="text-farmer-xs font-semibold text-brand-700 mt-0.5">
                  {result.diseaseInfo.cropName}
                </p>
              )}
            </div>
          </div>

          {/* Crisp 1-Line Cause & Stage Banner + Modal Trigger */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            <div className="text-farmer-xs text-slate-700 font-medium truncate">
              <span className="font-bold text-amber-800">• {lang === "hi" ? "कारण व चरण:" : "Cause & Stage:"}</span>{" "}
              {stageSummary}
            </div>
            <button
              onClick={() => setShowCauseModal(true)}
              className="flex-shrink-0 px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 text-xs font-bold hover:bg-amber-200 active:scale-95 transition-all flex items-center gap-1"
            >
              <Info className="w-3.5 h-3.5 text-amber-800" />
              {lang === "hi" ? "विवरण" : "Details"}
            </button>
          </div>
        </Card>

        {/* Voice Button */}
        <VoiceButton
          text={voiceText}
          lang={lang}
          size="lg"
          className="w-full"
        />

        {/* Weather Agro-Advisory & Spray Decision */}
        <WeatherAdvisoryCard lang={lang} />

        {/* Confidence Indicator */}
        <Card>
          <ConfidenceIndicator
            confidence={top.confidence}
            showExact={isExpertMode}
            lang={lang}
          />
        </Card>

        {/* Description Card */}
        {description && (
          <Card>
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" />
              <div className="text-farmer-sm text-ink-secondary leading-relaxed">
                {highlightKeywords(description)}
              </div>
            </div>
          </Card>
        )}

        {/* Remedy Card with Prominent Cost Pill & Highlighted Text */}
        {remedy && (
          <Card className={`border-l-4 ${colors.border}`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-farmer-xs font-bold text-ink flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                {lang === "hi" ? "इलाज का सही तरीका" : "Recommended Treatment"}
              </h3>
            </div>

            <div className="text-farmer-sm text-ink leading-relaxed mb-3">
              {highlightKeywords(remedy)}
            </div>

            {/* Prominent Estimated Cost Badge */}
            {result.diseaseInfo?.remedyCost && (
              <div className="mt-3 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 font-bold text-farmer-xs shadow-xs">
                <Tag className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>
                  {lang === "hi" ? "अनुमानित खर्चा:" : "Estimated Cost:"}{" "}
                  <strong className="text-emerald-700 text-farmer-sm">{result.diseaseInfo.remedyCost}</strong>
                </span>
              </div>
            )}
          </Card>
        )}

        {/* Expert Mode: Top-3 Bar Chart */}
        {isExpertMode && result.predictions.length > 1 && (
          <Card>
            <h3 className="text-farmer-xs font-semibold text-ink-secondary mb-3">
              {lang === "hi" ? "संभावित बीमारियां" : "Top Predictions"}
            </h3>
            <div className="space-y-2">
              {result.predictions.map((pred, i) => (
                <div key={i}>
                  <div className="flex justify-between text-farmer-xs mb-1">
                    <span className="text-ink-secondary truncate mr-2">
                      {lang === "hi" ? pred.farmerNameHi : pred.farmerName}
                    </span>
                    <span className="font-mono font-semibold text-ink">
                      {(pred.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 bg-surface-tertiary rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ease-out ${
                        i === 0 ? "bg-brand-500" : "bg-surface-border"
                      }`}
                      style={{
                        width: `${pred.confidence * 100}%`,
                        transitionDelay: `${i * 100}ms`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Farmer Mode: Alternative matches */}
        {!isExpertMode && result.predictions.length > 1 && (
          <button
            onClick={() => setShowAlternatives(!showAlternatives)}
            className="w-full flex items-center justify-between px-4 py-3 
                       bg-surface-secondary rounded-card text-farmer-xs text-ink-secondary
                       hover:bg-surface-tertiary transition-colors"
          >
            <span>
              {lang === "hi" ? "अन्य बीमारियां" : "Other possible matches"}
            </span>
            {showAlternatives ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        )}

        {!isExpertMode && showAlternatives && (
          <div className="flex gap-2 flex-wrap">
            {result.predictions.slice(1).map((pred, i) => (
              <div
                key={i}
                className="px-3 py-2 bg-surface-secondary rounded-button text-farmer-xs text-ink-secondary"
              >
                {lang === "hi" ? pred.farmerNameHi : pred.farmerName}
              </div>
            ))}
          </div>
        )}

        {/* Grad-CAM (Expert Mode) */}
        {isExpertMode && result.gradcamUrl && (
          <Card noPadding>
            <button
              onClick={() => setShowGradcam(!showGradcam)}
              className="w-full flex items-center justify-between px-4 py-3 text-farmer-xs font-semibold text-ink-secondary"
            >
              <span>{lang === "hi" ? "मॉडल ध्यान मानचित्र" : "Model Attention Map (Grad-CAM)"}</span>
              {showGradcam ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {showGradcam && (
              <div className="px-4 pb-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-ink-muted mb-1">Original</p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`${API_BASE_URL}${result.imageUrl}`}
                      alt="Original"
                      className="rounded-lg w-full aspect-square object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-ink-muted mb-1">Grad-CAM</p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`${API_BASE_URL}${result.gradcamUrl}`}
                      alt="Grad-CAM overlay"
                      className="rounded-lg w-full aspect-square object-cover"
                    />
                  </div>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 pt-2 pb-16">
          <button
            onClick={() => router.push("/chat")}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-purple-600 text-white font-bold shadow-lg shadow-purple-600/20 hover:bg-purple-700 active:scale-95 transition-all"
          >
            💬 {lang === "hi" ? "इस बीमारी के बारे में AI से पूछें" : "Ask AI About This Disease"}
          </button>

          <button
            onClick={() => router.push("/capture")}
            className="btn-primary w-full"
          >
            <Leaf className="w-5 h-5" />
            {lang === "hi" ? "नई पत्ती स्कैन करें" : "Scan Another Leaf"}
          </button>
        </div>

        <BottomNav />
      </div>

      {/* Cause & Stage Info Modal Overlay */}
      {showCauseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4 border border-surface-border animate-scale-up">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-farmer-md font-bold text-ink flex items-center gap-2">
                <Info className="w-5 h-5 text-amber-600" />
                {lang === "hi" ? "रोग का कारण व बचाव विवरण" : "Disease Insights & Prevention"}
              </h3>
              <button
                onClick={() => setShowCauseModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            {/* Why it happened */}
            <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200">
              <p className="text-farmer-xs font-bold text-amber-900 flex items-center gap-1.5 mb-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                {lang === "hi" ? "बीमारी क्यों हुई (Why it happened):" : "Why it happened:"}
              </p>
              <p className="text-farmer-xs text-amber-900 leading-relaxed pl-3.5">
                {causeSummary}
              </p>
            </div>

            {/* Current Disease Stage */}
            <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-200">
              <p className="text-farmer-xs font-bold text-blue-900 flex items-center gap-1.5 mb-1">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                {lang === "hi" ? "बीमारी का चरण (Disease Stage):" : "Disease Stage:"}
              </p>
              <p className="text-farmer-xs text-blue-900 font-semibold pl-3.5">
                {stageSummary}
              </p>
            </div>

            {/* Prevention Tip */}
            <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200">
              <p className="text-farmer-xs font-bold text-emerald-900 flex items-center gap-1.5 mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                {lang === "hi" ? "आगे से बचाव (Prevention Tip):" : "Prevention Tip:"}
              </p>
              <p className="text-farmer-xs text-emerald-900 leading-relaxed pl-3.5">
                {lang === "hi"
                  ? result.diseaseInfo?.preventionTipHi || "ऊपर से छिड़काव के बजाय जड़ों में पानी दें और कटी पत्तियां हटाएं।"
                  : result.diseaseInfo?.preventionTip || "Avoid overhead sprinkler watering and remove infected leaf residue."}
              </p>
            </div>

            <button
              onClick={() => setShowCauseModal(false)}
              className="w-full py-3 bg-brand-600 text-white font-bold rounded-xl shadow-md hover:bg-brand-700 active:scale-95 transition-all text-farmer-sm"
            >
              {lang === "hi" ? "ठीक है, समझ गया" : "Got it, Close"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Highlight important chemical names, spray timings, and critical actions in remedy text
 */
function highlightKeywords(text: string) {
  if (!text) return null;
  const regex = /(mancozeb|chlorothalonil|azoxystrobin|neem oil|copper hydroxide|metalaxyl|fungicide|pesticide|early morning|late evening|water at base|remove lower infected leaves|2-year crop rotation|नीम का तेल|मैनकोजेब|कॉपर|फफूंदनाशक|कीटनाशक|सुबह जल्दी|शाम को|निचली पत्तियां हटाएं)/gi;

  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-amber-100 text-amber-950 font-bold px-1.5 py-0.5 rounded border border-amber-300">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
}

/**
 * Weather Agro-Advisory & Spray Decision Component (Clean, SVG Icon Styling)
 */
function WeatherAdvisoryCard({ lang }: { lang: string }) {
  const [weather, setWeather] = useState<any>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/weather?lat=28.6139&lon=77.2090`)
      .then((res) => res.json())
      .then((data) => setWeather(data))
      .catch(() => {});
  }, []);

  if (!weather || !weather.available) return null;

  return (
    <Card className="border-2 border-sky-100 bg-gradient-to-br from-sky-50/40 to-white">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-farmer-xs font-bold text-sky-950 flex items-center gap-2">
          <CloudSun className="w-5 h-5 text-sky-600 flex-shrink-0" />
          {lang === "hi" ? "मौसम व छिड़काव (स्प्रे) सलाह" : "Weather & Spray Advisory"}
        </h3>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-sky-100 text-sky-900 border border-sky-200">
          {weather.temp}°C · {weather.humidity}% {lang === "hi" ? "नमी" : "Humidity"}
        </span>
      </div>

      {/* Spray & Fertilizer Decision Card */}
      <div
        className={`p-3.5 rounded-xl mb-3 border-l-4 text-farmer-xs ${
          weather.sprayAllowedToday
            ? "bg-emerald-50 text-emerald-950 border-emerald-500 border-r border-t border-b border-r-emerald-200 border-t-emerald-200 border-b-emerald-200"
            : "bg-rose-50 text-rose-950 border-rose-500 border-r border-t border-b border-r-rose-200 border-t-rose-200 border-b-rose-200"
        }`}
      >
        <div className="flex items-start gap-2.5">
          {weather.sprayAllowedToday ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          )}

          <div className="space-y-1.5 min-w-0">
            <p className="font-bold text-farmer-xs leading-snug">
              {lang === "hi" ? weather.sprayDecisionHi : weather.sprayDecision}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold pt-1 border-t border-slate-200/60">
              <Clock className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
              <span>{lang === "hi" ? weather.bestWindowHi : weather.bestWindow}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3-Day Forecast Grid */}
      {weather.forecast3Day && (
        <div className="grid grid-cols-3 gap-2 mt-2">
          {weather.forecast3Day.map((f: any, idx: number) => (
            <div key={idx} className="p-2.5 rounded-xl bg-white border border-slate-200 text-center shadow-xs">
              <p className="text-xs font-bold text-slate-800">{lang === "hi" ? f.dayHi : f.day}</p>
              <p className="text-xs text-slate-600 my-0.5">{f.temp}</p>
              <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                f.canSpray ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
              }`}>
                {lang === "hi" ? f.statusTextHi : f.statusText}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

// --- Quality & Unknown Fallback components ---

function QualityFailure({
  result,
  lang,
  onRetry,
}: {
  result: PredictionResponse;
  lang: string;
  onRetry: () => void;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-white p-4 flex flex-col justify-between">
      <div className="space-y-4 animate-fade-in pt-8">
        <Card className="text-center border-amber-200">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
          <h1 className="text-farmer-lg font-bold text-ink mt-3">
            {lang === "hi" ? "फोटो साफ़ नहीं है" : "Image Needs Attention"}
          </h1>
          <p className="text-farmer-sm text-ink-secondary mt-2">
            {lang === "hi"
              ? result.quality?.remediationTextHi || "कृपया बेहतर रोशनी में साफ़ फोटो लें।"
              : result.quality?.remediationText || "Please take a clearer photo in good lighting."}
          </p>

        </Card>
      </div>

      <div className="pb-8">
        <button onClick={onRetry} className="btn-primary w-full">
          <Leaf className="w-5 h-5" />
          {lang === "hi" ? "दोबारा फोटो लें" : "Retake Photo"}
        </button>
      </div>
    </div>
  );
}

function UnknownResult({
  result,
  lang,
  onRetry,
  onBack,
}: {
  result: PredictionResponse;
  lang: string;
  onRetry: () => void;
  onBack: () => void;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-white p-4 flex flex-col justify-between">
      <div className="space-y-4 animate-fade-in pt-8">
        <Card className="text-center">
          <HelpCircle className="w-12 h-12 text-slate-400 mx-auto" />
          <h1 className="text-farmer-lg font-bold text-ink mt-3">
            {lang === "hi" ? "पहचान नहीं हो सकी" : "Unknown Disease / Crop"}
          </h1>
          <p className="text-farmer-sm text-ink-secondary mt-2">
            {lang === "hi"
              ? "यह पत्ती हमारे समर्थित 38 रोगों से मेल नहीं खाती। निकटतम कृषि अधिकारी से परामर्श करें।"
              : "This leaf does not match our supported dataset classes. Please consult a local agricultural officer."}
          </p>
        </Card>
      </div>

      <div className="pb-8 space-y-3">
        <button onClick={onRetry} className="btn-primary w-full">
          <Leaf className="w-5 h-5" />
          {lang === "hi" ? "दूसरी फोटो लें" : "Scan Another Leaf"}
        </button>
        <button onClick={onBack} className="btn-ghost w-full">
          {lang === "hi" ? "मुख्य स्क्रीन पर जाएं" : "Go to Home"}
        </button>
      </div>
    </div>
  );
}

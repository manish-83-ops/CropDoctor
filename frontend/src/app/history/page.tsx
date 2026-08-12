"use client";

import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useState, useEffect } from "react";
import { ArrowLeft, ClipboardList, Leaf } from "lucide-react";
import Card from "@/components/ui/Card";
import BottomNav from "@/components/ui/BottomNav";
import { getHistory } from "@/lib/api";
import { STATUS_COLORS, type StatusColor, API_BASE_URL } from "@/lib/constants";
import type { HistoryItem } from "@/types/prediction";

/**
 * History Screen — Scrollable list of past predictions.
 *
 * Tapping an item reopens the full result.
 * Empty state shows a friendly message.
 */
export default function HistoryPage() {
  const router = useRouter();
  const { lang } = useLanguage();

  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const t = {
    en: {
      title: "History",
      empty: "No scans yet",
      emptyDesc: "Scan your first leaf to see results here!",
      scanNow: "Scan Now",
      back: "Back",
    },
    hi: {
      title: "इतिहास",
      empty: "अभी तक कोई स्कैन नहीं",
      emptyDesc: "अपनी पहली पत्ती स्कैन करें!",
      scanNow: "अभी स्कैन करें",
      back: "वापस",
    },
  };

  const text = t[lang];

  useEffect(() => {
    async function loadHistory() {
      try {
        const data = await getHistory();
        setItems(data.predictions);
      } catch {
        setError(
          lang === "hi"
            ? "इतिहास लोड करने में विफल"
            : "Failed to load history"
        );
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, [lang]);

  const handleItemClick = (item: HistoryItem) => {
    // Reconstruct a PredictionResponse from the history item
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 via-white to-white">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 sticky top-0 bg-white/80 backdrop-blur-sm z-10 border-b border-surface-border">
        <button
          onClick={() => router.push("/home")}
          className="w-10 h-10 rounded-full flex items-center justify-center
                     hover:bg-surface-tertiary transition-colors active:scale-90"
        >
          <ArrowLeft className="w-5 h-5 text-ink" />
        </button>
        <h1 className="text-farmer-lg font-bold text-ink">{text.title}</h1>
      </div>

      <div className="px-4 py-4 space-y-3 animate-fade-in">
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="text-center py-16 text-ink-secondary text-farmer-sm">
            {error}
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-16 h-16 rounded-full bg-surface-tertiary flex items-center justify-center">
              <ClipboardList className="w-8 h-8 text-ink-muted" />
            </div>
            <div className="text-center">
              <h3 className="text-farmer-lg font-semibold text-ink">
                {text.empty}
              </h3>
              <p className="text-farmer-sm text-ink-secondary mt-1">
                {text.emptyDesc}
              </p>
            </div>
            <button
              onClick={() => router.push("/capture")}
              className="btn-primary"
            >
              <Leaf className="w-5 h-5" />
              {text.scanNow}
            </button>
          </div>
        )}

        {items.map((item) => {
          const severity = (item.severity || "unknown") as StatusColor;
          const colors = STATUS_COLORS[severity] || STATUS_COLORS.unknown;
          const date = new Date(item.createdAt).toLocaleDateString(
            lang === "hi" ? "hi-IN" : "en-US",
            { month: "short", day: "numeric" }
          );

          return (
            <Card
              key={item.id}
              interactive
              onClick={() => handleItemClick(item)}
              className="flex items-center gap-3"
            >
              {/* Thumbnail */}
              <div className="w-14 h-14 rounded-lg overflow-hidden bg-surface-tertiary flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${API_BASE_URL}${item.imageUrl}`}
                  alt=""
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-2.5 h-2.5 rounded-full ${colors.dot}`} />
                  <span className="text-farmer-sm font-medium text-ink truncate">
                    {item.farmerName}
                  </span>
                </div>
                <span className="text-farmer-xs text-ink-muted">
                  {date}
                </span>
              </div>

              {/* Confidence dot indicator */}
              <div className="flex gap-0.5 flex-shrink-0">
                {[1, 2, 3].map((i) => {
                  const dots = item.confidence >= 0.7 ? 3 : item.confidence >= 0.4 ? 2 : 1;
                  return (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        i <= dots ? colors.dot : "bg-surface-tertiary"
                      }`}
                    />
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>

      <BottomNav />
    </div>
  );
}

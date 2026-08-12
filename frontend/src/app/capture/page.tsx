"use client";

import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useState, useRef, useCallback, useEffect } from "react";
import {
  Camera,
  Upload,
  X,
  RotateCcw,
  Check,
  ArrowLeft,
  ZapOff,
} from "lucide-react";
import { validateImageFile, compressImage } from "@/lib/imageUtils";
import { predictDisease, saveToHistory } from "@/lib/api";
import LoadingAnimation from "@/components/ui/LoadingAnimation";
import { MIN_ANALYZING_DURATION_MS } from "@/lib/constants";

type CaptureState = "camera" | "preview" | "analyzing" | "error";

/**
 * Capture Screen — Camera viewfinder + gallery upload.
 *
 * Flow: Open camera → Capture → Preview → Confirm → Analyzing → Result
 * Gallery upload: Pick → Preview → Confirm → Analyzing → Result
 */
export default function CapturePage() {
  const router = useRouter();
  const { lang } = useLanguage();

  const [state, setState] = useState<CaptureState>("camera");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string>("");
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [facingMode, setFacingMode] = useState<"environment" | "user">(
    "environment"
  );

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const t = {
    en: {
      back: "Back",
      capture: "Capture",
      retake: "Retake",
      usePhoto: "Use This Photo",
      uploadFromGallery: "Upload from Gallery",
      fitLeaf: "Fit one leaf inside the frame",
      analyzing: "Checking your leaf...",
      cameraError:
        "Camera not available. You can still upload from your gallery.",
      switchCamera: "Switch Camera",
    },
    hi: {
      back: "वापस",
      capture: "फोटो लें",
      retake: "दोबारा लें",
      usePhoto: "यह फोटो इस्तेमाल करें",
      uploadFromGallery: "गैलरी से अपलोड करें",
      fitLeaf: "एक पत्ती को फ्रेम में रखें",
      analyzing: "आपकी पत्ती की जांच हो रही है...",
      cameraError:
        "कैमरा उपलब्ध नहीं है। आप गैलरी से अपलोड कर सकते हैं।",
      switchCamera: "कैमरा बदलें",
    },
  };

  const text = t[lang];

  // --- Camera Setup ---
  const startCamera = useCallback(async () => {
    try {
      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 960 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraReady(true);
      }
    } catch {
      console.warn("Camera not available");
      setIsCameraReady(false);
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsCameraReady(false);
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (state === "camera") {
      timer = setTimeout(() => {
        void startCamera();
      }, 0);
    }
    return () => {
      clearTimeout(timer);
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, facingMode]);

  // --- Capture ---
  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          setCapturedBlob(blob);
          setPreviewUrl(URL.createObjectURL(blob));
          setState("preview");
          stopCamera();
        }
      },
      "image/jpeg",
      0.92
    );
  };

  // --- Gallery Upload ---
  const handleGalleryUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || "Invalid file");
      setState("error");
      return;
    }

    try {
      const compressed = await compressImage(file);
      setCapturedBlob(compressed);
      setPreviewUrl(URL.createObjectURL(compressed));
      setState("preview");
      stopCamera();
    } catch {
      setError("Failed to process image. Please try another.");
      setState("error");
    }
  };

  // --- Submit for Analysis ---
  const handleSubmit = async () => {
    if (!capturedBlob) return;

    setState("analyzing");

    const startTime = Date.now();

    try {
      const result = await predictDisease(capturedBlob);

      // [DEBUG] Log full API response including quality gate debug scores
      console.log("[CropDoctor] Prediction API response:", JSON.stringify(result, null, 2));
      if (result.quality?.debugScores) {
        console.table(result.quality.debugScores);
      }

      // Enforce minimum analyzing duration
      const elapsed = Date.now() - startTime;
      if (elapsed < MIN_ANALYZING_DURATION_MS) {
        await new Promise((r) =>
          setTimeout(r, MIN_ANALYZING_DURATION_MS - elapsed)
        );
      }

      // Save to history if prediction succeeded
      if (result.success && result.predictions.length > 0) {
        const top = result.predictions[0];
        try {
          await saveToHistory({
            imageUrl: result.imageUrl,
            topPrediction: top.className,
            farmerName: top.farmerName,
            confidence: top.confidence,
            severity: result.diseaseInfo?.severity || "unknown",
            gradcamUrl: result.gradcamUrl || undefined,
            diseaseInfo: result.diseaseInfo as unknown as Record<string, unknown> || undefined,
            predictions: result.predictions as unknown as Array<Record<string, unknown>>,
            isUnknown: result.isUnknown,
          });
        } catch (e) {
          console.warn("Failed to save to history:", e);
        }
      }

      // Store result and navigate
      sessionStorage.setItem(
        "cropdoctor_last_result",
        JSON.stringify(result)
      );
      router.push("/result");
    } catch {
      setError(
        lang === "hi"
          ? "विश्लेषण विफल हुआ। कृपया पुनः प्रयास करें।"
          : "Analysis failed. Please try again."
      );
      setState("error");
    }
  };

  // --- Retake ---
  const handleRetake = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setCapturedBlob(null);
    setPreviewUrl(null);
    setState("camera");
  };

  // --- Switch Camera ---
  const handleSwitchCamera = () => {
    setFacingMode((prev) =>
      prev === "environment" ? "user" : "environment"
    );
  };

  // =========================
  // RENDER
  // =========================

  // Analyzing screen
  if (state === "analyzing") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-brand-50 via-white to-white px-6">
        <LoadingAnimation
          message={text.analyzing}
          messageHi={t.hi.analyzing}
          lang={lang}
        />
      </div>
    );
  }

  // Error screen
  if (state === "error") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 gap-6 bg-gradient-to-b from-brand-50 via-white to-white">
        <div className="w-16 h-16 rounded-full bg-status-danger/10 flex items-center justify-center">
          <X className="w-8 h-8 text-status-danger" />
        </div>
        <p className="text-farmer-base text-ink text-center">{error}</p>
        <div className="flex gap-3">
          <button
            onClick={() => setState("camera")}
            className="btn-secondary"
          >
            <RotateCcw className="w-5 h-5" />
            {text.retake}
          </button>
          <button onClick={handleGalleryUpload} className="btn-primary">
            <Upload className="w-5 h-5" />
            {text.uploadFromGallery}
          </button>
        </div>
      </div>
    );
  }

  // Preview screen
  if (state === "preview" && previewUrl) {
    return (
      <div className="min-h-screen flex flex-col bg-black">
        {/* Preview Image */}
        <div className="flex-1 flex items-center justify-center relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Captured leaf"
            className="max-w-full max-h-[70vh] object-contain"
          />
        </div>

        {/* Action Buttons */}
        <div className="p-6 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex gap-3 max-w-sm mx-auto">
            <button
              onClick={handleRetake}
              className="flex-1 flex items-center justify-center gap-2
                         px-4 py-4 rounded-button min-h-[56px]
                         bg-white/10 backdrop-blur-sm text-white font-semibold
                         border border-white/20
                         transition-all duration-200
                         active:scale-95"
            >
              <RotateCcw className="w-5 h-5" />
              {text.retake}
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 flex items-center justify-center gap-2
                         px-4 py-4 rounded-button min-h-[56px]
                         bg-brand-500 text-white font-semibold
                         shadow-button
                         transition-all duration-200
                         active:scale-95"
            >
              <Check className="w-5 h-5" />
              {text.usePhoto}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Camera screen (default)
  return (
    <div className="min-h-screen flex flex-col bg-black relative">
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
        <button
          onClick={() => {
            stopCamera();
            router.push("/home");
          }}
          className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm
                     flex items-center justify-center text-white
                     transition-all active:scale-90"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Real-time Quality Traffic-Light Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-xs font-semibold text-white">
          <span className={`w-2.5 h-2.5 rounded-full animate-pulse ${
            isCameraReady ? "bg-emerald-400 shadow-emerald-400/50 shadow-md" : "bg-amber-400"
          }`} />
          <span>{isCameraReady ? (lang === "hi" ? "फोटो गुणवत्ता: उत्तम" : "Quality: Ready") : (lang === "hi" ? "कैमरा लोड हो रहा है" : "Camera Initializing")}</span>
        </div>

        {isCameraReady && (
          <button
            onClick={handleSwitchCamera}
            className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm
                       flex items-center justify-center text-white
                       transition-all active:scale-90"
            aria-label={text.switchCamera}
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Scope Honesty Banner (Persistent) */}
      <div className="absolute top-16 left-4 right-4 z-20 flex justify-center pointer-events-none">
        <div className="px-3 py-1.5 rounded-xl bg-amber-500/80 backdrop-blur-md text-slate-900 text-[11px] font-bold shadow-lg flex items-center gap-1.5 border border-amber-300/40">
          <span>🍃</span>
          <span>{lang === "hi" ? "केवल पत्तियों की फोटो लें (PlantVillage)" : "Supports: Leaf photos only (PlantVillage)"}</span>
        </div>
      </div>

      {/* Camera Viewfinder */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${isCameraReady ? "" : "hidden"}`}
        />

        {/* Leaf Guide Overlay */}
        {isCameraReady && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {/* Semi-transparent overlay with cutout */}
            <div className="relative w-64 h-64">
              {/* Guide border */}
              <div className="absolute inset-0 rounded-3xl border-2 border-white/60 border-dashed" />
              {/* Corner markers */}
              <div className="absolute top-0 left-0 w-6 h-6 border-t-3 border-l-3 border-brand-400 rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t-3 border-r-3 border-brand-400 rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-3 border-l-3 border-brand-400 rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-3 border-r-3 border-brand-400 rounded-br-lg" />
            </div>
          </div>
        )}

        {/* Camera not available message */}
        {!isCameraReady && (
          <div className="text-center text-white/70 px-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
              <ZapOff className="w-8 h-8" />
            </div>
            <p className="text-farmer-base">{text.cameraError}</p>
          </div>
        )}
      </div>

      {/* Guide text */}
      <div className="text-center py-2">
        <p className="text-white/70 text-farmer-xs">{text.fitLeaf}</p>
      </div>

      {/* Bottom controls */}
      <div className="p-6 flex items-center justify-center gap-8">
        {/* Gallery button */}
        <button
          onClick={handleGalleryUpload}
          className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm
                     flex items-center justify-center text-white
                     border border-white/20
                     transition-all active:scale-90"
          aria-label={text.uploadFromGallery}
        >
          <Upload className="w-6 h-6" />
        </button>

        {/* Capture button */}
        <button
          onClick={handleCapture}
          disabled={!isCameraReady}
          className="w-20 h-20 rounded-full bg-white
                     flex items-center justify-center
                     shadow-lg transition-all
                     active:scale-90
                     disabled:opacity-30 disabled:cursor-not-allowed
                     relative"
          aria-label={text.capture}
        >
          {/* Outer ring */}
          <div className="absolute inset-0 -m-1 rounded-full border-4 border-white/40" />
          <Camera className="w-8 h-8 text-ink" />
        </button>

        {/* Spacer to balance layout */}
        <div className="w-14 h-14" />
      </div>

      {/* Hidden elements */}
      <canvas ref={canvasRef} className="hidden" />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileSelected}
      />
    </div>
  );
}

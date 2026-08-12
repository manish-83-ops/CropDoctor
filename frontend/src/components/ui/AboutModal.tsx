"use client";

import { useLanguage } from "@/context/LanguageContext";
import { X, Leaf, CheckCircle, AlertTriangle } from "lucide-react";

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  const { lang } = useLanguage();

  if (!isOpen) return null;

  const t = {
    en: {
      title: "About CropDoctor AI",
      tagline: "Empowering Indian farmers with instant, offline-capable crop health diagnosis.",
      supportedTitle: "Supported Crops & Diseases",
      supportedDesc: "Trained on 38 classes across 14 crops (PlantVillage dataset) including Tomato, Potato, Apple, Grape, Corn, Pepper, and more.",
      scopeTitle: "Important Scope Disclosure",
      scopeDesc: "CropDoctor AI is specialized for LEAF PHOTOS ONLY. Root, stem, or whole-field photos will trigger our Out-Of-Distribution (OOD) unknown detector.",
      close: "Close",
    },
    hi: {
      title: "CropDoctor AI के बारे में",
      tagline: "भारतीय किसानों को त्वरित, ऑफ़लाइन फसल स्वास्थ्य निदान के साथ सशक्त बनाना।",
      supportedTitle: "समर्थित फसलें और रोग",
      supportedDesc: "टमाटर, आलू, सेब, अंगूर, मक्का, मिर्च सहित 14 फसलों की 38 श्रेणियों (PlantVillage डेटासेट) पर प्रशिक्षित।",
      scopeTitle: "महत्वपूर्ण सीमा प्रकटीकरण",
      scopeDesc: "CropDoctor AI केवल पत्तियों की फोटो के लिए विशेषीकृत है। जड़, तना या पूरे खेत की फोटो हमारी अज्ञाता प्रणाली (OOD) को ट्रिगर करेगी।",
      close: "बंद करें",
    },
  };

  const text = t[lang];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-fade-in">
      <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white">
              <Leaf className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">{text.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            {text.tagline}
          </p>

          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200/80 space-y-1.5">
            <h3 className="text-sm font-bold text-emerald-900 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              {text.supportedTitle}
            </h3>
            <p className="text-xs text-emerald-800 leading-relaxed">
              {text.supportedDesc}
            </p>
          </div>

          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200/80 space-y-1.5">
            <h3 className="text-sm font-bold text-amber-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              {text.scopeTitle}
            </h3>
            <p className="text-xs text-amber-800 leading-relaxed">
              {text.scopeDesc}
            </p>
          </div>

          <div className="text-xs text-slate-500 space-y-1 pt-2">
            <p>• Model: EfficientNetB0 (Transfer Learning)</p>
            <p>• Quantization: Float16 TFLite</p>
            <p>• Calibration: Post-hoc Temperature Scaling (T=1.0)</p>
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

"use client";

import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  Send,
  Mic,
  MicOff,
  Bot,
  User,
  Leaf,
} from "lucide-react";
import BottomNav from "@/components/ui/BottomNav";
import { API_BASE_URL } from "@/lib/constants";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * Chat Screen — Groq LLM-powered contextual chat.
 *
 * Context from the last diagnosis is automatically included.
 * Mic button for voice input (browser SpeechRecognition).
 * Short, spoken-style responses.
 */
export default function ChatPage() {
  const router = useRouter();
  const { lang } = useLanguage();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [diseaseContext, setDiseaseContext] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const t = {
    en: {
      title: "Kisan Mitr AI Chat",
      placeholder: "Ask anything about your crops...",
      greetingContext:
        "Hello! I have your scanned leaf diagnosis ready. You don't need to type the disease name — just ask your question like 'How to cure it?' or 'Why did it happen?'",
      greetingGeneral:
        "Hello farmer! I am Kisan Mitr, your AI farming assistant. Ask me any question about your crops, weather, soil, fertilizers, or pest control!",
    },
    hi: {
      title: "किसान मित्र AI चैट",
      placeholder: "फसल के बारे में कुछ भी पूछें...",
      greetingContext:
        "राम-राम किसान भाई! आपकी स्कैन की गई पत्ती की जांच रिपोर्ट मेरे पास है। आपको बीमारी का नाम लिखने की जरूरत नहीं है — सीधे पूछें जैसे 'इलाज कैसे करें?' या 'यह क्यों हुआ?'",
      greetingGeneral:
        "राम-राम किसान भाई! मैं किसान मित्र हूं। अपनी फसल, खाद, पानी, मौसम या कीड़ों से जुड़ा कोई भी सवाल बेझिझक पूछें!",
    },
  };

  const text = t[lang];

  // Load disease context from last scan
  useEffect(() => {
    const timer = setTimeout(() => {
      let ctx = "";
      const stored = sessionStorage.getItem("cropdoctor_last_result");
      if (stored) {
        try {
          const result = JSON.parse(stored);
          if (result.diseaseInfo) {
            ctx = `Crop: ${result.diseaseInfo.cropName || "Crop"} | Diagnosis: ${result.diseaseInfo.farmerName || result.diseaseInfo.technicalName} | Symptoms: ${result.diseaseInfo.description} | Recommended Remedy: ${result.diseaseInfo.remedy}`;
            setDiseaseContext(ctx);
          }
        } catch {
          // ignore
        }
      }

      setMessages([
        {
          role: "assistant",
          content: ctx ? text.greetingContext : text.greetingGeneral,
        },
      ]);
    }, 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);


  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const msg = input.trim();
    if (!msg || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    setLoading(true);

    try {
      const resp = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msg,
          diseaseContext,
          language: lang,
        }),
      });

      const data = await resp.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply || "..." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            lang === "hi"
              ? "कनेक्शन में समस्या। कृपया पुनः प्रयास करें।"
              : "Connection error. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      return;
    }

    const SpeechRecognitionClass =
      (window as unknown as Record<string, new () => {
        lang: string;
        continuous: boolean;
        interimResults: boolean;
        onstart: () => void;
        onend: () => void;
        onresult: (e: { results: { [index: number]: { [index: number]: { transcript: string } } } }) => void;
        start: () => void;
      }>).SpeechRecognition ||
      (window as unknown as Record<string, new () => {
        lang: string;
        continuous: boolean;
        interimResults: boolean;
        onstart: () => void;
        onend: () => void;
        onresult: (e: { results: { [index: number]: { [index: number]: { transcript: string } } } }) => void;
        start: () => void;
      }>).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) return;

    const recognition = new SpeechRecognitionClass();
    recognition.lang = lang === "hi" ? "hi-IN" : "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };

    recognition.start();
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-brand-50 via-white to-white">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 sticky top-0 bg-white/80 backdrop-blur-sm z-10 border-b border-surface-border">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full flex items-center justify-center
                     hover:bg-surface-tertiary transition-colors active:scale-90"
        >
          <ArrowLeft className="w-5 h-5 text-ink" />
        </button>
        <h1 className="text-farmer-lg font-bold text-ink">{text.title}</h1>
      </div>

      {/* Disease Context Badge */}
      {diseaseContext && (
        <div className="px-4 pt-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-brand-50 rounded-button text-farmer-xs text-brand-700">
            <Leaf className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">
              {lang === "hi" ? "संदर्भ:" : "Context:"} {diseaseContext.split(" - ")[0]}
            </span>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                msg.role === "user"
                  ? "bg-brand-500 text-white rounded-br-md"
                  : "bg-surface-secondary text-ink rounded-bl-md"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {msg.role === "assistant" ? (
                  <Bot className="w-4 h-4 opacity-60" />
                ) : (
                  <User className="w-4 h-4 opacity-60" />
                )}
                <span className="text-xs opacity-60">
                  {msg.role === "assistant"
                    ? "CropDoctor"
                    : lang === "hi"
                    ? "आप"
                    : "You"}
                </span>
              </div>
              <p className="text-farmer-sm whitespace-pre-wrap leading-relaxed">
                {msg.content}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-surface-secondary rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-ink-muted animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="sticky bottom-16 bg-white border-t border-surface-border p-3 safe-bottom z-30">
        <div className="flex items-center gap-2 max-w-md mx-auto">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={text.placeholder}
            className="flex-1 px-4 py-3 rounded-button border border-surface-border
                       text-farmer-sm text-ink bg-surface-secondary
                       focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100
                       placeholder:text-ink-muted
                       min-h-[48px]"
            disabled={loading}
          />

          <button
            onClick={handleVoiceInput}
            className={`w-12 h-12 rounded-full flex items-center justify-center
                       transition-all active:scale-90 flex-shrink-0
                       ${
                         isListening
                           ? "bg-status-danger text-white animate-pulse"
                           : "bg-surface-secondary text-ink-secondary hover:bg-surface-tertiary"
                       }`}
            aria-label="Voice input"
          >
            {isListening ? (
              <MicOff className="w-5 h-5" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </button>

          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="w-12 h-12 rounded-full bg-brand-500 text-white
                       flex items-center justify-center
                       transition-all active:scale-90 flex-shrink-0
                       disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Send"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

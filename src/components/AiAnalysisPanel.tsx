"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Mic, Send, FileText, Scan, Compass, ChevronDown, Loader2, Bot, Trash2 } from "lucide-react";
import { cockpitAudio } from "@/utils/cockpitAudio";

export type Message = { role: "user" | "ai"; text: string };

interface AiAnalysisPanelProps {
  messages: Message[];
  isAnalyzing: boolean;
  onSendPrompt: (promptText: string) => void;
  onClearHistory: () => void;
}

export function AiAnalysisPanel({
  messages,
  isAnalyzing,
  onSendPrompt,
  onClearHistory,
}: AiAnalysisPanelProps) {
  const [inputText, setInputText] = useState("");
  const [isLogExpanded, setIsLogExpanded] = useState(false);

  const handleSend = () => {
    if (!inputText.trim() && !isAnalyzing) return;
    cockpitAudio.playTactileClick();
    onSendPrompt(inputText || "Describe what you see in this live camera feed in one sentence.");
    setInputText("");
    setIsLogExpanded(true);
  };

  const handleQuickPrompt = (prompt: string) => {
    cockpitAudio.playTactileClick(1.1);
    onSendPrompt(prompt);
    setIsLogExpanded(true);
  };

  const latestAiMessage = messages.slice().reverse().find((m) => m.role === "ai");

  return (
    <div className="w-full metal-panel metal-surface p-4 flex flex-col gap-3 relative z-10 select-none">
      {/* Precision Hardware Screws at 4 Corners */}
      <div className="top-3.5 left-4 hardware-screw" />
      <div className="top-3.5 right-4 hardware-screw" />
      <div className="bottom-3.5 left-4 hardware-screw" />
      <div className="bottom-3.5 right-4 hardware-screw" />

      {/* Top Row Pill: AI Title + Quick Action Pills */}
      <div className="w-full metal-button rounded-full px-5 py-2.5 flex items-center justify-between gap-4">
        {/* Title & Subtitle */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-sky-300 border border-white/50 flex items-center justify-center text-white shadow-[0_4px_6px_rgba(0,0,0,0.2),inset_0_2px_4px_rgba(255,255,255,0.6)]">
            <Sparkles className="w-4 h-4 fill-white drop-shadow-md" />
          </div>
          <div>
            <div
              className="flex items-center gap-1.5 cursor-pointer"
              onClick={() => {
                cockpitAudio.playTactileClick(0.9);
                setIsLogExpanded(!isLogExpanded);
              }}
            >
              <h3 className="text-sm font-semibold tracking-tight engraved-text-deep">AI Analysis</h3>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isLogExpanded ? "rotate-180" : ""}`} />
            </div>
            <p className="text-[11px] font-medium engraved-text">Understand what the rover sees</p>
          </div>
        </div>

        {/* Quick Action Pills */}
        <div className="hidden sm:flex items-center gap-2.5 shrink-0">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => handleQuickPrompt("Summarize what you see in the camera feed.")}
            className="metal-button rounded-full px-4 py-2 text-[11px] font-medium flex items-center gap-2 transition-all cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-slate-600 engraved-icon" />
            <span className="engraved-text">Summarize</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => handleQuickPrompt("Identify all key objects and obstacles in view.")}
            className="metal-button rounded-full px-4 py-2 text-[11px] font-medium flex items-center gap-2 transition-all cursor-pointer"
          >
            <Scan className="w-3.5 h-3.5 text-slate-600 engraved-icon" />
            <span className="engraved-text">Identify Objects</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => handleQuickPrompt("Suggest the safest navigation path forward.")}
            className="metal-button rounded-full px-4 py-2 text-[11px] font-medium flex items-center gap-2 transition-all led-glow-blue cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5" />
            <span className="font-semibold">Suggest Path</span>
          </motion.button>
        </div>
      </div>

      {/* Latest AI Summary Preview if available and not analyzing */}
      {latestAiMessage && !isAnalyzing && (
        <div className="w-full bg-slate-900/90 text-slate-200 border border-blue-500/30 rounded-2xl p-3 text-xs font-mono flex items-start gap-2.5 shadow-inner">
          <Bot className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="text-[10px] uppercase font-bold text-blue-400 block mb-0.5">LATEST NEURAL INSIGHT:</span>
            <p className="text-slate-200 leading-relaxed">{latestAiMessage.text}</p>
          </div>
          {messages.length > 0 && (
            <button
              onClick={() => {
                cockpitAudio.playTactileClick(0.85);
                onClearHistory();
              }}
              className="p-1 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
              title="Clear Log History"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Loading State */}
      <AnimatePresence>
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full bg-blue-950/80 border border-blue-400/50 rounded-2xl p-3 text-xs font-mono text-blue-200 flex items-center justify-center gap-2"
          >
            <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
            <span className="font-bold tracking-wide">CAPTURING LIVE FRAME & EXECUTING GEMINI INFERENCE...</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Row Pill: Prompt Input */}
      <div className="w-full metal-recess rounded-full px-5 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div
            onClick={() => cockpitAudio.playTactileClick()}
            className="w-8 h-8 rounded-full metal-button flex items-center justify-center shrink-0 cursor-pointer"
          >
            <Mic className="w-4 h-4 text-slate-500 hover:text-slate-700 transition-colors engraved-icon" />
          </div>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask Alpho anything about the camera feed..."
            className="w-full bg-transparent border-none text-xs font-medium text-slate-800 placeholder-slate-500 focus:outline-none tracking-wide"
          />
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleSend}
          disabled={isAnalyzing}
          className="w-8 h-8 rounded-full metal-button flex items-center justify-center text-slate-600 hover:text-slate-900 disabled:opacity-50 transition-all shrink-0 cursor-pointer"
        >
          <Send className="w-4 h-4 engraved-icon" />
        </motion.button>
      </div>

      {/* Bottom Subtext */}
      <span className="text-[10px] font-medium engraved-text pl-4">Alpho RoverX · Neural Cockpit</span>
    </div>
  );
}

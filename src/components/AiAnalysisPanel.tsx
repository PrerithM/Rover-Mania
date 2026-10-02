"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Mic, Send, FileText, Scan, Compass, ChevronDown, Loader2 } from "lucide-react";

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
}: AiAnalysisPanelProps) {
  const [inputText, setInputText] = useState("");

  const handleSend = () => {
    if (!inputText.trim() && !isAnalyzing) return;
    onSendPrompt(inputText || "Describe what you see in this live camera feed in one sentence.");
    setInputText("");
  };

  const handleQuickPrompt = (prompt: string) => {
    onSendPrompt(prompt);
  };

  return (
    <div className="w-full metal-panel metal-surface p-4 flex flex-col gap-3 relative z-10 select-none mt-2">
        
        {/* Hardware Screws */}
        <div className="absolute top-4 left-4 hardware-screw" />
        <div className="absolute top-4 right-4 hardware-screw" />
        <div className="absolute bottom-4 left-4 hardware-screw" />
        <div className="absolute bottom-4 right-4 hardware-screw" />

        {/* Top Row Pill: AI Title + Quick Action Pills */}
        <div className="w-full metal-button rounded-full px-5 py-2.5 flex items-center justify-between gap-4">
          
          {/* Title & Subtitle */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-sky-300 border border-white/50 flex items-center justify-center text-white shadow-[0_4px_6px_rgba(0,0,0,0.2),inset_0_2px_4px_rgba(255,255,255,0.6)]">
              <Sparkles className="w-4 h-4 fill-white drop-shadow-md" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 cursor-pointer">
                <h3 className="text-sm font-semibold tracking-tight engraved-text-deep">AI Analysis</h3>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </div>
              <p className="text-[11px] font-medium engraved-text">Understand what the rover sees</p>
            </div>
          </div>

          {/* Quick Action Pills */}
          <div className="hidden sm:flex items-center gap-2.5 shrink-0">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => handleQuickPrompt("Summarize what you see in the camera feed.")}
              className="metal-button rounded-full px-4 py-2 text-[11px] font-medium flex items-center gap-2 transition-all"
            >
              <FileText className="w-3.5 h-3.5 text-slate-600 engraved-icon" />
              <span className="engraved-text">Summarize</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => handleQuickPrompt("Identify all key objects and obstacles in view.")}
              className="metal-button rounded-full px-4 py-2 text-[11px] font-medium flex items-center gap-2 transition-all"
            >
              <Scan className="w-3.5 h-3.5 text-slate-600 engraved-icon" />
              <span className="engraved-text">Identify Objects</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => handleQuickPrompt("Suggest the safest navigation path forward.")}
              className="metal-button rounded-full px-4 py-2 text-[11px] font-medium flex items-center gap-2 transition-all led-glow-blue"
            >
              <Compass className="w-3.5 h-3.5" />
              <span className="font-semibold">Suggest Path</span>
            </motion.button>
          </div>
        </div>

        {/* Loading State */}
        {isAnalyzing && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/90 backdrop-blur border border-blue-200 rounded-full px-4 py-1.5 shadow-lg flex items-center gap-2 text-xs text-blue-700 font-bold z-20">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
            <span>Analyzing current frame...</span>
          </div>
        )}

        {/* Bottom Row Pill: Prompt Input */}
        <div className="w-full metal-recess rounded-full px-5 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-8 h-8 rounded-full metal-button flex items-center justify-center shrink-0">
              <Mic className="w-4 h-4 text-slate-500 cursor-pointer hover:text-slate-700 transition-colors engraved-icon" />
            </div>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask Alpho anything..."
              className="w-full bg-transparent border-none text-xs font-medium text-slate-800 placeholder-slate-500 focus:outline-none tracking-wide"
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={isAnalyzing}
            className="w-8 h-8 rounded-full metal-button flex items-center justify-center text-slate-600 hover:text-slate-900 disabled:opacity-50 transition-all shrink-0"
          >
            <Send className="w-4 h-4 engraved-icon" />
          </motion.button>
        </div>

        {/* Bottom Subtext */}
        <span className="text-[10px] font-medium engraved-text pl-4">Alpho RoverX</span>
      </div>
  );
}

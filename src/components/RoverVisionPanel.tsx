"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, Trash2, Sparkles, Loader2, Eye, Terminal } from "lucide-react";

export type Message = { role: "user" | "ai"; text: string };

interface RoverVisionPanelProps {
  messages: Message[];
  isAnalyzing: boolean;
  onSendPrompt: (promptText: string) => void;
  onClearHistory: () => void;
  onClose?: () => void;
  isFloating?: boolean;
}

export function RoverVisionPanel({
  messages,
  isAnalyzing,
  onSendPrompt,
  onClearHistory,
  onClose,
  isFloating = false,
}: RoverVisionPanelProps) {
  const [inputText, setInputText] = useState("");

  const handleSend = () => {
    if (!inputText.trim() && !isAnalyzing) return;
    onSendPrompt(inputText || "Describe what you see in this live camera feed in one concise sentence.");
    setInputText("");
  };

  const samplePrompts = [
    "Identify obstacles in front of the rover",
    "Describe environment & terrain type",
    "Assess navigation safety & path clear status",
  ];

  return (
    <div className="flex flex-col w-full rounded-2xl carbon-panel border-2 border-cyan-500/40 p-4 transition-all duration-300 shadow-[0_0_30px_rgba(6,182,212,0.2)]">
      {/* Console Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-cyan-500/20 font-mono">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.4)]">
            <Eye className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold uppercase text-white tracking-wider">
                FRAME ANALYSIS & VISION AI DOCK
              </h2>
              <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[9px] font-bold border border-cyan-500/30">
                GEMINI v1.5
              </span>
            </div>
            <p className="text-[10px] text-slate-400 tracking-tight">
              REAL-TIME NEURAL RECOGNITION CONSOLE
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              onClick={onClearHistory}
              className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 border border-slate-700 transition-all text-xs font-mono"
              title="Clear Log History"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Analysis Log Output Feed */}
      <div className="max-h-56 overflow-y-auto space-y-2.5 pr-1 font-mono text-xs">
        {messages.length === 0 && (
          <div className="py-4 flex flex-col items-center justify-center text-center text-slate-400 gap-2 bg-slate-950/60 rounded-xl border border-cyan-500/20">
            <Terminal className="w-6 h-6 text-cyan-400/70" />
            <p className="font-bold text-cyan-300 text-xs uppercase tracking-wider">
              AWAITING FRAME ANALYSIS COMMAND
            </p>
            <p className="text-[10px] text-slate-400 max-w-md">
              Type custom prompt below or select tactical quick queries:
            </p>

            {/* Quick Prompts */}
            <div className="flex flex-wrap gap-2 justify-center mt-1 max-w-xl">
              {samplePrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => onSendPrompt(prompt)}
                  className="px-2.5 py-1.5 rounded-lg bg-cyan-950/70 hover:bg-cyan-900/90 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono transition-all hover:scale-105"
                >
                  ⚡ "{prompt}"
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-3 rounded-xl border ${
              msg.role === "user"
                ? "bg-cyan-950/80 border-cyan-500/50 text-cyan-200"
                : "bg-slate-900/90 border-slate-700 text-amber-200"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] font-bold tracking-widest uppercase text-cyan-400">
                {msg.role === "user" ? "> QUERY PROMPT" : ">> VISION AI TELEMETRY"}
              </span>
              <span className="text-[8px] text-slate-500">SYSTEM LOG #{idx + 1}</span>
            </div>
            <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
          </motion.div>
        ))}

        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-3 rounded-xl bg-cyan-950/90 border border-cyan-400/60 text-cyan-300 flex items-center gap-2.5"
          >
            <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
            <span className="font-bold text-xs uppercase tracking-wider">
              CAPTURING CURRENT VIDEO FRAME & EXECUTING GEMINI INFERENCE...
            </span>
          </motion.div>
        )}
      </div>

      {/* Hand-Drawn Sketch Prompt Input Box ("Frame Analysis - Prompt here.") */}
      <div className="mt-3 pt-3 border-t border-cyan-500/20 flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Frame Analysis - Prompt here."
            className="w-full bg-slate-950 border-2 border-cyan-500/40 rounded-xl px-4 py-2.5 text-xs font-mono text-cyan-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 shadow-[inset_0_0_10px_rgba(6,182,212,0.15)]"
          />
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleSend}
          disabled={isAnalyzing}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-slate-950 font-mono font-extrabold text-xs shadow-[0_0_15px_rgba(6,182,212,0.4)] flex items-center gap-2 transition-all uppercase tracking-wider shrink-0"
        >
          <Send className="w-4 h-4 stroke-[2.5]" />
          <span>ANALYZE</span>
        </motion.button>
      </div>
    </div>
  );
}


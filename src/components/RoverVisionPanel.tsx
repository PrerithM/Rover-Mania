"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, Trash2, Sparkles, Loader2 } from "lucide-react";

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
    onSendPrompt(inputText);
    setInputText("");
  };

  const samplePrompts = [
    "What obstacles are in front of the rover?",
    "Describe the environment in one sentence.",
    "Is the path clear for navigation?",
  ];

  return (
    <div
      className={`flex flex-col h-full rounded-3xl apple-glass p-5 transition-all duration-300 ${
        isFloating ? "shadow-2xl border border-white/20 dark:border-white/10" : ""
      }`}
    >
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/50 dark:border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Rover Vision AI
            </h2>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              Powered by Gemini Vision Engine
            </p>
          </div>
        </div>

        <button
          onClick={onClearHistory}
          className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
          title="Clear Chat History"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Chat History List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-400">
            <Bot className="w-8 h-8 mb-2 stroke-[1.5] text-purple-400/80" />
            <p className="font-medium text-xs text-slate-600 dark:text-slate-300">
              Ask AI to analyze the live camera feed
            </p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
              Tap a quick prompt below or type your custom query.
            </p>

            {/* Quick Prompts */}
            <div className="mt-4 flex flex-col gap-1.5 w-full">
              {samplePrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => onSendPrompt(prompt)}
                  className="px-3 py-2 rounded-xl bg-slate-200/50 dark:bg-white/5 hover:bg-purple-500/10 hover:text-purple-600 dark:hover:text-purple-300 border border-slate-300/30 dark:border-white/10 text-left text-[11px] font-medium transition-all"
                >
                  ✨ "{prompt}"
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`max-w-[85%] p-3 rounded-2xl ${
              msg.role === "user"
                ? "ml-auto bg-blue-600 text-white rounded-br-xs shadow-md shadow-blue-500/20"
                : "mr-auto bg-slate-200/80 dark:bg-white/10 text-slate-900 dark:text-slate-100 rounded-bl-xs border border-slate-300/40 dark:border-white/10"
            }`}
          >
            <span className="text-[9px] font-bold tracking-wider uppercase block mb-1 opacity-60">
              {msg.role === "user" ? "YOU" : "ROVER AI"}
            </span>
            <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
          </motion.div>
        ))}

        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mr-auto bg-slate-200/80 dark:bg-white/10 p-3 rounded-2xl rounded-bl-xs text-slate-600 dark:text-slate-300 flex items-center gap-2"
          >
            <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-500" />
            <span className="font-medium text-xs">Analyzing current video frame...</span>
          </motion.div>
        )}
      </div>

      {/* Prompt Input Field */}
      <div className="mt-3 pt-3 border-t border-slate-200/50 dark:border-white/10 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask AI about video feed..."
          className="flex-1 bg-slate-200/60 dark:bg-white/10 border border-slate-300/40 dark:border-white/10 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
        />
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleSend}
          disabled={isAnalyzing}
          className="p-2.5 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white shadow-md shadow-purple-500/25 transition-all"
        >
          <Send className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  );
}

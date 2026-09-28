"use client";

import { motion } from "framer-motion";
import { ConnectionStatus } from "@/hooks/useRoverWebSocket";
import {
  Settings,
  Sun,
  Moon,
  Bot,
  Sliders,
} from "lucide-react";

interface AppleHeaderProps {
  status: ConnectionStatus;
  ip: string;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenSettings: () => void;
  onToggleAi: () => void;
  isAiOpen: boolean;
}

export function AppleHeader({
  status,
  ip,
  isDarkMode,
  onToggleDarkMode,
  onOpenSettings,
  onToggleAi,
  isAiOpen,
}: AppleHeaderProps) {
  const isConnected = status === "Connected";
  const isConnecting = status === "Connecting";

  return (
    <header className="sticky top-4 z-40 w-full max-w-7xl mx-auto px-4 mb-6">
      <div className="apple-glass rounded-3xl px-5 py-3.5 flex items-center justify-between transition-all duration-300 shadow-xl">
        {/* Left Side: Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.06, rotate: 3 }}
            whileTap={{ scale: 0.94 }}
            className="w-10 h-10 rounded-2xl overflow-hidden bg-white/10 dark:bg-white/10 border border-slate-300/60 dark:border-white/20 shadow-md shrink-0 flex items-center justify-center p-1"
          >
            {/* Direct Image src to ensure reliable rendering */}
            <img
              src="/RoverMania.png"
              alt="RoverMania Logo"
              className="w-full h-full object-contain"
            />
          </motion.div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Rover<span className="text-blue-600 dark:text-blue-400">Mania</span>
              </h1>
              <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30">
                PRO 2.0
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium hidden sm:block">
              Apple Dynamic Control System
            </p>
          </div>
        </div>

        {/* Center: Live Status Telemetry Pill */}
        <motion.div
          onClick={onOpenSettings}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="cursor-pointer flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-200/80 dark:bg-white/10 backdrop-blur-md border border-slate-300/80 dark:border-white/15 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-sm transition-all"
        >
          <span
            className={`w-2.5 h-2.5 rounded-full relative ${isConnected
                ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                : isConnecting
                  ? "bg-amber-500 animate-ping"
                  : "bg-rose-500"
              }`}
          />
          <span>
            {isConnected ? "Live Ready" : isConnecting ? "Connecting..." : "Disconnected"}
          </span>
          <span className="text-slate-500 dark:text-slate-400 font-normal hidden md:inline">
            | {ip}
          </span>
          <Sliders className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 ml-0.5" />
        </motion.div>

        {/* Right Side: Quick Action Buttons */}
        <div className="flex items-center gap-2">
          {/* AI Drawer Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggleAi}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-semibold transition-all border ${isAiOpen
                ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/30"
                : "bg-slate-200/80 dark:bg-white/10 text-slate-800 dark:text-slate-200 border-slate-300/60 dark:border-white/10 hover:bg-slate-300/70 dark:hover:bg-white/20"
              }`}
          >
            <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="hidden sm:inline">Vision AI</span>
          </motion.button>

          {/* Settings Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpenSettings}
            className="p-2.5 rounded-2xl bg-slate-200/80 dark:bg-white/10 text-slate-800 dark:text-slate-200 border border-slate-300/60 dark:border-white/10 hover:bg-slate-300/70 dark:hover:bg-white/20 transition-all"
            title="IP & Port Configuration"
          >
            <Settings className="w-4 h-4" />
          </motion.button>

          {/* Light / Dark Mode Switcher */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggleDarkMode}
            className="p-2.5 rounded-2xl bg-slate-200/80 dark:bg-white/10 text-slate-800 dark:text-slate-200 border border-slate-300/60 dark:border-white/10 hover:bg-slate-300/70 dark:hover:bg-white/20 transition-all"
            title="Toggle Theme"
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </motion.button>
        </div>
      </div>
    </header>
  );
}

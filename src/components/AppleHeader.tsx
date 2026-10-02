"use client";

import { motion } from "framer-motion";
import { ConnectionStatus } from "@/hooks/useRoverWebSocket";
import {
  Settings,
  Sun,
  Moon,
  Bot,
  Sliders,
  Shield,
  Activity,
  Radio,
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
    <header className="sticky top-3 z-40 w-full max-w-7xl mx-auto px-2 sm:px-4 mb-4">
      <div className="carbon-panel tactical-border rounded-2xl px-4 py-3 flex items-center justify-between transition-all duration-300 shadow-2xl backdrop-blur-xl">
        {/* Left Side: Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 rounded-xl overflow-hidden bg-slate-900 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.3)] shrink-0 flex items-center justify-center p-1"
          >
            <img
              src="/RoverMania.png"
              alt="RoverMania Logo"
              className="w-full h-full object-contain filter drop-shadow-[0_0_4px_rgba(6,182,212,0.8)]"
            />
          </motion.div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg font-black tracking-wider uppercase text-white font-mono">
                ROVER<span className="text-cyan-400">MANIA</span>
              </h1>
              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[9px] font-mono font-bold tracking-widest border border-amber-500/30">
                MK-IV
              </span>
            </div>
            <p className="text-[10px] font-mono text-slate-400 tracking-tight">
              TACTICAL HUD DRONE COCKPIT
            </p>
          </div>
        </div>

        {/* Center: Live Status Telemetry Pill */}
        <motion.div
          onClick={onOpenSettings}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="cursor-pointer flex items-center gap-2 px-4 py-1.5 rounded-lg bg-slate-900/90 border border-cyan-500/30 text-xs font-mono font-bold text-slate-200 shadow-[0_0_10px_rgba(6,182,212,0.15)] transition-all"
        >
          <span
            className={`w-2.5 h-2.5 rounded-full relative ${
              isConnected
                ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)] animate-pulse"
                : isConnecting
                ? "bg-amber-400 animate-ping"
                : "bg-rose-500"
            }`}
          />
          <span className="uppercase text-cyan-300">
            {isConnected ? "LINK ONLINE" : isConnecting ? "LINKING..." : "DISCONNECTED"}
          </span>
          <span className="text-slate-500 font-normal hidden md:inline">
            [{ip}]
          </span>
          <Sliders className="w-3.5 h-3.5 text-cyan-400 ml-1" />
        </motion.div>

        {/* Right Side: Quick Action Buttons */}
        <div className="flex items-center gap-2">
          {/* AI Console Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggleAi}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-bold transition-all border ${
              isAiOpen
                ? "bg-cyan-600 text-white border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.5)]"
                : "bg-slate-900/80 text-cyan-400 border-cyan-500/30 hover:bg-cyan-950/50"
            }`}
          >
            <Bot className="w-4 h-4 text-cyan-300" />
            <span className="hidden sm:inline">FRAME ANALYZER</span>
          </motion.button>

          {/* Settings Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpenSettings}
            className="p-2.5 rounded-xl bg-slate-900/80 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-950/50 transition-all"
            title="IP & Telemetry Settings"
          >
            <Settings className="w-4 h-4" />
          </motion.button>

          {/* Light / Dark Mode Switcher */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggleDarkMode}
            className="p-2.5 rounded-xl bg-slate-900/80 text-amber-400 border border-amber-500/30 hover:bg-amber-950/50 transition-all"
            title="Toggle Tactical HUD Color"
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-cyan-400" />
            )}
          </motion.button>
        </div>
      </div>
    </header>
  );
}


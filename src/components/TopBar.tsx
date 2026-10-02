"use client";

import { motion } from "framer-motion";
import { ConnectionStatus } from "@/hooks/useRoverWebSocket";
import { Wifi, Battery, Settings, ChevronDown, Activity } from "lucide-react";

interface TopBarProps {
  status: ConnectionStatus;
  ip: string;
  onOpenSettings: () => void;
}

export function TopBar({ status, ip, onOpenSettings }: TopBarProps) {
  const isConnected = status === "Connected";
  const isConnecting = status === "Connecting";

  return (
    <header className="w-full px-10 py-6 flex items-center justify-between z-30 shrink-0 select-none">
      {/* Brand Logo & Subtitle */}
      <div className="flex items-center gap-4">
        {/* Custom Alpho Triangle Geometric Logo Icon */}
        <div className="flex items-center justify-center">
          <svg className="w-10 h-10 text-slate-700 drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 22h6l4-8 4 8h6L12 2z" />
          </svg>
        </div>
        <div>
          <div className="flex items-baseline gap-1.5 engraved-text-dark">
            <span className="text-xl font-medium text-slate-600 tracking-tight">Alpho</span>
            <span className="text-xl font-medium text-slate-800 tracking-tight">RoverX</span>
          </div>
          <p className="text-[10px] font-bold tracking-[0.2em] text-slate-600 uppercase mt-0.5 engraved-text-dark">
            EXPLORE · CONTROL · SEE MORE
          </p>
        </div>
      </div>

      {/* Top Right Status Controls */}
      <div className="flex items-center gap-4">
        {/* Connection Status Dropdown Pill */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={onOpenSettings}
          className="flex items-center gap-2 px-4 py-2 rounded-full metal-button text-xs font-semibold text-slate-700 transition-all"
        >
          <span
            className={`w-2.5 h-2.5 rounded-full border border-white/50 ${
              isConnected
                ? "bg-blue-300 shadow-[0_0_8px_rgba(147,197,253,0.8)]"
                : isConnecting
                ? "bg-amber-400 animate-ping"
                : "bg-red-500"
            }`}
          />
          <span>{isConnected ? "Connected" : isConnecting ? "Connecting..." : "Disconnected"}</span>
          <ChevronDown className="w-4 h-4 text-slate-600" />
        </motion.button>

        {/* Wi-Fi Pill */}
        <div className="p-2.5 rounded-full metal-button text-slate-700">
          <Wifi className="w-4 h-4" />
        </div>

        {/* Battery Pill */}
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-full metal-button text-xs font-semibold text-slate-700">
          <Battery className="w-4 h-4 text-slate-700" />
          <span>78%</span>
        </div>

        {/* Settings Pill */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onOpenSettings}
          className="p-2.5 rounded-full metal-button text-slate-700 hover:text-slate-900 transition-all"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </motion.button>
      </div>
    </header>
  );
}

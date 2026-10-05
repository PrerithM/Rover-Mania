"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ConnectionStatus } from "@/hooks/useRoverWebSocket";
import { Wifi, Battery, Settings, ChevronDown, LogOut, Volume2, VolumeX } from "lucide-react";
import { cockpitAudio } from "@/utils/cockpitAudio";

interface TopBarProps {
  status: ConnectionStatus;
  ip: string;
  operatorName?: string;
  onOpenSettings: () => void;
  onLogout?: () => void;
}

export function TopBar({
  status,
  onOpenSettings,
  onLogout,
}: TopBarProps) {
  const isConnected = status === "Connected";
  const isConnecting = status === "Connecting";
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMuted, setIsMuted] = useState(() => cockpitAudio.getIsMuted());

  const handleToggleSound = () => {
    const muted = cockpitAudio.toggleMute();
    setIsMuted(muted);
  };

  const handleLogout = async () => {
    cockpitAudio.playTactileClick();
    setIsLoggingOut(true);
    if (onLogout) {
      onLogout();
      return;
    }
    try {
      await fetch("/api/auth", { method: "DELETE" });
    } catch {
      // ignore
    } finally {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <header className="w-full px-8 py-5 flex items-center justify-between z-30 shrink-0 select-none font-sans">
      {/* Brand Logo & Subtitle matching Image 2 */}
      <div className="flex items-center gap-3.5">
        {/* Custom Alpho Triangle Geometric Logo Icon */}
        <div className="flex items-center justify-center">
          <svg className="w-9 h-9 text-slate-700 drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 22h6l4-8 4 8h6L12 2z" />
          </svg>
        </div>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-medium tracking-tight text-slate-800 engraved-text-deep">
              Alpho RoverX
            </span>
          </div>
          <p className="text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase mt-0.5 engraved-text">
            EXPLORE · CONTROL · SEE MORE
          </p>
        </div>
      </div>

      {/* Top Right Status Controls matching Image 2 */}
      <div className="flex items-center gap-3 text-xs">
        {/* Connection Status Dropdown Pill */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => {
            cockpitAudio.playTactileClick();
            onOpenSettings();
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-full metal-button text-xs font-semibold text-slate-700 transition-all cursor-pointer"
        >
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isConnected
                ? "bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.9)]"
                : isConnecting
                ? "bg-amber-400 animate-ping"
                : "bg-red-500"
            }`}
          />
          <span className="engraved-text">
            {isConnected ? "Connected" : isConnecting ? "Connecting..." : "Disconnected"}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-500 engraved-icon" />
        </motion.button>

        {/* Audio Haptic Feedback Toggle Pill */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleToggleSound}
          className={`p-2.5 rounded-full metal-button text-slate-700 transition-all cursor-pointer ${
            !isMuted ? "border-blue-400/50 shadow-[0_0_8px_rgba(59,130,246,0.3)]" : "opacity-75"
          }`}
          title={isMuted ? "Sound Muted (Click to Enable)" : "Tactile Sound Enabled"}
        >
          {!isMuted ? (
            <Volume2 className="w-4 h-4 text-blue-600 engraved-icon" />
          ) : (
            <VolumeX className="w-4 h-4 text-slate-400 engraved-icon" />
          )}
        </motion.button>

        {/* Wi-Fi Pill */}
        <div
          onClick={() => cockpitAudio.playTactileClick(1.2)}
          className="p-2.5 rounded-full metal-button text-slate-700 cursor-pointer"
          title="Signal Strength"
        >
          <Wifi className="w-4 h-4 engraved-icon" />
        </div>

        {/* Battery Pill */}
        <div
          onClick={() => cockpitAudio.playTactileClick(1.1)}
          className="flex items-center gap-2 px-4 py-2 rounded-full metal-button text-xs font-semibold text-slate-700 cursor-pointer"
          title="Telemetry Battery"
        >
          <Battery className="w-4 h-4 engraved-icon text-slate-700" />
          <span className="engraved-text">78%</span>
        </div>

        {/* Settings Pill */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            cockpitAudio.playTactileClick();
            onOpenSettings();
          }}
          className="p-2.5 rounded-full metal-button text-slate-700 hover:text-slate-900 transition-all cursor-pointer"
          title="Hardware Endpoints Configuration"
        >
          <Settings className="w-4 h-4 engraved-icon" />
        </motion.button>

        {/* Logout Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full metal-button text-xs font-semibold text-slate-700 hover:text-rose-600 transition-all cursor-pointer disabled:opacity-50"
          title="Logout of Rover Cockpit"
        >
          {isLoggingOut ? (
            <span className="w-3.5 h-3.5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <LogOut className="w-3.5 h-3.5 text-rose-500 drop-shadow-[0_1px_0_rgba(255,255,255,0.9)]" />
          )}
          <span className="hidden sm:inline text-xs font-medium engraved-text">{isLoggingOut ? "Exit..." : "Logout"}</span>
        </motion.button>
      </div>
    </header>
  );
}

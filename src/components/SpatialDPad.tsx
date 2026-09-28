"use client";

import { motion } from "framer-motion";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Gauge, Radio } from "lucide-react";

interface SpatialDPadProps {
  activeDirection: string | null;
  setActiveDirection: (dir: string | null) => void;
  sendCommand: (left: number, right: number) => void;
  speedMultiplier: number;
  setSpeedMultiplier: (speed: number) => void;
  isCompact?: boolean;
}

export function SpatialDPad({
  activeDirection,
  setActiveDirection,
  sendCommand,
  speedMultiplier,
  setSpeedMultiplier,
  isCompact = false,
}: SpatialDPadProps) {
  const handlePointerDown =
    (dir: string, l: number, r: number) => (e: React.PointerEvent) => {
      e.preventDefault();
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch (err) {}
      setActiveDirection(dir);
      sendCommand(l, r);
    };

  const handlePointerUp = (e: React.PointerEvent) => {
    e.preventDefault();
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch (err) {}
    setActiveDirection(null);
    sendCommand(0, 0);
  };

  const getButtonClass = (dir: string) => {
    const isActive = activeDirection === dir;
    return `relative flex items-center justify-center rounded-2xl touch-none select-none transition-all duration-150 min-w-[44px] min-h-[44px] ${
      isCompact ? "w-12 h-12" : "w-16 h-16 sm:w-20 sm:h-20"
    } ${
      isActive
        ? "bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/40 scale-95 border border-blue-400/50 ring-4 ring-blue-500/25"
        : "bg-white/90 dark:bg-white/10 text-slate-900 dark:text-white hover:bg-white dark:hover:bg-white/20 shadow-md border border-slate-300/80 dark:border-white/15"
    }`;
  };

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      {/* Spatial Vector Visualizer Header */}
      {!isCompact && (
        <div className="w-full flex items-center justify-between px-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <span className="flex items-center gap-1.5">
            <Radio className={`w-3.5 h-3.5 ${activeDirection ? "text-blue-600 dark:text-blue-400 animate-pulse" : "text-slate-400"}`} />
            Vector: <span className="font-mono text-blue-700 dark:text-blue-400 uppercase font-bold">{activeDirection || "NEUTRAL"}</span>
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono font-bold tracking-wider">1:1 TOUCH TRACKING</span>
        </div>
      )}

      {/* 3D Spatial D-Pad Container */}
      <div className="relative grid grid-cols-3 gap-3 p-4 rounded-3xl apple-glass touch-none select-none shadow-2xl border border-white/60 dark:border-white/10">
        {/* Empty top-left */}
        <div />

        {/* UP Button */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          onPointerDown={handlePointerDown("up", 1.0, 1.0)}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className={getButtonClass("up")}
          aria-label="Drive Forward (W or Arrow Up)"
        >
          <ArrowUp className={isCompact ? "w-5 h-5" : "w-7 h-7 sm:w-8 sm:h-8 stroke-[2.5]"} />
          <span className="absolute bottom-1 text-[9px] font-mono font-bold text-slate-500 dark:text-slate-400">W</span>
        </motion.button>

        {/* Empty top-right */}
        <div />

        {/* LEFT Button */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          onPointerDown={handlePointerDown("left", -1.0, 1.0)}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className={getButtonClass("left")}
          aria-label="Steer Left (A or Arrow Left)"
        >
          <ArrowLeft className={isCompact ? "w-5 h-5" : "w-7 h-7 sm:w-8 sm:h-8 stroke-[2.5]"} />
          <span className="absolute bottom-1 text-[9px] font-mono font-bold text-slate-500 dark:text-slate-400">A</span>
        </motion.button>

        {/* DOWN Button */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          onPointerDown={handlePointerDown("down", -1.0, -1.0)}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className={getButtonClass("down")}
          aria-label="Drive Reverse (S or Arrow Down)"
        >
          <ArrowDown className={isCompact ? "w-5 h-5" : "w-7 h-7 sm:w-8 sm:h-8 stroke-[2.5]"} />
          <span className="absolute bottom-1 text-[9px] font-mono font-bold text-slate-500 dark:text-slate-400">S</span>
        </motion.button>

        {/* RIGHT Button */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          onPointerDown={handlePointerDown("right", 1.0, -1.0)}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className={getButtonClass("right")}
          aria-label="Steer Right (D or Arrow Right)"
        >
          <ArrowRight className={isCompact ? "w-5 h-5" : "w-7 h-7 sm:w-8 sm:h-8 stroke-[2.5]"} />
          <span className="absolute bottom-1 text-[9px] font-mono font-bold text-slate-500 dark:text-slate-400">D</span>
        </motion.button>
      </div>

      {/* Speed Throttle Slider */}
      {!isCompact && (
        <div className="w-full apple-glass px-4 py-3.5 rounded-2xl flex flex-col gap-2.5 shadow-lg border border-white/60 dark:border-white/10">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-800 dark:text-slate-200">
            <span className="flex items-center gap-1.5 font-bold">
              <Gauge className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Throttle Limit
            </span>
            <span className="text-blue-700 dark:text-blue-300 font-mono font-bold bg-blue-500/15 px-2.5 py-0.5 rounded-full border border-blue-500/30">
              {Math.round(speedMultiplier * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0.2"
            max="1.0"
            step="0.05"
            value={speedMultiplier}
            onChange={(e) => setSpeedMultiplier(parseFloat(e.target.value))}
            className="w-full accent-blue-600 dark:accent-blue-400 cursor-pointer h-2 bg-slate-300/80 dark:bg-slate-700/60 rounded-lg transition-all"
            aria-label="Speed Multiplier Throttle"
          />
        </div>
      )}
    </div>
  );
}

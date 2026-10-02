"use client";

import { motion } from "framer-motion";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Gauge, Radio, Shield, Disc } from "lucide-react";

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
    return `relative flex items-center justify-center rounded-2xl touch-none select-none transition-all duration-150 ${
      isCompact ? "w-11 h-11" : "w-14 h-14 sm:w-16 sm:h-16"
    } ${
      isActive
        ? "bg-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.9)] scale-95 border-2 border-white ring-4 ring-cyan-500/40"
        : "bg-slate-900/90 text-cyan-400 hover:bg-cyan-950/60 shadow-lg border border-cyan-500/30 hover:border-cyan-400"
    }`;
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Telemetry Vector Display Header */}
      {!isCompact && (
        <div className="w-full flex items-center justify-between px-2 font-mono text-xs font-bold text-slate-300 border-b border-cyan-500/20 pb-2">
          <span className="flex items-center gap-1.5">
            <Radio className={`w-3.5 h-3.5 ${activeDirection ? "text-cyan-400 animate-pulse" : "text-slate-500"}`} />
            VECTOR: <span className="text-cyan-400 font-extrabold uppercase">{activeDirection || "NEUTRAL"}</span>
          </span>
          <span className="text-[10px] text-amber-400 tracking-wider">TACTICAL MANEUVER</span>
        </div>
      )}

      {/* Circular Tactical D-Pad Pod matching Sketch */}
      <div className="relative p-6 rounded-full carbon-panel border-2 border-cyan-500/40 shadow-[0_0_30px_rgba(6,182,212,0.2)] touch-none select-none flex flex-col items-center justify-center">
        {/* Outer Circular Ring Accent */}
        <div className="absolute inset-1.5 rounded-full border border-dashed border-cyan-500/30 pointer-events-none animate-spin-slow" />
        
        {/* Grid Layout inside Pod */}
        <div className="relative grid grid-cols-3 gap-2.5 z-10 items-center justify-items-center">
          {/* Empty Top Left */}
          <div />

          {/* UP Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onPointerDown={handlePointerDown("up", 1.0, 1.0)}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className={getButtonClass("up")}
            aria-label="Drive Forward (W or Arrow Up)"
          >
            <ArrowUp className={isCompact ? "w-5 h-5 stroke-[2.5]" : "w-6 h-6 stroke-[3]"} />
            <span className="absolute bottom-0.5 text-[8px] font-mono font-bold text-amber-400">W</span>
          </motion.button>

          {/* Empty Top Right */}
          <div />

          {/* LEFT Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onPointerDown={handlePointerDown("left", -1.0, 1.0)}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className={getButtonClass("left")}
            aria-label="Steer Left (A or Arrow Left)"
          >
            <ArrowLeft className={isCompact ? "w-5 h-5 stroke-[2.5]" : "w-6 h-6 stroke-[3]"} />
            <span className="absolute bottom-0.5 text-[8px] font-mono font-bold text-amber-400">A</span>
          </motion.button>

          {/* CENTER Pod Emblem Indicator */}
          <div className="w-10 h-10 rounded-full bg-slate-950 border border-amber-500/50 flex items-center justify-center text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.3)]">
            <Disc className={`w-4 h-4 ${activeDirection ? "animate-spin text-cyan-400" : "text-amber-400"}`} />
          </div>

          {/* RIGHT Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onPointerDown={handlePointerDown("right", 1.0, -1.0)}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className={getButtonClass("right")}
            aria-label="Steer Right (D or Arrow Right)"
          >
            <ArrowRight className={isCompact ? "w-5 h-5 stroke-[2.5]" : "w-6 h-6 stroke-[3]"} />
            <span className="absolute bottom-0.5 text-[8px] font-mono font-bold text-amber-400">D</span>
          </motion.button>

          {/* Empty Bottom Left */}
          <div />

          {/* DOWN Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onPointerDown={handlePointerDown("down", -1.0, -1.0)}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className={getButtonClass("down")}
            aria-label="Drive Reverse (S or Arrow Down)"
          >
            <ArrowDown className={isCompact ? "w-5 h-5 stroke-[2.5]" : "w-6 h-6 stroke-[3]"} />
            <span className="absolute bottom-0.5 text-[8px] font-mono font-bold text-amber-400">S</span>
          </motion.button>

          {/* Empty Bottom Right */}
          <div />
        </div>
      </div>

      {/* Speed Throttle Slider */}
      {!isCompact && (
        <div className="w-full carbon-panel px-4 py-3 rounded-xl flex flex-col gap-2 border border-cyan-500/30">
          <div className="flex justify-between items-center text-xs font-mono font-bold text-slate-200">
            <span className="flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-amber-400" /> SPEED THROTTLE
            </span>
            <span className="text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/40">
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
            className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-900 rounded border border-cyan-500/30"
            aria-label="Speed Multiplier Throttle"
          />
        </div>
      )}
    </div>
  );
}


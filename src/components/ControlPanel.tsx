"use client";

import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Crosshair, Camera, Volume2 } from "lucide-react";
import { cockpitAudio } from "@/utils/cockpitAudio";

interface ControlPanelProps {
  activeDirection: string | null;
  setActiveDirection: (dir: string | null) => void;
  sendCommand: (left: number, right: number) => void;
  onCaptureSnapshot?: () => void;
}

export function ControlPanel({
  activeDirection,
  setActiveDirection,
  sendCommand,
  onCaptureSnapshot,
}: ControlPanelProps) {
  const wheelRef = useRef<HTMLDivElement>(null);
  const [dragRotation, setDragRotation] = useState<number | null>(null);
  const isDraggingRef = useRef(false);

  // Directional actuate handler
  const handleZonePress =
    (dir: "up" | "down" | "left" | "right", l: number, r: number) =>
    (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {}
      cockpitAudio.playDpadActuate(dir);
      setActiveDirection(dir);
      sendCommand(l, r);
    };

  const handleZoneRelease = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {}
    setActiveDirection(null);
    sendCommand(0, 0);
  };

  // Direct touch/pointer drag on the steering wheel
  const handleWheelPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    isDraggingRef.current = true;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    handleWheelPointerMove(e);
  };

  const handleWheelPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || !wheelRef.current) return;
    const rect = wheelRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;

    let angle = Math.atan2(dy, dx) * (180 / Math.PI) - 90;
    while (angle > 180) angle -= 360;
    while (angle < -180) angle += 360;

    // Clamp steering wheel rotation to ±35 degrees
    const clampedAngle = Math.max(-35, Math.min(35, angle));
    setDragRotation(clampedAngle);

    // Send corresponding motor steer commands
    if (clampedAngle < -10) {
      if (activeDirection !== "left") {
        cockpitAudio.playDpadActuate("left");
        setActiveDirection("left");
        sendCommand(-1.0, 1.0);
      }
    } else if (clampedAngle > 10) {
      if (activeDirection !== "right") {
        cockpitAudio.playDpadActuate("right");
        setActiveDirection("right");
        sendCommand(1.0, -1.0);
      }
    } else {
      if (activeDirection === "left" || activeDirection === "right") {
        setActiveDirection(null);
        sendCommand(0, 0);
      }
    }
  };

  const handleWheelPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setDragRotation(null);
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {}
    if (activeDirection === "left" || activeDirection === "right") {
      setActiveDirection(null);
      sendCommand(0, 0);
    }
  };

  // Determine actual rotation of steering wheel
  const getWheelRotation = () => {
    if (dragRotation !== null) return dragRotation;
    if (activeDirection === "left") return -26;
    if (activeDirection === "right") return 26;
    return 0;
  };

  const isLeftActive = activeDirection === "left";
  const isRightActive = activeDirection === "right";
  const isForwardActive = activeDirection === "up";
  const isReverseActive = activeDirection === "down";

  return (
    <div className="h-full w-full metal-panel metal-surface p-6 flex flex-col justify-between relative z-10 select-none">
      {/* Precision Hardware Screws at 4 Corners */}
      <div className="top-4 left-4 hardware-screw" />
      <div className="top-4 right-4 hardware-screw" />
      <div className="bottom-4 left-4 hardware-screw" />
      <div className="bottom-4 right-4 hardware-screw" />

      {/* Panel Header */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-medium tracking-tight engraved-text-deep">Control</h2>
          {/* Steering Telemetry Tag */}
          <div className="px-2.5 py-0.5 rounded-md text-[9px] font-mono font-bold tracking-wider uppercase border bg-slate-300/50 text-slate-700 border-slate-400/50 transition-colors">
            {isLeftActive
              ? "STEERING -26°"
              : isRightActive
              ? "STEERING +26°"
              : isForwardActive
              ? "FORWARD"
              : isReverseActive
              ? "REVERSE"
              : "CENTERED"}
          </div>
        </div>
        <p className="text-[11px] font-medium mt-0.5 engraved-text">Steering wheel control</p>
      </div>

      {/* Main Center: Proper Modern Sports Car Steering Wheel (No arrows, No horn) */}
      <div className="flex-1 my-2 flex items-center justify-center">
        {/* Recessed Circular Housing matching DrivePanel */}
        <div
          ref={wheelRef}
          onPointerDown={handleWheelPointerDown}
          onPointerMove={handleWheelPointerMove}
          onPointerUp={handleWheelPointerUp}
          onPointerCancel={handleWheelPointerUp}
          className="w-[14.5rem] h-[14.5rem] rounded-full metal-recess relative flex items-center justify-center p-2 touch-none cursor-grab active:cursor-grabbing"
        >
          {/* Rotating Modern Sports Steering Wheel Assembly */}
          <motion.div
            animate={{ rotate: getWheelRotation() }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="w-full h-full rounded-full relative flex items-center justify-center select-none"
          >
            {/* Outer Ergonomic Contoured Steering Rim */}
            <div
              className="absolute inset-0 rounded-full border-[18px] border-[#9ba8b8] shadow-[inset_0_3px_5px_rgba(0,0,0,0.65),inset_0_-2.5px_4px_rgba(255,255,255,0.7),0_5px_14px_rgba(15,23,42,0.32)] flex items-center justify-center"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 50% 50%, transparent 68%, rgba(15,23,42,0.35) 69%, rgba(255,255,255,0.18) 75%, transparent 76%), repeating-linear-gradient(45deg, rgba(15,23,42,0.06) 0px, rgba(15,23,42,0.06) 2px, transparent 2px, transparent 4px)",
              }}
            >
              {/* 12 o'clock Precision Centering Alignment Notch */}
              <div className="absolute top-0 w-2.5 h-4.5 bg-slate-900 shadow-[inset_0_1px_1px_rgba(0,0,0,0.8),0_1px_0_rgba(255,255,255,0.6)] rounded-xs -translate-y-1 z-20" />

              {/* Sculpted 10-and-2 o'clock Ergonomic Thumb Bolsters */}
              <div className="absolute top-3 left-4 w-3.5 h-7 rounded-full bg-slate-800/60 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)] -rotate-30" />
              <div className="absolute top-3 right-4 w-3.5 h-7 rounded-full bg-slate-800/60 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)] rotate-30" />
            </div>

            {/* Left Modern Sculpted Spoke (Steer Left Touch Zone) */}
            <motion.div
              onPointerDown={handleZonePress("left", -1.0, 1.0)}
              onPointerUp={handleZoneRelease}
              onPointerCancel={handleZoneRelease}
              animate={{
                scale: isLeftActive ? 0.95 : 1,
              }}
              className={`absolute left-3 w-16 h-10 rounded-xl metal-button flex items-center justify-start pl-2 border border-white/80 shadow-md cursor-pointer transition-colors z-20 ${
                isLeftActive ? "bg-slate-900/10 border-slate-700/60" : "hover:bg-black/5"
              }`}
              title="Steer Left"
              aria-label="Steer Left"
            >
              {/* Modern Minimalist Horizontal Thumb Roller Grip */}
              <div className="flex flex-col gap-1">
                <span className="w-5 h-1 rounded-full bg-slate-700/80 shadow-[inset_0_1px_1px_rgba(0,0,0,0.7)]" />
                <span className="w-6 h-1.5 rounded-full bg-slate-700/80 shadow-[inset_0_1px_1px_rgba(0,0,0,0.7)]" />
                <span className="w-5 h-1 rounded-full bg-slate-700/80 shadow-[inset_0_1px_1px_rgba(0,0,0,0.7)]" />
              </div>
            </motion.div>

            {/* Right Modern Sculpted Spoke (Steer Right Touch Zone) */}
            <motion.div
              onPointerDown={handleZonePress("right", 1.0, -1.0)}
              onPointerUp={handleZoneRelease}
              onPointerCancel={handleZoneRelease}
              animate={{
                scale: isRightActive ? 0.95 : 1,
              }}
              className={`absolute right-3 w-16 h-10 rounded-xl metal-button flex items-center justify-end pr-2 border border-white/80 shadow-md cursor-pointer transition-colors z-20 ${
                isRightActive ? "bg-slate-900/10 border-slate-700/60" : "hover:bg-black/5"
              }`}
              title="Steer Right"
              aria-label="Steer Right"
            >
              {/* Modern Minimalist Horizontal Thumb Roller Grip */}
              <div className="flex flex-col gap-1 items-end">
                <span className="w-5 h-1 rounded-full bg-slate-700/80 shadow-[inset_0_1px_1px_rgba(0,0,0,0.7)]" />
                <span className="w-6 h-1.5 rounded-full bg-slate-700/80 shadow-[inset_0_1px_1px_rgba(0,0,0,0.7)]" />
                <span className="w-5 h-1 rounded-full bg-slate-700/80 shadow-[inset_0_1px_1px_rgba(0,0,0,0.7)]" />
              </div>
            </motion.div>

            {/* Top Modern Spoke (Drive Forward Touch Zone) */}
            <motion.div
              onPointerDown={handleZonePress("up", 1.0, 1.0)}
              onPointerUp={handleZoneRelease}
              onPointerCancel={handleZoneRelease}
              animate={{
                scale: isForwardActive ? 0.95 : 1,
              }}
              className={`absolute top-3 w-10 h-14 rounded-xl metal-button flex flex-col items-center justify-start pt-1.5 border border-white/80 shadow-md cursor-pointer transition-colors z-20 ${
                isForwardActive ? "bg-slate-900/10 border-slate-700/60" : "hover:bg-black/5"
              }`}
              title="Drive Forward"
              aria-label="Drive Forward"
            >
              <div className="flex flex-col items-center gap-1">
                <span className="w-1.5 h-1 rounded-full bg-slate-700/80 shadow-[inset_0_1px_1px_rgba(0,0,0,0.7)]" />
                <span className="w-4 h-1 rounded-full bg-slate-700/80 shadow-[inset_0_1px_1px_rgba(0,0,0,0.7)]" />
              </div>
            </motion.div>

            {/* Bottom Split-Aluminum Motorsport Spoke (Reverse Touch Zone) */}
            <motion.div
              onPointerDown={handleZonePress("down", -1.0, -1.0)}
              onPointerUp={handleZoneRelease}
              onPointerCancel={handleZoneRelease}
              animate={{
                scale: isReverseActive ? 0.95 : 1,
              }}
              className={`absolute bottom-3 w-10 h-14 rounded-xl metal-button flex flex-col items-center justify-end pb-1.5 border border-white/80 shadow-md cursor-pointer transition-colors z-20 ${
                isReverseActive ? "bg-slate-900/10 border-slate-700/60" : "hover:bg-black/5"
              }`}
              title="Reverse"
              aria-label="Reverse"
            >
              {/* Twin Pillar CNC Milled Slotted Cutout */}
              <div className="w-4 h-5 rounded-xs bg-slate-800/80 border border-slate-600/50 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]" />
            </motion.div>

            {/* Center Lathe-Machined Aluminum Boss (Pure, Sleek, NO Horn text/icon) */}
            <div
              className="w-[4.75rem] h-[4.75rem] rounded-full border border-white/95 relative z-30 flex items-center justify-center select-none shadow-[0_4px_12px_rgba(15,23,42,0.25)]"
              style={{
                background:
                  "radial-gradient(circle at 35% 35%, #ffffff 0%, #f1f5f9 25%, #cbd5e1 70%, #94a3b8 100%)",
                boxShadow:
                  "inset 0 2px 2.5px rgba(255,255,255,0.98), inset 0 -2.5px 3.5px rgba(51,65,85,0.4), 0 4px 12px rgba(15,23,42,0.25)",
              }}
            >
              {/* Minimalist Precision Milled Metallic Emblem */}
              <div className="w-8 h-8 rounded-full border border-white/90 bg-gradient-to-b from-slate-200 to-slate-400 shadow-[inset_0_1px_1.5px_#ffffff,0_1px_2px_rgba(0,0,0,0.2)] flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-700/80 shadow-[inset_0_1px_1px_rgba(0,0,0,0.8),0_1px_0_rgba(255,255,255,0.8)]" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Utility Row: 3 Machined Metal Cockpit Buttons */}
      <div className="grid grid-cols-3 gap-3">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => cockpitAudio.playTactileClick(1.2)}
          className="p-3.5 rounded-xl metal-button engraved-text flex items-center justify-center transition-colors cursor-pointer"
          title="Targeting Crosshair"
          aria-label="Targeting Crosshair"
        >
          <Crosshair className="w-5 h-5 stroke-[2] engraved-icon" />
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            cockpitAudio.playCameraShutter();
            onCaptureSnapshot?.();
          }}
          className="p-3.5 rounded-xl metal-button engraved-text flex items-center justify-center transition-colors cursor-pointer"
          title="Camera Snapshot"
          aria-label="Camera Snapshot"
        >
          <Camera className="w-5 h-5 stroke-[2] engraved-icon" />
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => cockpitAudio.playHornSignal()}
          className="p-3.5 rounded-xl metal-button engraved-text flex items-center justify-center transition-colors cursor-pointer"
          title="Audio Horn Signal"
          aria-label="Audio Horn"
        >
          <Volume2 className="w-5 h-5 stroke-[2] engraved-icon" />
        </motion.button>
      </div>
    </div>
  );
}

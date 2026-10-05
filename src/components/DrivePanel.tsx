"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronUp, ChevronDown } from "lucide-react";
import { cockpitAudio } from "@/utils/cockpitAudio";

interface DrivePanelProps {
  speedMultiplier: number;
  setSpeedMultiplier: (speed: number | ((prev: number) => number)) => void;
  onEmergencyStop: () => void;
}

export function DrivePanel({
  speedMultiplier,
  setSpeedMultiplier,
  onEmergencyStop,
}: DrivePanelProps) {
  const currentSpeedPercent = Math.round(speedMultiplier * 100);
  const isHighSpeed = currentSpeedPercent > 85;

  // Normalized speed factor: 0.1 (10%) to 1.0 (100%)
  const speedFraction = Math.max(0, Math.min(1, (speedMultiplier - 0.1) / 0.9));

  // Automotive gauge angle: 240-degree arc from 150° (bottom-left) to 390° (bottom-right)
  const START_ANGLE = 150;
  const SWEEP_ANGLE = 240;
  const needleAngle = START_ANGLE + speedFraction * SWEEP_ANGLE;

  const [isDragging, setIsDragging] = useState(false);
  const [isBrakeDepressed, setIsBrakeDepressed] = useState(false);
  const [isGasDepressed, setIsGasDepressed] = useState(false);

  const dialRef = useRef<HTMLDivElement>(null);
  const lastSoundPercentRef = useRef<number>(currentSpeedPercent);
  const accelTimerRef = useRef<NodeJS.Timeout | null>(null);
  const decelTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Play subtle mechanical detent tick every 5%
  const triggerAudioTick = useCallback((speedVal: number) => {
    const pct = Math.round(speedVal * 100);
    if (Math.abs(pct - lastSoundPercentRef.current) >= 5) {
      cockpitAudio.playSliderNotch(650 + speedVal * 850);
      lastSoundPercentRef.current = pct;
    }
  }, []);

  // Calculate speed from pointer position on the circular dial
  const updateSpeedFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      if (!dialRef.current) return;
      const rect = dialRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = clientX - centerX;
      const dy = clientY - centerY;

      let angle = Math.atan2(dy, dx) * (180 / Math.PI);
      if (angle < 0) angle += 360;

      let relAngle = angle - START_ANGLE;
      if (relAngle < 0) relAngle += 360;

      let fraction: number;
      if (relAngle <= SWEEP_ANGLE) {
        fraction = relAngle / SWEEP_ANGLE;
      } else {
        fraction = relAngle > SWEEP_ANGLE + (360 - SWEEP_ANGLE) / 2 ? 0 : 1;
      }

      const rawSpeed = 0.1 + fraction * 0.9;
      const clampedSpeed = Math.min(1.0, Math.max(0.1, Math.round(rawSpeed * 100) / 100));

      triggerAudioTick(clampedSpeed);
      setSpeedMultiplier(clampedSpeed);
    },
    [setSpeedMultiplier, triggerAudioTick]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    updateSpeedFromPointer(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.preventDefault();
    updateSpeedFromPointer(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {}
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowUp" || e.key === "ArrowRight") {
      e.preventDefault();
      nudgeAccel();
    } else if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
      e.preventDefault();
      nudgeDecel();
    } else if (e.key === "PageUp") {
      e.preventDefault();
      const next = Math.min(1.0, Math.round((speedMultiplier + 0.2) * 100) / 100);
      cockpitAudio.playSliderNotch(700 + next * 800);
      setSpeedMultiplier(next);
    } else if (e.key === "PageDown") {
      e.preventDefault();
      const next = Math.max(0.1, Math.round((speedMultiplier - 0.2) * 100) / 100);
      cockpitAudio.playSliderNotch(700 + next * 800);
      setSpeedMultiplier(next);
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.05 : -0.05;
    const next = Math.min(1.0, Math.max(0.1, Math.round((speedMultiplier + delta) * 100) / 100));
    if (next !== speedMultiplier) {
      cockpitAudio.playSliderNotch(700 + next * 800);
      setSpeedMultiplier(next);
    }
  };

  // Smooth Acceleration Pedal Action
  const nudgeAccel = () => {
    cockpitAudio.playTactileClick(1.2);
    setSpeedMultiplier((prev) => {
      const next = Math.min(1.0, Math.round((prev + 0.04) * 100) / 100);
      triggerAudioTick(next);
      return next;
    });
  };

  const startContinuousAccel = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsGasDepressed(true);
    nudgeAccel();

    if (accelTimerRef.current) clearInterval(accelTimerRef.current);
    accelTimerRef.current = setInterval(() => {
      setSpeedMultiplier((prev) => {
        if (prev >= 1.0) {
          if (accelTimerRef.current) clearInterval(accelTimerRef.current);
          return 1.0;
        }
        const next = Math.min(1.0, Math.round((prev + 0.02) * 100) / 100);
        triggerAudioTick(next);
        return next;
      });
    }, 75);
  };

  const stopContinuousAccel = () => {
    setIsGasDepressed(false);
    if (accelTimerRef.current) {
      clearInterval(accelTimerRef.current);
      accelTimerRef.current = null;
    }
  };

  // Smooth Brake Pedal Action
  const nudgeDecel = () => {
    cockpitAudio.playTactileClick(0.85);
    setSpeedMultiplier((prev) => {
      const next = Math.max(0.1, Math.round((prev - 0.04) * 100) / 100);
      triggerAudioTick(next);
      return next;
    });
  };

  const startContinuousDecel = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsBrakeDepressed(true);
    nudgeDecel();

    if (decelTimerRef.current) clearInterval(decelTimerRef.current);
    decelTimerRef.current = setInterval(() => {
      setSpeedMultiplier((prev) => {
        if (prev <= 0.1) {
          if (decelTimerRef.current) clearInterval(decelTimerRef.current);
          return 0.1;
        }
        const next = Math.max(0.1, Math.round((prev - 0.02) * 100) / 100);
        triggerAudioTick(next);
        return next;
      });
    }, 75);
  };

  const stopContinuousDecel = () => {
    setIsBrakeDepressed(false);
    if (decelTimerRef.current) {
      clearInterval(decelTimerRef.current);
      decelTimerRef.current = null;
    }
  };

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (accelTimerRef.current) clearInterval(accelTimerRef.current);
      if (decelTimerRef.current) clearInterval(decelTimerRef.current);
    };
  }, []);

  // Speedometer numeral color: Clean, crisp, NO blue, NO glow. Red ONLY when > 85%
  const getSpeedNumberColor = () => {
    if (isHighSpeed) {
      return "text-red-600";
    }
    return "text-slate-900 engraved-text-deep";
  };

  // SVG coordinates for speedometer dial
  const polarToCartesian = (cx: number, cy: number, r: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: cx + r * Math.cos(angleInRadians),
      y: cy + r * Math.sin(angleInRadians),
    };
  };

  const describeArc = (cx: number, cy: number, r: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(cx, cy, r, endAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return ["M", start.x, start.y, "A", r, r, 0, largeArcFlag, 0, end.x, end.y].join(" ");
  };

  const svgStartAngle = 240;
  const currentSvgEndAngle = svgStartAngle + speedFraction * SWEEP_ANGLE;
  const redlineStartAngle = svgStartAngle + 0.833 * SWEEP_ANGLE; // ~85% mark

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
          <h2 className="text-xl font-medium tracking-tight engraved-text-deep">Drive</h2>
          {/* Drive Mode Tag (NO glow, NO blue) */}
          <div
            className={`px-2.5 py-0.5 rounded-md text-[9px] font-mono font-bold tracking-wider uppercase border transition-colors ${
              isHighSpeed
                ? "bg-red-500/10 text-red-600 border-red-500/40"
                : "bg-slate-300/50 text-slate-700 border-slate-400/50"
            }`}
          >
            {isHighSpeed ? "REDLINE" : "DRIVE"}
          </div>
        </div>
        <p className="text-[11px] font-medium mt-0.5 engraved-text">Throttle & Speedometer</p>
      </div>

      {/* Main Center: Clean Mechanical Speedometer Gauge (NO Glow, NO Blue) */}
      <div className="flex-1 my-2 flex items-center justify-center">
        {/* Recessed Circular Housing */}
        <div
          ref={dialRef}
          tabIndex={0}
          role="slider"
          aria-label="Rover Speedometer Throttle"
          aria-valuenow={currentSpeedPercent}
          aria-valuemin={10}
          aria-valuemax={100}
          onKeyDown={handleKeyDown}
          onWheel={handleWheel}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="w-[14.5rem] h-[14.5rem] rounded-full metal-recess relative flex items-center justify-center p-2 cursor-pointer touch-none outline-none focus:ring-1 focus:ring-slate-500"
        >
          {/* Lathe-Turned Metallic Gauge Face */}
          <div className="w-full h-full rounded-full metal-dpad relative flex items-center justify-center overflow-hidden">
            {/* SVG Speedometer Scale, Redline Zone, and Tick Markings */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-10"
              viewBox="0 0 240 240"
            >
              {/* Outer Gauge Track Groove */}
              <path
                d={describeArc(120, 120, 92, svgStartAngle, svgStartAngle + SWEEP_ANGLE)}
                fill="none"
                stroke="rgba(51, 65, 85, 0.35)"
                strokeWidth="5"
                strokeLinecap="round"
              />

              {/* Redline Sector Arc (>85%) */}
              <path
                d={describeArc(120, 120, 92, redlineStartAngle, svgStartAngle + SWEEP_ANGLE)}
                fill="none"
                stroke={isHighSpeed ? "#dc2626" : "rgba(220, 38, 38, 0.6)"}
                strokeWidth="5"
                strokeLinecap="round"
                className="transition-colors duration-150"
              />

              {/* Active Mechanical Throttle Arc (Solid Dark Slate / Red, Zero Glow, Zero Blue) */}
              {speedFraction > 0.02 && (
                <path
                  d={describeArc(120, 120, 92, svgStartAngle, currentSvgEndAngle)}
                  fill="none"
                  stroke={isHighSpeed ? "#dc2626" : "#334155"}
                  strokeWidth="5"
                  strokeLinecap="round"
                  className="transition-colors duration-150"
                />
              )}

              {/* Mechanical Radial Gauge Tick Marks (0 to 100) */}
              {[...Array(21)].map((_, i) => {
                const tickPct = i * 5;
                const isMajor = i % 4 === 0; // 0, 20, 40, 60, 80, 100
                const isRedline = tickPct >= 85;
                const tickAngle = svgStartAngle + (i / 20) * SWEEP_ANGLE;

                const outerR = 98;
                const innerR = isMajor ? 82 : 88;

                const pOuter = polarToCartesian(120, 120, outerR, tickAngle);
                const pInner = polarToCartesian(120, 120, innerR, tickAngle);
                const pText = isMajor ? polarToCartesian(120, 120, 71, tickAngle) : null;

                return (
                  <g key={i}>
                    <line
                      x1={pInner.x}
                      y1={pInner.y}
                      x2={pOuter.x}
                      y2={pOuter.y}
                      stroke={
                        isRedline
                          ? isHighSpeed
                            ? "#dc2626"
                            : "rgba(220, 38, 38, 0.85)"
                          : isMajor
                          ? "#1e293b"
                          : "#64748b"
                      }
                      strokeWidth={isMajor ? (isRedline ? "2.5" : "2") : "1"}
                      strokeLinecap="round"
                    />
                    {isMajor && pText && (
                      <text
                        x={pText.x}
                        y={pText.y + 3}
                        textAnchor="middle"
                        fontSize="9"
                        fontWeight="700"
                        fontFamily="monospace"
                        fill={isRedline ? "#dc2626" : "#1e293b"}
                        className="select-none"
                      >
                        {tickPct}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Clean Mechanical Tachometer Needle (Zero Blur/Glow) */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
              style={{
                transform: `rotate(${needleAngle}deg)`,
                transition: isDragging ? "none" : "transform 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              {/* Needle Blade */}
              <div
                className={`w-[78px] h-[3px] rounded-full origin-left transition-colors duration-150 relative ${
                  isHighSpeed
                    ? "bg-gradient-to-r from-red-700 via-red-600 to-rose-400"
                    : "bg-gradient-to-r from-slate-900 via-slate-700 to-slate-400"
                }`}
                style={{
                  transform: "translateX(24px)",
                }}
              >
                {/* Needle Tip Arrow */}
                <div
                  className={`absolute -right-1 -top-[3px] w-2 h-2 rotate-45 rounded-xs ${
                    isHighSpeed ? "bg-red-600" : "bg-slate-800"
                  }`}
                />
              </div>

              {/* Counter-Weight Needle Tail */}
              <div className="w-[18px] h-[4px] rounded-full bg-slate-700 -translate-x-5 shadow-[0_1px_1px_rgba(0,0,0,0.5)]" />
            </div>

            {/* Center Lathe-Machined Aluminum Hub (Displays Big Numbers Inside) */}
            <div
              className="w-[6.25rem] h-[6.25rem] rounded-full border border-white/90 relative z-30 flex flex-col items-center justify-center select-none cursor-grab active:cursor-grabbing"
              style={{
                background:
                  "radial-gradient(circle at 35% 35%, #ffffff 0%, #f1f5f9 25%, #cbd5e1 70%, #94a3b8 100%)",
                boxShadow:
                  "inset 0 2px 2.5px rgba(255,255,255,0.95), inset 0 -2.5px 3.5px rgba(51,65,85,0.4), 0 5px 14px rgba(15,23,42,0.25)",
              }}
            >
              {/* Big Speed Numbers (NO glow, NO blue) */}
              <div className="flex items-baseline justify-center">
                <span
                  className={`text-4xl font-black font-mono tracking-tighter tabular-nums leading-none select-none transition-colors duration-150 ${getSpeedNumberColor()}`}
                >
                  {currentSpeedPercent}
                </span>
                <span
                  className={`text-xs font-mono font-bold ml-0.5 uppercase transition-colors duration-150 ${
                    isHighSpeed ? "text-red-600" : "text-slate-600"
                  }`}
                >
                  %
                </span>
              </div>

              <span className="text-[8px] font-bold tracking-widest uppercase text-slate-500 engraved-text mt-0.5">
                SPEED
              </span>

              <span
                className={`text-[8px] font-mono font-semibold transition-colors duration-150 ${
                  isHighSpeed ? "text-red-700 font-bold" : "text-slate-700"
                }`}
              >
                {speedMultiplier.toFixed(2)}x
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Automotive Pedals Console: Elongated Brake & Accelerator (Handbrake Removed) */}
      <div className="grid grid-cols-2 gap-4 items-end pt-1">
        {/* 1. ELONGATED BRAKE PEDAL */}
        <motion.div
          animate={{
            y: isBrakeDepressed ? 4 : 0,
            scale: isBrakeDepressed ? 0.97 : 1,
          }}
          transition={{ duration: 0.08 }}
          onPointerDown={startContinuousDecel}
          onPointerUp={stopContinuousDecel}
          onPointerLeave={stopContinuousDecel}
          onPointerCancel={stopContinuousDecel}
          className="h-[5.5rem] rounded-2xl metal-button p-3 flex flex-col justify-between items-center transition-shadow cursor-pointer border border-white/95 select-none shadow-[inset_0_2px_1px_#ffffff,0_4px_10px_rgba(15,23,42,0.22)] active:shadow-[inset_0_3px_6px_rgba(15,23,42,0.4)]"
          title="Press or Hold Brake Pedal to Decelerate"
          aria-label="Brake Pedal"
        >
          {/* Vertical Heavy-Duty Rubber Traction Grips */}
          <div className="w-full flex justify-center gap-1.5 my-1">
            <span className="w-2 h-7 rounded-full bg-slate-800/85 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8),0_1px_0_rgba(255,255,255,0.7)]" />
            <span className="w-2 h-7 rounded-full bg-slate-800/85 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8),0_1px_0_rgba(255,255,255,0.7)]" />
            <span className="w-2 h-7 rounded-full bg-slate-800/85 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8),0_1px_0_rgba(255,255,255,0.7)]" />
          </div>

          <div className="w-full flex flex-col items-center gap-0.5">
            <div className="flex items-center gap-1 text-slate-800">
              <ChevronDown className="w-3.5 h-3.5 stroke-[2.8]" />
              <span className="font-black text-[10px] tracking-wider uppercase engraved-text-deep">
                BRAKE
              </span>
            </div>
            <span className="text-[8px] font-mono text-slate-500 font-semibold tracking-tight">
              HOLD TO DECEL
            </span>
          </div>
        </motion.div>

        {/* 2. ELONGATED ACCELERATOR (GAS) PEDAL */}
        <motion.div
          animate={{
            y: isGasDepressed ? 4 : 0,
            scale: isGasDepressed ? 0.97 : 1,
          }}
          transition={{ duration: 0.08 }}
          onPointerDown={startContinuousAccel}
          onPointerUp={stopContinuousAccel}
          onPointerLeave={stopContinuousAccel}
          onPointerCancel={stopContinuousAccel}
          className="h-[5.5rem] rounded-2xl metal-button p-3 flex flex-col justify-between items-center transition-shadow cursor-pointer border border-white/95 select-none shadow-[inset_0_2px_1px_#ffffff,0_4px_10px_rgba(15,23,42,0.22)] active:shadow-[inset_0_3px_6px_rgba(15,23,42,0.4)]"
          title="Press or Hold Gas Pedal to Accelerate"
          aria-label="Accelerator Pedal"
        >
          {/* Horizontal Heavy-Duty Rubber Traction Grips */}
          <div className="w-full flex flex-col items-center gap-1.5 my-1">
            <span className="w-12 h-1.5 rounded-full bg-slate-800/85 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8),0_1px_0_rgba(255,255,255,0.7)]" />
            <span className="w-12 h-1.5 rounded-full bg-slate-800/85 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8),0_1px_0_rgba(255,255,255,0.7)]" />
            <span className="w-12 h-1.5 rounded-full bg-slate-800/85 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8),0_1px_0_rgba(255,255,255,0.7)]" />
          </div>

          <div className="w-full flex flex-col items-center gap-0.5">
            <div className="flex items-center gap-1 text-slate-800">
              <ChevronUp className="w-3.5 h-3.5 stroke-[2.8]" />
              <span className="font-black text-[10px] tracking-wider uppercase engraved-text-deep">
                ACCEL
              </span>
            </div>
            <span className="text-[8px] font-mono text-slate-500 font-semibold tracking-tight">
              HOLD TO SPEED UP
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

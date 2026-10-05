"use client";

import { RefObject } from "react";
import { motion } from "framer-motion";
import { Maximize2, Minimize2, Camera, RefreshCw, AlertCircle } from "lucide-react";
import { cockpitAudio } from "@/utils/cockpitAudio";

interface VisorFeedProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  isVideoLive: boolean;
  streamError: string | null;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onReloadStream: () => void;
  onCaptureSnapshot?: () => void;
}

export function VisorFeed({
  videoRef,
  canvasRef,
  isVideoLive,
  streamError,
  isFullscreen,
  onToggleFullscreen,
  onReloadStream,
  onCaptureSnapshot,
}: VisorFeedProps) {
  return (
    <div
      className={`select-none transition-all duration-300 ${
        isFullscreen
          ? "fixed inset-0 z-50 metal-deck flex flex-col p-6"
          : "h-full w-full metal-panel metal-surface p-4 flex flex-col justify-between relative z-10"
      }`}
    >
      {/* Hidden canvas for snapshot extraction */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Hardware Screws at 4 Corners (when not fullscreen) */}
      {!isFullscreen && (
        <>
          <div className="top-3.5 left-4 hardware-screw" />
          <div className="top-3.5 right-4 hardware-screw" />
          <div className="bottom-3.5 left-4 hardware-screw" />
          <div className="bottom-3.5 right-4 hardware-screw" />
        </>
      )}

      {/* Top Monitor Header Bar */}
      <div className="flex items-center justify-between pb-3 px-2 z-20 shrink-0">
        {/* Simple Camera Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full metal-button">
            <span
              className={`w-2 h-2 rounded-full ${
                isVideoLive
                  ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.9)] animate-pulse"
                  : "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"
              }`}
            />
            <span className="text-[11px] font-bold tracking-wider text-slate-800 engraved-text uppercase">
              {isVideoLive ? "Camera · Live" : "Camera · Standby"}
            </span>
          </div>

          <span className="hidden sm:inline text-[11px] font-medium text-slate-500 engraved-text">
            Front View
          </span>
        </div>

        {/* Clean Controls */}
        <div className="flex items-center gap-2">
          {/* Reconnect Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              cockpitAudio.playTactileClick();
              onReloadStream();
            }}
            className="p-1.5 sm:px-3 sm:py-1.5 rounded-full metal-button text-xs font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer"
            title="Reconnect Camera"
          >
            <RefreshCw className="w-3.5 h-3.5 engraved-icon" />
            <span className="hidden sm:inline engraved-text text-[11px]">Reconnect</span>
          </motion.button>

          {/* Snapshot Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              cockpitAudio.playCameraShutter();
              onCaptureSnapshot?.();
            }}
            className="p-1.5 sm:px-3 sm:py-1.5 rounded-full metal-button text-xs font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer"
            title="Take Photo"
          >
            <Camera className="w-3.5 h-3.5 engraved-icon" />
            <span className="hidden sm:inline engraved-text text-[11px]">Snapshot</span>
          </motion.button>

          {/* Fullscreen Toggle */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              cockpitAudio.playTactileClick(1.1);
              onToggleFullscreen();
            }}
            className="p-1.5 sm:p-2 rounded-full metal-button text-slate-700 hover:text-slate-900 cursor-pointer"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Mode"}
          >
            {isFullscreen ? (
              <Minimize2 className="w-3.5 h-3.5 engraved-icon" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5 engraved-icon" />
            )}
          </motion.button>
        </div>
      </div>

      {/* Recessed Brushed Metal Camera Cavity */}
      <div className="flex-1 w-full rounded-2xl metal-screen-cavity overflow-hidden relative min-h-[260px] flex items-center justify-center">
        {/* Live Video Element */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover transition-opacity duration-500 ${
            isVideoLive ? "opacity-100" : "opacity-0 absolute pointer-events-none"
          }`}
        />

        {/* Standby / Offline State (100% Matching Brushed Metal Aesthetic) */}
        {!isVideoLive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center gap-3 z-10">
            {/* Concentric Brushed Metal Camera Shutter Dial */}
            <div className="w-20 h-20 rounded-full metal-dpad p-1.5 flex items-center justify-center relative shadow-[0_8px_20px_rgba(15,23,42,0.25)]">
              {/* Central Raised Metallic Hub */}
              <div className="w-11 h-11 rounded-full metal-button flex items-center justify-center shadow-md">
                {streamError ? (
                  <AlertCircle className="w-5 h-5 text-amber-600 engraved-icon" />
                ) : (
                  <Camera className="w-5 h-5 text-slate-700 engraved-icon" />
                )}
              </div>
            </div>

            {/* Simple, Friendly Status & Description */}
            <div className="flex flex-col items-center gap-1 z-10">
              {/* Status Pill */}
              <div className="flex items-center gap-2 px-3 py-0.5 rounded-full metal-button shadow-sm">
                <span
                  className={`w-2 h-2 rounded-full ${
                    streamError ? "bg-amber-500" : "bg-emerald-500"
                  } animate-pulse`}
                />
                <span className="text-[11px] font-semibold text-slate-700 engraved-text">
                  {streamError ? "Camera Offline" : "Connecting..."}
                </span>
              </div>

              <h3 className="text-sm font-semibold tracking-tight text-slate-800 engraved-text-deep mt-0.5">
                {streamError ? "Camera Disconnected" : "Looking for Camera Feed"}
              </h3>

              <p className="text-xs text-slate-600 engraved-text max-w-sm">
                {streamError || "Make sure the rover is turned on and connected."}
              </p>
            </div>

            {/* Tactile Aluminum Reconnect Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                cockpitAudio.playTactileClick();
                onReloadStream();
              }}
              className="mt-1 px-5 py-2 rounded-full metal-button text-xs font-semibold text-slate-800 flex items-center gap-2 cursor-pointer shadow-md z-10"
            >
              <RefreshCw className="w-3.5 h-3.5 engraved-icon" />
              <span className="engraved-text">Reconnect</span>
            </motion.button>
          </div>
        )}

        {/* Framing Guides (Hairline silver/slate ticks) */}
        <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-slate-500/40 rounded-tl-sm pointer-events-none" />
        <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-slate-500/40 rounded-tr-sm pointer-events-none" />
        <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-slate-500/40 rounded-bl-sm pointer-events-none" />
        <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-slate-500/40 rounded-br-sm pointer-events-none" />

        {/* Bottom Simple Metal Pills */}
        <div className="absolute bottom-3 inset-x-4 flex items-center justify-between pointer-events-none z-10">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full metal-button text-[11px] font-medium text-slate-700 shadow-sm pointer-events-auto">
            <Camera className="w-3.5 h-3.5 engraved-icon" />
            <span className="engraved-text font-semibold">Front Camera</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 rounded-full metal-button text-[11px] font-medium text-slate-700 shadow-sm pointer-events-auto">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isVideoLive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
              }`}
            />
            <span className="engraved-text">Live View</span>
          </div>
        </div>
      </div>
    </div>
  );
}

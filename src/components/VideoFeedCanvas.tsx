"use client";

import { motion } from "framer-motion";
import { Maximize2, Minimize2, Camera, RefreshCw, Radio } from "lucide-react";
import { RefObject } from "react";

interface VideoFeedCanvasProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  isVideoLive: boolean;
  streamError: string | null;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onReloadStream: () => void;
  onCaptureSnapshot?: () => void;
  children?: React.ReactNode;
}

export function VideoFeedCanvas({
  videoRef,
  canvasRef,
  isVideoLive,
  streamError,
  isFullscreen,
  onToggleFullscreen,
  onReloadStream,
  onCaptureSnapshot,
  children,
}: VideoFeedCanvasProps) {
  return (
    <div className="relative w-full flex flex-col items-center select-none">
      {/* Hidden canvas for snapshot frame extraction */}
      <canvas ref={canvasRef} className="hidden" />

      {/* SVG Clip Path Definition */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          <clipPath id="visorLensClip" clipPathUnits="objectBoundingBox">
            <path d="M 0.08,0 L 0.92,0 C 0.96,0 1,0.05 1,0.12 L 0.98,0.68 C 0.96,0.82 0.85,0.85 0.64,0.85 L 0.58,0.85 L 0.50,1.00 L 0.42,0.85 L 0.36,0.85 C 0.15,0.85 0.04,0.82 0.02,0.68 L 0,0.12 C 0,0.05 0.04,0 0.08,0 Z" />
          </clipPath>
        </defs>
      </svg>

      {/* Visor Frame Outer Wrapper */}
      <div
        className={`relative transition-all duration-300 ${
          isFullscreen
            ? "fixed inset-0 z-50 bg-slate-950 flex items-center justify-center p-4"
            : "w-full max-w-4xl aspect-[16/9] relative"
        }`}
      >
        {/* Top Header Label directly on the top bezel: "ALPHA Drive X" */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
          <div className="px-6 py-1 rounded-b-xl bg-slate-950/90 border-x-2 border-b-2 border-cyan-400 shadow-[0_0_15px_rgba(56,189,248,0.4)] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs sm:text-sm font-black font-mono tracking-widest text-cyan-300 uppercase">
              ALPHA Drive X
            </span>
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          </div>
        </div>

        {/* Clipped Camera Stream Container */}
        <div
          className="w-full h-full relative overflow-hidden bg-slate-950 shadow-[0_0_30px_rgba(56,189,248,0.2)]"
          style={{ clipPath: "url(#visorLensClip)" }}
        >
          {/* Live WebRTC Video Element */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover pointer-events-none filter saturate-110 brightness-105"
          />

          {/* Stream Offline / Loading Overlay */}
          {!isVideoLive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-slate-950/90 text-cyan-200 text-center gap-3 z-10 font-mono">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                className="w-12 h-12 rounded-full border-2 border-dashed border-cyan-400/40 border-t-cyan-400 flex items-center justify-center"
              >
                <Radio className="w-5 h-5 text-cyan-400" />
              </motion.div>
              <div className="max-w-xs">
                <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                  {streamError ? "SIGNAL OFFLINE" : "CONNECTING HUD STREAM..."}
                </h3>
                <p className="text-[10px] text-slate-400 mt-1">
                  {streamError || "Establishing WebRTC peer connection..."}
                </p>
              </div>
              <button
                onClick={onReloadStream}
                className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs shadow-[0_0_12px_rgba(56,189,248,0.4)] transition-all uppercase"
              >
                <RefreshCw className="w-3.5 h-3.5" /> RE-SYNC
              </button>
            </div>
          )}

          {/* HUD Targeting Reticle */}
          {isVideoLive && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-70">
              <div className="w-16 h-16 rounded-full border border-cyan-400/40 flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-amber-400 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.9)]" />
              </div>
              <div className="absolute w-24 h-[1px] bg-cyan-400/30" />
              <div className="absolute h-24 w-[1px] bg-cyan-400/30" />
            </div>
          )}

          {/* Floating Controls Inside Visor Viewport */}
          <div className="absolute top-4 right-6 z-20 flex items-center gap-2 pointer-events-auto">
            {onCaptureSnapshot && (
              <button
                onClick={onCaptureSnapshot}
                className="p-1.5 rounded-lg bg-slate-950/80 text-cyan-400 border border-cyan-500/40 hover:bg-cyan-950 transition-all shadow-md"
                title="Snapshot Frame"
              >
                <Camera className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onToggleFullscreen}
              className="p-1.5 rounded-lg bg-slate-950/80 text-cyan-400 border border-cyan-500/40 hover:bg-cyan-950 transition-all shadow-md"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* SVG Border Overlay fitting the SVG Clip Path */}
        <svg
          viewBox="0 0 1000 562.5"
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
        >
          <path
            d="M 80,0 L 920,0 C 960,0 1000,28 1000,67.5 L 980,382.5 C 960,461.25 850,478.125 640,478.125 L 580,478.125 L 500,562.5 L 420,478.125 L 360,478.125 C 150,478.125 40,461.25 20,382.5 L 0,67.5 C 0,28 40,0 80,0 Z"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="3"
            className="filter drop-shadow-[0_0_12px_rgba(56,189,248,0.8)]"
          />
        </svg>

        {children}
      </div>
    </div>
  );
}



"use client";

import { RefObject } from "react";
import { motion } from "framer-motion";
import { Maximize2, Minimize2, Video, Image, Sliders, Radio, RefreshCw } from "lucide-react";

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
  const sunglassPath = "M 40 10 L 960 10 Q 990 10 990 40 L 990 380 Q 990 540 850 510 Q 700 480 600 430 Q 550 410 500 410 Q 450 410 400 430 Q 300 480 150 510 Q 10 540 10 380 L 10 40 Q 10 10 40 10 Z";

  return (
    <div className="relative w-full h-full mx-auto select-none flex items-center justify-center">
      {/* Hidden canvas for snapshot extraction */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Visor Video Feed Masked Container */}
      <div
        className={`w-full h-full bg-slate-950 overflow-hidden relative shadow-[0_20px_40px_rgba(0,0,0,0.5)] ${
          isFullscreen ? "fixed inset-0 z-50 rounded-none border-none" : ""
        }`}
        style={{
          clipPath: `path("${sunglassPath}")`,
          WebkitClipPath: `path("${sunglassPath}")`
        }}
      >
        {/* WebRTC Video Element */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover pointer-events-none filter saturate-110 brightness-110 contrast-110"
        />

        {/* Offline / Loading Overlay */}
        {!isVideoLive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/95 text-slate-300 p-6 text-center gap-3 font-sans">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
              className="w-12 h-12 rounded-full border-2 border-slate-700 border-t-blue-400 flex items-center justify-center"
            >
              <Radio className="w-5 h-5 text-blue-400" />
            </motion.div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                {streamError ? "Stream Offline" : "Connecting to WebRTC Feed..."}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {streamError || "Establishing MediaMTX peer connection"}
              </p>
            </div>
          </div>
        )}

        {/* Glass border reflection overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 40%, rgba(255,255,255,0) 60%, rgba(255,255,255,0.1) 100%)",
            mixBlendMode: "overlay"
          }}
        />

        {/* Floating Left Toolbar inside Visor */}
        <div className="absolute left-10 top-1/2 -translate-y-1/2 flex flex-col gap-3.5 z-20">
          <button
            onClick={onCaptureSnapshot}
            className="p-3 rounded-full bg-black/40 hover:bg-black/60 text-white/80 hover:text-white backdrop-blur-md border border-white/20 transition-all shadow-md"
            title="Video Feed Mode"
          >
            <Video className="w-5 h-5" />
          </button>
          <button
            onClick={onCaptureSnapshot}
            className="p-3 rounded-full bg-black/40 hover:bg-black/60 text-white/80 hover:text-white backdrop-blur-md border border-white/20 transition-all shadow-md"
            title="Capture Gallery Snapshot"
          >
            <Image className="w-5 h-5" />
          </button>
          <button
            className="p-3 rounded-full bg-black/40 hover:bg-black/60 text-white/80 hover:text-white backdrop-blur-md border border-white/20 transition-all shadow-md"
            title="Feed Adjustments"
          >
            <Sliders className="w-5 h-5" />
          </button>
        </div>

        {/* Floating Top Right Fullscreen Button */}
        <div className="absolute top-8 right-12 z-20">
          <button
            onClick={onToggleFullscreen}
            className="p-3 rounded-full bg-black/40 hover:bg-black/60 text-white/80 hover:text-white backdrop-blur-md border border-white/20 transition-all shadow-md"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
        
        {/* HUD Elements */}
        <div className="absolute top-8 w-full flex justify-center items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
          <span className="text-white font-bold text-xs tracking-widest font-sans drop-shadow-md">
            LIVE <span className="opacity-50 mx-2">|</span> 1080p • 30 FPS
          </span>
        </div>
      </div>

      {/* The thick metallic sunglass frame SVG overlay */}
      {!isFullscreen && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-[0_25px_35px_rgba(0,0,0,0.6)] z-10" viewBox="0 0 1000 562.5" preserveAspectRatio="none">
          <path 
            d={sunglassPath}
            fill="none" 
            stroke="url(#silverGrad)" 
            strokeWidth="24" 
          />
          <path 
            d={sunglassPath}
            fill="none" 
            stroke="url(#silverGradDark)" 
            strokeWidth="12" 
          />
          <path 
            d={sunglassPath}
            fill="none" 
            stroke="rgba(255,255,255,0.9)" 
            strokeWidth="3" 
          />
          <path 
            d={sunglassPath}
            fill="none" 
            stroke="rgba(0,0,0,0.5)" 
            strokeWidth="8" 
            style={{ transform: "scale(0.985) translate(8px, 8px)" }}
          />
          <defs>
            <linearGradient id="silverGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="25%" stopColor="#d1d5db" />
              <stop offset="50%" stopColor="#f3f4f6" />
              <stop offset="75%" stopColor="#9ca3af" />
              <stop offset="100%" stopColor="#4b5563" />
            </linearGradient>
            <linearGradient id="silverGradDark" x1="100%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#4b5563" />
              <stop offset="100%" stopColor="#9ca3af" />
            </linearGradient>
          </defs>
        </svg>
      )}
    </div>
  );
}

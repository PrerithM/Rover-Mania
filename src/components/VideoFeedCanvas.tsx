"use client";

import { motion } from "framer-motion";
import { Maximize2, Minimize2, Camera, RefreshCw, Radio, AlertTriangle } from "lucide-react";
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
    <div
      className={`relative overflow-hidden transition-all duration-300 ${
        isFullscreen
          ? "fixed inset-0 z-50 bg-black flex items-center justify-center"
          : "w-full aspect-video rounded-3xl apple-glass bg-slate-950 border border-slate-800 shadow-2xl"
      }`}
    >
      {/* Hidden canvas for image extraction */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Main WebRTC Video Element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-contain pointer-events-none"
      />

      {/* Stream Loading / Offline Overlay */}
      {!isVideoLive && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-slate-950/80 backdrop-blur-lg text-slate-200 text-center gap-3 z-10">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="w-12 h-12 rounded-full border-2 border-blue-500/30 border-t-blue-500 flex items-center justify-center"
          >
            <Radio className="w-5 h-5 text-blue-400" />
          </motion.div>
          <div className="max-w-md">
            <h3 className="text-base font-semibold text-white">
              {streamError ? "Camera Stream Offline" : "Connecting to WHEP Live Feed..."}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {streamError || "Establishing WebRTC peer connection with Raspberry Pi camera..."}
            </p>
          </div>
          <button
            onClick={onReloadStream}
            className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/25 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry Stream
          </button>
        </div>
      )}

      {/* Apple Dynamic HUD Targeting Reticle */}
      {isVideoLive && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-40">
          <div className="w-16 h-16 rounded-full border border-white/60 flex items-center justify-center">
            <div className="w-1 h-1 bg-red-500 rounded-full" />
          </div>
          <div className="absolute w-24 h-[1px] bg-white/20" />
          <div className="absolute h-24 w-[1px] bg-white/20" />
        </div>
      )}

      {/* Top Floating HUD Controls */}
      <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center pointer-events-none">
        {/* Live Badge */}
        <div className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white text-xs font-medium">
          <span
            className={`w-2 h-2 rounded-full ${
              isVideoLive ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
            }`}
          />
          <span>{isVideoLive ? "1080p WHEP WebRTC" : "Standby"}</span>
        </div>

        {/* Action Controls */}
        <div className="pointer-events-auto flex items-center gap-2">
          {onCaptureSnapshot && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onCaptureSnapshot}
              className="p-2.5 rounded-2xl bg-black/40 hover:bg-black/60 text-white backdrop-blur-md border border-white/10 transition-all"
              title="Take Frame Snapshot"
            >
              <Camera className="w-4 h-4" />
            </motion.button>
          )}

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onToggleFullscreen}
            className="p-2.5 rounded-2xl bg-black/40 hover:bg-black/60 text-white backdrop-blur-md border border-white/10 transition-all"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </motion.button>
        </div>
      </div>

      {/* Children elements (e.g. Overlays during Fullscreen mode) */}
      {children}
    </div>
  );
}

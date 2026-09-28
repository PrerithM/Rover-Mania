"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRoverWebSocket } from "@/hooks/useRoverWebSocket";
import { useRoverWebRTC } from "@/hooks/useRoverWebRTC";
import { AppleHeader } from "@/components/AppleHeader";
import { SpatialDPad } from "@/components/SpatialDPad";
import { VideoFeedCanvas } from "@/components/VideoFeedCanvas";
import { RoverVisionPanel, Message } from "@/components/RoverVisionPanel";
import { IpSettingsModal } from "@/components/IpSettingsModal";
import { Gamepad2, Bot, Shield, Zap } from "lucide-react";

export default function RoverDashboard() {
  const [piIp, setPiIp] = useState("10.248.130.62");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Apply dark mode class to html element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  // WebSocket Hook for driving motors
  const {
    status: wsStatus,
    activeDirection,
    setActiveDirection,
    sendCommand,
    speedMultiplier,
    setSpeedMultiplier,
  } = useRoverWebSocket({ ip: piIp });

  // WebRTC Hook for live WHEP video feed
  const {
    videoRef,
    isVideoLive,
    streamError,
    reloadStream,
  } = useRoverWebRTC({ ip: piIp });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Gemini AI Vision analysis logic
  const analyzeFrame = useCallback(
    async (customPrompt?: string) => {
      if (!videoRef.current || !canvasRef.current) return;
      const promptText =
        customPrompt ||
        "Describe what you see in this live camera feed in one concise, informative sentence.";

      setIsAnalyzing(true);
      setMessages((prev) => [...prev, { role: "user", text: promptText }]);

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      ctx?.drawImage(videoRef.current, 0, 0);

      const imageBase64 = canvas.toDataURL("image/jpeg", 0.8);

      try {
        const res = await fetch("/api/vision", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64, prompt: promptText }),
        });
        const data = await res.json();
        if (data.error) {
          setMessages((prev) => [
            ...prev,
            { role: "ai", text: `Error: ${data.error}` },
          ]);
        } else {
          setMessages((prev) => [...prev, { role: "ai", text: data.text }]);
        }
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          { role: "ai", text: "Connection error with Rover AI brain." },
        ]);
      } finally {
        setIsAnalyzing(false);
      }
    },
    [videoRef]
  );

  return (
    <main className="min-h-screen flex flex-col p-4 md:p-6 lg:p-8 max-w-7xl mx-auto selection:bg-blue-500/20 relative">
      {/* Dynamic Animated Apple Wallpaper Mesh Background */}
      <div className="apple-wallpaper-bg" />

      {/* Apple Header Navbar */}
      <AppleHeader
        status={wsStatus}
        ip={piIp}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleAi={() => setIsAiOpen(!isAiOpen)}
        isAiOpen={isAiOpen}
      />

      {/* Main Dashboard Layout Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Main Section: Live Video Feed */}
        <div
          className={`flex flex-col gap-6 ${
            isAiOpen ? "lg:col-span-8" : "lg:col-span-8"
          } transition-all duration-300`}
        >
          <VideoFeedCanvas
            videoRef={videoRef}
            canvasRef={canvasRef}
            isVideoLive={isVideoLive}
            streamError={streamError}
            isFullscreen={isFullscreen}
            onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
            onReloadStream={reloadStream}
            onCaptureSnapshot={() => analyzeFrame("Snapshot analysis request.")}
          >
            {/* Overlays inside Fullscreen Mode */}
            {isFullscreen && (
              <>
                {/* Bottom Left Floating D-Pad */}
                <div className="absolute left-6 bottom-6 z-40">
                  <SpatialDPad
                    activeDirection={activeDirection}
                    setActiveDirection={setActiveDirection}
                    sendCommand={sendCommand}
                    speedMultiplier={speedMultiplier}
                    setSpeedMultiplier={setSpeedMultiplier}
                    isCompact
                  />
                </div>

                {/* Bottom Right Floating Vision Trigger */}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsAiOpen(!isAiOpen)}
                  className="absolute right-6 bottom-6 z-40 p-4 rounded-3xl bg-blue-600 text-white shadow-2xl shadow-blue-500/40 backdrop-blur-md flex items-center gap-2 text-sm font-semibold"
                >
                  <Bot className="w-5 h-5" /> Vision AI
                </motion.button>
              </>
            )}
          </VideoFeedCanvas>

          {/* Quick Telemetry & Status Cards Below Video */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="apple-glass p-4 rounded-2xl flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider block">
                  Motor Throttle
                </span>
                <p className="text-sm font-extrabold text-slate-900 dark:text-white font-mono">
                  {Math.round(speedMultiplier * 100)}% Speed
                </p>
              </div>
            </div>

            <div className="apple-glass p-4 rounded-2xl flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <Gamepad2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider block">
                  Active Vector
                </span>
                <p className="text-sm font-extrabold text-slate-900 dark:text-white uppercase font-mono">
                  {activeDirection ? activeDirection : "IDLE"}
                </p>
              </div>
            </div>

            <div className="apple-glass p-4 rounded-2xl hidden sm:flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider block">
                  Control Bus
                </span>
                <p className="text-sm font-extrabold text-slate-900 dark:text-white font-mono">
                  WebSocket (ws://)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section: Driving Controls Panel or Vision Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Spatial Driving Controls Card */}
          <div className="apple-glass rounded-3xl p-6 flex flex-col items-center shadow-xl">
            <div className="w-full flex items-center justify-between pb-3 mb-4 border-b border-slate-300/60 dark:border-white/10">
              <div className="flex items-center gap-2">
                <Gamepad2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Spatial Control Pad
                </h2>
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400">WASD / Arrow Keys</span>
            </div>

            <SpatialDPad
              activeDirection={activeDirection}
              setActiveDirection={setActiveDirection}
              sendCommand={sendCommand}
              speedMultiplier={speedMultiplier}
              setSpeedMultiplier={setSpeedMultiplier}
            />
          </div>

          {/* Embedded Rover Vision Panel (when open) */}
          <AnimatePresence>
            {isAiOpen && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="h-[480px]"
              >
                <RoverVisionPanel
                  messages={messages}
                  isAnalyzing={isAnalyzing}
                  onSendPrompt={(p) => analyzeFrame(p)}
                  onClearHistory={() => setMessages([])}
                  onClose={() => setIsAiOpen(false)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* IP & Network Settings Modal */}
      <IpSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentIp={piIp}
        onSaveIp={(newIp) => setPiIp(newIp)}
      />

      {/* Apple Footer */}
      <footer className="mt-12 mb-4 text-center">
        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
          Designed with Apple Design System &bull; Rover Mania Pro &bull; Made by Prerith.M
        </p>
      </footer>
    </main>
  );
}
"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useRoverWebSocket } from "@/hooks/useRoverWebSocket";
import { useRoverWebRTC } from "@/hooks/useRoverWebRTC";
import { TopBar } from "@/components/TopBar";
import { DrivePanel } from "@/components/DrivePanel";
import { VisorFeed } from "@/components/VisorFeed";
import { AiAnalysisPanel, Message } from "@/components/AiAnalysisPanel";
import { ControlPanel } from "@/components/ControlPanel";
import { IpSettingsModal } from "@/components/IpSettingsModal";
import {
  RotateCcw,
  WifiOff,
  SlidersHorizontal,
} from "lucide-react";

export default function DashboardControlPanel() {
  const router = useRouter();

  // Operator & IP Configuration State initialized from storage or defaults
  const [piIp, setPiIp] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("rover_target_ip") || "10.248.130.62";
    }
    return "10.248.130.62";
  });

  const [operatorName] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("rover_operator_name") || "Commander Prerith";
    }
    return "Commander Prerith";
  });

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Connection Guard & Disconnection Alert State
  const [showDisconnectedAlert, setShowDisconnectedAlert] = useState(false);
  const [disconnectReason, setDisconnectReason] = useState("Heartbeat connection lost to Raspberry Pi");
  const hasEverConnectedRef = useRef(false);

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

  // Track connection success and monitor for failures via timer
  useEffect(() => {
    if (wsStatus === "Connected" || isVideoLive) {
      hasEverConnectedRef.current = true;
      return;
    }

    const timer = setTimeout(() => {
      if (wsStatus === "Disconnected") {
        if (hasEverConnectedRef.current) {
          setDisconnectReason("WebSocket heartbeat lost. Rover motor controllers disconnected.");
        } else {
          setDisconnectReason(`Could not establish telemetry link to ${piIp}. Please check IP settings or restart boot sequence.`);
        }
        setShowDisconnectedAlert(true);
      }
    }, hasEverConnectedRef.current ? 500 : 8000);

    return () => clearTimeout(timer);
  }, [wsStatus, isVideoLive, piIp]);

  const isAlertVisible = showDisconnectedAlert && wsStatus !== "Connected" && !isVideoLive;

  // Emergency Stop Handler
  const handleEmergencyStop = useCallback(() => {
    setActiveDirection(null);
    sendCommand(0, 0);
  }, [setActiveDirection, sendCommand]);

  // Keyboard navigation & controls listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case "w":
        case "arrowup":
          setActiveDirection("up");
          sendCommand(1.0, 1.0);
          break;
        case "s":
        case "arrowdown":
          setActiveDirection("down");
          sendCommand(-1.0, -1.0);
          break;
        case "a":
        case "arrowleft":
          setActiveDirection("left");
          sendCommand(-1.0, 1.0);
          break;
        case "d":
        case "arrowright":
          setActiveDirection("right");
          sendCommand(1.0, -1.0);
          break;
        case " ":
          e.preventDefault();
          handleEmergencyStop();
          break;
        case "1":
          setSpeedMultiplier(0.3);
          break;
        case "2":
          setSpeedMultiplier(0.6);
          break;
        case "3":
          setSpeedMultiplier(1.0);
          break;
        default:
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      const key = e.key.toLowerCase();
      if (
        ["w", "s", "a", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(
          key
        )
      ) {
        setActiveDirection(null);
        sendCommand(0, 0);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [sendCommand, setActiveDirection, setSpeedMultiplier, handleEmergencyStop]);

  // Gemini AI Vision analysis logic
  const analyzeFrame = useCallback(
    async (customPrompt?: string) => {
      if (!videoRef.current || !canvasRef.current) return;
      const promptText =
        customPrompt ||
        "Describe what you see in this live camera feed in one concise sentence.";

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
      } catch {
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

  // Handle Logout / Connection Recovery redirection back to 3-second boot page
  const handleRestartBootSequence = async () => {
    try {
      await fetch("/api/auth", { method: "DELETE" });
    } catch {}
    router.push("/");
  };

  return (
    <div className="h-screen w-full metal-surface text-slate-800 flex flex-col font-sans overflow-hidden relative selection:bg-blue-500/20">
      {/* Top Navigation Bar */}
      <TopBar
        status={wsStatus}
        ip={piIp}
        operatorName={operatorName}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onLogout={handleRestartBootSequence}
      />

      {/* Main Dashboard Control Arena */}
      <main className="flex-1 flex justify-center items-center gap-6 lg:gap-10 px-6 pb-6 w-full h-full overflow-hidden relative">
        {/* Left Panel: Drive Controls */}
        <div className="w-[300px] lg:w-[320px] shrink-0 h-[620px] lg:h-[640px]">
          <DrivePanel
            speedMultiplier={speedMultiplier}
            setSpeedMultiplier={setSpeedMultiplier}
            onEmergencyStop={handleEmergencyStop}
          />
        </div>

        {/* Center Section: Visor Feed & AI Analysis */}
        <div className="flex flex-col gap-6 lg:gap-8 flex-1 max-w-[850px] h-[620px] lg:h-[640px] justify-center items-center relative">
          {/* Top: Visor Feed */}
          <div className="w-full relative h-[460px] lg:h-[480px]">
            <VisorFeed
              videoRef={videoRef}
              canvasRef={canvasRef}
              isVideoLive={isVideoLive}
              streamError={streamError}
              isFullscreen={isFullscreen}
              onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
              onReloadStream={reloadStream}
              onCaptureSnapshot={() => analyzeFrame("Snapshot analysis request.")}
            />
          </div>

          {/* Bottom: AI Analysis Panel */}
          <div className="w-full shrink-0">
            <AiAnalysisPanel
              messages={messages}
              isAnalyzing={isAnalyzing}
              onSendPrompt={(p) => analyzeFrame(p)}
              onClearHistory={() => setMessages([])}
            />
          </div>
        </div>

        {/* Right Panel: Directional Controls */}
        <div className="w-[300px] lg:w-[320px] shrink-0 h-[620px] lg:h-[640px]">
          <ControlPanel
            activeDirection={activeDirection}
            setActiveDirection={setActiveDirection}
            sendCommand={sendCommand}
            onCaptureSnapshot={() => analyzeFrame("Snapshot analysis request.")}
          />
        </div>
      </main>

      {/* Connection Disconnection / Failover Alert Modal */}
      <AnimatePresence>
        {isAlertVisible && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl font-mono select-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-lg carbon-panel p-8 rounded-3xl border-2 border-rose-500/60 shadow-[0_0_60px_rgba(244,63,94,0.4)] text-center relative z-10"
            >
              {/* Alert Icon */}
              <div className="w-16 h-16 rounded-3xl bg-rose-500/20 border border-rose-500/60 flex items-center justify-center mx-auto mb-4 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.5)]">
                <WifiOff className="w-8 h-8 animate-pulse" />
              </div>

              {/* Title & Warning */}
              <h2 className="text-xl font-black uppercase tracking-wider text-white mb-2">
                ROVER UPLINK TERMINATED / DISCONNECTED
              </h2>
              <p className="text-xs text-rose-300 font-mono mb-6 max-w-md mx-auto leading-relaxed">
                {disconnectReason}
              </p>

              {/* Hardware diagnostics breakdown */}
              <div className="bg-slate-950/90 rounded-2xl p-4 border border-rose-500/30 text-left text-xs mb-6 space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span>TARGET IP ADDRESS:</span>
                  <span className="text-cyan-300 font-bold">{piIp}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>WEBSOCKET MOTOR STATUS:</span>
                  <span className="text-rose-400 font-bold uppercase">{wsStatus}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>MEDIAMTX VIDEO STATUS:</span>
                  <span className={isVideoLive ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                    {isVideoLive ? "STREAMING" : "OFFLINE"}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>CHANGE IP ENDPOINT</span>
                </button>

                {/* Restart Boot Sequence (takes back to 3-second loading page where last login details appear) */}
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={handleRestartBootSequence}
                  className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(244,63,94,0.5)] transition-all cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>RESTART BOOT SEQUENCE (3s)</span>
                </motion.button>
              </div>

              <div className="mt-4">
                <button
                  onClick={() => setShowDisconnectedAlert(false)}
                  className="text-[11px] text-slate-400 hover:text-slate-200 underline cursor-pointer"
                >
                  Dismiss & Continue in Standby Mode
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* IP & Telemetry Settings Modal */}
      <IpSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentIp={piIp}
        onSaveIp={(newIp) => {
          setPiIp(newIp);
          try {
            localStorage.setItem("rover_target_ip", newIp);
          } catch {}
        }}
      />
    </div>
  );
}

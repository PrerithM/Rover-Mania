"use client";

import { useState, useRef, useCallback } from "react";
import { useRoverWebSocket } from "@/hooks/useRoverWebSocket";
import { useRoverWebRTC } from "@/hooks/useRoverWebRTC";
import { TopBar } from "@/components/TopBar";
import { DrivePanel } from "@/components/DrivePanel";
import { VisorFeed } from "@/components/VisorFeed";
import { AiAnalysisPanel, Message } from "@/components/AiAnalysisPanel";
import { ControlPanel } from "@/components/ControlPanel";
import { IpSettingsModal } from "@/components/IpSettingsModal";

export default function RoverDashboard() {
  const [piIp, setPiIp] = useState("10.248.130.62");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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

  // Emergency Stop Handler
  const handleEmergencyStop = () => {
    setActiveDirection(null);
    sendCommand(0, 0);
  };

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
    <div className="h-screen w-full metal-surface text-slate-800 flex flex-col font-sans overflow-hidden relative selection:bg-blue-500/20">
      {/* Top Navigation Bar */}
      <TopBar
        status={wsStatus}
        ip={piIp}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Dashboard Area */}
      <main className="flex-1 flex justify-center items-center gap-10 px-8 pb-8 w-full h-full overflow-hidden relative">
        
        {/* Left Panel: Drive Controls */}
        <div className="w-[320px] shrink-0 h-[640px]">
          <DrivePanel
            speedMultiplier={speedMultiplier}
            setSpeedMultiplier={setSpeedMultiplier}
            onEmergencyStop={handleEmergencyStop}
          />
        </div>

        {/* Center Section: Visor Feed & AI Analysis */}
        <div className="flex flex-col gap-8 flex-1 max-w-[850px] h-[640px] justify-center items-center relative">
          
          {/* Top: Visor Feed */}
          <div className="w-full relative h-[480px]">
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

          {/* Bottom: AI Analysis */}
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
        <div className="w-[320px] shrink-0 h-[640px]">
          <ControlPanel
            activeDirection={activeDirection}
            setActiveDirection={setActiveDirection}
            sendCommand={sendCommand}
            onCaptureSnapshot={() => analyzeFrame("Snapshot analysis request.")}
          />
        </div>
        
      </main>

      {/* IP & Telemetry Settings Modal */}
      <IpSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentIp={piIp}
        onSaveIp={(newIp) => setPiIp(newIp)}
      />
    </div>
  );
}
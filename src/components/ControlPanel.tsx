"use client";

import { motion } from "framer-motion";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Crosshair, Camera, Volume2 } from "lucide-react";

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
  const handlePointerDown =
    (dir: string, l: number, r: number) => (e: React.PointerEvent) => {
      e.preventDefault();
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {}
      setActiveDirection(dir);
      sendCommand(l, r);
    };

  const handlePointerUp = (e: React.PointerEvent) => {
    e.preventDefault();
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {}
    setActiveDirection(null);
    sendCommand(0, 0);
  };

  const getDpadButtonClass = (dir: string) => {
    const isActive = activeDirection === dir;
    return `absolute w-[4rem] h-[4rem] rounded-full flex items-center justify-center transition-all cursor-pointer ${
      isActive ? "bg-black/10 scale-95" : "hover:bg-black/5"
    }`;
  };

  return (
    <div className="h-full w-full metal-panel metal-surface p-6 flex flex-col justify-between relative z-10 select-none">
      {/* Hardware Screws */}
      <div className="absolute top-5 left-5 hardware-screw" />
      <div className="absolute top-5 right-5 hardware-screw" />
      <div className="absolute bottom-5 left-5 hardware-screw" />
      <div className="absolute bottom-5 right-5 hardware-screw" />

      {/* Panel Header */}
      <div>
        <h2 className="text-xl font-medium tracking-tight engraved-text-deep">Control</h2>
        <p className="text-[11px] font-medium mt-0.5 engraved-text">Move the rover</p>
      </div>

      {/* Main Center: Tactile 3D D-Pad Housing */}
      <div className="flex-1 my-4 flex items-center justify-center">
        {/* Recessed Housing */}
        <div className="w-[14.5rem] h-[14.5rem] rounded-full metal-recess relative flex items-center justify-center p-2">
          {/* Raised Metallic D-Pad Dial */}
          <div className="w-full h-full rounded-full metal-dpad relative flex items-center justify-center">
            {/* Inner knurled center */}
            <div
              className="w-14 h-14 rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.4),0_2px_4px_rgba(255,255,255,1)] border border-gray-500"
              style={{
                background:
                  "radial-gradient(circle at 30% 30%, #e2e8f0 0%, #94a3b8 50%, #475569 100%)",
              }}
            />

            {/* Top Direction Button */}
            <button
              onPointerDown={handlePointerDown("up", 1.0, 1.0)}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className={`${getDpadButtonClass("up")} top-1`}
              aria-label="Move Up"
            >
              <ChevronUp className="w-8 h-8 stroke-[3] engraved-icon" />
            </button>

            {/* Left Direction Button */}
            <button
              onPointerDown={handlePointerDown("left", -1.0, 1.0)}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className={`${getDpadButtonClass("left")} left-1`}
              aria-label="Move Left"
            >
              <ChevronLeft className="w-8 h-8 stroke-[3] engraved-icon" />
            </button>

            {/* Right Direction Button */}
            <button
              onPointerDown={handlePointerDown("right", 1.0, -1.0)}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className={`${getDpadButtonClass("right")} right-1`}
              aria-label="Move Right"
            >
              <ChevronRight className="w-8 h-8 stroke-[3] engraved-icon" />
            </button>

            {/* Bottom Direction Button */}
            <button
              onPointerDown={handlePointerDown("down", -1.0, -1.0)}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className={`${getDpadButtonClass("down")} bottom-1`}
              aria-label="Move Down"
            >
              <ChevronDown className="w-8 h-8 stroke-[3] engraved-icon" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Utility Row (3 Silver Metallic Buttons) */}
      <div className="grid grid-cols-3 gap-4">
        <motion.button
          whileTap={{ scale: 0.95 }}
          className="p-3.5 rounded-2xl metal-button engraved-text flex items-center justify-center transition-colors cursor-pointer"
          title="Targeting Crosshair"
        >
          <Crosshair className="w-5 h-5 stroke-[2] engraved-icon" />
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onCaptureSnapshot}
          className="p-3.5 rounded-2xl metal-button engraved-text flex items-center justify-center transition-colors cursor-pointer"
          title="Camera Snapshot"
        >
          <Camera className="w-5 h-5 stroke-[2] engraved-icon" />
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          className="p-3.5 rounded-2xl metal-button engraved-text flex items-center justify-center transition-colors cursor-pointer"
          title="Audio Horn Signal"
        >
          <Volume2 className="w-5 h-5 stroke-[2] engraved-icon" />
        </motion.button>
      </div>
    </div>
  );
}

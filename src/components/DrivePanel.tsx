"use client";

import { motion } from "framer-motion";
import { ChevronUp, ChevronDown, Feather, Car, Flame } from "lucide-react";

interface DrivePanelProps {
  speedMultiplier: number;
  setSpeedMultiplier: (speed: number) => void;
  onEmergencyStop: () => void;
}

export function DrivePanel({
  speedMultiplier,
  setSpeedMultiplier,
  onEmergencyStop,
}: DrivePanelProps) {
  const currentSpeedPercent = Math.round(speedMultiplier * 100);

  // Custom vertical drag/click handler for speed slider
  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const height = rect.height;
    const newSpeed = 1.0 - clickY / height;
    const clampedSpeed = Math.min(1.0, Math.max(0.1, newSpeed));
    setSpeedMultiplier(parseFloat(clampedSpeed.toFixed(2)));
  };

  const getActiveButtonClass = (isActive: boolean) => {
    return isActive
      ? "bg-[#0b1324] text-white border border-blue-500 shadow-[inset_0_4px_10px_rgba(0,0,0,0.9),0_0_15px_rgba(59,130,246,0.5)]"
      : "bg-[linear-gradient(145deg,#f8fafc,#e2e8f0)] text-slate-700 border border-white shadow-[0_4px_6px_rgba(0,0,0,0.1),inset_0_-2px_4px_rgba(0,0,0,0.05)]";
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
          <h2 className="text-xl font-medium tracking-tight engraved-text-deep">Drive</h2>
          <p className="text-[11px] font-medium mt-0.5 engraved-text">Control movement</p>
        </div>

        {/* Main Body: Custom Vertical Slider + Speed Selector Buttons */}
        <div className="flex-1 my-4 flex items-center justify-between gap-2">
          
          <div className="flex items-center gap-2">
            {/* Tick Marks (ruler markings) */}
            <div className="flex flex-col justify-between h-[13rem] py-1">
              {[...Array(11)].map((_, i) => (
                <div key={i} className="w-2.5 h-[2px] bg-slate-400/80 rounded-full shadow-[0_1px_0_rgba(255,255,255,0.8),inset_0_1px_1px_rgba(0,0,0,0.2)]" />
              ))}
            </div>

            {/* Custom Vertical Slider Track */}
          <div
            onClick={handleTrackClick}
            className="h-[17rem] w-[3.5rem] metal-recess rounded-full flex flex-col items-center justify-between py-3 relative cursor-pointer"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSpeedMultiplier(Math.min(1.0, speedMultiplier + 0.1));
              }}
              className="p-1 text-slate-500 hover:text-gray-300 transition-colors z-10"
            >
              <ChevronUp className="w-5 h-5 stroke-[2.5] engraved-icon" />
            </button>

            {/* Metallic Silver Pill Slider Thumb */}
            <div className="w-full flex-1 relative flex justify-center items-center">
              <motion.div
                animate={{
                  y: `${(1 - (speedMultiplier - 0.1) / 0.9) * 130 - 65}px`,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="w-10 h-[4.5rem] metal-button knurled-grip rounded-full flex flex-col items-center justify-center gap-[3px] cursor-grab active:cursor-grabbing"
              >
                <div className="w-5 h-[2px] rounded-full bg-gray-400/80 shadow-[inset_0_1px_1px_rgba(0,0,0,0.2)]" />
                <div className="w-6 h-[2px] rounded-full bg-gray-400/80 shadow-[inset_0_1px_1px_rgba(0,0,0,0.2)]" />
                <div className="w-5 h-[2px] rounded-full bg-gray-400/80 shadow-[inset_0_1px_1px_rgba(0,0,0,0.2)]" />
              </motion.div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setSpeedMultiplier(Math.max(0.1, speedMultiplier - 0.1));
              }}
              className="p-1 text-slate-500 hover:text-gray-300 transition-colors z-10"
            >
              <ChevronDown className="w-5 h-5 stroke-[2.5] engraved-icon" />
            </button>
          </div>
          </div>

          {/* Right Stack: Speed Percentage + Mode Pills */}
          <div className="flex-1 flex flex-col justify-between h-[17rem] py-1 pl-2">
            {/* Speed Percentage Display */}
            <div className="mb-2 pl-1">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-light tracking-tight engraved-text-deep">
                  {currentSpeedPercent}
                </span>
                <span className="text-sm font-semibold engraved-text">%</span>
              </div>
              <p className="text-[11px] font-medium mt-0.5 engraved-text">Speed</p>
            </div>

            {/* Drive Mode Pill Buttons */}
            <div className="flex flex-col gap-3">
              {/* Low Mode */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setSpeedMultiplier(0.3)}
                className={`w-full py-2.5 px-4 rounded-full text-[11px] font-semibold flex items-center justify-start gap-3 transition-all metal-button ${speedMultiplier <= 0.35 ? "led-glow-blue" : "engraved-text"}`}
              >
                <Feather className="w-3.5 h-3.5 stroke-[2] engraved-icon" />
                <span>Low</span>
              </motion.button>

              {/* Normal Mode */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setSpeedMultiplier(0.6)}
                className={`w-full py-2.5 px-4 rounded-full text-[11px] font-semibold flex items-center justify-start gap-3 transition-all metal-button ${speedMultiplier > 0.35 && speedMultiplier <= 0.75 ? "led-glow-blue" : "engraved-text"}`}
              >
                <Car className="w-3.5 h-3.5 stroke-[2] engraved-icon" />
                <span>Normal</span>
              </motion.button>

              {/* High Mode */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setSpeedMultiplier(1.0)}
                className={`w-full py-2.5 px-4 rounded-full text-[11px] font-semibold flex items-center justify-start gap-3 transition-all metal-button ${speedMultiplier > 0.75 ? "led-glow-blue" : "engraved-text"}`}
              >
                <Flame className="w-3.5 h-3.5 stroke-[2] engraved-icon" />
                <span>High</span>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Wide Whitish Silver Metallic STOP Button */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={onEmergencyStop}
          className="w-full py-3.5 rounded-full metal-button engraved-text-deep font-medium text-xs tracking-wider flex items-center justify-center gap-2.5 uppercase transition-all"
        >
          <span className="w-2.5 h-2.5 rounded-sm bg-red-600 shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),0_0_8px_rgba(220,38,38,0.9)] border border-red-800" />
          <span>STOP</span>
        </motion.button>

      </div>
  );
}

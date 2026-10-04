"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  UserCheck,
  UserPlus,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";
import { IpSettingsModal } from "@/components/IpSettingsModal";

export default function LandingLoadingPage() {
  const router = useRouter();

  // 3-second cinematic boot sequence state
  const [bootProgress, setBootProgress] = useState(0);
  const [isBootComplete, setIsBootComplete] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Stored operator / connection details initialized lazily
  const [savedOperator, setSavedOperator] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("rover_operator_name") || "Commander Prerith";
    }
    return "Commander Prerith";
  });

  const [savedIp, setSavedIp] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("rover_target_ip") || "10.248.130.62";
    }
    return "10.248.130.62";
  });

  // 3-Second Minimalist Loading Animation Loop matching User Reference Image
  useEffect(() => {
    const totalDuration = 3000; // Exactly 3 seconds
    const intervalTime = 25;
    const increment = 100 / (totalDuration / intervalTime);

    const timer = setInterval(() => {
      setBootProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(timer);
          setIsBootComplete(true);
          return 100;
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, []);

  // Handle Quick Connect Launch
  const handleQuickConnect = async () => {
    setIsConnecting(true);
    try {
      localStorage.setItem("rover_target_ip", savedIp);
      localStorage.setItem("rover_operator_name", savedOperator);
    } catch {}

    setTimeout(() => {
      router.push("/dashboard");
    }, 500);
  };

  // Re-run the 3-second boot sequence
  const handleReboot = () => {
    setBootProgress(0);
    setIsBootComplete(false);
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center font-sans overflow-hidden select-none bg-black text-slate-100">
      {/* Background Hero Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/Rover HeroPage.png"
          alt="Alpho Rover Hero Background"
          fill
          priority
          className="object-cover object-center filter brightness-50 contrast-110"
        />
        {/* Soft Vignette Overlay */}
        <div className="absolute inset-0 bg-black/40 pointer-events-none" />
      </div>

      {/* Main Center Area */}
      <main className="relative z-10 w-full max-w-xl px-6 flex flex-col items-center justify-center text-center">
        <AnimatePresence mode="wait">
          {!isBootComplete ? (
            /* STEP 1A: CLEAN MINIMALIST LOADING SCREEN MATCHING REFERENCE IMAGE */
            <motion.div
              key="loading-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }}
              transition={{ duration: 0.35 }}
              className="flex flex-col items-center justify-center"
            >
              {/* App Name Logo Header instead of "Loading" */}
              <div className="flex items-center gap-3 mb-2">
                <svg
                  className="w-8 h-8 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2L2 22h6l4-8 4 8h6L12 2z" />
                </svg>
                <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
                  Alpho RoverX
                </h1>
              </div>

              {/* Subtitle */}
              <p className="text-[11px] font-bold tracking-[0.25em] text-slate-300 uppercase drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] mb-8">
                EXPLORE · CONTROL · SEE MORE
              </p>

              {/* Clean Minimalist Loading Bar matching reference image */}
              <div className="w-64 sm:w-80 h-[3px] bg-white/20 rounded-full overflow-hidden relative shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
                <motion.div
                  className="h-full bg-white rounded-full shadow-[0_0_12px_rgba(255,255,255,1)]"
                  style={{ width: `${bootProgress}%` }}
                />
              </div>

              <button
                onClick={() => setIsBootComplete(true)}
                className="mt-8 text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Skip intro ›
              </button>
            </motion.div>
          ) : (
            /* STEP 1B: BOOT COMPLETE -> SKEUOMORPHIC BRUSHED METAL AUTHENTICATION CARD */
            <motion.div
              key="login-options"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="w-full max-w-md metal-panel metal-surface p-7 rounded-3xl relative overflow-hidden text-left shadow-2xl"
            >
              {/* Hardware Screws at 4 Corners */}
              <div className="absolute top-4 left-4 hardware-screw" />
              <div className="absolute top-4 right-4 hardware-screw" />
              <div className="absolute bottom-4 left-4 hardware-screw" />
              <div className="absolute bottom-4 right-4 hardware-screw" />

              {/* Header */}
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-400/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl metal-button flex items-center justify-center text-slate-700">
                    <svg className="w-6 h-6 engraved-icon" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L2 22h6l4-8 4 8h6L12 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-base font-medium tracking-tight text-slate-800 engraved-text-deep">
                      Alpho RoverX
                    </h2>
                    <p className="text-[10px] font-bold tracking-wider text-slate-500 uppercase engraved-text">
                      Operator Gateway
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleReboot}
                  className="p-2 rounded-xl metal-button text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                  title="Restart 3s Loading Animation"
                >
                  <RotateCcw className="w-4 h-4 engraved-icon" />
                </button>
              </div>

              {/* Saved Operator Profile in Metal Recess */}
              <div className="metal-recess rounded-2xl p-4 mb-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full metal-button flex items-center justify-center text-slate-800 font-bold text-sm">
                    {savedOperator.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-semibold engraved-text">OPERATOR:</span>
                      <span className="text-sm font-semibold text-slate-800 engraved-text-deep">
                        {savedOperator}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                      <span>IP: {savedIp}</span>
                      <span>·</span>
                      <span className="text-blue-600 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                        Saved Session
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="p-2 rounded-xl metal-button text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                  title="Configure IP"
                >
                  <SlidersHorizontal className="w-4 h-4 engraved-icon" />
                </button>
              </div>

              {/* Dual Action Choices */}
              <div className="space-y-3">
                {/* OPTION 1: Continue directly with saved login */}
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={handleQuickConnect}
                  disabled={isConnecting}
                  className="w-full py-3.5 px-5 rounded-full metal-button led-glow-blue font-semibold text-xs tracking-wider uppercase flex items-center justify-between transition-all cursor-pointer disabled:opacity-60"
                >
                  <div className="flex items-center gap-2.5">
                    <UserCheck className="w-4 h-4" />
                    <span>Continue as {savedOperator}</span>
                  </div>
                  {isConnecting ? (
                    <span className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                </motion.button>

                {/* OPTION 2: Switch Operator / Enter New Login */}
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => router.push("/login")}
                  className="w-full py-3 px-5 rounded-full metal-button engraved-text font-semibold text-xs tracking-wider uppercase flex items-center justify-between transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <UserPlus className="w-4 h-4 engraved-icon" />
                    <span>Switch Operator / New Login</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-normal">Login ›</span>
                </motion.button>
              </div>

              {/* Footer status notice */}
              <div className="mt-5 pt-3 border-t border-slate-400/20 flex items-center justify-between text-[10px] font-medium text-slate-500 engraved-text">
                <span>Alpho RoverX Cockpit</span>
                <span>v4.0</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* IP Settings Modal */}
      <IpSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentIp={savedIp}
        onSaveIp={(newIp) => {
          setSavedIp(newIp);
          try {
            localStorage.setItem("rover_target_ip", newIp);
          } catch {}
        }}
      />
    </div>
  );
}
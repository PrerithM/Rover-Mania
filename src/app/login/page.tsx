"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  User,
  SlidersHorizontal,
  ChevronLeft,
} from "lucide-react";
import { IpSettingsModal } from "@/components/IpSettingsModal";

export default function LoginPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [operatorName, setOperatorName] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("rover_operator_name") || "Commander Prerith";
    }
    return "Commander Prerith";
  });

  const [targetIp, setTargetIp] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("rover_target_ip") || "10.248.130.62";
    }
    return "10.248.130.62";
  });

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError("Please enter the security access key.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setIsSuccess(true);
        if (rememberMe) {
          try {
            localStorage.setItem("rover_target_ip", targetIp);
            localStorage.setItem("rover_operator_name", operatorName || "Commander Prerith");
          } catch {}
        }

        setTimeout(() => {
          router.push("/dashboard");
          router.refresh();
        }, 500);
      } else {
        setError(data.error || "ACCESS DENIED: Invalid Security Passcode (Try: PrerithRover)");
      }
    } catch {
      setError("Uplink failed. Please check network connection.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-between p-4 font-sans overflow-hidden select-none bg-black text-slate-800">
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

      {/* Top Header */}
      <header className="relative z-10 w-full max-w-4xl px-4 py-4 flex items-center justify-between">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full metal-button text-xs font-semibold text-slate-700 transition-all cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 engraved-icon" />
          <span className="engraved-text">Loading Screen</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 drop-shadow">
          <span className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.9)] animate-pulse" />
          <span>Operator Gateway</span>
        </div>
      </header>

      {/* Main Authentication Card in Metallic Skeuomorphism */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md metal-panel metal-surface p-7 rounded-3xl relative z-10 my-auto shadow-2xl"
      >
        {/* Hardware Screws at 4 Corners */}
        <div className="absolute top-4 left-4 hardware-screw" />
        <div className="absolute top-4 right-4 hardware-screw" />
        <div className="absolute bottom-4 left-4 hardware-screw" />
        <div className="absolute bottom-4 right-4 hardware-screw" />

        {/* Top Header / Brand */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl metal-button flex items-center justify-center p-3 mb-3 text-slate-700">
            <svg className="w-full h-full engraved-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 22h6l4-8 4 8h6L12 2z" />
            </svg>
          </div>

          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="text-xl font-medium tracking-tight text-slate-800 engraved-text-deep">
              Alpho RoverX
            </h1>
          </div>
          <p className="text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase engraved-text">
            EXPLORE · CONTROL · SEE MORE
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Operator Callsign / Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 engraved-text">
              <User className="w-3.5 h-3.5 engraved-icon" />
              Operator Name / Callsign
            </label>
            <div className="relative">
              <input
                type="text"
                value={operatorName}
                onChange={(e) => setOperatorName(e.target.value)}
                placeholder="e.g. Commander Prerith"
                disabled={isLoading || isSuccess}
                className="w-full px-4 py-2.5 metal-recess rounded-xl text-slate-800 placeholder-slate-400 text-xs font-medium focus:outline-none"
              />
            </div>
          </div>

          {/* Security Passcode Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 engraved-text">
                <KeyRound className="w-3.5 h-3.5 engraved-icon" />
                Security Access Key
              </label>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4 engraved-icon" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError("");
                }}
                placeholder="Enter passcode (PrerithRover)..."
                disabled={isLoading || isSuccess}
                autoFocus
                className="w-full pl-10 pr-11 py-2.5 metal-recess rounded-xl text-slate-800 placeholder-slate-400 text-sm font-medium focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Target IP configuration & Remember me options */}
          <div className="flex items-center justify-between pt-1 text-xs">
            <label className="flex items-center gap-2 text-slate-600 cursor-pointer engraved-text">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded accent-blue-600 cursor-pointer"
              />
              <span className="text-[11px] font-medium">Remember on this device</span>
            </label>

            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span>IP: {targetIp}</span>
            </button>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -6, height: 0 }}
                className="flex items-center gap-2 p-3 rounded-xl bg-red-100 border border-red-300 text-red-700 text-xs font-medium"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <motion.button
            whileTap={{ scale: 0.96 }}
            type="submit"
            disabled={isLoading || isSuccess}
            className={`w-full py-3.5 px-5 rounded-full font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer text-xs metal-button ${
              isSuccess
                ? "bg-emerald-600 text-white shadow-emerald-500/30"
                : "led-glow-blue"
            } disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span>Verifying...</span>
              </div>
            ) : isSuccess ? (
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Access Granted · Launching...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>Authenticate & Enter</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            )}
          </motion.button>
        </form>

        {/* Footer info */}
        <div className="mt-5 pt-3 border-t border-slate-400/20 flex items-center justify-between text-[10px] font-medium text-slate-500 engraved-text">
          <span>Passcode: PrerithRover</span>
          <span>v4.0</span>
        </div>
      </motion.div>

      {/* Footer System Status */}
      <footer className="relative z-10 w-full max-w-4xl px-4 py-3 flex items-center justify-between text-[11px] font-medium text-slate-400 drop-shadow">
        <div>Alpho RoverX Cockpit Standby</div>
        <div>Ports: 8765 / 8889</div>
      </footer>

      {/* IP Settings Modal */}
      <IpSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentIp={targetIp}
        onSaveIp={(newIp) => {
          setTargetIp(newIp);
          try {
            localStorage.setItem("rover_target_ip", newIp);
          } catch {}
        }}
      />
    </div>
  );
}

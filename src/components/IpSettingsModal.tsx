"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Server, Save, Check, Wifi, Globe, Cpu } from "lucide-react";

interface IpSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentIp: string;
  onSaveIp: (newIp: string) => void;
}

export function IpSettingsModal({
  isOpen,
  onClose,
  currentIp,
  onSaveIp,
}: IpSettingsModalProps) {
  const [ipAddress, setIpAddress] = useState(currentIp);
  const [saved, setSaved] = useState(false);
  const [prevPropIp, setPrevPropIp] = useState(currentIp);

  if (currentIp !== prevPropIp) {
    setPrevPropIp(currentIp);
    setIpAddress(currentIp);
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ipAddress.trim()) return;
    const cleanIp = ipAddress.trim();
    onSaveIp(cleanIp);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 600);
  };

  const presets = [
    { label: "Lab Default", ip: "10.248.130.62" },
    { label: "Local AP", ip: "192.168.4.1" },
    { label: "Home Network", ip: "192.168.1.120" },
    { label: "Simulator", ip: "127.0.0.1" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md select-none font-sans">
          {/* Backdrop Click */}
          <div className="absolute inset-0" onClick={onClose} />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="w-full max-w-lg metal-panel metal-surface p-7 rounded-3xl relative z-10 shadow-2xl text-slate-800"
          >
            {/* Hardware Screws */}
            <div className="absolute top-4 left-4 hardware-screw" />
            <div className="absolute top-4 right-4 hardware-screw" />
            <div className="absolute bottom-4 left-4 hardware-screw" />
            <div className="absolute bottom-4 right-4 hardware-screw" />

            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-400/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl metal-button flex items-center justify-center text-slate-700">
                  <Server className="w-5 h-5 engraved-icon" />
                </div>
                <div>
                  <h3 className="text-base font-medium tracking-tight text-slate-800 engraved-text-deep">
                    Network & Hardware Endpoints
                  </h3>
                  <p className="text-[10px] font-bold tracking-wider text-slate-500 uppercase engraved-text">
                    Target Raspberry Pi Configuration
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl metal-button text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 engraved-icon" />
              </button>
            </div>

            {/* IP Address Form */}
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5 engraved-text">
                  <Globe className="w-3.5 h-3.5 engraved-icon" />
                  Raspberry Pi IP Address
                </label>
                <input
                  type="text"
                  value={ipAddress}
                  onChange={(e) => setIpAddress(e.target.value)}
                  placeholder="e.g. 10.248.130.62"
                  autoFocus
                  className="w-full metal-recess rounded-xl px-4 py-2.5 text-sm font-mono text-slate-800 placeholder-slate-400 focus:outline-none"
                />
              </div>

              {/* Quick Presets */}
              <div>
                <span className="block text-[10px] text-slate-500 uppercase tracking-wider mb-2 font-bold engraved-text">
                  Quick Presets:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {presets.map((p) => (
                    <button
                      key={p.ip}
                      type="button"
                      onClick={() => setIpAddress(p.ip)}
                      className={`px-2.5 py-1.5 rounded-full text-[10px] font-semibold transition-all truncate cursor-pointer ${
                        ipAddress === p.ip
                          ? "metal-button led-glow-blue"
                          : "metal-button engraved-text text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Port & Protocol Diagnostic Cards */}
              <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                <div className="p-3.5 rounded-2xl metal-recess flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-500 text-[10px] uppercase font-bold">
                    <span>Motor Controller</span>
                    <Wifi className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <div className="mt-1">
                    <span className="font-mono font-bold text-slate-800 text-xs">
                      ws://{ipAddress || "..."}:8765
                    </span>
                    <p className="text-[9px] text-slate-500 mt-0.5">Bi-directional PWM commands</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl metal-recess flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-500 text-[10px] uppercase font-bold">
                    <span>MediaMTX WHEP</span>
                    <Cpu className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <div className="mt-1">
                    <span className="font-mono font-bold text-slate-800 text-xs truncate block">
                      http://{ipAddress || "..."}:8889/cam
                    </span>
                    <p className="text-[9px] text-slate-500 mt-0.5">Low-latency WebRTC video</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-400/20">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-full metal-button text-xs font-semibold uppercase text-slate-600 hover:text-slate-900 transition-all cursor-pointer engraved-text"
                >
                  Cancel
                </button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer metal-button ${
                    saved ? "bg-emerald-600 text-white shadow-emerald-500/30" : "led-glow-blue"
                  }`}
                >
                  {saved ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" /> Saved!
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> Save Endpoints
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

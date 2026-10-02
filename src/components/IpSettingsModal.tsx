"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Server, Save, Check } from "lucide-react";

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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ipAddress.trim()) return;
    onSaveIp(ipAddress.trim());
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md font-mono">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="w-full max-w-md rounded-2xl carbon-panel p-6 shadow-[0_0_40px_rgba(6,182,212,0.3)] border-2 border-cyan-500/40 text-cyan-200"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-cyan-500/20">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-500/50 flex items-center justify-center">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-white">
                    NETWORK & HUD ENDPOINTS
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    TARGET RASPBERRY PI NETWORK CONFIG
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-cyan-950/60 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-cyan-400 mb-1.5">
                  RASPBERRY PI IP ADDRESS
                </label>
                <input
                  type="text"
                  value={ipAddress}
                  onChange={(e) => setIpAddress(e.target.value)}
                  placeholder="e.g. 10.248.130.62"
                  className="w-full bg-slate-950 border-2 border-cyan-500/40 rounded-xl px-4 py-3 text-sm font-mono text-cyan-200 placeholder-slate-600 focus:outline-none focus:border-cyan-400 shadow-[inset_0_0_10px_rgba(6,182,212,0.15)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-cyan-500/20">
                  <span className="text-slate-400 block mb-0.5 text-[10px] uppercase">MOTOR WEBSOCKET</span>
                  <span className="font-mono font-bold text-cyan-300">
                    :8765 (ws://)
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-cyan-500/20">
                  <span className="text-slate-400 block mb-0.5 text-[10px] uppercase">MEDIAMTX WHEP</span>
                  <span className="font-mono font-bold text-cyan-300">
                    :8889 (http://)
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold uppercase text-slate-400 hover:text-cyan-300 hover:bg-cyan-950/50 transition-all"
                >
                  CANCEL
                </button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-extrabold shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all uppercase tracking-wider"
                >
                  {saved ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" /> CONFIRMED!
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> SAVE ENDPOINTS
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


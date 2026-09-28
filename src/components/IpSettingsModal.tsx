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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="w-full max-w-md rounded-3xl apple-glass p-6 shadow-2xl border border-white/30 dark:border-white/10"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200/50 dark:border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Rover Connection Settings
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Configure target Raspberry Pi network endpoints
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-2xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/10 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Raspberry Pi IP Address
                </label>
                <input
                  type="text"
                  value={ipAddress}
                  onChange={(e) => setIpAddress(e.target.value)}
                  placeholder="e.g. 10.248.130.62"
                  className="w-full bg-slate-200/60 dark:bg-white/10 border border-slate-300/40 dark:border-white/10 rounded-2xl px-4 py-3 text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-slate-200/40 dark:bg-white/5 border border-slate-300/30 dark:border-white/5">
                  <span className="text-slate-400 block mb-0.5">WebSocket Motor Port</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    :8765
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-200/40 dark:bg-white/5 border border-slate-300/30 dark:border-white/5">
                  <span className="text-slate-400 block mb-0.5">MediaMTX WHEP Port</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    :8889
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-2xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/25 transition-all"
                >
                  {saved ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" /> Saved!
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

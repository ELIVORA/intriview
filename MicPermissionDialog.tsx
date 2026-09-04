/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { Mic, AlertCircle, CheckCircle2, ShieldAlert, Sparkles } from "lucide-react";

interface MicPermissionDialogProps {
  isOpen: boolean;
  status: boolean | null; // null = unasked, false = denied, true = granted
  onRequestAccess: () => void;
  onClose: () => void;
}

export function MicPermissionDialog({ isOpen, status, onRequestAccess, onClose }: MicPermissionDialogProps) {
  if (!isOpen) return null;

  return (
    <div id="mic-permission-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/65 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-xl">
              <Mic className="w-5 h-5 animate-pulse" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">Microphone Diagnostics</h3>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xs font-semibold px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg"
          >
            Close
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            The voice analyzer listens continuously to capture pronunciation cues, pacing metrics, 
            and grammar flow. It will only record during active interview questions.
          </p>

          {/* Status Indicator */}
          <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Device Status</span>
              {status === true && (
                <span className="flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2.5 py-1 rounded-lg font-mono font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  CONNECTED
                </span>
              )}
              {status === false && (
                <span className="flex items-center gap-1 text-[10px] bg-red-500/10 text-red-500 border border-red-500/20 px-2.5 py-1 rounded-lg font-mono font-bold">
                  <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
                  BLOCKED
                </span>
              )}
              {status === null && (
                <span className="flex items-center gap-1 text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2.5 py-1 rounded-lg font-mono font-bold">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                  AWAITING TEST
                </span>
              )}
            </div>

            {status === false && (
              <div className="mt-3 p-3 bg-red-500/5 border border-red-500/10 rounded-xl space-y-2">
                <span className="text-[10px] font-bold text-red-500 block">How to unblock microphone:</span>
                <ul className="text-[10px] text-zinc-500 dark:text-zinc-400 list-disc list-inside space-y-1 leading-normal">
                  <li>Click the camera/microphone icon in your browser address bar.</li>
                  <li>Toggle permission setting to <strong>"Always Allow"</strong>.</li>
                  <li>Reload this workspace tab to restart speech streams.</li>
                </ul>
              </div>
            )}
          </div>

          {/* Guidelines */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-zinc-400 uppercase font-mono tracking-wider">Optimal Setup Requirements</span>
            <div className="grid grid-cols-2 gap-3 text-[10px]">
              <div className="p-3 border border-zinc-100 dark:border-zinc-800 rounded-xl">
                <span className="font-semibold text-zinc-800 dark:text-zinc-200 block">Environment</span>
                <span className="text-zinc-400 mt-1 block leading-normal">Quiet room, no loud background fans or music.</span>
              </div>
              <div className="p-3 border border-zinc-100 dark:border-zinc-800 rounded-xl">
                <span className="font-semibold text-zinc-800 dark:text-zinc-200 block">Hardware</span>
                <span className="text-zinc-400 mt-1 block leading-normal">Wired USB headsets or built-in directional mics.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-2">
          {status === true ? (
            <button
              onClick={onClose}
              className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 rounded-2xl text-xs font-bold transition-all shadow-sm"
            >
              Start Practice Session
            </button>
          ) : (
            <button
              onClick={onRequestAccess}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              Initialize & Test Microphone
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Compass, ArrowRight } from "lucide-react";

interface NotFoundViewProps {
  onBackToHome: () => void;
}

export function NotFoundView({ onBackToHome }: NotFoundViewProps) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center space-y-6">
      
      {/* Animated Icon */}
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200/30 dark:border-indigo-900/30 shadow-md">
        <Compass className="w-8 h-8 animate-spin" style={{ animationDuration: "10s" }} />
      </div>

      <div className="space-y-2">
        <h1 className="text-6xl font-extrabold text-zinc-900 dark:text-white tracking-tight">404</h1>
        <h2 className="text-base font-bold text-zinc-700 dark:text-zinc-300">Route Unmapped</h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
          The requested URL path does not map to any active interview preparation module or marketing node in our environment.
        </p>
      </div>

      <button
        onClick={onBackToHome}
        className="px-6 py-3 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-900 dark:hover:bg-zinc-50 font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
      >
        Return To Safety
        <ArrowRight className="w-4 h-4" />
      </button>

    </div>
  );
}

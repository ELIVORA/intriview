/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Sparkles, Eye, ShieldAlert, ArrowUpRight, Smile, Sparkle } from "lucide-react";

interface CameraIndicatorGaugesProps {
  metrics: {
    eye_contact: number;
    posture: number;
    gesture: number;
    attention: number;
    confidence: number;
    stability: number;
    expression: string;
    warnings: string[];
  };
}

export function CameraIndicatorGauges({ metrics }: CameraIndicatorGaugesProps) {
  const { eye_contact, posture, gesture, attention, confidence, stability, expression, warnings } = metrics;

  // Calculate svg stroke offsets for circular gauge
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (confidence / 100) * circumference;

  // Compute metric-driven status text
  const getConfidenceLevel = (score: number) => {
    if (score >= 85) return "HIGHLY INFLUENTIAL";
    if (score >= 70) return "SOLID COMPOSTURE";
    return "STRESSED FRAME";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* Dynamic Confidence Meter Ring (Left) */}
      <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl flex flex-col justify-between space-y-4 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[9px] font-bold text-zinc-400 uppercase font-mono tracking-widest block">
              Confidence Engine
            </span>
            <span className="text-xs font-extrabold text-zinc-800 dark:text-zinc-100">
              {getConfidenceLevel(confidence)}
            </span>
          </div>
          <div className="p-1.5 bg-indigo-500/10 text-indigo-500 rounded-lg">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Circular SVG Ring Container */}
        <div className="flex items-center justify-center py-2 relative">
          <svg className="w-24 h-24 transform -rotate-90">
            {/* Background ring */}
            <circle
              cx="48"
              cy="48"
              r={radius}
              className="stroke-zinc-100 dark:stroke-zinc-800"
              strokeWidth="7"
              fill="transparent"
            />
            {/* Foreground progress ring */}
            <circle
              cx="48"
              cy="48"
              r={radius}
              className="stroke-indigo-500 transition-all duration-300"
              strokeWidth="7"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-black text-zinc-800 dark:text-zinc-100 font-mono tracking-tighter">
              {confidence}%
            </span>
            <span className="text-[7px] text-zinc-400 font-mono">DYNAMICS</span>
          </div>
        </div>

        <p className="text-[10px] text-zinc-400 leading-normal text-center">
          Sustained eye contact & symmetric head stability improves the Interview Preparation index.
        </p>
      </div>

      {/* Linear Micro-Gauges (Middle) */}
      <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-4 shadow-sm md:col-span-2">
        <span className="text-[9px] font-bold text-zinc-400 uppercase font-mono tracking-widest block">
          Telemetry Channels
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Eye Contact bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-zinc-400" /> Eye Contact Index
              </span>
              <span className="font-mono font-bold text-indigo-500">{eye_contact}%</span>
            </div>
            <div className="w-full h-1.5 bg-zinc-50 dark:bg-zinc-950 rounded-full overflow-hidden border border-zinc-100 dark:border-zinc-800">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                style={{ width: `${eye_contact}%` }}
              />
            </div>
          </div>

          {/* Body Posture bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">Spinal Posture Integrity</span>
              <span className="font-mono font-bold text-emerald-500">{posture}%</span>
            </div>
            <div className="w-full h-1.5 bg-zinc-50 dark:bg-zinc-950 rounded-full overflow-hidden border border-zinc-100 dark:border-zinc-800">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${posture}%` }}
              />
            </div>
          </div>

          {/* Attention bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">Live Attention & Focus</span>
              <span className="font-mono font-bold text-sky-500">{attention}%</span>
            </div>
            <div className="w-full h-1.5 bg-zinc-50 dark:bg-zinc-950 rounded-full overflow-hidden border border-zinc-100 dark:border-zinc-800">
              <div
                className="h-full bg-sky-500 rounded-full transition-all duration-300"
                style={{ width: `${attention}%` }}
              />
            </div>
          </div>

          {/* Head stability bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">Head Stability Index</span>
              <span className="font-mono font-bold text-amber-500">{stability}%</span>
            </div>
            <div className="w-full h-1.5 bg-zinc-50 dark:bg-zinc-950 rounded-full overflow-hidden border border-zinc-100 dark:border-zinc-800">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-300"
                style={{ width: `${stability}%` }}
              />
            </div>
          </div>
        </div>

        {/* Warning feed or Ok status */}
        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-850 flex items-center justify-between text-[10px] font-mono">
          <span className="text-zinc-400">Warning Monitor:</span>
          {warnings.length > 0 ? (
            <span className="text-red-500 font-bold flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 animate-pulse" /> {warnings.length} Active Deviations
            </span>
          ) : (
            <span className="text-emerald-500 font-bold flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> Postural Symmetry Verified
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

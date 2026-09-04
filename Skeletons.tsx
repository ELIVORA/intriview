/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion } from "motion/react";

// Base skeleton pulse box with premium shimmer effect
export function SkeletonPulse({ className = "" }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-slate-100 dark:bg-zinc-800/60 rounded-xl ${className}`}>
      <motion.div
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 dark:via-zinc-600/30 to-transparent"
        animate={{
          x: ["-100%", "200%"],
        }}
        transition={{
          repeat: Infinity,
          duration: 1.5,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}

// Page Skeleton Placeholder
export function PageSkeleton() {
  return (
    <div className="space-y-6 w-full">
      {/* Page Title & Description Skeleton */}
      <div className="space-y-2">
        <SkeletonPulse className="h-8 w-64 md:w-80" />
        <SkeletonPulse className="h-4 w-96 max-w-full" />
      </div>

      {/* Grid widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SkeletonPulse className="h-32" />
        <SkeletonPulse className="h-32" />
        <SkeletonPulse className="h-32" />
      </div>

      {/* Main content pane */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-6 rounded-3xl space-y-4">
        <div className="flex items-center gap-3">
          <SkeletonPulse className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <SkeletonPulse className="h-4 w-32" />
            <SkeletonPulse className="h-3 w-20" />
          </div>
        </div>
        <SkeletonPulse className="h-4 w-full" />
        <SkeletonPulse className="h-4 w-11/12" />
        <SkeletonPulse className="h-4 w-10/12" />
        <div className="h-[250px] border border-zinc-100 dark:border-zinc-800/80 rounded-2xl flex items-center justify-center p-4">
          <ChartSkeleton />
        </div>
      </div>
    </div>
  );
}

// Chart Skeleton Loading Placeholder
export function ChartSkeleton() {
  return (
    <div className="w-full h-full flex flex-col justify-end gap-3 p-4">
      <div className="flex items-end justify-between gap-2 h-40">
        <SkeletonPulse className="w-full h-[40%]" />
        <SkeletonPulse className="w-full h-[70%]" />
        <SkeletonPulse className="w-full h-[55%]" />
        <SkeletonPulse className="w-full h-[85%]" />
        <SkeletonPulse className="w-full h-[60%]" />
        <SkeletonPulse className="w-full h-[95%]" />
        <SkeletonPulse className="w-full h-[75%]" />
      </div>
      <div className="flex justify-between">
        <SkeletonPulse className="h-3 w-12" />
        <SkeletonPulse className="h-3 w-12" />
        <SkeletonPulse className="h-3 w-12" />
        <SkeletonPulse className="h-3 w-12" />
        <SkeletonPulse className="h-3 w-12" />
      </div>
    </div>
  );
}

// Interview Room / Video Stream Skeleton Placeholder
export function InterviewSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
      {/* Stream Window */}
      <div className="lg:col-span-2 space-y-4">
        <div className="relative aspect-video bg-zinc-900 rounded-3xl overflow-hidden flex items-center justify-center border border-zinc-800">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
          <motion.div
            animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="flex flex-col items-center gap-3 z-20 text-zinc-400"
          >
            <div className="w-12 h-12 rounded-full border border-zinc-800 flex items-center justify-center bg-zinc-950">
              <span className="w-4 h-4 rounded-full bg-red-500 animate-pulse" />
            </div>
            <span className="text-xs font-mono font-medium tracking-widest uppercase">CONNECTING CAMERA FEED...</span>
          </motion.div>
        </div>
        <div className="flex justify-between items-center bg-white dark:bg-zinc-900 p-4 border border-zinc-150 dark:border-zinc-850 rounded-2xl">
          <SkeletonPulse className="h-8 w-44" />
          <div className="flex gap-2">
            <SkeletonPulse className="h-8 w-8 rounded-lg" />
            <SkeletonPulse className="h-8 w-24 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Sidebar Metrics and Prompts */}
      <div className="space-y-6">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 p-6 rounded-3xl space-y-4">
          <SkeletonPulse className="h-5 w-32" />
          <SkeletonPulse className="h-3 w-full" />
          <SkeletonPulse className="h-3 w-11/12" />
          <SkeletonPulse className="h-10 w-full rounded-xl" />
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 p-6 rounded-3xl space-y-3">
          <SkeletonPulse className="h-4 w-40" />
          <div className="space-y-2">
            <SkeletonPulse className="h-8 w-full rounded-lg" />
            <SkeletonPulse className="h-8 w-full rounded-lg" />
            <SkeletonPulse className="h-8 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Report compilation loader
export function ReportSkeleton() {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-6 rounded-3xl space-y-6">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <SkeletonPulse className="h-6 w-48" />
          <SkeletonPulse className="h-3.5 w-64" />
        </div>
        <SkeletonPulse className="h-8 w-24 rounded-lg" />
      </div>

      <div className="border-t border-zinc-100 dark:border-zinc-800 pt-6 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 rounded-2xl space-y-2">
              <SkeletonPulse className="h-3 w-16" />
              <SkeletonPulse className="h-6 w-24" />
            </div>
          ))}
        </div>

        <div className="space-y-3 pt-4">
          <SkeletonPulse className="h-4 w-full" />
          <SkeletonPulse className="h-4 w-11/12" />
          <SkeletonPulse className="h-4 w-10/12" />
        </div>
      </div>
    </div>
  );
}

// AI Thinking/Processing Indicator
export function AIThinkingIndicator() {
  return (
    <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 font-medium py-2">
      <div className="flex items-center gap-1.5">
        <motion.span
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.2, delay: 0 }}
          className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block"
        />
        <motion.span
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }}
          className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block"
        />
        <motion.span
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.2, delay: 0.4 }}
          className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block"
        />
      </div>
      <span className="text-xs font-mono font-semibold uppercase tracking-widest text-indigo-500">AI AGENT COG_STREAM ACTIVE</span>
    </div>
  );
}

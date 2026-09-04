/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { MessageSquare, RefreshCw, Sparkles, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";

interface LiveTranscriptPanelProps {
  typedAnswer: string;
  realtimeTranscript: string;
  speakingSpeedWPM: number;
  confidenceScore: number;
}

export function LiveTranscriptPanel({
  typedAnswer,
  realtimeTranscript,
  speakingSpeedWPM,
  confidenceScore
}: LiveTranscriptPanelProps) {
  // Simple check for filler words inside the active text to count them reactively
  const fillerWords = ["um", "uh", "like", "basically", "actually", "you know", "sort of", "kind of"];
  const fullText = (typedAnswer + " " + realtimeTranscript).toLowerCase();
  
  const detectedFillers = fillerWords.reduce((acc, word) => {
    const regex = new RegExp(`\\b${word}\\b`, "g");
    const matches = fullText.match(regex);
    if (matches) acc[word] = matches.length;
    return acc;
  }, {} as Record<string, number>);

  const totalFillerCount = Object.values(detectedFillers).reduce((a, b) => a + b, 0);

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
        <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-widest flex items-center gap-1.5">
          <MessageSquare className="w-4 h-4 text-indigo-500" />
          Realtime Voice Analytics
        </h4>
        <div className="flex items-center gap-2">
          <span className="text-[10px] bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded-lg font-mono">
            Whisper Stream
          </span>
        </div>
      </div>

      {/* Real-time speech stream visualization */}
      <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl min-h-24 max-h-40 overflow-y-auto leading-relaxed relative">
        {typedAnswer || realtimeTranscript ? (
          <p className="text-xs text-zinc-700 dark:text-zinc-300">
            {typedAnswer}
            <span className="text-indigo-500 font-medium animate-pulse">{realtimeTranscript}</span>
          </p>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
            <RefreshCw className="w-5 h-5 text-zinc-300 dark:text-zinc-700 animate-spin" />
            <span className="text-[10px] text-zinc-400 mt-2 font-mono">Awaiting speech patterns...</span>
          </div>
        )}
      </div>

      {/* Micro-Metrics dashboard */}
      <div className="grid grid-cols-3 gap-3">
        {/* Metric 1: Speaking speed */}
        <div className="p-3 border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/30 rounded-xl text-center space-y-1">
          <span className="text-[9px] uppercase font-bold text-zinc-400 font-mono tracking-wider block">Speaking Tempo</span>
          <span className="text-xs font-bold text-zinc-800 dark:text-zinc-100 block">
            {speakingSpeedWPM > 0 ? `${speakingSpeedWPM} WPM` : "Analyzing"}
          </span>
          <span className={`text-[8px] font-mono block ${
            speakingSpeedWPM > 160 ? "text-amber-500" : speakingSpeedWPM > 0 && speakingSpeedWPM < 110 ? "text-amber-500" : "text-emerald-500"
          }`}>
            {speakingSpeedWPM > 160 ? "Too Fast" : speakingSpeedWPM > 0 && speakingSpeedWPM < 110 ? "Too Slow" : speakingSpeedWPM > 0 ? "Ideal" : "Standby"}
          </span>
        </div>

        {/* Metric 2: Live Confidence */}
        <div className="p-3 border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/30 rounded-xl text-center space-y-1">
          <span className="text-[9px] uppercase font-bold text-zinc-400 font-mono tracking-wider block">Vocal Clarity</span>
          <span className="text-xs font-bold text-emerald-500 block">
            {confidenceScore}%
          </span>
          <span className="text-[8px] text-zinc-400 font-mono block">Confidence Meter</span>
        </div>

        {/* Metric 3: Filler words count */}
        <div className="p-3 border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/30 rounded-xl text-center space-y-1">
          <span className="text-[9px] uppercase font-bold text-zinc-400 font-mono tracking-wider block">Filler Crutches</span>
          <span className={`text-xs font-bold block ${totalFillerCount > 4 ? "text-red-500" : totalFillerCount > 1 ? "text-amber-500" : "text-emerald-500"}`}>
            {totalFillerCount}
          </span>
          <span className="text-[8px] text-zinc-400 font-mono block">Detected Fillers</span>
        </div>
      </div>

      {/* Real-time Filler words breakdown chips */}
      {totalFillerCount > 0 && (
        <div className="space-y-1.5 pt-1">
          <span className="text-[9px] uppercase font-bold text-zinc-400 font-mono tracking-wider block">Live Filler Counters</span>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(detectedFillers).map(([word, count]) => (
              <span key={word} className="px-2 py-0.5 bg-red-500/5 text-red-500 border border-red-500/10 text-[9px] font-mono rounded-lg flex items-center gap-1 animate-fadeIn">
                <AlertTriangle className="w-2.5 h-2.5" />
                <span className="font-bold">{word}:</span> {count}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

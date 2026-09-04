/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";

interface VoiceWaveformProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  micActive: boolean;
  soundLevel: number;
}

export function VoiceWaveform({ canvasRef, micActive, soundLevel }: VoiceWaveformProps) {
  // Array of 5 wave curves to render when speaking (synthetic backup visualizers)
  const syntheticWaves = [
    { delay: 0.1, duration: 1.2, height: "h-6", bg: "bg-indigo-500/80" },
    { delay: 0.25, duration: 0.8, height: "h-10", bg: "bg-indigo-400/90" },
    { delay: 0.0, duration: 1.5, height: "h-14", bg: "bg-indigo-600" },
    { delay: 0.35, duration: 0.9, height: "h-8", bg: "bg-indigo-400/90" },
    { delay: 0.15, duration: 1.1, height: "h-5", bg: "bg-indigo-500/80" }
  ];

  return (
    <div className="w-full flex flex-col items-center justify-center p-6 bg-zinc-950 dark:bg-zinc-950 border border-zinc-800 rounded-3xl relative overflow-hidden h-36">
      {/* Background ambient glow */}
      <div className="absolute inset-0 bg-radial-gradient from-indigo-500/10 to-transparent pointer-events-none" />

      {micActive ? (
        <div className="w-full h-full flex flex-col justify-between items-center relative z-10">
          <span className="text-[10px] uppercase font-mono tracking-widest text-indigo-400/80 flex items-center gap-1.5 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
            AI Voice Analyzer Streaming
          </span>

          {/* Real Audio Canvas overlay */}
          <div className="w-full h-16 flex items-center justify-center relative">
            <canvas ref={canvasRef} className="w-full h-full opacity-90 absolute inset-0" width={450} height={64} />
            
            {/* Overlaying luxury digital bars if sound level exists */}
            {soundLevel < 5 && (
              <div className="flex items-center gap-1.5 justify-center">
                {syntheticWaves.map((wave, idx) => (
                  <motion.div
                    key={idx}
                    animate={{
                      scaleY: [1, 1.8, 1],
                      transition: {
                        duration: wave.duration,
                        repeat: Infinity,
                        delay: wave.delay,
                        ease: "easeInOut"
                      }
                    }}
                    className={`w-1 rounded-full ${wave.bg} ${wave.height} origin-center`}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between w-full max-w-xs text-[10px] font-mono text-zinc-500">
            <span>Input Gain: <strong className="text-zinc-300">{soundLevel}%</strong></span>
            <span>Continuous VAD Status: <strong className="text-emerald-400">ACTIVE</strong></span>
          </div>
        </div>
      ) : (
        <div className="text-center space-y-2 relative z-10">
          <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
          </div>
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">Voice Analyzer Offline</span>
          <p className="text-[9px] text-zinc-600 max-w-xs mx-auto">Microphone standby. Enable voice mode to analyze communication metrics.</p>
        </div>
      )}
    </div>
  );
}

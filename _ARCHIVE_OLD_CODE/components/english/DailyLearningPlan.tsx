/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  CheckSquare,
  Square,
  Award,
  BookOpen,
  Calendar,
  Clock,
  Zap,
  CheckCircle2,
  ChevronRight,
  Smile,
  Sparkles
} from "lucide-react";
import { DailyChallenge } from "./types";
import { INITIAL_DAILY_CHALLENGES } from "./englishEngine";

interface DailyLearningPlanProps {
  onNavigateTab: (tab: string) => void;
}

export function DailyLearningPlan({ onNavigateTab }: DailyLearningPlanProps) {
  const [challenges, setChallenges] = useState<DailyChallenge[]>(INITIAL_DAILY_CHALLENGES);
  const [justCompletedId, setJustCompletedId] = useState<string | null>(null);

  const handleCompleteChallenge = (id: string, type: string) => {
    setChallenges(prev =>
      prev.map(ch => (ch.id === id ? { ...ch, isCompleted: true } : ch))
    );
    setJustCompletedId(id);

    // Fade out success notification after 3 seconds
    setTimeout(() => {
      setJustCompletedId(null);
    }, 3000);
  };

  const completedCount = challenges.filter(c => c.isCompleted).length;
  const totalPoints = challenges.reduce((acc, c) => acc + (c.isCompleted ? c.points : 0), 0);

  const getChallengeTab = (type: string) => {
    switch (type) {
      case "Speaking":
        return "speaking";
      case "Grammar":
        return "grammar";
      case "Vocabulary":
        return "vocabulary";
      case "Listening":
        return "listening";
      default:
        return "hr-coach";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full" id="daily-learning-plan-screen">
      
      {/* Col 1: Learning stats progress overview */}
      <div className="lg:col-span-1 bg-white/60 dark:bg-zinc-950/60 backdrop-blur-xl border border-zinc-200/60 dark:border-zinc-850 p-6 rounded-3xl shadow-xs space-y-6 h-fit">
        <div>
          <span className="text-[10px] text-indigo-500 font-mono font-bold tracking-widest uppercase block">
            SYLLABUS PROGRESSION
          </span>
          <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-50 mt-1">
            Daily Training Dashboard
          </h3>
        </div>

        {/* Training stats */}
        <div className="space-y-4">
          <div className="p-4 bg-zinc-50 dark:bg-zinc-900/40 rounded-2xl border border-zinc-150 dark:border-zinc-850 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[9px] font-mono text-zinc-400 uppercase">QUESTS RESOLVED</span>
              <span className="text-base font-black text-zinc-800 dark:text-zinc-100 block font-mono">
                {completedCount} / {challenges.length}
              </span>
            </div>
            <div className="p-2.5 bg-indigo-500/10 text-indigo-600 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 bg-zinc-50 dark:bg-zinc-900/40 rounded-2xl border border-zinc-150 dark:border-zinc-850 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[9px] font-mono text-zinc-400 uppercase">INTERVIEW XP AWARDED</span>
              <span className="text-base font-black text-emerald-600 font-mono block">
                {totalPoints} XP
              </span>
            </div>
            <div className="p-2.5 bg-emerald-500/10 text-emerald-600 rounded-xl">
              <Award className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Dynamic completed notification */}
        {justCompletedId && (
          <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 text-xs text-emerald-600 flex items-start gap-2 animate-bounce">
            <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Quest Resolved!</span>
              <p className="text-[10px] opacity-85 leading-normal">Your speech evaluation stats and dashboard metrics have been updated.</p>
            </div>
          </div>
        )}

        <div className="p-3.5 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl text-[10px] text-zinc-500 leading-normal flex items-start gap-1.5">
          <Clock className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
          <span>This syllabus auto-regenerates every 24 hours based on your weakest oral metrics. Complete today's items to keep up with interviews!</span>
        </div>
      </div>

      {/* Col 2 & 3: Daily Quest items check list */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white/60 dark:bg-zinc-950/60 backdrop-blur-xl border border-zinc-200/60 dark:border-zinc-850 p-6 rounded-3xl shadow-xs">
          <div className="pb-4 border-b border-zinc-100 dark:border-zinc-900 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-indigo-500 font-mono font-bold tracking-widest uppercase block">
                DAILY WORKLIST
              </span>
              <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-50 mt-1">
                Linguistic Skills Syllabus
              </h3>
            </div>
            <span className="text-[10px] font-mono text-zinc-400">TODAY</span>
          </div>

          <div className="space-y-3.5 mt-5">
            {challenges.map(ch => (
              <div
                key={ch.id}
                className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                  ch.isCompleted
                    ? "bg-emerald-500/[0.01] border-emerald-500/10 opacity-70"
                    : "bg-zinc-50/50 dark:bg-zinc-900/15 border-zinc-200/40 dark:border-zinc-850 hover:border-zinc-300"
                }`}
              >
                <div className="flex gap-3.5 min-w-0">
                  <button
                    onClick={() => !ch.isCompleted && handleCompleteChallenge(ch.id, ch.type)}
                    disabled={ch.isCompleted}
                    className="p-1 text-zinc-400 hover:text-indigo-500 shrink-0 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {ch.isCompleted ? (
                      <CheckSquare className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-black text-zinc-850 dark:text-zinc-100 block truncate">
                        {ch.title}
                      </span>
                      <span className="px-1.5 py-0.5 bg-indigo-500/10 text-indigo-500 text-[8px] font-mono font-bold uppercase rounded">
                        {ch.type}
                      </span>
                      <span className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-900 text-zinc-400 text-[8px] font-mono font-bold uppercase rounded">
                        {ch.difficulty}
                      </span>
                    </div>

                    <p className="text-[11px] text-zinc-500 leading-relaxed font-sans">{ch.description}</p>
                  </div>
                </div>

                <div className="text-right shrink-0 space-y-1.5">
                  <span className="text-[9px] font-mono font-bold text-emerald-600 block">{ch.points} XP</span>
                  {!ch.isCompleted && (
                    <button
                      onClick={() => onNavigateTab(getChallengeTab(ch.type))}
                      className="text-[9px] font-bold text-indigo-500 hover:underline flex items-center justify-end gap-0.5 cursor-pointer"
                    >
                      <span>Syllabus</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
export default DailyLearningPlan;

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Award, TrendingUp, AlertTriangle, CheckCircle2, ChevronLeft, Brain, BookOpen, Compass, ShieldCheck, MessageSquare } from "lucide-react";

interface BehaviorReport {
  session_id: string;
  overall_body_language_score: number;
  metrics_summary: {
    eye_contact_score: number;
    posture_score: number;
    gesture_score: number;
    attention_score: number;
    confidence_score: number;
    head_stability_score: number;
  };
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  recommended_exercises: string[];
  ai_visual_critique?: {
    general_visual_commentary?: string;
    micro_expression_analysis?: string;
    remediations?: string[];
  };
}

interface BehaviorDashboardViewProps {
  report: BehaviorReport;
  onBack: () => void;
}

export function BehaviorDashboardView({ report, onBack }: BehaviorDashboardViewProps) {
  const {
    overall_body_language_score,
    metrics_summary,
    strengths,
    weaknesses,
    recommended_exercises,
    ai_visual_critique
  } = report;

  // Chart data focusing on interview communication metrics
  const chartData = [
    { name: "Confidence", score: metrics_summary.confidence_score || 88, color: "#6366f1" },
    { name: "Speech Clarity", score: metrics_summary.eye_contact_score || 92, color: "#10b981" },
    { name: "Pacing (WPM)", score: metrics_summary.posture_score || 85, color: "#f59e0b" },
    { name: "Completeness", score: metrics_summary.attention_score || 87, color: "#0ea5e9" },
    { name: "Communication", score: metrics_summary.gesture_score || 90, color: "#a855f7" }
  ];

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-850 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Core Summary
        </button>

        <span className="text-[10px] font-mono text-zinc-400 uppercase">
          AI_INTERVIEW_PERFORMANCE_REPORT_v2
        </span>
      </div>

      {/* Main Grid: Score badge and charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Dynamic summary score card */}
        <div className="p-6 bg-indigo-600 text-white rounded-3xl relative overflow-hidden flex flex-col justify-between space-y-6 shadow-md shadow-indigo-600/10">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Award className="w-40 h-40" />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] bg-white/20 px-2.5 py-0.5 rounded-lg font-mono font-bold uppercase tracking-wider">
              Overall Performance Rating
            </span>
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className="text-5xl font-black font-mono tracking-tighter">
                {overall_body_language_score}
              </span>
              <span className="text-lg opacity-85">/ 100</span>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest flex items-center gap-1">
              <Brain className="w-4 h-4" /> Virtual Mentor Feedback
            </h4>
            <p className="text-xs leading-relaxed text-indigo-100">
              {ai_visual_critique?.general_visual_commentary ||
                "Demonstrated strong speech confidence, well-articulated technical explanations, and clear conversational delivery throughout the round."}
            </p>
          </div>

          <div className="pt-4 border-t border-white/25 flex items-center justify-between text-[11px] font-mono">
            <span className="opacity-80">AI Evaluation Engine:</span>
            <span className="font-bold flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" /> AI Powered
            </span>
          </div>
        </div>

        {/* Visual Charts panel */}
        <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-4 shadow-sm md:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-widest flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              Interview Performance Metrics Breakdown
            </h3>
            <span className="text-[10px] font-mono text-zinc-400">SCORE COMPARISON</span>
          </div>

          {/* Recharts container */}
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ left: -10, right: 10, top: 5, bottom: 5 }}>
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#888888" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: "#888888" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#1f2937", border: "none", borderRadius: "12px", fontSize: "10px", color: "#ffffff" }}
                  cursor={{ fill: "rgba(0,0,0,0.03)" }}
                />
                <Bar dataKey="score" radius={[8, 8, 0, 0]} barSize={28}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detail Analysis columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Key Strengths & Growth Areas */}
        <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-5 shadow-sm">
          <div>
            <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Key Strengths
            </h4>
            <ul className="mt-3 space-y-2.5">
              {strengths.map((str, i) => (
                <li key={i} className="text-xs text-zinc-600 dark:text-zinc-400 flex items-start gap-2 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>

          {weaknesses.length > 0 && (
            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-850">
              <h4 className="text-xs font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> Growth Areas
              </h4>
              <ul className="mt-3 space-y-2.5">
                {weaknesses.map((weak, i) => (
                  <li key={i} className="text-xs text-zinc-600 dark:text-zinc-400 flex items-start gap-2 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                    <span>{weak}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Exercises & Actionable Recommendations */}
        <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-5 shadow-sm">
          <div>
            <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-widest flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" /> Recommended Practice Drills
            </h4>
            <div className="mt-3 space-y-3">
              {recommended_exercises.map((exe, idx) => (
                <div key={idx} className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-850 rounded-xl space-y-1">
                  <span className="text-[9px] font-bold text-indigo-500 uppercase font-mono">DRILL {idx + 1}</span>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-normal">
                    {exe}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-850">
            <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-widest flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-purple-500" /> Coaching Tips & Guidance
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mt-2">
              {ai_visual_critique?.micro_expression_analysis ||
                "Your responses show strong domain knowledge. Practice framing answers using the STAR technique (Situation, Task, Action, Result) for behavioral questions."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

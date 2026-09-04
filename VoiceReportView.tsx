/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from "recharts";
import {
  Award,
  Sparkles,
  TrendingUp,
  Volume2,
  Smile,
  AlertTriangle,
  Zap,
  Target,
  Bookmark,
  ChevronLeft
} from "lucide-react";

interface VoiceReport {
  session_id: string;
  total_segments: number;
  overall_voice_score: number;
  metrics_summary: {
    grammar_score: number;
    fluency_score: number;
    pronunciation_score: number;
    confidence_score: number;
    communication_score: number;
    professional_speaking_score: number;
  };
  filler_words_summary: {
    total_filler_count: number;
    filler_percentage: number;
    most_used_filler: string;
    all_filler_counts: Record<string, number>;
  };
  speaking_speed_summary: {
    average_wpm: number;
    status: string;
    advice: string;
  };
  grammar_issues: string[];
  pronunciation_issues: string[];
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  recommended_practice: string[];
  compiled_at: string;
}

interface VoiceReportViewProps {
  report: VoiceReport;
  onBack: () => void;
}

export function VoiceReportView({ report, onBack }: VoiceReportViewProps) {
  // Chart mapping for Recharts radar chart
  const radarData = [
    { name: "Grammar", score: report.metrics_summary.grammar_score },
    { name: "Fluency", score: report.metrics_summary.fluency_score },
    { name: "Pronunciation", score: report.metrics_summary.pronunciation_score },
    { name: "Confidence", score: report.metrics_summary.confidence_score },
    { name: "Tone", score: report.metrics_summary.professional_speaking_score },
    { name: "Clarity", score: report.metrics_summary.communication_score }
  ];

  // Bar chart mapping for filler words used
  const fillerBarData = Object.entries(report.filler_words_summary.all_filler_counts || {}).map(
    ([word, count]) => ({
      name: word,
      count
    })
  );

  return (
    <div id="voice-master-report" className="space-y-8">
      {/* Back Button & Top Bar */}
      <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-800 pb-4">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-850 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Main Session
        </button>
        <span className="text-[10px] font-mono text-zinc-400">
          Evaluated: {new Date(report.compiled_at).toLocaleTimeString()}
        </span>
      </div>

      {/* Main Hero Card */}
      <div className="p-8 bg-zinc-950 text-white rounded-3xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-8 border border-zinc-800 shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2.5 relative z-10 max-w-xl">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-400 tracking-wider font-mono uppercase">
            <Award className="w-4 h-4" />
            SPEECH & CONVERSATION AI DIAGNOSTIC REPORT
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Voice Intelligence Performance Audit
          </h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            This module has parsed verbal structures, counted vocal pauses, compared speaking speed against 
            industry interview standards, and compiled custom speech recommendations.
          </p>
        </div>

        {/* Big Overall voice Score circle */}
        <div className="p-6 bg-zinc-900/90 border border-zinc-800 rounded-2xl flex flex-col items-center justify-center shrink-0 min-w-44 text-center relative z-10">
          <span className="text-[10px] uppercase font-bold text-zinc-500 font-mono tracking-widest">
            OVERALL VOICE RATING
          </span>
          <div className="mt-3">
            <span className="text-5xl font-black text-indigo-400">
              {report.overall_voice_score}%
            </span>
          </div>
          <div className="mt-2.5 px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[9px] font-mono rounded-lg">
            {report.overall_voice_score >= 85 ? "EXCELLENT SHIELD" : report.overall_voice_score >= 70 ? "PROFESSIONAL STANDARD" : "PRACTICE DRILLS REQUIRED"}
          </div>
        </div>
      </div>

      {/* Visual Analytics Row: Radar chart & filler bar chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Speech Profile */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              Speech Profile Index
            </h3>
            <p className="text-[11px] text-zinc-400">Multidimensional metric profile parsed via Whisper & AI Engine.</p>
          </div>

          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="#e4e4e7" />
                <PolarAngleAxis dataKey="name" tick={{ fill: "#71717a", fontSize: 10, fontWeight: 500 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#a1a1aa" }} />
                <Radar
                  name="Speech"
                  dataKey="score"
                  stroke="#4f46e5"
                  fill="#818cf8"
                  fillOpacity={0.25}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Filler Word analytics */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-widest flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              Vocal Crutches & Filler Words
            </h3>
            <p className="text-[11px] text-zinc-400">Frequency of non-lexical placeholders that distract from arguments.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-center space-y-1">
              <span className="text-[10px] text-zinc-400 block font-mono uppercase">Filler Density</span>
              <span className="text-2xl font-black text-red-500 block">
                {report.filler_words_summary.filler_percentage}%
              </span>
              <span className="text-[9px] text-zinc-400 block font-mono">Of total answer count</span>
            </div>
            <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-center space-y-1">
              <span className="text-[10px] text-zinc-400 block font-mono uppercase">Dominant Filler</span>
              <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100 block truncate mt-1">
                "{report.filler_words_summary.most_used_filler}"
              </span>
              <span className="text-[9px] text-zinc-400 block font-mono">
                {report.filler_words_summary.total_filler_count} occurrences total
              </span>
            </div>
          </div>

          {fillerBarData.length > 0 ? (
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={fillerBarData}>
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 9 }} allowDecimals={false} />
                  <Tooltip wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="count" fill="#f43f5e" radius={[4, 4, 0, 0]}>
                    {fillerBarData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? "#ef4444" : "#f43f5e"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="p-6 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-400 font-mono text-[10px]">
              No filler words captured! Outstanding verbal pacing.
            </div>
          )}
        </div>
      </div>

      {/* Speaking speed & Pronunciation Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Speed analysis */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-widest flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              Speaking Speed Pacing
            </h3>
            <span className="px-2.5 py-0.5 bg-indigo-500/10 text-indigo-500 rounded text-[9px] font-mono font-bold">
              {report.speaking_speed_summary.average_wpm} WPM
            </span>
          </div>
          <div className="space-y-2">
            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
              Status: {report.speaking_speed_summary.status}
            </span>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-normal">
              {report.speaking_speed_summary.advice}
            </p>
          </div>
        </div>

        {/* Pronunciation issues */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-widest flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-indigo-500" />
              Articulation Suggestions
            </h3>
            <span className="px-2.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-[9px] font-mono text-zinc-400">
              {report.pronunciation_issues.length} detected
            </span>
          </div>
          <div className="space-y-2.5">
            {report.pronunciation_issues.map((issue, idx) => (
              <div key={idx} className="text-[11px] text-zinc-600 dark:text-zinc-400 flex items-start gap-2 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                <span>{issue}</span>
              </div>
            ))}
            {report.pronunciation_issues.length === 0 && (
              <p className="text-[11px] text-zinc-400 italic">No terminology errors or pronunciation slips detected. Speech is remarkably clear.</p>
            )}
          </div>
        </div>
      </div>

      {/* Grammar issues */}
      {report.grammar_issues.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 space-y-4">
          <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-widest flex items-center gap-1.5">
              <Smile className="w-4 h-4 text-amber-500" />
              Grammatical Corrections
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {report.grammar_issues.map((issue, idx) => (
              <div key={idx} className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed flex items-start gap-2">
                <span className="text-amber-500 font-bold font-mono">!</span>
                <span>{issue}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 space-y-4">
          <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-widest flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-emerald-500" />
            Communication Strengths
          </h3>
          <ul className="space-y-3">
            {report.strengths.map((str, idx) => (
              <li key={idx} className="text-xs text-zinc-600 dark:text-zinc-400 flex items-start gap-2.5 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 space-y-4">
          <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-widest flex items-center gap-1.5">
            <Target className="w-4 h-4 text-red-500" />
            Development Areas
          </h3>
          <ul className="space-y-3">
            {report.weaknesses.map((weak, idx) => (
              <li key={idx} className="text-xs text-zinc-600 dark:text-zinc-400 flex items-start gap-2.5 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-1.5" />
                <span>{weak}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recommendations & Practice Matrix */}
      <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-6">
        <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-widest flex items-center gap-1.5">
          <Bookmark className="w-4 h-4 text-indigo-500" />
          Targeted Speech Training Plan
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <span className="text-[10px] font-bold text-zinc-400 uppercase font-mono block">Actionable Suggestions</span>
            <div className="space-y-3">
              {report.suggestions.map((sug, idx) => (
                <div key={idx} className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
                  {sug}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-[10px] font-bold text-zinc-400 uppercase font-mono block">Recommended Practice Drills</span>
            <div className="space-y-3">
              {report.recommended_practice.map((prac, idx) => (
                <div key={idx} className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
                  {prac}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

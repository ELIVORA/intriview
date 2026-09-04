import React from "react";
import { MessageSquare, Mic, TrendingUp } from "lucide-react";

interface EnglishDashboardProps {
  communication: any;
  onStartChallenge: () => void;
}

const Metric = ({ label, value }: { label: string; value: number }) => (
  <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4">
    <div className="flex items-center justify-between text-xs font-bold"><span>{label}</span><span>{value ? `${Math.round(value)}%` : "—"}</span></div>
    <div className="mt-2 h-2 rounded-full bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.max(0, Math.min(100, value || 0))}%` }} />
    </div>
  </div>
);

export function EnglishDashboard({ communication, onStartChallenge }: EnglishDashboardProps) {
  const hasEvidence = Number(communication?.sessions || 0) > 0;
  const overall = hasEvidence ? Math.round((communication.grammar + communication.fluency + communication.confidence + communication.clarity) / 4) : 0;
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-indigo-200/60 dark:border-indigo-900/40 bg-gradient-to-br from-indigo-50 via-white to-violet-50 dark:from-indigo-950/30 dark:via-zinc-950 dark:to-violet-950/20 p-6 sm:p-8">
        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-indigo-600">Personal English Mentor</span>
        <h2 className="text-2xl sm:text-3xl font-black mt-2">Speak naturally. Improve over time.</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2 max-w-2xl">Have a real conversation, get gentle corrections, and let the coach remember the patterns you repeatedly want to improve.</p>
        <button onClick={onStartChallenge} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 text-white px-4 py-3 text-xs font-bold"><Mic className="w-4 h-4" /> Start speaking practice</button>
      </section>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        <Metric label="Overall" value={overall} />
        <Metric label="Grammar" value={communication?.grammar || 0} />
        <Metric label="Fluency" value={communication?.fluency || 0} />
        <Metric label="Confidence" value={communication?.confidence || 0} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5">
          <h3 className="font-black flex items-center gap-2"><TrendingUp className="w-4 h-4 text-indigo-500" /> What your coach remembers</h3>
          <div className="mt-4 space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
            <p><b className="text-zinc-900 dark:text-white">Sessions:</b> {communication?.sessions || 0}</p>
            <p><b className="text-zinc-900 dark:text-white">Recurring grammar patterns:</b> {communication?.recurring_grammar_errors?.length ? communication.recurring_grammar_errors.join(", ") : "None detected yet."}</p>
            <p><b className="text-zinc-900 dark:text-white">Communication weaknesses:</b> {communication?.recurring_communication_weaknesses?.length ? communication.recurring_communication_weaknesses.join(", ") : "None detected yet."}</p>
          </div>
        </section>
        <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5">
          <h3 className="font-black flex items-center gap-2"><MessageSquare className="w-4 h-4 text-indigo-500" /> Coaching approach</h3>
          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400 leading-6">The coach responds naturally first, then explains one or two useful improvements. It should encourage you, not interrupt every sentence with grammar warnings.</p>
        </section>
      </div>
    </div>
  );
}

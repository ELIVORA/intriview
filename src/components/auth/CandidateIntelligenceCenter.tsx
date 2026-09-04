import React, { useEffect, useMemo, useState } from "react";
import {
  BrainCircuit,
  TrendingUp,
  TrendingDown,
  Target,
  BookOpenCheck,
  MessageCircle,
  Code2,
  History,
  Sparkles,
  RefreshCw,
  ArrowUpRight,
  ShieldCheck,
  AlertTriangle
} from "lucide-react";
import { getCandidateMemory, getCandidateMemoryContext, CandidateMemorySnapshot } from "../../services/candidateMemory";

function Metric({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{label}</span>
        <span className="text-lg font-black text-zinc-900 dark:text-white">{Math.round(value || 0)}%</span>
      </div>
      <div className="mt-3 h-2 rounded-full bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
        <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${Math.max(0, Math.min(100, value || 0))}%` }} />
      </div>
      {hint && <p className="mt-2 text-[10px] text-zinc-500">{hint}</p>}
    </div>
  );
}

export function CandidateIntelligenceCenter({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const [memory, setMemory] = useState<CandidateMemorySnapshot | null>(null);
  const [recentQuestionAnswers, setRecentQuestionAnswers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [snapshot, context] = await Promise.all([getCandidateMemory(), getCandidateMemoryContext()]);
      setMemory(snapshot);
      setRecentQuestionAnswers(context?.recent_question_answers || []);
    } catch (e: any) {
      setError(e?.message || "Unable to load Candidate Memory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const topicRows = useMemo(() => memory ? Object.entries(memory.topics || {}).sort((a: any, b: any) => (a[1]?.score || 0) - (b[1]?.score || 0)).slice(0, 8) : [], [memory]);
  const recent = memory?.interview_history?.slice(-6).reverse() || [];

  if (loading) return <div className="p-10 text-center text-sm text-zinc-500">Loading your persistent Candidate Memory…</div>;
  if (error) return (
    <div className="rounded-2xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/60 dark:bg-rose-950/20 p-6 text-center">
      <AlertTriangle className="w-6 h-6 mx-auto text-rose-500" />
      <p className="text-sm font-semibold mt-2">Candidate Memory is not available yet.</p>
      <p className="text-xs text-zinc-500 mt-1">{error}</p>
      <button onClick={load} className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-bold"><RefreshCw className="w-3.5 h-3.5" />Retry</button>
    </div>
  );

  const m = memory!;
  return (
    <div className="space-y-6 ic-feature-root ic-intelligence-workspace" id="candidate-intelligence-center">
      <div className="rounded-3xl border border-indigo-200/60 dark:border-indigo-900/40 bg-gradient-to-br from-indigo-50 via-white to-violet-50 dark:from-indigo-950/30 dark:via-zinc-950 dark:to-violet-950/20 p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row justify-between gap-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600">Persistent Candidate Intelligence</span>
            <h2 className="text-2xl sm:text-3xl font-black mt-2 text-zinc-900 dark:text-white flex items-center gap-2"><BrainCircuit className="w-7 h-7 text-indigo-500" /> Your AI Memory</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2 max-w-2xl">Interview Cracker remembers your resume evidence, interview performance, communication patterns and weak topics so every new session can become more personalized.</p>
          </div>
          <div className="min-w-[180px] rounded-2xl bg-white/70 dark:bg-zinc-900/70 border border-white dark:border-zinc-800 p-5 text-center">
            <span className="text-[10px] uppercase font-bold text-zinc-500">Interview Readiness</span>
            <div className="text-4xl font-black text-indigo-600 mt-1">{Math.round(m.readiness.overall || 0)}%</div>
            <div className="text-[10px] font-semibold text-emerald-600 mt-1">{m.readiness.trend}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Metric label="Technical" value={m.readiness.technical} hint="Knowledge + problem solving" />
        <Metric label="Communication" value={m.readiness.communication} hint="English + interview delivery" />
        <Metric label="Behavioral" value={m.readiness.behavioral} hint="Confidence + professionalism" />
        <Metric label="Resume Alignment" value={m.readiness.resume_alignment} hint="Resume quality and role fit" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5">
          <div className="flex items-center justify-between mb-4"><h3 className="font-black flex items-center gap-2"><Target className="w-4 h-4 text-indigo-500" /> Topics to improve</h3><span className="text-[10px] text-zinc-500">Adaptive algorithm</span></div>
          <div className="space-y-3">
            {topicRows.length ? topicRows.map(([topic, data]: any) => (
              <div key={topic} className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900">
                <div className="flex-1"><div className="text-xs font-bold">{topic}</div><div className="text-[10px] text-zinc-500 mt-1">{data.assessment_count || 0} assessments · {data.status}</div></div>
                <span className={`text-sm font-black ${data.score < 55 ? "text-rose-500" : data.score < 70 ? "text-amber-500" : "text-emerald-500"}`}>{Math.round(data.score || 0)}%</span>
              </div>
            )) : <p className="text-xs text-zinc-500">Complete an interview to create your first topic map.</p>}
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5">
          <h3 className="font-black flex items-center gap-2"><Sparkles className="w-4 h-4 text-indigo-500" /> Strengths</h3>
          <div className="mt-4 space-y-2">{m.strengths.slice(-6).reverse().map((x: any, i: number) => <div key={`${x.text}-${i}`} className="text-xs p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300">{x.text}</div>)}{!m.strengths.length && <p className="text-xs text-zinc-500">Your strengths will be learned from evidence.</p>}</div>
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5">
          <h3 className="font-black flex items-center gap-2"><MessageCircle className="w-4 h-4 text-indigo-500" /> English Communication Memory</h3>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <Metric label="Grammar" value={m.communication.grammar} />
            <Metric label="Fluency" value={m.communication.fluency} />
            <Metric label="Vocabulary" value={m.communication.vocabulary} />
            <Metric label="Confidence" value={m.communication.confidence} />
          </div>
          <div className="mt-4 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 text-xs"><b>Recurring patterns:</b> {m.communication.recurring_grammar_errors.length ? m.communication.recurring_grammar_errors.join(", ") : "None detected yet."}</div>
        </section>

        <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5">
          <h3 className="font-black flex items-center gap-2"><BookOpenCheck className="w-4 h-4 text-indigo-500" /> Personalized improvement plan</h3>
          <div className="mt-4 space-y-3">{m.improvement_plan.length ? m.improvement_plan.slice(0, 6).map((p: any, i: number) => <div key={`${p.topic}-${i}`} className="p-3 rounded-xl border border-zinc-100 dark:border-zinc-800"><div className="flex items-center justify-between"><span className="text-xs font-bold">{p.topic}</span><span className="text-[9px] uppercase font-bold text-indigo-500">{p.priority}</span></div><p className="text-[10px] text-zinc-500 mt-1">{p.action}</p></div>) : <p className="text-xs text-zinc-500">Your plan will appear after enough evidence is collected.</p>}</div>
        </section>
      </div>

      <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5">
        <div className="flex items-center justify-between"><h3 className="font-black flex items-center gap-2"><History className="w-4 h-4 text-indigo-500" /> Persistent question & answer memory</h3><span className="text-[10px] text-zinc-500">Last {Math.min(6, recentQuestionAnswers.length)} evidence items</span></div>
        <div className="mt-4 space-y-3">
          {recentQuestionAnswers.slice(-6).reverse().map((item: any, i: number) => (
            <div key={`${item.session_id}-${i}`} className="rounded-xl border border-zinc-100 dark:border-zinc-800 p-3 bg-zinc-50/70 dark:bg-zinc-900/60">
              <div className="text-[10px] uppercase font-bold text-indigo-500">{item.topic || "Interview topic"} · {item.mode === "resume_practice" ? "Resume Practice" : "AI Mock"}</div>
              <p className="text-xs font-bold mt-1">Q: {item.question}</p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">A: {item.answer}</p>
              {item.score != null && <span className="inline-block mt-2 text-[10px] font-black">Score: {item.score}%</span>}
            </div>
          ))}
          {!recentQuestionAnswers.length && <p className="text-xs text-zinc-500">Your previous questions and answers will appear here after your first interview.</p>}
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5">
        <div className="flex items-center justify-between"><h3 className="font-black flex items-center gap-2"><History className="w-4 h-4 text-indigo-500" /> Interview history</h3><button onClick={load} className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900"><RefreshCw className="w-4 h-4" /></button></div>
        <div className="overflow-x-auto mt-4"><table className="w-full text-left text-xs"><thead><tr className="text-[10px] uppercase text-zinc-500 border-b border-zinc-100 dark:border-zinc-800"><th className="py-2">Mode</th><th>Type</th><th>Score</th><th>Technical</th><th>Communication</th><th>Date</th></tr></thead><tbody>{recent.map((x: any) => <tr key={x.session_id} className="border-b border-zinc-50 dark:border-zinc-900"><td className="py-3 font-bold">{x.mode === "resume_practice" ? "Resume Practice" : "AI Mock"}</td><td>{x.type}</td><td className="font-black">{x.score}%</td><td>{x.technical_score}%</td><td>{x.communication_score}%</td><td>{new Date(x.created_at).toLocaleDateString()}</td></tr>)}{!recent.length && <tr><td colSpan={6} className="py-8 text-center text-zinc-500">No completed interviews yet.</td></tr>}</tbody></table></div>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button onClick={() => onNavigate?.("resume")} className="p-4 rounded-2xl bg-zinc-900 text-white text-left"><div className="flex justify-between"><Code2 className="w-5 h-5" /><ArrowUpRight className="w-4 h-4" /></div><div className="font-black mt-5">Adaptive Resume Interview</div><div className="text-[10px] text-zinc-400 mt-1">Target your weakest topics automatically.</div></button>
        <button onClick={() => onNavigate?.("communication")} className="p-4 rounded-2xl bg-indigo-600 text-white text-left"><div className="flex justify-between"><MessageCircle className="w-5 h-5" /><ArrowUpRight className="w-4 h-4" /></div><div className="font-black mt-5">Communication Coach</div><div className="text-[10px] text-indigo-100 mt-1">Improve grammar, fluency and professional speaking.</div></button>
        <button onClick={() => onNavigate?.("career")} className="p-4 rounded-2xl bg-emerald-600 text-white text-left"><div className="flex justify-between"><ShieldCheck className="w-5 h-5" /><ArrowUpRight className="w-4 h-4" /></div><div className="font-black mt-5">Readiness Roadmap</div><div className="text-[10px] text-emerald-100 mt-1">Turn memory into a daily improvement plan.</div></button>
      </div>
    </div>
  );
}

export default CandidateIntelligenceCenter;

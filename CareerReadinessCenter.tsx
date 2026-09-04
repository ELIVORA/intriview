/**
 * Interview Cracker — Career Readiness Center
 * Combines resume, interview, coding and communication evidence into one
 * transparent preparation score. Scores are practice indicators, not hiring predictions.
 */
import React, { useEffect, useMemo, useState } from "react";
import { getCandidateMemory } from "../../services/candidateMemory";
import {
  Target, TrendingUp, CheckCircle2, AlertTriangle, CalendarDays,
  BriefcaseBusiness, ArrowRight, RotateCcw
} from "lucide-react";

interface CareerReadinessCenterProps {
  email: string;
  profile: {
    fullName: string;
    university: string;
    graduationYear: string;
    targetRoles: string[];
    skills: string[];
  };
  onNavigate: (tab: "resume" | "coding") => void;
}

type PlanItem = { day: number; title: string; reason: string; area: string };

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(Number.isFinite(value) ? value : 0)));

export function CareerReadinessCenter({ email, profile, onNavigate }: CareerReadinessCenterProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedRole, setSelectedRole] = useState(profile.targetRoles?.[0] || "");

  const [memory, setMemory] = useState<any>(null);
  const [memoryError, setMemoryError] = useState("");

  useEffect(() => {
    getCandidateMemory().then(setMemory).catch((e) => setMemoryError(e?.message || "Unable to load candidate data."));
  }, [refreshKey]);

  const data = useMemo(() => {
    const readiness = memory?.readiness || { overall: 0, technical: 0, communication: 0, behavioral: 0, resume_alignment: 0, trend: "new" };
    const history = memory?.interview_history || [];
    const coding = Number(memory?.technical?.coding || 0);
    const components = [
      { key: "Resume", score: Number(readiness.resume_alignment || 0), weight: 0.25, missing: !readiness.resume_alignment },
      { key: "Interview", score: Number(readiness.technical || 0), weight: 0.25, missing: !history.length },
      { key: "Coding", score: coding, weight: 0.20, missing: !coding },
      { key: "Communication", score: Number(readiness.communication || 0), weight: 0.15, missing: !(memory?.communication?.sessions) },
      { key: "Behavioral", score: Number(readiness.behavioral || 0), weight: 0.15, missing: !history.length }
    ];
    const gaps = [...components].filter(x => x.missing || x.score < 70).sort((a,b) => a.score - b.score).slice(0,3);
    const plan = (memory?.improvement_plan || []).slice(0,7).map((p:any,i:number) => ({day:i+1,title:`Practice ${p.topic}`,reason:p.reason,area:p.topic}));
    return { readiness: Number(readiness.overall || 0), components, gaps, plan, memory, history };
  }, [memory, refreshKey]);

  return (
    <div className="space-y-6 ic-feature-root ic-career-workspace">
      <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-blue-600">Career intelligence</p>
            <h2 className="text-3xl font-bold mt-2 text-slate-900 dark:text-white">Placement Readiness</h2>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-2 max-w-2xl">
              A transparent practice score built from evidence in your resume, interviews, coding attempts,
              communication practice and profile completeness.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-28 h-28 rounded-full border-8 border-blue-100 dark:border-blue-950 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-black text-slate-900 dark:text-white">{data.readiness}</div>
                <div className="text-[9px] uppercase tracking-widest text-slate-400">/100</div>
              </div>
            </div>
            <div>
              <div className="font-bold text-slate-900 dark:text-white">{data.readiness >= 70 ? "On track" : data.readiness > 0 ? "Needs preparation" : "No evidence yet"}</div>
              <button onClick={() => setRefreshKey(k => k + 1)} className="mt-2 text-xs text-blue-600 inline-flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5" /> Refresh evidence
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
        {data.components.map(item => (
          <div key={item.key} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4">
            <div className="text-xs font-semibold text-slate-500 dark:text-zinc-400">{item.key}</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{clamp(item.score)}</div>
            <div className="h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full mt-3 overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full" style={{ width: `${clamp(item.score)}%` }} />
            </div>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5"><Target className="w-5 h-5 text-blue-600" /><h3 className="font-bold">Priority gaps</h3></div>
          <div className="space-y-3">
            {data.gaps.map((gap, i) => (
              <div key={gap.key} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                  <span className="text-sm font-semibold">{gap.key}</span>
                </div>
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              </div>
            ))}
            {!data.gaps.length && <p className="text-sm text-slate-500">Complete a few activities to generate meaningful gaps.</p>}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5"><BriefcaseBusiness className="w-5 h-5 text-blue-600" /><h3 className="font-bold">Target-role matcher</h3></div>
          <select value={selectedRole} onChange={e => setSelectedRole(e.target.value)} className="w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950 px-3 py-2.5 text-sm">
            {(profile.targetRoles?.length ? profile.targetRoles : []).map(role => <option key={role}>{role}</option>)}
          </select>
          <div className="mt-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50">
            <div className="text-xs text-blue-700 dark:text-blue-300 font-semibold">Current target</div>
            <div className="text-lg font-bold mt-1">{selectedRole}</div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-2">Use the roadmap below to build evidence for this role.</p>
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5"><CalendarDays className="w-5 h-5 text-blue-600" /><h3 className="font-bold">7-day adaptive preparation plan</h3></div>
        <div className="grid gap-3">
          {data.plan.length ? data.plan.map(day => (
            <div key={day.day} className="flex gap-4 p-4 rounded-xl border border-slate-100 dark:border-zinc-800">
              <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-black">{day.day}</div>
              <div className="flex-1">
                <div className="font-semibold text-sm">{day.title}</div>
                <div className="text-xs text-slate-500 dark:text-zinc-400 mt-1">{day.reason}</div>
              </div>
              <span className="self-start text-[10px] px-2 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">{day.area}</span>
            </div>
          )) : <p className="text-sm text-slate-500">Complete a real interview, coding attempt, or communication session to generate a personalized roadmap.</p>}
        </div>
      </section>

      {memoryError && <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 text-sm">{memoryError}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button onClick={() => onNavigate("resume")} className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-left hover:border-blue-300">
          <TrendingUp className="w-5 h-5 text-blue-600" /><div className="font-bold mt-2 text-sm">Improve resume</div><div className="text-xs text-slate-500 mt-1">Run a fresh ATS analysis.</div>
        </button>
        <button onClick={() => onNavigate("resume")} className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-left hover:border-blue-300">
          <CheckCircle2 className="w-5 h-5 text-blue-600" /><div className="font-bold mt-2 text-sm">Practice interview</div><div className="text-xs text-slate-500 mt-1">Generate evidence for technical readiness.</div>
        </button>
        <button onClick={() => onNavigate("coding")} className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-left hover:border-blue-300">
          <ArrowRight className="w-5 h-5 text-blue-600" /><div className="font-bold mt-2 text-sm">Open coding arena</div><div className="text-xs text-slate-500 mt-1">Solve a role-relevant challenge.</div>
        </button>
      </div>
    </div>
  );
}

/**
 * Interview Cracker - AI Coding Arena
 * @license SPDX-License-Identifier: Apache-2.0
 */
import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Code2, Lightbulb, Loader2, Play, RotateCcw, Trophy } from "lucide-react";
import { api } from "../../services/api";
import { getCandidateMemory, recordCodingResult } from "../../services/candidateMemory";

interface CodingArenaProps {
  email: string;
  profile: any;
}

type Language = "python" | "javascript" | "typescript" | "java" | "cpp" | "csharp" | "c" | "go" | "rust" | "php" | "kotlin" | "swift" | "sql" | "bash";
type Difficulty = "Easy" | "Medium" | "Hard";
type Mode = "Practice" | "Resume Practice" | "Company Practice" | "Debugging" | "SQL Practice";

const starterCode: Record<Language, string> = {
  python: "def solve(nums, target):\n    # Write your solution here\n    pass\n",
  javascript: "function solve(nums, target) {\n  // Write your solution here\n}\n",
  java: "class Solution {\n    public int[] solve(int[] nums, int target) {\n        // Write your solution here\n        return new int[]{};\n    }\n}\n",
  cpp: "#include <vector>\nusing namespace std;\n\nvector<int> solve(vector<int> nums, int target) {\n    // Write your solution here\n    return {};\n}\n",
  typescript: "function solve(nums: number[], target: number): number[] {\n  // Write your solution here\n  return [];\n}\n",
  c: "#include <stdio.h>\nint solve(int nums[], int n, int target) { return 0; }\n",
  csharp: "public class Solution { public int Solve(int[] nums, int target) { return 0; } }\n",
  go: "package main\nfunc solve(nums []int, target int) int { return 0 }\n",
  rust: "fn solve(nums: Vec<i32>, target: i32) -> i32 { 0 }\n",
  php: "<?php\nfunction solve($nums, $target) { return 0; }\n",
  kotlin: "fun solve(nums: IntArray, target: Int): Int = 0\n",
  swift: "func solve(_ nums: [Int], _ target: Int) -> Int { return 0 }\n",
  sql: "-- Write your SQL query here\nSELECT * FROM employees;\n",
  bash: "#!/usr/bin/env bash\n# Write your shell solution here\n",
};

export function CodingArena({ email, profile }: CodingArenaProps) {
  const [language, setLanguage] = useState<Language>("python");
  const [difficulty, setDifficulty] = useState<Difficulty>("Medium");
  const [mode, setMode] = useState<Mode>("Practice");
  const [category, setCategory] = useState("Arrays");
  const [company, setCompany] = useState("");
  const [problem, setProblem] = useState<any>(null);
  const [code, setCode] = useState(starterCode.python);
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState("");
  const [evaluation, setEvaluation] = useState<any>(null);
  const [hintsShown, setHintsShown] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [resumeContext, setResumeContext] = useState<any>(null);

  useEffect(() => {
    getCandidateMemory().then((m:any) => {
      const remote = m?.technical?.coding_history;
      if (Array.isArray(remote)) setHistory(remote);
      setResumeContext({ resume: m?.resume_profile || {}, skills: m?.skills || {}, weaknesses: m?.weaknesses || [], topics: m?.topics || {}, technical: m?.technical || {} });
    }).catch(() => setResumeContext(null));
  }, [email]);

  const averageScore = useMemo(() => history.length ? Math.round(history.reduce((s, x) => s + Number(x.score || 0), 0) / history.length) : 0, [history]);

  const generateProblem = async () => {
    setLoading(true); setError(""); setEvaluation(null); setHintsShown(0);
    try {
      const response = await api.post("/v1/coding/problems/recommend", {
        resumeData: { profile, ...(resumeContext || {}) },
        role: profile?.targetRoles?.[0] || "Software Engineer",
        company,
        language,
        difficulty,
        mode,
        category,
        codingHistory: history.slice(0, 10).map(h => h.title),
        pastPerformance: { averageScore, recentAttempts: history.slice(0, 10) },
      });
      const next = response.data?.problem;
      if (!next) throw new Error("The server did not return a coding problem.");
      setProblem(next);
      const template = next.templates?.[language] || starterCode[language];
      setCode(template);
    } catch (e: any) {
      setError(e?.message || "Unable to generate a problem. Check that the server is running.");
    } finally { setLoading(false); }
  };

  const evaluate = async () => {
    if (!problem) return;
    setEvaluating(true); setError("");
    try {
      const response = await api.post("/v1/coding/evaluate", { code, language, problem });
      const result = response.data?.evaluation;
      if (!result) throw new Error("The server did not return an evaluation.");
      setEvaluation(result);
      const entry = { id: Date.now(), title: problem.title, score: Number(result.correctness_score || 0), status: result.status, language, date: new Date().toISOString(), category, difficulty };
      setHistory(prev => [entry, ...prev].slice(0, 50));
      await recordCodingResult(entry);
    } catch (e: any) {
      setError(e?.message || "Unable to evaluate the submission.");
    } finally { setEvaluating(false); }
  };

  const resetCode = () => setCode(problem?.templates?.[language] || starterCode[language]);

  return (
    <div className="space-y-6 ic-feature-root ic-coding-workspace">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2"><Code2 className="text-indigo-500" size={26} /><h1 className="text-2xl font-bold">AI Coding Arena</h1></div>
          <p className="text-sm text-slate-500 mt-1">Practice coding interviews and receive AI-powered technical feedback.</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border px-4 py-2 bg-white dark:bg-zinc-900"><Trophy size={18} /><span className="text-sm">Average: <b>{averageScore}/100</b></span></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 p-4 rounded-2xl border bg-white dark:bg-zinc-900">
        <select value={language} onChange={e => { const v=e.target.value as Language; setLanguage(v); setCode(starterCode[v]); }} className="rounded-lg border p-2 bg-transparent"><option value="python">Python</option><option value="javascript">JavaScript</option><option value="java">Java</option><option value="cpp">C++</option><option value="typescript">TypeScript</option><option value="c">C</option><option value="csharp">C#</option><option value="go">Go</option><option value="rust">Rust</option><option value="php">PHP</option><option value="kotlin">Kotlin</option><option value="swift">Swift</option><option value="sql">SQL</option><option value="bash">Bash/Shell</option></select>
        <select value={difficulty} onChange={e => setDifficulty(e.target.value as Difficulty)} className="rounded-lg border p-2 bg-transparent"><option>Easy</option><option>Medium</option><option>Hard</option></select>
        <select value={mode} onChange={e => setMode(e.target.value as Mode)} className="rounded-lg border p-2 bg-transparent"><option>Practice</option><option>Resume Practice</option><option>Company Practice</option><option>Debugging</option><option>SQL Practice</option></select>
        <select value={category} onChange={e => setCategory(e.target.value)} className="rounded-lg border p-2 bg-transparent"><option>Arrays</option><option>Strings</option><option>Hashing</option><option>Linked Lists</option><option>Trees</option><option>Graphs</option><option>Dynamic Programming</option><option>Recursion</option><option>OOP</option><option>Databases</option><option>Operating Systems</option><option>Computer Networks</option><option>Web Development</option><option>APIs</option><option>System Design</option><option>Software Engineering</option><option>Debugging</option><option>Git</option><option>Linux/Shell</option><option>Cybersecurity Fundamentals</option><option>SQL</option></select>
      </div>
      {mode === "Company Practice" && <input value={company} onChange={e=>setCompany(e.target.value)} placeholder="Company name (optional)" className="w-full rounded-lg border p-3 bg-transparent" />}

      <button onClick={generateProblem} disabled={loading} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-white font-semibold disabled:opacity-60">{loading ? <Loader2 className="animate-spin" size={18}/> : <Play size={18}/>} {loading ? "Generating..." : "Generate AI Problem"}</button>

      {error && <div className="flex gap-2 rounded-xl border border-red-300 bg-red-50 dark:bg-red-950/20 p-4 text-sm text-red-700"><AlertCircle size={18}/>{error}</div>}

      {problem && <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <section className="rounded-2xl border bg-white dark:bg-zinc-900 p-5 space-y-4">
          <div><div className="flex items-center justify-between gap-3"><h2 className="text-xl font-bold">{problem.title}</h2><span className="rounded-full bg-slate-100 dark:bg-zinc-800 px-3 py-1 text-xs">{problem.difficulty}</span></div><p className="text-xs text-slate-500 mt-1">{problem.category}</p></div>
          <p className="whitespace-pre-wrap text-sm leading-6">{problem.description}</p>
          {problem.constraints?.length > 0 && <div><h3 className="font-semibold text-sm">Constraints</h3><ul className="list-disc ml-5 text-sm mt-1">{problem.constraints.map((x:string,i:number)=><li key={i}>{x}</li>)}</ul></div>}
          <div><button onClick={()=>setHintsShown(v=>Math.min(v+1, problem.hints?.length || 0))} className="inline-flex items-center gap-2 text-sm font-semibold"><Lightbulb size={17}/> Show hint ({hintsShown}/{problem.hints?.length || 0})</button>{hintsShown>0 && <div className="mt-2 space-y-2 text-sm">{problem.hints.slice(0,hintsShown).map((h:string,i:number)=><div key={i} className="rounded-lg bg-amber-50 dark:bg-amber-950/20 p-3">Hint {i+1}: {h}</div>)}</div>}</div>
        </section>
        <section className="rounded-2xl border bg-slate-950 p-4 text-white space-y-3">
          <div className="flex items-center justify-between"><span className="font-semibold">{language.toUpperCase()} Editor</span><button onClick={resetCode} className="inline-flex items-center gap-1 text-xs text-slate-300"><RotateCcw size={14}/> Reset</button></div>
          <textarea value={code} onChange={e=>setCode(e.target.value)} spellCheck={false} className="w-full min-h-[360px] resize-y rounded-xl bg-slate-900 p-4 font-mono text-sm outline-none border border-slate-700" />
          <button onClick={evaluate} disabled={evaluating} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold disabled:opacity-60">{evaluating?<Loader2 className="animate-spin" size={18}/>:<CheckCircle2 size={18}/>} {evaluating?"Evaluating...":"Submit for AI Evaluation"}</button>
        </section>
      </div>}

      {evaluation && <section className="rounded-2xl border bg-white dark:bg-zinc-900 p-5"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-bold">Evaluation</h2><span className="rounded-full px-4 py-2 bg-slate-100 dark:bg-zinc-800 font-bold">{evaluation.correctness_score}/100 · {evaluation.status}</span></div><div className="grid md:grid-cols-2 gap-4 mt-4 text-sm"><div><b>Time complexity</b><p>{evaluation.time_complexity}</p></div><div><b>Space complexity</b><p>{evaluation.space_complexity}</p></div><div><b>Tests</b><p>{evaluation.test_cases_passed}/{evaluation.total_test_cases}</p></div><div><b>Code quality</b><p>{evaluation.code_quality || "Not provided"}</p></div></div><div className="mt-4 rounded-xl bg-slate-50 dark:bg-zinc-800 p-4 text-sm"><b>Feedback</b><p className="mt-1 whitespace-pre-wrap">{evaluation.feedback}</p></div>{evaluation.better_approach && <div className="mt-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 p-4 text-sm"><b>Better approach</b><p className="mt-1 whitespace-pre-wrap">{evaluation.better_approach}</p></div>}</section>}

      <section className="rounded-2xl border bg-white dark:bg-zinc-900 p-5"><h2 className="font-bold mb-3">Recent Coding Attempts</h2>{history.length===0?<p className="text-sm text-slate-500">No attempts yet. Generate a problem to begin.</p>:<div className="space-y-2">{history.slice(0,8).map(h=><div key={h.id} className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-zinc-800 p-3 text-sm"><span>{h.title} · {h.language}</span><span className="font-semibold">{h.score}/100 · {h.status}</span></div>)}</div>}</section>
    </div>
  );
}

export default CodingArena;

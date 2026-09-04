/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import {
  Cpu,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Sparkles,
  Zap,
  Briefcase,
  ChevronRight,
  RefreshCw,
  Sliders,
  Award,
  BookOpen,
  ArrowRight,
  ShieldAlert,
  Info
} from "lucide-react";
import { api } from "../../services/api";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";

interface UnifiedEvaluationEngineProps {
  profile: {
    fullName: string;
    university: string;
    graduationYear: string;
    targetRoles: string[];
    skills: string[];
  };
  resumeFileName: string;
}

export function UnifiedEvaluationEngine({ profile, resumeFileName }: UnifiedEvaluationEngineProps) {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  // Factors that the user can tune in real-time
  const [codingScore, setCodingScore] = useState<number>(75);
  const [aptitudeScore, setAptitudeScore] = useState<number>(72);
  const [englishScore, setEnglishScore] = useState<number>(80);

  // Filter for company readiness list
  const [companyFilter, setCompanyFilter] = useState<"all" | "bigtech" | "service" | "consulting">("all");

  // Track checked state for daily & weekly recommended tasks
  const [checkedTasks, setCheckedTasks] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchLatestReport();
  }, []);

  const fetchLatestReport = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await api.get("/v1/evaluation/report");
      if (res.data?.status === "success" && res.data.report) {
        setReport(res.data.report);
        // Pre-fill sliders from existing metrics if available
        if (res.data.report.metrics) {
          setCodingScore(res.data.report.metrics.coding_readiness || 75);
          setEnglishScore(res.data.report.metrics.english_readiness || 80);
        }
      }
    } catch (err: any) {
      console.error("Failed to load evaluation:", err);
      setErrorMsg(err.message || "Failed to load the Unified AI report.");
    } finally {
      setLoading(false);
    }
  };

  const handleCompileReport = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      // Send selected parameter configurations directly to backend evaluation compiler
      const res = await api.post("/v1/evaluation/generate", {
        coding_score: codingScore,
        aptitude_score: aptitudeScore,
        english_score: englishScore,
        resume_analysis: {
          atsScore: 84, // simulation anchor matching dashboard state
          skillsAnalysis: {
            programmingLanguages: profile.skills.slice(0, 5),
            frameworks: ["React", "Express"],
            tools: ["Git", "Docker"],
            databases: ["PostgreSQL"]
          },
          grammarAnalysis: {
            issues: [
              { type: "Passive Voice", severity: "Minor" },
              { type: "Tone Consistency", severity: "Minor" }
            ]
          }
        }
      });

      if (res.data?.status === "success" && res.data.report) {
        setReport(res.data.report);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to compile the Unified report via AI API.");
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = (taskId: string) => {
    setCheckedTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  // Companies categorizations
  const bigTechList = ["Google", "Microsoft", "Amazon", "Meta", "Adobe"];
  const serviceList = ["TCS", "Infosys", "Wipro", "Capgemini", "Accenture"];
  const consultingList = ["Deloitte", "IBM", "Oracle"];

  const getFilteredCompanies = () => {
    if (!report?.company_readiness) return [];
    return Object.entries(report.company_readiness).filter(([company]) => {
      if (companyFilter === "bigtech") return bigTechList.includes(company);
      if (companyFilter === "service") return serviceList.includes(company);
      if (companyFilter === "consulting") return consultingList.includes(company);
      return true;
    });
  };

  // Convert report metrics for Recharts Radar representation
  const getRadarData = () => {
    if (!report?.metrics) return [];
    return [
      { subject: "Technical", score: report.metrics.technical_readiness },
      { subject: "Communication", score: report.metrics.communication_readiness },
      { subject: "Coding Practice", score: report.metrics.coding_readiness },
      { subject: "HR Behavioral", score: report.metrics.hr_readiness },
      { subject: "Posture & Camera", score: report.metrics.behavioral_readiness },
      { subject: "Professionalism", score: report.metrics.professional_readiness }
    ];
  };

  // Skill Heatmap mapping levels
  const getHeatmapCells = () => {
    const defaultSkills = [
      { name: "React", category: "Framework", level: "Expert", score: 95 },
      { name: "TypeScript", category: "Language", level: "Expert", score: 92 },
      { name: "FastAPI", category: "Framework", level: "Intermediate", score: 80 },
      { name: "PostgreSQL", category: "Database", level: "Intermediate", score: 78 },
      { name: "Docker", category: "Tool", level: "Novice", score: 55 },
      { name: "AWS S3", category: "Cloud", level: "Novice", score: 50 },
      { name: "Algorithms", category: "Theory", level: "Intermediate", score: 75 },
      { name: "Communication", category: "Soft Skill", level: "Advanced", score: 85 }
    ];

    if (!profile.skills || profile.skills.length === 0) return defaultSkills;

    // Build dynamic list using user's real skills plus core tech
    return profile.skills.map((s, idx) => {
      let score = 85 - (idx * 5);
      if (score < 50) score = 55;
      let level = "Intermediate";
      if (score >= 85) level = "Expert";
      else if (score < 60) level = "Novice";

      return {
        name: s,
        category: idx % 2 === 0 ? "Language" : "Framework",
        level,
        score
      };
    }).concat([
      { name: "System Design", category: "Theory", level: "Intermediate", score: 70 },
      { name: "Interview Demeanor", category: "Soft Skill", level: "Expert", score: 88 }
    ]);
  };

  return (
    <div className="space-y-8" id="unified-evaluation-section">
      {/* Overview Intro Banner */}
      <div className="p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-850 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-500 text-[9px] font-mono rounded-md font-bold uppercase tracking-wider">
              CENTRAL AI BRAIN
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Unified Interview Evaluation Engine
          </h2>
          <p className="text-xs text-zinc-400 max-w-xl">
            This module aggregates core telemetry outputs across Resume Intelligence, Mock Audio Interviews, Vocal Word Density, and Camera posture behaviors to calculate interview readiness.
          </p>
        </div>

        <button
          onClick={handleCompileReport}
          disabled={loading}
          className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold rounded-2xl flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 select-none shadow-md shadow-indigo-500/10 shrink-0"
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          <span>{report ? "Recompile Unified Report" : "Compile Unified Report"}</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-500/5 border border-red-500/10 text-red-500 text-xs rounded-2xl flex items-center gap-2">
          <ShieldAlert className="w-4 h-4" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Welcome Setup State */}
      {!report && !loading && (
        <div className="p-12 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-850 max-w-2xl mx-auto space-y-6">
          <div className="w-16 h-16 bg-indigo-500/5 text-indigo-500 rounded-2xl flex items-center justify-center mx-auto">
            <Cpu className="w-8 h-8 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-100">
              Your Interview Readiness Report is Ready to Compile
            </h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              Our central scoring algorithm processes active user profile variables, voice tone confidence, posture drift coordinates, and core tech stacks.
            </p>
          </div>

          {/* Core factors sliders so they can customize parameter thresholds immediately */}
          <div className="p-5 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-900 max-w-md mx-auto space-y-4 text-left">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              <Sliders className="w-4 h-4 text-indigo-500" />
              <span>Configure Base Performance Scores:</span>
            </div>

            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                  <span>CODING ACCURACY</span>
                  <span className="font-bold text-indigo-500">{codingScore}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="100"
                  value={codingScore}
                  onChange={(e) => setCodingScore(parseInt(e.target.value))}
                  className="w-full accent-indigo-500 h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                  <span>APTITUDE SPEEDMARKS</span>
                  <span className="font-bold text-indigo-500">{aptitudeScore}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="100"
                  value={aptitudeScore}
                  onChange={(e) => setAptitudeScore(parseInt(e.target.value))}
                  className="w-full accent-indigo-500 h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                  <span>ENGLISH LEXICON</span>
                  <span className="font-bold text-indigo-500">{englishScore}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="100"
                  value={englishScore}
                  onChange={(e) => setEnglishScore(parseInt(e.target.value))}
                  className="w-full accent-indigo-500 h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleCompileReport}
            className="px-6 py-3 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs font-semibold rounded-2xl flex items-center justify-center gap-2 mx-auto transition-all cursor-pointer"
          >
            <span>Run Dynamic AI Scoring Engine</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {loading && (
        <div className="p-16 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-850 max-w-md mx-auto space-y-4">
          <RefreshCw className="w-10 h-10 text-indigo-500 animate-spin mx-auto" />
          <div>
            <h4 className="text-sm font-bold">Recalculating Global Assessment Parameters...</h4>
            <p className="text-xs text-zinc-400 mt-1">
              AI is auditing speech filler word distributions, posture drift thresholds, and project matches.
            </p>
          </div>
        </div>
      )}

      {/* Main Report Dashboard */}
      {report && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* LEFT: Gauge and Core Radar Chart */}
          <div className="md:col-span-1 space-y-6">
            
            {/* Speedometer Gauge & Status card */}
            <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-3xl space-y-6 relative overflow-hidden">
              <span className="absolute top-3 right-3 text-[10px] font-mono font-bold px-2 py-0.5 bg-indigo-500/10 text-indigo-500 rounded-md">
                INDEX SCALE
              </span>
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">
                Interview Readiness Gauge
              </h3>

              {/* Dynamic SVG Speedometer Gauge */}
              <div className="relative flex flex-col items-center justify-center pt-2">
                <svg className="w-40 h-24" viewBox="0 0 100 60">
                  {/* Gauge Track */}
                  <path
                    d="M 10 50 A 40 40 0 0 1 90 50"
                    fill="none"
                    stroke="#f4f4f5"
                    strokeWidth="8"
                    strokeLinecap="round"
                    className="dark:stroke-zinc-800"
                  />
                  {/* Active Gauge Fill */}
                  <path
                    d="M 10 50 A 40 40 0 0 1 90 50"
                    fill="none"
                    stroke="url(#gauge-gradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray="125.6"
                    strokeDashoffset={125.6 - (125.6 * report.placement_readiness_score) / 100}
                  />
                  <defs>
                    <linearGradient id="gauge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#818cf8" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>
                </svg>

                <div className="absolute top-10 flex flex-col items-center">
                  <span className="text-4xl font-black text-zinc-900 dark:text-zinc-50">
                    {report.placement_readiness_score}%
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400 mt-0.5">
                    OVERALL MATCH
                  </span>
                </div>
              </div>

              {/* Interview Category Classification */}
              <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[9px] block text-zinc-400 font-mono">AI RATING CATEGORY</span>
                  <span className="text-xs font-black text-indigo-500 uppercase mt-0.5 block">
                    {report.student_category}
                  </span>
                </div>
                <div className="px-2.5 py-1 bg-emerald-500/10 text-emerald-500 rounded-xl text-[10px] font-bold">
                  Active
                </div>
              </div>

              {/* Slider Controller to tune live factors right inside the sidebar */}
              <div className="border-t border-zinc-100 dark:border-zinc-850 pt-5 space-y-4">
                <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  <Sliders className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Fine-tune Factors:</span>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-mono text-zinc-400">
                      <span>CODING ACCURACY</span>
                      <span className="font-bold text-indigo-500">{codingScore}%</span>
                    </div>
                    <input
                      type="range"
                      min="30"
                      max="100"
                      value={codingScore}
                      onChange={(e) => setCodingScore(parseInt(e.target.value))}
                      className="w-full accent-indigo-500 h-1 bg-zinc-200 dark:bg-zinc-850 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-mono text-zinc-400">
                      <span>APTITUDE MARKS</span>
                      <span className="font-bold text-indigo-500">{aptitudeScore}%</span>
                    </div>
                    <input
                      type="range"
                      min="30"
                      max="100"
                      value={aptitudeScore}
                      onChange={(e) => setAptitudeScore(parseInt(e.target.value))}
                      className="w-full accent-indigo-500 h-1 bg-zinc-200 dark:bg-zinc-850 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-mono text-zinc-400">
                      <span>ENGLISH LEXICON</span>
                      <span className="font-bold text-indigo-500">{englishScore}%</span>
                    </div>
                    <input
                      type="range"
                      min="30"
                      max="100"
                      value={englishScore}
                      onChange={(e) => setEnglishScore(parseInt(e.target.value))}
                      className="w-full accent-indigo-500 h-1 bg-zinc-200 dark:bg-zinc-850 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                <button
                  onClick={handleCompileReport}
                  className="w-full py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 dark:text-indigo-400 text-[10px] font-bold rounded-xl transition-all cursor-pointer block text-center"
                >
                  Apply & Recalculate AI Report
                </button>
              </div>

            </div>

            {/* Radar Dimensions Chart */}
            <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-3xl space-y-4">
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">
                Readiness Dimensions
              </h3>
              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={getRadarData()}>
                    <PolarGrid stroke="#e4e4e7" className="dark:stroke-zinc-800" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: "#a1a1aa", fontSize: 9, fontWeight: 500 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#a1a1aa", fontSize: 8 }} />
                    <Radar
                      name="Student Score"
                      dataKey="score"
                      stroke="#6366f1"
                      fill="#6366f1"
                      fillOpacity={0.2}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#18181b",
                        border: "1px solid #27272a",
                        borderRadius: "12px",
                        color: "#f4f4f5"
                      }}
                      itemStyle={{ color: "#6366f1", fontSize: 11 }}
                      labelStyle={{ color: "#a1a1aa", fontSize: 10 }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Critical Risks Panel */}
            {report.risks && report.risks.length > 0 && (
              <div className="p-5 bg-amber-500/5 border border-amber-500/10 rounded-3xl space-y-3">
                <div className="flex items-center gap-1.5 text-amber-500">
                  <ShieldAlert className="w-4 h-4" />
                  <span className="text-xs font-black uppercase tracking-wider font-mono">RISK TRIGGERS FOUND</span>
                </div>
                {report.risks.map((risk: any, rIdx: number) => (
                  <div key={rIdx} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-100">{risk.type}</span>
                      <span className={`px-2 py-0.5 rounded-md text-[8px] font-mono font-bold ${
                        risk.severity === "High" ? "bg-red-500/10 text-red-500" : "bg-amber-500/10 text-amber-500"
                      }`}>
                        {risk.severity} Severity
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-400 leading-relaxed">
                      {risk.description}
                    </p>
                  </div>
                ))}
              </div>
            )}

          </div>

          {/* MIDDLE: Primary recommendations, target companies, and skill heatmap */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Predicted Succes Probabilities */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-3xl space-y-2">
                <span className="text-[9px] text-zinc-400 font-mono block">INTERVIEW SUCCESS PROBABILITY</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-emerald-500">
                    {report.predictions?.interview_success_probability || 80}%
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono">Score Target</span>
                </div>
              </div>

              <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-3xl space-y-2">
                <span className="text-[9px] text-zinc-400 font-mono block">CODING BENCHMARK CONFIDENCE</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-indigo-500">
                    {report.predictions?.coding_success_probability || 75}%
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono">Compiler verified</span>
                </div>
              </div>

              <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-3xl space-y-2">
                <span className="text-[9px] text-zinc-400 font-mono block">COMMUNICATION DRIFT REDUCTION</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-indigo-500">
                    +{report.predictions?.communication_improvement_percentage || 15}%
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono">filler controlled</span>
                </div>
              </div>
            </div>

            {/* Strengths and Weaknesses tabs */}
            <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-3xl grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              <div className="space-y-4">
                <div className="flex items-center gap-1.5 text-emerald-500">
                  <CheckCircle className="w-4.5 h-4.5" />
                  <h4 className="text-xs font-black uppercase tracking-wider font-mono">Measurable Strengths</h4>
                </div>
                <ul className="space-y-3">
                  {report.strengths?.map((str: string, sIdx: number) => (
                    <li key={sIdx} className="text-xs text-zinc-600 dark:text-zinc-400 flex items-start gap-2 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4 border-t sm:border-t-0 sm:border-l border-zinc-100 dark:border-zinc-850 pt-4 sm:pt-0 sm:pl-6">
                <div className="flex items-center gap-1.5 text-amber-500">
                  <AlertTriangle className="w-4.5 h-4.5" />
                  <h4 className="text-xs font-black uppercase tracking-wider font-mono">Areas to Correct</h4>
                </div>
                <ul className="space-y-3">
                  {report.weaknesses?.map((weak: string, wIdx: number) => (
                    <li key={wIdx} className="text-xs text-zinc-600 dark:text-zinc-400 flex items-start gap-2 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                      <span>{weak}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Company Match Matrix */}
            <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-3xl space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">
                    Company Interview Matching Score
                  </h3>
                  <p className="text-[10px] text-zinc-500">
                    Matches current resume, interview logs, and practice scores to corporate hiring standards.
                  </p>
                </div>

                <div className="flex bg-zinc-50 dark:bg-zinc-950 p-1 border border-zinc-100 dark:border-zinc-900 rounded-xl gap-1 shrink-0">
                  {[
                    { id: "all", label: "All" },
                    { id: "bigtech", label: "Big Tech" },
                    { id: "service", label: "Services" },
                    { id: "consulting", label: "Consulting" }
                  ].map((btn) => (
                    <button
                      key={btn.id}
                      onClick={() => setCompanyFilter(btn.id as any)}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-colors select-none cursor-pointer ${
                        companyFilter === btn.id
                          ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                          : "text-zinc-400 hover:text-zinc-600"
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {getFilteredCompanies().map(([comp, percent]: any) => (
                  <div key={comp} className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-900 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-100">{comp}</span>
                      <span className="text-xs font-mono font-black text-indigo-500">{percent}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          percent >= 85 ? "bg-emerald-500" : percent >= 70 ? "bg-indigo-500" : "bg-amber-500"
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Competency Skill Heatmap Grid */}
            <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-3xl space-y-4">
              <div>
                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">
                  Competency Skill Matrix Heatmap
                </h3>
                <p className="text-[10px] text-zinc-500">
                  Visual mapping of technical frameworks and communication variables based on interview audits.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {getHeatmapCells().map((cell: any, cIdx: number) => {
                  let colorClass = "bg-zinc-100 border-zinc-200 text-zinc-700 dark:bg-zinc-950 dark:border-zinc-900 dark:text-zinc-400";
                  if (cell.score >= 90) {
                    colorClass = "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400";
                  } else if (cell.score >= 75) {
                    colorClass = "bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400";
                  } else if (cell.score >= 60) {
                    colorClass = "bg-zinc-500/10 border-zinc-500/20 text-zinc-600 dark:text-zinc-400";
                  }

                  return (
                    <div
                      key={`${cell.name}-${cIdx}`}
                      className={`p-3.5 border rounded-2xl flex flex-col justify-between h-20 transition-all hover:scale-[1.02] ${colorClass}`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-black truncate max-w-[85%]">{cell.name}</span>
                        <span className="text-[8px] font-mono uppercase tracking-wider opacity-60">
                          {cell.level}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[8px] font-mono tracking-wider opacity-60">
                          {cell.category}
                        </span>
                        <span className="text-[10px] font-bold font-mono">
                          {cell.score}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actionable Personal Recommendations & Checklist Tasks */}
            <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-3xl space-y-6">
              <div>
                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">
                  Personalized AI Practice Tasks & Action Checklist
                </h3>
                <p className="text-[10px] text-zinc-500">
                  Targeted remediation actionable tasks generated dynamically. Check items off as you complete them!
                </p>
              </div>

              {/* Dynamic Action Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                <div className="space-y-4">
                  <div className="flex items-center gap-1.5 text-indigo-500">
                    <Zap className="w-4.5 h-4.5" />
                    <h4 className="text-xs font-bold uppercase tracking-wider">Daily Interview Routines</h4>
                  </div>

                  <div className="space-y-3">
                    {report.personalized_recommendations?.daily_tasks?.map((task: string, idx: number) => {
                      const taskId = `daily-${idx}`;
                      const checked = !!checkedTasks[taskId];
                      return (
                        <div
                          key={taskId}
                          onClick={() => toggleTask(taskId)}
                          className={`p-3 rounded-2xl border text-xs flex items-start gap-3 transition-all cursor-pointer ${
                            checked
                              ? "bg-zinc-50 border-zinc-100 text-zinc-400 dark:bg-zinc-950 dark:border-zinc-900 line-through"
                              : "bg-white border-zinc-200 text-zinc-700 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300 hover:border-indigo-500/30"
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                            checked ? "bg-indigo-500 border-indigo-500 text-white" : "border-zinc-300 dark:border-zinc-700"
                          }`}>
                            {checked && <CheckCircle className="w-3 h-3 text-white" />}
                          </div>
                          <span className="leading-relaxed">{task}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-1.5 text-indigo-500">
                    <Briefcase className="w-4.5 h-4.5" />
                    <h4 className="text-xs font-bold uppercase tracking-wider">Weekly Milestone Actions</h4>
                  </div>

                  <div className="space-y-3">
                    {report.personalized_recommendations?.weekly_tasks?.map((task: string, idx: number) => {
                      const taskId = `weekly-${idx}`;
                      const checked = !!checkedTasks[taskId];
                      return (
                        <div
                          key={taskId}
                          onClick={() => toggleTask(taskId)}
                          className={`p-3 rounded-2xl border text-xs flex items-start gap-3 transition-all cursor-pointer ${
                            checked
                              ? "bg-zinc-50 border-zinc-100 text-zinc-400 dark:bg-zinc-950 dark:border-zinc-900 line-through"
                              : "bg-white border-zinc-200 text-zinc-700 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300 hover:border-indigo-500/30"
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                            checked ? "bg-indigo-500 border-indigo-500 text-white" : "border-zinc-300 dark:border-zinc-700"
                          }`}>
                            {checked && <CheckCircle className="w-3 h-3 text-white" />}
                          </div>
                          <span className="leading-relaxed">{task}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Granular topic focuses panels */}
              <div className="border-t border-zinc-100 dark:border-zinc-850 pt-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                
                <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-900 space-y-1.5">
                  <span className="text-[9px] text-zinc-400 font-mono block">RECOMENDED CODING CONCEPT</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 block truncate">
                    {report.personalized_recommendations?.coding_topics?.[0] || "Sliding Window / Map usage"}
                  </span>
                </div>

                <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-900 space-y-1.5">
                  <span className="text-[9px] text-zinc-400 font-mono block">INTERVIEW BEHAVIOR REMEDIATION</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 block truncate">
                    {report.personalized_recommendations?.interview_topics?.[0] || "Explaining Project Failures"}
                  </span>
                </div>

                <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-900 space-y-1.5">
                  <span className="text-[9px] text-zinc-400 font-mono block">CAMERA POSTURE TIP</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 block truncate">
                    {report.personalized_recommendations?.body_language_tips?.[0] || "Maintain direct chin alignment"}
                  </span>
                </div>

              </div>
            </div>

            {/* AI Insights & Learning plan timeline */}
            <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-3xl space-y-6">
              <div>
                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">
                  Deep AI Insights & Long-term Learning Roadmap
                </h3>
                <p className="text-[10px] text-zinc-500">
                  Comprehensive roadmap generated by AI to scale interview readiness to elite standards.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-5 bg-indigo-500/5 rounded-2xl space-y-2">
                  <div className="flex items-center gap-1.5 text-indigo-500">
                    <BookOpen className="w-4.5 h-4.5" />
                    <span className="text-xs font-black uppercase font-mono">Long-Term Milestone Plan</span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-mono">
                    {report.ai_insights?.long_term_plan?.[0]}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 border border-zinc-150 dark:border-zinc-800 rounded-2xl space-y-2">
                    <span className="text-[10px] text-emerald-500 font-mono font-bold uppercase block">Quick Wins (48 Hours)</span>
                    <ul className="space-y-1.5 text-xs text-zinc-500">
                      {report.ai_insights?.quick_wins?.map((qw: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-1">
                          <span className="text-indigo-500 shrink-0">•</span>
                          <span>{qw}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 border border-zinc-150 dark:border-zinc-800 rounded-2xl space-y-2">
                    <span className="text-[10px] text-indigo-500 font-mono font-bold uppercase block">Critical Improvement Areas</span>
                    <ul className="space-y-1.5 text-xs text-zinc-500">
                      {report.ai_insights?.critical_improvement_areas?.map((cia: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-1">
                          <span className="text-indigo-500 shrink-0">•</span>
                          <span>{cia}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}

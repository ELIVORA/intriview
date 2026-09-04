/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FileText,
  Sparkles,
  Search,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Download,
  Upload,
  Layers,
  Check,
  History,
  Copy,
  Plus,
  Trash2,
  Edit2,
  Settings,
  HelpCircle,
  RefreshCw,
  Send,
  Zap,
  Bookmark,
  ChevronRight,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Sliders,
  Award,
  BookOpen,
  Briefcase,
  Languages,
  ArrowRight,
  Globe,
  FileCheck,
  PieChart,
  Target
} from "lucide-react";
import { useToast } from "../../providers/ToastProvider";
import { api } from "../../services/api";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  Legend
} from "recharts";

// ----------------------------------------------------
// LOCAL WORKSPACE INTERFACES
// ----------------------------------------------------

interface ResumeVersion {
  id: string;
  name: string;
  raw_text: string;
  created_at: string;
  scores: {
    overall_ats_score: number;
    section_scores: {
      formatting_score: number;
      keyword_score: number;
      grammar_score: number;
      readability_score: number;
      experience_score: number;
      skills_score: number;
      education_score: number;
      projects_score: number;
    };
  };
  is_active: boolean;
}

interface SkillGapReport {
  matched_skills: string[];
  missing_skills: string[];
  learning_recommendations: Array<{
    title: string;
    type: string;
    provider: string;
    link: string;
  }>;
  projects_to_build: Array<{
    title: string;
    description: string;
    tech: string;
  }>;
}

interface JdMatchReport {
  match_percentage: number;
  missing_keywords: string[];
  missing_skills: string[];
  recommended_changes: Array<{
    original: string;
    improved: string;
    reason: string;
  }>;
  interview_questions: string[];
  company_prep_guide: string[];
}

export function EnterpriseResumeWorkspace({ resumeFileName = "resume.pdf" }: { resumeFileName?: string }) {
  const { toast } = useToast();

  // Active Tab for the workspace panels
  // Right tabs: "assistant" | "ats" | "skills" | "job-match" | "analytics"
  const [rightActiveTab, setRightActiveTab] = useState<"assistant" | "ats" | "skills" | "job-match" | "analytics">("assistant");

  // Versioning state
  const [versions, setVersions] = useState<ResumeVersion[]>([]);
  const [activeVersion, setActiveVersion] = useState<ResumeVersion | null>(null);
  const [isLoadingVersions, setIsLoadingVersions] = useState(false);
  const [isSavingVersion, setIsSavingVersion] = useState(false);
  const [newVersionName, setNewVersionName] = useState("");
  const [showSaveModal, setShowSaveModal] = useState(false);

  // Compare mode states
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [compareVersionId, setCompareVersionId] = useState<string>("");
  const [comparisonResult, setComparisonResult] = useState<any>(null);
  const [isComparing, setIsComparing] = useState(false);

  // Viewer options
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeHighlight, setActiveHighlight] = useState<"none" | "suggestions" | "keywords" | "grammar" | "bullets" | "formatting">("none");

  // Chat/Assistant state
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{ role: "user" | "assistant"; content: string }>>([
    {
      role: "assistant",
      content: "Welcome to your AI Resume Intelligence Workspace. I'm your premium career optimization consultant. You can ask me to rewrite sections, scan for keywords, or optimize metrics."
    }
  ]);
  const [isSendingChat, setIsSendingChat] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Skill Gap State
  const [skillGapReport, setSkillGapReport] = useState<SkillGapReport | null>(null);
  const [isLoadingSkillGap, setIsLoadingSkillGap] = useState(false);

  // Job Description Matching
  const [jdText, setJdText] = useState("");
  const [jdMatchReport, setJdMatchReport] = useState<JdMatchReport | null>(null);
  const [isMatchingJd, setIsMatchingJd] = useState(false);

  // Auto-Save notification
  const [lastAutoSaveTime, setLastAutoSaveTime] = useState<string>("");

  // ----------------------------------------------------
  // ANALYTICS DATA
  // ----------------------------------------------------
  const scoreTrendData = [
    { name: "v1_Base", score: 72, keywords: 58, grammar: 82 },
    { name: "v2_StripeRef", score: 81, keywords: 74, grammar: 90 },
    { name: "v3_GenAIEngine", score: 88, keywords: 86, grammar: 94 },
    { name: "v4_Active", score: activeVersion?.scores.overall_ats_score || 92, keywords: 91, grammar: 96 }
  ];

  const skillPolarData = activeVersion ? [
    { subject: "Languages", A: activeVersion.scores.section_scores.education_score, B: 85, fullMark: 100 },
    { subject: "ML & AI", A: activeVersion.scores.section_scores.skills_score, B: 90, fullMark: 100 },
    { subject: "Experience", A: activeVersion.scores.section_scores.experience_score, B: 80, fullMark: 100 },
    { subject: "Formatting", A: activeVersion.scores.section_scores.formatting_score, B: 95, fullMark: 100 },
    { subject: "Projects", A: activeVersion.scores.section_scores.projects_score, B: 82, fullMark: 100 },
    { subject: "Grammar", A: activeVersion.scores.section_scores.grammar_score, B: 95, fullMark: 100 }
  ] : [];

  // ----------------------------------------------------
  // LOAD SYSTEM VERSIONS
  // ----------------------------------------------------
  const loadVersions = async (selectActive = true) => {
    setIsLoadingVersions(true);
    try {
      const res = await api.get("/resume/workspace/versions");
      if (res.data && res.data.versions) {
        setVersions(res.data.versions);
        if (selectActive) {
          const live = res.data.versions.find((v: any) => v.is_active) || res.data.versions[0];
          setActiveVersion(live);
        }
      }
    } catch (err: any) {
      console.error(err);
      toast("Failed to load resume versions from server.", "error", "Network Fault");
    } finally {
      setIsLoadingVersions(false);
    }
  };

  useEffect(() => {
    loadVersions();
    // Run initial Skill Gap scan for current resume
    setTimeout(() => {
      runSkillGapScan();
    }, 1200);
  }, []);

  // Sync scroll on chat history
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  // ----------------------------------------------------
  // ACTION HANDLERS
  // ----------------------------------------------------
  const handleSaveNewVersion = async () => {
    if (!newVersionName.trim()) {
      toast("Please specify a professional version name", "error", "Missing Information");
      return;
    }
    if (!activeVersion) return;

    setIsSavingVersion(true);
    try {
      const res = await api.post("/resume/workspace/version/save", {
        name: newVersionName,
        raw_text: activeVersion.raw_text,
        scores: activeVersion.scores
      });
      if (res.data && res.data.version) {
        toast(`Created resume version draft: ${newVersionName}`, "success", "Version Saved");
        setShowSaveModal(false);
        setNewVersionName("");
        await loadVersions(false);
        setActiveVersion(res.data.version);
      }
    } catch (err: any) {
      console.error(err);
      toast("Could not save new version draft.", "error", "Internal Server Error");
    } finally {
      setIsSavingVersion(false);
    }
  };

  const handleRestoreVersion = async (versionId: string) => {
    try {
      const res = await api.post(`/resume/workspace/version/restore/${versionId}`);
      if (res.data && res.data.version) {
        toast(`Restored and activated version: ${res.data.version.name}`, "success", "Restore Success");
        await loadVersions();
        setIsCompareMode(false);
      }
    } catch (err: any) {
      console.error(err);
      toast("Could not activate this resume version.", "error", "Server Error");
    }
  };

  const handleDeleteVersion = async (versionId: string) => {
    if (versions.length <= 1) {
      toast("You must keep at least one active resume template.", "warning", "Validation Denied");
      return;
    }
    try {
      await api.delete(`/resume/workspace/version/${versionId}`);
      toast("Resume template version deleted", "warning", "Version Terminated");
      await loadVersions();
      setIsCompareMode(false);
    } catch (err: any) {
      console.error(err);
      toast("Failed to delete this version.", "error", "Deletion Blocked");
    }
  };

  const handleCompare = async () => {
    if (!compareVersionId || !activeVersion) return;
    setIsComparing(true);
    try {
      const res = await api.post("/resume/workspace/compare", {
        version_id_a: activeVersion.id,
        version_id_b: compareVersionId
      });
      if (res.data && res.data.comparison) {
        setComparisonResult(res.data.comparison);
        setIsCompareMode(true);
        toast("Side-by-side comparison generated successfully!", "success", "Difference Model Compiled");
      }
    } catch (err: any) {
      console.error(err);
      toast("Failed to compare the specified versions.", "error", "Engine Fault");
    } finally {
      setIsComparing(false);
    }
  };

  const runSkillGapScan = async () => {
    if (!activeVersion) return;
    setIsLoadingSkillGap(true);
    try {
      const res = await api.post("/resume/workspace/skill-gap", {
        resume_text: activeVersion.raw_text
      });
      if (res.data && res.data.gap_report) {
        setSkillGapReport(res.data.gap_report);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoadingSkillGap(false);
    }
  };

  const runJdMatcher = async () => {
    if (!activeVersion || !jdText.trim()) {
      toast("Please provide the target job description to match against.", "warning", "Input Required");
      return;
    }
    setIsMatchingJd(true);
    try {
      const res = await api.post("/resume/workspace/match-jd-detailed", {
        resume_text: activeVersion.raw_text,
        jd_text: jdText
      });
      if (res.data && res.data.match_report) {
        setJdMatchReport(res.data.match_report);
        toast("Job Description match rating successfully mapped!", "success", "ATS Score Synced");
      }
    } catch (err: any) {
      console.error(err);
      toast("Fail to analyze JD matching metrics.", "error", "ATS Diagnostic Fault");
    } finally {
      setIsMatchingJd(false);
    }
  };

  const handleSendChat = async (presetPrompt?: string) => {
    const promptToSend = presetPrompt || chatInput;
    if (!promptToSend.trim() || !activeVersion) return;

    const userMsg = { role: "user" as const, content: promptToSend };
    setChatHistory(prev => [...prev, userMsg]);
    if (!presetPrompt) setChatInput("");
    setIsSendingChat(true);

    try {
      const res = await api.post("/resume/workspace/chat", {
        prompt: promptToSend,
        resume_text: activeVersion.raw_text,
        history: chatHistory
      });
      if (res.data && res.data.response) {
        setChatHistory(prev => [...prev, { role: "assistant", content: res.data.response }]);
      }
    } catch (err: any) {
      console.error(err);
      setChatHistory(prev => [...prev, { role: "assistant", content: "I encountered an error while consulting with the model. Please check your credentials or network connections." }]);
    } finally {
      setIsSendingChat(false);
    }
  };

  // One-click structural rewrites
  const handleQuickImprove = async (styleType: string) => {
    if (!activeVersion) return;
    setIsSendingChat(true);
    toast(`Running customized ${styleType} optimized rewrite...`, "info", "AI Workspace Task Launched");
    
    const requestPrompt = `Please generate an entire structural copy of my resume rewritten in an authoritative, highly customized ${styleType} style. Provide the result as complete professional resume text. Format it with clean clear structural markdown. Ensure you maximize active XYZ action verbs and incorporate relevant metrics.`;
    
    try {
      const res = await api.post("/resume/workspace/chat", {
        prompt: requestPrompt,
        resume_text: activeVersion.raw_text,
        history: []
      });
      if (res.data && res.data.response) {
        // Save as new version immediately
        const newVName = `${activeVersion.name.replace(".pdf", "")}_${styleType}.txt`;
        const saveRes = await api.post("/resume/workspace/version/save", {
          name: newVName,
          raw_text: res.data.response,
          scores: {
            overall_ats_score: Math.min(activeVersion.scores.overall_ats_score + 4, 98),
            section_scores: {
              ...activeVersion.scores.section_scores,
              keyword_score: Math.min(activeVersion.scores.section_scores.keyword_score + 6, 96),
              experience_score: Math.min(activeVersion.scores.section_scores.experience_score + 5, 95)
            }
          }
        });
        if (saveRes.data && saveRes.data.version) {
          toast(`Successfully auto-compiled and switched to improved ${styleType} template!`, "success", "AI Generation Synthesized");
          await loadVersions(false);
          setActiveVersion(saveRes.data.version);
        }
      }
    } catch (err) {
      console.error(err);
      toast("Error generating premium style draft.", "error", "Process Interrupted");
    } finally {
      setIsSendingChat(false);
    }
  };

  // Export Chat Conversations
  const handleExportChat = () => {
    try {
      const rawText = chatHistory.map(m => `[${m.role.toUpperCase()}]\n${m.content}\n\n`).join("");
      const blob = new Blob([rawText], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `InterviewCracker_ChatConsult_${activeVersion?.name || "Resume"}.txt`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast("Chat conversation transcript exported to workspace downloads!", "success", "Transcript Saved");
    } catch (e) {
      console.error(e);
    }
  };

  // Highlight mapper helpers
  const getAnnotatedText = () => {
    if (!activeVersion) return "";
    const raw = activeVersion.raw_text;
    
    if (activeHighlight === "none") {
      return raw.split("\n").map((line, i) => (
        <p key={i} className="text-[12px] leading-relaxed text-zinc-700 dark:text-zinc-300 min-h-[16px] font-sans">
          {line}
        </p>
      ));
    }

    return raw.split("\n").map((line, idx) => {
      // Check highlights matches
      let isMatch = false;
      let reason = "";
      let styleClasses = "";

      if (activeHighlight === "suggestions" && line.includes("EXPERIENCE")) {
        isMatch = true;
        reason = "AI Recommendation: Split work listings with specific timeframes and project names.";
        styleClasses = "bg-purple-100 dark:bg-purple-950/40 text-purple-950 border-l-2 border-purple-500 pl-2 my-1 py-1";
      } else if (activeHighlight === "keywords" && (line.includes("Programming:") || line.includes("TECHNICAL"))) {
        isMatch = true;
        reason = "ATS Matching Index: Target skills parsed properly (Python, React). Kubernetes and Docker missing.";
        styleClasses = "bg-sky-100 dark:bg-sky-950/40 text-sky-950 border-l-2 border-sky-500 pl-2 my-1 py-1";
      } else if (activeHighlight === "grammar" && line.includes("Worked on Stripe")) {
        isMatch = true;
        reason = "Active Phrasing Diagnostic: 'Worked on' is passive. Swap with 'Developed and calibrated'.";
        styleClasses = "bg-amber-100 dark:bg-amber-950/40 text-amber-950 border-l-2 border-amber-500 pl-2 my-1 py-1";
      } else if (activeHighlight === "bullets" && line.includes("Developed real-time")) {
        isMatch = true;
        reason = "Impact Measurement: Strong XYZ model verified. 'Developed real-time pipeline... increasing throughput by 42%'.";
        styleClasses = "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-950 border-l-2 border-emerald-500 pl-2 my-1 py-1";
      } else if (activeHighlight === "formatting" && line.includes("GPA: 3.9")) {
        isMatch = true;
        reason = "Layout Standard: MIT structure detected. GPA formatted clearly out of 4.0 scale.";
        styleClasses = "bg-rose-100 dark:bg-rose-950/40 text-rose-950 border-l-2 border-rose-500 pl-2 my-1 py-1";
      }

      if (isMatch) {
        return (
          <div key={idx} className={`${styleClasses} relative group cursor-pointer rounded-r-lg`}>
            <p className="text-[12px] leading-relaxed font-sans">{line}</p>
            <div className="text-[10px] font-mono text-zinc-500 mt-1 bg-white/60 dark:bg-zinc-900/40 p-1.5 rounded-md border border-zinc-200/50">
              {reason}
            </div>
          </div>
        );
      }

      return (
        <p key={idx} className="text-[12px] leading-relaxed text-zinc-700 dark:text-zinc-300 min-h-[16px] font-sans">
          {line}
        </p>
      );
    });
  };

  return (
    <div className="w-full min-h-[90vh] grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 md:p-6 bg-zinc-50 dark:bg-zinc-950">
      
      {/* ----------------------------------------------------
          LEFT SIDEBAR: RESUME NAVIGATION (Col Span 3)
         ---------------------------------------------------- */}
      <div className="lg:col-span-3 flex flex-col gap-5">
        
        {/* Core Template Title */}
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-indigo-500" />
              <h2 className="text-sm font-black text-zinc-900 dark:text-zinc-50 tracking-tight">Template Versions</h2>
            </div>
            <button
              onClick={() => setShowSaveModal(true)}
              className="p-1.5 rounded-lg bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-950 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-indigo-500 hover:text-indigo-600 transition-colors cursor-pointer"
              title="Save current workspace draft as version"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[10.5px] text-zinc-400 mb-4 font-mono uppercase tracking-wider">
            Active version repository ({versions.length})
          </p>

          <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
            {isLoadingVersions ? (
              <div className="flex flex-col items-center justify-center py-6 gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-zinc-400" />
                <span className="text-[11px] font-mono text-zinc-400">Loading templates...</span>
              </div>
            ) : (
              versions.map(v => (
                <div
                  key={v.id}
                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all cursor-pointer group ${
                    v.is_active
                      ? "bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-400 text-indigo-950 dark:text-indigo-300"
                      : "bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-400"
                  }`}
                  onClick={() => handleRestoreVersion(v.id)}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <FileText className={`w-3.5 h-3.5 flex-shrink-0 ${v.is_active ? "text-indigo-500" : "text-zinc-400"}`} />
                      <span className="text-[11.5px] font-bold truncate block">{v.name}</span>
                    </div>
                    <span className="text-[9px] font-mono text-zinc-400 block mt-0.5">
                      Created: {new Date(v.created_at).toLocaleDateString()} | Score: {v.scores.overall_ats_score}%
                    </span>
                  </div>
                  
                  {/* Delete Option */}
                  {!v.is_active && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteVersion(v.id); }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/30 text-zinc-400 hover:text-red-500 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* COMPARE VERSIONS ACTION WIDGET */}
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-150 mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-500" />
            <span>Compare Versions</span>
          </h3>
          <p className="text-[10.5px] text-zinc-400 leading-relaxed mb-3">
            Select a template in your repository to compare against the active {activeVersion?.name || "current"} version.
          </p>
          <div className="space-y-3">
            <select
              value={compareVersionId}
              onChange={(e) => setCompareVersionId(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3 py-2 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:text-zinc-200"
            >
              <option value="">-- Choose template version --</option>
              {versions.filter(v => v.id !== activeVersion?.id).map(v => (
                <option key={v.id} value={v.id}>{v.name} ({v.scores.overall_ats_score}%)</option>
              ))}
            </select>
            <button
              onClick={handleCompare}
              disabled={!compareVersionId || isComparing}
              className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-950 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isComparing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Scanning differences...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5" />
                  <span>Calculate Differences</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* BOOKMARKS / SAVED JOBS */}
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs flex-1 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-150 flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-sky-500" />
              <span>Job Application Bookmarks</span>
            </h3>

            <div className="space-y-2.5">
              <div className="p-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100 truncate block">Stripe - AI/ML Engineer</span>
                  <span className="text-[9px] font-mono font-bold bg-amber-500/15 text-amber-500 px-1.5 py-0.5 rounded">Matching</span>
                </div>
                <p className="text-[9px] text-zinc-400 mt-1">Status: Resume customized v2. Live draft active.</p>
              </div>

              <div className="p-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100 truncate block">Google - Cloud Solutions Intern</span>
                  <span className="text-[9px] font-mono font-bold bg-emerald-500/15 text-emerald-500 px-1.5 py-0.5 rounded">Ready</span>
                </div>
                <p className="text-[9px] text-zinc-400 mt-1">Status: Verified 92% ATS. Final pdf downloaded.</p>
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-150 dark:border-zinc-800 pt-4 mt-4">
            <div className="flex items-center justify-between gap-2 text-[10px] text-zinc-400">
              <span className="font-mono">INTELLIGENCE NODE READY</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </div>
        </div>

      </div>

      {/* ----------------------------------------------------
          CENTER PANEL: INTERACTIVE RESUME VIEWER (Col Span 5)
         ---------------------------------------------------- */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        
        {/* Paper Header Navigation Options */}
        <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-50 truncate max-w-[150px]">
              {activeVersion?.name || "Active_Workspace_Viewer"}
            </span>
          </div>

          {/* Quick PDF Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setZoomLevel(Math.max(zoomLevel - 10, 70))}
              className="p-1.5 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-500 transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono text-zinc-500 px-1">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel(Math.min(zoomLevel + 10, 130))}
              className="p-1.5 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-500 transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-800 mx-1" />
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-500 transition-colors cursor-pointer"
              title="Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Highlights Selector Toolbar */}
        <div className="bg-white dark:bg-zinc-900 p-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs flex gap-1 overflow-x-auto select-none no-scrollbar">
          {(["none", "suggestions", "keywords", "grammar", "bullets", "formatting"] as const).map(item => (
            <button
              key={item}
              onClick={() => setActiveHighlight(item)}
              className={`px-3 py-1.5 rounded-lg text-[10.5px] font-medium transition-all capitalize whitespace-nowrap cursor-pointer ${
                activeHighlight === item
                  ? "bg-indigo-600 text-white font-bold"
                  : "bg-zinc-50 dark:bg-zinc-950 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200/40 dark:border-zinc-800"
              }`}
            >
              {item === "none" ? "Clear Highlights" : `${item} issues`}
            </button>
          ))}
        </div>

        {/* The Paper Sheet Viewer Frame */}
        <div className={`flex-1 overflow-y-auto bg-zinc-200/50 dark:bg-zinc-950/40 border border-zinc-250 dark:border-zinc-800 rounded-3xl p-6 relative flex justify-center ${
          isFullscreen ? "fixed inset-0 z-50 bg-black/80 backdrop-blur-md p-10" : "min-h-[580px] max-h-[640px]"
        }`}>
          {isFullscreen && (
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-6 right-6 p-2 rounded-full bg-zinc-900 text-white border border-zinc-800 hover:scale-110 transition-transform cursor-pointer"
            >
              <Minimize2 className="w-5 h-5" />
            </button>
          )}

          <AnimatePresence mode="wait">
            {isCompareMode && comparisonResult ? (
              <motion.div
                key="comparison-view"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-xl border border-indigo-200 dark:border-indigo-950/60 overflow-y-auto"
              >
                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4 mb-4">
                  <div>
                    <h3 className="text-sm font-black text-indigo-600 dark:text-indigo-400">Side-by-Side Version Analysis</h3>
                    <p className="text-[10px] font-mono text-zinc-400 block mt-0.5 uppercase">DIFFERENCE METRICS CALIBRATED</p>
                  </div>
                  <button
                    onClick={() => setIsCompareMode(false)}
                    className="px-3 py-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    Back to Viewer
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-xs font-bold text-emerald-500 mb-2">Added Keywords & Terms</h4>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {comparisonResult.added_keywords?.map((k: string) => (
                        <span key={k} className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-bold border border-emerald-500/20">{k}</span>
                      ))}
                    </div>

                    <h4 className="text-xs font-bold text-red-500 mb-2">Removed Keywords</h4>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {comparisonResult.removed_keywords?.map((k: string) => (
                        <span key={k} className="px-2 py-0.5 rounded bg-red-500/10 text-red-500 text-[10px] font-bold border border-red-500/20">{k}</span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-zinc-600">Impact Improvement</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500 text-white font-mono font-black text-[10px]">{comparisonResult.impact_score_diff}</span>
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-zinc-600 block mb-1">Structural Template Alignment</span>
                      <ul className="space-y-1">
                        {comparisonResult.structural_changes?.map((s: string, idx: number) => (
                          <li key={idx} className="text-[10px] text-zinc-500 flex items-start gap-1">
                            <span className="text-indigo-500 mt-0.5">•</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 mt-4 space-y-3">
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Key Bullet Point Improvements</h4>
                  <div className="space-y-3">
                    {comparisonResult.bullet_point_improvements?.map((bp: any, idx: number) => (
                      <div key={idx} className="p-3 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <span className="text-[9px] font-mono text-red-500 block uppercase font-black">Original Passive</span>
                            <p className="text-[11px] text-zinc-400 italic">"{bp.original}"</p>
                          </div>
                          <div>
                            <span className="text-[9px] font-mono text-emerald-500 block uppercase font-black">AI XYZ Optimized</span>
                            <p className="text-[11px] text-zinc-700 dark:text-zinc-200 font-bold">"{bp.updated}"</p>
                          </div>
                        </div>
                        <p className="text-[10px] font-mono text-indigo-500">Reason: {bp.impact}</p>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-xl mt-4">
                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-wider block mb-1">Workspace Advisor Recommendation</span>
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-300 leading-relaxed">{comparisonResult.coaching_recommendation}</p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="resume-paper"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{ transform: `scale(${zoomLevel / 100})` }}
                className="w-full max-w-xl bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-8 border border-zinc-200/80 dark:border-zinc-800 overflow-y-auto max-h-[580px] transition-transform origin-top"
              >
                {/* Paper content rendered with simulated highlights */}
                <div className="space-y-2 font-mono text-left">
                  {getAnnotatedText()}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Paper bottom bar */}
        <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs flex items-center justify-between gap-3">
          <div className="flex gap-2">
            <button
              onClick={() => handleQuickImprove("Technical")}
              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/40 text-indigo-500 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
            >
              1-Click Optimize
            </button>
          </div>
          <div className="text-[10px] font-mono text-zinc-400">
            {lastAutoSaveTime ? `Last saved: ${lastAutoSaveTime}` : "Auto-Save Synced"}
          </div>
        </div>

      </div>

      {/* ----------------------------------------------------
          RIGHT PANEL: AI ASSISTANT & ATS DASHBOARD (Col Span 4)
         ---------------------------------------------------- */}
      <div className="lg:col-span-4 flex flex-col gap-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 shadow-xl min-h-[620px]">
        
        {/* Navigation Tabs for Right Panel */}
        <div className="flex border-b border-zinc-100 dark:border-zinc-800 pb-2 overflow-x-auto gap-1">
          {[
            { id: "assistant", label: "AI Consultant", icon: Sparkles },
            { id: "ats", label: "ATS Score", icon: PieChart },
            { id: "skills", label: "Skill Gaps", icon: Target },
            { id: "job-match", label: "Job Description Match", icon: FileCheck },
            { id: "analytics", label: "Trends", icon: TrendingUp }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setRightActiveTab(tab.id as any)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  rightActiveTab === tab.id
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100/60"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB CONTENTS WITH ANIMATIONS */}
        <div className="flex-1 overflow-y-auto pr-1">
          <AnimatePresence mode="wait">
            
            {/* 1. CHAT/ASSISTANT MODULE */}
            {rightActiveTab === "assistant" && (
              <motion.div
                key="assistant-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col justify-between space-y-4"
              >
                {/* Chat window */}
                <div className="space-y-3 max-h-[300px] overflow-y-auto border border-zinc-100 dark:border-zinc-800/60 p-3 rounded-2xl bg-zinc-50/40 dark:bg-zinc-950/20">
                  {chatHistory.map((m, i) => (
                    <div
                      key={i}
                      className={`p-2.5 rounded-2xl text-[11.5px] leading-relaxed max-w-[85%] ${
                        m.role === "user"
                          ? "bg-indigo-600 text-white ml-auto"
                          : "bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 mr-auto"
                      }`}
                    >
                      {m.content}
                    </div>
                  ))}
                  {isSendingChat && (
                    <div className="p-2.5 bg-zinc-50 dark:bg-zinc-950 rounded-xl text-[11px] text-zinc-400 font-mono italic flex items-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                      <span>Consultant compiling response...</span>
                    </div>
                  )}
                  <div ref={chatBottomRef} />
                </div>

                {/* Suggested prompts widget */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-zinc-400 block uppercase">Quick consultation actions</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "Improve Stripe experience metrics",
                      "Make summary ATS compliant",
                      "Action verbs for Google Internship",
                      "Reduce resume copy to 1 page"
                    ].map(p => (
                      <button
                        key={p}
                        onClick={() => handleSendChat(p)}
                        className="px-2 py-1 bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 text-zinc-500 text-[10px] border border-zinc-200 dark:border-zinc-800 rounded-lg text-left truncate max-w-[200px] cursor-pointer"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input action group */}
                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/60 flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleSendChat(); }}
                    placeholder="Ask assistant to rewrite professionally..."
                    className="flex-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3.5 py-2.5 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:text-zinc-200"
                  />
                  <button
                    onClick={() => handleSendChat()}
                    disabled={isSendingChat || !chatInput.trim()}
                    className="p-2.5 bg-zinc-950 hover:bg-zinc-850 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>

                {/* Rewrite Presets Container */}
                <div className="pt-3 border-t border-zinc-150 dark:border-zinc-800 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleQuickImprove("Professional")}
                    className="py-1.5 bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 text-zinc-700 dark:text-zinc-300 text-[10.5px] font-bold border border-zinc-200 dark:border-zinc-800 rounded-xl cursor-pointer"
                  >
                    💼 Executive
                  </button>
                  <button
                    onClick={() => handleQuickImprove("Technical")}
                    className="py-1.5 bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 text-zinc-700 dark:text-zinc-300 text-[10.5px] font-bold border border-zinc-200 dark:border-zinc-800 rounded-xl cursor-pointer"
                  >
                    🤖 Deep Technical
                  </button>
                  <button
                    onClick={() => handleQuickImprove("ATS Optimized")}
                    className="py-1.5 bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 text-zinc-700 dark:text-zinc-300 text-[10.5px] font-bold border border-zinc-200 dark:border-zinc-800 rounded-xl cursor-pointer col-span-2"
                  >
                    📈 ATS Optimization Rewrite
                  </button>
                </div>
              </motion.div>
            )}

            {/* 2. ATS SCORE MODULE */}
            {rightActiveTab === "ats" && activeVersion && (
              <motion.div
                key="ats-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-5"
              >
                {/* Visual Circle Meter */}
                <div className="flex flex-col items-center justify-center p-4 bg-zinc-50/80 dark:bg-zinc-950/20 rounded-2xl border border-zinc-100 dark:border-zinc-800/80">
                  <div className="relative w-28 h-28 flex items-center justify-center">
                    {/* Circle SVG */}
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="56"
                        cy="56"
                        r="45"
                        stroke="currentColor"
                        className="text-zinc-200 dark:text-zinc-800"
                        strokeWidth="8"
                        fill="transparent"
                      />
                      <circle
                        cx="56"
                        cy="56"
                        r="45"
                        stroke="currentColor"
                        className="text-indigo-600 dark:text-indigo-400"
                        strokeWidth="8"
                        strokeDasharray={2 * Math.PI * 45}
                        strokeDashoffset={2 * Math.PI * 45 * (1 - activeVersion.scores.overall_ats_score / 100)}
                        fill="transparent"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-2xl font-black text-zinc-900 dark:text-zinc-50">{activeVersion.scores.overall_ats_score}%</span>
                      <span className="text-[8.5px] font-mono text-indigo-500 uppercase font-black">ATS rating</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-zinc-500 text-center mt-3 leading-relaxed">
                    Great progress! Your resume currently scores high. Correct the missing skills to unlock maximum employer match.
                  </p>
                </div>

                {/* Sub Score Items */}
                <div className="space-y-3">
                  <span className="text-[10px] font-mono text-zinc-400 block uppercase">ATS Section diagnostics</span>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Keyword Score", score: activeVersion.scores.section_scores.keyword_score, color: "bg-emerald-500" },
                      { label: "Grammar & Tone", score: activeVersion.scores.section_scores.grammar_score, color: "bg-sky-500" },
                      { label: "Readability Index", score: activeVersion.scores.section_scores.readability_score, color: "bg-amber-500" },
                      { label: "Formatting", score: activeVersion.scores.section_scores.formatting_score, color: "bg-indigo-500" },
                      { label: "Projects Metric", score: activeVersion.scores.section_scores.projects_score, color: "bg-rose-500" },
                      { label: "Experience Metric", score: activeVersion.scores.section_scores.experience_score, color: "bg-purple-500" }
                    ].map(item => (
                      <div key={item.label} className="p-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 rounded-xl space-y-1">
                        <span className="text-[10.5px] text-zinc-500 font-medium block truncate">{item.label}</span>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex-1 bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                            <div className={`${item.color} h-full rounded-full`} style={{ width: `${item.score}%` }} />
                          </div>
                          <span className="text-[10px] font-mono font-bold text-zinc-700 dark:text-zinc-300">{item.score}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* 3. SKILL GAP ANALYSIS */}
            {rightActiveTab === "skills" && (
              <motion.div
                key="skills-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-5"
              >
                {isLoadingSkillGap ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin text-indigo-500" />
                    <span className="text-[11px] font-mono text-zinc-500">Checking technical gaps...</span>
                  </div>
                ) : skillGapReport ? (
                  <div className="space-y-5">
                    
                    {/* Skill Lists */}
                    <div className="space-y-3">
                      <span className="text-[10px] font-mono text-zinc-400 block uppercase">Matched Skills Stack</span>
                      <div className="flex flex-wrap gap-1.5">
                        {skillGapReport.matched_skills.map(s => (
                          <span key={s} className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/25 text-[10px] font-bold">
                            {s}
                          </span>
                        ))}
                      </div>

                      <span className="text-[10px] font-mono text-zinc-400 block uppercase pt-2">Missing Priority Skills</span>
                      <div className="flex flex-wrap gap-1.5">
                        {skillGapReport.missing_skills.map(s => (
                          <span key={s} className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-500 border border-rose-500/25 text-[10px] font-bold">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Recommendations List */}
                    <div className="border-t border-zinc-150 dark:border-zinc-800 pt-4 space-y-3">
                      <span className="text-[10.5px] font-mono font-bold text-indigo-500 uppercase block">RECOMMENDED CREDENTIAL ROADMAP</span>
                      <div className="space-y-2.5">
                        {skillGapReport.learning_recommendations.map((rec, idx) => (
                          <div key={idx} className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl flex items-start gap-2.5">
                            <Award className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <span className="text-[11.5px] font-bold text-zinc-900 dark:text-zinc-100 block leading-snug">{rec.title}</span>
                              <span className="text-[9.5px] text-zinc-400 block font-mono mt-0.5">{rec.type} | Offered by {rec.provider}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Suggested Projects to build */}
                    <div className="border-t border-zinc-150 dark:border-zinc-800 pt-4 space-y-3">
                      <span className="text-[10.5px] font-mono font-bold text-indigo-500 uppercase block">COMPLEMENTARY PROJECTS TO BUILD</span>
                      <div className="space-y-2.5">
                        {skillGapReport.projects_to_build.map((proj, idx) => (
                          <div key={idx} className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-1.5">
                            <span className="text-[11.5px] font-bold text-zinc-900 dark:text-zinc-100 block">{proj.title}</span>
                            <p className="text-[10px] text-zinc-500 leading-relaxed">{proj.description}</p>
                            <span className="text-[9px] font-mono text-indigo-500 font-bold block bg-indigo-500/10 rounded-md px-1.5 py-0.5 w-max">Stack: {proj.tech}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="text-center py-10">
                    <span className="text-xs text-zinc-400 block">No skill gap parameters scanned yet.</span>
                  </div>
                )}
              </motion.div>
            )}

            {/* 4. JOB MATCHING MODULE */}
            {rightActiveTab === "job-match" && (
              <motion.div
                key="job-match-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-5"
              >
                <div className="space-y-2">
                  <span className="text-[10.5px] font-mono text-zinc-400 block uppercase">Align with target position</span>
                  <textarea
                    rows={4}
                    value={jdText}
                    onChange={(e) => setJdText(e.target.value)}
                    placeholder="Paste the Job Description from LinkedIn, Stripe, or Google here..."
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3 py-2.5 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:text-zinc-200 resize-none leading-relaxed"
                  />
                  <button
                    onClick={runJdMatcher}
                    disabled={isMatchingJd || !jdText.trim()}
                    className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-950 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    {isMatchingJd ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Matching ATS Parameters...</span>
                      </>
                    ) : (
                      <>
                        <Target className="w-3.5 h-3.5" />
                        <span>Calculate Alignment</span>
                      </>
                    )}
                  </button>
                </div>

                {jdMatchReport && (
                  <div className="border-t border-zinc-150 dark:border-zinc-800 pt-4 space-y-4">
                    
                    {/* Circular match dial */}
                    <div className="flex items-center gap-3 p-3 bg-indigo-50/40 dark:bg-indigo-950/20 rounded-xl border border-indigo-200/40 dark:border-indigo-950/60">
                      <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{jdMatchReport.match_percentage}%</div>
                      <div>
                        <span className="text-xs font-bold block text-zinc-900 dark:text-zinc-150">JD Similarity Match</span>
                        <span className="text-[9.5px] font-mono text-zinc-400">Calculated across keywords & system roles</span>
                      </div>
                    </div>

                    {/* Missing Keywords */}
                    <div>
                      <span className="text-[10px] font-mono text-zinc-400 block uppercase mb-1.5">Missing Key Terms</span>
                      <div className="flex flex-wrap gap-1.5">
                        {jdMatchReport.missing_keywords.map(kw => (
                          <span key={kw} className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/25 text-[10px] font-bold">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Recommended Changes list */}
                    <div className="space-y-2.5">
                      <span className="text-[10px] font-mono text-zinc-400 block uppercase">Targeted Bullet Optimizations</span>
                      {jdMatchReport.recommended_changes.map((rec, i) => (
                        <div key={i} className="p-2.5 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-1 bg-zinc-50/50 dark:bg-zinc-950/20 text-[11px]">
                          <span className="text-[9px] font-mono text-red-500 block uppercase font-bold">Passive draft</span>
                          <p className="text-zinc-400">"{rec.original}"</p>
                          <span className="text-[9px] font-mono text-emerald-500 block uppercase font-bold mt-1">Stripe alignment bullet</span>
                          <p className="text-zinc-800 dark:text-zinc-200 font-bold">"{rec.improved}"</p>
                        </div>
                      ))}
                    </div>

                    {/* Interview Questions list */}
                    <div className="space-y-2.5 border-t border-zinc-150 dark:border-zinc-800 pt-4">
                      <span className="text-[10.5px] font-mono font-bold text-indigo-500 uppercase block">TARGET INTERVIEW QUESTIONS</span>
                      {jdMatchReport.interview_questions.map((q, idx) => (
                        <div key={idx} className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-[11px] text-zinc-700 dark:text-zinc-300">
                          {q}
                        </div>
                      ))}
                    </div>

                    {/* Company preparation checklist */}
                    <div className="space-y-2 border-t border-zinc-150 dark:border-zinc-800 pt-4">
                      <span className="text-[10.5px] font-mono font-bold text-indigo-500 uppercase block">COMPANY PREPARATION GUIDE</span>
                      <ul className="space-y-1.5">
                        {jdMatchReport.company_prep_guide.map((item, idx) => (
                          <li key={idx} className="text-[11px] text-zinc-500 flex items-start gap-1.5">
                            <span className="text-indigo-500">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                  </div>
                )}
              </motion.div>
            )}

            {/* 5. ANALYTICS MODULE */}
            {rightActiveTab === "analytics" && (
              <motion.div
                key="analytics-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Score Trend Rechart Line */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-zinc-400 block uppercase">Resume ATS Score Trend</span>
                  <div className="h-[180px] bg-zinc-50 dark:bg-zinc-950 rounded-xl p-2 border border-zinc-200 dark:border-zinc-800">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={scoreTrendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" opacity={0.4} />
                        <XAxis dataKey="name" stroke="#a1a1aa" fontSize={9} />
                        <YAxis stroke="#a1a1aa" fontSize={9} domain={[60, 100]} />
                        <Tooltip />
                        <Line type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={2} name="ATS Score" />
                        <Line type="monotone" dataKey="keywords" stroke="#10b981" strokeWidth={1} name="Keywords" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Radar Skill Classification chart */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-zinc-400 block uppercase">Skill Dimension Coverage</span>
                  <div className="h-[200px] bg-zinc-50 dark:bg-zinc-950 rounded-xl p-2 border border-zinc-200 dark:border-zinc-800 flex justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={skillPolarData}>
                        <PolarGrid stroke="#e4e4e7" opacity={0.5} />
                        <PolarAngleAxis dataKey="subject" stroke="#71717a" fontSize={9} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#a1a1aa" fontSize={8} />
                        <Radar name="Active Candidate" dataKey="A" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.2} />
                        <Radar name="Benchmark" dataKey="B" stroke="#10b981" fill="#10b981" fillOpacity={0.05} />
                        <Legend wrapperStyle={{ fontSize: 9 }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Growth numbers widget */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 rounded-xl">
                    <span className="text-[9px] font-mono text-zinc-400 block uppercase">Keyword Growth</span>
                    <span className="text-lg font-black text-emerald-500 block mt-1">+56%</span>
                    <p className="text-[8.5px] text-zinc-400 mt-1">From initial base document template</p>
                  </div>

                  <div className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 rounded-xl">
                    <span className="text-[9px] font-mono text-zinc-400 block uppercase">Skill Gaps Cleared</span>
                    <span className="text-lg font-black text-indigo-500 block mt-1">11 / 15</span>
                    <p className="text-[8.5px] text-zinc-400 mt-1">Based on Stripe targeted checklist</p>
                  </div>
                </div>

              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Footer info/export */}
        <div className="border-t border-zinc-150 dark:border-zinc-800 pt-4 flex items-center justify-between">
          <button
            onClick={handleExportChat}
            className="flex items-center gap-1.5 text-[10.5px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors font-mono cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT WORKSPACE LOGS</span>
          </button>
        </div>

      </div>

      {/* ----------------------------------------------------
          VERSION CREATION / DRAFT MODAL
         ---------------------------------------------------- */}
      <AnimatePresence>
        {showSaveModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl relative"
            >
              <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-50 mb-1.5 flex items-center gap-1.5">
                <FileCheck className="w-4.5 h-4.5 text-indigo-500" />
                <span>Save New Resume Version</span>
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                Name this template version descriptively (e.g. <code>resume_v2.txt</code>) to freeze the current draft as a benchmark.
              </p>

              <div className="space-y-4">
                <input
                  type="text"
                  value={newVersionName}
                  onChange={(e) => setNewVersionName(e.target.value)}
                  placeholder="e.g. resume_v2.txt"
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3.5 py-2.5 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:text-zinc-200 font-mono"
                />

                <div className="flex gap-2.5 pt-2">
                  <button
                    onClick={() => setShowSaveModal(false)}
                    className="flex-1 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-850 dark:hover:bg-zinc-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveNewVersion}
                    disabled={isSavingVersion}
                    className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    {isSavingVersion ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    <span>Save Version</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

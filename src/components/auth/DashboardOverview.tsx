/**
 * Path: /src/components/auth/DashboardOverview.tsx
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { 
  Sparkles, 
  FileText, 
  History, 
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Clock,
  Target,
  BarChart3,
  Code2,
  Bot,
  Globe,
  Download
} from "lucide-react";
import { jsPDF } from "jspdf";
import { getCandidateMemory } from "../../services/candidateMemory";

interface ProfileType {
  fullName: string;
  university: string;
  graduationYear: string;
  targetRoles: string[];
  skills: string[];
  department?: string;
  semester?: string;
  dreamRole?: string;
}

interface DashboardOverviewProps {
  email: string;
  profile: ProfileType;
  resumeFileName: string;
  onChangeTab: (tab: any) => void;
  onLogout?: () => void;
}

export function DashboardOverview({
  email,
  profile,
  resumeFileName,
  onChangeTab
}: DashboardOverviewProps) {
  
  const parsedData = (() => {
    try {
      const saved = localStorage.getItem(`interview_cracker_resume_analysis_${email}`);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  })();

  const studentName = profile.fullName || parsedData?.personalInfo?.fullName || "Candidate";
  const college = profile.university || parsedData?.personalInfo?.college || "Your institution";
  const department = parsedData?.domain || profile.department || "Computer / IT";
  const dreamRole = parsedData?.profession || profile.targetRoles?.[0] || profile.dreamRole || "Software Engineer";
  const atsScore = Number(parsedData?.atsScore || 0);
  const [memory, setMemory] = useState<any>(null);
  useEffect(() => { getCandidateMemory().then(setMemory).catch(() => setMemory(null)); }, [email]);
  const readiness = Number(memory?.readiness?.overall || 0);
  const skillCount = Array.isArray(parsedData?.skills) ? parsedData.skills.length : Object.keys(memory?.skills || {}).length;
  const latestInterview = memory?.interview_history?.slice(-1)[0] || null;
  const weakAreas = Array.isArray(memory?.weaknesses) ? memory.weaknesses.slice(-4).map((w:any) => String(w?.text || w)).filter(Boolean) : [];
  const communicationScore = Number(memory?.communication?.clarity || 0);
  const codingScore = Number(memory?.readiness?.coding || 0);

  const handleDownloadReport = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(22);
    doc.setTextColor(26, 29, 33);
    doc.text("Interview Performance Report", 20, 20);
    
    // Profile info
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Name: ${studentName}`, 20, 35);
    doc.text(`University: ${college}`, 20, 42);
    doc.text(`Domain: ${department}`, 20, 49);
    doc.text(`Target Role: ${dreamRole}`, 20, 56);
    
    // Summary
    doc.setFontSize(16);
    doc.setTextColor(26, 29, 33);
    doc.text("Performance Metrics", 20, 75);
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`ATS Score: ${atsScore}/100`, 20, 85);
    doc.text(`Readiness: ${readiness || "No evidence yet"}`, 20, 92);
    doc.text(`Skills Detected: ${skillCount || "No evidence yet"}`, 20, 99);
    
    // Mock Interview
    doc.setFontSize(16);
    doc.setTextColor(26, 29, 33);
    doc.text("Latest Mock Interview", 20, 115);
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Score: ${latestInterview?.score ?? "No completed interview"}`, 20, 125);
    doc.text(`Summary: ${latestInterview ? "Based on persistent candidate evidence." : "No interview report yet."}`, 20, 132);
    
    // Areas for improvement
    doc.setFontSize(16);
    doc.setTextColor(26, 29, 33);
    doc.text("Areas for Improvement", 20, 150);
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text("- System design depth could be expanded.", 20, 160);
    doc.text("- Focus on behavioral questions pacing.", 20, 167);
    doc.text("- Improve dynamic programming algorithm explanations.", 20, 174);
    
    doc.save("Interview_Performance_Report.pdf");
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  const statsContainerVariants: any = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const statItemVariants: any = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: "backOut" } }
  };

  return (
    <motion.div 
      className="space-y-8 select-none" 
      id="dashboard-overview-workspace"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* 1. WELCOME SECTION */}
      <motion.div variants={itemVariants} className="bg-white dark:bg-zinc-900 border border-[#1A1D21]/10 dark:border-zinc-800 rounded-xl p-6 sm:p-8 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="font-mono text-[10px] uppercase font-bold tracking-[0.15em] text-blue-600 dark:text-blue-400 block">
            — Candidate Command Center
          </span>
          <h2 className="font-serif-editorial text-3xl sm:text-4xl font-bold tracking-tight text-[#1A1D21] dark:text-white">
            Welcome back, {studentName}.
          </h2>
          <p className="text-xs sm:text-sm text-[#1A1D21]/60 dark:text-zinc-400 max-w-xl">
            Target Role: <span className="font-semibold text-[#1A1D21] dark:text-zinc-200">{dreamRole}</span> • {college}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => onChangeTab("resume")}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-full transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <Sparkles className="w-4 h-4" />
            <span>Open Resume Interview Hub</span>
          </button>
        </div>
      </motion.div>

      {/* 2. CONNECTED PREPARATION TRACKS */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { tab: "resume", label: "Track 1", title: "Resume", text: "Resume intelligence and adaptive interview rounds based on your actual profile.", icon: FileText },
          { tab: "coding", label: "Track 2", title: "Coding Arena", text: "Practice programming and wider CS topics with adaptive AI guidance.", icon: Code2 },
          { tab: "intelligence", label: "Track 3", title: "Candidate Intelligence", text: "See what the system remembers about your strengths, weaknesses and progress.", icon: Bot },
          { tab: "communication", label: "Track 4", title: "English Coach", text: "Improve spoken English through a real AI conversation and personalized coaching.", icon: Globe }
        ].map((item:any) => {
          const Icon = item.icon;
          return (
            <div key={item.tab} className="group p-5 bg-white dark:bg-zinc-900 border border-[#1A1D21]/10 dark:border-zinc-800 rounded-2xl shadow-2xs flex flex-col justify-between min-h-[210px] hover:-translate-y-0.5 hover:shadow-md transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between"><span className="font-mono text-[9px] font-bold uppercase tracking-wider text-[#1A1D21]/45 dark:text-zinc-500">{item.label}</span><span className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-zinc-800 flex items-center justify-center"><Icon className="w-4 h-4 text-[#1A1D21] dark:text-zinc-200" /></span></div>
                <h3 className="text-sm font-extrabold text-[#1A1D21] dark:text-white">{item.title}</h3>
                <p className="text-xs text-[#1A1D21]/60 dark:text-zinc-400 leading-relaxed">{item.text}</p>
              </div>
              <button onClick={() => onChangeTab(item.tab)} className="mt-4 w-full py-2.5 bg-[#F9F8F6] dark:bg-zinc-800 hover:bg-[#1A1D21] hover:text-white text-[#1A1D21] dark:text-zinc-200 font-semibold text-xs rounded-xl border border-[#1A1D21]/10 dark:border-zinc-700 transition-all cursor-pointer flex items-center justify-center gap-1.5">Open {item.title}<ArrowRight className="w-3.5 h-3.5" /></button>
            </div>
          );
        })}
      </motion.div>

      {/* 4 & 5. RECENT INTERVIEW + PROGRESS SUMMARY */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* RECENT INTERVIEW */}
        <div className="p-6 bg-white dark:bg-zinc-900 border border-[#1A1D21]/10 dark:border-zinc-800 rounded-xl shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#1A1D21]/10 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#1A1D21] dark:text-white">Recent Interview</h3>
            </div>
            <button
              onClick={() => onChangeTab("history")}
              className="font-mono text-[11px] font-bold uppercase tracking-wider text-blue-600 hover:underline cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="p-4 bg-[#F9F8F6] dark:bg-zinc-800/60 border border-[#1A1D21]/10 dark:border-zinc-700/60 rounded-lg space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#1A1D21] dark:text-zinc-100">{latestInterview ? latestInterview.type : "No interview history yet"}</span>
              {latestInterview && <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">Score: {latestInterview.score}%</span>}
            </div>
            <p className="text-xs text-[#1A1D21]/60 dark:text-zinc-400">
              {latestInterview ? `Last completed interview on ${new Date(latestInterview.completed_at || latestInterview.created_at).toLocaleDateString()}.` : "Complete your first Resume Practice interview to build candidate evidence."}
            </p>
          </div>
        </div>

        {/* PROGRESS SUMMARY */}
        <div className="p-6 bg-white dark:bg-zinc-900 border border-[#1A1D21]/10 dark:border-zinc-800 rounded-xl shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-[#1A1D21]/10 dark:border-zinc-800 pb-3">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#1A1D21] dark:text-white">Progress Summary</h3>
          </div>

          <motion.div variants={statsContainerVariants} initial="hidden" animate="visible" className="grid grid-cols-3 gap-3 pt-1">
            <motion.div variants={statItemVariants} className="p-3 bg-[#F9F8F6] dark:bg-zinc-800/60 border border-[#1A1D21]/10 dark:border-zinc-700/60 rounded-lg text-center">
              <span className="font-serif-editorial text-2xl font-bold text-[#1A1D21] dark:text-zinc-100 block">{atsScore}%</span>
              <span className="font-mono text-[9px] uppercase tracking-wider text-[#1A1D21]/50 dark:text-zinc-400 block mt-1">ATS Score</span>
            </motion.div>
            <motion.div variants={statItemVariants} className="p-3 bg-[#F9F8F6] dark:bg-zinc-800/60 border border-[#1A1D21]/10 dark:border-zinc-700/60 rounded-lg text-center">
              <span className="font-serif-editorial text-2xl font-bold text-blue-600 dark:text-blue-400 block">{readiness || "—"}{readiness ? "%" : ""}</span>
              <span className="font-mono text-[9px] uppercase tracking-wider text-[#1A1D21]/50 dark:text-zinc-400 block mt-1">Readiness</span>
            </motion.div>
            <motion.div variants={statItemVariants} className="p-3 bg-[#F9F8F6] dark:bg-zinc-800/60 border border-[#1A1D21]/10 dark:border-zinc-700/60 rounded-lg text-center">
              <span className="font-serif-editorial text-2xl font-bold text-[#1A1D21] dark:text-zinc-100 block">{codingScore > 0 ? `${codingScore}%` : "—"}</span>
              <span className="font-mono text-[9px] uppercase tracking-wider text-[#1A1D21]/50 dark:text-zinc-400 block mt-1">Coding</span>
            </motion.div>
          </motion.div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-[#F9F8F6] dark:bg-zinc-800/60 border border-[#1A1D21]/10 dark:border-zinc-700/60 rounded-lg"><span className="font-mono text-[9px] uppercase tracking-wider text-[#1A1D21]/50 dark:text-zinc-400 block">Communication</span><span className="font-bold text-sm mt-1 block">{communicationScore > 0 ? `${Math.round(communicationScore)}%` : "No evidence yet"}</span></div>
            <div className="p-3 bg-[#F9F8F6] dark:bg-zinc-800/60 border border-[#1A1D21]/10 dark:border-zinc-700/60 rounded-lg"><span className="font-mono text-[9px] uppercase tracking-wider text-[#1A1D21]/50 dark:text-zinc-400 block">Focus</span><span className="font-bold text-sm mt-1 block truncate">{weakAreas[0] || "Keep building evidence"}</span></div>
          </div>
        </div>
      </motion.div>

      {/* 6. LATEST REPORTS */}
      <motion.div variants={itemVariants} className="p-6 bg-white dark:bg-zinc-900 border border-[#1A1D21]/10 dark:border-zinc-800 rounded-xl shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#1A1D21]/10 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2.5">
            <BarChart3 className="w-4 h-4 text-amber-600" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#1A1D21] dark:text-white">Latest Reports</h3>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleDownloadReport}
              className="font-mono text-[11px] font-bold uppercase tracking-wider text-emerald-600 hover:underline cursor-pointer flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Download PDF
            </button>
            <button
              onClick={() => onChangeTab("history")}
              className="font-mono text-[11px] font-bold uppercase tracking-wider text-blue-600 hover:underline cursor-pointer"
            >
              View Full History
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            onClick={() => onChangeTab("history")}
            className="p-4 bg-[#F9F8F6] dark:bg-zinc-800/60 hover:bg-white dark:hover:bg-zinc-800 border border-[#1A1D21]/10 dark:border-zinc-700/60 rounded-lg transition-all cursor-pointer space-y-1.5"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#1A1D21] dark:text-zinc-100">Latest Interview Report</span>
              <span className="font-mono text-[10px] text-[#1A1D21]/50">{latestInterview ? new Date(latestInterview.completed_at || latestInterview.created_at).toLocaleDateString() : "No history"}</span>
            </div>
            <p className="text-xs text-[#1A1D21]/60 dark:text-zinc-400 line-clamp-1">
              {latestInterview ? `Overall score: ${latestInterview.score}/100 • ${latestInterview.type}.` : "No interview report yet. Complete a Resume Practice round to generate evidence."}
            </p>
          </div>

          <div
            onClick={() => onChangeTab("resume")}
            className="p-4 bg-[#F9F8F6] dark:bg-zinc-800/60 hover:bg-white dark:hover:bg-zinc-800 border border-[#1A1D21]/10 dark:border-zinc-700/60 rounded-lg transition-all cursor-pointer space-y-1.5"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#1A1D21] dark:text-zinc-100">Resume Quality Report</span>
              <span className="font-mono text-[10px] text-[#1A1D21]/50">{atsScore ? "Available" : "Not analyzed"}</span>
            </div>
            <p className="text-xs text-[#1A1D21]/60 dark:text-zinc-400 line-clamp-1">
              {atsScore ? `ATS Score: ${atsScore}/100 • Detected domain: ${department}.` : "Upload and analyze your resume to create Resume Intelligence."}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

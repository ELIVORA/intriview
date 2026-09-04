/**
 * Path: /src/components/auth/StudentDashboard.tsx
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FileText,
  User,
  LogOut,
  Sparkles,
  Settings,
  History,
  Code2,
  ChevronLeft,
  ChevronRight,
  Cpu,
  RefreshCw,
  LayoutDashboard,
  Sun,
  Moon,
  Globe,
  Camera,
  Upload,
  Trash2,
  ShieldCheck,
  Bot,
  Target,
  Menu,
  X,
  ArrowUpRight
} from "lucide-react";
import { PageSkeleton, InterviewSkeleton } from "../common/Skeletons";
import { ErrorBoundary } from "../common/ErrorBoundary";
import { useToast } from "../../providers/ToastProvider";
import { useTheme } from "../../providers/ThemeProvider";
import { CareerReadinessCenter } from "../career/CareerReadinessCenter";
import { syncCandidateProfile, resetCandidateMemory } from "../../services/candidateMemory";
import CodingArena from "../coding/CodingArena";

// Lazy-loaded dynamic imports for the core features
const ResumeIntelligenceEngine = React.lazy(() =>
  import("./ResumeIntelligenceEngine").then((m) => ({ default: m.ResumeIntelligenceEngine }))
);
const ResumeInterviewStudio = React.lazy(() =>
  import("../interview/ResumeInterviewStudio").then((m) => ({ default: m.ResumeInterviewStudio }))
);
const VoiceSettingsCard = React.lazy(() =>
  import("../settings/VoiceSettingsCard").then((m) => ({ default: m.VoiceSettingsCard }))
);
import { AppSidebarChatbot } from "../chat/AppSidebarChatbot";
const DashboardOverview = React.lazy(() =>
  import("./DashboardOverview").then((m) => ({ default: m.DashboardOverview }))
);
const PreviousReports = React.lazy(() =>
  import("./PreviousReports").then((m) => ({ default: m.PreviousReports }))
);
const EnglishCoachHub = React.lazy(() =>
  import("../english/EnglishCoachHub").then((m) => ({ default: m.EnglishCoachHub }))
);
const CandidateIntelligenceCenter = React.lazy(() =>
  import("./CandidateIntelligenceCenter").then((m) => ({ default: m.CandidateIntelligenceCenter }))
);

export type TabType = "overview" | "resume" | "coding" | "career" | "history" | "intelligence" | "communication" | "profile" | "settings";

interface StudentDashboardProps {
  email: string;
  profile: {
    fullName: string;
    university: string;
    graduationYear: string;
    targetRoles: string[];
    skills: string[];
  };
  resumeFileName: string;
  onLogout: () => void;
}

export function StudentDashboard({
  email,
  profile,
  resumeFileName,
  onLogout,
}: StudentDashboardProps) {
  const { toast } = useToast();
  const { resolvedTheme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Synchronized Profile State from localStorage fallback
  const [profileState, setProfileState] = useState(() => {
    const saved = localStorage.getItem(`interview_cracker_profile_${email}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          fullName: parsed.fullName || profile.fullName || "Candidate",
          university: parsed.university || profile.university || "Your institution",
          graduationYear: parsed.graduationYear || profile.graduationYear || "2026",
          targetRoles: parsed.targetRoles || profile.targetRoles || ["Software Engineer"],
          skills: parsed.skills || profile.skills || ["React", "TypeScript", "Python"],
          department: parsed.department || "Computer / IT",
          semester: parsed.semester || "7th Semester",
          dreamRole: parsed.dreamRole || parsed.targetRoles?.[0] || profile.targetRoles?.[0] || "Software Engineer"
        };
      } catch (e) {
        console.warn("Error parsing profile, falling back", e);
      }
    }
    return {
      fullName: profile.fullName || "Candidate",
      university: profile.university || "Your institution",
      graduationYear: profile.graduationYear || "2026",
      targetRoles: profile.targetRoles || ["Software Engineer"],
      skills: profile.skills || ["React", "TypeScript", "Python"],
      department: "Computer / IT",
      semester: "7th Semester",
      dreamRole: profile.targetRoles?.[0] || "Software Engineer"
    };
  });

  // Avatar photo state
  const [avatarUrl, setAvatarUrl] = useState<string>(() => {
    return localStorage.getItem(`profile_avatar_${email}`) || "";
  });
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast("Please upload an image smaller than 5MB.", "error", "File too large");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setAvatarUrl(result);
        localStorage.setItem(`profile_avatar_${email}`, result);
        toast("Your profile picture has been updated.", "success", "Photo Uploaded");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setAvatarUrl("");
    localStorage.removeItem(`profile_avatar_${email}`);
    toast("Reverted to default initial badge.", "info", "Photo Removed");
  };

  // Profile form state (editable in Profile tab)
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(profileState.fullName);
  const [editCollege, setEditCollege] = useState(profileState.university);
  const [editDept, setEditDept] = useState(profileState.department);
  const [editSem, setEditSem] = useState(profileState.semester);
  const [editGradYear, setEditGradYear] = useState(profileState.graduationYear);
  const [editDream, setEditDream] = useState(profileState.dreamRole);
  const [editSkillsStr, setEditSkillsStr] = useState((profileState.skills || []).join(", "));

  // App Settings state (in Settings tab)
  const [appNotifications, setAppNotifications] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [appLanguage, setAppLanguage] = useState(() => localStorage.getItem("interview_cracker_interface_language") || "English (US)");
  useEffect(() => { localStorage.setItem("interview_cracker_interface_language", appLanguage); }, [appLanguage]);

  const handleSaveProfile = () => {
    if (!editName.trim()) {
      toast("Name cannot be empty.", "error", "Validation Error");
      return;
    }

    const newSkills = editSkillsStr.split(",").map(s => s.trim()).filter(Boolean);

    const updatedProfile = {
      ...profileState,
      fullName: editName.trim(),
      university: editCollege.trim(),
      department: editDept.trim(),
      semester: editSem.trim(),
      graduationYear: editGradYear.trim(),
      dreamRole: editDream.trim(),
      targetRoles: [editDream.trim()],
      skills: newSkills.length > 0 ? newSkills : profileState.skills
    };

    setProfileState(updatedProfile);
    localStorage.setItem(`interview_cracker_profile_${email}`, JSON.stringify(updatedProfile));
    localStorage.setItem("userFullName", editName.trim());
    syncCandidateProfile({
      fullName: updatedProfile.fullName,
      university: updatedProfile.university,
      graduationYear: updatedProfile.graduationYear,
      targetRoles: updatedProfile.targetRoles,
      skills: updatedProfile.skills
    }).catch((error) => console.warn("Candidate Memory profile sync skipped:", error));

    setIsEditingProfile(false);
    toast("Profile details updated successfully.", "success", "Profile Saved");
  };

  const handleResetAppData = async () => {
    const confirmed = window.confirm("Reset Candidate Data/Memory? This permanently clears your interviews, answers, scores, coding performance, communication history, resume memory, and learning progress. This cannot be undone.");
    if (!confirmed) return;
    try {
      await resetCandidateMemory();
      localStorage.removeItem(`interview_cracker_profile_${email}`);
      localStorage.removeItem(`profile_avatar_${email}`);
      localStorage.removeItem("interview_cracker_parsed_resume_data");
      localStorage.removeItem(`interview_cracker_coding_history_${email}`);
      localStorage.removeItem(`interview_cracker_interview_history_${email}`);
      toast("Your persistent candidate data has been reset.", "success", "Candidate Memory Reset");
      setTimeout(() => window.location.reload(), 600);
    } catch (error: any) {
      toast(error?.message || "Unable to reset candidate data.", "error", "Reset Failed");
    }
  };

  const handleTabChange = (tabId: string) => {
    const validTabs: TabType[] = ["overview", "resume", "coding", "career", "history", "intelligence", "communication", "profile", "settings"];
    if (validTabs.includes(tabId as TabType)) {
      setActiveTab(tabId as TabType);
    } else {
      setActiveTab("overview");
    }
  };

  const isTechDomain = /software|computer|data|ai|machine learning|developer|cloud|cyber|electrical|electronics/i.test(profileState.department);

  const candidateSidebarItems: Array<{ id: TabType; label: string; icon: React.ElementType }> = [
    { id: "overview", label: "Dashboard", icon: LayoutDashboard },
    { id: "resume", label: "Resume", icon: FileText },
    { id: "coding", label: "Coding Arena", icon: Code2 },
    { id: "intelligence", label: "Candidate Intelligence", icon: Bot },
    { id: "communication", label: "Communication Coach", icon: Globe },
    { id: "history", label: "Reports", icon: History },
    { id: "profile", label: "Profile", icon: User },
    { id: "settings", label: "Settings", icon: Settings }
  ];

  const sidebarItems = candidateSidebarItems;

  const [activeResumeAnalysis, setActiveResumeAnalysis] = useState<any | null>(null);
  const [isResumeInterviewActive, setIsResumeInterviewActive] = useState<boolean>(false);
  useEffect(() => {
  console.log(
    "[INTERVIEW DEBUG]",
    {
      activeTab,
      isResumeInterviewActive,
      hasActiveResumeAnalysis: !!activeResumeAnalysis,
    }
  );
}, [activeTab, isResumeInterviewActive, activeResumeAnalysis]);

  const sectionHeaders: Record<TabType, { title: string; subtitle: string }> = {
    overview: {
      title: "Dashboard",
      subtitle: "Overview of your interview prep, resume score, and progress."
    },
    resume: {
      title: "Resume Analysis",
      subtitle: "Upload your resume for instant ATS scoring and key feedback."
    },
    coding: {
      title: "AI Coding Arena",
      subtitle: "Solve role-relevant coding challenges and receive structured AI feedback."
    },
    career: {
      title: "Placement Readiness",
      subtitle: "Track your evidence-based preparation score and adaptive roadmap."
    },
    history: {
      title: "Performance Reports",
      subtitle: "Detailed analysis of your past interviews and skills."
    },
    intelligence: {
      title: "Candidate Intelligence",
      subtitle: "Your persistent AI memory, adaptive topics, readiness, and improvement roadmap."
    },
    communication: {
      title: "English Communication Coach",
      subtitle: "Build grammar, fluency, vocabulary, confidence, pronunciation, and professional speaking skills."
    },
    profile: {
      title: "Candidate Profile",
      subtitle: "Manage your education, target roles, and domain skills."
    },
    settings: {
      title: "Settings",
      subtitle: "Manage account preferences, interview difficulty, and defaults."
    },
  };

  const currentHeader = sectionHeaders[activeTab] || sectionHeaders.overview;

  return (
    <div id="student-practice-dashboard" className="ic-app-shell">
      <header className="ic-topbar">
        <button type="button" className="ic-brand" onClick={() => setActiveTab("overview")} aria-label="Go to dashboard">
          <span className="ic-brand-mark"><Sparkles className="w-4 h-4" /></span>
          <span className="ic-brand-copy">
            <strong>Interview Cracker</strong>
            <span>Interview preparation workspace</span>
          </span>
        </button>

        <div className="ic-topbar-meta">
          <span className="ic-secure"><ShieldCheck className="w-3.5 h-3.5" /> Session secure</span>
          <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="ic-icon-button"
            aria-label="Toggle theme"
            title={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
          >
            {resolvedTheme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <div className="ic-user-chip">
            <div className="ic-avatar">
              {avatarUrl ? <img src={avatarUrl} alt={profileState.fullName} /> : (profileState.fullName ? profileState.fullName.charAt(0).toUpperCase() : "C")}
            </div>
            <div className="ic-user-copy">
              <strong>{profileState.fullName}</strong>
              <span>{email}</span>
            </div>
          </div>
          <button onClick={onLogout} className="ic-logout">
            <LogOut className="w-3.5 h-3.5" /> Log out
          </button>
        </div>
      </header>

      <div className="ic-mobile-nav">
        <div className="ic-mobile-nav-scroll">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button key={item.id} onClick={() => handleTabChange(item.id)} className={`ic-mobile-nav-item ${active ? "is-active" : ""}`}>
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="ic-app-body">
        <aside className={`ic-sidebar ${isSidebarCollapsed ? "is-collapsed" : ""}`}>
          <div className="ic-sidebar-head">
            {!isSidebarCollapsed && (
              <div>
                <span className="ic-eyebrow">Workspace</span>
                <span className="ic-sidebar-title">Candidate portal</span>
              </div>
            )}
            <button
              type="button"
              className="ic-collapse-button"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          <nav className="ic-nav" aria-label="Candidate navigation">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  title={isSidebarCollapsed ? item.label : undefined}
                  className={`ic-nav-item ${active ? "is-active" : ""}`}
                >
                  <span className="ic-nav-icon"><Icon className="w-4 h-4" /></span>
                  {!isSidebarCollapsed && <span>{item.label}</span>}
                  {!isSidebarCollapsed && active && <ArrowUpRight className="ic-nav-arrow w-3.5 h-3.5" />}
                </button>
              );
            })}
          </nav>

          {!isSidebarCollapsed && (
            <div className="ic-sidebar-footer">
              <div className="ic-sidebar-footer-icon"><Target className="w-4 h-4" /></div>
              <div>
                <strong>Stay interview-ready</strong>
                <span>Use each module to build evidence.</span>
              </div>
            </div>
          )}
        </aside>

        <main className="ic-main">
          <div className="ic-page-intro">
            <div className="ic-page-intro-copy">
              <span className="ic-eyebrow">{activeTab === "overview" ? "Overview" : "Candidate workspace"}</span>
              <h1>{currentHeader.title}</h1>
              <p>{currentHeader.subtitle}</p>
            </div>
            <div className="ic-page-intro-actions">
              {activeTab !== "overview" && (
                <button type="button" onClick={() => setActiveTab("overview")} className="ic-quiet-action">
                  <ChevronLeft className="w-4 h-4" /> Overview
                </button>
              )}
              <div className="ic-page-status">
                <span className="ic-status-dot" /> Live workspace
              </div>
            </div>
          </div>

          <div className="ic-content-frame">

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
              className={`w-full workspace-panel workspace-panel--${activeTab}`}
            >
              <ErrorBoundary
                fallback={
                  <div className="p-8 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl text-center space-y-4">
                    <p className="text-sm text-slate-600 dark:text-zinc-400">
                      An error occurred while loading this view.
                    </p>
                    <button
                      onClick={() => setActiveTab("overview")}
                      className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors cursor-pointer inline-flex items-center gap-2"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Return to Overview
                    </button>
                  </div>
                }
              >
                {activeTab === "overview" && (
                  <React.Suspense fallback={<PageSkeleton />}>
                    <DashboardOverview
                      email={email}
                      profile={profileState}
                      resumeFileName={resumeFileName}
                      onChangeTab={(tab) => handleTabChange(tab)}
                      onLogout={onLogout}
                    />
                  </React.Suspense>
                )}

                {isResumeInterviewActive ? (
  <React.Suspense fallback={<InterviewSkeleton />}>
    <ResumeInterviewStudio
      email={email}
      profile={profileState}
      resumeFileName={resumeFileName}
      resumeAnalysisData={activeResumeAnalysis}
      onBackToResume={() => {
  console.log("[INTERVIEW NAV] Back to Resume triggered");
  setIsResumeInterviewActive(false);
  setActiveTab("resume");
}}
    />
  </React.Suspense>
) : (
  activeTab === "resume" && (
    <React.Suspense fallback={<PageSkeleton />}>
      <ResumeIntelligenceEngine
        email={email}
        resumeFileName={resumeFileName}
        onStartInterview={(analysisData?: any) => {
          if (analysisData) {
            setActiveResumeAnalysis(analysisData);
          }

          setActiveTab("resume");
          setIsResumeInterviewActive(true);
        }}
      />
    </React.Suspense>
  )
)}

                {activeTab === "coding" && (
                  <React.Suspense fallback={<PageSkeleton />}>
                    <CodingArena email={email} profile={profileState} />
                  </React.Suspense>
                )}

                {activeTab === "career" && (
                  <React.Suspense fallback={<PageSkeleton />}>
                    <CareerReadinessCenter
                      email={email}
                      profile={profileState}
                      onNavigate={(tab) => handleTabChange(tab)}
                    />
                  </React.Suspense>
                )}

                {activeTab === "history" && (
                  <React.Suspense fallback={<PageSkeleton />}>
                    <PreviousReports />
                  </React.Suspense>
                )}

                {activeTab === "intelligence" && (
                  <React.Suspense fallback={<PageSkeleton />}>
                    <CandidateIntelligenceCenter onNavigate={(tab) => handleTabChange(tab)} />
                  </React.Suspense>
                )}

                {activeTab === "communication" && (
                  <React.Suspense fallback={<PageSkeleton />}>
                    <EnglishCoachHub />
                  </React.Suspense>
                )}

                {activeTab === "profile" && (
                  <div className="space-y-6" id="candidate-profile-view">
                    <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-6 sm:p-8 rounded-2xl shadow-xs space-y-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-zinc-800">
                        <div className="flex items-center gap-5">
                          {/* Profile Avatar Frame */}
                          <div className="relative group">
                            <div className="w-20 h-20 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-2xl shadow-md shadow-blue-500/20 overflow-hidden border-2 border-white dark:border-zinc-800 shrink-0">
                              {avatarUrl ? (
                                <img src={avatarUrl} alt={profileState.fullName} className="w-full h-full object-cover" />
                              ) : (
                                profileState.fullName ? profileState.fullName.charAt(0).toUpperCase() : "C"
                              )}
                            </div>
                            <button
                              onClick={() => fileInputRef.current?.click()}
                              className="absolute -bottom-1 -right-1 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg cursor-pointer transition-transform duration-200 hover:scale-105"
                              title="Upload profile photo"
                            >
                              <Camera className="w-3.5 h-3.5" />
                            </button>
                            <input
                              type="file"
                              ref={fileInputRef}
                              accept="image/*"
                              className="hidden"
                              onChange={handleImageUpload}
                            />
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-3">
                              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{profileState.fullName}</h2>
                              {avatarUrl && (
                                <button
                                  onClick={handleRemoveImage}
                                  className="text-[10px] text-red-500 hover:text-red-600 underline font-semibold cursor-pointer flex items-center gap-1"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  Remove Photo
                                </button>
                              )}
                            </div>
                            <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">{profileState.dreamRole}</p>
                            <p className="text-xs text-slate-500 dark:text-zinc-400">{email}</p>
                            <button
                              onClick={() => fileInputRef.current?.click()}
                              className="mt-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1.5 cursor-pointer"
                            >
                              <Upload className="w-3 h-3" />
                              <span>{avatarUrl ? "Change Photo" : "Upload Profile Photo"}</span>
                            </button>
                          </div>
                        </div>

                        <button
                          onClick={() => setIsEditingProfile(!isEditingProfile)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-sm"
                        >
                          {isEditingProfile ? "Cancel Editing" : "Edit Profile"}
                        </button>
                      </div>

                      {/* EDITABLE PROFILE FORM */}
                      {isEditingProfile ? (
                        <div className="space-y-5 pt-2 max-w-xl">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Edit Candidate Details</h3>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Full Name</label>
                              <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-900 dark:text-white"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Target Role</label>
                              <input
                                type="text"
                                value={editDream}
                                onChange={(e) => setEditDream(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-900 dark:text-white"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">College / University</label>
                              <input
                                type="text"
                                value={editCollege}
                                onChange={(e) => setEditCollege(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-900 dark:text-white"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Department</label>
                              <input
                                type="text"
                                value={editDept}
                                onChange={(e) => setEditDept(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-900 dark:text-white"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Semester</label>
                              <input
                                type="text"
                                value={editSem}
                                onChange={(e) => setEditSem(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-900 dark:text-white"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Graduation Year</label>
                              <input
                                type="text"
                                value={editGradYear}
                                onChange={(e) => setEditGradYear(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-900 dark:text-white"
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Key Technical Skills (comma separated)</label>
                            <input
                              type="text"
                              value={editSkillsStr}
                              onChange={(e) => setEditSkillsStr(e.target.value)}
                              placeholder="e.g. React, TypeScript, Python, SQL"
                              className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-900 dark:text-white"
                            />
                          </div>

                          <div className="pt-3 flex gap-3">
                            <button
                              onClick={handleSaveProfile}
                              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-blue-500/20"
                            >
                              Save Profile Changes
                            </button>
                            <button
                              onClick={() => setIsEditingProfile(false)}
                              className="px-4 py-2 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-medium text-slate-600 dark:text-zinc-400 cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* READ-ONLY DISPLAY MODE */
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="p-5 bg-slate-50/70 dark:bg-zinc-950 border border-slate-200/60 dark:border-zinc-800/80 rounded-xl space-y-3">
                            <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">Education & Domain</span>
                            <div className="space-y-2 text-xs">
                              <div className="flex justify-between py-1 border-b border-slate-200/40 dark:border-zinc-800/60">
                                <span className="text-slate-500 dark:text-zinc-400">Institution:</span>
                                <span className="font-semibold text-slate-900 dark:text-zinc-100">{profileState.university}</span>
                              </div>
                              <div className="flex justify-between py-1 border-b border-slate-200/40 dark:border-zinc-800/60">
                                <span className="text-slate-500 dark:text-zinc-400">Department:</span>
                                <span className="font-semibold text-slate-900 dark:text-zinc-100">{profileState.department}</span>
                              </div>
                              <div className="flex justify-between py-1">
                                <span className="text-slate-500 dark:text-zinc-400">Graduation / Semester:</span>
                                <span className="font-semibold text-slate-900 dark:text-zinc-100">{profileState.semester} ({profileState.graduationYear})</span>
                              </div>
                            </div>
                          </div>

                          <div className="p-5 bg-slate-50/70 dark:bg-zinc-950 border border-slate-200/60 dark:border-zinc-800/80 rounded-xl space-y-3">
                            <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">Target Roles & Skills</span>
                            <div className="space-y-3 text-xs">
                              <div>
                                <span className="text-slate-500 dark:text-zinc-400 block mb-1">Target Roles:</span>
                                <div className="flex flex-wrap gap-1.5">
                                  {(profileState.targetRoles || [profileState.dreamRole]).map((r) => (
                                    <span key={r} className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-semibold border border-blue-200/50 dark:border-blue-900/40">
                                      {r}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <span className="text-slate-500 dark:text-zinc-400 block mb-1">Core Skills:</span>
                                <div className="flex flex-wrap gap-1.5">
                                  {(profileState.skills || ["Communication", "Problem Solving"]).map((s) => (
                                    <span key={s} className="px-2.5 py-1 bg-slate-200/60 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-lg text-xs font-medium">
                                      {s}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "settings" && (
                  <div className="space-y-6" id="settings-view-form">
                    <React.Suspense fallback={<PageSkeleton />}>
                      <VoiceSettingsCard />
                    </React.Suspense>

                    <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-6 sm:p-8 rounded-2xl space-y-6 shadow-xs max-w-2xl">
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Application Preferences & Settings</h3>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                          Manage app theme, notifications, audio options, and local storage data.
                        </p>
                      </div>

                      <div className="space-y-6 divide-y divide-slate-100 dark:divide-zinc-800 text-xs">
                        {/* Theme Toggle */}
                        <div className="pt-4 flex items-center justify-between">
                          <div>
                            <span className="font-bold text-slate-900 dark:text-zinc-100 block">Appearance & Theme</span>
                            <span className="text-slate-500 dark:text-zinc-400 text-[11px]">Switch between light and dark visual mode.</span>
                          </div>
                          <button
                            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                            className="px-3.5 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-2"
                          >
                            {resolvedTheme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
                            <span>{resolvedTheme === "dark" ? "Dark Theme" : "Light Theme"}</span>
                          </button>
                        </div>

                        {/* Notifications */}
                        <div className="pt-4 flex items-center justify-between">
                          <div>
                            <span className="font-bold text-slate-900 dark:text-zinc-100 block">App Notifications</span>
                            <span className="text-slate-500 dark:text-zinc-400 text-[11px]">Receive preparation alerts and performance reminders.</span>
                          </div>
                          <button
                            onClick={() => setAppNotifications(!appNotifications)}
                            className={`px-3 py-1.5 rounded-full font-bold text-[11px] transition-all cursor-pointer ${
                              appNotifications ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30" : "bg-slate-200 dark:bg-zinc-800 text-slate-500"
                            }`}
                          >
                            {appNotifications ? "Enabled" : "Disabled"}
                          </button>
                        </div>

                        {/* Sound & Speech Effects */}
                        <div className="pt-4 flex items-center justify-between">
                          <div>
                            <span className="font-bold text-slate-900 dark:text-zinc-100 block">Audio & Voice Effects</span>
                            <span className="text-slate-500 dark:text-zinc-400 text-[11px]">Enable synthesized speech and audio feedback in mock interviews.</span>
                          </div>
                          <button
                            onClick={() => setSoundEffects(!soundEffects)}
                            className={`px-3 py-1.5 rounded-full font-bold text-[11px] transition-all cursor-pointer ${
                              soundEffects ? "bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30" : "bg-slate-200 dark:bg-zinc-800 text-slate-500"
                            }`}
                          >
                            {soundEffects ? "Active" : "Muted"}
                          </button>
                        </div>

                        {/* Language */}
                        <div className="pt-4 flex items-center justify-between">
                          <div>
                            <span className="font-bold text-slate-900 dark:text-zinc-100 block">Interface Language</span>
                            <span className="text-slate-500 dark:text-zinc-400 text-[11px]">Interface labels and supported coaching language preference.</span>
                          </div>
                          <select
                            value={appLanguage}
                            onChange={(e) => setAppLanguage(e.target.value)}
                            className="bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-800 dark:text-zinc-200"
                          >
                            <option value="English (US)">English (US)</option>
                            <option value="English (UK)">English (UK)</option>
                            <option value="Spanish">Spanish</option>
                            <option value="Hindi">Hindi</option>
                            <option value="Kannada">Kannada</option>
                            <option value="Tamil">Tamil</option>
                            <option value="Telugu">Telugu</option>
                          </select>
                        </div>

                        {/* Clear Cache & Session Data */}
                        <div className="pt-4 flex items-center justify-between">
                          <div>
                            <span className="font-bold text-slate-900 dark:text-zinc-100 block">Reset Candidate Data / Memory</span>
                            <span className="text-slate-500 dark:text-zinc-400 text-[11px]">Permanently clear interviews, coding, communication, scores, learning progress and persistent memory.</span>
                          </div>
                          <button
                            onClick={handleResetAppData}
                            className="px-3.5 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Reset Candidate Data</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </ErrorBoundary>
            </motion.div>
          </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Always accessible fixed floating AI App Assistant */}
      <AppSidebarChatbot
        currentTab={activeTab}
        atsScore={activeResumeAnalysis?.atsScore}
        resumeFileName={resumeFileName}
      />
    </div>
  );
}

export default StudentDashboard;


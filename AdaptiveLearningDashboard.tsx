/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  BookOpen,
  Award,
  Clock,
  TrendingUp,
  Cpu,
  CheckCircle2,
  Lock,
  Layers,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  Zap,
  Target,
  FileText,
  MessageSquare,
  RotateCw,
  AlertCircle,
  Trophy,
  Activity,
  Flame,
  UserCheck,
  Bell,
  Calendar,
  ThumbsUp,
  Sliders,
  ChevronDown,
  BookMarked,
  Hourglass,
  Users,
  Compass
} from "lucide-react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar
} from "recharts";
import { api } from "../../services/api";

interface ProfileType {
  fullName: string;
  university: string;
  graduationYear: string;
  targetRoles: string[];
  skills: string[];
  cgpa?: number | string;
  backlogs?: number | string;
  branch?: string;
}

interface AdaptiveLearningDashboardProps {
  profile: ProfileType;
  onChangeTab?: (tab: string) => void;
}

export function AdaptiveLearningDashboard({
  profile,
  onChangeTab
}: AdaptiveLearningDashboardProps) {
  // State variables for adaptive parameters
  const [performanceLevel, setPerformanceLevel] = useState<"excellent" | "struggling">("excellent");
  const [availableHours, setAvailableHours] = useState<number>(4);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [journeyData, setJourneyData] = useState<any>(null);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [xpBonus, setXpBonus] = useState(0);
  const [activeRoadmapTab, setActiveRoadmapTab] = useState<"90day" | "timetable">("90day");
  const [customNotifications, setCustomNotifications] = useState<any[]>([]);
  const [dismissedNotifications, setDismissedNotifications] = useState<string[]>([]);

  // Weekly review and monthly review modals
  const [showWeeklyReview, setShowWeeklyReview] = useState(false);
  const [showMonthlyReview, setShowMonthlyReview] = useState(false);

  // Fetch adaptive journey details from FastAPI backend
  const fetchAdaptiveJourney = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const payloadProfile = {
        ...profile,
        targetRoles: profile.targetRoles || ["Software Engineer"],
        skills: profile.skills || ["React", "Python", "Data Structures"]
      };

      const res = await api.post("/learning/adaptive-journey", {
        profile: payloadProfile,
        performance_level: performanceLevel,
        available_hours: availableHours
      });

      if (res.data?.status === "success" && res.data?.data) {
        setJourneyData(res.data.data);
        setCustomNotifications(res.data.data.smart_notifications || []);
      } else {
        throw new Error("Invalid adaptive learning payload structure.");
      }
    } catch (err: any) {
      console.error("[ADAPTIVE_LEARNING_DASHBOARD] Fetch failed:", err);
      setError(err?.message || "Failed to compile AI Adaptive Journey logs.");
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch journey whenever parameters change
  useEffect(() => {
    fetchAdaptiveJourney();
  }, [performanceLevel, availableHours]);

  // Handle checking/unchecking a daily task and grant XP
  const toggleTask = (taskTitle: string, taskXp: number) => {
    if (completedTasks.includes(taskTitle)) {
      setCompletedTasks(completedTasks.filter((t) => t !== taskTitle));
      setXpBonus((prev) => Math.max(0, prev - taskXp));
    } else {
      setCompletedTasks([...completedTasks, taskTitle]);
      setXpBonus((prev) => prev + taskXp);
    }
  };

  // Dismiss a notification
  const dismissNotification = (id: string) => {
    setDismissedNotifications([...dismissedNotifications, id]);
  };

  if (loading && !journeyData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-3xl p-8 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center animate-spin">
          <RotateCw className="w-6 h-6" />
        </div>
        <div className="text-center">
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Recomputing AI Learning Journey...</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm">
            Evaluating performance variables, calibrating target difficulty levels, and loading custom Study Planner rules.
          </p>
        </div>
      </div>
    );
  }

  if (error && !journeyData) {
    return (
      <div className="bg-red-500/5 border border-red-500/10 rounded-3xl p-8 text-center max-w-lg mx-auto space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <div>
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Adaptive Pipeline Disrupted</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            {error}
          </p>
        </div>
        <button
          onClick={fetchAdaptiveJourney}
          className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 text-xs font-bold rounded-xl transition-all cursor-pointer"
        >
          Retry Calibration
        </button>
      </div>
    );
  }

  // Calculate adjusted levels and XP based on real task accomplishments!
  const baseLvlInfo = journeyData.level_info;
  const totalXp = baseLvlInfo.current_xp + xpBonus;
  const levelsEarned = Math.floor(totalXp / baseLvlInfo.next_level_xp);
  const currentLvlAdjusted = baseLvlInfo.current_level + levelsEarned;
  const currentXpAdjusted = totalXp % baseLvlInfo.next_level_xp;

  // Custom visual components for achievements icons
  const getAchievementIcon = (slug: string) => {
    switch (slug) {
      case "code": return <Cpu className="w-4 h-4 text-blue-500" />;
      case "zap": return <Zap className="w-4 h-4 text-amber-500" />;
      case "award": return <Award className="w-4 h-4 text-indigo-500" />;
      default: return <Trophy className="w-4 h-4 text-emerald-500" />;
    }
  };

  // Safe notification filters
  const visibleNotifications = customNotifications.filter(
    (n) => !dismissedNotifications.includes(n.id)
  );

  return (
    <div className="space-y-8 pb-16">
      
      {/* 1. Header & Quick Adaptive Calibration Board */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-emerald-550/10 text-emerald-550 text-[10px] font-bold tracking-wider rounded-md uppercase font-mono flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Adaptive Engine v1.1
            </span>
            {loading && (
              <span className="flex items-center gap-1 text-[10px] text-zinc-400 font-mono">
                <RotateCw className="w-3 h-3 animate-spin text-emerald-550" /> Adapting...
              </span>
            )}
          </div>
          <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            Adaptive AI Learning & Task Workspace
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xl">
            A self-learning environment calibrating task complexities based on daily review logs, grammar metrics, and coding assessment stats.
          </p>
        </div>

        {/* Dynamic Controls representing the requested ADAPTIVE AI parameters */}
        <div className="flex flex-wrap items-center gap-3 bg-zinc-50 dark:bg-zinc-950 p-2 border border-zinc-200 dark:border-zinc-850 rounded-2xl">
          {/* Performance Level Switcher */}
          <div className="flex flex-col gap-1">
            <span className="text-[9px] text-zinc-400 font-bold uppercase font-mono tracking-wider ml-1">AI Difficulty Tuning</span>
            <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 p-1 border border-zinc-200 dark:border-zinc-800 rounded-xl">
              <button
                onClick={() => setPerformanceLevel("excellent")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${performanceLevel === "excellent" ? "bg-indigo-550 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"}`}
              >
                <TrendingUp className="w-3 h-3" /> High-Flyer Mode
              </button>
              <button
                onClick={() => setPerformanceLevel("struggling")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${performanceLevel === "struggling" ? "bg-amber-550 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"}`}
              >
                <Activity className="w-3 h-3" /> Foundation Assist
              </button>
            </div>
          </div>

          {/* Study Hours selection */}
          <div className="flex flex-col gap-1">
            <span className="text-[9px] text-zinc-400 font-bold uppercase font-mono tracking-wider ml-1">Daily Available Hours</span>
            <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-900 px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-xl">
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              <select
                value={availableHours}
                onChange={(e) => setAvailableHours(parseInt(e.target.value))}
                className="bg-transparent text-xs font-black text-zinc-800 dark:text-zinc-200 border-none outline-none focus:ring-0 p-0 pr-6"
              >
                {[2, 3, 4, 5, 6, 8, 10].map((h) => (
                  <option key={h} value={h} className="dark:bg-zinc-900">{h} Hours / Day</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top Grid: Gamification Headliner, Smart Notifications & persistent AI Coach */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Module A: Live Gamification Engine Progress */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-3xl p-6 flex flex-col justify-between space-y-4 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-550/5 rounded-full blur-2xl" />
          
          <div className="w-full flex items-center justify-between">
            <div>
              <span className="text-[10px] text-zinc-400 font-bold uppercase font-mono tracking-wider block">Student Rank Shelf</span>
              <h3 className="text-sm font-black text-zinc-850 dark:text-zinc-150 mt-0.5">{baseLvlInfo.rank_title}</h3>
            </div>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-550 flex items-center justify-center font-bold">
              <Trophy className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2 py-1">
            <span className="text-3xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">Level {currentLvlAdjusted}</span>
            <span className="text-xs text-zinc-400 font-mono">({totalXp} Total XP)</span>
          </div>

          {/* XP Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-550">Level progress</span>
              <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">{currentXpAdjusted} / {baseLvlInfo.next_level_xp} XP</span>
            </div>
            <div className="w-full h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden p-0.5 border border-zinc-200/50 dark:border-zinc-800">
              <div
                className="h-full bg-emerald-550 rounded-full transition-all duration-500"
                style={{ width: `${(currentXpAdjusted / baseLvlInfo.next_level_xp) * 100}%` }}
              />
            </div>
          </div>

          {/* Streak details and Quick Achievements Summary */}
          <div className="pt-3.5 border-t border-zinc-100 dark:border-zinc-850 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <Flame className="w-4 h-4 text-orange-550 animate-bounce" />
              <span className="font-black text-orange-600 dark:text-orange-400">7-Day Streak Active</span>
            </div>
            <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-mono font-bold px-2 py-0.5 rounded">
              {completedTasks.length} / 10 Tasks Complete
            </span>
          </div>
        </div>

        {/* Module B: Persistent AI Coach Panel (Tracks recommendations & Milestones) */}
        <div className="bg-zinc-900 text-zinc-100 rounded-3xl p-6 flex flex-col justify-between space-y-4 shadow-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/15 transition-colors" />
          
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-ping" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-300">Persistent AI Coach</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-zinc-800 text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>

          {/* AI Advisor speech bubbles */}
          <div className="space-y-3">
            <p className="text-xs text-zinc-300 leading-relaxed italic border-l-2 border-indigo-500 pl-3.5">
              "{journeyData.ai_coach_insights.motivation_quote}"
            </p>
            <div className="bg-zinc-950/40 p-3 rounded-2xl border border-zinc-800 space-y-1">
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-indigo-400 block">AI Next Best Action</span>
              <p className="text-xs font-semibold text-white leading-normal">
                {journeyData.ai_coach_insights.next_best_action}
              </p>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between text-[11px] text-zinc-400">
            <span className="truncate max-w-[200px]">{journeyData.ai_coach_insights.milestone_celebration}</span>
            <span className="shrink-0 font-bold text-indigo-400 flex items-center gap-0.5 cursor-pointer hover:text-indigo-300">
              Details <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Module C: Smart Notification Center & Review triggers */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-3xl p-6 flex flex-col justify-between space-y-4 shadow-sm relative">
          <div className="w-full flex items-center justify-between">
            <div>
              <span className="text-[10px] text-zinc-400 font-bold uppercase font-mono tracking-wider block">Reminders Hub</span>
              <h3 className="text-sm font-black text-zinc-850 dark:text-zinc-150 mt-0.5">Smart Event Alerts</h3>
            </div>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-550 flex items-center justify-center relative">
              <Bell className="w-4 h-4" />
              {visibleNotifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-zinc-900" />
              )}
            </div>
          </div>

          {/* Live Notification Stack */}
          <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
            <AnimatePresence initial={false}>
              {visibleNotifications.length === 0 ? (
                <div className="text-center py-4 text-zinc-400 text-xs">
                  <CheckCircle2 className="w-8 h-8 text-emerald-550 mx-auto opacity-40 mb-1" />
                  All caught up! No critical alerts.
                </div>
              ) : (
                visibleNotifications.map((n) => (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    className={`p-2.5 rounded-xl border text-[11px] flex items-start gap-2 relative group ${n.urgent ? "bg-red-500/5 border-red-500/10 text-red-700 dark:text-red-400" : "bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-850 text-zinc-600 dark:text-zinc-400"}`}
                  >
                    <span className="mt-0.5">●</span>
                    <span className="leading-tight pr-4">{n.message}</span>
                    <button
                      onClick={() => dismissNotification(n.id)}
                      className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400 hover:text-zinc-600 text-xs cursor-pointer"
                    >
                      ×
                    </button>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          {/* Weekly / Monthly reviews trigger buttons */}
          <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-zinc-100 dark:border-zinc-850">
            <button
              onClick={() => setShowWeeklyReview(true)}
              className="py-2 bg-zinc-900 hover:bg-zinc-850 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 text-[11px] font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
            >
              Weekly Review
            </button>
            <button
              onClick={() => setShowMonthlyReview(true)}
              className="py-2 bg-indigo-550 hover:bg-indigo-600 text-white text-[11px] font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
            >
              Monthly Report
            </button>
          </div>
        </div>

      </div>

      {/* 3. Daily Task Center: Grid of 10 Required Categories with Interactive Checkboxes */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-3xl p-6 shadow-sm space-y-6">
        <div>
          <h3 className="text-base font-black text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <BookMarked className="w-5 h-5 text-indigo-550" />
            AI Study Planner & Daily Tasks Center
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Calibrated daily requirements to optimize your ATS Resume, communication parameters, and code readiness coefficients.
          </p>
        </div>

        {/* 10 Required Category Grid items */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
          {journeyData.daily_tasks.map((item: any, i: number) => {
            const isCompleted = completedTasks.includes(item.task);
            return (
              <div
                key={i}
                onClick={() => toggleTask(item.task, item.xp)}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-4 cursor-pointer hover:shadow-sm ${isCompleted ? "bg-emerald-550/5 border-emerald-550/20 text-zinc-500" : "bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-850 text-zinc-850 dark:text-zinc-200 hover:border-zinc-350"}`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold tracking-wide">
                    <span className="text-zinc-400 dark:text-zinc-500 uppercase">{item.category}</span>
                    <span className={`px-1.5 py-0.2 rounded ${item.difficulty === "Hard" ? "bg-red-500/10 text-red-600" : item.difficulty === "Medium" ? "bg-amber-500/10 text-amber-600" : "bg-blue-500/10 text-blue-600"}`}>
                      {item.difficulty}
                    </span>
                  </div>
                  <p className={`text-xs font-semibold leading-normal ${isCompleted ? "line-through text-zinc-400" : ""}`}>
                    {item.task}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-150/50 dark:border-zinc-850/50">
                  <span className="text-[10px] font-mono font-bold text-emerald-550">+{item.xp} XP</span>
                  <div className="flex items-center gap-1.5">
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-550 shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-md border border-zinc-350 shrink-0" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Strategic Roadmaps and Timetables Panel */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
        
        {/* Left Col: Roadmap view (col span 3) */}
        <div className="xl:col-span-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                <Hourglass className="w-4 h-4 text-indigo-550" />
                90-Day Placement Prep Roadmap
              </h3>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Dynamic study phases automatically adapting based on your current readiness achievements.
              </p>
            </div>

            <div className="flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-950 p-1 border border-zinc-200 dark:border-zinc-850 rounded-2xl">
              <button
                onClick={() => setActiveRoadmapTab("90day")}
                className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${activeRoadmapTab === "90day" ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950" : "text-zinc-500"}`}
              >
                90-Day Milestones
              </button>
              <button
                onClick={() => setActiveRoadmapTab("timetable")}
                className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${activeRoadmapTab === "timetable" ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950" : "text-zinc-500"}`}
              >
                Timetable Breakdown
              </button>
            </div>
          </div>

          <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-2xl">
            {activeRoadmapTab === "90day" ? (
              <div className="space-y-6 relative border-l border-zinc-200 dark:border-zinc-800 pl-6 ml-3">
                {journeyData["90_day_roadmap"].map((item: any, idx: number) => (
                  <div key={idx} className="relative space-y-1.5">
                    <div className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-indigo-550 border-2 border-white dark:border-zinc-950" />
                    <span className="text-[10px] font-mono font-bold text-indigo-550 uppercase tracking-wider block">
                      {item.phase}
                    </span>
                    <h4 className="text-xs font-black text-zinc-800 dark:text-zinc-200">{item.focus}</h4>
                    <p className="text-[11px] text-zinc-400 flex items-center gap-1">
                      <Target className="w-3.5 h-3.5 text-emerald-550 shrink-0" /> <span className="font-semibold text-zinc-650 dark:text-zinc-400">Phase Goal:</span> {item.milestone}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-550 text-[10px] font-mono font-bold">Timetable Integration</span>
                  <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{journeyData.study_planner.timetable_integration}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {journeyData.study_planner.suggested_hours_breakdown.map((act: any, idx: number) => (
                    <div key={idx} className="bg-white dark:bg-zinc-900 p-3 border border-zinc-200 dark:border-zinc-800 rounded-xl flex items-center justify-between">
                      <span className="text-xs font-semibold text-zinc-650 dark:text-zinc-400">{act.activity}</span>
                      <span className="text-xs font-mono font-bold text-indigo-550">{act.minutes} Minutes</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Achievements shelves and Peer Leaderboard (col span 2) */}
        <div className="xl:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-3xl p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-550" />
              Leaderboard & Rankings
            </h3>
            <p className="text-[10px] text-zinc-400 mt-0.5">
              Compare weekly XP gains against top-tier system performers.
            </p>
          </div>

          <div className="space-y-2.5">
            {journeyData.leaderboard.map((u: any, i: number) => (
              <div
                key={i}
                className={`p-3 rounded-2xl border flex items-center justify-between text-xs transition-colors ${u.is_user ? "bg-indigo-550/5 border-indigo-550/20 text-zinc-850 font-bold" : "bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-850 text-zinc-600"}`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-5 h-5 rounded-md flex items-center justify-center font-mono font-bold ${u.rank === 1 ? "bg-amber-500/10 text-amber-600" : u.rank === 2 ? "bg-slate-400/10 text-slate-500" : "bg-zinc-200 dark:bg-zinc-800 text-zinc-500"}`}>
                    #{u.rank}
                  </span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">{u.name}</span>
                </div>
                <span className="font-mono font-bold text-indigo-550">{u.xp} XP</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 5. Progress Analytics Section (High-Fidelity Graphs) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Graph 1: Skill Growth Radar representation */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-3xl p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-550" />
              Skill Coefficient Mapping
            </h3>
            <p className="text-[10px] text-zinc-400 mt-0.5">
              Live tracking values covering core algorithms, speech confidence, and grammar.
            </p>
          </div>

          <div className="w-full h-80 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={journeyData.analytics.skill_growth}>
                <PolarGrid stroke="#e4e4e7" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#71717a', fontSize: 10, fontWeight: 600 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#a1a1aa', fontSize: 9 }} />
                <Radar
                  name="Current Skill"
                  dataKey="score"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.25}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graph 2: Study Consistency calendar grid & placement readiness trend */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-3xl p-6 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-550" />
                Learning Frequency Heatmap
              </h3>
              <p className="text-[10px] text-zinc-400 mt-0.5">
                Simulated daily interactive attendance frequency logs over the past week.
              </p>
            </div>

            {/* Simulated Calendar Grid blocks */}
            <div className="flex flex-wrap items-center gap-2.5 p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-2xl justify-center">
              {journeyData.analytics.learning_heatmap.map((d: any, idx: number) => (
                <div key={idx} className="flex flex-col items-center gap-1 text-center">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${d.value >= 7 ? "bg-emerald-550 text-white" : d.value >= 4 ? "bg-emerald-500/40 text-emerald-950" : d.value >= 1 ? "bg-emerald-500/10 text-emerald-600" : "bg-zinc-200 dark:bg-zinc-800 text-zinc-400"}`}
                  >
                    {d.value}
                  </div>
                  <span className="text-[8px] font-mono font-bold text-zinc-400 uppercase">{d.date.slice(-2)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-850">
            <div>
              <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-50">Placement Readiness Trend</h3>
              <p className="text-[10px] text-zinc-400 mt-0.5">Projected selection readiness growth based on weekly evaluations.</p>
            </div>

            <div className="w-full h-32">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={journeyData.analytics.placement_readiness_trend}>
                  <defs>
                    <linearGradient id="colorReadiness" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="week" tick={{ fill: '#a1a1aa', fontSize: 10 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="score" stroke="#6366f1" fillOpacity={1} fill="url(#colorReadiness)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>

      {/* 6. Alerts & Achievements Shelf */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Achievements Shelves */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-3xl p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-550" />
              Achievements & Custom Badges
            </h3>
            <p className="text-[10px] text-zinc-400 mt-0.5">
              Unlocking extra rewards by hitting daily milestones and completing difficult speech challenges.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {journeyData.achievements.map((item: any, idx: number) => (
              <div
                key={idx}
                className={`p-3 rounded-2xl border flex items-center gap-3.5 text-xs transition-all ${item.unlocked ? "bg-white dark:bg-zinc-900 border-zinc-250 dark:border-zinc-800" : "bg-zinc-50/50 dark:bg-zinc-950/20 border-zinc-100 dark:border-zinc-850 opacity-60"}`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${item.unlocked ? "bg-emerald-500/10 text-emerald-550" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"}`}>
                  {item.unlocked ? getAchievementIcon(item.badge_icon) : <Lock className="w-4 h-4" />}
                </div>
                <div className="space-y-0.5 truncate">
                  <h4 className="font-bold text-zinc-800 dark:text-zinc-200 truncate">{item.title}</h4>
                  <p className="text-[10px] text-zinc-400 truncate">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Alerts Banner Panel */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-3xl p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-550" />
              Skill Diagnostic & Weakness Alerts
            </h3>
            <p className="text-[10px] text-zinc-400 mt-0.5">
              Real-time warning blocks generated based on current ATS scores and code logs.
            </p>
          </div>

          <div className="space-y-2">
            {journeyData.analytics.weak_skill_alerts.map((al: string, idx: number) => (
              <div key={idx} className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-2xl text-[11px] text-amber-700 dark:text-amber-400 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span className="leading-tight">{al}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 7. Weekly Review Modal (Apple Human Interface modal style) */}
      <AnimatePresence>
        {showWeeklyReview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-850 rounded-3xl max-w-xl w-full p-6 space-y-6 relative shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-indigo-500/10 text-indigo-550 rounded-xl">
                    <TrendingUp className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-base font-black text-zinc-900 dark:text-zinc-50">AI Weekly Performance Review</h3>
                    <p className="text-[11px] text-zinc-400">Weekending Saturday, July 18, 2026</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowWeeklyReview(false)}
                  className="w-8 h-8 rounded-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 flex items-center justify-center hover:bg-zinc-100 font-bold text-zinc-500 cursor-pointer"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4 text-xs text-zinc-650 dark:text-zinc-400">
                <p className="leading-relaxed">
                  Your study consistency is at <strong className="text-indigo-550 dark:text-indigo-400">{journeyData.analytics.study_consistency_percent}%</strong>. This week, your velocity of improvement rose by <strong className="text-emerald-550">+{journeyData.analytics.improvement_velocity_percent}%</strong>, specifically triggered by your outstanding scores in current Coding Challenges.
                </p>

                <div className="bg-zinc-50 dark:bg-zinc-950 p-4 border border-zinc-200 dark:border-zinc-850 rounded-2xl space-y-2.5">
                  <span className="text-[9px] font-mono font-bold uppercase text-zinc-400 tracking-wider">Weekly Milestones Reached</span>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-550 shrink-0" />
                      <span>Completed {completedTasks.length} daily task exercises Tailored for {profile.targetRoles?.[0] || "Software Engineer"}.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-550 shrink-0" />
                      <span>Earned an aggregate of <strong className="text-zinc-850 dark:text-zinc-200">{xpBonus} XP</strong> from verified active learning goals.</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  onClick={() => setShowWeeklyReview(false)}
                  className="px-4 py-2 bg-zinc-900 text-white text-xs font-bold rounded-xl hover:bg-zinc-850 transition-all cursor-pointer"
                >
                  Acknowledge and Continue
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 8. Monthly Review Modal */}
      <AnimatePresence>
        {showMonthlyReview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-850 rounded-3xl max-w-xl w-full p-6 space-y-6 relative shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-emerald-500/10 text-emerald-550 rounded-xl">
                    <Award className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-base font-black text-zinc-900 dark:text-zinc-50">AI Monthly Diagnostic Report</h3>
                    <p className="text-[11px] text-zinc-400">Consolidated analytics from Interview Cracker AI</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowMonthlyReview(false)}
                  className="w-8 h-8 rounded-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 flex items-center justify-center hover:bg-zinc-100 font-bold text-zinc-500 cursor-pointer"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4 text-xs text-zinc-650 dark:text-zinc-400">
                <p className="leading-relaxed">
                  Excellent development logs identified for <strong className="text-zinc-800 dark:text-zinc-200">{profile.fullName}</strong>. Your placement readiness coefficient is pacing towards high-tier eligibility ranks.
                </p>

                <div className="grid grid-cols-2 gap-3 py-1">
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                    <span className="text-[9px] font-mono font-bold uppercase text-zinc-400">Average Attendance Rate</span>
                    <span className="text-lg font-black text-indigo-550 block mt-0.5">92% Consistency</span>
                  </div>
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                    <span className="text-[9px] font-mono font-bold uppercase text-zinc-400">Active Task Success Rate</span>
                    <span className="text-lg font-black text-emerald-550 block mt-0.5">{journeyData.analytics.task_completion_rate}% Completed</span>
                  </div>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-950 p-4 border border-zinc-200 dark:border-zinc-850 rounded-2xl space-y-1">
                  <span className="text-[9px] font-mono font-bold uppercase text-zinc-400 tracking-wider">Expert Recommendation</span>
                  <p className="text-[11px] text-zinc-550 leading-relaxed">
                    Continue maintaining your streak. Your algorithmic logic fits premium hiring criteria, but continue reinforcing Database and horizontal scaling questions to lock down highest package options.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  onClick={() => setShowMonthlyReview(false)}
                  className="px-4 py-2 bg-indigo-550 text-white text-xs font-bold rounded-xl hover:bg-indigo-600 transition-all cursor-pointer"
                >
                  Download Report PDF
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from "react";
import {
  Cpu,
  Sparkles,
  Zap,
  Target,
  Briefcase,
  TrendingUp,
  Award,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  HelpCircle,
  MessageSquare,
  RefreshCw,
  Sliders,
  Send,
  AlertTriangle,
  ChevronRight,
  User,
  ShieldAlert,
  ChevronLeft,
  Volume2,
  Camera,
  PlayCircle,
  Book,
  Compass,
  DollarSign
} from "lucide-react";
import { api } from "../../services/api";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";

interface AICareerCoachProps {
  profile: {
    fullName: string;
    university: string;
    graduationYear: string;
    targetRoles: string[];
    skills: string[];
  };
  resumeFileName: string;
}

export function AICareerCoach({ profile, resumeFileName }: AICareerCoachProps) {
  const [activeTab, setActiveTab] = useState<"dashboard" | "roadmap" | "company_prep" | "mentor_chat">("dashboard");
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  // Goal Editor Modal/Form values
  const [isEditingGoals, setIsEditingGoals] = useState<boolean>(false);
  const [dreamCompany, setDreamCompany] = useState<string>("Google");
  const [dreamRole, setDreamRole] = useState<string>("Software Engineer");
  const [targetPackage, setTargetPackage] = useState<string>("24");
  const [targetDate, setTargetDate] = useState<string>("2026-12-31");
  const [studyHours, setStudyHours] = useState<string>("15");

  // Chat Mentor variables
  const [chatInput, setChatInput] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "mentor"; text: string }>>([
    {
      sender: "mentor",
      text: `Hello ${profile.fullName}! I am your AI Career Coach. I've analyzed your skills and resume matches. Let's tackle your prep strategy for elite roles. Ask me any specific interview or preparation questions!`
    }
  ]);
  const [chatLoading, setChatLoading] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Active Company Selection
  const [selectedCompany, setSelectedCompany] = useState<string>("Google");
  // Active Role Prep Plan Selection
  const [selectedRolePlan, setSelectedRolePlan] = useState<string>("Software Engineer");

  // Notifications
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    fetchPlan();
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, chatLoading]);

  const fetchPlan = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await api.get("/v1/career-coach/plan");
      if (res.data?.status === "success" && res.data.plan) {
        const p = res.data.plan;
        setPlan(p);
        // Pre-populate input states
        if (p.goals) {
          setDreamCompany(p.goals.dream_company || "Google");
          setDreamRole(p.goals.dream_role || "Software Engineer");
          setTargetPackage(p.goals.target_package || "24");
          setTargetDate(p.goals.target_placement_date || "2026-12-31");
          setStudyHours(p.goals.weekly_study_hours || "15");
        }
      }
    } catch (err: any) {
      console.error("Failed to load plan:", err);
      setErrorMsg(err.message || "Failed to contact placement database.");
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/v1/career-coach/notifications");
      if (res.data?.status === "success" && res.data.notifications) {
        setNotifications(res.data.notifications);
      }
    } catch (err) {
      console.error("Failed to fetch coach reminders:", err);
    }
  };

  const handleUpdateGoals = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await api.post("/v1/career-coach/goals", {
        dream_company: dreamCompany,
        dream_role: dreamRole,
        target_package: targetPackage,
        target_placement_date: targetDate,
        weekly_study_hours: studyHours
      });
      if (res.data?.status === "success" && res.data.plan) {
        setPlan(res.data.plan);
        setIsEditingGoals(false);
        // Auto-retrigger AI compilation when goals adapt so predictions and roadmap align perfectly!
        await handleRecalculateAIPlan();
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update placement goals.");
      setLoading(false);
    }
  };

  const handleRecalculateAIPlan = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await api.post("/v1/career-coach/generate-plan");
      if (res.data?.status === "success" && res.data.plan) {
        setPlan(res.data.plan);
        fetchNotifications();
      }
    } catch (err: any) {
      setErrorMsg(err.message || "AI pipeline failed to compile modern roadmap.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (taskId: string, currentCompleted: boolean) => {
    try {
      const res = await api.post("/v1/career-coach/toggle-task", {
        task_id: taskId,
        completed: !currentCompleted
      });
      if (res.data?.status === "success" && res.data.plan) {
        setPlan(res.data.plan);
        fetchNotifications();
      }
    } catch (err: any) {
      console.error("Failed to check off planner task:", err);
    }
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userText = chatInput;
    setChatInput("");
    setChatMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setChatLoading(true);

    try {
      const res = await api.post("/v1/career-coach/chat", {
        message: userText
      });
      if (res.data?.status === "success" && res.data.reply) {
        setChatMessages((prev) => [...prev, { sender: "mentor", text: res.data.reply }]);
      }
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "mentor",
          text: "I had a minor hiccup compiling the career intelligence model response. But keep practicing! Every mock question cleared pushes your profile scores higher."
        }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // Supported target companies patterns dictionary
  const companiesList = [
    { name: "Google", difficulty: "Extreme", codingLevel: "Hard Algorithmic", focus: "Googleyness & Scales", pattern: "Online coding test -> 3 Tech & Design -> 1 Leadership round", timeline: "45 Days Prep" },
    { name: "Microsoft", difficulty: "Extreme", codingLevel: "Hard Trees & DP", focus: "Systems & Architecture", pattern: "CoderPad Test -> 3 Technical -> 1 AA round", timeline: "40 Days Prep" },
    { name: "Amazon", difficulty: "High", codingLevel: "Hard Arrays & Strings", focus: "Leadership Principles", pattern: "OA1 Debugging -> OA2 Coding -> 4 Virtual Rounds", timeline: "35 Days Prep" },
    { name: "Meta", difficulty: "Extreme", codingLevel: "Fast-Paced Mediums", focus: "Culture Fit & Scales", pattern: "1 Phone screen -> 2 Coding -> 1 Design -> 1 Behavior", timeline: "45 Days Prep" },
    { name: "Adobe", difficulty: "High", codingLevel: "Algorithmic & Math", focus: "Product Creativity", pattern: "OA -> 2 Tech Rounds -> 1 Director Round", timeline: "30 Days Prep" },
    { name: "NVIDIA", difficulty: "Extreme", codingLevel: "C++ & Low-Level Memory", focus: "Systems & Concurrency", pattern: "Online assessment -> 3 specialized tech panels", timeline: "50 Days Prep" },
    { name: "Oracle", difficulty: "High", codingLevel: "DB & Multi-threading", focus: "SQL & Query tunings", pattern: "Online code challenge -> 2 Tech -> 1 HR", timeline: "30 Days Prep" },
    { name: "TCS", difficulty: "Medium", codingLevel: "Easy to Medium", focus: "Aptitude & Baseline Core", pattern: "NQT National Test -> Technical Interview -> HR", timeline: "15 Days Prep" },
    { name: "Infosys", difficulty: "Medium", codingLevel: "Easy to Medium", focus: "Pseudocode & Soft skills", pattern: "Infosys Certification Exam -> Interview Board", timeline: "15 Days Prep" },
    { name: "Wipro", difficulty: "Medium", codingLevel: "Basic Programming", focus: "Communication & Basics", pattern: "Elite NLTH Assessment -> Tech Board -> HR", timeline: "15 Days Prep" },
    { name: "Accenture", difficulty: "Medium", codingLevel: "Easy Strings & Logic", focus: "Problem Solving & Comm", pattern: "Cognitive assessment -> Technical Panel -> HR", timeline: "20 Days Prep" },
    { name: "Capgemini", difficulty: "Medium", codingLevel: "Easy Arrays & Basic OOP", focus: "Analytical Capability", pattern: "Pseudo-code Assessment -> Coding -> Tech Interview", timeline: "15 Days Prep" },
    { name: "IBM", difficulty: "High", codingLevel: "Medium Algorithms", focus: "Cognitive & Database", pattern: "IPAT Cognitive -> 2 Tech interviews -> HR Panel", timeline: "25 Days Prep" },
    { name: "Cognizant", difficulty: "Medium", codingLevel: "Basic Algorithms", focus: "Soft skills & Basic CS", pattern: "AMCAT test -> Technical panel -> HR Board", timeline: "15 Days Prep" },
    { name: "Tech Mahindra", difficulty: "Medium", codingLevel: "Basic logic & SQL", focus: "Domain readiness", pattern: "Aptitude Round -> Technical evaluation -> HR", timeline: "15 Days Prep" },
    { name: "LTIMindtree", difficulty: "Medium", codingLevel: "Easy to Medium", focus: "OOP & Database Concepts", pattern: "Nvidia/Mercer test -> Tech Panel -> HR", timeline: "20 Days Prep" }
  ];

  // Target Roles preparation plans mapping
  const rolesList = [
    { name: "Software Engineer", coreSkills: ["Algorithms", "Data Structures", "System Design"], topics: ["HashMaps", "Graphs", "Scale Tuning"], time: "150 Hours" },
    { name: "Frontend Developer", coreSkills: ["HTML/CSS", "JavaScript", "React", "TypeScript"], topics: ["DOM", "Render Cycles", "State Management"], time: "100 Hours" },
    { name: "Backend Developer", coreSkills: ["Python", "FastAPI", "Express", "Databases", "SQL"], topics: ["REST APIs", "SQL Joins", "Caching & Redis"], time: "120 Hours" },
    { name: "Full Stack Developer", coreSkills: ["React", "Node.js", "Express", "PostgreSQL", "Docker"], topics: ["Auth", "E2E setups", "Deployments"], time: "160 Hours" },
    { name: "Python Developer", coreSkills: ["Python Core", "Django", "FastAPI", "Multithreading"], topics: ["Generators", "Decorators", "AsyncIO"], time: "90 Hours" },
    { name: "Java Developer", coreSkills: ["Java", "Spring Boot", "Hibernate", "Microservices"], topics: ["JVM Tuning", "Spring Security", "Multithreading"], time: "110 Hours" },
    { name: "AI Engineer", coreSkills: ["Python", "AI APIs", "LLMs", "Vector Databases"], topics: ["Prompting", "Retrieval-Augmented Gen", "Agents"], time: "130 Hours" },
    { name: "Machine Learning Engineer", coreSkills: ["Python", "PyTorch", "Pandas", "Scikit-Learn"], topics: ["Training pipelines", "Feature engineering"], time: "160 Hours" },
    { name: "Cloud Engineer", coreSkills: ["AWS/GCP", "Linux", "IAM", "VPC Networking"], topics: ["S3 Buckets", "EC2 scaling", "Cloud Storage"], time: "110 Hours" },
    { name: "DevOps Engineer", coreSkills: ["Docker", "Kubernetes", "CI/CD", "GitHub Actions"], topics: ["Pipelines", "Container orchestration"], time: "130 Hours" },
    { name: "Cybersecurity Engineer", coreSkills: ["Linux", "Networks", "Penetration", "OWASP"], topics: ["XSS/SQLi Remediation", "CORS configs"], time: "140 Hours" },
    { name: "Data Analyst", coreSkills: ["SQL", "Python", "PowerBI/Tableau", "Excel"], topics: ["Aggregations", "Data cleaning", "Reports"], time: "80 Hours" },
    { name: "Data Engineer", coreSkills: ["Spark", "SQL", "Airflow", "ETL Pipelines"], topics: ["Warehouse schemas", "Batch stream process"], time: "140 Hours" }
  ];

  // Format active plan Recharts Radial / Radar chart
  const getSkillsRadarData = () => {
    if (!plan?.ai_analysis) return [];
    const a = plan.ai_analysis;
    return [
      { subject: "Resume Quality", score: a.resume_quality_rating || 80 },
      { subject: "Coding Skills", score: a.coding_skills_rating || 70 },
      { subject: "Communication", score: a.communication_rating || 75 },
      { subject: "HR Behavioral", score: a.interview_skills_rating || 70 },
      { subject: "Camera Posture", score: a.confidence_rating || 78 },
      { subject: "Projects breadth", score: a.projects_rating || 75 }
    ];
  };

  // Recharts Progress Bar Data
  const getProgressChartData = () => {
    if (!plan?.progress_tracking) return [];
    return [
      { name: "Roadmaps Completed", percentage: plan.progress_tracking.roadmap_completion_rate || 0 },
      { name: "Daily Planner Tasks", percentage: plan.progress_tracking.daily_tasks_completion_rate || 0 },
      { name: "Soft Skills Growth", percentage: plan.progress_tracking.confidence_growth || 75 }
    ];
  };

  const activeCompanyData = companiesList.find((c) => c.name === selectedCompany) || companiesList[0];
  const activeRolePlanData = rolesList.find((r) => r.name === selectedRolePlan) || rolesList[0];

  return (
    <div className="space-y-8" id="career-coach-root">
      
      {/* HEADER BAR */}
      <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-500 text-[9px] font-mono rounded-md font-bold uppercase tracking-wider">
              PLACEMENT COMPASS
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-500" />
            <span>AI Career Coach & Placement Mentor</span>
          </h2>
          <p className="text-xs text-zinc-400 max-w-xl">
            A dynamic career advisory system that processes mock scores, resume parameters, postural telemetry, and custom study goals to formulate precision prep roadmaps.
          </p>
        </div>

        <button
          onClick={handleRecalculateAIPlan}
          disabled={loading}
          className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold rounded-2xl flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 select-none shadow-md shadow-indigo-500/10 shrink-0"
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          <span>Recalculate AI Goals & Roadmap</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-500/5 border border-red-500/10 text-red-500 text-xs rounded-2xl flex items-center gap-2">
          <ShieldAlert className="w-4 h-4" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* TABS NAVIGATION */}
      <div className="flex bg-slate-100 dark:bg-zinc-950 p-1.5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 gap-1 overflow-x-auto">
        {[
          { id: "dashboard", label: "Mentor Dashboard", icon: Compass },
          { id: "roadmap", label: "Daily Planner & Roadmap", icon: Calendar },
          { id: "company_prep", label: "Company & Role Prep", icon: Briefcase },
          { id: "mentor_chat", label: "AI Mentor Chat", icon: MessageSquare }
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer select-none whitespace-nowrap ${
                active
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-200/50 dark:hover:bg-zinc-900"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* RENDER ACTIVE TABS */}
      {loading && !plan ? (
        <div className="p-16 text-center space-y-4">
          <RefreshCw className="w-12 h-12 text-indigo-500 animate-spin mx-auto" />
          <div>
            <h4 className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Evaluating Placement Vectors...</h4>
            <p className="text-xs text-zinc-400 mt-1">
              AI is mapping candidate profiles against target company benchmarks.
            </p>
          </div>
        </div>
      ) : (
        plan && (
          <div className="space-y-8">
            
            {/* TAB 1: MENTOR DASHBOARD */}
            {activeTab === "dashboard" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* Left Column: Predictions & Goals */}
                <div className="md:col-span-1 space-y-6">
                  
                  {/* Current Active Goals Panel */}
                  <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-3xl space-y-4 relative overflow-hidden">
                    <span className="absolute top-3 right-3 text-[10px] font-mono font-bold px-2 py-0.5 bg-indigo-500/10 text-indigo-500 rounded-md">
                      TARGET METRICS
                    </span>
                    <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">
                      Placement Gearing Target
                    </h3>

                    {isEditingGoals ? (
                      <form onSubmit={handleUpdateGoals} className="space-y-3.5 pt-2">
                        <div className="space-y-1">
                          <label className="text-[10px] text-zinc-400 uppercase font-mono font-bold">Dream Company</label>
                          <input
                            type="text"
                            required
                            value={dreamCompany}
                            onChange={(e) => setDreamCompany(e.target.value)}
                            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 text-xs px-3.5 py-2 rounded-xl text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-zinc-400 uppercase font-mono font-bold">Dream Role</label>
                          <input
                            type="text"
                            required
                            value={dreamRole}
                            onChange={(e) => setDreamRole(e.target.value)}
                            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 text-xs px-3.5 py-2 rounded-xl text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-zinc-400 uppercase font-mono font-bold">Target Package (LPA)</label>
                          <input
                            type="number"
                            required
                            value={targetPackage}
                            onChange={(e) => setTargetPackage(e.target.value)}
                            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 text-xs px-3.5 py-2 rounded-xl text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-zinc-400 uppercase font-mono font-bold">Study Target Hours/Week</label>
                          <input
                            type="number"
                            required
                            value={studyHours}
                            onChange={(e) => setStudyHours(e.target.value)}
                            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 text-xs px-3.5 py-2 rounded-xl text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div className="flex gap-2 pt-2">
                          <button
                            type="submit"
                            className="flex-1 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold rounded-xl cursor-pointer"
                          >
                            Save & Adapt
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsEditingGoals(false)}
                            className="flex-1 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-xs font-semibold rounded-xl cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="space-y-4">
                        <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-900 grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-[9px] text-zinc-400 block font-mono">DREAM COMPANY</span>
                            <span className="text-sm font-black text-zinc-800 dark:text-zinc-100 mt-0.5 block">{plan.goals?.dream_company}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-zinc-400 block font-mono">DREAM ROLE</span>
                            <span className="text-sm font-black text-indigo-500 mt-0.5 block">{plan.goals?.dream_role}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-zinc-400 block font-mono">TARGET PACKAGE</span>
                            <span className="text-xs font-black text-zinc-800 dark:text-zinc-100 mt-0.5 block">{plan.goals?.target_package} LPA</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-zinc-400 block font-mono">STUDY HOURS/WK</span>
                            <span className="text-xs font-black text-zinc-800 dark:text-zinc-100 mt-0.5 block">{plan.goals?.weekly_study_hours} Hrs</span>
                          </div>
                        </div>

                        <button
                          onClick={() => setIsEditingGoals(true)}
                          className="w-full py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-700 dark:text-zinc-200 text-xs font-semibold rounded-xl cursor-pointer block text-center"
                        >
                          Modify Placement Goals
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Placement Prediction Gauge */}
                  <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-3xl space-y-4">
                    <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">
                      AI Placement Prediction
                    </h3>

                    <div className="space-y-4">
                      <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 rounded-2xl flex justify-between items-center">
                        <div>
                          <span className="text-[9px] text-zinc-400 block font-mono">CLEARING PROBABILITY</span>
                          <span className="text-xl font-black text-emerald-500 mt-0.5 block">
                            {plan.placement_prediction?.chance_of_clearing_interview || "75%"}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] text-zinc-400 block font-mono">OVERALL PLACEMENT</span>
                          <span className="text-xl font-black text-indigo-500 mt-0.5 block">
                            {plan.placement_prediction?.chance_of_placement || "78%"}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="text-[10px] text-zinc-400 uppercase font-mono font-bold block">PREPARATION RANGE TIMELINE</span>
                        <div className="flex items-center gap-1.5 text-xs text-zinc-700 dark:text-zinc-300">
                          <Clock className="w-4 h-4 text-indigo-500" />
                          <span>Needs approximately <b>{plan.placement_prediction?.expected_preparation_time || "21 Days"}</b> of deliberate practice.</span>
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-850">
                        <span className="text-[10px] text-indigo-500 uppercase font-mono font-bold block">AI ADVISOR ASSESSMENT</span>
                        <p className="text-xs text-zinc-400 leading-relaxed">
                          {plan.placement_prediction?.overall_readiness_summary}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Notification Center */}
                  {notifications.length > 0 && (
                    <div className="p-5 bg-indigo-500/5 border border-indigo-500/10 rounded-3xl space-y-3">
                      <div className="flex items-center gap-1.5 text-indigo-500">
                        <ShieldAlert className="w-4.5 h-4.5" />
                        <span className="text-xs font-black uppercase font-mono">COACHING NOTIFICATIONS</span>
                      </div>
                      {notifications.map((notif) => (
                        <div key={notif.id} className="space-y-1">
                          <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-100">{notif.title}</h4>
                          <p className="text-[11px] text-zinc-500 leading-relaxed">{notif.description}</p>
                        </div>
                      ))}
                    </div>
                  )}

                </div>

                {/* Right Column: AI Analysis ratings, dynamic motivation, progress graphs */}
                <div className="md:col-span-2 space-y-6">
                  
                  {/* Daily motivation and performance quote */}
                  <div className="p-6 bg-gradient-to-r from-indigo-500/10 to-purple-500/5 border border-indigo-500/10 rounded-3xl space-y-2 relative overflow-hidden">
                    <span className="absolute -right-4 -bottom-4 text-zinc-100/10 dark:text-zinc-800/10 pointer-events-none select-none font-sans font-black text-8xl">
                      GO
                    </span>
                    <div className="flex items-center gap-2 text-indigo-500">
                      <Sparkles className="w-5 h-5 animate-pulse" />
                      <span className="text-xs font-black uppercase tracking-wider font-mono">DAILY ROADMAP INSIGHT</span>
                    </div>
                    <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 leading-relaxed italic">
                      "{plan.motivation_system?.daily_motivation}"
                    </p>
                  </div>

                  {/* Achievements Badge showcase */}
                  <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-3xl space-y-4">
                    <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">
                      Student Placement Achievements
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {plan.motivation_system?.achievements?.map((ach: string, idx: number) => (
                        <div key={idx} className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-900 flex items-center gap-3.5 hover:scale-[1.02] transition-transform">
                          <div className="w-10 h-10 bg-indigo-500/10 text-indigo-500 rounded-xl flex items-center justify-center shrink-0">
                            <Award className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-xs font-black text-zinc-800 dark:text-zinc-100 block">{ach}</span>
                            <span className="text-[9px] text-emerald-500 font-mono font-bold mt-0.5 block">VERIFIED METRIC</span>
                          </div>
                        </div>
                      ))}
                      <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 flex items-center gap-3 opacity-60">
                        <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-900 text-zinc-400 rounded-xl flex items-center justify-center shrink-0">
                          <Zap className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-zinc-500 block">Next Milestone</span>
                          <span className="text-[9px] text-zinc-400 mt-0.5 block">filler reduction 1.5%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Competency Ratings Radar and Progress completion metrics side-by-side */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    
                    {/* Skills Radar */}
                    <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-3xl space-y-4">
                      <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">
                        Placement Profile Ratings
                      </h3>
                      <div className="h-64 w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={getSkillsRadarData()}>
                            <PolarGrid stroke="#e4e4e7" className="dark:stroke-zinc-800" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: "#a1a1aa", fontSize: 9, fontWeight: 500 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#a1a1aa", fontSize: 8 }} />
                            <Radar
                              name="Candidate Score"
                              dataKey="score"
                              stroke="#6366f1"
                              fill="#6366f1"
                              fillOpacity={0.15}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#18181b",
                                border: "1px solid #27272a",
                                borderRadius: "12px",
                                color: "#f4f4f5"
                              }}
                              itemStyle={{ color: "#6366f1", fontSize: 11 }}
                            />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Progress Ratios Chart */}
                    <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-3xl space-y-4 flex flex-col justify-between">
                      <div>
                        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">
                          Preparation Track Rates
                        </h3>
                        <p className="text-[10px] text-zinc-400 mt-1">
                          Completion ratios computed in real-time from active user checklist actions.
                        </p>
                      </div>

                      <div className="h-44 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={getProgressChartData()} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f4f4f5" className="dark:stroke-zinc-800" />
                            <XAxis type="number" domain={[0, 100]} tick={{ fill: "#a1a1aa", fontSize: 9 }} />
                            <YAxis dataKey="name" type="category" tick={{ fill: "#a1a1aa", fontSize: 9 }} width={110} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#18181b",
                                border: "1px solid #27272a",
                                borderRadius: "12px",
                                color: "#f4f4f5"
                              }}
                              itemStyle={{ color: "#6366f1", fontSize: 11 }}
                            />
                            <Bar dataKey="percentage" fill="#6366f1" radius={[0, 8, 8, 0]} barSize={16}>
                              {getProgressChartData().map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={index === 0 ? "#10b981" : index === 1 ? "#6366f1" : "#f59e0b"} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="p-3.5 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-900 flex justify-between text-xs">
                        <span className="text-zinc-400">Total Checklists Cleared:</span>
                        <span className="font-bold text-zinc-800 dark:text-zinc-200">
                          {plan.progress_tracking?.completed_tasks_count || 0} items
                        </span>
                      </div>
                    </div>

                  </div>

                </div>

              </div>
            )}

            {/* TAB 2: DAILY PLANNER & ROADMAP */}
            {activeTab === "roadmap" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* Left Column: Today's Daily Kanban Checklist */}
                <div className="md:col-span-1 space-y-6">
                  <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-3xl space-y-6">
                    <div>
                      <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-500 text-[9px] font-mono rounded-md font-bold uppercase tracking-wider">
                        KANBAN BOARD
                      </span>
                      <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 mt-1">
                        Today's Planner Tasks
                      </h3>
                      <p className="text-[10px] text-zinc-400 mt-1">
                        Remediation tasks matching weakness segments. Check them off to trigger matching score updates.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {plan.daily_planner?.tasks?.map((task: any) => (
                        <div
                          key={task.id}
                          onClick={() => handleToggleTask(task.id, task.completed)}
                          className={`p-4 rounded-2xl border text-xs flex items-start gap-3.5 transition-all cursor-pointer ${
                            task.completed
                              ? "bg-zinc-50 border-zinc-100 text-zinc-400 dark:bg-zinc-950 dark:border-zinc-900 line-through"
                              : "bg-white border-zinc-200 text-zinc-700 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300 hover:border-indigo-500/30"
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                            task.completed ? "bg-indigo-500 border-indigo-500 text-white" : "border-zinc-300 dark:border-zinc-700"
                          }`}>
                            {task.completed && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                          </div>
                          <div className="space-y-1">
                            <span className="px-1.5 py-0.5 bg-indigo-500/10 text-indigo-500 rounded-md text-[8px] font-mono font-bold uppercase tracking-wide">
                              {task.type}
                            </span>
                            <h4 className="font-bold block pt-1">{task.title}</h4>
                            <p className="text-[10px] text-zinc-400 leading-relaxed">{task.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Columns: Multi-phase Interactive Timeline Roadmap & Recommended items */}
                <div className="md:col-span-2 space-y-6">
                  
                  {/* Interactive Timeline Roadmap */}
                  <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-3xl space-y-6">
                    <div>
                      <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                        Interactive Prep Roadmap Timeline
                      </h3>
                      <p className="text-[11px] text-zinc-500">
                        Multi-phase systemic schedule to scale skills to Google & elite technical levels.
                      </p>
                    </div>

                    <div className="space-y-6 relative border-l border-zinc-150 dark:border-zinc-800 pl-6 ml-2">
                      {["daily", "weekly", "monthly", "quarterly"].map((period) => {
                        const items = plan.learning_roadmap?.[period] || [];
                        return (
                          <div key={period} className="space-y-3 relative">
                            {/* Dot indicator */}
                            <div className="absolute -left-[31px] top-1.5 w-4.5 h-4.5 rounded-full border-2 border-indigo-500 bg-white dark:bg-zinc-900 flex items-center justify-center">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                            </div>

                            <span className="text-xs font-black uppercase text-indigo-500 tracking-wider font-mono block">
                              {period} Roadmap Segment
                            </span>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {items.map((item: any) => (
                                <div
                                  key={item.id}
                                  onClick={() => handleToggleTask(item.id, item.completed)}
                                  className={`p-4 border rounded-2xl flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.01] ${
                                    item.completed
                                      ? "bg-zinc-50 border-zinc-100 text-zinc-400 dark:bg-zinc-950 dark:border-zinc-900 line-through"
                                      : "bg-white border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300"
                                  }`}
                                >
                                  <div className="space-y-1.5">
                                    <div className="flex justify-between items-start gap-2">
                                      <h4 className="text-xs font-bold truncate max-w-[85%]">{item.topic}</h4>
                                      <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-mono font-bold uppercase tracking-wider ${
                                        item.priority === "High" ? "bg-red-500/10 text-red-500" : "bg-zinc-500/10 text-zinc-500"
                                      }`}>
                                        {item.priority}
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-zinc-400 leading-normal flex items-center gap-1.5">
                                      <Clock className="w-3 h-3 text-indigo-500" />
                                      <span>Est. time: {item.estimated_time} ({item.difficulty} Level)</span>
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Curated AI Recommendations resources panel */}
                  <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-3xl space-y-6">
                    <div>
                      <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                        Curated AI Reference Resources
                      </h3>
                      <p className="text-[11px] text-zinc-500">
                        Precision recommended documentation, websites, books, and exercises mapping to targets.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-zinc-600 dark:text-zinc-400">
                      
                      <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 rounded-2xl space-y-3">
                        <div className="flex items-center gap-2 text-indigo-500 font-bold">
                          <Book className="w-4 h-4" />
                          <span>Books & Official Documentation</span>
                        </div>
                        <ul className="space-y-2">
                          {plan.ai_recommendations?.books?.map((b: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-1">
                              <span className="text-indigo-500">•</span>
                              <span><b>Book:</b> {b}</span>
                            </li>
                          ))}
                          {plan.ai_recommendations?.official_documentation?.map((d: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-1">
                              <span className="text-indigo-500">•</span>
                              <span><b>Doc:</b> {d}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 rounded-2xl space-y-3">
                        <div className="flex items-center gap-2 text-indigo-500 font-bold">
                          <PlayCircle className="w-4 h-4" />
                          <span>YouTube Tutorials & Coding Platforms</span>
                        </div>
                        <ul className="space-y-2">
                          {plan.ai_recommendations?.youtube_videos?.map((v: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-1">
                              <span className="text-indigo-500">•</span>
                              <span><b>Watch:</b> {v}</span>
                            </li>
                          ))}
                          {plan.ai_recommendations?.practice_websites?.map((w: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-1">
                              <span className="text-indigo-500">•</span>
                              <span><b>Practice:</b> {w}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* TAB 3: TARGET COMPANY & ROLE PREPARATION */}
            {activeTab === "company_prep" && (
              <div className="space-y-8">
                
                {/* PART A: Company Prep Panel */}
                <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-3xl space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                        Target Company Preparation Blueprint
                      </h3>
                      <p className="text-xs text-zinc-500">
                        Select a company to view expected skills, interview patterns, and prep timelines.
                      </p>
                    </div>

                    {/* Company Dropdown selection */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-zinc-400 font-mono uppercase font-bold">Select target:</span>
                      <select
                        value={selectedCompany}
                        onChange={(e) => setSelectedCompany(e.target.value)}
                        className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 text-xs px-3.5 py-1.5 rounded-xl text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-indigo-500 cursor-pointer"
                      >
                        {companiesList.map((comp) => (
                          <option key={comp.name} value={comp.name}>
                            {comp.name} ({comp.difficulty})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Blueprint details */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    
                    <div className="p-5 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-900 space-y-4">
                      <div>
                        <span className="text-[9px] text-zinc-400 font-mono uppercase block">RECRUITING FILTER DIFFICULTY</span>
                        <span className="text-base font-black text-indigo-500 uppercase mt-0.5 block">
                          {activeCompanyData.difficulty}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] text-zinc-400 font-mono uppercase block">EXPECTED CODING LEVEL</span>
                        <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100 mt-0.5 block">
                          {activeCompanyData.codingLevel}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] text-zinc-400 font-mono uppercase block">RECOMMENDED TIMELINE</span>
                        <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100 mt-0.5 block">
                          {activeCompanyData.timeline}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-900 space-y-4">
                      <div className="space-y-1">
                        <span className="text-[10px] text-zinc-400 font-mono uppercase block">INTERVIEW ROUND STRUCTURE</span>
                        <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-mono">
                          {activeCompanyData.pattern}
                        </p>
                      </div>
                    </div>

                    <div className="p-5 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-900 space-y-4">
                      <div className="space-y-1">
                        <span className="text-[10px] text-zinc-400 font-mono uppercase block">BEHAVIORAL/SOFT FIT FOCUS</span>
                        <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                          {activeCompanyData.focus}
                        </p>
                      </div>
                    </div>

                  </div>
                </div>

                {/* PART B: Target Role Prep Panel */}
                <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-3xl space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                        Target Role Core Curriculum
                      </h3>
                      <p className="text-xs text-zinc-500">
                        Review target skill requirements and study topics mapping directly to industry roles.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-zinc-400 font-mono uppercase font-bold">Select Role Plan:</span>
                      <select
                        value={selectedRolePlan}
                        onChange={(e) => setSelectedRolePlan(e.target.value)}
                        className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 text-xs px-3.5 py-1.5 rounded-xl text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-indigo-500 cursor-pointer"
                      >
                        {rolesList.map((r) => (
                          <option key={r.name} value={r.name}>
                            {r.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    
                    <div className="p-5 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-900 space-y-1.5">
                      <span className="text-[9px] text-zinc-400 font-mono uppercase block">CURRICULUM DEV TIME</span>
                      <div className="flex items-baseline gap-1 pt-1">
                        <span className="text-2xl font-black text-indigo-500">{activeRolePlanData.time}</span>
                        <span className="text-[10px] text-zinc-400 font-mono">est. preparation</span>
                      </div>
                    </div>

                    <div className="p-5 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-900 space-y-3">
                      <span className="text-[9px] text-zinc-400 font-mono uppercase block">CORE CODING SKILLS</span>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {activeRolePlanData.coreSkills.map((sk, skIdx) => (
                          <span key={`${sk}-${skIdx}`} className="px-2 py-0.5 bg-indigo-500/10 text-indigo-500 text-[9px] font-mono rounded-md font-bold uppercase tracking-wide">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-5 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-900 space-y-3">
                      <span className="text-[9px] text-zinc-400 font-mono uppercase block">CRITICAL THEORY TOPICS</span>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {activeRolePlanData.topics.map((tp, tpIdx) => (
                          <span key={`${tp}-${tpIdx}`} className="px-2 py-0.5 bg-zinc-500/10 text-zinc-500 text-[9px] font-mono rounded-md font-bold uppercase tracking-wide">
                            {tp}
                          </span>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            )}

            {/* TAB 4: AI MENTOR CHAT */}
            {activeTab === "mentor_chat" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* Left Column: Active profile context */}
                <div className="md:col-span-1 space-y-6">
                  <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-3xl space-y-4">
                    <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">
                      Mentor Chat context
                    </h3>
                    
                    <div className="space-y-4 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      <p>
                        Your Placement Chat Mentor is strictly connected to your:
                      </p>
                      <ul className="space-y-2 pl-2">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-indigo-500" />
                          <span>Candidate Goals ({plan.goals?.dream_company})</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-indigo-500" />
                          <span>Telemetry Match Rating ({plan.career_profile?.current_placement_readiness})</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-indigo-500" />
                          <span>Aptitude and coding levels</span>
                        </li>
                      </ul>

                      <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 rounded-2xl space-y-2">
                        <span className="text-[9px] text-indigo-500 font-mono font-bold uppercase block">SUGGESTED DISCOVERY QUERIES:</span>
                        <ul className="space-y-1.5 text-[11px] text-zinc-500">
                          <li className="hover:text-indigo-500 transition-colors cursor-pointer" onClick={() => setChatInput(`How do I prepare for technical rounds at ${plan.goals?.dream_company}?`)}>
                            • "How do I prepare for technical rounds at {plan.goals?.dream_company}?"
                          </li>
                          <li className="hover:text-indigo-500 transition-colors cursor-pointer" onClick={() => setChatInput("What are the major structural errors in my projects lists?")}>
                            • "What are the major structural errors in my projects lists?"
                          </li>
                          <li className="hover:text-indigo-500 transition-colors cursor-pointer" onClick={() => setChatInput("Give me a step-by-step vocal filler reduction exercise.")}>
                            • "Give me a step-by-step vocal filler reduction exercise."
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Columns: Chat Canvas */}
                <div className="md:col-span-2">
                  <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-3xl h-[550px] flex flex-col justify-between overflow-hidden">
                    
                    {/* Conversations List */}
                    <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-4">
                      {chatMessages.map((msg, index) => {
                        const isMentor = msg.sender === "mentor";
                        return (
                          <div
                            key={index}
                            className={`flex ${isMentor ? "justify-start" : "justify-end"}`}
                          >
                            <div className={`p-4 rounded-2xl text-xs max-w-[85%] leading-relaxed space-y-1.5 ${
                              isMentor
                                ? "bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 text-zinc-800 dark:text-zinc-200"
                                : "bg-indigo-500 text-white shadow-md shadow-indigo-500/10"
                            }`}>
                              <span className="block font-mono text-[8px] opacity-60 font-bold uppercase">
                                {isMentor ? "AI Placement Mentor" : "Candidate"}
                              </span>
                              <div className="whitespace-pre-line font-sans font-medium">
                                {msg.text}
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {chatLoading && (
                        <div className="flex justify-start">
                          <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 text-zinc-400 rounded-2xl text-xs flex items-center gap-2">
                            <RefreshCw className="w-4.5 h-4.5 animate-spin text-indigo-500" />
                            <span className="font-mono">Mentor is analyzing metrics history...</span>
                          </div>
                        </div>
                      )}

                      <div ref={chatBottomRef} />
                    </div>

                    {/* Chat Input Field Form */}
                    <form onSubmit={handleSendChatMessage} className="border-t border-zinc-150 dark:border-zinc-850 pt-4 flex gap-2">
                      <input
                        type="text"
                        required
                        disabled={chatLoading}
                        placeholder={`Message your career coach about ${plan.goals?.dream_company} prep...`}
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        className="flex-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 text-xs px-4 py-2.5 rounded-xl text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                      />
                      <button
                        type="submit"
                        disabled={chatLoading}
                        className="px-4.5 py-2.5 bg-zinc-900 dark:bg-zinc-50 hover:bg-zinc-800 dark:hover:bg-zinc-250 text-white dark:text-zinc-900 rounded-xl transition-all flex items-center justify-center cursor-pointer select-none disabled:opacity-50"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>

                  </div>
                </div>

              </div>
            )}

          </div>
        )
      )}

    </div>
  );
}

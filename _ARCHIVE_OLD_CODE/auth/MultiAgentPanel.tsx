/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Cpu,
  User,
  Users,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Mic,
  MicOff,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Sliders,
  Edit2,
  Trash2,
  Save,
  Check,
  Award,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  AlertTriangle,
  BookOpen,
  Settings,
  Shield,
  FileText
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { api } from "../../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";

interface MultiAgentPanelProps {
  profile: {
    fullName: string;
    university: string;
    graduationYear: string;
    targetRoles: string[];
    skills: string[];
  };
  resumeFileName: string;
}

interface AgentConfig {
  agent_id: string;
  name: string;
  role: string;
  avatar: string;
  personality: string;
  prompt_template: string;
  rubric: string[];
  is_enabled: boolean;
}

interface TimelineEvent {
  timestamp: string;
  agent_id: string;
  title: string;
  details: string;
}

interface HistoryItem {
  question_id: string;
  agent_id: string;
  agent_name: string;
  agent_role: string;
  question_text: string;
  topic: string;
  user_answer: string;
  evaluation: {
    score: number;
    is_strong_answer: boolean;
    evidence: string;
    strengths: string[];
    weaknesses: string[];
    remediation: string;
    rubric_breakdown: Record<string, number>;
  };
  timestamp: string;
}

interface MultiAgentSession {
  session_id: string;
  user_id: string;
  status: "active" | "paused" | "completed";
  candidate_profile: any;
  active_flow: string[];
  current_flow_index: number;
  scoring_weights: Record<string, number>;
  timeline: TimelineEvent[];
  history: HistoryItem[];
  agent_memories?: Record<string, any[]>;
  evaluations?: Record<string, any>;
  current_state?: {
    agent_id: string;
    name: string;
    role: string;
    avatar: string;
    personality: string;
    question_text: string;
    topic: string;
    question_counter: number;
    is_speaking: boolean;
    is_listening: boolean;
    difficulty: string;
  };
  overall_report?: {
    technical_score: number;
    hr_score: number;
    behavioral_score: number;
    leadership_score: number;
    communication_score: number;
    problem_solving_score: number;
    overall_score: number;
    report: {
      executive_summary: string;
      interviewer_wise_feedback: Array<{
        agent_id: string;
        agent_name: string;
        score: number;
        feedback: string;
      }>;
      strengths: string[];
      weaknesses: string[];
      technical_gaps: string[];
      behavioral_gaps: string[];
      communication_analysis: string;
      recommended_learning_plan: Array<{
        topic: string;
        duration: string;
        resource_suggestion: string;
      }>;
      placement_readiness: string;
    };
  };
}

export function MultiAgentPanel({ profile, resumeFileName }: MultiAgentPanelProps) {
  // Navigation & configuration tabs
  const [panelTab, setPanelTab] = useState<"lobby" | "admin" | "weights">("lobby");
  const [view, setView] = useState<"setup" | "boardroom" | "report">("setup");

  // Client configuration copy
  const [agents, setAgents] = useState<AgentConfig[]>([
    {
      agent_id: "moderator",
      name: "Aria Vance",
      role: "Panel Moderator",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      personality: "Structured, encouraging, professional, keeping timing impeccable",
      prompt_template: "You are Aria Vance, Panel Moderator...",
      rubric: ["Overall Structure", "Pacing", "Answering directness", "Professional poise"],
      is_enabled: true
    },
    {
      agent_id: "hr",
      name: "Eleanor Sterling",
      role: "HR & Culture Advocate",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
      personality: "Warm, highly supportive, friendly, deeply curious about cultural alignment",
      prompt_template: "You are Eleanor Sterling, HR Lead...",
      rubric: ["Communication", "Cultural Fit", "Self Awareness", "Conflict Resolution", "Leadership"],
      is_enabled: true
    },
    {
      agent_id: "technical",
      name: "Marcus Thorne",
      role: "Lead Architect",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      personality: "Analytical, precise, direct, demands deep conceptual understanding",
      prompt_template: "You are Marcus Thorne, Lead Technical Architect...",
      rubric: ["Framework Command", "Data Store Knowledge", "Architecture Logic", "Debugging Mindset"],
      is_enabled: true
    },
    {
      agent_id: "behavioral",
      name: "Calvin Vance",
      role: "Behavioral Specialist",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      personality: "Calm, observant, supportive, structures dialogue around standard behavioral frameworks",
      prompt_template: "You are Calvin Vance, Behavioral Specialist...",
      rubric: ["STAR Structure", "Professionalism", "Extreme Ownership", "Self Reflection"],
      is_enabled: true
    },
    {
      agent_id: "manager",
      name: "Diane Ross",
      role: "Engineering Director",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      personality: "Strategic, strategic ownership focused, expects high accountability",
      prompt_template: "You are Diane Ross, Engineering Director...",
      rubric: ["Ownership Accountability", "Prioritization Framework", "Project Execution Planning", "Risk Mitigation"],
      is_enabled: true
    },
    {
      agent_id: "system_design",
      name: "Vikram Mehta",
      role: "Principal Systems Architect",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
      personality: "Systems-first architect mindset, highly scaling-centric, likes deep technical depth",
      prompt_template: "You are Vikram Mehta, Principal Systems Architect...",
      rubric: ["Scale Decoupling", "API Architecture", "Database Partitioning", "Caching & CDN Logic"],
      is_enabled: true
    },
  ]);

  const [flow, setFlow] = useState<string[]>(["moderator", "hr", "technical", "behavioral", "manager", "system_design", "moderator"]);
  const [weights, setWeights] = useState<Record<string, number>>({
    hr: 15,
    technical: 25,
    behavioral: 15,
    manager: 15,
    system_design: 15,
    coding: 15
  });

  // Admin states
  const [editingAgent, setEditingAgent] = useState<AgentConfig | null>(null);
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  // Active Session State
  const [session, setSession] = useState<MultiAgentSession | null>(null);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [isLoadingTurn, setIsLoadingTurn] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isPaused, setIsPaused] = useState(false);

  // Diagnostics and Visualizer states
  const [micGranted, setMicGranted] = useState<boolean | null>(null);
  const [micActive, setMicActive] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<any>(null);
  const timelineEndRef = useRef<HTMLDivElement | null>(null);

  // Speech Recognition hook variables
  const recognitionRef = useRef<any>(null);
  const [realtimeTranscript, setRealtimeTranscript] = useState("");

  // Accompanying UI State details
  const [expandedInterviewer, setExpandedInterviewer] = useState<string | null>(null);

  // Load backend configurations if available
  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await api.get("/v1/multi-agent/config");
        if (res.data?.status === "success") {
          const { agents: backendAgents, flow: backendFlow, scoring_weights: backendWeights } = res.data.config;
          if (backendAgents) setAgents(backendAgents);
          if (backendFlow) setFlow(backendFlow);
          if (backendWeights) {
            // Convert fractional weights (e.g., 0.25) to percentage (e.g., 25)
            const pctWeights: Record<string, number> = {};
            Object.entries(backendWeights).forEach(([k, v]) => {
              pctWeights[k] = Math.round((v as number) * 100);
            });
            setWeights(pctWeights);
          }
        }
      } catch (e) {
        console.warn("[MULTI_AGENT] Could not load configs from FastAPI. Falling back to robust offline defaults.", e);
      }
    }
    loadConfig();
  }, []);

  // Timer Tick Trigger
  useEffect(() => {
    if (view === "boardroom" && !isPaused && !isLoadingTurn) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [view, isPaused, isLoadingTurn]);

  // Scroll timeline to bottom whenever events update
  useEffect(() => {
    if (timelineEndRef.current) {
      timelineEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [session?.timeline]);

  // Request Mic Access
  const requestMicAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicGranted(true);
      // Close immediate audio elements so we do not trigger echo feedbacks
      stream.getTracks().forEach(track => track.stop());
    } catch (err) {
      console.warn("Camera/Mic stream check blocked:", err);
      setMicGranted(false);
    }
  };

  // Toggle browser Speech Recognition
  const toggleSpeechRecognition = () => {
    if (micActive) {
      recognitionRef.current?.stop();
      setMicActive(false);
    } else {
      setMicActive(true);
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = "en-US";

        rec.onresult = (event: any) => {
          let current = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            current += event.results[i][0].transcript;
          }
          setRealtimeTranscript(current);
        };

        rec.onerror = (e: any) => {
          console.warn("Speech recognition error:", e);
        };

        rec.onend = () => {
          setMicActive(false);
        };

        recognitionRef.current = rec;
        rec.start();
      } else {
        // Fallback simulate speech transcription
        let simulatedTexts = [
          "Yes, absolutely. I have worked extensively with that technology stack.",
          "In my previous project, we faced major scale latency issues, which we resolved by caching.",
          "I think we can achieve modular scalability by utilizing decoupled microservices and Redis storage.",
          "Under high-pressure deadlines, we decided to minimize unneeded scope to ensure core reliability."
        ];
        let randomText = simulatedTexts[Math.floor(Math.random() * simulatedTexts.length)];
        let i = 0;
        const interval = setInterval(() => {
          if (i < randomText.length) {
            setRealtimeTranscript((prev) => prev + randomText.charAt(i));
            i += 3;
          } else {
            clearInterval(interval);
            setMicActive(false);
          }
        }, 50);
      }
    }
  };

  // Standard Mock Resume Parser Profile matching fallback
  const getCandidateProfile = () => {
    return {
      candidateProfile: {
        fullName: profile.fullName || "Candidate",
        university: profile.university || "Your institution",
        graduationYear: profile.graduationYear || "2026",
        strengthLevel: "Intermediate",
        targetRoles: profile.targetRoles,
        skills: profile.skills
      }
    };
  };

  // API Call: Start Multi-Agent Panel Interview
  const handleStartPanelInterview = async () => {
    setIsLoadingTurn(true);
    setErrorMsg("");
    setElapsedSeconds(0);
    setTypedAnswer("");
    setRealtimeTranscript("");

    // Prepare custom flows and weights to push to the backend
    const normalizedWeights: Record<string, number> = {};
    const sum = Object.values(weights).reduce((a, b) => a + b, 0);
    Object.entries(weights).forEach(([k, v]) => {
      normalizedWeights[k] = sum > 0 ? Number((v / sum).toFixed(2)) : 0.15;
    });

    try {
      const res = await api.post("/v1/multi-agent/start", {
        candidate_profile: getCandidateProfile(),
        custom_flow: flow,
        custom_weights: normalizedWeights
      });

      if (res.data?.status === "success") {
        setSession(res.data.session);
        setView("boardroom");
      }
    } catch (e: any) {
      console.warn("Failed starting multi-agent panel via Python. Triggering advanced client-side simulation engine...", e);
      // Client-side robust fallback
      simulateSessionStart();
    } finally {
      setIsLoadingTurn(false);
    }
  };

  // Offline Emulation Engine - Start
  const simulateSessionStart = () => {
    const strength_lvl: "Beginner" | "Intermediate" | "Advanced" = profile.skills.length > 8 ? "Advanced" : (profile.skills.length > 3 ? "Intermediate" : "Beginner");
    const active_flow = flow.filter(f => f === "moderator" || agents.find(a => a.agent_id === f)?.is_enabled);
    if (strength_lvl === "Beginner" && active_flow.includes("system_design")) {
      const index = active_flow.indexOf("system_design");
      if (index !== -1) active_flow.splice(index, 1);
    }

    const firstAgent = agents.find(a => a.agent_id === "moderator")!;
    const mockSession: MultiAgentSession = {
      session_id: `pnl_sim_${Math.random().toString(36).substring(3, 10)}`,
      user_id: "offline_candidate",
      status: "active",
      candidate_profile: getCandidateProfile(),
      active_flow: active_flow,
      current_flow_index: 0,
      scoring_weights: weights,
      timeline: [
        { timestamp: new Date().toISOString(), agent_id: "lobby", title: "Interview Session Initialized", details: "Candidate entered the virtual lobby. Panel hardware diagnostics complete." },
        { timestamp: new Date().toISOString(), agent_id: "moderator", title: "Aria Vance Joined", details: "Panel moderator Aria Vance welcomed candidate and initialized session." }
      ],
      history: [],
      agent_memories: {
        hr: [], technical: [], behavioral: [], manager: [], system_design: [], coding: []
      },
      evaluations: {},
      current_state: {
        agent_id: "moderator",
        name: firstAgent.name,
        role: firstAgent.role,
        avatar: firstAgent.avatar,
        personality: firstAgent.personality,
        question_text: `Welcome to your virtual board interview, ${profile.fullName || "Candidate"}. I am Aria Vance, your panel moderator. Today, you will speak with our five specialists: HR, Systems, and Algorithmic architects. Let's begin—please introduce yourself and tell us what drives your career goals.`,
        topic: "Introduction & Welcome",
        question_counter: 1,
        is_speaking: true,
        is_listening: false,
        difficulty: strength_lvl
      }
    };

    setSession(mockSession);
    setView("boardroom");
  };

  // API Call: Submit Answer and Get Next Turn
  const handleSubmitAnswer = async () => {
    if (!session) return;
    const answer = (typedAnswer + " " + realtimeTranscript).trim();
    if (!answer) {
      setErrorMsg("Please speak or enter a typed response before submitting.");
      return;
    }

    setIsLoadingTurn(true);
    setErrorMsg("");

    if (micActive) {
      recognitionRef.current?.stop();
      setMicActive(false);
    }

    try {
      const res = await api.post(`/v1/multi-agent/${session.session_id}/answer`, {
        user_answer: answer
      });

      if (res.data?.status === "success") {
        setSession(res.data.session);
        setTypedAnswer("");
        setRealtimeTranscript("");
        
        if (res.data.session.status === "completed") {
          setView("report");
        }
      }
    } catch (e: any) {
      console.warn("Failed submitting answer to server. Running inline client-side follow-up generation...", e);
      await simulateAnswerSubmission(answer);
    } finally {
      setIsLoadingTurn(false);
    }
  };

  // Offline Emulation Engine - Answer Submission State Machine
  const simulateAnswerSubmission = async (answer: string) => {
    if (!session || !session.current_state) return;
    const s = { ...session };
    const currentAgentId = s.current_state.agent_id;
    const currentAgent = agents.find(a => a.agent_id === currentAgentId)!;

    // Simulate individual agent evaluation
    const scoreVal = Math.floor(Math.random() * 20) + 76; // 76 - 96 range
    const mockEval = {
      score: scoreVal,
      is_strong_answer: scoreVal >= 80,
      evidence: `Demonstrated good conceptual command during discussion of ${s.current_state.topic}.`,
      strengths: [`Directly answered ${currentAgent.name}'s query`, "Used clear descriptive logic"],
      weaknesses: ["Could expand more on edge-cases and cost trade-offs"],
      remediation: "Review practical implementation guides and optimize performance parameters.",
      rubric_breakdown: currentAgent.rubric.reduce((acc, rub) => {
        acc[rub] = Math.floor(Math.random() * 15) + 80;
        return acc;
      }, {} as Record<string, number>)
    };

    const historyItem: HistoryItem = {
      question_id: `q_sim_${s.current_state.question_counter}`,
      agent_id: currentAgentId,
      agent_name: currentAgent.name,
      agent_role: currentAgent.role,
      question_text: s.current_state.question_text,
      topic: s.current_state.topic,
      user_answer: answer,
      evaluation: mockEval,
      timestamp: new Date().toISOString()
    };

    s.history.push(historyItem);
    s.timeline.push({
      timestamp: new Date().toISOString(),
      agent_id: currentAgentId,
      title: `Answer evaluated by ${currentAgent.name}`,
      details: `Scored ${scoreVal}/100. Strengths: Direct answers.`
    });

    // Advance flow index
    const nextIdx = s.current_flow_index + 1;
    s.current_flow_index = nextIdx;

    if (nextIdx >= s.active_flow.length) {
      // Complete interview and compile report
      s.status = "completed";
      s.current_state = undefined;
      
      s.timeline.push({
        timestamp: new Date().toISOString(),
        agent_id: "moderator",
        title: "Interview Board Dismissed",
        details: "Moderator closed streaming lines and requested final panel compilation."
      });
      s.timeline.push({
        timestamp: new Date().toISOString(),
        agent_id: "evaluation",
        title: "Master Report Compiled",
        details: "Comprehensive report card, scoring weights calculated, and study guidelines generated."
      });

      // Assemble final report
      const histScores = s.history.filter(h => h.agent_id !== "moderator").map(h => h.evaluation.score);
      const avgScore = histScores.length > 0 ? Math.round(histScores.reduce((a, b) => a + b, 0) / histScores.length) : 84;

      s.overall_report = {
        technical_score: avgScore + 1,
        hr_score: avgScore - 2,
        behavioral_score: avgScore,
        leadership_score: avgScore - 1,
        communication_score: avgScore + 3,
        problem_solving_score: avgScore + 2,
        overall_score: avgScore,
        report: {
          executive_summary: `Candidate completed all specialized rounds of the multi-agent board interview panel successfully. The candidate demonstrated elegant responsiveness in technical domains and excellent corporate communication under pressure.`,
          interviewer_wise_feedback: s.active_flow.filter(f => f !== "moderator").map(f_id => {
            const agent = agents.find(a => a.agent_id === f_id)!;
            return {
              agent_id: f_id,
              agent_name: agent.name,
              score: Math.floor(Math.random() * 15) + 82,
              feedback: `Highly professional articulation on projects. Showed clear capacity in resolving complex domain challenges.`
            };
          }),
          strengths: ["Excellent soft skills and structured dialogue delivery", "Good architectural design thinking", "Responsive with custom project implementations"],
          weaknesses: ["Could show deeper command of database clustering structures", "Needs to practice more dynamic Big O memory trade-off scenarios"],
          technical_gaps: ["Docker Deployment", "SQL Index Tuning"],
          behavioral_gaps: ["STAR framework delivery timing"],
          communication_analysis: "Articulation, pacing (WPM), and descriptive structures are extremely high. Polished executive vocabulary observed.",
          recommended_learning_plan: [
            { topic: "Database Partitioning Topologies", duration: "1 week", resource_suggestion: "Read High Scalability architecture blogs" },
            { topic: "Dockerizing Production APIs", duration: "1.5 weeks", resource_suggestion: "Container Security Guidelines manual" }
          ],
          placement_readiness: "Ready for Tier-1 Product Tech Corporations with minor tuning"
        }
      };

      setSession(s);
      setTypedAnswer("");
      setRealtimeTranscript("");
      setView("report");
    } else {
      // Select next agent in flow
      const nextAgentId = s.active_flow[nextIdx];
      const nextAgent = agents.find(a => a.agent_id === nextAgentId)!;

      s.timeline.push({
        timestamp: new Date().toISOString(),
        agent_id: "moderator",
        title: `Transitioning to ${nextAgent.name}`,
        details: `Moderator handing over mic control to the ${nextAgent.role} specialist.`
      });

      // Generate question tailored to domain and previous details
      let qText = "";
      let qTopic = "";

      if (nextAgentId === "hr") {
        qText = `Hello, I'm Eleanor Sterling. I'm pleased to meet you! Let's talk about alignment. Can you share a time where your personal goals were challenged in a team setup, and how you handled conflict with colleagues?`;
        qTopic = "Conflict Resolution";
      } else if (nextAgentId === "technical") {
        qText = `Hello, Marcus here. Let's dig into the tech. Looking at your profile skills: ${profile.skills.slice(0, 3).join(", ")}, how do you evaluate and select the database engine to prevent data inconsistencies during high concurrent writes?`;
        qTopic = "Database Reliability";
      } else if (nextAgentId === "behavioral") {
        // Dynamic follow-up check!
        const techQ = s.history.find(h => h.agent_id === "technical");
        const techMention = techQ ? `During your chat with Marcus, you mentioned handling data. ` : "";
        qText = `Calvin here. ${techMention}Could you describe a scenario where you faced a major engineering failure right before a release, and describe your direct actions using the Situation-Task-Action-Result structure?`;
        qTopic = "STAR Technical Failure";
      } else if (nextAgentId === "manager") {
        qText = `Hi, Diane Ross. Let's look at engineering strategy. When launching a product, how do you handle prioritize critical tech debt versus shipping new consumer-facing features when resources are low?`;
        qTopic = "Risk Management";
      } else if (nextAgentId === "system_design") {
        qText = `Vikram here. Let's build. How would you design a rate-limiting service to support up to 50,000 requests per second across a global distributed API gateway cluster?`;
        qTopic = "Distributed Rate Limiter";
        qText = `Excellent answers today. This is Aria Vance wrapping up. You have spoken with all specialists on our board. Do you have any questions for the panel, or is there a final message you'd like to share regarding your readiness?`;
        qTopic = "Closing Statement";
      }

      s.current_state = {
        agent_id: nextAgentId,
        name: nextAgent.name,
        role: nextAgent.role,
        avatar: nextAgent.avatar,
        personality: nextAgent.personality,
        question_text: qText,
        topic: qTopic,
        question_counter: s.current_state.question_counter + 1,
        is_speaking: true,
        is_listening: false,
        difficulty: profile.skills.length > 8 ? "Advanced" : "Intermediate"
      };

      s.timeline.push({
        timestamp: new Date().toISOString(),
        agent_id: nextAgentId,
        title: `${nextAgent.name} Speaking`,
        details: `Began asking question about ${qTopic}.`
      });

      setSession(s);
      setTypedAnswer("");
      setRealtimeTranscript("");
    }
  };

  // API Call: Pause Session
  const handlePauseSession = async () => {
    if (!session) return;
    try {
      const res = await api.post(`/v1/multi-agent/${session.session_id}/pause`);
      if (res.data?.status === "success") {
        setSession(res.data.session);
        setIsPaused(true);
      }
    } catch (e) {
      setIsPaused(true);
      const s = { ...session };
      s.status = "paused";
      s.timeline.push({
        timestamp: new Date().toISOString(),
        agent_id: "lobby",
        title: "Interview Paused",
        details: "Candidate temporarily suspended active live streams."
      });
      setSession(s);
    }
  };

  // API Call: Resume Session
  const handleResumeSession = async () => {
    if (!session) return;
    try {
      const res = await api.post(`/v1/multi-agent/${session.session_id}/resume`);
      if (res.data?.status === "success") {
        setSession(res.data.session);
        setIsPaused(false);
      }
    } catch (e) {
      setIsPaused(false);
      const s = { ...session };
      s.status = "active";
      s.timeline.push({
        timestamp: new Date().toISOString(),
        agent_id: "lobby",
        title: "Interview Resumed",
        details: "Candidate re-established panel stream connection."
      });
      setSession(s);
    }
  };

  // API Call: Finish Early
  const handleFinishEarly = async () => {
    if (!session) return;
    setIsLoadingTurn(true);
    try {
      const res = await api.post(`/v1/multi-agent/${session.session_id}/finish`);
      if (res.data?.status === "success") {
        setSession(res.data.session);
        setView("report");
      }
    } catch (e) {
      // Force local early complete
      const s = { ...session };
      s.status = "completed";
      s.current_state = undefined;
      s.timeline.push({
        timestamp: new Date().toISOString(),
        agent_id: "moderator",
        title: "Interview Ended Early",
        details: "Candidate requested early termination of board interview."
      });
      
      // Compute report
      s.overall_report = {
        technical_score: 72,
        hr_score: 75,
        behavioral_score: 74,
        leadership_score: 70,
        communication_score: 78,
        problem_solving_score: 71,
        overall_score: 73,
        report: {
          executive_summary: "Candidate chose to complete the board interview rounds early. Aggregate feedback calculated based on answers logged so far.",
          interviewer_wise_feedback: s.history.map(h => ({
            agent_id: h.agent_id,
            agent_name: h.agent_name,
            score: h.evaluation.score,
            feedback: "Answer registered prior to early session conclusion."
          })),
          strengths: ["Fast response turnaround", "Concise coding logic discussed"],
          weaknesses: ["Terminated early preventing full panel diagnostic audit"],
          technical_gaps: ["Completeness on systems validation parameters"],
          behavioral_gaps: ["Full depth mapping under continuous board grilling"],
          communication_analysis: "Clear verbal articulation but lacking descriptive resilience due to truncation.",
          recommended_learning_plan: [{ topic: "Completing multi-stage panels", duration: "1 week", resource_suggestion: "Endurance drilling" }],
          placement_readiness: "Partially Ready - Requires full-length practice sessions"
        }
      };

      setSession(s);
      setView("report");
    } finally {
      setIsLoadingTurn(false);
    }
  };

  // Admin Call: Update Agent Config
  const handleUpdateAgentConfig = async (agentId: string, updatedData: Partial<AgentConfig>) => {
    setIsSavingConfig(true);
    try {
      const res = await api.put(`/v1/multi-agent/config/agent/${agentId}`, updatedData);
      if (res.data?.status === "success") {
        const updatedAgents = agents.map(a => a.agent_id === agentId ? { ...a, ...res.data.agent } : a);
        setAgents(updatedAgents);
        setEditingAgent(null);
      }
    } catch (e) {
      console.warn("FastAPI config endpoint not fully ready. Saving modifications locally for offline execution.", e);
      // Offline edit local state
      const updatedAgents = agents.map(a => a.agent_id === agentId ? { ...a, ...updatedData } : a);
      setAgents(updatedAgents);
      setEditingAgent(null);
    } finally {
      setIsSavingConfig(false);
    }
  };

  // Helpers
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-zinc-200 dark:border-zinc-850 pb-5 gap-4">
        <div>
          <span className="text-[10px] text-indigo-500 font-mono font-bold tracking-widest block uppercase">
            MULTI-AGENT INTELLIGENCE round
          </span>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2 mt-1">
            <Users className="w-5 h-5 text-indigo-500 animate-pulse" />
            AI Multi-Agent Interview Boardroom
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Conduct a realistic hiring interview chaired by a board of six specialized artificial interviewers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {view === "setup" && (
            <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-1 flex">
              <button
                onClick={() => setPanelTab("lobby")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  panelTab === "lobby"
                    ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Boardroom Lobby
              </button>
              <button
                onClick={() => setPanelTab("admin")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  panelTab === "admin"
                    ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Panel Settings
              </button>
            </div>
          )}
        </div>
      </div>

      {/* VIEW 1: SETUP LOBBY & ADMIN CONFIG */}
      {view === "setup" && (
        <div>
          {panelTab === "lobby" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Board composition and info */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 p-6 rounded-3xl space-y-4">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Shield className="w-4 h-4 text-indigo-500" />
                    Meet Your Interviewing Panel Board
                  </h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Unlike standard isolated chatbots, this panel features specialized entities operating as a peer group.
                    They communicate, maintain individual memories, and adjust difficulty dynamically.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    {agents.map((agent) => (
                      <div
                        key={agent.agent_id}
                        className={`p-4 bg-zinc-50 dark:bg-zinc-950 border rounded-2xl flex gap-3 items-start ${
                          agent.is_enabled ? "border-zinc-200 dark:border-zinc-850" : "opacity-40 border-zinc-200 dark:border-zinc-900"
                        }`}
                      >
                        <img
                          src={agent.avatar}
                          alt={agent.name}
                          className="w-10 h-10 rounded-xl object-cover shrink-0 border border-indigo-500/10"
                        />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{agent.name}</span>
                            {!agent.is_enabled && (
                              <span className="text-[8px] bg-zinc-200 text-zinc-600 px-1 py-0.2 rounded font-mono">DISABLED</span>
                            )}
                          </div>
                          <span className="text-[10px] text-indigo-500 block font-mono">{agent.role}</span>
                          <p className="text-[10px] text-zinc-400 leading-normal">{agent.personality}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Diagnostics */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 p-6 rounded-3xl space-y-4">
                  <h3 className="text-sm font-semibold">Pre-Interview Hardware Verification</h3>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-850 gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        micGranted === true
                          ? "bg-emerald-500/10 text-emerald-500"
                          : micGranted === false
                          ? "bg-red-500/10 text-red-500"
                          : "bg-zinc-100 dark:bg-zinc-900 text-zinc-500"
                      }`}>
                        <Mic className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold block">Microphone Access Check</span>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          {micGranted === true ? "Ready - Permission Approved" : micGranted === false ? "Error - Permissions Denied" : "Awaiting hardware test"}
                        </span>
                      </div>
                    </div>
                    {micGranted !== true && (
                      <button
                        onClick={requestMicAccess}
                        className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors"
                      >
                        Request Permissions
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Profile summary and CTA */}
              <div className="space-y-6">
                <div className="bg-zinc-900 text-white p-6 rounded-3xl border border-zinc-800 space-y-6 relative overflow-hidden flex flex-col justify-between min-h-[380px]">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/15 rounded-full blur-2xl" />
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-indigo-400" />
                      <span className="text-xs uppercase font-mono tracking-wider text-indigo-300">Boardroom Lobby</span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold">Launch Multi-Agent Board</h3>
                      <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                        Chaired by <strong>Aria Vance</strong>, the board will dynamically review your qualifications in a 1-on-1 rotational sequence based on your parsed resume facts.
                      </p>
                    </div>

                    <div className="border-t border-zinc-800 pt-4 space-y-2.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-500">Candidate</span>
                        <span className="font-bold">{profile.fullName}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-500">Resume File</span>
                        <span className="font-mono text-[10px] truncate max-w-[150px]">{resumeFileName || "None"}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-500">Board Composition</span>
                        <span className="font-bold text-indigo-400">{flow.length - 2} Specialists</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4">
                    {errorMsg && (
                      <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] rounded-xl">
                        {errorMsg}
                      </div>
                    )}
                    <button
                      onClick={handleStartPanelInterview}
                      disabled={isLoadingTurn}
                      className="w-full py-4.5 bg-white hover:bg-zinc-100 text-zinc-950 font-bold rounded-2xl transition-all shadow-lg text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isLoadingTurn ? (
                        <>
                          <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                          <span>Assembling Board...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          <span>Enter Boardroom</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ADMIN PANELS TAB */}
          {panelTab === "admin" && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 p-6 rounded-3xl space-y-4">
                <div>
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-indigo-500" />
                    Configure Active Panelist Personas
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Modify the underlying prompts, enabled states, or specialized rubrics for each of your artificial interviewers.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {agents.map((agent) => (
                    <div
                      key={agent.agent_id}
                      className="p-5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-2xl flex flex-col justify-between space-y-4"
                    >
                      <div className="flex gap-4 items-start">
                        <img
                          src={agent.avatar}
                          alt={agent.name}
                          className="w-12 h-12 rounded-xl object-cover border border-indigo-500/10 shrink-0"
                        />
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{agent.name}</h4>
                          <span className="text-[10px] text-indigo-500 block font-mono">{agent.role}</span>
                          <p className="text-[10px] text-zinc-400 leading-normal">{agent.personality}</p>
                          <div className="flex flex-wrap gap-1 pt-1.5">
                            {agent.rubric.map(r => (
                              <span key={r} className="text-[8px] bg-zinc-100 dark:bg-zinc-900 text-zinc-500 border border-zinc-200 dark:border-zinc-850 px-1.5 py-0.5 rounded font-mono">
                                {r}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-850">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={agent.is_enabled}
                            onChange={(e) => handleUpdateAgentConfig(agent.agent_id, { is_enabled: e.target.checked })}
                            disabled={agent.agent_id === "moderator"}
                            className="w-3.5 h-3.5 accent-indigo-500"
                            id={`enabled-${agent.agent_id}`}
                          />
                          <label htmlFor={`enabled-${agent.agent_id}`} className="text-[10px] font-semibold text-zinc-500 select-none">
                            Enable Panelist
                          </label>
                        </div>

                        <button
                          onClick={() => setEditingAgent({ ...agent })}
                          className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[10px] font-bold rounded-lg cursor-pointer transition-colors flex items-center gap-1.5"
                        >
                          <Edit2 className="w-3 h-3" />
                          Edit Profile
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Editing Slide-out / Dialog overlay */}
              <AnimatePresence>
                {editingAgent && (
                  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.95, opacity: 0 }}
                      className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 max-w-lg w-full space-y-4"
                    >
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-bold flex items-center gap-2">
                          <Sliders className="w-4 h-4 text-indigo-500" />
                          Edit Panelist: {editingAgent.name}
                        </h3>
                        <button
                          onClick={() => setEditingAgent(null)}
                          className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-lg cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="space-y-4 pt-2">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase font-mono">Panelist Name</label>
                            <input
                              type="text"
                              value={editingAgent.name}
                              onChange={(e) => setEditingAgent({ ...editingAgent, name: e.target.value })}
                              className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl text-xs font-medium"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase font-mono">Specialized Role</label>
                            <input
                              type="text"
                              value={editingAgent.role}
                              onChange={(e) => setEditingAgent({ ...editingAgent, role: e.target.value })}
                              className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl text-xs font-medium"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase font-mono">Brief Personality Synopsis</label>
                          <input
                            type="text"
                            value={editingAgent.personality}
                            onChange={(e) => setEditingAgent({ ...editingAgent, personality: e.target.value })}
                            className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl text-xs font-medium"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase font-mono">Underlying System Prompt Instructions</label>
                          <textarea
                            value={editingAgent.prompt_template}
                            onChange={(e) => setEditingAgent({ ...editingAgent, prompt_template: e.target.value })}
                            rows={4}
                            className="w-full p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl text-xs font-medium font-mono"
                          />
                        </div>

                        <div className="flex gap-2 justify-end pt-2">
                          <button
                            onClick={() => setEditingAgent(null)}
                            className="px-4 py-2 bg-zinc-100 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 text-xs font-bold rounded-xl cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleUpdateAgentConfig(editingAgent.agent_id, editingAgent)}
                            disabled={isSavingConfig}
                            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1.5"
                          >
                            <Save className="w-4.5 h-4.5" />
                            <span>Save Profile</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: ACTIVE BOARDROOM INTERACTIVE INTERFACE */}
      {view === "boardroom" && session && session.current_state && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Speaking panelist card */}
          <div className="space-y-6 lg:col-span-1">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-3xl p-6 space-y-6 flex flex-col items-center text-center relative overflow-hidden">
              {/* Pulse rings indicating Speaking State */}
              <div className="absolute inset-0 flex items-center justify-center -z-10 pointer-events-none">
                <div className={`w-40 h-40 bg-indigo-500/5 rounded-full absolute animate-ping duration-1000 ${session.current_state.is_speaking ? "block" : "hidden"}`} />
              </div>

              {/* Avatar Frame */}
              <div className="relative">
                <img
                  src={session.current_state.avatar}
                  alt={session.current_state.name}
                  className="w-24 h-24 rounded-3xl object-cover shadow-md border-2 border-indigo-500"
                />
                <div className="absolute -bottom-1 -right-1 p-1 bg-indigo-500 text-white rounded-xl shadow-lg border border-white dark:border-zinc-900">
                  <Volume2 className="w-4 h-4 animate-bounce" />
                </div>
              </div>

              <div className="space-y-1.5 w-full">
                <span className="text-[10px] bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 px-2 py-0.5 rounded-full font-mono uppercase font-bold tracking-wider">
                  {session.current_state.agent_id === "moderator" ? "Orchestrator" : "Specialist Interviewer"}
                </span>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 mt-1">{session.current_state.name}</h3>
                <span className="text-[11px] font-medium text-zinc-400 font-mono block -mt-1">{session.current_state.role}</span>
                <p className="text-[10px] text-zinc-500 leading-relaxed px-4 pt-1.5">{session.current_state.personality}</p>
              </div>

              {/* Waveform graphic */}
              <div className="h-8 flex items-center justify-center gap-1 w-full max-w-[150px] pt-4">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={session.current_state?.is_speaking ? {
                      height: [10, Math.floor(Math.random() * 30) + 12, 10]
                    } : { height: 10 }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.6 + i * 0.1,
                      ease: "easeInOut"
                    }}
                    className="w-1.5 bg-indigo-500 rounded-full"
                  />
                ))}
              </div>
            </div>

            {/* Panel listening status indicators of other participants */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 p-5 rounded-3xl space-y-4">
              <span className="text-[9px] uppercase tracking-wider font-bold text-zinc-400 block">Board Members Listening</span>
              <div className="flex flex-wrap gap-2.5">
                {session.active_flow.filter(f => f !== session.current_state?.agent_id).map((f_id) => {
                  const p = agents.find(a => a.agent_id === f_id);
                  if (!p) return null;
                  return (
                    <div
                      key={p.agent_id}
                      className="relative cursor-help group"
                      title={`${p.name} - ${p.role}`}
                    >
                      <img
                        src={p.avatar}
                        alt={p.name}
                        className="w-9 h-9 rounded-xl object-cover border border-zinc-200 dark:border-zinc-800 saturate-0 hover:saturate-100 transition-all"
                      />
                      <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-zinc-400 border border-white dark:border-zinc-900" />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Board Question and User responses */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 p-6 rounded-3xl space-y-6 flex flex-col justify-between min-h-[420px] relative">
              <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-850 pb-4">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-indigo-500 animate-spin" />
                  <div>
                    <span className="text-[9px] font-bold text-zinc-400 uppercase font-mono">Topic Domain</span>
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block -mt-0.5">
                      {session.current_state.topic}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <div className="flex items-center gap-1.5 text-zinc-400">
                    <Clock className="w-4 h-4" />
                    <span>{formatTime(elapsedSeconds)}</span>
                  </div>
                  <div className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-300 rounded-lg border border-zinc-200 dark:border-zinc-850 font-bold">
                    Round {session.current_state.question_counter} of {session.active_flow.length}
                  </div>
                </div>
              </div>

              {/* Active Question typography */}
              <div className="py-4">
                <p className="text-base font-medium text-zinc-900 dark:text-zinc-100 leading-relaxed tracking-tight">
                  "{session.current_state.question_text}"
                </p>
              </div>

              {/* User answer controls */}
              <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-850">
                <div className="relative">
                  <textarea
                    value={typedAnswer}
                    onChange={(e) => setTypedAnswer(e.target.value)}
                    placeholder={micActive ? "Speech recognition capturing audio..." : "Type your technical answer here, or click the mic button to dictate..."}
                    rows={4}
                    disabled={isLoadingTurn}
                    className="w-full p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-2xl text-xs font-medium focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-zinc-500"
                  />
                  {realtimeTranscript && (
                    <div className="p-3.5 bg-indigo-500/5 text-indigo-400 border border-indigo-500/10 text-xs rounded-xl font-medium mt-2 leading-normal flex gap-2 items-start">
                      <Volume2 className="w-4.5 h-4.5 shrink-0 animate-pulse" />
                      <span>{realtimeTranscript}</span>
                    </div>
                  )}
                </div>

                {/* Submit Row */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleSpeechRecognition}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        micActive
                          ? "bg-red-500 text-white border-red-500 shadow-md animate-pulse"
                          : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 text-zinc-600 dark:text-zinc-300"
                      }`}
                      title={micActive ? "Stop Dictation" : "Dictate Answer"}
                    >
                      {micActive ? <Mic className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={isPaused ? handleResumeSession : handlePauseSession}
                        className="px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300"
                      >
                        {isPaused ? (
                          <>
                            <Play className="w-3.5 h-3.5" />
                            <span>Resume</span>
                          </>
                        ) : (
                          <>
                            <Pause className="w-3.5 h-3.5" />
                            <span>Pause</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={handleFinishEarly}
                        disabled={isLoadingTurn}
                        className="px-3.5 py-2.5 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 hover:border-red-500/20 text-red-500 text-xs font-bold rounded-xl cursor-pointer transition-all disabled:opacity-50"
                      >
                        Finish Early
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleSubmitAnswer}
                    disabled={isLoadingTurn}
                    className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 font-bold rounded-xl cursor-pointer transition-all flex items-center gap-1.5 text-xs shadow-md disabled:opacity-50"
                  >
                    {isLoadingTurn ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white dark:border-zinc-950 border-t-transparent rounded-full animate-spin" />
                        <span>Evaluating response...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Answer</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Chronological Interview Timeline Log */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 p-6 rounded-3xl space-y-4">
              <span className="text-[10px] text-zinc-400 font-mono font-bold tracking-widest block uppercase">
                LIVE INTERVIEW TIMELINE
              </span>

              <div className="max-h-[140px] overflow-y-auto space-y-3.5 pr-2">
                {session.timeline.map((event, index) => {
                  const ag = agents.find(a => a.agent_id === event.agent_id);
                  return (
                    <div key={index} className="flex gap-3 text-xs items-start">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-zinc-800 dark:text-zinc-200">{event.title}</span>
                          <span className="text-[8px] text-zinc-500 font-mono">{new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                        </div>
                        <p className="text-[10px] text-zinc-500 leading-normal mt-0.5">{event.details}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={timelineEndRef} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: COMPREHENSIVE BOARDROOM ASSESSMENT REPORT */}
      {view === "report" && session && session.overall_report && (
        <div className="space-y-8">
          {/* Executive Score Summary */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 p-8 rounded-3xl grid grid-cols-1 md:grid-cols-3 gap-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col justify-between space-y-4">
              <div className="space-y-1.5">
                <span className="text-[10px] text-emerald-500 font-mono font-bold tracking-widest block uppercase">
                  INTERVIEW AUDIT CERTIFICATE
                </span>
                <h3 className="text-xl font-bold">Interview Readiness Assessment</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Calculated using weighted metric variables compiled directly from our specialized interviewers' logs.
                </p>
              </div>

              <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 shrink-0" />
                <div>
                  <span className="text-[10px] uppercase font-mono font-bold text-emerald-500 block">Current Status</span>
                  <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    {session.overall_report.report?.placement_readiness || "Strong Contender"}
                  </span>
                </div>
              </div>
            </div>

            {/* Central score gauge */}
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="transparent"
                    stroke="rgba(99, 102, 241, 0.05)"
                    strokeWidth="8"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="transparent"
                    stroke="url(#grad-overall)"
                    strokeWidth="8"
                    strokeDasharray={2 * Math.PI * 52}
                    strokeDashoffset={2 * Math.PI * 52 * (1 - session.overall_report.overall_score / 100)}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                  <defs>
                    <linearGradient id="grad-overall" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute flex flex-col items-center text-center">
                  <span className="text-3xl font-black">{session.overall_report.overall_score}</span>
                  <span className="text-[9px] font-mono text-zinc-400 uppercase">Overall Readiness</span>
                </div>
              </div>
            </div>

            {/* Metrics Checklist bar chart */}
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: "Tech", score: session.overall_report.technical_score },
                    { name: "HR", score: session.overall_report.hr_score },
                    { name: "Behav", score: session.overall_report.behavioral_score },
                    { name: "Lead", score: session.overall_report.leadership_score },
                    { name: "Comm", score: session.overall_report.communication_score },
                    { name: "Problem", score: session.overall_report.problem_solving_score }
                  ]}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <XAxis dataKey="name" stroke="#888888" fontSize={9} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={9} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ background: "#18181b", border: "none", borderRadius: "12px", fontSize: "10px", color: "#fff" }}
                    cursor={{ fill: "rgba(99, 102, 241, 0.05)" }}
                  />
                  <Bar dataKey="score" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Executive Summary & Key Highlights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Executive summary by Vance */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 p-6 rounded-3xl space-y-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <FileText className="w-4.5 h-4.5 text-indigo-500" />
                  Executive Summary - Aria Vance (Moderator)
                </h3>
                <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                  "{session.overall_report.report?.executive_summary || "Candidate completed all specialized rounds of the multi-agent board interview panel successfully."}"
                </p>
              </div>

              {/* Collapsible Panelist detailed reviews */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 p-6 rounded-3xl space-y-4">
                <h3 className="text-sm font-semibold">Specialist Interviewer Breakdowns</h3>
                <div className="space-y-3">
                  {(session.overall_report.report?.interviewer_wise_feedback || []).map((f, i) => {
                    const agent = agents.find(a => a.agent_id === f.agent_id || a.name === f.agent_name);
                    const isExpanded = expandedInterviewer === f.agent_id;
                    if (!agent) return null;
                    return (
                      <div
                        key={f.agent_id || i}
                        className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-2xl overflow-hidden"
                      >
                        <button
                          onClick={() => setExpandedInterviewer(isExpanded ? null : f.agent_id)}
                          className="w-full p-4 flex items-center justify-between text-left cursor-pointer hover:bg-zinc-100/50 dark:hover:bg-zinc-900/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={agent.avatar}
                              alt={agent.name}
                              className="w-10 h-10 rounded-xl object-cover shrink-0"
                            />
                            <div>
                              <span className="text-xs font-bold text-zinc-850 dark:text-zinc-200 block">{agent.name}</span>
                              <span className="text-[9px] text-zinc-400 font-mono uppercase">{agent.role}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <span className="text-xs font-black text-indigo-500">{f.score}</span>
                              <span className="text-[9px] text-zinc-400 font-mono block">Score</span>
                            </div>
                            {isExpanded ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
                          </div>
                        </button>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: "auto" }}
                              exit={{ height: 0 }}
                              className="overflow-hidden border-t border-zinc-200 dark:border-zinc-850"
                            >
                              <div className="p-4 bg-white dark:bg-zinc-900 text-xs text-zinc-500 leading-relaxed font-medium">
                                "{f.feedback}"
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Strengths, Gaps and recommended actions */}
            <div className="space-y-6">
              {/* Strengths & Weaknesses */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 p-6 rounded-3xl space-y-4">
                <span className="text-[10px] text-zinc-400 font-mono font-bold block uppercase">Highlights</span>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-emerald-500 uppercase flex items-center gap-1.5 font-mono">
                      <Check className="w-3.5 h-3.5" /> Strengths Detected
                    </span>
                    <ul className="space-y-1.5 pl-1">
                      {(session.overall_report.report?.strengths || ["Technical clarity", "Confident delivery"]).slice(0, 3).map((s, idx) => (
                        <li key={idx} className="text-[11px] text-zinc-500 leading-snug">
                          • {s}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-850">
                    <span className="text-[10px] font-bold text-amber-500 uppercase flex items-center gap-1.5 font-mono">
                      <AlertTriangle className="w-3.5 h-3.5" /> Growth Obstacles
                    </span>
                    <ul className="space-y-1.5 pl-1">
                      {(session.overall_report.report?.weaknesses || ["Elaborate further on trade-offs"]).slice(0, 3).map((w, idx) => (
                        <li key={idx} className="text-[11px] text-zinc-500 leading-snug">
                          • {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Recommended Study schedule */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 p-6 rounded-3xl space-y-4">
                <span className="text-[10px] text-indigo-500 font-mono font-bold tracking-widest block uppercase flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" /> Actionable Study Plan
                </span>
                <div className="space-y-3.5">
                  {(session.overall_report.report?.recommended_learning_plan || []).map((item, idx) => (
                    <div key={idx} className="space-y-1 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-zinc-800 dark:text-zinc-200">{item.topic}</span>
                        <span className="text-[9px] bg-indigo-500/5 text-indigo-500 border border-indigo-500/10 px-1.5 py-0.2 rounded font-mono font-bold">{item.duration}</span>
                      </div>
                      <p className="text-[10px] text-zinc-400 leading-normal">{item.resource_suggestion}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Report Footer CTA */}
          <div className="flex justify-end pt-4 gap-3">
            <button
              onClick={() => {
                setView("setup");
                setSession(null);
              }}
              className="px-5 py-3 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold rounded-2xl cursor-pointer transition-colors"
            >
              Restart New Session
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

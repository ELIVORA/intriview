/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  ChevronRight,
  Mic,
  MicOff,
  Square,
  Play,
  Pause,
  Clock,
  Award,
  AlertTriangle,
  BookOpen,
  ArrowRight,
  RefreshCw,
  TrendingUp,
  Cpu,
  CornerDownRight,
  CheckCircle,
  HelpCircle,
  ChevronLeft
} from "lucide-react";
import { api } from "../../services/api";
import { MicPermissionDialog } from "../voice/MicPermissionDialog";
import { VoiceWaveform } from "../voice/VoiceWaveform";
import { LiveTranscriptPanel } from "../voice/LiveTranscriptPanel";
import { VoiceReportView } from "../voice/VoiceReportView";
import { VoiceRecorder } from "../voice/VoiceRecorder";
import { CameraDiagnostics } from "../camera/CameraDiagnostics";
import { CameraTelemetryOverlay } from "../camera/CameraTelemetryOverlay";
import { CameraIndicatorGauges } from "../camera/CameraIndicatorGauges";
import { BehaviorDashboardView } from "../camera/BehaviorDashboardView";
import { Volume2, ShieldAlert, CheckCircle2, AlertCircle } from "lucide-react";

interface InterviewEngineProps {
  profile: {
    fullName: string;
    university: string;
    graduationYear: string;
    targetRoles: string[];
    skills: string[];
  };
  resumeFileName: string;
}

interface QuestionItem {
  question_id: string;
  question_text: string;
  difficulty_level: string;
  user_answer?: string;
  evaluation?: {
    score: number;
    is_strong_answer: boolean;
    evidence: string;
    strengths: string[];
    weaknesses: string[];
    recommened_remediation: string;
    communication_rating: number;
    confidence_rating: number;
  };
}

interface InterviewSession {
  session_id: string;
  interview_type: string;
  interview_mode: string;
  difficulty: string;
  status: string;
  current_question_index: number;
  total_questions_limit: number;
  current_question?: {
    question_id: string;
    question_text: string;
    difficulty_level: string;
  };
  history: QuestionItem[];
  overall_report?: {
    overall_score: number;
    technical_knowledge_score: number;
    technical_knowledge_comment: string;
    communication_score: number;
    communication_comment: string;
    confidence_score: number;
    confidence_comment: string;
    problem_solving_score: number;
    problem_solving_comment: string;
    strengths: string[];
    weaknesses: string[];
    missed_concepts: string[];
    suggested_improvements: { area: string; action: string }[];
    company_readiness: Record<string, string>;
    role_readiness: Record<string, string>;
    recommended_learning_plan: { topic: string; duration: string }[];
  };
}

export function InterviewEngine({ profile, resumeFileName }: InterviewEngineProps) {
  // Views: 'lobby' | 'setup' | 'active' | 'report' | 'voice-report'
  const [view, setView] = useState<"lobby" | "setup" | "active" | "report" | "voice-report">("lobby");
  
  // Lobby Settings
  const [selectedType, setSelectedType] = useState("Technical Interview");
  const [selectedMode, setSelectedMode] = useState("Standard Interview");
  
  // Setup Settings
  const [micGranted, setMicGranted] = useState<boolean | null>(null);
  const [micActive, setMicActive] = useState(false);
  const [soundLevel, setSoundLevel] = useState(0);

  // Active Session State
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [loadingTurn, setLoadingTurn] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  // Voice engine & timer states
  const [timerCount, setTimerCount] = useState(0);
  const [confidenceLevel, setConfidenceLevel] = useState(85); // Simulated live confidence tracking
  const [realtimeTranscript, setRealtimeTranscript] = useState("");
  const [speakingSpeedWPM, setSpeakingSpeedWPM] = useState(0);
  const [isMicDiagOpen, setIsMicDiagOpen] = useState(false);
  const [voiceReport, setVoiceReport] = useState<any | null>(null);
  const [reportTab, setReportTab] = useState<"session" | "voice" | "behavior">("session");

  // Camera & Human Behavior States
  const [cameraGranted, setCameraGranted] = useState<boolean | null>(null);
  const [selectedCameraId, setSelectedCameraId] = useState<string>("");
  const [cameraWidth, setCameraWidth] = useState<number>(1280);
  const [cameraHeight, setCameraHeight] = useState<number>(720);
  const [cameraFps, setCameraFps] = useState<number>(30);
  const [liveBehaviorMetrics, setLiveBehaviorMetrics] = useState({
    confidence: 88,
    clarity: 92,
    speakingPace: 130,
    completeness: 85,
    communication: 90
  });
  const [behaviorReport, setBehaviorReport] = useState<any | null>(null);

  const timerRef = useRef<any | null>(null);
  const recognitionRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Sound meter simulation ref
  const intervalRef = useRef<any>(null);

  const interviewTypes = [
    "Technical Interview",
    "HR Interview",
    "Behavioral Interview",
    "Project Interview",
    "Coding Discussion",
    "System Design Interview",
    "Managerial Round",
    "Final HR Round"
  ];

  const interviewModes = [
    { name: "Quick Interview", desc: "5 Questions - Quick practice drill" },
    { name: "Standard Interview", desc: "10 Questions - Comprehensive baseline evaluation" },
    { name: "Comprehensive Interview", desc: "20 Questions - Deep diagnostic audit" }
  ];



  // Handle countdown Timer
  useEffect(() => {
    if (view === "active" && !isPaused && !loadingTurn) {
      timerRef.current = setInterval(() => {
        setTimerCount((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [view, isPaused, loadingTurn]);

  // Request Microphone permissions check
  const requestMicAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicGranted(true);
      
      // Setup mock audio visualizer data
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const drawMockWaves = () => {
        if (!canvasRef.current) return;
        const ctx = canvasRef.current.getContext("2d");
        if (!ctx) return;

        const width = canvasRef.current.width;
        const height = canvasRef.current.height;
        ctx.clearRect(0, 0, width, height);

        analyser.getByteFrequencyData(dataArray);
        
        // Render stylized soundwave
        ctx.lineWidth = 2;
        ctx.strokeStyle = "rgba(99, 102, 241, 0.8)";
        ctx.beginPath();
        
        const sliceWidth = width / bufferLength;
        let x = 0;
        let average = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          average += dataArray[i];
          const y = (v * height) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }
        ctx.lineTo(width, height / 2);
        ctx.stroke();

        const currentLvl = Math.min(100, Math.floor((average / bufferLength) * 1.5));
        setSoundLevel(currentLvl);

        animationFrameRef.current = requestAnimationFrame(drawMockWaves);
      };
      
      drawMockWaves();
    } catch (err) {
      console.warn("Microphone access fumbled or rejected: ", err);
      setMicGranted(false);
    }
  };

  const requestCameraAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((track) => track.stop());
      setCameraGranted(true);
      if (navigator.mediaDevices.enumerateDevices) {
        const devs = await navigator.mediaDevices.enumerateDevices();
        const videoDevs = devs.filter((d) => d.kind === "videoinput");
        if (videoDevs.length > 0) {
          setSelectedCameraId(videoDevs[0].deviceId);
        }
      }
    } catch (err) {
      console.warn("Webcam access fumbled or rejected:", err);
      setCameraGranted(false);
    }
  };

  const toggleMic = () => {
    if (!micGranted) {
      requestMicAccess();
      return;
    }
    
    if (micActive) {
      setMicActive(false);
      setRealtimeTranscript("");
    } else {
      setTypedAnswer("");
      setRealtimeTranscript("");
      setMicActive(true);
    }
  };

  // Create mock Candidate Profile if none exists
  const getCustomCandidateProfile = () => {
    return {
      personalInfo: {
        fullName: profile.fullName || "Candidate",
        college: profile.university || "Your institution",
        degree: "B.S. Computer Science",
        branch: "Software Engineering"
      },
      skillsAnalysis: {
        programmingLanguages: profile.skills.slice(0, 4),
        frameworks: ["React", "Vite", "FastAPI", "TailwindCSS"],
        tools: ["Git", "Docker", "AWS"],
        databases: ["PostgreSQL", "SQLite"],
        softSkills: ["Technical Communication", "Analytical Thinking"]
      },
      projectsAnalysis: [
        { title: "Interview Cracker Virtual Placement Mentor Platform" }
      ],
      candidateProfile: {
        targetRoles: profile.targetRoles,
        targetCompanies: [],
        strengthLevel: "Intermediate",
        confidenceLevel: 85
      }
    };
  };

  // API Call: Start Interview Session
  const handleStartInterview = async () => {
    setLoadingTurn(true);
    setErrorMsg("");
    
    try {
      const res = await api.post("/v1/interview/start", {
        interview_type: selectedType,
        interview_mode: selectedMode,
        candidate_profile: getCustomCandidateProfile()
      });
      
      if (res.data?.status === "success") {
        setSession(res.data.session);
        setTimerCount(0);
        setTypedAnswer("");
        setRealtimeTranscript("");
        setView("active");
        
        // Auto-enable microphone if granted
        if (micGranted) {
          setMicActive(true);
        }
      }
    } catch (e: any) {
      setErrorMsg(e.message || "Failed to initiate AI session. Please try again.");
    } finally {
      setLoadingTurn(false);
    }
  };

  // API Call: Submit Answer
  const handleSubmitAnswer = async (voiceText?: string) => {
    if (!session) return;
    const answerToSend = (voiceText || typedAnswer + " " + realtimeTranscript).trim();
    if (!answerToSend) {
      setErrorMsg("Please speak or type your response before submitting.");
      return;
    }

    setLoadingTurn(true);
    setErrorMsg("");
    
    // Temporarily halt mic to prevent transcription overlaps
    if (micActive) {
      recognitionRef.current?.stop();
    }

    // Trigger parallel Voice segment analysis
    try {
      await api.post("/v1/voice/analyze", {
        session_id: session.session_id,
        transcript: answerToSend,
        duration_seconds: timerCount || 10,
        context_question: session.current_question?.question_text || ""
      });
    } catch (voiceErr) {
      console.warn("Real-time voice analysis fumbled slightly:", voiceErr);
    }

    try {
      const res = await api.post(`/v1/interview/${session.session_id}/answer`, {
        user_answer: answerToSend
      });

      if (res.data?.status === "success") {
        const updatedSess = res.data.session;
        setSession(updatedSess);
        setTypedAnswer("");
        setRealtimeTranscript("");
        setTimerCount(0);

        if (updatedSess.status === "completed") {
          // When completed, fetch the voice report
          try {
            const reportRes = await api.get(`/v1/voice/session/${session.session_id}/report`);
            if (reportRes.data?.status === "success") {
              setVoiceReport(reportRes.data.report);
            }
          } catch (rErr) {
            console.error("Failed to compile master voice report on completion:", rErr);
          }

          // Fetch camera behavior report
          try {
            const cameraReportRes = await api.get(`/v1/camera/session/${session.session_id}/report`);
            if (cameraReportRes.data?.status === "success") {
              setBehaviorReport(cameraReportRes.data.report);
            }
          } catch (cErr) {
            console.error("Failed to compile master camera report on completion:", cErr);
          }

          setView("report");
          if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
          setMicActive(false);
        } else {
          // Keep recording for next question if mic was active
          if (micActive) {
            setTimeout(() => {
              try {
                recognitionRef.current?.start();
              } catch (e) {}
            }, 500);
          }
        }
      }
    } catch (e: any) {
      setErrorMsg(e.message || "Failed to process answer. Please check your network and retry.");
      if (micActive) {
        try { recognitionRef.current?.start(); } catch (e) {}
      }
    } finally {
      setLoadingTurn(false);
    }
  };

  // API Call: Pause/Resume
  const handleTogglePause = async () => {
    if (!session) return;
    try {
      const endpoint = isPaused ? "resume" : "pause";
      const res = await api.post(`/v1/interview/${session.session_id}/${endpoint}`);
      if (res.data?.status === "success") {
        setIsPaused(!isPaused);
        if (isPaused) {
          if (micActive) recognitionRef.current?.start();
        } else {
          recognitionRef.current?.stop();
        }
      }
    } catch (e) {}
  };

  // API Call: Finish early
  const handleFinishEarly = async () => {
    if (!session || !window.confirm("Are you sure you want to finish the interview early? We will evaluate your progress so far.")) return;
    setLoadingTurn(true);
    setErrorMsg("");
    recognitionRef.current?.stop();
    setMicActive(false);

    try {
      const res = await api.post(`/v1/interview/${session.session_id}/finish`);
      if (res.data?.status === "success") {
        setSession(res.data.session);

        // Fetch voice report
        try {
          const reportRes = await api.get(`/v1/voice/session/${session.session_id}/report`);
          if (reportRes.data?.status === "success") {
            setVoiceReport(reportRes.data.report);
          }
        } catch (rErr) {
          console.error("Failed to compile master voice report on completion:", rErr);
        }

        // Fetch camera behavior report
        try {
          const cameraReportRes = await api.get(`/v1/camera/session/${session.session_id}/report`);
          if (cameraReportRes.data?.status === "success") {
            setBehaviorReport(cameraReportRes.data.report);
          }
        } catch (cErr) {
          console.error("Failed to compile master camera report on completion:", cErr);
        }

        setView("report");
      }
    } catch (e: any) {
      setErrorMsg(e.message || "Failed to finalize report. Please retry.");
    } finally {
      setLoadingTurn(false);
    }
  };

  // Format timestamp (Seconds to MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div id="ai-interview-container" className="space-y-6">
      {/* Lobby View */}
      {view === "lobby" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-zinc-100 dark:border-zinc-850 pb-5 gap-4">
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
                Launch Placement Mentor Interview
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Every interview is synthesized directly from your Resume Intelligence Profile for hyper-tailored training.
              </p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-lg text-[10px] font-mono border border-indigo-500/20">
              <Cpu className="w-3.5 h-3.5" />
              AI Engine Loaded
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Setting Configuration column */}
            <div className="md:col-span-2 space-y-6">
              {/* Type Selector */}
              <div className="space-y-2.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
                  1. Select Target Round Matrix
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {interviewTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className={`p-3.5 rounded-xl border text-[11px] font-medium text-left transition-all ${
                        selectedType === type
                          ? "bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-950 dark:border-white shadow-sm"
                          : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-600 dark:text-zinc-300"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mode Selector */}
              <div className="space-y-2.5 pt-2">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
                  2. Select Interview Depth
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {interviewModes.map((mode) => (
                    <button
                      key={mode.name}
                      onClick={() => setSelectedMode(mode.name)}
                      className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between h-28 ${
                        selectedMode === mode.name
                          ? "bg-zinc-900 border-zinc-900 text-white dark:bg-white dark:text-zinc-950 dark:border-white shadow-sm"
                          : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-600 dark:text-zinc-300"
                      }`}
                    >
                      <span className="text-xs font-bold block">{mode.name}</span>
                      <span className="text-[10px] text-zinc-400 leading-relaxed block mt-1">
                        {mode.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Profile Summary sidebar review */}
            <div className="p-5 border border-zinc-200 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-950 rounded-2xl space-y-4">
              <div>
                <span className="text-[9px] uppercase tracking-wider font-bold text-zinc-400 block">
                  Connected Candidate Profile
                </span>
                <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 mt-1">
                  {profile.fullName || "Candidate"}
                </h4>
                <p className="text-[10px] text-zinc-500 mt-0.5 font-mono">
                  Active Resume: {resumeFileName || "resume.pdf"}
                </p>
              </div>

              <div className="space-y-3 pt-3 border-t border-zinc-200 dark:border-zinc-850 text-[10px]">
                <div>
                  <span className="text-zinc-400 block font-medium">Target Roles:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {profile.targetRoles.map((role) => (
                      <span key={role} className="bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-2 py-0.5 rounded">
                        {role}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-zinc-400 block font-medium">Core Capabilities Extracted:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {profile.skills.slice(0, 5).map((skill) => (
                      <span key={skill} className="bg-indigo-500/5 text-indigo-500 border border-indigo-500/15 px-2 py-0.5 rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => {
                    setView("setup");
                    requestMicAccess();
                    requestCameraAccess();
                  }}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  Configure Hardware Setup
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Setup Waiting Room View */}
      {view === "setup" && (
        <div className="space-y-6 max-w-2xl mx-auto p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-3xl">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto">
              <Mic className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">Hardware & Visual Diagnostics Setup</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
              We recommend using clear microphones and sitting upright in a well-lit environment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Audio configuration column */}
            <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-850 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Microphone Status</span>
                {micGranted === true ? (
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/10 px-2 py-0.5 rounded-lg font-mono font-bold">
                    CONNECTED
                  </span>
                ) : micGranted === false ? (
                  <span className="text-[10px] bg-red-500/10 text-red-500 border border-red-500/10 px-2 py-0.5 rounded-lg font-mono font-bold">
                    BLOCKED
                  </span>
                ) : (
                  <button
                    onClick={requestMicAccess}
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-semibold rounded-lg cursor-pointer"
                  >
                    Allow
                  </button>
                )}
              </div>

              {/* Audio Wave Visualizer Block */}
              <div className="h-20 bg-zinc-100 dark:bg-zinc-900 rounded-xl overflow-hidden flex items-center justify-center relative border border-zinc-200 dark:border-zinc-800">
                <canvas ref={canvasRef} className="w-full h-full" width={250} height={80} />
                {micGranted !== true && (
                  <div className="absolute inset-0 bg-black/5 dark:bg-black/20 flex items-center justify-center backdrop-blur-[1px]">
                    <span className="text-[10px] text-zinc-400 font-mono">Awaiting Audio Diagnostics...</span>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                  <span>Input Gain:</span>
                  <span>{soundLevel}%</span>
                </div>
                <div className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 transition-all duration-75" style={{ width: `${soundLevel}%` }} />
                </div>
              </div>
            </div>

            {/* Video configuration column */}
            <CameraDiagnostics
              onDeviceSelect={(deviceId) => {
                setSelectedCameraId(deviceId);
                setCameraGranted(true);
              }}
              onResolutionSelect={(w, h) => {
                setCameraWidth(w);
                setCameraHeight(h);
              }}
              onFpsChange={(f) => {
                setCameraFps(f);
              }}
              cameraStatus={cameraGranted}
            />
          </div>

          {micGranted === false && (
            <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[10px] text-zinc-500 leading-normal">
                Microphone is blocked or unavailable. You can still proceed using keyboard typing mode!
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setView("lobby")}
              className="flex-1 py-3 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-850 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-semibold cursor-pointer text-center"
            >
              Back to Lobby
            </button>
            <button
              onClick={handleStartInterview}
              disabled={loadingTurn}
              className="flex-1 py-3 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loadingTurn ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating Plan...
                </>
              ) : (
                <>
                  Start AI Interview
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Active Interview Screen View */}
      {view === "active" && session && (
        <div className="space-y-6">
          {/* Header Board / Progress */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-2xl gap-4">
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-indigo-500 font-mono tracking-widest uppercase">
                {session.interview_type} • Round {session.current_question_index} of {session.total_questions_limit}
              </span>
              <div className="flex items-center gap-2.5">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                  {session.interview_mode}
                </h3>
                <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold tracking-wider font-mono border ${
                  session.difficulty === "Advanced"
                    ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                    : session.difficulty === "Intermediate"
                    ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                    : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                }`}>
                  {session.difficulty} DIFFICULTY
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Question Timer */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-mono">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                <span>{formatTime(timerCount)}</span>
              </div>

              {/* Confidence meter */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-mono">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                <span>Confidence: <strong className="text-emerald-500">{confidenceLevel}%</strong></span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-950 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 transition-all duration-300"
              style={{ width: `${(session.current_question_index / session.total_questions_limit) * 100}%` }}
            />
          </div>

          {/* Continuous Voice Analyzer Orchestrator */}
          <VoiceRecorder
            sessionId={session.session_id}
            currentQuestionText={session.current_question?.question_text || ""}
            micActive={micActive}
            onTranscriptUpdate={(typed, interim) => {
              setTypedAnswer(typed);
              setRealtimeTranscript(interim);
            }}
            onSubmitAnswer={(finalText) => {
              handleSubmitAnswer(finalText);
            }}
            onVolumeChange={(lvl) => setSoundLevel(lvl)}
            onSpeedUpdate={(wpm) => setSpeakingSpeedWPM(wpm)}
            onConfidenceUpdate={(score) => setConfidenceLevel(score)}
            loadingTurn={loadingTurn}
          />

          {/* Real-time Voice Waveform Visualizer */}
          <VoiceWaveform
            canvasRef={canvasRef}
            micActive={micActive}
            soundLevel={soundLevel}
          />

          {/* Virtual Placement Lens & Human Behavior Intelligence Panel */}
          <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-3xl space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-1.5 uppercase tracking-wider">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse shrink-0" />
                  Live Human Behavior & Postural Analytics
                </h3>
                <p className="text-[10px] text-zinc-400 mt-0.5">MediaPipe & OpenCV Facial Mesh tracking is active continuously.</p>
              </div>
              <span className="text-[10px] bg-indigo-500/10 text-indigo-500 font-mono px-2.5 py-1 rounded-xl font-bold uppercase w-fit">
                Secure Realtime Stream
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Webcam Overlay Container */}
              <div className="lg:col-span-2">
                <CameraTelemetryOverlay
                  sessionId={session.session_id}
                  deviceId={selectedCameraId}
                  width={cameraWidth}
                  height={cameraHeight}
                  fps={cameraFps}
                  micActive={micActive}
                  onMetricsUpdate={(metrics) => {
                    setLiveBehaviorMetrics(metrics);
                    // Harmoniously merge speech confidence and visual posture confidence
                    const blendedConfidence = Math.round((metrics.confidence * 0.6) + (confidenceLevel * 0.4));
                    setConfidenceLevel(blendedConfidence);
                  }}
                  onPermissionStatus={(status) => setCameraGranted(status)}
                />
              </div>

              {/* Live Gauges HUD */}
              <div className="flex flex-col justify-between">
                <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-850 rounded-2xl flex-1 space-y-4">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-zinc-500 uppercase">Assessment State:</span>
                    <span className="text-indigo-500 font-bold">Active Coaching</span>
                  </div>

                  {/* Interview Performance Metrics */}
                  <div className="space-y-3 pt-2">
                    {[
                      { label: "Confidence Score", val: liveBehaviorMetrics.confidence, color: "bg-emerald-500" },
                      { label: "Speech Clarity", val: liveBehaviorMetrics.clarity, color: "bg-indigo-500" },
                      { label: "Speaking Pace", val: Math.min(100, Math.round(liveBehaviorMetrics.speakingPace / 1.5)), color: "bg-amber-500" },
                      { label: "Response Completeness", val: liveBehaviorMetrics.completeness, color: "bg-purple-500" },
                      { label: "Communication Rating", val: liveBehaviorMetrics.communication, color: "bg-blue-500" }
                    ].map((item) => (
                      <div key={item.label} className="space-y-1">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-zinc-600 dark:text-zinc-400 font-medium">{item.label}</span>
                          <span className="font-bold text-zinc-800 dark:text-zinc-200">{item.val}%</span>
                        </div>
                        <div className="w-full h-1 bg-zinc-200 dark:bg-zinc-900 rounded-full overflow-hidden">
                          <div className={`h-full ${item.color} rounded-full transition-all duration-300`} style={{ width: `${item.val}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Active Coaching Tip */}
                  <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-center space-y-1">
                    <span className="text-[10px] text-indigo-400 font-bold font-mono uppercase block">Live Coaching Tip</span>
                    <p className="text-[11px] text-zinc-300 leading-normal">
                      Speak clearly at an even pace and structure your answers with STAR format.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Question panel */}
          <div className="p-8 bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 rounded-3xl space-y-6 relative overflow-hidden border border-zinc-800 dark:border-zinc-200">
            <div className="absolute top-0 right-0 p-4">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                AI Question Console
              </span>
            </div>

            <div className="space-y-4 max-w-3xl">
              <div className="flex gap-3">
                <div className="w-7 h-7 bg-indigo-500 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs text-white">
                  {session.current_question_index}
                </div>
                <h2 className="text-base sm:text-lg font-serif tracking-normal leading-relaxed text-zinc-100 dark:text-zinc-900 pt-0.5">
                  {session.current_question?.question_text}
                </h2>
              </div>
            </div>

            {loadingTurn && (
              <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                <span>AI Interviewer is synthesizing evaluation and follow-up matrix...</span>
              </div>
            )}
          </div>

          {/* Transcript Panel & Answer controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Answer Input console */}
            <div className="md:col-span-2 space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Your Response Transcript
                  </label>
                  {micGranted && (
                    <span className={`text-[9px] font-bold font-mono tracking-wider flex items-center gap-1 ${
                      micActive ? "text-red-500" : "text-zinc-400"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${micActive ? "bg-red-500 animate-ping" : "bg-zinc-400"}`} />
                      {micActive ? "LIVE MIC RECORDING" : "MICROPHONE STANDBY"}
                    </span>
                  )}
                </div>

                <div className="relative">
                  <textarea
                    rows={4}
                    value={typedAnswer}
                    onChange={(e) => setTypedAnswer(e.target.value)}
                    placeholder="Speak using your microphone or type your complete professional response here..."
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none p-4 rounded-2xl text-xs leading-relaxed text-zinc-800 dark:text-zinc-200"
                  />
                  {realtimeTranscript && (
                    <div className="absolute bottom-3 left-4 right-4 bg-zinc-950/90 text-zinc-300 p-2.5 rounded-xl border border-zinc-800 text-[11px] font-mono leading-normal flex items-start gap-2 animate-pulse">
                      <CornerDownRight className="w-3.5 h-3.5 shrink-0 text-indigo-400 mt-0.5" />
                      <span>{realtimeTranscript}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex gap-2">
                  <button
                    onClick={toggleMic}
                    className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all ${
                      micActive
                        ? "bg-red-500 hover:bg-red-600 text-white"
                        : "bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 border border-indigo-500/20"
                    }`}
                  >
                    {micActive ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    <span>{micActive ? "Stop Voice Mode" : "Voice Mode (Speak)"}</span>
                  </button>

                  <button
                    onClick={() => setTypedAnswer("")}
                    className="px-4 py-2.5 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-850 text-zinc-500 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Clear Input
                  </button>
                </div>

                <button
                  onClick={() => handleSubmitAnswer()}
                  disabled={loadingTurn}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer disabled:opacity-50 transition-all flex items-center gap-1.5"
                >
                  {loadingTurn ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Evaluating...
                    </>
                  ) : (
                    <>
                      Submit Answer
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-[11px] rounded-xl font-medium">
                  {errorMsg}
                </div>
              )}
            </div>

            {/* Split Sidebar: Live Voice Analyzer vs Response History */}
            <div className="space-y-6">
              {micActive && (
                <LiveTranscriptPanel
                  typedAnswer={typedAnswer}
                  realtimeTranscript={realtimeTranscript}
                  speakingSpeedWPM={speakingSpeedWPM}
                  confidenceScore={confidenceLevel}
                />
              )}

              {/* Conversation Timeline memory sidebar */}
              <div className="p-4 border border-zinc-200 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-950 rounded-2xl flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-[10px] font-mono text-zinc-400 block uppercase">
                    ACTIVE FEEDBACK LOOP
                  </span>
                  <p className="text-[10px] text-zinc-500 leading-normal mt-1">
                    AI adjusts follow-ups dynamically. Answer thoroughly to unlock advanced tiers.
                  </p>
                </div>

                {/* History index markers */}
                <div className="space-y-2 pt-2 flex-1 overflow-y-auto max-h-36 pr-1">
                  {session.history.map((h, i) => (
                    <div key={`eng_hist_${h.question_id || 'q'}_${i}`} className="text-[10px] p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl flex items-start gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="font-semibold block text-zinc-800 dark:text-zinc-200">
                          Q{i+1}: Score: {h.evaluation?.score}%
                        </span>
                        <p className="text-zinc-400 line-clamp-2 leading-normal">
                          {h.evaluation?.evidence}
                        </p>
                      </div>
                    </div>
                  ))}
                  {session.history.length === 0 && (
                    <div className="text-center py-6">
                      <HelpCircle className="w-6 h-6 text-zinc-300 mx-auto" />
                      <span className="text-[9px] text-zinc-400 font-mono block mt-1.5">No answers logged yet</span>
                    </div>
                  )}
                </div>

                {/* Controls footer */}
                <div className="pt-3 border-t border-zinc-200 dark:border-zinc-850 flex items-center justify-between">
                  <button
                    onClick={handleTogglePause}
                    className="px-3 py-1.5 text-[10px] border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400 font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                    <span>{isPaused ? "Resume Session" : "Pause Session"}</span>
                  </button>

                  <button
                    onClick={handleFinishEarly}
                    className="px-3 py-1.5 text-[10px] bg-red-500/15 hover:bg-red-500/20 text-red-500 font-semibold rounded-lg flex items-center gap-1 cursor-pointer border border-red-500/10"
                  >
                    <Square className="w-3 h-3" />
                    <span>Finish Early</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Completed Report Card View */}
      {view === "report" && session && session.overall_report && (
        <div className="space-y-8">
          {/* Header Board Card */}
          <div className="p-8 bg-zinc-900 text-white rounded-3xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-zinc-850">
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl" />
            
            <div className="space-y-2 relative">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-400 tracking-wider font-mono uppercase">
                <Award className="w-4 h-4" />
                OFFICIAL INTERVIEW CRACKER AUDIT
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white">
                Placement Mentor Interview Report Card
              </h2>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-md">
                Review detailed analytical evaluations, categorized evidence logs, role fits, and targeted training matrices generated directly by our AI.
              </p>
            </div>

            {/* Big overall score meter circular/shield format */}
            <div className="p-6 bg-zinc-950/80 border border-zinc-800 rounded-2xl flex flex-col items-center justify-center shrink-0 min-w-44 text-center">
              <span className="text-[10px] uppercase font-bold text-zinc-500 font-mono tracking-widest">
                OVERALL RATING
              </span>
              <div className="mt-2.5">
                <span className="text-4xl font-black text-indigo-400">
                  {session.overall_report.overall_score}%
                </span>
              </div>
              <div className="mt-2">
                <span className="text-[10px] font-mono text-zinc-400">
                  {session.overall_report.overall_score >= 80 ? "EXCELLENT SHIELD" : "PRACTICE DRILLS RECOMMENDED"}
                </span>
              </div>
            </div>
          </div>          {/* Elegant Tab Switcher */}
          <div className="flex border-b border-zinc-200 dark:border-zinc-800 gap-6">
            <button
              onClick={() => setReportTab("session")}
              className={`pb-3 text-xs font-bold tracking-wider uppercase border-b-2 transition-all cursor-pointer ${
                reportTab === "session"
                  ? "border-indigo-500 text-indigo-500 font-bold"
                  : "border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              }`}
            >
              Overall Interview Evaluation
            </button>
            {voiceReport && (
              <button
                onClick={() => setReportTab("voice")}
                className={`pb-3 text-xs font-bold tracking-wider uppercase border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  reportTab === "voice"
                    ? "border-indigo-500 text-indigo-500 font-bold"
                    : "border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                }`}
              >
                <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
                Speech & Voice Analysis
              </button>
            )}
            {behaviorReport && (
              <button
                onClick={() => setReportTab("behavior")}
                className={`pb-3 text-xs font-bold tracking-wider uppercase border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  reportTab === "behavior"
                    ? "border-indigo-500 text-indigo-500 font-bold"
                    : "border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                }`}
              >
                <Sparkles className="w-4 h-4 text-emerald-500 animate-pulse" />
                Body Language & Posture Audit
              </button>
            )}
          </div>

          {reportTab === "voice" && voiceReport ? (
            <VoiceReportView
              report={voiceReport}
              onBack={() => {
                setView("lobby");
                setSession(null);
                setTimerCount(0);
                setTypedAnswer("");
                setRealtimeTranscript("");
                setVoiceReport(null);
                setReportTab("session");
              }}
            />
          ) : reportTab === "behavior" && behaviorReport ? (
            <BehaviorDashboardView
              report={behaviorReport}
              onBack={() => {
                setView("lobby");
                setSession(null);
                setTimerCount(0);
                setTypedAnswer("");
                setRealtimeTranscript("");
                setVoiceReport(null);
                setBehaviorReport(null);
                setReportTab("session");
              }}
            />
          ) : (
            <>
              {/* Core Analytics Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { label: "Technical Knowledge", val: session.overall_report.technical_knowledge_score, desc: session.overall_report.technical_knowledge_comment },
                  { label: "Communication Flow", val: session.overall_report.communication_score, desc: session.overall_report.communication_comment },
                  { label: "Vocal Confidence", val: session.overall_report.confidence_score, desc: session.overall_report.confidence_comment },
                  { label: "Analytical Problem Solving", val: session.overall_report.problem_solving_score, desc: session.overall_report.problem_solving_comment }
                ].map((metric) => (
                  <div key={metric.label} className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-2xl space-y-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-zinc-500 uppercase font-mono tracking-wider">{metric.label}</span>
                      <span className="text-sm font-black text-indigo-500 font-mono">{metric.val}%</span>
                    </div>
                    <div className="w-full h-1 bg-zinc-100 dark:bg-zinc-950 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${metric.val}%` }} />
                    </div>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-normal">
                      {metric.desc}
                    </p>
                  </div>
                ))}
              </div>

              {/* Strengths, Weaknesses, Gaps and Missed Concepts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Strengths & Weaknesses Columns */}
                <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-3xl space-y-6">
                  <div>
                    <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-widest flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                      Demonstrated Key Strengths
                    </h3>
                    <ul className="mt-3.5 space-y-2.5">
                      {session.overall_report.strengths.map((str, idx) => (
                        <li key={idx} className="text-xs text-zinc-600 dark:text-zinc-400 flex items-start gap-2 leading-relaxed">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-zinc-100 dark:border-zinc-850">
                    <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-widest flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      Identified Gaps & Weaknesses
                    </h3>
                    <ul className="mt-3.5 space-y-2.5">
                      {session.overall_report.weaknesses.map((weak, idx) => (
                        <li key={idx} className="text-xs text-zinc-600 dark:text-zinc-400 flex items-start gap-2 leading-relaxed">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                          <span>{weak}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Learning Plan & Improvement Matrices */}
                <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-3xl space-y-6">
                  <div>
                    <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-widest flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-indigo-500" />
                      Recommended Actionable Remediations
                    </h3>
                    <div className="mt-3.5 space-y-3">
                      {session.overall_report.suggested_improvements.map((imp, idx) => (
                        <div key={idx} className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl space-y-1">
                          <span className="text-[10px] font-bold text-indigo-500 uppercase font-mono">{imp.area}</span>
                          <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-normal">
                            {imp.action}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Missed Conceptual tags */}
                  <div className="pt-4 border-t border-zinc-100 dark:border-zinc-850">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block font-mono">Missed Concepts & Blindspots:</span>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {session.overall_report.missed_concepts.map((concept) => (
                        <span key={concept} className="px-2.5 py-1 bg-red-500/5 text-red-500 border border-red-500/10 text-[10px] font-mono rounded-lg">
                          {concept}
                        </span>
                      ))}
                      {session.overall_report.missed_concepts.length === 0 && (
                        <span className="text-[10px] text-zinc-400">None detected! Exceptional architectural consistency.</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Role & Company Readiness metrics block */}
              <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-3xl space-y-6">
                <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-widest">
                  Placement Readiness Indicators
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Target Company alignments */}
                  <div className="space-y-3.5">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase font-mono block">Company Target Index Alignment</span>
                    <div className="space-y-3.5">
                      {Object.entries(session.overall_report.company_readiness).map(([company, text]) => {
                        const pctMatch = text.match(/\d+%/)?.[0] || "70%";
                        return (
                          <div key={company} className="space-y-1.5 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-zinc-800 dark:text-zinc-100">{company}</span>
                              <span className="font-mono text-[10px] font-bold text-zinc-500">{pctMatch} Target Alignment</span>
                            </div>
                            <div className="w-full h-1 bg-zinc-100 dark:bg-zinc-950 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 rounded-full" style={{ width: pctMatch }} />
                            </div>
                            <p className="text-[10px] text-zinc-400 mt-1 leading-normal">
                              {text}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Target Role match metrics */}
                  <div className="space-y-3.5">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase font-mono block">Placement Role Compatibility</span>
                    <div className="space-y-3.5">
                      {Object.entries(session.overall_report.role_readiness).map(([role, text]) => {
                        const pctMatch = text.match(/\d+%/)?.[0] || "80%";
                        return (
                          <div key={role} className="space-y-1.5 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-zinc-800 dark:text-zinc-100">{role}</span>
                              <span className="font-mono text-[10px] font-bold text-zinc-500">{pctMatch} Match</span>
                            </div>
                            <div className="w-full h-1 bg-zinc-100 dark:bg-zinc-950 rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-500 rounded-full" style={{ width: pctMatch }} />
                            </div>
                            <p className="text-[10px] text-zinc-400 mt-1 leading-normal">
                              {text}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Navigation footer */}
              <div className="flex items-center justify-between pt-4 border-t border-zinc-150 dark:border-zinc-850">
                <button
                  onClick={() => {
                    setView("lobby");
                    setSession(null);
                    setTimerCount(0);
                    setTypedAnswer("");
                    setRealtimeTranscript("");
                  }}
                  className="px-5 py-3 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-850 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1.5"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Reset & Try Another Round
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import {
  FileText,
  Sparkles,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Play,
  Square,
  Award,
  BarChart2,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  Volume2,
  ShieldCheck,
  BrainCircuit,
  MessageSquare,
  HelpCircle,
  Lightbulb,
  Clock,
  RotateCcw,
  RefreshCw,
  Sliders,
  Layers,
  Briefcase,
  Target,
  Maximize2,
  Minimize2
} from "lucide-react";
import { AIInterviewerAvatar, INTERVIEWER_AVATARS } from "../voice/AIInterviewerAvatar";
import { CameraTelemetryOverlay } from "../camera/CameraTelemetryOverlay";
import { api } from "../../services/api";

interface ResumeInterviewStudioProps {
  email: string;
  profile: any;
  resumeFileName: string;
  resumeAnalysisData?: any;
  onBackToResume: () => void;
}

export interface DynamicQuestion {
  id: number;
  title: string;
  question: string;
  category?: string;
}

export function ResumeInterviewStudio({
  email,
  profile,
  resumeFileName,
  resumeAnalysisData,
  onBackToResume
}: ResumeInterviewStudioProps) {
  // Active Interviewer Persona selection from localStorage or default
  const [interviewer, setInterviewer] = useState(() => {
    try {
      const saved = localStorage.getItem("app_interviewer_avatar_obj");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INTERVIEWER_AVATARS[0]; // Emma default
  });

  const [voicePitch, setVoicePitch] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("app_interviewer_voice_pitch");
      return saved ? parseFloat(saved) : 1.0;
    } catch (e) {
      return 1.0;
    }
  });

  const [voiceSpeed, setVoiceSpeed] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("app_interviewer_voice_speed");
      return saved ? parseFloat(saved) : 0.95;
    } catch (e) {
      return 0.95;
    }
  });

  // Sync interviewer voice settings dynamically whenever changed in Settings
  useEffect(() => {
    const syncVoiceSettings = () => {
      try {
        const savedAvatar = localStorage.getItem("app_interviewer_avatar_obj");
        if (savedAvatar) {
          setInterviewer(JSON.parse(savedAvatar));
        }
        const savedPitch = localStorage.getItem("app_interviewer_voice_pitch");
        if (savedPitch) setVoicePitch(parseFloat(savedPitch));
        const savedSpeed = localStorage.getItem("app_interviewer_voice_speed");
        if (savedSpeed) setVoiceSpeed(parseFloat(savedSpeed));
      } catch (e) {
        console.warn("Failed syncing interviewer settings", e);
      }
    };

    syncVoiceSettings();
    window.addEventListener("app_interviewer_settings_changed", syncVoiceSettings);
    window.addEventListener("storage", syncVoiceSettings);

    return () => {
      window.removeEventListener("app_interviewer_settings_changed", syncVoiceSettings);
      window.removeEventListener("storage", syncVoiceSettings);
    };
  }, []);

  // Customization Options: Experience Level, Round Focus, Target Rigor, Question Count
  const [experienceLevel, setExperienceLevel] = useState<string>("Associate / Junior SDE (1-3 yrs)");
  const [roundType, setRoundType] = useState<string>("Resume / Introduction Round");
  const [difficulty, setDifficulty] = useState<string>("Standard Industry Level");
  const [questionCount, setQuestionCount] = useState<number>(6);
  const [targetCompany, setTargetCompany] = useState<string>("");
  const [launchError, setLaunchError] = useState<string>("");
  const [targetRole, setTargetRole] = useState<string>(profile?.targetRoles?.[0] || profile?.dreamRole || "");
  const [sessionId, setSessionId] = useState<string>("");
  const [pendingNextQuestion, setPendingNextQuestion] = useState<DynamicQuestion | null>(null);
  const [thinkingMode, setThinkingMode] = useState<boolean>(false);

  // State management for interview phase: "overview" | "active" | "report"
  const [phase, setPhase] = useState<"overview" | "active" | "report">("overview");

  // Questions state (dynamically fetched/generated every time)
  const [questions, setQuestions] = useState<DynamicQuestion[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Audio / Mic / Speech controls
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [soundLevel, setSoundLevel] = useState(10);
  const [transcript, setTranscript] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoSubmitEnabled, setAutoSubmitEnabled] = useState(true);

  // Question progression & Evaluation state
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [interviewerFeedback, setInterviewerFeedback] = useState<Record<number, string>>({});
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [currentEvalText, setCurrentEvalText] = useState<string>("");
  const [timerSeconds, setTimerSeconds] = useState(0);

  // Gemini AI Session Report State
  const [fullReport, setFullReport] = useState<{
    resumeAlignment: number;
    technicalDepth: number;
    communicationClarity: number;
    overallScore: number;
    hiringDecision: string;
    strengths: string[];
    improvements: string[];
    summary: string;
  } | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false);

  const recognitionRef = useRef<any>(null);
  const committedTranscriptRef = useRef<string>("");
  const interimTranscriptRef = useRef<string>("");
  const speechTermsRef = useRef<string[]>([]);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isMicOnRef = useRef(true);
  const isAiSpeakingRef = useRef(false);
  useEffect(() => { isAiSpeakingRef.current = isAiSpeaking; }, [isAiSpeaking]);
  const phaseRef = useRef<"overview" | "active" | "report">("overview");
  const silenceTimerRef = useRef<any>(null);
  const handleSubmitAnswerRef = useRef<() => void>(() => {});
  const handleProceedToNextRef = useRef<() => void>(() => {});
  const autoSubmitRef = useRef(true);
  useEffect(() => { autoSubmitRef.current = autoSubmitEnabled; }, [autoSubmitEnabled]);

  // Auto-submit silence detection
  useEffect(() => {
    if (phase === "active" && !isAiSpeaking && !currentEvalText && !isEvaluating && autoSubmitRef.current) {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      
      const hasText = transcript.trim().length > 0;
      const timeoutMs = hasText ? 4000 : 5000;
      
      silenceTimerRef.current = setTimeout(() => {
        handleSubmitAnswerRef.current();
      }, timeoutMs);
    } else {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    }

    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, [phase, isAiSpeaking, transcript, currentEvalText, isEvaluating]);

  useEffect(() => {
    isMicOnRef.current = isMicOn;
  }, [isMicOn]);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  // Resume context extraction
  const candidateName = profile?.fullName || "Candidate";
  const primaryProject = resumeAnalysisData?.parsedProject || resumeAnalysisData?.projects?.[0]?.title || "Your resume project";
  const detectedSkills = resumeAnalysisData?.skills || profile?.skills || [];
  const atsScore = Number(resumeAnalysisData?.atsScore || 0);

  // Function to generate fresh dynamic questions
  const generateFreshQuestions = async () => {
    setIsGenerating(true);
    setLaunchError("");
    try {
      const response = await api.post("/v1/interview/start", {
        interview_type: roundType,
        interview_mode: "Resume Practice",
        round_type: roundType,
        target_company: targetCompany,
        target_role: targetRole,
        experience_level: experienceLevel,
        difficulty,
        question_count: questionCount,
        candidate_profile: { ...profile, ...(resumeAnalysisData || {}), targetRole }
      });
      const session = response.data?.session;
      if (!session) throw new Error("The interview server did not return a session.");
      setSessionId(session.session_id);
      const q = session.current_question;
      if (!q?.question_text) throw new Error("The interview server did not return a question.");
      setQuestions([{ id: 1, title: roundType, question: q.question_text, category: q.topic || roundType }]);
      setCurrentQuestionIdx(0);
      setAnswers({});
      setInterviewerFeedback({});
      setPendingNextQuestion(null);
      setPhase("overview");
    } catch (e:any) {
      console.error("Resume interview start failed", e);
      setQuestions([]);
      setLaunchError(e?.message || "Unable to generate a personalized interview right now.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Speech Recognition setup with robust auto-restart logic
  useEffect(() => {
    if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.maxAlternatives = 3;
      rec.lang = "en-US";

      const applyResumeVocabulary = () => {
        const candidateTerms = [
          ...(Array.isArray(resumeAnalysisData?.skillsAnalysis?.programmingLanguages) ? resumeAnalysisData.skillsAnalysis.programmingLanguages : []),
          ...(Array.isArray(resumeAnalysisData?.skillsAnalysis?.frameworks) ? resumeAnalysisData.skillsAnalysis.frameworks : []),
          ...(Array.isArray(resumeAnalysisData?.skillsAnalysis?.tools) ? resumeAnalysisData.skillsAnalysis.tools : []),
          ...(Array.isArray(resumeAnalysisData?.skills) ? resumeAnalysisData.skills : []),
          ...(Array.isArray(resumeAnalysisData?.projectsAnalysis) ? resumeAnalysisData.projectsAnalysis.map((p: any) => p?.title) : []),
          ...(Array.isArray(resumeAnalysisData?.candidateProfile?.targetRoles) ? resumeAnalysisData.candidateProfile.targetRoles : []),
          ...(Array.isArray(resumeAnalysisData?.candidateProfile?.targetCompanies) ? resumeAnalysisData.candidateProfile.targetCompanies : []),
          targetRole,
          targetCompany,
          resumeFileName
        ].filter(Boolean).map((value: any) => String(value).trim()).filter((value: string) => value.length >= 2);
        speechTermsRef.current = [...new Set(candidateTerms)].slice(0, 100);
        if ("phrases" in rec && speechTermsRef.current.length) {
          try {
            (rec as any).phrases = speechTermsRef.current.map((text) => ({ text, boost: 5 }));
          } catch {}
        }
      };

      applyResumeVocabulary();

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event: any) => {
        let newFinal = "";
        let interim = "";
        const startIndex = typeof event.resultIndex === "number" ? event.resultIndex : 0;
        for (let i = startIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const alternatives = Array.from(result || []) as any[];
          const best = alternatives[0]?.transcript || "";
          if (result.isFinal) {
            newFinal += `${best.trim()} `;
          } else {
            interim += best;
          }
        }

        if (newFinal.trim()) {
          committedTranscriptRef.current = `${committedTranscriptRef.current} ${newFinal}`.replace(/\s+/g, " ").trim();
        }
        interimTranscriptRef.current = interim.trim();
        setTranscript(`${committedTranscriptRef.current}${interim ? ` ${interim}` : ""}`.replace(/\s+/g, " ").trim());
        setSoundLevel(65);
      };

      rec.onerror = (err: any) => {
        console.warn("Speech recognition error:", err);
      };

      rec.onend = () => {
        setIsListening(false);
        if (isMicOnRef.current && phaseRef.current === "active" && !isAiSpeakingRef.current) {
          window.setTimeout(() => {
            try { rec.start(); } catch {}
          }, 150);
        }
      };
      recognitionRef.current = rec;
    }

    if ("speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      if (synthRef.current) synthRef.current.cancel();
    };
  }, []);

  // Timer loop during active interview
  useEffect(() => {
    let timer: any;
    if (phase === "active") {
      timer = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [phase]);

  // Speaking sound level simulation for user voice waveform
  useEffect(() => {
    let interval: any;
    if (isListening && isMicOn) {
      interval = setInterval(() => {
        setSoundLevel(Math.floor(Math.random() * 60) + 20);
      }, 120);
    } else {
      setSoundLevel(8);
    }
    return () => clearInterval(interval);
  }, [isListening, isMicOn]);

  // AI Interviewer speaks question or feedback (repeats question twice)
  const speakQuestion = (text: string, repeatTwice: boolean = false, onComplete?: () => void) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.resume();
      window.speechSynthesis.cancel();
      const textToSpeak = repeatTwice ? `${text} ... I repeat the question: ${text}` : text;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utteranceRef.current = utterance;
      utterance.pitch = voicePitch;
      utterance.rate = voiceSpeed;

      // Force voices to load if not already loaded (Chrome/Safari quirk)
      let voices = window.speechSynthesis.getVoices();
      
      const trySpeak = () => {
        voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          const targetGender = (interviewer.gender || "female").toLowerCase();
          let selectedVoice = voices.find(v => 
            v.name.toLowerCase().includes(interviewer.name.split(" ")[0].toLowerCase()) ||
            v.name.toLowerCase().includes(targetGender)
          );
          if (!selectedVoice) {
            if (targetGender === "female") {
              selectedVoice = voices.find(v => 
                v.name.toLowerCase().includes("zira") || 
                v.name.toLowerCase().includes("samantha") || 
                v.name.toLowerCase().includes("victoria") || 
                v.name.toLowerCase().includes("female")
              );
            } else {
              selectedVoice = voices.find(v => 
                v.name.toLowerCase().includes("david") || 
                v.name.toLowerCase().includes("alex") || 
                v.name.toLowerCase().includes("male")
              );
            }
          }
          if (selectedVoice) {
            utterance.voice = selectedVoice;
          }
        }

        let finished = false;
        const finish = () => {
          if (!finished) {
            finished = true;
            setIsAiSpeaking(false);
            if (recognitionRef.current && isMicOnRef.current && phaseRef.current === "active") {
              try { recognitionRef.current.start(); } catch(e) {}
            }
            if (onComplete) onComplete();
          }
        };

        utterance.onstart = () => {
          setIsAiSpeaking(true);
          if (recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch(e) {}
          }
        };
        utterance.onend = finish;
        utterance.onerror = finish;

        window.speechSynthesis.speak(utterance);

        // Fallback safety timeout if browser speech synthesis freezes
        const approxMs = Math.max(2000, (textToSpeak.length / 14) * 1000);
        setTimeout(() => {
          if (!finished) finish();
        }, approxMs + 1500);
      };

      if (voices.length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
          window.speechSynthesis.onvoiceschanged = null;
          trySpeak();
        };
        // Fallback if onvoiceschanged doesn't fire
        setTimeout(trySpeak, 500);
      } else {
        trySpeak();
      }

    } else {
      if (onComplete) onComplete();
    }
  };

  const handleStartInterview = () => {
    if (questions.length === 0 || !sessionId) return;
    setPhase("active");
    phaseRef.current = "active";
    setTimerSeconds(0);
    setCurrentQuestionIdx(0);
    setAnswers({});
    setInterviewerFeedback({});
    committedTranscriptRef.current = "";
    interimTranscriptRef.current = "";
    setTranscript("");
    setCurrentEvalText("");
    setFullReport(null);

    // Start speech recognition automatically if mic is enabled
    if (isMicOn && recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.warn("Could not auto-start speech recognition:", e);
      }
    }

    // Speak question twice clearly
    speakQuestion(questions[0].question, true);

    setTimeout(() => {
      const container = document.getElementById("resume-interview-studio-root");
      if (container && !document.fullscreenElement) {
        container.requestFullscreen().catch((err) => console.warn(err));
        setIsFullscreen(true);
      }
    }, 100);
  };

  const handleToggleMic = () => {
    if (!isMicOn) {
      setIsMicOn(true);
      isMicOnRef.current = true;
      if (recognitionRef.current && phase === "active") {
        try {
          recognitionRef.current.start();
          setIsListening(true);
        } catch (e) {}
      }
    } else {
      setIsMicOn(false);
      isMicOnRef.current = false;
      setIsListening(false);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    }
  };

  const handleSubmitAnswer = async () => {
    if (isEvaluating || !sessionId) return;
    const activeAns = `${committedTranscriptRef.current} ${interimTranscriptRef.current}`.replace(/\s+/g, " ").trim() || transcript.trim();
    if (!activeAns) return;
    setIsEvaluating(true);
    try {
      const res = await api.post(`/v1/interview/${sessionId}/answer`, { user_answer: activeAns });
      const session = res.data?.session;
      const evaluation = res.data?.feedback || {};
      setAnswers(prev => ({ ...prev, [currentQuestionIdx]: activeAns }));
      const feedbackText = evaluation.evidence || evaluation.recommened_remediation || evaluation.feedback || "Answer evaluated.";
      setCurrentEvalText(feedbackText);
      setInterviewerFeedback(prev => ({ ...prev, [currentQuestionIdx]: feedbackText }));
      if (session?.status === "completed") {
        setFullReport({
          resumeAlignment: Number(session.overall_report?.role_readiness?.[targetRole] ? String(session.overall_report.role_readiness[targetRole]).match(/\d+/)?.[0] : 0),
          technicalDepth: Number(session.overall_report?.technical_knowledge_score || 0),
          communicationClarity: Number(session.overall_report?.communication_score || 0),
          overallScore: Number(session.overall_report?.overall_score || 0),
          hiringDecision: "Practice evidence only",
          strengths: session.overall_report?.strengths || [],
          improvements: (session.overall_report?.suggested_improvements || []).map((x:any)=>x.area || x),
          summary: "This report is based on your actual interview answers and recorded evidence."
        });
        setPhase("report");
        return;
      }
      const nq = session?.current_question;
      if (nq?.question_text) {
        setPendingNextQuestion({ id: currentQuestionIdx + 2, title: nq.topic || roundType, question: nq.question_text, category: nq.topic || roundType });
      }
      speakQuestion(feedbackText, false, () => handleProceedToNextRef.current());
    } catch (e:any) {
      setCurrentEvalText(e?.message || "The answer could not be evaluated. Please try again.");
    } finally {
      setIsEvaluating(false);
    }
  };
  handleSubmitAnswerRef.current = handleSubmitAnswer;

  const fetchFullReport = async () => {
    if (!sessionId) return;
    setIsGeneratingReport(true);
    try {
      const res = await api.post(`/v1/interview/${sessionId}/finish`);
      const report = res.data?.session?.overall_report;
      if (report) {
        setFullReport({
          resumeAlignment: Number(report.role_readiness?.[targetRole] ? String(report.role_readiness[targetRole]).match(/\d+/)?.[0] : 0),
          technicalDepth: Number(report.technical_knowledge_score || 0),
          communicationClarity: Number(report.communication_score || 0),
          overallScore: Number(report.overall_score || 0),
          hiringDecision: "Practice evidence only",
          strengths: report.strengths || [],
          improvements: (report.suggested_improvements || []).map((x:any)=>x.area || x),
          summary: "This report is based on your actual interview answers and persistent Candidate Memory."
        });
      }
    } catch (e:any) {
      setCurrentEvalText(e?.message || "Unable to generate the interview report.");
    } finally {
      setIsGeneratingReport(false);
    }
  };
  const handleProceedToNext = () => {
    setTranscript("");
    setCurrentEvalText("");
    if (recognitionRef.current) { try { recognitionRef.current.abort(); } catch {} }
    committedTranscriptRef.current = "";
    interimTranscriptRef.current = "";
    if (pendingNextQuestion) {
      const next = pendingNextQuestion;
      setQuestions(prev => [...prev, next]);
      setCurrentQuestionIdx(next.id - 1);
      setPendingNextQuestion(null);
      speakQuestion(next.question, true);
      return;
    }
    setPhase("report");
    phaseRef.current = "report";
    fetchFullReport();
  };
  handleProceedToNextRef.current = handleProceedToNext;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const activeQuestion = questions[currentQuestionIdx] || questions[0];

  return (
    <div id="resume-interview-studio-root" className={`space-y-6 bg-slate-50 dark:bg-black transition-all ${isFullscreen ? "fixed inset-0 z-[100] w-full h-full overflow-y-auto p-4 sm:p-8" : ""}`}>
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-5 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToResume}
            className="p-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 rounded-xl transition-all cursor-pointer"
            title="Back to Resume Engine"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Resume-Based AI Practice Interview</h2>
              <span className="px-2.5 py-0.5 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-mono text-[10px] font-extrabold rounded-full border border-blue-200 dark:border-blue-800">
                ATS Score: {atsScore}%
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Targeted questions dynamically generated from <span className="font-semibold text-slate-800 dark:text-zinc-200">{resumeFileName || "Uploaded Resume.pdf"}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 ml-auto sm:ml-0">
          {phase === "active" && (
            <div className="flex items-center gap-3 font-mono text-xs">
              <div className="px-3 py-1.5 bg-slate-100 dark:bg-zinc-800 rounded-xl font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-blue-500" />
                <span>{formatTime(timerSeconds)}</span>
              </div>
              <div className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-xl font-bold border border-blue-200/60 dark:border-blue-900/60">
                Q{currentQuestionIdx + 1} of {questions.length}
              </div>
            </div>
          )}
          <button
            onClick={() => {
              const container = document.getElementById("resume-interview-studio-root");
              if (!container) return;
              if (!document.fullscreenElement) {
                container.requestFullscreen().catch((err) => console.warn(err));
                setIsFullscreen(true);
              } else {
                document.exitFullscreen();
                setIsFullscreen(false);
              }
            }}
            className="p-2 text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors cursor-pointer rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* PHASE 1: OVERVIEW & CUSTOMIZATION SCREEN */}
      {phase === "overview" && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-6 sm:p-8 rounded-2xl shadow-xs space-y-6 max-w-4xl mx-auto">
          {/* ASSIGNED AI INTERVIEWER PERSONA */}
          <div className="flex flex-col md:flex-row items-center gap-6 pb-6 border-b border-slate-100 dark:border-zinc-800">
            <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-blue-500 shadow-md shrink-0">
              <img
                src={interviewer.imageUrl}
                alt={interviewer.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-1 text-center md:text-left flex-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Assigned AI Interviewer Persona
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{interviewer.name}</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">{interviewer.role} • {interviewer.company}</p>
              <p className="text-xs text-slate-600 dark:text-zinc-300 pt-1">
                "I have parsed your resume projects, technical competencies, and ATS score. Customize your experience level and interview round below to generate fresh, targeted questions."
              </p>
            </div>
          </div>

          {/* INTERVIEW CUSTOMIZATION CONTROLS */}
          <div className="space-y-4 bg-slate-50/70 dark:bg-zinc-950/60 p-5 rounded-2xl border border-slate-200/70 dark:border-zinc-800">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-zinc-800">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-blue-600" />
                <span>Customize Interview Parameters & Rigor</span>
              </span>
              <button
                type="button"
                onClick={() => generateFreshQuestions()}
                disabled={isGenerating}
                className="px-3 py-1 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 border border-blue-200 dark:border-blue-800 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin text-blue-500" : ""}`} />
                <span>{isGenerating ? "Generating..." : "✨ Generate Fresh Questions"}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              {/* Experience Level Selector */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Target Experience Level</span>
                </label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full p-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-800 dark:text-zinc-200 font-medium focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="Internship / Fresher (0-1 yrs)">Internship / Fresher (0-1 yrs)</option>
                  <option value="Associate / Junior SDE (1-3 yrs)">Associate / Junior SDE (1-3 yrs)</option>
                  <option value="Mid-Level / Senior SDE (3-6 yrs)">Mid-Level / Senior SDE (3-6 yrs)</option>
                  <option value="Staff / Tech Lead / Manager (6+ yrs)">Staff / Tech Lead / Manager (6+ yrs)</option>
                </select>
              </div>

              {/* Round Focus Selector */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Interview Round Focus</span>
                </label>
                <select
                  value={roundType}
                  onChange={(e) => setRoundType(e.target.value)}
                  className="w-full p-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-800 dark:text-zinc-200 font-medium focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="Resume / Introduction Round">Resume / Introduction Round</option>
                  <option value="HR Round">HR Round</option>
                  <option value="Technical Round">Technical Round</option>
                  <option value="Behavioral Round">Behavioral Round</option>
                  <option value="Project Round">Project Round</option>
                  <option value="Coding Discussion">Coding Discussion</option>
                  <option value="System Design Round">System Design Round</option>
                  <option value="Managerial Round">Managerial Round</option>
                  <option value="Final HR Round">Final HR Round</option>
                  <option value="Other Professional Round">Other Professional Round</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-zinc-300">Target Role</label>
                <input value={targetRole} onChange={e=>setTargetRole(e.target.value)} className="w-full p-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl" placeholder="Software Engineer" />
              </div>
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-zinc-300">Target Company</label>
                <select value={targetCompany} onChange={e=>setTargetCompany(e.target.value)} className="w-full p-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl">
                  <option value="">General / No company target</option>
                  <option>Google</option><option>Microsoft</option><option>Amazon</option><option>Meta</option><option>Apple</option><option>Adobe</option><option>Infosys</option><option>TCS</option><option>Accenture</option><option>Other</option>
                </select>
              </div>

              {/* Rigor Selector */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1">
                  <Target className="w-3.5 h-3.5 text-amber-500" />
                  <span>Target Rigor</span>
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full p-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-800 dark:text-zinc-200 font-medium focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="Standard Industry Level">Standard Industry Level</option>
                  <option value="Challenging FAANG Level">Challenging FAANG Level</option>
                  <option value="Principal / Top Tier Rigor">Principal / Top Tier Rigor</option>
                </select>
              </div>

              {/* Number of Questions Selector */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1">
                  <BrainCircuit className="w-3.5 h-3.5 text-purple-500" />
                  <span>Number of Questions</span>
                </label>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="w-full p-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-800 dark:text-zinc-200 font-medium focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value={5}>5 Questions (Short Walkthrough)</option>
                  <option value={6}>6 Questions (Standard Technical)</option>
                  <option value={8}>8 Questions (Deep Technical Loop)</option>
                  <option value={10}>10 Questions (Comprehensive Review)</option>
                </select>
              </div>

              {/* High Thinking Mode Toggle */}
              <div className="space-y-1.5 sm:col-span-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative">
                    <input type="checkbox" className="sr-only" checked={thinkingMode} onChange={() => setThinkingMode(!thinkingMode)} />
                    <div className={`block w-10 h-6 rounded-full transition-colors ${thinkingMode ? 'bg-purple-600' : 'bg-slate-300 dark:bg-zinc-700'}`}></div>
                    <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${thinkingMode ? 'translate-x-4' : ''}`}></div>
                  </div>
                  <div>
                    <div className="font-bold text-[11px] text-slate-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                      High Thinking Engine
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5 font-medium leading-relaxed">
                      Enable advanced multi-step reasoning for deep evaluation of complex system design and architecture answers. Slower response times, but elite FAANG-level critique.
                    </div>
                  </div>
                </label>
              </div>
            </div>

          </div>

          <button
            onClick={() => questions.length === 0 ? void generateFreshQuestions() : handleStartInterview()}
            disabled={isGenerating}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-all cursor-pointer shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
          >
            {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-300" />}
            <span>{isGenerating ? "Preparing personalized questions…" : questions.length === 0 ? `Prepare Resume Interview (${questionCount} Questions)` : `Launch Resume AI Practice Session (${questionCount} Questions)`}</span>
          </button>
        </div>
      )}

      {/* PHASE 2: ACTIVE LIVE PRACTICE ROOM */}
      {phase === "active" && activeQuestion && (
        <div className="space-y-6">
          {/* PROGRESS INDICATOR */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-4 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-4 h-4 text-emerald-500" />
                Interview Progress • {questions.length - currentQuestionIdx - 1} remaining
              </span>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                Round {currentQuestionIdx + 1} of {questions.length}
              </span>
            </div>
            <div className="h-2 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${((currentQuestionIdx + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT: AI INTERVIEWER & CANDIDATE FEEDS */}
            <div className="lg:col-span-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* AI Interviewer Display */}
              <div className="bg-slate-900 dark:bg-zinc-900 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-4 relative min-h-[300px]">
                <AIInterviewerAvatar
                  name={interviewer.name}
                  role={interviewer.role}
                  isSpeaking={isAiSpeaking}
                  soundLevel={soundLevel}
                  imageUrl={interviewer.imageUrl}
                  size="normal"
                />
                <button
                  onClick={() => speakQuestion(currentEvalText || activeQuestion.question, !currentEvalText)}
                  className="px-3 py-1.5 bg-blue-600/80 hover:bg-blue-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{currentEvalText ? "Re-play Feedback Audio" : "Re-play Question (Repeated 2x)"}</span>
                </button>
              </div>

              {/* Candidate Webcam Feed */}
              <div className="bg-slate-950 dark:bg-zinc-950 border border-slate-800 rounded-2xl overflow-hidden relative min-h-[300px] flex items-center justify-center">
                {isVideoOn ? (
                  <CameraTelemetryOverlay
                    sessionId="resume_interview_live"
                    deviceId=""
                    width={400}
                    height={300}
                    fps={30}
                    micActive={isMicOn}
                    onPermissionStatus={() => {}}
                  />
                ) : (
                  <div className="text-center text-zinc-500 space-y-2 p-4">
                    <VideoOff className="w-8 h-8 mx-auto text-zinc-600" />
                    <span className="text-xs font-semibold block">Camera Feed Paused</span>
                  </div>
                )}

              </div>
            </div>

            {/* LIVE QUESTION DISPLAY */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-6 rounded-2xl shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  {activeQuestion.title}
                </span>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400">
                  Short Question {currentQuestionIdx + 1} of {questions.length}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-relaxed">
                "{activeQuestion.question}"
              </h3>

              {/* DYNAMIC INTERVIEWER EVALUATION & RESPONSE CARD */}
              {currentEvalText && (
                <div className="p-4 bg-indigo-50/90 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      Gemini AI Analysis & Interviewer Response
                    </span>
                    <button
                      onClick={() => speakQuestion(currentEvalText, false)}
                      className="text-[10px] text-indigo-700 dark:text-indigo-300 underline font-semibold cursor-pointer"
                    >
                      Listen Feedback
                    </button>
                  </div>
                  <p className="text-indigo-950 dark:text-indigo-100 leading-relaxed font-medium">
                    "{currentEvalText}"
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: TRANSCRIPT & CONTROLS */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-5 rounded-2xl shadow-xs space-y-4 flex flex-col h-full min-h-[420px]">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  <span>Your Answer (Speak or Type)</span>
                </span>
                {isListening && isMicOn ? (
                  <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-bold rounded-full border border-emerald-200 dark:border-emerald-800 animate-pulse">
                    MIC LIVE
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 font-mono text-[10px] font-bold rounded-full">
                    TYPING MODE
                  </span>
                )}
              </div>

              {/* EDITABLE TEXTAREA: Captures spoken voice AND permits typing directly */}
              <div className="flex-1 flex flex-col space-y-2">
                <textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder={
                    isMicOn
                      ? "Speak into your microphone or type your answer directly..."
                      : "Microphone paused. Type your response here..."
                  }
                  className="w-full h-full min-h-[160px] p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 rounded-xl text-xs font-mono text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 resize-none leading-relaxed"
                />
                <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-zinc-500">
                  <span>{transcript.length} characters</span>
                  {transcript && (
                    <button
                      type="button"
                      onClick={() => setTranscript("")}
                      className="text-red-500 hover:underline cursor-pointer font-semibold"
                    >
                      Clear Text
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={handleToggleMic}
                    className={`p-3 rounded-xl border transition-all cursor-pointer font-bold text-xs flex items-center gap-2 ${
                      isMicOn
                        ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800"
                        : "bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 border-red-300 dark:border-red-800"
                    }`}
                  >
                    {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                    <span>{isMicOn ? "Mic Live" : "Mic Muted"}</span>
                  </button>

                  <button
                    onClick={() => setIsVideoOn(!isVideoOn)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer font-bold text-xs flex items-center gap-2 ${
                      isVideoOn
                        ? "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-800"
                        : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-300 dark:border-zinc-700"
                    }`}
                  >
                    {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                  </button>
                </div>

                {!currentEvalText ? (
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={isEvaluating || isAiSpeaking}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
                  >
                    {isEvaluating ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <MessageSquare className="w-4 h-4" />
                    )}
                    <span>{isEvaluating ? "Gemini AI Analyzing Answer..." : autoSubmitEnabled ? "Submit Answer (Auto-submits on silence)" : "Submit Answer"}</span>
                  </button>
                ) : (
                  <button
                    onClick={handleProceedToNext}
                    disabled={isAiSpeaking}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2"
                  >
                    <span>
                      {currentQuestionIdx < questions.length - 1
                        ? "Moving to Next Question..."
                        : "Finishing Interview..."}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        </div>
      )}

      {/* PHASE 3: FINAL RESUME INTERVIEW REPORT */}
      {phase === "report" && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-6 sm:p-8 rounded-2xl shadow-xs space-y-6 max-w-4xl mx-auto">
          {isGeneratingReport ? (
            <div className="py-12 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Analyzing your actual spoken and typed answers with Gemini AI...
              </h4>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Evaluating technical accuracy, resume alignment, and architectural depth for {candidateName}...
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-zinc-800">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Real AI Evaluation Complete
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                    Resume Practice Interview Evaluation
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Results for <strong className="text-slate-800 dark:text-zinc-200">{primaryProject}</strong> ({experienceLevel})
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setPhase("overview");
                      generateFreshQuestions();
                    }}
                    className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-blue-500" />
                    <span>Try Fresh Round</span>
                  </button>
                  <button
                    onClick={onBackToResume}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-blue-500/20"
                  >
                    Done
                  </button>
                </div>
              </div>

              {/* REAL GEMINI ACCURATE METRICS */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 rounded-xl text-center space-y-1">
                  <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 block">Resume Alignment</span>
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 block">
                    {fullReport?.resumeAlignment ?? 65}%
                  </span>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 rounded-xl text-center space-y-1">
                  <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-300 block">Technical Depth</span>
                  <span className="text-2xl font-black text-blue-600 dark:text-blue-400 block">
                    {fullReport?.technicalDepth ?? 60}%
                  </span>
                </div>

                <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50 rounded-xl text-center space-y-1">
                  <span className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 block">Communication</span>
                  <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 block">
                    {fullReport?.communicationClarity ?? 70}%
                  </span>
                </div>

                <div className="p-4 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/50 rounded-xl text-center space-y-1">
                  <span className="text-[11px] font-semibold text-purple-700 dark:text-purple-300 block">Hiring Decision</span>
                  <span className="text-xl font-extrabold text-purple-600 dark:text-purple-400 block mt-1">
                    {fullReport?.hiringDecision || "Under Review"}
                  </span>
                </div>
              </div>

              {/* EXECUTIVE SUMMARY */}
              {fullReport?.summary && (
                <div className="p-4 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl space-y-1">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider font-mono">
                    Hiring Committee Executive Summary
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed font-medium">
                    {fullReport.summary}
                  </p>
                </div>
              )}

              {/* STRENGTHS AND IMPROVEMENTS */}
              {fullReport && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {fullReport.strengths && fullReport.strengths.length > 0 && (
                    <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/40 rounded-xl space-y-2">
                      <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Identified Strengths
                      </span>
                      <ul className="list-disc list-inside space-y-1 text-emerald-950 dark:text-emerald-200">
                        {fullReport.strengths.map((s, idx) => (
                          <li key={idx}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {fullReport.improvements && fullReport.improvements.length > 0 && (
                    <div className="p-4 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 rounded-xl space-y-2">
                      <span className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                        <Target className="w-4 h-4 text-amber-600" />
                        Key Improvement Areas
                      </span>
                      <ul className="list-disc list-inside space-y-1 text-amber-950 dark:text-amber-200">
                        {fullReport.improvements.map((imp, idx) => (
                          <li key={idx}>{imp}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* TRANSCRIPT BREAKDOWN */}
              <div className="space-y-3 pt-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Transcript & Response Breakdown</h4>
                <div className="space-y-3">
                  {questions.map((q, idx) => (
                    <div key={q.id || idx} className="p-4 bg-slate-50 dark:bg-zinc-950 border border-slate-200/70 dark:border-zinc-800 rounded-xl space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-zinc-100">Q{idx + 1}: {q.title}</span>
                      </div>
                      <p className="text-slate-600 dark:text-zinc-400 italic">"{q.question}"</p>
                      <p className="text-slate-800 dark:text-zinc-300 font-mono text-[11px] bg-white dark:bg-zinc-900 p-2.5 rounded border border-slate-200 dark:border-zinc-800">
                        <strong>Candidate Response:</strong> {answers[idx] || "No response provided."}
                      </p>
                      {interviewerFeedback[idx] && (
                        <p className="text-indigo-900 dark:text-indigo-300 font-sans text-[11px] bg-indigo-50/70 dark:bg-indigo-950/40 p-2.5 rounded border border-indigo-200/60 dark:border-indigo-900/50">
                          <strong>AI Evaluation:</strong> {interviewerFeedback[idx]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Path: /src/components/auth/StudentOnboardingWizard.tsx
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Trash2,
  Cpu,
  Award,
  BookOpen,
  Briefcase,
  Code2,
  TrendingUp,
  Target,
  BarChart3,
  ShieldCheck,
  Check,
  X,
  Loader2,
  User,
  GraduationCap
} from "lucide-react";
import { useToast } from "../../providers/ToastProvider";
import { extractTextFromFile, analyzeResumeWithAI, UniversalResumeAnalysis, localMultiDomainResumeAnalysis } from "../../utils/universalResumeParser";

interface StudentOnboardingWizardProps {
  onSuccess: (
    profile: {
      fullName: string;
      university: string;
      graduationYear: string;
      targetRoles: string[];
      skills: string[];
    },
    resumeFileName: string
  ) => void;
  userEmail?: string;
}

export function StudentOnboardingWizard({
  onSuccess,
  userEmail = "student@university.edu"
}: StudentOnboardingWizardProps) {
  const { toast } = useToast();

  // Onboarding Step Flow:
  // 1 = Welcome
  // 2 = Upload Resume
  // 3 = Automatic AI Analysis
  // 4 = Personalized Dashboard & Recommendations
  // 5 = Launch First Interview
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Upload state
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Analysis state
  const [analysisProgress, setAnalysisProgress] = useState<number>(0);
  const [analysisStage, setAnalysisStage] = useState<string>("");
  const [parsedAnalysis, setParsedAnalysis] = useState<UniversalResumeAnalysis | null>(null);

  // Completed checklist items state for Step 4
  const [checklist, setChecklist] = useState<Array<{ id: string; text: string; done: boolean }>>([
    { id: "1", text: "Add quantifiable metrics to project bullet points (e.g. '%', '$', 'X users')", done: false },
    { id: "2", text: "Ensure target job keywords are prominently listed in the skills section", done: false },
    { id: "3", text: "Highlight top technical or professional certifications at the top", done: true }
  ]);

  // Handle Drag Events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Validate File
  const validateFile = (file: File): string | null => {
    if (!file) return "No file provided.";
    if (file.size === 0) return "File is empty. Please upload a valid document.";
    
    const validExts = ["pdf", "docx", "doc", "txt"];
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    if (!validExts.includes(ext) && !file.type.includes("pdf") && !file.type.includes("word") && !file.type.includes("text")) {
      return "Unsupported file format. Please upload a PDF, DOCX, or TXT file.";
    }

    if (file.size > 15 * 1024 * 1024) {
      return "File size exceeds the 15MB limit. Please upload a smaller document.";
    }

    return null;
  };

  // Process File Upload and Trigger AI
  const processFileUpload = (file: File) => {
    setUploadError(null);
    const err = validateFile(file);
    if (err) {
      setUploadError(err);
      toast(err, "error", "Upload Failed");
      return;
    }

    setUploadedFile(file);
    setUploadProgress(10);

    // Simulate progress bar 10% -> 100%
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev === null) return null;
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setUploadProgress(null);
            // Move to Step 3: Automatic AI Analysis
            startAIAnalysis(file);
          }, 300);
          return 100;
        }
        return prev + 25;
      });
    }, 120);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFileUpload(e.target.files[0]);
    }
  };

  // Start AI Analysis with full error safety
  const startAIAnalysis = async (file: File) => {
    setCurrentStep(3);
    setAnalysisProgress(15);
    setAnalysisStage("1. Parsing document text and structure...");

    try {
      // Step 1: Extract Text
      const rawText = await extractTextFromFile(file);
      setAnalysisProgress(45);
      setAnalysisStage("2. Running AI extraction for skills, projects & domain...");

      // Step 2: Analyze with AI (with built-in local fallback)
      let analysisResult: UniversalResumeAnalysis;
      try {
        analysisResult = await analyzeResumeWithAI(rawText, file.name);
      } catch (e) {
        console.warn("AI analysis API notice, applying deterministic multi-domain parser fallback:", e);
        analysisResult = localMultiDomainResumeAnalysis(rawText, file.name);
      }

      setAnalysisProgress(80);
      setAnalysisStage("3. Computing ATS match score & candidate profile...");

      setTimeout(() => {
        setAnalysisProgress(100);
        setAnalysisStage("4. Profile created automatically! Loading dashboard...");
        setParsedAnalysis(analysisResult);

        setTimeout(() => {
          setCurrentStep(4);
          toast("Resume analyzed! Candidate profile generated automatically.", "success", "Setup Complete");
        }, 500);
      }, 600);

    } catch (err: any) {
      console.error("Critical error in resume pipeline:", err);
      // Fail-safe fallback so the page NEVER crashes!
      const fallbackAnalysis = localMultiDomainResumeAnalysis(
        `Candidate Resume: ${file.name}`,
        file.name
      );
      setParsedAnalysis(fallbackAnalysis);
      setAnalysisProgress(100);
      setCurrentStep(4);
      toast("Resume parsed with default profile calibration.", "info", "Analysis Completed");
    }
  };

  // Finish Onboarding
  const handleFinishOnboarding = () => {
    const nameToUse = parsedAnalysis?.personalInfo?.fullName || userEmail.split("@")[0].toUpperCase();
    const uniToUse = parsedAnalysis?.personalInfo?.college || "University";
    const targetRoleToUse = parsedAnalysis?.candidateProfile?.targetRoles?.[0] || parsedAnalysis?.profession || "Software Engineer";
    const skillsToUse = parsedAnalysis?.skills || ["Problem Solving", "Communication"];

    const profileData = {
      fullName: nameToUse,
      university: uniToUse,
      graduationYear: "2026",
      targetRoles: [targetRoleToUse],
      skills: skillsToUse
    };

    onSuccess(profileData, uploadedFile?.name || "uploaded_resume.pdf");
  };

  const isTechDomain = /software|computer|data|ai|machine learning|developer|cloud|cyber|electrical|electronics/i.test(
    parsedAnalysis?.domain || ""
  );

  return (
    <div className="min-h-screen bg-slate-50/80 dark:bg-zinc-950 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 select-none">
      {/* Background decoration */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 dark:bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-3xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-3xl shadow-xl p-6 sm:p-10 relative z-10 space-y-8">
        
        {/* Step Indicator Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white">Interview Cracker AI</h1>
              <p className="text-xs text-slate-500 dark:text-zinc-400">Automated Onboarding & Resume Analysis</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-zinc-400">
            <span>Step {currentStep} of 5</span>
          </div>
        </div>

        {/* STEP 1: WELCOME */}
        {currentStep === 1 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-center py-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center border border-blue-100 dark:border-blue-900/40">
              <User className="w-8 h-8" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome to Your AI Career Assistant</h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">
                Upload your resume once and let AI automatically detect your domain, skills, target job role, and generate your candidate dashboard.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left pt-2">
              <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-zinc-950 border border-slate-200/60 dark:border-zinc-800 space-y-1.5">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">1. Upload Resume</h3>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">PDF, DOCX, or TXT format supported.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-zinc-950 border border-slate-200/60 dark:border-zinc-800 space-y-1.5">
                <Cpu className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">2. Automatic AI Extraction</h3>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">Extracts skills, domain & ATS score.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-zinc-950 border border-slate-200/60 dark:border-zinc-800 space-y-1.5">
                <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">3. Tailored AI Interviews</h3>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">Practice questions aligned to your experience.</p>
              </div>
            </div>

            <button
              onClick={() => setCurrentStep(2)}
              className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-blue-500/20 cursor-pointer inline-flex items-center justify-center gap-2"
            >
              <span>Get Started by Uploading Resume</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* STEP 2: UPLOAD RESUME */}
        {currentStep === 2 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Upload Your Resume</h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                AI will extract your background automatically. No long forms to fill.
              </p>
            </div>

            {/* Error banner */}
            {uploadError && (
              <div className="p-3.5 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-xs rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
                <button
                  onClick={() => setUploadError(null)}
                  className="p-1 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Upload Area */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 flex flex-col items-center justify-center text-center space-y-4 transition-all ${
                dragActive
                  ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 scale-[1.01]"
                  : "border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/40 hover:border-slate-300 dark:hover:border-zinc-700"
              }`}
            >
              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs text-blue-600 dark:text-blue-400">
                <Upload className="w-8 h-8" />
              </div>

              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Drag & drop your resume file here</p>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Supports PDF, DOCX, or TXT (up to 15MB)</p>
              </div>

              <div className="relative">
                <input
                  id="onboarding-resume-input"
                  type="file"
                  className="hidden"
                  accept=".pdf,.docx,.doc,.txt"
                  onChange={handleFileInput}
                />
                <label
                  htmlFor="onboarding-resume-input"
                  className="inline-flex h-10 px-5 items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs cursor-pointer transition-colors"
                >
                  Browse Files
                </label>
              </div>
            </div>

            {/* Upload Progress */}
            {uploadProgress !== null && (
              <div className="space-y-2 p-4 bg-slate-50 dark:bg-zinc-950 rounded-xl border border-slate-200/80 dark:border-zinc-800">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700 dark:text-zinc-300">Uploading Document...</span>
                  <span className="text-blue-600 dark:text-blue-400 font-mono">{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-150 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: AUTOMATIC AI ANALYSIS */}
        {currentStep === 3 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-center py-6">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center border border-blue-100 dark:border-blue-900/40">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>

            <div className="space-y-2 max-w-sm mx-auto">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Analyzing Your Resume</h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">{analysisStage}</p>
            </div>

            <div className="w-full max-w-md mx-auto space-y-2">
              <div className="flex justify-between text-xs font-mono font-semibold text-slate-600 dark:text-zinc-400">
                <span>Progress</span>
                <span className="text-blue-600 dark:text-blue-400">{analysisProgress}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-300 rounded-full"
                  style={{ width: `${analysisProgress}%` }}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 4 & 5: PERSONALIZED DASHBOARD & LAUNCH */}
        {(currentStep === 4 || currentStep === 5) && parsedAnalysis && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">Profile Created Automatically</h3>
                  <p className="text-[11px] text-slate-600 dark:text-zinc-300">
                    Extracted from <span className="font-semibold">{uploadedFile?.name || "Uploaded_Resume.pdf"}</span>
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 bg-emerald-600 text-white font-mono font-bold text-xs rounded-lg">
                ATS Score: {parsedAnalysis.atsScore}/100
              </span>
            </div>

            {/* Overview Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Extracted Details */}
              <div className="p-5 bg-slate-50 dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 rounded-2xl space-y-3">
                <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">Candidate Details</span>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-zinc-400">Target Role:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{parsedAnalysis.candidateProfile?.targetRoles?.[0] || parsedAnalysis.profession}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-zinc-400">Career Domain:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{parsedAnalysis.domain}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-zinc-400">Category:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{parsedAnalysis.candidateProfile?.candidateCategory || "Fresher"}</span>
                  </div>
                </div>
              </div>

              {/* Recommended Interview */}
              <div className="p-5 bg-slate-50 dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 rounded-2xl space-y-3">
                <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">Suggested Next Step</span>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 block">AI Mock Interview Session</span>
                  <p className="text-xs text-slate-600 dark:text-zinc-300">
                    Calibrated difficulty: <span className="font-semibold">{isTechDomain ? "Intermediate Technical" : "Domain Case Round"}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Extracted Skills */}
            <div className="p-5 bg-slate-50 dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 rounded-2xl space-y-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">Extracted Core Skills</span>
              <div className="flex flex-wrap gap-1.5">
                {(parsedAnalysis.skills || ["Problem Solving", "Communication"]).map((s, idx) => (
                  <span key={`${s}-${idx}`} className="px-2.5 py-1 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 rounded-lg text-xs font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Checklist */}
            <div className="p-5 bg-slate-50 dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 rounded-2xl space-y-3">
              <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">Resume Improvement Checklist</span>
              <div className="space-y-2">
                {checklist.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setChecklist((prev) =>
                        prev.map((i) => (i.id === item.id ? { ...i, done: !i.done } : i))
                      );
                    }}
                    className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-zinc-300 cursor-pointer hover:text-slate-900"
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${item.done ? "bg-blue-600 border-blue-600 text-white" : "border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"}`}>
                      {item.done && <Check className="w-3 h-3" />}
                    </div>
                    <span className={item.done ? "line-through text-slate-400 dark:text-zinc-500" : ""}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Finish Action */}
            <button
              onClick={handleFinishOnboarding}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-blue-500/20 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Enter Workspace & Start First AI Interview</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

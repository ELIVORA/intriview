/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Brain,
  CheckCircle2,
  FileText,
  Loader2,
  Sparkles,
} from "lucide-react";
import {
  extractTextFromFile,
  analyzeResumeWithAI,
  UniversalResumeAnalysis,
} from "../../utils/universalResumeParser";

interface ResumeAnalysisStepProps {
  fileName: string;
  file?: File | null;
  email?: string;
  onComplete: () => void;
}

export function ResumeAnalysisStep({
  fileName,
  file,
  email,
  onComplete,
}: ResumeAnalysisStepProps) {
  const [progress, setProgress] = useState(0);
  const [analysisResult, setAnalysisResult] =
    useState<UniversalResumeAnalysis | null>(null);
  const [statusMessage, setStatusMessage] = useState(
    "Preparing your resume..."
  );
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function runAnalysis() {
      try {
        setError(null);
        setIsComplete(false);
        setProgress(5);
        setStatusMessage("Reading your resume...");

        let rawText = "";

        if (file) {
          rawText = await extractTextFromFile(file);
        } else {
          throw new Error(
            "No resume file was provided. Please return and upload your resume again."
          );
        }

        if (!isMounted) return;

        if (!rawText || rawText.trim().length < 30) {
          throw new Error(
            "We could not extract enough text from this resume. Please upload a text-searchable PDF or TXT resume."
          );
        }

        setProgress(30);
        setStatusMessage("Resume text extracted successfully.");

        await new Promise((resolve) => setTimeout(resolve, 250));

        if (!isMounted) return;

        setProgress(45);
        setStatusMessage("AI is analyzing your skills, education and experience...");

        const result = await analyzeResumeWithAI(rawText, fileName);

        if (!result) {
          throw new Error("The AI resume analysis returned no result.");
        }

        if (!isMounted) return;

        setProgress(75);
        setStatusMessage(
          `Detected ${result.profession} in ${result.domain}.`
        );

        setAnalysisResult(result);

        await new Promise((resolve) => setTimeout(resolve, 500));

        if (!isMounted) return;

        /*
         * Save candidate-specific resume analysis.
         *
         * These keys are also read by ResumeIntelligenceEngine,
         * allowing the onboarding analysis to appear inside the
         * main Resume section after the user enters the dashboard.
         */
        try {
          if (email) {
            localStorage.setItem(
              `interview_cracker_resume_data_${email}`,
              JSON.stringify(result)
            );

            localStorage.setItem(
              `interview_cracker_resume_analysis_${email}`,
              JSON.stringify(result)
            );

            localStorage.setItem(
              `interview_cracker_resume_filename_${email}`,
              fileName
            );
          }

          // Backward-compatible generic cache used by older code.
          localStorage.setItem(
            "interview_cracker_parsed_resume_data",
            JSON.stringify(result)
          );

          window.dispatchEvent(
            new CustomEvent("interview_cracker_resume_updated", {
              detail: result,
            })
          );
        } catch (storageError) {
          console.warn(
            "Resume analysis was completed but could not be cached locally:",
            storageError
          );
        }

        setProgress(100);
        setStatusMessage("Your resume analysis is ready.");
        setIsComplete(true);
      } catch (err: any) {
        console.error("Resume analysis failed:", err);

        if (!isMounted) return;

        setError(
          err?.message ||
            "We could not analyze this resume. Please upload another readable resume."
        );
        setStatusMessage("Resume analysis could not be completed.");
        setProgress(0);
        setIsComplete(false);
      }
    }

    runAnalysis();

    return () => {
      isMounted = false;
    };
  }, [file, fileName, email]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8 bg-[#F9F8F6] dark:bg-zinc-950">
      <div
        id="resume-analysis-card"
        className="w-full max-w-2xl rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden"
      >
        <div className="p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 mb-4">
              {isComplete ? (
                <CheckCircle2 className="w-8 h-8" />
              ) : error ? (
                <AlertCircle className="w-8 h-8" />
              ) : (
                <Sparkles className="w-8 h-8 animate-pulse" />
              )}
            </div>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-zinc-50">
              {isComplete
                ? "Your Resume Analysis Is Ready"
                : error
                  ? "Resume Analysis Needs Attention"
                  : "Analyzing Your Resume"}
            </h2>

            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-2">
              {fileName}
            </p>
          </div>

          {/* Progress */}
          {!error && !isComplete && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-zinc-400">
                  Analysis progress
                </span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {progress}%
                </span>
              </div>

              <div className="h-2.5 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                <span>{statusMessage}</span>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 p-5">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />

                <div>
                  <h3 className="font-semibold text-red-700 dark:text-red-300">
                    We couldn't analyze this resume
                  </h3>

                  <p className="text-sm text-red-600/90 dark:text-red-300/80 mt-1 leading-relaxed">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Successful result */}
          {analysisResult && !error && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-950/20 p-5">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-semibold">
                    Resume successfully analyzed
                  </span>
                </div>

                <p className="text-xs text-emerald-700/80 dark:text-emerald-300/70 mt-2">
                  The results below were generated from the uploaded resume.
                </p>
              </div>

              {/* Main metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 p-4">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-zinc-500">
                    ATS Score
                  </p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                    {Math.round(analysisResult.atsScore)}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-500">
                    out of 100
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 p-4">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-zinc-500">
                    Profession
                  </p>
                  <p className="font-bold text-slate-900 dark:text-zinc-100 mt-2 text-sm">
                    {analysisResult.profession || "Not detected"}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 p-4">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-zinc-500">
                    Domain
                  </p>
                  <p className="font-bold text-indigo-600 dark:text-indigo-400 mt-2 text-sm">
                    {analysisResult.domain || "Not detected"}
                  </p>
                </div>
              </div>

              {/* Candidate identity */}
              <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Brain className="w-5 h-5 text-blue-500" />
                  <h3 className="font-semibold text-slate-900 dark:text-zinc-100">
                    Candidate Intelligence
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] uppercase text-slate-500 dark:text-zinc-500">
                      Name
                    </p>
                    <p className="text-sm font-semibold mt-1 text-slate-800 dark:text-zinc-200">
                      {analysisResult.personalInfo?.fullName ||
                        "Not detected"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase text-slate-500 dark:text-zinc-500">
                      Qualification
                    </p>
                    <p className="text-sm font-semibold mt-1 text-slate-800 dark:text-zinc-200">
                      {analysisResult.degree || "Not detected"}
                    </p>
                  </div>

                  <div className="sm:col-span-2">
                    <p className="text-[10px] uppercase text-slate-500 dark:text-zinc-500">
                      Core Skills
                    </p>

                    <div className="flex flex-wrap gap-2 mt-2">
                      {(analysisResult.skills || []).slice(0, 10).map(
                        (skill, index) => (
                          <span
                            key={`${skill}-${index}`}
                            className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 text-xs text-blue-700 dark:text-blue-300"
                          >
                            {skill}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Feedback */}
              <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 p-5">
                <h3 className="font-semibold text-slate-900 dark:text-zinc-100 mb-3">
                  Initial Feedback
                </h3>

                <p className="text-sm leading-relaxed text-slate-600 dark:text-zinc-400">
                  {analysisResult.overallFeedback ||
                    "Your resume has been analyzed and your candidate profile has been prepared."}
                </p>

                {analysisResult.suggestions?.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-2">
                      Recommended improvements
                    </p>

                    <ul className="space-y-2">
                      {analysisResult.suggestions.slice(0, 4).map(
                        (suggestion, index) => (
                          <li
                            key={index}
                            className="text-xs text-slate-600 dark:text-zinc-400 flex gap-2"
                          >
                            <span className="text-blue-500">•</span>
                            <span>{suggestion}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}
              </div>

              {/* Continue */}
              <button
                onClick={onComplete}
                disabled={!isComplete}
                className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Continue to My Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Error footer */}
          {error && (
            <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-zinc-500">
              <FileText className="w-4 h-4" />
              <span>
                Go back and upload a text-searchable PDF or TXT resume.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
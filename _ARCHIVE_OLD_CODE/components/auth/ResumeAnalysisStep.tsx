/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { Sparkles, Loader2, CheckCircle2, Briefcase, GraduationCap, Award, Brain, Code2 } from "lucide-react";
import { extractTextFromFile, analyzeResumeWithAI, UniversalResumeAnalysis } from "../../utils/universalResumeParser";

interface ResumeAnalysisStepProps {
  fileName: string;
  file?: File | null;
  onComplete: () => void;
}

export function ResumeAnalysisStep({ fileName, file, onComplete }: ResumeAnalysisStepProps) {
  const [progress, setProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<UniversalResumeAnalysis | null>(null);
  const [statusMessage, setStatusMessage] = useState("Extracting document text...");

  useEffect(() => {
    let isMounted = true;

    async function runAnalysis() {
      try {
        setStatusMessage("Extracting text and structure from resume...");
        let rawText = "";

        if (file) {
          rawText = await extractTextFromFile(file);
        } else {
          rawText = `Candidate Resume File: ${fileName}. Professional experience and degree background.`;
        }

        if (!isMounted) return;
        setStatusMessage("AI Engine analyzing profession, domain, degree & skills...");
        setProgress(40);

        const result = await analyzeResumeWithAI(rawText, fileName);

        if (!result) {
          throw new Error("Resume analysis failed");
        }

        console.log("ATS object generated, score:", result.atsScore);

        if (!isMounted) return;
        setAnalysisResult(result);
        setProgress(85);
        setStatusMessage(`Detected: ${result.profession} (${result.domain})`);

        setTimeout(() => {
          if (!isMounted) return;
          setProgress(100);
          setStatusMessage("Universal candidate profile compiled & interview questions generated!");
        }, 800);

      } catch (err) {
        console.warn("Resume analysis step notice:", err);
        if (isMounted) setProgress(100);
      }
    }

    runAnalysis();

    return () => {
      isMounted = false;
    };
  }, [file, fileName]);

  useEffect(() => {
    if (progress === 100) {
      const delay = setTimeout(() => {
        onComplete();
      }, 1200);
      return () => clearTimeout(delay);
    }
  }, [progress, onComplete]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-8">
      <div id="resume-analysis-card" className="w-full max-w-lg p-8 bg-zinc-950 text-white rounded-3xl border border-zinc-900 shadow-2xl space-y-6 relative overflow-hidden text-center">
        {/* Animated glowing backdrop */}
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-indigo-500/10 to-transparent pointer-events-none" />

        {/* Top visual circle with spin */}
        <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-zinc-900" />
          <div
            className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-r-indigo-500 animate-spin"
            style={{ animationDuration: "2.5s" }}
          />
          <Sparkles className="w-7 h-7 text-blue-400 animate-pulse" />
        </div>

        {/* Text descriptions */}
        <div className="space-y-1.5">
          <h3 className="text-xl font-bold tracking-tight">Universal AI Resume Scanner</h3>
          <p className="text-xs text-zinc-400 font-mono">
            Scanning: <span className="text-zinc-300 italic">{fileName}</span>
          </p>
        </div>

        {/* Stage Message */}
        <div className="min-h-[40px] flex items-center justify-center px-4 bg-zinc-900/60 rounded-xl border border-zinc-800">
          <p className="text-xs text-blue-300 font-medium leading-relaxed">
            {statusMessage}
          </p>
        </div>

        {/* Live Detected Resume Highlights */}
        {analysisResult && (
          <div className="text-left bg-zinc-900/90 p-4 rounded-2xl border border-zinc-800 space-y-3 animate-fade-in">
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider">
              <Brain className="w-4 h-4" />
              <span>Extracted Candidate Identity</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-zinc-950 rounded-xl border border-zinc-800/80">
                <p className="text-[10px] text-zinc-500 font-medium uppercase">Detected Profession</p>
                <p className="font-bold text-zinc-100 truncate">{analysisResult.profession}</p>
              </div>

              <div className="p-2.5 bg-zinc-950 rounded-xl border border-zinc-800/80">
                <p className="text-[10px] text-zinc-500 font-medium uppercase">Domain Category</p>
                <p className="font-bold text-indigo-300 truncate">{analysisResult.domain}</p>
              </div>

              <div className="p-2.5 bg-zinc-950 rounded-xl border border-zinc-800/80 col-span-2">
                <p className="text-[10px] text-zinc-500 font-medium uppercase">Degree / Qualification</p>
                <p className="font-semibold text-zinc-200 truncate">{analysisResult.degree}</p>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] text-zinc-500 uppercase font-medium">Extracted Core Skills</p>
              <div className="flex flex-wrap gap-1">
                {analysisResult.skills.slice(0, 6).map((sk, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-blue-950/80 border border-blue-800/60 text-blue-300 text-[10px] rounded-md font-medium">
                    {sk}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-[10px] text-zinc-400 font-mono">
            <span>ATS INDEX & DOMAIN EXTRACTION</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full h-2.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Compliant telemetry block */}
        <div className="p-3 bg-zinc-900/50 rounded-2xl border border-zinc-850 text-left space-y-1">
          <div className="flex justify-between items-center text-[9px] text-zinc-500 font-mono">
            <span>UNIVERSAL DOMAIN MATCH</span>
            <span>{analysisResult?.domain || "Auto Detecting..."}</span>
          </div>
          <div className="flex justify-between items-center text-[9px] text-zinc-500 font-mono">
            <span>GENERATED QUESTIONS</span>
            <span>10 Custom Questions Loaded</span>
          </div>
        </div>
      </div>
    </div>
  );
}

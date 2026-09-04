/**
 * Path: /src/components/auth/ResumeUploadStep.tsx
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Upload, FileText, X, AlertCircle, Loader2, Sparkles, RefreshCw } from "lucide-react";

interface ResumeUploadStepProps {
  onSuccess: (fileName: string, file?: File) => void;
}

export function ResumeUploadStep({ onSuccess }: ResumeUploadStepProps) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateAndSetFile = (uploadedFile: File) => {
    setError(null);
    if (!uploadedFile) return;

    if (uploadedFile.size === 0) {
      setError("File appears to be empty. Please upload a valid document.");
      return;
    }

    const fileExt = uploadedFile.name.split(".").pop()?.toLowerCase() || "";
    const validExts = ["pdf", "doc", "docx", "txt"];
    
    if (!validExts.includes(fileExt) && !uploadedFile.type.includes("pdf") && !uploadedFile.type.includes("word") && !uploadedFile.type.includes("text")) {
      setError("Unsupported file format. Please upload a PDF, DOCX, or TXT resume.");
      return;
    }

    if (uploadedFile.size > 15 * 1024 * 1024) { // 15MB limit
      setError("File exceeds maximum allowed size (15MB limit).");
      return;
    }

    setFile(uploadedFile);
    
    // Auto simulate upload progress bar
    setUploadProgress(15);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev === null) return null;
        if (prev >= 100) {
          clearInterval(interval);
          setUploadProgress(null);
          return 100;
        }
        return prev + 25;
      });
    }, 100);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setFile(null);
    setError(null);
    setUploadProgress(null);
  };

  const handleAnalyze = () => {
    if (!file) return;
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      onSuccess(file.name, file);
    }, 400);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-slate-50/80 dark:bg-zinc-950 overflow-hidden select-none">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-blue-500/10 dark:bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

      <div id="resume-upload-card" className="w-full max-w-lg p-8 sm:p-10 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200/90 dark:border-zinc-800 shadow-xl space-y-6 relative z-10">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25">
            <Upload className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-50">Upload Your Resume</h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
              AI automatically extracts your skills, domain, education, and ATS score.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-xs rounded-xl flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="p-1 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Drag and Drop Zone */}
        {!file ? (
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center space-y-4 text-center transition-all ${
              dragActive
                ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 scale-[1.01]"
                : "border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-950/40 hover:border-slate-300 dark:hover:border-zinc-700"
            }`}
          >
            <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs">
              <Upload className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-zinc-200">
                Drag & drop your resume file here
              </p>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                Supports PDF, DOCX, or TXT (Max size 15MB)
              </p>
            </div>
            <div className="relative">
              <input
                id="file-upload-input"
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleChange}
              />
              <label
                htmlFor="file-upload-input"
                className="inline-flex h-10 px-5 items-center justify-center rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-semibold text-slate-700 dark:text-zinc-200 transition-all shadow-xs cursor-pointer"
              >
                Browse Local Files
              </label>
            </div>
          </div>
        ) : (
          /* File Selected display */
          <div className="space-y-3">
            <div className="p-4 border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 rounded-2xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-xl text-blue-600 dark:text-blue-400">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-slate-900 dark:text-zinc-200 truncate">
                    {file.name}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono mt-0.5">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={removeFile}
                className="p-1.5 hover:bg-slate-200/80 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-900 dark:hover:text-zinc-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {uploadProgress !== null && (
              <div className="space-y-1.5 px-1">
                <div className="flex justify-between text-[11px] font-semibold text-slate-600 dark:text-zinc-400">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-150 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Next step analysis button */}
        {file && (
          <button
            onClick={handleAnalyze}
            disabled={isLoading}
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-500/20 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Run Automatic AI Analysis</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

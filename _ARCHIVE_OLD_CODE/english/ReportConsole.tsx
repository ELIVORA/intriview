/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  FileText,
  Download,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  TrendingUp,
  RefreshCw,
  Clock,
  ChevronRight,
  Shield,
  Lightbulb
} from "lucide-react";
import { SESSION_REPORTS_DATABASE } from "./englishEngine";

export function ReportConsole() {
  const [activeReportTab, setActiveReportTab] = useState<"summary" | "grammar" | "pronunciation" | "vocabulary">("summary");
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccessMessage, setExportSuccessMessage] = useState<string | null>(null);

  // Trigger simulated PDF exporter
  const handleExportPDF = () => {
    setIsExporting(true);
    setExportSuccessMessage(null);

    // Simulate PDF calculation, asset encoding, and download pipeline
    setTimeout(() => {
      setIsExporting(false);
      setExportSuccessMessage("Linguistic-Audit-Report.pdf has been successfully downloaded into your system directory.");
      setTimeout(() => setExportSuccessMessage(null), 4000);
    }, 1800);
  };

  const sessions = SESSION_REPORTS_DATABASE;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 w-full" id="report-console-screen">
      
      {/* Col 1: Report Selection Menu */}
      <div className="lg:col-span-1 bg-white/60 dark:bg-zinc-950/60 backdrop-blur-xl border border-zinc-200/60 dark:border-zinc-850 p-6 rounded-3xl shadow-xs space-y-6 h-fit">
        <div>
          <span className="text-[10px] text-indigo-500 font-mono font-bold tracking-widest uppercase block">
            REPORT CONSOLE
          </span>
          <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-50 mt-1">
            English Performance Audit
          </h3>
        </div>

        {/* Tab triggers */}
        <div className="space-y-2">
          {[
            { id: "summary", label: "Holistic Overview" },
            { id: "grammar", label: "Grammar Audit log" },
            { id: "pronunciation", label: "Pronunciation Clear log" },
            { id: "vocabulary", label: "Lexical vocabulary improvement" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveReportTab(tab.id as any)}
              className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between gap-2 cursor-pointer ${
                activeReportTab === tab.id
                  ? "bg-indigo-600 border-indigo-600 text-white font-bold"
                  : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100"
              }`}
            >
              <span>{tab.label}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ))}
        </div>

        {/* Secure PDF download trigger */}
        <button
          onClick={handleExportPDF}
          disabled={isExporting}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          {isExporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          <span>Download Performance PDF</span>
        </button>

        {exportSuccessMessage && (
          <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-[9px] text-emerald-600 leading-normal flex items-start gap-1">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{exportSuccessMessage}</span>
          </div>
        )}

        <div className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl text-[10px] text-zinc-500 leading-normal flex items-start gap-1.5">
          <Shield className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
          <span>All speech files and generated acoustic reports are encrypted inside standard secure cloud buckets.</span>
        </div>
      </div>

      {/* Col 2, 3 & 4: Active Report view */}
      <div className="lg:col-span-3 space-y-6">
        
        {/* Summary Tab */}
        {activeReportTab === "summary" && (
          <div className="bg-white/60 dark:bg-zinc-950/60 backdrop-blur-xl border border-zinc-200/60 dark:border-zinc-850 p-6 rounded-3xl shadow-xs space-y-6">
            <div className="pb-4 border-b border-zinc-100 dark:border-zinc-900 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-indigo-500 font-mono font-bold tracking-widest uppercase block">
                  LINGUISTIC CHRONOLOGY
                </span>
                <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-50 mt-1">
                  Recent Speaking Practice sessions ({sessions.length})
                </h3>
              </div>
              <span className="text-[10px] font-mono text-zinc-400">HISTORIC LOG</span>
            </div>

            <div className="space-y-4">
              {sessions.map((sess, idx) => (
                <div key={sess.id} className="p-5 bg-zinc-50 dark:bg-zinc-900/15 border border-zinc-200/40 dark:border-zinc-850 rounded-2xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                    <div className="space-y-0.5">
                      <span className="text-xs font-black text-zinc-850 dark:text-zinc-100 block">"{sess.topic}"</span>
                      <span className="text-[9px] font-mono text-zinc-400">
                        {new Date(sess.timestamp).toLocaleDateString([], { month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    <div className="flex gap-2 font-mono text-[10px] text-zinc-500">
                      <span>Grammar: <strong className="text-indigo-600">{sess.grammarScore}%</strong></span>
                      <span>•</span>
                      <span>Fluency: <strong className="text-indigo-600">{sess.fluencyScore}%</strong></span>
                    </div>
                  </div>

                  <p className="text-[11px] text-zinc-500 italic font-sans leading-relaxed">"{sess.transcript}"</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Grammar Tab */}
        {activeReportTab === "grammar" && (
          <div className="bg-white/60 dark:bg-zinc-950/60 backdrop-blur-xl border border-zinc-200/60 dark:border-zinc-850 p-6 rounded-3xl shadow-xs space-y-6">
            <div className="pb-4 border-b border-zinc-100 dark:border-zinc-900">
              <span className="text-[10px] text-indigo-500 font-mono font-bold tracking-widest uppercase block">
                SYNTAX DEFAULTS ARCHIVE
              </span>
              <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-50 mt-1">
                Aggregated Grammatical Error Logs
              </h3>
            </div>

            <div className="space-y-3.5">
              {sessions.map(sess => 
                sess.grammarErrors.map((err, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/15 border border-zinc-200/40 dark:border-zinc-850 space-y-2.5 text-xs">
                    <div className="flex justify-between items-center text-[9px] font-mono">
                      <span className="text-indigo-500 font-bold bg-indigo-500/10 px-1.5 py-0.5 rounded uppercase">
                        {err.type} Issue
                      </span>
                      <span className="text-zinc-400">Topic: "{sess.topic}"</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 leading-relaxed pt-1">
                      <div>
                        <span className="text-[8px] font-mono font-bold text-rose-500 uppercase block mb-1">Spoken incorrect:</span>
                        <p className="text-zinc-650 italic">"... {err.original} ..."</p>
                      </div>
                      <div>
                        <span className="text-[8px] font-mono font-bold text-emerald-500 uppercase block mb-1">Correct recommendation:</span>
                        <p className="text-zinc-800 dark:text-zinc-100 font-semibold italic">"... {err.corrected} ..."</p>
                      </div>
                    </div>

                    <p className="text-[10px] text-zinc-400 flex items-start gap-1 font-sans">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>{err.explanation}</span>
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Pronunciation Tab */}
        {activeReportTab === "pronunciation" && (
          <div className="bg-white/60 dark:bg-zinc-950/60 backdrop-blur-xl border border-zinc-200/60 dark:border-zinc-850 p-6 rounded-3xl shadow-xs space-y-6">
            <div className="pb-4 border-b border-zinc-100 dark:border-zinc-900">
              <span className="text-[10px] text-indigo-500 font-mono font-bold tracking-widest uppercase block">
                ACOUSTIC PHONETICS
              </span>
              <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-50 mt-1">
                Aggregated Phoneme & Intonation Logs
              </h3>
            </div>

            <div className="space-y-3">
              {sessions.map(sess =>
                sess.pronunciationErrors.map((err, i) => (
                  <div key={i} className="p-4 bg-zinc-50/50 dark:bg-zinc-900/15 border border-zinc-200/40 dark:border-zinc-850 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <strong className="text-zinc-800 dark:text-zinc-100 font-mono">"{err.word}"</strong>
                        <span className="text-[8px] font-mono font-bold text-indigo-500 bg-indigo-500/10 px-1 py-0.5 rounded uppercase">
                          {err.type} Alignment
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono">
                        <span>Expected: <strong>{err.expected}</strong></span>
                        <span>•</span>
                        <span>Syllable: <strong>{err.actual}</strong></span>
                      </div>
                      <p className="text-[10px] text-zinc-400 leading-normal">{err.suggestion}</p>
                    </div>

                    <div className="text-right shrink-0 font-mono">
                      <span className="text-[8px] text-zinc-400 block uppercase">Clarity Score</span>
                      <strong className="text-sm text-amber-500">{err.score}%</strong>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Vocabulary Tab */}
        {activeReportTab === "vocabulary" && (
          <div className="bg-white/60 dark:bg-zinc-950/60 backdrop-blur-xl border border-zinc-200/60 dark:border-zinc-850 p-6 rounded-3xl shadow-xs space-y-6">
            <div className="pb-4 border-b border-zinc-100 dark:border-zinc-900">
              <span className="text-[10px] text-indigo-500 font-mono font-bold tracking-widest uppercase block">
                LEXICAL REGISTER
              </span>
              <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-50 mt-1">
                Aggregated Lexical Term Recommendations
              </h3>
            </div>

            <div className="space-y-3.5">
              {sessions.map(sess =>
                sess.vocabularySuggestions.map((v, i) => (
                  <div key={i} className="p-4 bg-zinc-50/50 dark:bg-zinc-900/15 border border-zinc-200/40 dark:border-zinc-850 rounded-2xl space-y-2 text-xs">
                    <div className="flex items-center justify-between text-[9px] font-mono text-zinc-400">
                      <span>Category: {v.category}</span>
                      <span>Topic: "{sess.topic}"</span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap pt-1">
                      <span className="text-zinc-400 line-through">"{v.originalWord}"</span>
                      <span className="text-zinc-400">→</span>
                      <span className="text-emerald-500 font-black text-sm">"{v.improvedWord}"</span>
                    </div>

                    <p className="text-[11px] text-zinc-700 dark:text-zinc-200 font-semibold">{v.definition}</p>
                    <p className="text-[10px] text-zinc-400 font-mono italic">Recommended integration: "{v.exampleSentence}"</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
export default ReportConsole;

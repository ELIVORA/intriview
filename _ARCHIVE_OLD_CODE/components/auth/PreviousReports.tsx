/**
 * Path: /src/components/auth/PreviousReports.tsx
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Calendar, 
  Clock, 
  Award, 
  Download, 
  MessageSquare, 
  ChevronDown, 
  ChevronUp, 
  FileText 
} from "lucide-react";
import { enterpriseIntegration } from "../../services/integrationService";

interface InterviewRecord {
  id: string;
  type: string;
  score: number;
  clarity: number;
  grammarScore: number;
  confidence: number;
  eyeContactScore: number;
  transcript: string;
  date: string;
  duration?: string;
}

export function PreviousReports() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const memory = enterpriseIntegration.getGlobalMemory();
  const history: InterviewRecord[] = memory.interviewHistory || [];

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const downloadPDFReport = (record: InterviewRecord) => {
    // Generate a beautiful formatted text and open print dialog or trigger standard download
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>AI Interview Report - ${record.type}</title>
          <style>
            body { font-family: 'Inter', -apple-system, sans-serif; padding: 40px; color: #0f172a; line-height: 1.6; }
            .header { border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
            .title { font-size: 24px; font-weight: 700; color: #0f172a; }
            .meta { font-size: 14px; color: #64748b; margin-top: 5px; }
            .score-box { background: #eff6ff; padding: 20px; border-radius: 16px; border: 1px solid #bfdbfe; display: inline-block; margin-bottom: 30px; }
            .score { font-size: 36px; font-weight: 800; color: #2563eb; }
            .section { margin-bottom: 30px; }
            .section-title { font-size: 18px; font-weight: 700; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 15px; }
            .transcript { background: #f8fafc; padding: 18px; border-left: 4px solid #2563eb; border-radius: 8px; font-style: normal; font-family: monospace; font-size: 13px; white-space: pre-line; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">AI Interview Performance Report</div>
            <div class="meta">Session: ${record.type} | Date: ${new Date(record.date).toLocaleDateString()}</div>
          </div>
          <div class="score-box">
            <div style="font-size:12px; font-weight:700; text-transform:uppercase; color:#3b82f6;">Overall Technical Score</div>
            <div class="score">${record.score}%</div>
          </div>
          <div class="section">
            <div class="section-title">Core Competencies Breakdown</div>
            <ul>
              <li><strong>Communication Score:</strong> ${record.clarity || 85}%</li>
              <li><strong>Grammatical Accuracy:</strong> ${record.grammarScore || 90}%</li>
              <li><strong>Confidence & Delivery:</strong> ${record.confidence || 88}%</li>
              <li><strong>Gaze & Eye Contact Consistency:</strong> ${record.eyeContactScore || 85}%</li>
            </ul>
          </div>
          <div class="section">
            <div class="section-title">Interview Transcript</div>
            <div class="transcript">${record.transcript}</div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6 ic-feature-root ic-reports-workspace" id="saas-previous-reports-container">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-zinc-50">Previous Reports</h2>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
          Review your historic AI Interview sessions, cumulative scores, and conversational logs.
        </p>
      </div>

      {history.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-3xl flex flex-col items-center justify-center gap-4 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">No Interview Records Active</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
              You have not attempted any simulated interview rounds yet. Complete a mock studio interview to view detailed analytics and performance reports here.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((record) => {
            const isExpanded = expandedId === record.id;
            const recordDate = new Date(record.date);
            const formattedDate = recordDate.toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={record.id}
                className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-3xl overflow-hidden transition-all shadow-xs hover:shadow-md"
              >
                {/* Header Row */}
                <div
                  onClick={() => toggleExpand(record.id)}
                  className="p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/80 dark:hover:bg-zinc-850/50 transition-colors select-none"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="p-3 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-2xl shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100 truncate">
                        {record.type}
                      </h4>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {formattedDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {record.duration || "12 minutes"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-5 shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase tracking-wider block font-mono font-bold">
                        OVERALL SCORE
                      </span>
                      <span className="text-lg font-extrabold text-blue-600 dark:text-blue-400 font-mono">
                        {record.score}%
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadPDFReport(record);
                        }}
                        className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-slate-700 dark:text-zinc-200 rounded-xl transition-colors cursor-pointer"
                        title="Download PDF Report"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-100 rounded-xl transition-colors"
                        title="Toggle Transcript"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Collapsible Content */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-slate-200/80 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-950/40"
                    >
                      <div className="p-5 space-y-4">
                        {/* Scores breakdowns */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-3.5 rounded-2xl">
                            <span className="text-[10px] text-slate-500 dark:text-zinc-400 uppercase font-bold">Communication</span>
                            <span className="text-sm font-extrabold text-slate-900 dark:text-zinc-100 block mt-0.5 font-mono">
                              {record.clarity || 85}%
                            </span>
                          </div>
                          <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-3.5 rounded-2xl">
                            <span className="text-[10px] text-slate-500 dark:text-zinc-400 uppercase font-bold">Technical Knowledge</span>
                            <span className="text-sm font-extrabold text-slate-900 dark:text-zinc-100 block mt-0.5 font-mono">
                              {record.score}%
                            </span>
                          </div>
                          <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-3.5 rounded-2xl">
                            <span className="text-[10px] text-slate-500 dark:text-zinc-400 uppercase font-bold">Grammar & Syntax</span>
                            <span className="text-sm font-extrabold text-slate-900 dark:text-zinc-100 block mt-0.5 font-mono">
                              {record.grammarScore || 90}%
                            </span>
                          </div>
                          <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-3.5 rounded-2xl">
                            <span className="text-[10px] text-slate-500 dark:text-zinc-400 uppercase font-bold">Confidence & Delivery</span>
                            <span className="text-sm font-extrabold text-slate-900 dark:text-zinc-100 block mt-0.5 font-mono">
                              {record.confidence || 88}%
                            </span>
                          </div>
                        </div>

                        {/* Replay Transcript */}
                        <div className="space-y-2">
                          <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                            <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            Replay Transcript
                          </span>
                          <div className="p-4 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl max-h-60 overflow-y-auto">
                            <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed font-mono whitespace-pre-line">
                              {record.transcript}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  Square,
  RefreshCw,
  Sparkles,
  Volume2,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  FileText,
  Clock,
  Award,
  BookOpen,
  ChevronRight,
  Shield,
  HelpCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SpeakingSessionReport } from "./types";
import { PRACTICE_TOPICS, calculateSimulatedScores, addSpeakingSessionReport } from "./englishEngine";
import { recordCommunicationReport } from "../../services/candidateMemory";

export function SpeakingPractice() {
  const [selectedTopicId, setSelectedTopicId] = useState(PRACTICE_TOPICS[0].id);
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeAnalysisTab, setActiveAnalysisTab] = useState<"grammar" | "pronunciation" | "vocabulary" | "fluency" | "confidence">("grammar");

  // Simulated live writing transcript
  const [liveTranscript, setLiveTranscript] = useState("");
  const [report, setReport] = useState<SpeakingSessionReport | null>(null);

  // Audio / Waveform Visualizer refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timerRef = useRef<any | null>(null);

  const selectedTopic = PRACTICE_TOPICS.find(t => t.id === selectedTopicId) || PRACTICE_TOPICS[0];

  // Increment duration counter while recording
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  // Handle waveform drawing animation
  useEffect(() => {
    if (isRecording) {
      startCanvasAnimation();
    } else {
      stopCanvasAnimation();
    }
  }, [isRecording]);

  const startCanvasAnimation = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = canvas.width;
    let height = canvas.height;

    // Simulate simple beautiful voice waves
    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "rgba(99, 102, 241, 0.05)";
      ctx.fillRect(0, 0, width, height);

      // Draw horizontal baseline
      ctx.strokeStyle = "rgba(99, 102, 241, 0.1)";
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      // Draw random sound bars
      ctx.fillStyle = "#6366f1";
      const barCount = 45;
      const barWidth = 4;
      const barGap = 2;

      for (let i = 0; i < barCount; i++) {
        const x = i * (barWidth + barGap);
        // Random audio amplitude reacting
        const amplitude = Math.random() * (height * 0.7);
        const y = (height - amplitude) / 2;
        ctx.fillRect(x, y, barWidth, amplitude);
      }

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();
  };

  const stopCanvasAnimation = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordDuration(0);
    setReport(null);
    setLiveTranscript("Initializing secure microphone gateway...");

    // Gradually append simulated natural spoken sentences to display the real-time speech engine capability
    const sampleSentences = [
      "Hello, my name is Aarav. ",
      "I am having two years experience in backend and cloud architecture. ",
      "In our final year project, we leverage AWS serverless and optimized SQL server database. ",
      "This system was discussed about in multiple code sprints with stakeholders. "
    ];

    let sentenceIdx = 0;
    const typingInterval = setInterval(() => {
      if (sentenceIdx < sampleSentences.length) {
        setLiveTranscript(prev => (prev === "Initializing secure microphone gateway..." ? "" : prev) + sampleSentences[sentenceIdx]);
        sentenceIdx++;
      } else {
        clearInterval(typingInterval);
      }
    }, 3000);

    (timerRef as any).currentTyping = typingInterval;
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    if ((timerRef as any).currentTyping) {
      clearInterval((timerRef as any).currentTyping);
    }

    setIsAnalyzing(true);

    // Simulate precise analytics and compilation in under 2 seconds
    setTimeout(() => {
      const metrics = calculateSimulatedScores(liveTranscript);
      const generatedReport: SpeakingSessionReport = {
        id: `rep_${Date.now()}`,
        timestamp: new Date().toISOString(),
        topic: selectedTopic.label,
        durationSeconds: recordDuration,
        transcript: liveTranscript,
        ...metrics
      };

      addSpeakingSessionReport(generatedReport);
      // Persist communication evidence into the same Candidate Memory used by
      // Resume Practice and AI Mock Interviews. The local report remains a UI
      // cache; the server is the long-term source of truth.
      recordCommunicationReport(generatedReport).catch((error) => {
        console.warn("Candidate Memory communication sync skipped:", error);
      });
      setReport(generatedReport);
      setIsAnalyzing(false);
    }, 1500);
  };

  // Speaks aloud the live transcript via standard browser TTS
  const handleReplayTTS = () => {
    if (!liveTranscript) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(liveTranscript);
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error("TTS output failed in this browser", e);
    }
  };

  const getPriorityStyle = (p: string) => {
    switch (p) {
      case "tense":
        return "text-rose-500 bg-rose-500/10 border-rose-500/20";
      case "subject-verb":
        return "text-amber-500 bg-amber-500/10 border-amber-500/20";
      default:
        return "text-indigo-500 bg-indigo-500/10 border-indigo-500/20";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full" id="speaking-practice-screen">
      
      {/* Col 1: Topic Select & Voice Control Gate */}
      <div className="lg:col-span-1 bg-white/60 dark:bg-zinc-950/60 backdrop-blur-xl border border-zinc-200/60 dark:border-zinc-850 p-6 rounded-3xl shadow-xs h-fit space-y-6">
        <div>
          <span className="text-[10px] text-indigo-500 font-mono font-bold tracking-widest uppercase block">
            AI SPEAKING GATEWAY
          </span>
          <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-50 mt-1">
            Speaking Sandbox Practice
          </h3>
        </div>

        {/* Topic Picker */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-zinc-400 uppercase font-mono">
            Select Topic / Pitch Parameter
          </label>
          <select
            value={selectedTopicId}
            onChange={(e) => setSelectedTopicId(e.target.value)}
            disabled={isRecording}
            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-xs focus:outline-none text-zinc-850 dark:text-zinc-100 disabled:opacity-50 cursor-pointer"
          >
            {PRACTICE_TOPICS.map(topic => (
              <option key={topic.id} value={topic.id}>
                {topic.label} ({topic.category})
              </option>
            ))}
          </select>
        </div>

        {/* Prompt Info */}
        <div className="p-4 rounded-2xl bg-indigo-500/[0.03] border border-indigo-500/10 space-y-1.5">
          <span className="text-[9px] font-mono font-bold text-indigo-500 uppercase flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            <span>EXAMINATION PROMPT</span>
          </span>
          <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed font-sans">
            "{selectedTopic.prompt}"
          </p>
        </div>

        {/* Interactive canvas visualizer */}
        <div className="border border-zinc-200/50 dark:border-zinc-850 rounded-2xl bg-zinc-100 dark:bg-zinc-950 overflow-hidden relative">
          <canvas
            ref={canvasRef}
            width={280}
            height={90}
            className="w-full h-[90px] block"
          />
          {isRecording && (
            <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-rose-500 text-white text-[9px] font-mono font-bold uppercase tracking-wider animate-pulse flex items-center gap-1">
              <span>● REC</span>
              <span>{recordDuration}s</span>
            </div>
          )}
        </div>

        {/* Recording Action Buttons */}
        <div className="flex gap-3">
          {!isRecording ? (
            <button
              onClick={handleStartRecording}
              disabled={isAnalyzing}
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Mic className="w-4 h-4" />
              <span>Record Naturally</span>
            </button>
          ) : (
            <button
              onClick={handleStopRecording}
              className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Square className="w-4 h-4" />
              <span>Complete Recording</span>
            </button>
          )}

          {liveTranscript && !isRecording && (
            <button
              onClick={() => {
                setLiveTranscript("");
                setReport(null);
                setRecordDuration(0);
              }}
              className="p-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-200 rounded-2xl border border-zinc-200/40 dark:border-zinc-800 transition-colors"
              title="Reset practice"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Security watermark */}
        <div className="pt-2 flex items-center justify-between text-[9px] font-mono text-zinc-400">
          <span className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            <span>Speech Handshake Secure</span>
          </span>
          <span className="text-indigo-500 font-bold">● ONLINE PIPELINE</span>
        </div>
      </div>

      {/* Col 2 & 3: Live Transcript & Real-Time Feedback tabs */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Live Transcript / Speech Display */}
        <div className="bg-white/60 dark:bg-zinc-950/60 backdrop-blur-xl border border-zinc-200/60 dark:border-zinc-850 p-6 rounded-3xl shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-3">
            <span className="text-[10px] text-indigo-500 font-mono font-bold tracking-widest uppercase block">
              REALTIME SPEECH INTERPRETATION
            </span>
            {liveTranscript && (
              <button
                onClick={handleReplayTTS}
                className="text-[10px] text-indigo-500 hover:underline font-bold flex items-center gap-1"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Play Speech Synthesis</span>
              </button>
            )}
          </div>

          <div className="min-h-[100px] bg-zinc-50/50 dark:bg-zinc-900/10 rounded-2xl p-4 border border-zinc-100 dark:border-zinc-900">
            {liveTranscript ? (
              <p className="text-xs text-zinc-700 dark:text-zinc-200 leading-relaxed font-sans italic">
                "{liveTranscript}"
              </p>
            ) : (
              <p className="text-xs text-zinc-400 font-sans italic text-center py-6">
                Click "Record Naturally" above to begin natural speech analysis.
              </p>
            )}
          </div>
        </div>

        {/* Loading / Analyzing status */}
        {isAnalyzing && (
          <div className="p-12 bg-white/60 dark:bg-zinc-950/60 backdrop-blur-xl border border-zinc-200/60 dark:border-zinc-850 rounded-3xl flex flex-col items-center justify-center text-center space-y-4">
            <div className="p-4 bg-indigo-500/10 text-indigo-600 rounded-full animate-spin">
              <RefreshCw className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-xs font-black text-zinc-900 dark:text-zinc-50 uppercase font-mono tracking-wider">
                Compiling Linguistic Analytics...
              </h4>
              <p className="text-[10px] text-zinc-400 mt-1">
                Calculating grammatical structures, word stresses, accents and pronunciation clarity.
              </p>
            </div>
          </div>
        )}

        {/* Evaluation report display */}
        {report && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Quick Summary Bar */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { label: "Grammar Score", val: report.grammarScore },
                { label: "Pronunciation", val: report.pronunciationScore },
                { label: "Vocabulary", val: report.vocabularyScore },
                { label: "Fluency", val: report.fluencyScore },
                { label: "Confidence", val: report.confidenceScore }
              ].map((sc, i) => (
                <div key={i} className="bg-white/60 dark:bg-zinc-950/60 backdrop-blur-xl border border-zinc-200/40 dark:border-zinc-850 p-3.5 rounded-2xl text-center space-y-1">
                  <span className="text-[8px] font-mono font-bold text-zinc-400 uppercase block truncate">{sc.label}</span>
                  <span className="text-base font-black text-indigo-600 dark:text-indigo-400 font-mono block">{sc.val}%</span>
                </div>
              ))}
            </div>

            {/* Detailed Feedback Tabs Cards */}
            <div className="bg-white/60 dark:bg-zinc-950/60 backdrop-blur-xl border border-zinc-200/60 dark:border-zinc-850 p-6 rounded-3xl shadow-xs space-y-5">
              
              {/* Tab selector buttons */}
              <div className="flex gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-900/60 rounded-xl border border-zinc-200/30 dark:border-zinc-850 overflow-x-auto shrink-0">
                {(["grammar", "pronunciation", "vocabulary", "fluency", "confidence"] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveAnalysisTab(tab)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold shrink-0 capitalize transition-all cursor-pointer ${
                      activeAnalysisTab === tab
                        ? "bg-white dark:bg-zinc-950 text-indigo-600 shadow-xs border border-zinc-200/40"
                        : "text-zinc-500 hover:text-zinc-850 dark:hover:text-zinc-200"
                    }`}
                  >
                    {tab} Analysis
                  </button>
                ))}
              </div>

              {/* Tab Context Switch */}
              <div className="min-h-[160px]">
                
                {/* 1. Grammar Tab */}
                {activeAnalysisTab === "grammar" && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-indigo-500" />
                      <span className="text-xs font-black text-zinc-900 dark:text-zinc-100">
                        Grammar Errors & Corrections ({report.grammarErrors.length})
                      </span>
                    </div>

                    {report.grammarErrors.length === 0 ? (
                      <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 flex items-center gap-2 text-xs text-emerald-600">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Perfect Syntax! No grammatical errors identified in this speech block.</span>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {report.grammarErrors.map((err, idx) => (
                          <div key={idx} className="p-4 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/20 border border-zinc-150/50 dark:border-zinc-850 space-y-2.5">
                            <div className="flex items-center justify-between gap-2">
                              <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase ${getPriorityStyle(err.type)}`}>
                                Error: {err.type}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                              <div>
                                <span className="text-[9px] font-mono font-bold text-rose-500 uppercase block mb-1">Original spoken:</span>
                                <p className="text-zinc-600 dark:text-zinc-300 italic">"... {err.original} ..."</p>
                              </div>
                              <div>
                                <span className="text-[9px] font-mono font-bold text-emerald-500 uppercase block mb-1">Recommended correction:</span>
                                <p className="text-zinc-800 dark:text-zinc-100 font-semibold italic">"... {err.corrected} ..."</p>
                              </div>
                            </div>

                            <p className="text-[10px] text-zinc-400 font-sans pt-1.5 border-t border-zinc-100 dark:border-zinc-800 flex items-start gap-1">
                              <Lightbulb className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                              <span>{err.explanation}</span>
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 2. Pronunciation Tab */}
                {activeAnalysisTab === "pronunciation" && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-indigo-500" />
                      <span className="text-xs font-black text-zinc-900 dark:text-zinc-100">
                        Pronunciation Detail logs ({report.pronunciationErrors.length})
                      </span>
                    </div>

                    <div className="space-y-3">
                      {report.pronunciationErrors.map((err, idx) => (
                        <div key={idx} className="p-4 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/20 border border-zinc-150/50 dark:border-zinc-850 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                          <div className="space-y-1">
                            <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200 block text-sm">
                              "{err.word}"
                            </span>
                            <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono">
                              <span>Expected: <strong className="text-indigo-500">{err.expected}</strong></span>
                              <span>•</span>
                              <span>Actual spoken: <strong className="text-rose-500">{err.actual}</strong></span>
                            </div>
                            <p className="text-[10px] text-zinc-500 leading-relaxed font-sans">{err.suggestion}</p>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-[8px] font-mono font-bold text-zinc-400 block uppercase">Clarity Score</span>
                            <span className="text-base font-black text-amber-500 font-mono">{err.score}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Vocabulary Tab */}
                {activeAnalysisTab === "vocabulary" && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-500" />
                      <span className="text-xs font-black text-zinc-900 dark:text-zinc-100">
                        Interview Vocabulary Suggestion Engine
                      </span>
                    </div>

                    <div className="space-y-3">
                      {report.vocabularySuggestions.map((v, idx) => (
                        <div key={idx} className="p-4 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/20 border border-zinc-150/50 dark:border-zinc-850 space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-mono font-bold text-indigo-500 bg-indigo-500/10 px-1.5 py-0.5 rounded">
                              Category: {v.category}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap pt-1">
                            <span className="text-zinc-400 line-through">"{v.originalWord}"</span>
                            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                            <span className="text-emerald-500 font-black text-sm">"{v.improvedWord}"</span>
                          </div>

                          <p className="text-[11px] text-zinc-600 dark:text-zinc-300 font-semibold">{v.definition}</p>
                          <p className="text-[10px] text-zinc-400 font-mono italic">Example: "{v.exampleSentence}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Fluency Tab */}
                {activeAnalysisTab === "fluency" && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-indigo-500" />
                      <span className="text-xs font-black text-zinc-900 dark:text-zinc-100">
                        Linguistic Fluency & Filler word frequencies
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Metric lists */}
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between p-3 bg-zinc-50/50 dark:bg-zinc-900/10 rounded-xl text-xs">
                          <span className="text-zinc-500">Speaking Speed</span>
                          <strong className="font-mono text-zinc-800 dark:text-zinc-100">{report.fluencyMetrics.wpm} WPM</strong>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-zinc-50/50 dark:bg-zinc-900/10 rounded-xl text-xs">
                          <span className="text-zinc-500">Natural Breathing Pauses</span>
                          <strong className="font-mono text-zinc-800 dark:text-zinc-100">{report.fluencyMetrics.naturalPausesCount}</strong>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-zinc-50/50 dark:bg-zinc-900/10 rounded-xl text-xs">
                          <span className="text-zinc-500">Unintentional Hesitations</span>
                          <strong className="font-mono text-zinc-800 dark:text-zinc-100">{report.fluencyMetrics.hesitationsCount}</strong>
                        </div>
                      </div>

                      {/* Filler Reduction plan */}
                      <div className="p-4 bg-indigo-500/[0.02] border border-indigo-500/10 rounded-2xl space-y-2">
                        <span className="text-[10px] font-bold font-mono text-indigo-500 uppercase block">Filler Words Reduction</span>
                        
                        {report.fluencyMetrics.fillerWordsCount === 0 ? (
                          <p className="text-[11px] text-emerald-600 font-medium">Amazing! Zero filler words detected in your session.</p>
                        ) : (
                          <div className="space-y-1.5">
                            <p className="text-[10px] text-zinc-400">Reduce occurrences of filler terms for polished pitches:</p>
                            <div className="flex flex-wrap gap-1.5">
                              {report.fluencyMetrics.fillerWordsDetected.map((f, i) => (
                                <span key={i} className="px-2 py-0.5 bg-rose-500/10 text-rose-500 rounded text-[10px] font-mono font-bold">
                                  {f.word}: {f.count}x
                                </span>
                              ))}
                            </div>
                            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 text-[10px] text-zinc-500 leading-normal flex items-start gap-1 font-sans">
                              <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                              <span>Take deliberate 1-second pauses instead of utilizing default filler terms.</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. Confidence Tab */}
                {activeAnalysisTab === "confidence" && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-emerald-500" />
                      <span className="text-xs font-black text-zinc-900 dark:text-zinc-100">
                        Acoustic Energy & Confidence Index
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      {[
                        { label: "Voice confidence", val: report.confidenceMetrics.voiceConfidence },
                        { label: "Tone stability", val: report.confidenceMetrics.toneStability },
                        { label: "Vocal energy", val: report.confidenceMetrics.energyLevel },
                        { label: "Expression index", val: report.confidenceMetrics.expressionScore }
                      ].map((item, idx) => (
                        <div key={idx} className="p-3 bg-zinc-50/50 dark:bg-zinc-900/10 border border-zinc-150/40 dark:border-zinc-850 rounded-xl text-center space-y-1">
                          <span className="text-[9px] font-mono text-zinc-400 uppercase block">{item.label}</span>
                          <strong className="text-sm font-black text-zinc-800 dark:text-zinc-100 font-mono block">{item.val}%</strong>
                        </div>
                      ))}
                    </div>

                    <div className="p-3 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 text-[11px] leading-relaxed text-emerald-600 font-sans flex items-start gap-1.5">
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>The acoustic stability matches Tier-1 tech interview expectation. Keep the speaking momentum balanced and articulate!</span>
                    </div>
                  </div>
                )}

              </div>

            </div>

          </motion.div>
        )}

      </div>

    </div>
  );
}
export default SpeakingPractice;

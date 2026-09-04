/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  Volume2,
  Square,
  HelpCircle,
  CheckCircle2,
  Award,
  BookOpen,
  ChevronRight,
  Smile,
  AlertTriangle,
  RefreshCw
} from "lucide-react";
import { LISTENING_EXERCISES } from "./englishEngine";

export function ListeningPractice() {
  const [activeExerciseIdx, setActiveExerciseIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Quiz user choices
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: number }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [exerciseScore, setExerciseScore] = useState<number | null>(null);

  const activeExercise = LISTENING_EXERCISES[activeExerciseIdx];

  const handleStartAudio = () => {
    setIsPlaying(true);
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(activeExercise.audioScript);
      utterance.rate = 0.92; // Dictation pacing is slightly slower for absolute comprehension
      
      utterance.onend = () => {
        setIsPlaying(false);
      };
      utterance.onerror = () => {
        setIsPlaying(false);
      };
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error("Audio dictation pipeline failed in this browser", e);
      setIsPlaying(false);
    }
  };

  const handleStopAudio = () => {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {}
    setIsPlaying(false);
  };

  const handleSelectOption = (questionId: string, optionIdx: number) => {
    if (isSubmitted) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionIdx
    }));
  };

  const handleSubmitAnswers = () => {
    // Check if user answered all questions
    const unanswered = activeExercise.questions.some(q => selectedAnswers[q.id] === undefined);
    if (unanswered) return;

    let correctCount = 0;
    activeExercise.questions.forEach(q => {
      if (selectedAnswers[q.id] === q.correctAnswerIndex) {
        correctCount++;
      }
    });

    const scorePercentage = Math.round((correctCount / activeExercise.questions.length) * 100);
    setExerciseScore(scorePercentage);
    setIsSubmitted(true);
  };

  const handleResetExercise = () => {
    setSelectedAnswers({});
    setIsSubmitted(false);
    setExerciseScore(null);
    handleStopAudio();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full" id="listening-practice-screen">
      
      {/* Col 1: Audio Playback controller */}
      <div className="lg:col-span-1 bg-white/60 dark:bg-zinc-950/60 backdrop-blur-xl border border-zinc-200/60 dark:border-zinc-850 p-6 rounded-3xl shadow-xs space-y-6 h-fit">
        <div>
          <span className="text-[10px] text-indigo-500 font-mono font-bold tracking-widest uppercase block">
            LISTENING LAB
          </span>
          <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-50 mt-1">
            Corporate Briefing Audio
          </h3>
        </div>

        {/* Exercise picker selection lists */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-zinc-400 uppercase font-mono block">
            Select Listening Module
          </label>
          <div className="space-y-2">
            {LISTENING_EXERCISES.map((ex, idx) => (
              <button
                key={ex.id}
                onClick={() => {
                  setActiveExerciseIdx(idx);
                  handleResetExercise();
                }}
                disabled={isPlaying}
                className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all flex items-center justify-between gap-2 cursor-pointer ${
                  activeExerciseIdx === idx
                    ? "bg-indigo-600 border-indigo-600 text-white font-bold"
                    : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100"
                }`}
              >
                <span className="truncate">{ex.title}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>

        {/* Interactive sound player visual controller card */}
        <div className="p-5 bg-zinc-50 dark:bg-zinc-900/40 rounded-2xl border border-zinc-150 dark:border-zinc-850 text-center space-y-4">
          <span className="text-[8px] font-mono text-zinc-400 uppercase block tracking-widest">
            Acoustic Terminal Playback
          </span>

          <div className="flex justify-center">
            {isPlaying ? (
              <button
                onClick={handleStopAudio}
                className="p-6 bg-rose-500 text-white rounded-full hover:bg-rose-600 shadow-lg shadow-rose-500/20 transition-transform hover:scale-105 cursor-pointer flex items-center justify-center"
              >
                <Square className="w-7 h-7" />
              </button>
            ) : (
              <button
                onClick={handleStartAudio}
                className="p-6 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-transform hover:scale-105 cursor-pointer flex items-center justify-center"
              >
                <Volume2 className="w-7 h-7" />
              </button>
            )}
          </div>

          <div className="space-y-1">
            <h4 className="text-xs font-bold text-zinc-850 dark:text-zinc-100">
              {isPlaying ? "Speaker Dictating Briefing..." : "Ready to Listen"}
            </h4>
            <p className="text-[10px] text-zinc-400 leading-normal">
              {isPlaying ? "Listen carefully for numerical benefits, deadlines, dates and design choices." : "Click Play to dictate the sprint lecture. Headphones recommended."}
            </p>
          </div>

          {isPlaying && (
            <div className="flex justify-center items-center gap-1.5 py-1">
              {[0, 1, 2, 3, 4].map(b => (
                <span
                  key={b}
                  className="w-1 bg-indigo-500 rounded-full animate-bounce"
                  style={{
                    height: `${12 + Math.random() * 24}px`,
                    animationDelay: `${b * 0.15}s`,
                    animationDuration: "0.6s"
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <div className="p-3.5 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl text-[10px] text-zinc-500 leading-normal flex items-start gap-1.5">
          <BookOpen className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
          <span>Listening comprehension assesses your ability to decode speech velocity, global stresses, and semantic goals—a key criteria for international stakeholder calls.</span>
        </div>
      </div>

      {/* Col 2 & 3: Interactive Comprehension Questions */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Questions card panel */}
        <div className="bg-white/60 dark:bg-zinc-950/60 backdrop-blur-xl border border-zinc-200/60 dark:border-zinc-850 p-6 rounded-3xl shadow-xs space-y-6">
          <div className="pb-4 border-b border-zinc-100 dark:border-zinc-900 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-indigo-500 font-mono font-bold tracking-widest uppercase block">
                COMPREHENSION MATRIX
              </span>
              <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-50 mt-1">
                Syllable & Metric Analysis Questionnaire
              </h3>
            </div>
            {exerciseScore !== null && (
              <span className="px-3 py-1 bg-indigo-600 text-white font-mono text-xs font-black rounded-xl shadow-xs">
                Score: {exerciseScore}%
              </span>
            )}
          </div>

          <div className="space-y-6">
            {activeExercise.questions.map((q, qIdx) => {
              const userChoice = selectedAnswers[q.id];
              const isCorrectAnswer = userChoice === q.correctAnswerIndex;

              return (
                <div key={q.id} className="space-y-3">
                  <h4 className="text-xs font-black text-zinc-850 dark:text-zinc-200 flex items-start gap-2">
                    <span className="font-mono text-indigo-500">Q{qIdx + 1}.</span>
                    <span>{q.questionText}</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {q.options.map((opt, oIdx) => {
                      const isSelected = userChoice === oIdx;
                      const isRightOption = oIdx === q.correctAnswerIndex;

                      let optStyle = "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100";
                      if (isSubmitted) {
                        if (isRightOption) {
                          optStyle = "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 font-bold";
                        } else if (isSelected) {
                          optStyle = "bg-rose-500/10 border-rose-500/20 text-rose-500";
                        } else {
                          optStyle = "opacity-50 bg-zinc-50 dark:bg-zinc-900 text-zinc-400 border-zinc-200";
                        }
                      } else if (isSelected) {
                        optStyle = "bg-indigo-600 border-indigo-600 text-white font-bold";
                      }

                      return (
                        <button
                          key={oIdx}
                          onClick={() => handleSelectOption(q.id, oIdx)}
                          disabled={isSubmitted}
                          className={`text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between cursor-pointer ${optStyle}`}
                        >
                          <span>{opt}</span>
                          {isSubmitted && isRightOption && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Answer Controls button */}
          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-900 flex justify-between items-center">
            {isSubmitted ? (
              <button
                onClick={handleResetExercise}
                className="px-5 py-2.5 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 text-zinc-600 dark:text-zinc-200 rounded-xl text-xs font-bold border border-zinc-200/45 dark:border-zinc-800 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Exercise</span>
              </button>
            ) : (
              <button
                onClick={handleSubmitAnswers}
                disabled={activeExercise.questions.some(q => selectedAnswers[q.id] === undefined)}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm disabled:opacity-50 cursor-pointer"
              >
                Submit Answers
              </button>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
export default ListeningPractice;

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  Lightbulb,
  Check,
  ChevronRight,
  UserCheck
} from "lucide-react";
import { calculateSimulatedScores } from "./englishEngine";

export function GrammarPractice() {
  const [userInput, setUserInput] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [checkedResult, setCheckedResult] = useState<any | null>(null);

  // Pre-seeded template incorrect interview sentences to help students learn
  const templateSentences = [
    { label: "Tense Mistake", text: "I am having two years experience in building web applications." },
    { label: "Preposition Excess", text: "We discussed about the scalable database and server structures." },
    { label: "Subject-Verb Gaps", text: "Each of the software engineers are coding backend microservices." },
    { label: "Article Mistake", text: "I built an scalable cloud platform to host the enterprise SaaS." }
  ];

  // Quick grammar quiz game states
  const [activeQuizIndex, setActiveQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showQuizFeedback, setShowQuizFeedback] = useState(false);

  const grammarQuizzes = [
    {
      sentence: "Our team _____ the entire software launch last Friday night.",
      options: ["has spearheaded", "spearheaded", "spearheading", "was spearheaded"],
      correctIdx: 1,
      explanation: "Use the simple past tense ('spearheaded') for actions completed at a specific time in the past ('last Friday night')."
    },
    {
      sentence: "Every applicant _____ required to upload their digital portfolio.",
      options: ["are", "is", "were", "have"],
      correctIdx: 1,
      explanation: "Indefinite pronouns like 'every' or 'each' are grammatically singular and require singular verbs ('is')."
    },
    {
      sentence: "We should focus _____ optimizing the query execution speed.",
      options: ["on", "at", "about", "for"],
      correctIdx: 0,
      explanation: "The verb 'focus' takes the preposition 'on' when specifying the target of optimization."
    }
  ];

  const handleCheckGrammar = () => {
    if (!userInput.trim()) return;

    setIsChecking(true);
    setCheckedResult(null);

    // Simulate real-time parsing in under 1 second
    setTimeout(() => {
      const evaluation = calculateSimulatedScores(userInput);
      setCheckedResult({
        score: evaluation.grammarScore,
        errors: evaluation.grammarErrors,
        textChecked: userInput
      });
      setIsChecking(false);
    }, 850);
  };

  const handleApplyCorrection = (original: string, corrected: string) => {
    setUserInput(prev => prev.replace(original, corrected));
    // Clear the error card since they corrected it
    if (checkedResult) {
      setCheckedResult({
        ...checkedResult,
        errors: checkedResult.errors.filter((e: any) => e.original !== original)
      });
    }
  };

  const handleSelectQuizOption = (idx: number) => {
    setSelectedAnswer(idx);
    setShowQuizFeedback(true);
  };

  const handleNextQuiz = () => {
    setSelectedAnswer(null);
    setShowQuizFeedback(false);
    setActiveQuizIndex(prev => (prev + 1) % grammarQuizzes.length);
  };

  const currentQuiz = grammarQuizzes[activeQuizIndex];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full" id="grammar-practice-screen">
      
      {/* Col 1: Grammar Quick Quiz Check */}
      <div className="lg:col-span-1 bg-white/60 dark:bg-zinc-950/60 backdrop-blur-xl border border-zinc-200/60 dark:border-zinc-850 p-6 rounded-3xl shadow-xs space-y-6 h-fit">
        <div>
          <span className="text-[10px] text-indigo-500 font-mono font-bold tracking-widest uppercase block">
            GRAMMAR BOOTCAMP
          </span>
          <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-50 mt-1">
            Sentence Structure Quiz
          </h3>
        </div>

        {/* Quiz panel */}
        <div className="space-y-4">
          <div className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 space-y-2">
            <span className="text-[8px] font-mono font-bold text-indigo-500 uppercase tracking-widest block">
              QUIZ QUESTION {activeQuizIndex + 1}
            </span>
            <p className="text-xs text-zinc-800 dark:text-zinc-200 font-bold leading-relaxed">
              "{currentQuiz.sentence}"
            </p>
          </div>

          <div className="space-y-2">
            {currentQuiz.options.map((option, idx) => {
              const isSelected = selectedAnswer === idx;
              const isCorrect = idx === currentQuiz.correctIdx;
              
              let optionStyle = "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100";
              if (showQuizFeedback) {
                if (isCorrect) {
                  optionStyle = "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 font-bold";
                } else if (isSelected) {
                  optionStyle = "bg-rose-500/10 border-rose-500/20 text-rose-500";
                } else {
                  optionStyle = "opacity-50 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-400";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => !showQuizFeedback && handleSelectQuizOption(idx)}
                  disabled={showQuizFeedback}
                  className={`w-full text-left p-3 rounded-xl text-xs border transition-all flex items-center justify-between cursor-pointer ${optionStyle}`}
                >
                  <span>{option}</span>
                  {showQuizFeedback && isCorrect && <Check className="w-4 h-4 text-emerald-500 shrink-0" />}
                </button>
              );
            })}
          </div>

          {showQuizFeedback && (
            <div className="space-y-3.5 pt-3 border-t border-zinc-100 dark:border-zinc-900">
              <div className="p-3 bg-zinc-50/50 dark:bg-zinc-900/10 rounded-xl text-[10px] text-zinc-500 leading-normal flex items-start gap-1.5">
                <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                <span>{currentQuiz.explanation}</span>
              </div>
              <button
                onClick={handleNextQuiz}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Next Grammar Quiz
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Col 2 & 3: Interactive Sandbox Editor */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Editor Box */}
        <div className="bg-white/60 dark:bg-zinc-950/60 backdrop-blur-xl border border-zinc-200/60 dark:border-zinc-850 p-6 rounded-3xl shadow-xs space-y-4">
          <div>
            <span className="text-[10px] text-indigo-500 font-mono font-bold tracking-widest uppercase block">
              SYNTAX RADAR
            </span>
            <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-50 mt-1">
              Interactive Grammar & Structural Sandbox
            </h3>
          </div>

          {/* Quick incorrect template buttons */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 shrink-0">
            {templateSentences.map((temp, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setUserInput(temp.text);
                  setCheckedResult(null);
                }}
                className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-900 text-zinc-500 hover:text-zinc-850 dark:hover:text-zinc-200 text-[9px] font-bold rounded-lg border border-zinc-200/25 dark:border-zinc-850 transition-colors cursor-pointer"
              >
                {temp.label}
              </button>
            ))}
          </div>

          {/* User sandbox textarea input */}
          <div className="relative">
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type or paste any interview sentences here (e.g., 'I am having two years experience')..."
              rows={4}
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 text-xs focus:outline-none focus:border-indigo-500 text-zinc-800 dark:text-zinc-100 leading-relaxed font-sans"
            />
          </div>

          {/* Trigger analysis button */}
          <div className="flex justify-between items-center gap-4">
            <button
              onClick={() => {
                setUserInput("");
                setCheckedResult(null);
              }}
              className="text-xs text-zinc-400 hover:underline font-bold"
            >
              Clear Editor
            </button>
            <button
              onClick={handleCheckGrammar}
              disabled={isChecking || !userInput.trim()}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              {isChecking ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>Verify Grammatical Syntax</span>
            </button>
          </div>
        </div>

        {/* Checked Grammar analysis outputs */}
        {checkedResult && (
          <div className="bg-white/60 dark:bg-zinc-950/60 backdrop-blur-xl border border-zinc-200/60 dark:border-zinc-850 p-6 rounded-3xl shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-3">
              <span className="text-xs font-black text-zinc-800 dark:text-zinc-100">Structural Correction Output</span>
              <div className="text-right">
                <span className="text-[8px] font-mono text-zinc-400 block uppercase">Grammar score</span>
                <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 font-mono block">{checkedResult.score}%</span>
              </div>
            </div>

            {checkedResult.errors.length === 0 ? (
              <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 flex items-center gap-2 text-xs text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
                <span>Excellent spelling & tense alignment! No structural errors identified in this segment.</span>
              </div>
            ) : (
              <div className="space-y-4">
                {checkedResult.errors.map((err: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/20 border border-zinc-200/40 dark:border-zinc-850 space-y-3 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-mono font-bold text-indigo-500 bg-indigo-500/10 px-1.5 py-0.5 rounded uppercase">
                        {err.type} Alignment
                      </span>
                      <button
                        onClick={() => handleApplyCorrection(err.original, err.corrected)}
                        className="text-[10px] text-indigo-500 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Apply Auto-Fix</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 leading-relaxed">
                      <div>
                        <span className="text-[8px] font-mono font-bold text-rose-500 uppercase block mb-1">Spoken Incorrect:</span>
                        <p className="text-zinc-600 dark:text-zinc-300 italic">"... {err.original} ..."</p>
                      </div>
                      <div>
                        <span className="text-[8px] font-mono font-bold text-emerald-500 uppercase block mb-1">Polished interview standard:</span>
                        <p className="text-zinc-800 dark:text-zinc-100 font-semibold italic">"... {err.corrected} ..."</p>
                      </div>
                    </div>

                    <div className="p-2.5 bg-zinc-100 dark:bg-zinc-900/50 rounded-xl text-[10px] text-zinc-400 flex items-start gap-1.5">
                      <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>{err.explanation}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
}
export default GrammarPractice;

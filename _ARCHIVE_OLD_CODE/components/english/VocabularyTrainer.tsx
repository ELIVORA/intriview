/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  Sparkles,
  Volume2,
  CheckCircle2,
  Search,
  BookOpen,
  Award,
  Zap,
  HelpCircle,
  Lightbulb
} from "lucide-react";
import { VOCABULARY_LIBRARY } from "./englishEngine";

export function VocabularyTrainer() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");

  // Daily challenge game states
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [selectedDefinition, setSelectedDefinition] = useState<string | null>(null);
  const [solvedPairs, setSolvedPairs] = useState<string[]>([]);
  const [showGameFinished, setShowGameFinished] = useState(false);
  const [gameScore, setGameScore] = useState(0);

  // Static items for daily challenge matching game
  const challengePairs = [
    { word: "leverage", definition: "Use something to its maximum advantage." },
    { word: "optimize", definition: "Make the best or most effective use of a situation or resource." },
    { word: "spearhead", definition: "Lead an attack, movement, or business initiative." },
    { word: "mitigate", definition: "Make less severe, serious, or painful." }
  ];

  // Shuffled options for columns
  const shuffledWords = ["mitigate", "leverage", "spearhead", "optimize"];
  const shuffledDefinitions = [
    "Make less severe, serious, or painful.",
    "Use something to its maximum advantage.",
    "Make the best or most effective use of a situation or resource.",
    "Lead an attack, movement, or business initiative."
  ];

  const handlePlayTTS = (word: string, example: string) => {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(`${word}. For example: ${example}`);
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error("TTS failed", e);
    }
  };

  const handleSelectWord = (word: string) => {
    if (solvedPairs.includes(word)) return;
    setSelectedWord(word);
    checkMatch(word, selectedDefinition);
  };

  const handleSelectDefinition = (definition: string) => {
    if (challengePairs.some(p => p.definition === definition && solvedPairs.includes(p.word))) return;
    setSelectedDefinition(definition);
    checkMatch(selectedWord, definition);
  };

  const checkMatch = (word: string | null, definition: string | null) => {
    if (!word || !definition) return;

    const correctPair = challengePairs.find(p => p.word === word && p.definition === definition);
    if (correctPair) {
      const updated = [...solvedPairs, word];
      setSolvedPairs(updated);
      setGameScore(prev => prev + 50);

      if (updated.length === challengePairs.length) {
        setShowGameFinished(true);
      }
    }

    // Reset selection tags
    setSelectedWord(null);
    setSelectedDefinition(null);
  };

  const handleResetChallenge = () => {
    setSolvedPairs([]);
    setShowGameFinished(false);
    setGameScore(0);
    setSelectedWord(null);
    setSelectedDefinition(null);
  };

  // Filter criteria
  const filteredVocabulary = VOCABULARY_LIBRARY.filter(v => {
    const matchesSearch = v.improved.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          v.original.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          v.definition.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = activeCategory === "All" || v.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ["All", "Business English", "Action Words", "Professional", "Interview", "Technical"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full" id="vocabulary-trainer-screen">
      
      {/* Col 1: Daily Matching Game & Vocabulary Challenge */}
      <div className="lg:col-span-1 bg-white/60 dark:bg-zinc-950/60 backdrop-blur-xl border border-zinc-200/60 dark:border-zinc-850 p-6 rounded-3xl shadow-xs space-y-6 h-fit">
        <div>
          <span className="text-[10px] text-indigo-500 font-mono font-bold tracking-widest uppercase block">
            DAILY VOCAB QUEST
          </span>
          <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-50 mt-1">
            Lexical Match Challenge
          </h3>
        </div>

        {showGameFinished ? (
          <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl text-center space-y-4">
            <div className="p-3 bg-emerald-500 text-white rounded-full w-fit mx-auto shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-black text-zinc-900 dark:text-zinc-50 font-mono uppercase tracking-wider">
                Quest Complete!
              </h4>
              <p className="text-[10px] text-zinc-400 mt-1">
                You successfully matched all advanced business English verbs to their correct placement semantic definitions.
              </p>
            </div>
            <div className="py-2.5 px-4 bg-emerald-500/10 text-emerald-600 rounded-xl font-mono text-xs font-black inline-block">
              +{gameScore} XP Gained
            </div>
            <button
              onClick={handleResetChallenge}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
            >
              Play Again
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-[11px] text-zinc-500 leading-relaxed font-sans">
              Match each high-value business verb to its precise enterprise definition to complete today's challenge:
            </p>

            <div className="grid grid-cols-2 gap-3.5">
              {/* Words Column */}
              <div className="space-y-2">
                <span className="text-[8px] font-mono font-bold text-zinc-400 uppercase tracking-widest block mb-1">Verbs</span>
                {shuffledWords.map(w => {
                  const isSolved = solvedPairs.includes(w);
                  return (
                    <button
                      key={w}
                      onClick={() => handleSelectWord(w)}
                      disabled={isSolved}
                      className={`w-full text-left p-3 rounded-xl text-xs border transition-all truncate font-bold cursor-pointer ${
                        isSolved
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 cursor-not-allowed"
                          : selectedWord === w
                          ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                          : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100"
                      }`}
                    >
                      {w}
                    </button>
                  );
                })}
              </div>

              {/* Definitions Column */}
              <div className="space-y-2">
                <span className="text-[8px] font-mono font-bold text-zinc-400 uppercase tracking-widest block mb-1">Definitions</span>
                {shuffledDefinitions.map(d => {
                  const isSolved = challengePairs.some(p => p.definition === d && solvedPairs.includes(p.word));
                  return (
                    <button
                      key={d}
                      onClick={() => handleSelectDefinition(d)}
                      disabled={isSolved}
                      className={`w-full text-left p-3 rounded-xl text-[10px] leading-snug border transition-all h-[42px] overflow-hidden text-ellipsis cursor-pointer ${
                        isSolved
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 cursor-not-allowed"
                          : selectedDefinition === d
                          ? "bg-indigo-600 border-indigo-600 text-white shadow-sm font-semibold"
                          : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100"
                      }`}
                      title={d}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-between items-center text-[9px] font-mono text-zinc-400 pt-3 border-t border-zinc-100 dark:border-zinc-900">
              <span>Points: <strong>{gameScore} XP</strong></span>
              <span>Matched: <strong>{solvedPairs.length} / 4</strong></span>
            </div>
          </div>
        )}

        <div className="p-3 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 text-[10px] text-zinc-500 leading-normal flex items-start gap-1.5">
          <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <span>Integrating these specific professional synonyms in place of generic vocabulary like 'use' or 'make' can elevate your recruitment index score by up to 25%.</span>
        </div>
      </div>

      {/* Col 2 & 3: Vocabulary Library with Filter/Search */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Search and Filters Bar */}
        <div className="bg-white/60 dark:bg-zinc-950/60 backdrop-blur-xl border border-zinc-200/60 dark:border-zinc-850 p-6 rounded-3xl shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] text-indigo-500 font-mono font-bold tracking-widest uppercase block">
                LEXICAL COMPASS
              </span>
              <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-50 mt-1">
                Business & Technical Vocabulary Hub
              </h3>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search vocabulary..."
                className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-indigo-500 text-zinc-800 dark:text-zinc-100 w-full sm:w-[220px]"
              />
            </div>
          </div>

          {/* Category Badges */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 shrink-0">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded-full text-[10px] font-bold shrink-0 transition-all cursor-pointer ${
                  activeCategory === cat
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-zinc-100 dark:bg-zinc-900 text-zinc-500 hover:text-zinc-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Vocabulary list */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredVocabulary.length === 0 ? (
            <div className="col-span-1 sm:col-span-2 bg-white/60 dark:bg-zinc-950/60 p-12 text-center rounded-3xl border border-zinc-200/40">
              <p className="text-xs text-zinc-400">No matching vocabulary found. Try other filters.</p>
            </div>
          ) : (
            filteredVocabulary.map((item, idx) => (
              <div
                key={idx}
                className="bg-white/60 dark:bg-zinc-950/60 backdrop-blur-xl border border-zinc-200/60 dark:border-zinc-850 p-5 rounded-3xl shadow-xs space-y-3 relative overflow-hidden flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] font-mono font-bold text-indigo-500 bg-indigo-500/10 px-1.5 py-0.5 rounded">
                      {item.category}
                    </span>
                    <button
                      onClick={() => handlePlayTTS(item.improved, item.example)}
                      className="p-1.5 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 text-zinc-500 hover:text-indigo-500 rounded-lg border border-zinc-200/25 dark:border-zinc-800 transition-colors cursor-pointer"
                      title="Listen to pronunciation & example"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-400 line-through">"{item.original}"</span>
                      <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">"{item.improved}"</span>
                    </div>
                    <p className="text-xs text-zinc-700 dark:text-zinc-200 leading-normal font-sans pt-1">
                      {item.definition}
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-zinc-50/50 dark:bg-zinc-900/20 rounded-2xl border border-zinc-100 dark:border-zinc-900 text-[10px] text-zinc-500 font-mono italic">
                  "{item.example}"
                </div>
              </div>
            ))
          )}
        </div>

      </div>

    </div>
  );
}
export default VocabularyTrainer;

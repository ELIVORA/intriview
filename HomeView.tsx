/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Cpu, 
  Target, 
  Zap, 
  Award, 
  ShieldCheck, 
  BrainCircuit, 
  Code2, 
  FileText, 
  MessageSquare, 
  Play, 
  Star, 
  TrendingUp,
  BarChart3,
  Bot
} from "lucide-react";

interface HomeViewProps {
  onNavigateTab: (tab: "home" | "features" | "pricing" | "about" | "contact" | "privacy" | "terms") => void;
  onNavigateAuth: (view: "student-login" | "student-register" | "admin-login") => void;
}

export function HomeView({ onNavigateTab, onNavigateAuth }: HomeViewProps) {
  return (
    <main className="flex-1 flex items-center justify-center p-6 sm:p-16 min-h-[calc(100vh-8rem)] bg-dot-pattern relative">
      <div className="max-w-4xl w-full text-center bg-white dark:bg-zinc-900 p-8 sm:p-20 border border-slate-200/80 dark:border-zinc-800 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.05)] rounded-2xl relative">
        <span className="font-mono text-xs uppercase tracking-[0.15em] text-slate-500 dark:text-zinc-400 font-medium mb-6 block">
          — AI Mentorship Redefined
        </span>
        
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-normal text-[#1A1D21] dark:text-white tracking-tight leading-[1.08] mb-10 font-sans">
          Crack Your Dream Interview with <i className="font-serif-editorial italic font-semibold text-blue-600 dark:text-blue-500">personalized AI</i>
        </h1>

        <button
          onClick={() => onNavigateAuth("student-register")}
          className="bg-blue-600 hover:bg-[#1a1a1a] dark:hover:bg-blue-500 text-white border-none px-8 py-4 text-sm font-semibold cursor-pointer rounded-lg inline-flex items-center gap-3 transition-all duration-300 shadow-xs group"
        >
          <span>Start Free Practice Session</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </main>
  );
}


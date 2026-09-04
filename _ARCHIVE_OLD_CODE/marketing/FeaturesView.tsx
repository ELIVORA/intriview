/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { 
  FileText, Cpu, Terminal, Award, MessageSquare, 
  Video, BookOpen, BarChart3, Compass, ShieldCheck, 
  ArrowRight, ShieldAlert, Sparkles, CheckSquare
} from "lucide-react";

interface FeaturesViewProps {
  onNavigateAuth: (view: "student-login" | "student-register" | "admin-login") => void;
}

export function FeaturesView({ onNavigateAuth }: FeaturesViewProps) {
  const fullFeaturesList = [
    {
      id: "ats-analysis",
      title: "Resume ATS Analysis",
      description: "Analyze your CV against 250+ targeted applicant tracking keywords. Instantly highlights format flaws, unreadable PDF font structures, and missing tech keywords to secure real recruitment views.",
      specs: ["Reverse-engineered parsing heuristics", "PDF formatting validation", "Target-role keyword matching index", "GDPR-safe processing"],
      icon: FileText,
      color: "from-blue-500/10 to-indigo-500/10 text-blue-600 dark:text-blue-400",
    },
    {
      id: "resume-interview",
      title: "AI Resume Interview",
      description: "Generates custom behavioral and design questions customized strictly to your resume credentials. Avoid general canned queries—this engine challenges you on your actual stated projects, libraries, and scale claims.",
      specs: ["AI Pro Models context-matching", "Project authenticity probing", "SITUATIONAL STAR method grading", "Real-time query generation"],
      icon: Cpu,
      color: "from-purple-500/10 to-pink-500/10 text-purple-600 dark:text-purple-400",
    },
    {
      id: "aptitude-training",
      title: "Aptitude Training",
      description: "Master quantitative, analytical, and logical thinking mock tests. Formulated by investment banking and big tech coaches to help you breeze through preliminary cognitive screenings.",
      specs: ["1500+ quantitative, logic, and verbal tests", "Step-by-step explanatory modules", "Timed stress simulators", "Performance category charts"],
      icon: Award,
      color: "from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400",
    },
    {
      id: "voice-analysis",
      title: "Voice & Speech Analysis",
      description: "Our voice system evaluates verbal fluency, pitch modulation, and pacing. Detects filler words (like 'um', 'like', 'ah') to groom clean, crisp articulation styles suitable for executive panels.",
      specs: ["Vocal pacing (Words-Per-Minute) optimizer", "Filler word frequency counter", "Frequency pitch stabilization analysis", "Subsecond speech-to-text feedback"],
      icon: MessageSquare,
      color: "from-cyan-500/10 to-blue-500/10 text-cyan-600 dark:text-cyan-400",
    },
    {
      id: "camera-confidence",
      title: "Camera Confidence Analysis",
      description: "Uses standard camera streams to train stable gaze persistence, head orientation, and facial composure. Helps candidates maintain virtual engagement during high-pressure panels.",
      specs: ["Gaze direction vector estimation", "Micro-expression fatigue tracking", "Lighting and frame balance logs", "Completely local browser privacy"],
      icon: Video,
      color: "from-rose-500/10 to-pink-500/10 text-rose-600 dark:text-rose-400",
    },
    {
      id: "english-coach",
      title: "English Coach",
      description: "Enhance grammatical structures, professional idioms, and vocabulary styles dynamically. Helps international engineering students elevate their business communication parameters gracefully.",
      specs: ["Sentence grammar repair modules", "Professional lexicon alternatives", "Idiomatic phrasing tutorials", "Sentence length variance indices"],
      icon: BookOpen,
      color: "from-indigo-500/10 to-purple-500/10 text-indigo-600 dark:text-indigo-400",
    },
    {
      id: "progress-dashboard",
      title: "Progress Dashboard",
      description: "A centralized command dashboard summarizing overall preparation levels, completed mocks, streak days, and weak technical categories. High-fidelity visuals map out daily growth metrics.",
      specs: ["Dynamic radar visual charts", "Daily streak calendars", "Historical score archiving", "PDF ready metric sheets"],
      icon: BarChart3,
      color: "from-teal-500/10 to-emerald-500/10 text-teal-600 dark:text-teal-400",
    },
    {
      id: "career-coach",
      title: "Career Coach",
      description: "Automated, intelligent roadmapping that matches candidate scores against hiring trends. Recommends customized certification, target companies, and specific stack pivots to maximize offer odds.",
      specs: ["Personalized tech stack roadmaps", "Salary index estimates by geo", "Skill gap identification maps", "Curated study resource logs"],
      icon: Compass,
      color: "from-fuchsia-500/10 to-pink-500/10 text-fuchsia-600 dark:text-fuchsia-400",
    },
    {
      id: "admin-dashboard",
      title: "Admin Dashboard",
      description: "A powerful backend cockpit for organizational admins and mentors. Provides real-time cohorts, aggregates candidate mock pass rates, and simplifies mock interview scheduling.",
      specs: ["Multi-student cohort logs", "Custom question set registries", "System health diagnostic tools", "AES-256 cloud administrative security"],
      icon: ShieldCheck,
      color: "from-zinc-500/10 to-slate-500/10 text-zinc-600 dark:text-zinc-400",
    },
  ];

  return (
    <div className="space-y-24 py-16 px-4 max-w-7xl mx-auto">
      
      {/* Page Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 text-xs font-semibold tracking-wide border border-indigo-100 dark:border-indigo-900/30">
          <Sparkles className="w-3.5 h-3.5" />
          Technical Specifications
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
          Everything You Need To Stand Out
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-2xl mx-auto">
          Deep-dive into the architectural features powering Interview Cracker. We go beyond simple static lists to simulate complete executive panel standards in real-time.
        </p>
      </div>

      {/* Grid Features Details */}
      <div className="space-y-16">
        {fullFeaturesList.map((feat, idx) => {
          const IconComponent = feat.icon;
          const isEven = idx % 2 === 0;

          return (
            <motion.div
              key={feat.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center p-8 sm:p-10 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/50 dark:border-zinc-800/50 relative overflow-hidden ${
                isEven ? "" : "lg:flex-row-reverse"
              }`}
            >
              {/* Background gradient hint */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 blur-3xl pointer-events-none" />

              {/* Text Specs */}
              <div className={`lg:col-span-7 space-y-6 ${isEven ? "" : "lg:order-2"}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${feat.color} flex items-center justify-center shadow-xs`}>
                    <IconComponent className="w-5.5 h-5.5" />
                  </div>
                  <h2 className="text-lg font-extrabold text-zinc-900 dark:text-white tracking-tight">
                    {feat.title}
                  </h2>
                </div>

                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {feat.description}
                </p>

                {/* Sub-specs Checklist */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-4 border-t border-zinc-100 dark:border-zinc-850">
                  {feat.specs.map((spec) => (
                    <div key={spec} className="flex items-start gap-2.5">
                      <CheckSquare className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-xs text-zinc-600 dark:text-zinc-400 leading-snug">{spec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Graphic Mock Placeholder */}
              <div className={`lg:col-span-5 flex justify-center ${isEven ? "" : "lg:order-1"}`}>
                <div className="w-full max-w-sm p-6 bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/50 dark:border-zinc-850 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between text-[10px] text-zinc-400 dark:text-zinc-500 font-mono tracking-wider uppercase border-b border-zinc-150/50 dark:border-zinc-900 pb-2">
                    <span>Diagnostic Node {feat.id}</span>
                    <span className="text-emerald-500 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      Active
                    </span>
                  </div>
                  
                  {/* Decorative terminal/diagnostic line */}
                  <div className="space-y-2 font-mono text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    <p className="text-indigo-500 dark:text-indigo-400 font-semibold">&gt; initializing telemetry analyzer...</p>
                    <p className="pl-3 text-zinc-600 dark:text-zinc-500">_ verifying signature payload keys</p>
                    <p className="pl-3 text-zinc-600 dark:text-zinc-500">_ optimizing diagnostic scoring thresholds</p>
                    <p className="text-emerald-500 font-semibold">&gt; compilation success: 0 warnings, verified</p>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Conversion Banner */}
      <section className="bg-gradient-to-br from-indigo-900 to-slate-950 text-white rounded-3xl p-8 sm:p-12 text-center space-y-6 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500/10 blur-3xl pointer-events-none" />
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Ready To Elevate Your Performance?</h2>
        <p className="text-xs text-indigo-200 max-w-xl mx-auto leading-relaxed">
          Unlock all 10 features, practice competitive coding loops, and secure customized reports today. Build real confidence.
        </p>
        <button
          onClick={() => onNavigateAuth("student-register")}
          className="px-8 py-3.5 bg-white text-zinc-950 hover:bg-zinc-100 transition-all font-bold text-xs rounded-xl shadow-md cursor-pointer inline-flex items-center gap-1.5"
        >
          Begin Onboarding Profile
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>

    </div>
  );
}

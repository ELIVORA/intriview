/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Cpu, Award, Users, Rocket, ShieldCheck, Check } from "lucide-react";

export function AboutView() {
  const values = [
    {
      title: "Obsession with Success",
      desc: "Our primary North Star is engineering students securing high-paying roles at top-tier international tech firms.",
      icon: Award,
    },
    {
      title: "Extreme Security",
      desc: "We encrypt all resume details and mock audio-video feeds using AES-256 local client processing to keep records private.",
      icon: ShieldCheck,
    },
    {
      title: "Technical Excellence",
      desc: "Leveraging state-of-the-art models for responsive, personalized conversational scenarios rather than basic static files.",
      icon: Cpu,
    },
  ];

  const team = [
    { name: "Devesh Kumar", role: "Co-Founder & Chief AI Architect", initial: "DK" },
    { name: "Sarah Jenkins", role: "Head of Candidate Relations", initial: "SJ" },
    { name: "Liam O'Connor", role: "Principal Speech Processing Engineer", initial: "LO" },
  ];

  return (
    <div className="space-y-20 py-16 px-4 max-w-7xl mx-auto">
      
      {/* 1. Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
          Our Team & Philosophy
        </span>
        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
          Empowering the Next Generation of Engineers
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-2xl mx-auto">
          We bridge the gap between traditional college classroom curriculum and the modern interview loops of elite tech companies.
        </p>
      </div>

      {/* 2. Story / Origin Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-wider">
            <Rocket className="w-3.5 h-3.5" />
            Our Vision
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            How Interview Cracker Began
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
            As senior software architects and hiring committee directors, we sat through thousands of technical interviews. We repeatedly witnessed exceptional engineering graduates failing screens, not because of coding capacity, but due to interview stage fright, unpolished resume structures, or poor verbal communication styles.
          </p>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
            We built Interview Cracker to democratize premium corporate recruitment coaching. Combining state-of-the-art LLMs, real-time audio analysis algorithms, and browser-compiled code sandboxes, we provide students with affordable, professional feedback.
          </p>
        </div>

        <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-3 shadow-xs">
            <span className="block text-3xl font-extrabold text-indigo-500">25k+</span>
            <span className="block text-xs font-bold text-zinc-900 dark:text-white">Active Candidates Trained</span>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Preparing candidates from all backgrounds for their final technical interviews.
            </p>
          </div>
          
          <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-3 shadow-xs">
            <span className="block text-3xl font-extrabold text-purple-500">92%</span>
            <span className="block text-xs font-bold text-zinc-900 dark:text-white">Success Ratio</span>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Candidates who unlock the Level 4 Readiness Certificate receive offers.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Core Values */}
      <section className="space-y-10 pt-12 border-t border-zinc-200/50 dark:border-zinc-800/50">
        <h2 className="text-center text-xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
          Values That Drive Our Craft
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {values.map((val) => {
            const Icon = val.icon;
            return (
              <div 
                key={val.title} 
                className="p-6 bg-zinc-50 dark:bg-zinc-900/20 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl space-y-4"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-xs font-bold text-zinc-900 dark:text-white tracking-tight">{val.title}</h3>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">{val.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Leadership Section */}
      <section className="space-y-10 pt-12 border-t border-zinc-200/50 dark:border-zinc-800/50">
        <div className="text-center space-y-4 max-w-xl mx-auto">
          <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            Our Leadership & Engineers
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            A diverse, specialized group of compiler experts, speech researchers, and expert tech mentors.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {team.map((member) => (
            <div 
              key={member.name}
              className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl text-center space-y-4"
            >
              <div className="w-14 h-14 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto text-sm font-extrabold border border-indigo-500/25">
                {member.initial}
              </div>
              <div>
                <h3 className="text-xs font-bold text-zinc-900 dark:text-white">{member.name}</h3>
                <span className="block text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">{member.role}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ShieldCheck, Info, Clock, Lock } from "lucide-react";

export function PrivacyView() {
  return (
    <div className="max-w-4xl mx-auto py-16 px-4 space-y-12">
      
      {/* Header */}
      <div className="space-y-4 border-b border-zinc-200 dark:border-zinc-800 pb-8 text-center md:text-left">
        <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 px-3 py-1 rounded-full font-bold uppercase tracking-wider border border-indigo-200/20">
          Security & GDPR Compliance
        </span>
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
          Privacy Policy
        </h1>
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-zinc-500 dark:text-zinc-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Last Revised: July 10, 2026
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> AES-256 Fully Encrypted
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-8 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
        
        <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 flex items-start gap-3">
          <Info className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
          <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
            <strong>Candidate Privacy is Absolute:</strong> Interview Cracker compiles all speech and visual gaze persistence vectors locally inside your browser cache. We NEVER save raw webcam streams or audio logs permanently on cloud nodes.
          </p>
        </div>

        <section className="space-y-3">
          <h2 className="text-sm font-extrabold text-zinc-900 dark:text-white tracking-tight">
            1. Information We Collect
          </h2>
          <p>
            To provide robust virtual recruitment coaching, we process two sets of candidate metrics:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Profile & Account Details:</strong> Name, university, graduation year, target roles, and email address collected during registration.
            </li>
            <li>
              <strong>Onboarding Resumes:</strong> Structured PDF or DOCX files uploaded by the user to personalize the conversational simulator experience.
            </li>
            <li>
              <strong>Diagnostic Logs:</strong> Local speech pace (Words-Per-Minute), grammatical corrections, and gaze orientations to compile interview readiness cards.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-extrabold text-zinc-900 dark:text-white tracking-tight">
            2. How We Use Information
          </h2>
          <p>
            Your details are used strictly to run the AI mock interview loops and render progress metrics. Resumes are parsed dynamically with secure API proxies to AI Engine. No data logs are sold or transferred to secondary advertiser nodes.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-extrabold text-zinc-900 dark:text-white tracking-tight">
            3. Data Persistence & Deletion
          </h2>
          <p>
            Candidates retain full control over their records. You may permanently purge your resume, saved mock feedback logs, and profile credentials at any moment straight from your Student Dashboard. Deleted materials are completely wiped from our Firebase servers within 60 seconds.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-extrabold text-zinc-900 dark:text-white tracking-tight">
            4. Subscription & Plan Privacy
          </h2>
          <p>
            When subscribing to Pro plans, payment credentials and invoice details are encrypted using state-of-the-art PCI-DSS compliance frameworks.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-extrabold text-zinc-900 dark:text-white tracking-tight">
            5. Contact Security Officer
          </h2>
          <p>
            If you have questions regarding data storage encryption or compliance audits, reach out directly to our Security and Compliance Officer at <strong className="text-zinc-800 dark:text-zinc-200">security@interviewcracker.io</strong>.
          </p>
        </section>

      </div>

    </div>
  );
}

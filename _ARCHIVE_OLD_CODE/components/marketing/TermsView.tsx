/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Clock, ShieldCheck, Scale } from "lucide-react";

export function TermsView() {
  return (
    <div className="max-w-4xl mx-auto py-16 px-4 space-y-12">
      
      {/* Header */}
      <div className="space-y-4 border-b border-zinc-200 dark:border-zinc-800 pb-8 text-center md:text-left">
        <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 px-3 py-1 rounded-full font-bold uppercase tracking-wider border border-indigo-200/20 inline-flex items-center gap-1">
          <Scale className="w-3.5 h-3.5" /> Legal Standards
        </span>
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
          Terms & Conditions
        </h1>
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-zinc-500 dark:text-zinc-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Last Revised: July 10, 2026
          </span>
          <span>•</span>
          <span>Version 2.0</span>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-8 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
        
        <section className="space-y-3">
          <h2 className="text-sm font-extrabold text-zinc-900 dark:text-white tracking-tight">
            1. Acceptance of Terms
          </h2>
          <p>
            By establishing an account or using any interview coaching modules on Interview Cracker, you represent that you accept these Terms & Conditions in full. If you do not agree with any specified parameters, you are forbidden from utilizing the platform.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-extrabold text-zinc-900 dark:text-white tracking-tight">
            2. Code of Conduct & Academic Integrity
          </h2>
          <p>
            Interview Cracker provides simulation tools for personal practice. Users must not:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              Submit plagiarized files or documents containing hostile, malicious script injections.
            </li>
            <li>
              Reverse-engineer the speech analysis logic or scrape mock repositories for secondary resell databases.
            </li>
            <li>
              Share Student Pro personal licenses with multiple candidate profiles.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-extrabold text-zinc-900 dark:text-white tracking-tight">
            3. Fees, Subscriptions & 14-Day Refunds
          </h2>
          <p>
            Billing cycles for Student Pro run monthly or annually. Subscriptions renew automatically unless cancelled in the Student Dashboard before renewal dates. We provide a 14-day refund guarantee if requested through our billing ticketing channels.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-extrabold text-zinc-900 dark:text-white tracking-tight">
            4. Service Limits & Warranties
          </h2>
          <p>
            Interview Cracker is an educational coaching platform. While our Level 4 Readiness Score acts as a robust indicator of candidate performance, we make no legal guarantees of specific corporate job offers, career advancements, or recruitment outcomes.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-extrabold text-zinc-900 dark:text-white tracking-tight">
            5. Limitation of Liability
          </h2>
          <p>
            Under no circumstances shall Interview Cracker, its founders, or technology partners be liable for any special, indirect, or consequential damages resulting from lost recruitment cycles, unaccepted applications, or technical server downtimes.
          </p>
        </section>

      </div>

    </div>
  );
}

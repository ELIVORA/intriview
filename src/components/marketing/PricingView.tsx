/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Check, X, ShieldCheck, Sparkles, HelpCircle } from "lucide-react";

interface PricingViewProps {
  onNavigateAuth: (view: "student-login" | "student-register" | "admin-login") => void;
}

export function PricingView({ onNavigateAuth }: PricingViewProps) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");

  const plans = [
    {
      name: "Free",
      price: "0",
      description: "Hone foundational skills with limited sandbox runs.",
      cta: "Activate Free Sandbox",
      features: [
        "Limited Resume Uploads",
        "ATS Resume Analysis",
        "Limited AI Mock Interviews",
        "Basic Interview Reports",
      ],
      popular: false,
    },
    {
      name: "Pro",
      price: billingCycle === "monthly" ? "19" : "15",
      description: "Infinite mock runs, voice analysis, and reports.",
      cta: "Unlock Pro Engine",
      features: [
        "Unlimited Resume Uploads",
        "Unlimited AI Interviews",
        "Company-specific Interviews",
        "Resume Optimization",
        "Voice Analysis",
        "Coding Practice",
        "Progress Tracking",
        "AI Performance Insights",
        "Priority Processing",
      ],
      popular: true,
    },
  ];

  const comparisonRows = [
    { feature: "Resume Uploads", free: "Limited", pro: "Unlimited" },
    { feature: "ATS Resume Analysis", free: "Basic Score", pro: "Full Diagnostic" },
    { feature: "AI Mock Interviews", free: "Limited (1 / month)", pro: "Unlimited" },
    { feature: "Company-specific Interviews", free: "❌", pro: "✔ Yes" },
    { feature: "Resume Optimization Tips", free: "❌", pro: "✔ Yes" },
    { feature: "Voice Analysis", free: "❌", pro: "✔ Yes" },
    { feature: "Coding Practice", free: "Basic (3 / month)", pro: "Unlimited" },
    { feature: "Progress Tracking", free: "❌", pro: "✔ Yes" },
    { feature: "AI Performance Insights", free: "❌", pro: "✔ Yes" },
    { feature: "Priority Processing", free: "❌", pro: "✔ Yes" },
  ];

  return (
    <div className="space-y-20 py-16 px-4 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 text-xs font-semibold tracking-wide border border-indigo-100 dark:border-indigo-900/30">
          <Sparkles className="w-3.5 h-3.5" />
          Transparent Pricing
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
          Plans Structured For Interview Success
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed">
          Zero hidden fees. Switch plans, upgrade, or cancel subscription anytime. Select a plan to start your practice today.
        </p>

        {/* Billing cycle button */}
        <div className="inline-flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-full border border-zinc-200 dark:border-zinc-800 mt-6">
          <button 
            onClick={() => setBillingCycle("monthly")}
            className={`px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
              billingCycle === "monthly" 
                ? "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-xs" 
                : "text-zinc-500"
            }`}
          >
            Monthly Billing
          </button>
          <button 
            onClick={() => setBillingCycle("annual")}
            className={`px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
              billingCycle === "annual" 
                ? "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-xs" 
                : "text-zinc-500"
            }`}
          >
            Annual Billing (Save 20%)
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-4xl mx-auto">
        {plans.map((tier) => (
          <div 
            key={tier.name}
            className={`p-8 rounded-3xl bg-white dark:bg-zinc-900 border transition-all flex flex-col justify-between relative ${
              tier.popular 
                ? "border-indigo-500 dark:border-indigo-400 shadow-xl ring-2 ring-indigo-500/10" 
                : "border-zinc-200 dark:border-zinc-800 shadow-xs"
            }`}
          >
            {tier.popular && (
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 text-white text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                Most Popular
              </span>
            )}

            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">{tier.name}</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">{tier.description}</p>
              </div>

              <div className="flex items-baseline text-zinc-900 dark:text-white">
                <span className="text-3xl font-extrabold tracking-tight">$</span>
                <span className="text-5xl font-extrabold tracking-tight">{tier.price}</span>
                <span className="text-zinc-500 dark:text-zinc-400 text-xs font-semibold ml-1">
                  /{billingCycle === "annual" && tier.name === "Pro" ? "mo billed annually" : "month"}
                </span>
              </div>

              <ul className="space-y-3.5 pt-4 border-t border-zinc-100 dark:border-zinc-850">
                {tier.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-3 text-xs text-zinc-600 dark:text-zinc-400">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-8">
              <button
                onClick={() => onNavigateAuth("student-register")}
                className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  tier.popular
                    ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg"
                    : "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200"
                }`}
              >
                {tier.cta}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Detailed Comparison Table (Stripe/Linear Matrix Layout) */}
      <section className="space-y-6 pt-12 border-t border-zinc-200/50 dark:border-zinc-800/50 overflow-x-auto max-w-4xl mx-auto">
        <h2 className="text-base font-extrabold text-zinc-900 dark:text-white tracking-tight text-center md:text-left">
          Complete Plan Feature Comparison Matrix
        </h2>
        
        <table className="w-full text-left border-collapse min-w-[500px] text-xs">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500">
              <th className="py-4 font-bold uppercase tracking-wider text-[10px]">Feature Spec</th>
              <th className="py-4 font-bold uppercase tracking-wider text-[10px]">Free</th>
              <th className="py-4 font-bold uppercase tracking-wider text-[10px]">Pro</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850">
            {comparisonRows.map((row, idx) => (
              <tr key={idx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10">
                <td className="py-4 font-semibold text-zinc-850 dark:text-zinc-300">{row.feature}</td>
                <td className="py-4 text-zinc-500 dark:text-zinc-400 font-medium">{row.free}</td>
                <td className="py-4 text-zinc-900 dark:text-white font-bold">{row.pro}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Assurance banner */}
      <div className="p-6 rounded-2xl bg-zinc-100/50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-4xl mx-auto">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-emerald-500 shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-zinc-900 dark:text-white font-sans">Secure 14-Day Money Back Guarantee</h4>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed font-sans">
              If you aren't completely confident after using Pro, contact billing within 14 days for a full, hassle-free refund.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  Bell,
  Mail,
  Smartphone,
  Sliders,
  CheckCircle2,
  Eye,
  RefreshCw,
  Code,
  Sparkles,
  Info,
  Calendar,
  AlertTriangle,
  Award
} from "lucide-react";
import { motion } from "motion/react";
import { NotificationPreferences, EmailTemplate } from "./types";
import { emailService } from "./services";

interface NotificationSettingsProps {
  preferences: NotificationPreferences;
  onUpdatePreferences: (pref: NotificationPreferences) => void;
  templates: EmailTemplate[];
}

export function NotificationSettings({
  preferences,
  onUpdatePreferences,
  templates
}: NotificationSettingsProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templates[0]?.id || "");
  const [customRole, setCustomRole] = useState("Frontend Specialist");
  const [customCompany, setCustomCompany] = useState("Stripe");
  const [customInterviewer, setCustomInterviewer] = useState("Jonathan Stark (Hiring Lead)");

  // Toggle helpers
  const handleToggle = (key: keyof Omit<NotificationPreferences, "userId" | "role">) => {
    onUpdatePreferences({
      ...preferences,
      [key]: !preferences[key]
    });
  };

  const activeTemplate = templates.find(t => t.id === selectedTemplateId) || templates[0];

  // Compile with mock replacements
  let renderedHtml = "";
  let renderedSubject = "";

  if (activeTemplate) {
    try {
      const compiled = emailService.compileTemplate(activeTemplate.id, {
        role: customRole,
        company: customCompany,
        roundName: activeTemplate.name,
        scheduledTime: new Date(Date.now() + 24 * 3600 * 1000).toLocaleString(),
        interviewer: customInterviewer,
        meetingLink: "https://meet.google.com/swe-deep-dive"
      });
      renderedHtml = compiled.html;
      renderedSubject = compiled.subject;
    } catch (err) {
      renderedHtml = "<p className='text-rose-500'>Error parsing template tags.</p>";
    }
  }

  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full"
      id="communication-settings-container"
    >
      {/* Col 1: Channel Toggles & Category Alerts */}
      <div className="bg-white/60 dark:bg-zinc-950/60 backdrop-blur-xl border border-zinc-200/60 dark:border-zinc-850 p-6 rounded-3xl shadow-xl h-fit">
        <span className="text-[10px] text-indigo-500 font-mono font-bold tracking-widest uppercase block">
          DISPATCH RULES
        </span>
        <h3 className="text-base font-black text-zinc-900 dark:text-zinc-50 mt-1 pb-4 border-b border-zinc-150 dark:border-zinc-850">
          Notification Preferences
        </h3>

        <div className="mt-5 space-y-5">
          {/* Active channels list */}
          <div>
            <span className="text-[9px] font-bold text-zinc-400 font-mono block mb-3 uppercase">
              ACTIVE DELIVERY CHANNELS
            </span>

            <div className="space-y-3">
              {[
                { key: "inApp", label: "In-App Central Feed", desc: "Receive real-time push dispatches in workspace", icon: <Bell className="w-4 h-4" /> },
                { key: "email", label: "Email Dispatcher", desc: "Professional HTML delivery directly to mailbox", icon: <Mail className="w-4 h-4" /> },
                { key: "push", label: "Browser Native Push", desc: "Interactive desktop notifications in background", icon: <Smartphone className="w-4 h-4" /> }
              ].map(ch => (
                <div key={ch.key} className="flex items-center justify-between p-3.5 bg-zinc-50/50 dark:bg-zinc-900/20 border border-zinc-200/30 dark:border-zinc-850/30 rounded-2xl">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-xl mt-0.5">
                      {ch.icon}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-zinc-850 dark:text-zinc-100 block">{ch.label}</span>
                      <p className="text-[10px] text-zinc-400">{ch.desc}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggle(ch.key as any)}
                    className={`w-10 h-6 rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                      preferences[ch.key as keyof NotificationPreferences] ? "bg-indigo-600" : "bg-zinc-300 dark:bg-zinc-800"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full transition-transform ${
                        preferences[ch.key as keyof NotificationPreferences] ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Subscriptions toggle list */}
          <div className="pt-3 border-t border-zinc-150 dark:border-zinc-850">
            <span className="text-[9px] font-bold text-zinc-400 font-mono block mb-3 uppercase">
              SUBSCRIPTION TOPICS
            </span>

            <div className="space-y-3.5">
              {[
                { key: "placementAlerts", label: "Campus Placement Alerts", desc: "Immediate updates on drives and selections" },
                { key: "weeklyDigest", label: "Weekly Progress Analytics", desc: "Consolidated performance reports summary" },
                { key: "marketing", label: "Partners & Sponsorship Alerts", desc: "Career tips, webinars, and partner challenges" }
              ].map(tp => (
                <div key={tp.key} className="flex items-center justify-between">
                  <div className="min-w-0 space-y-0.5">
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-150 block">{tp.label}</span>
                    <p className="text-[10px] text-zinc-400 leading-relaxed">{tp.desc}</p>
                  </div>

                  <button
                    onClick={() => handleToggle(tp.key as any)}
                    className={`w-10 h-6 rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                      preferences[tp.key as keyof NotificationPreferences] ? "bg-indigo-600" : "bg-zinc-300 dark:bg-zinc-800"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full transition-transform ${
                        preferences[tp.key as keyof NotificationPreferences] ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Col 2 & 3: Template Sandbox & Interactive HTML Renderer */}
      <div className="lg:col-span-2 bg-white/60 dark:bg-zinc-950/60 backdrop-blur-xl border border-zinc-200/60 dark:border-zinc-850 p-6 rounded-3xl shadow-xl space-y-5">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-150 dark:border-zinc-850">
          <div>
            <span className="text-[10px] text-indigo-500 font-mono font-bold tracking-widest uppercase block">
              HTML TEMPLATES SANDBOX
            </span>
            <h3 className="text-base font-black text-zinc-900 dark:text-zinc-50 mt-1">
              Professional Email Templates Compiler
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedTemplateId}
              onChange={e => setSelectedTemplateId(e.target.value)}
              className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-800 dark:text-zinc-100 focus:outline-none"
            >
              {templates.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Dynamic Mock Replacements controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-zinc-50/50 dark:bg-zinc-900/10 p-3.5 rounded-2xl border border-zinc-150/40 dark:border-zinc-800/40">
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-zinc-400 font-mono uppercase">Role Name</label>
            <input
              type="text"
              value={customRole}
              onChange={e => setCustomRole(e.target.value)}
              className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-lg p-2 text-xs focus:outline-none text-zinc-850 dark:text-zinc-100"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-bold text-zinc-400 font-mono uppercase">Company Name</label>
            <input
              type="text"
              value={customCompany}
              onChange={e => setCustomCompany(e.target.value)}
              className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-lg p-2 text-xs focus:outline-none text-zinc-850 dark:text-zinc-100"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-bold text-zinc-400 font-mono uppercase">Interviewer Name</label>
            <input
              type="text"
              value={customInterviewer}
              onChange={e => setCustomInterviewer(e.target.value)}
              className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-lg p-2 text-xs focus:outline-none text-zinc-850 dark:text-zinc-100"
            />
          </div>
        </div>

        {/* Preview Container Frame */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-indigo-500" />
              <span>Subject: <strong>{renderedSubject}</strong></span>
            </span>
            <span className="text-indigo-500 font-bold">100% COMPILED PREVIEW</span>
          </div>

          <div className="border border-zinc-200/50 dark:border-zinc-850 rounded-3xl overflow-hidden bg-zinc-50 dark:bg-zinc-900/40 p-4 max-h-[340px] overflow-y-auto">
            <div
              dangerouslySetInnerHTML={{ __html: renderedHtml }}
              className="bg-white rounded-xl shadow-xs"
            />
          </div>
        </div>

      </div>

    </div>
  );
}

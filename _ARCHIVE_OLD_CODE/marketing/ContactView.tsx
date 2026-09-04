/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Mail, MapPin, Phone, Check, Clock, ShieldCheck, HelpCircle } from "lucide-react";

export function ContactView() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "student",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      setSubmitted(true);
    }
  };

  return (
    <div className="space-y-20 py-16 px-4 max-w-7xl mx-auto">
      
      {/* 1. Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
          Get In Touch
        </span>
        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
          Support Centered Around Candidates
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-2xl mx-auto">
          Need support with team credentials, university-wide integrations, or custom trial accounts? Submit a ticket below or visit our local technical hubs.
        </p>
      </div>

      {/* 2. Main content block */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Contact info cards */}
        <div className="lg:col-span-5 space-y-6">
          <h2 className="text-sm font-extrabold text-zinc-900 dark:text-white uppercase tracking-wider">
            Our Global Office Locations
          </h2>

          <div className="space-y-4">
            {/* Office 1 */}
            <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-2xl space-y-3 shadow-xs">
              <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-500/10">
                US Headquarters
              </span>
              <h3 className="text-xs font-bold text-zinc-900 dark:text-white mt-1">Silicon Valley Hub</h3>
              <div className="space-y-2 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                <p className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                  <span>548 Market St, Suite 8122, San Francisco, CA 94104</span>
                </p>
                <p className="flex items-start gap-2.5">
                  <Mail className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                  <span>sf@interviewcracker.io</span>
                </p>
              </div>
            </div>

            {/* Office 2 */}
            <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-2xl space-y-3 shadow-xs">
              <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-500/10">
                APAC Operations
              </span>
              <h3 className="text-xs font-bold text-zinc-900 dark:text-white mt-1">Bangalore Technical Hub</h3>
              <div className="space-y-2 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                <p className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                  <span>Outer Ring Road, Block B, Marathahalli, Bangalore 560103</span>
                </p>
                <p className="flex items-start gap-2.5">
                  <Mail className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                  <span>blr@interviewcracker.io</span>
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 space-y-3">
            <h4 className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-500" />
              SLA Response Timeline
            </h4>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Our support specialists monitor ticketing channels constantly. Standard candidate support requests and general inquiries are typically answered within 12 business hours.
            </p>
          </div>
        </div>

        {/* Contact Form card */}
        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xs">
          {submitted ? (
            <div className="text-center py-16 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Message Transmitted</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
                Your ticketing query has been encrypted and submitted. Our engineering coordinators will review the diagnostics and reply shortly. Thank you.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Jane Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full text-xs p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="you@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full text-xs p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Your Domain/Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full text-xs p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-zinc-700 dark:text-zinc-300"
                >
                  <option value="student">Candidate Preparing for Interviews</option>
                  <option value="officer">Team Lead / Organization Admin</option>
                  <option value="recruiter">Corporate Hiring Manager</option>
                  <option value="general">General Inquiries</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Ticketing Message</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Elaborate on how we can customize our interview preparation sandbox for your targets..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full text-xs p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
              >
                File Support Ticket
              </button>
            </form>
          )}
        </div>

      </div>

    </div>
  );
}

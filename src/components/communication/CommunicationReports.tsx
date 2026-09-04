/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import {
  BarChart3,
  MessageSquare,
  Bell,
  Calendar,
  CheckSquare,
  Activity,
  Download,
  Shield,
  Clock,
  Briefcase
} from "lucide-react";
import { motion } from "motion/react";
import { CommunicationReport, UserRole } from "./types";

interface CommunicationReportsProps {
  report: CommunicationReport;
  onDownload: () => void;
}

export function CommunicationReports({ report, onDownload }: CommunicationReportsProps) {
  
  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case "Student":
        return "bg-indigo-500/10 text-indigo-500 border-indigo-500/20";
      case "Admin":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "Super Admin":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      default:
        return "bg-zinc-500/10 text-zinc-500 border-zinc-200/20";
    }
  };

  return (
    <div
      className="space-y-6 w-full"
      id="communication-reports-and-logs"
    >
      {/* 1. Bento Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Chat Activity */}
        <div className="bg-white/60 dark:bg-zinc-950/60 backdrop-blur-xl border border-zinc-200/60 dark:border-zinc-850 p-5 rounded-3xl shadow-md flex items-center gap-4 relative overflow-hidden">
          <div className="p-3.5 bg-indigo-500/10 rounded-2xl text-indigo-500">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-400 font-mono font-bold tracking-wider block uppercase">
              CHAT ACTIVITY
            </span>
            <h4 className="text-xl font-black text-zinc-900 dark:text-zinc-50 mt-0.5 leading-none">
              {report.activityCount}
            </h4>
            <span className="text-[9px] text-emerald-500 font-mono mt-1 block">
              ● +12 messages today
            </span>
          </div>
        </div>

        {/* Card 2: Notifications Sent */}
        <div className="bg-white/60 dark:bg-zinc-950/60 backdrop-blur-xl border border-zinc-200/60 dark:border-zinc-850 p-5 rounded-3xl shadow-md flex items-center gap-4 relative overflow-hidden">
          <div className="p-3.5 bg-emerald-500/10 rounded-2xl text-emerald-500">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-400 font-mono font-bold tracking-wider block uppercase">
              NOTIFICATIONS
            </span>
            <h4 className="text-xl font-black text-zinc-900 dark:text-zinc-50 mt-0.5 leading-none">
              {report.notificationsSent}
            </h4>
            <span className="text-[9px] text-zinc-400 font-mono mt-1 block">
              E-mail & Push active
            </span>
          </div>
        </div>

        {/* Card 3: Calendar Meetings */}
        <div className="bg-white/60 dark:bg-zinc-950/60 backdrop-blur-xl border border-zinc-200/60 dark:border-zinc-850 p-5 rounded-3xl shadow-md flex items-center gap-4 relative overflow-hidden">
          <div className="p-3.5 bg-amber-500/10 rounded-2xl text-amber-500">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-400 font-mono font-bold tracking-wider block uppercase">
              SCHEDULED EVENTS
            </span>
            <h4 className="text-xl font-black text-zinc-900 dark:text-zinc-50 mt-0.5 leading-none">
              {report.meetingsCount}
            </h4>
            <span className="text-[9px] text-indigo-500 font-mono mt-1 block">
              Conflict checks: 100%
            </span>
          </div>
        </div>

        {/* Card 4: Compliance Tasks */}
        <div className="bg-white/60 dark:bg-zinc-950/60 backdrop-blur-xl border border-zinc-200/60 dark:border-zinc-850 p-5 rounded-3xl shadow-md flex items-center gap-4 relative overflow-hidden">
          <div className="p-3.5 bg-rose-500/10 rounded-2xl text-rose-500">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-400 font-mono font-bold tracking-wider block uppercase">
              COMPLETED OBJECTIVES
            </span>
            <h4 className="text-xl font-black text-zinc-900 dark:text-zinc-50 mt-0.5 leading-none">
              {report.tasksCompleted} / {report.totalTasks}
            </h4>
            <span className="text-[9px] text-rose-500 font-mono mt-1 block">
              Index: {report.taskCompletionRate}%
            </span>
          </div>
        </div>

      </div>

      {/* 2. Main Audit Activity Log Block */}
      <div className="bg-white/60 dark:bg-zinc-950/60 backdrop-blur-xl border border-zinc-200/60 dark:border-zinc-850 p-6 rounded-3xl shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-150 dark:border-zinc-850">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-500" />
            <div>
              <span className="text-[10px] text-indigo-500 font-mono font-bold tracking-widest uppercase block">
                SYSTEM AUDIT
              </span>
              <h3 className="text-sm font-black text-zinc-950 dark:text-zinc-50 mt-0.5">
                Realtime Platform Audit Logs
              </h3>
            </div>
          </div>

          <button
            onClick={onDownload}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 text-white dark:bg-white dark:text-zinc-950 text-[10px] font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Audit Report</span>
          </button>
        </div>

        {/* Audit list */}
        <div className="space-y-3.5 max-h-[320px] overflow-y-auto pr-1">
          {report.recentActivityLogs.map(log => (
            <div
              key={log.id}
              className="p-3.5 bg-zinc-50/50 dark:bg-zinc-900/10 border border-zinc-150 dark:border-zinc-850 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[11px] leading-relaxed"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <div className="text-zinc-800 dark:text-zinc-200">
                  <span className="font-bold mr-1">{log.user}</span>
                  <span className={`px-1.5 py-0.5 text-[8px] font-mono font-bold rounded border uppercase mr-2 ${getRoleBadge(log.role)}`}>
                    {log.role}
                  </span>
                  <span className="text-zinc-500">{log.action}</span>
                </div>
              </div>

              <div className="text-[9px] text-zinc-400 font-mono flex items-center gap-1.5 self-end sm:self-auto">
                <Clock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <span>{new Date(log.timestamp).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Security Stamp footer */}
        <div className="pt-4 border-t border-zinc-150 dark:border-zinc-850 flex items-center justify-between text-[10px] font-mono text-zinc-400">
          <div className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-zinc-400" />
            <span>Encryption Standard: TLS_AES_256_GCM_SHA384 active</span>
          </div>
          <span>Interview Cracker Platform security stamp</span>
        </div>
      </div>
    </div>
  );
}

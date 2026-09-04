/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import {
  Bell,
  Trash2,
  CheckCheck,
  Clock,
  ExternalLink,
  ShieldAlert,
  Calendar,
  Award,
  AlertTriangle,
  X,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { NotificationItem, PriorityLevel, NotificationType } from "./types";

interface NotificationCenterProps {
  notifications: NotificationItem[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onDelete: (id: string) => void;
  onActionTrigger?: (notif: NotificationItem) => void;
  onClose?: () => void;
}

export function NotificationCenter({
  notifications,
  onMarkRead,
  onMarkAllRead,
  onDelete,
  onActionTrigger,
  onClose
}: NotificationCenterProps) {
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getPriorityStyles = (p: PriorityLevel) => {
    switch (p) {
      case "Critical":
        return "bg-rose-500/10 text-rose-500 border border-rose-500/20";
      case "High":
        return "bg-amber-500/10 text-amber-500 border border-amber-500/20";
      case "Medium":
        return "bg-indigo-500/10 text-indigo-500 border border-indigo-500/20";
      default:
        return "bg-zinc-500/10 text-zinc-500 border border-zinc-500/10";
    }
  };

  const getTypeIcon = (type: NotificationType) => {
    switch (type) {
      case "Interview Scheduled":
      case "Interview Reminder":
      case "Mock Interview Assigned":
        return <Calendar className="w-4 h-4 text-indigo-500" />;
      case "Resume Analyzed":
      case "ATS Score Updated":
        return <Sparkles className="w-4 h-4 text-emerald-500" />;
      case "Shortlisted":
      case "Offer Letter Received":
      case "Certificate Generated":
      case "Achievement Unlocked":
        return <Award className="w-4 h-4 text-amber-500" />;
      case "Security Alert":
        return <ShieldAlert className="w-4 h-4 text-rose-500" />;
      default:
        return <Bell className="w-4 h-4 text-zinc-400" />;
    }
  };

  return (
    <div
      className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl p-6 shadow-2xl relative flex flex-col h-[600px] w-full max-w-md overflow-hidden"
      id="communication-notif-center"
    >
      {/* Top Title Section */}
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-850 pb-4 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-xl">
            <Bell className="w-4.5 h-4.5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100">Notification Center</h3>
            <p className="text-[10px] text-zinc-400 font-mono tracking-widest uppercase">
              {unreadCount} UNREAD DISPATCHES
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllRead}
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-indigo-500 rounded-xl transition-all cursor-pointer text-[11px] font-bold flex items-center gap-1"
              title="Mark all as read"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Mark All</span>
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Notifications scroll list */}
      <div className="flex-1 overflow-y-auto mt-4 space-y-3.5 pr-1 max-h-[440px]">
        <AnimatePresence initial={false}>
          {notifications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-16 text-center space-y-3"
            >
              <div className="p-4 bg-zinc-100 dark:bg-zinc-800/40 rounded-full">
                <Bell className="w-8 h-8 text-zinc-400" />
              </div>
              <p className="text-xs font-bold text-zinc-400">All caught up! No recent dispatches.</p>
            </motion.div>
          ) : (
            notifications.map(notif => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.15 }}
                className={`p-4 rounded-2xl border transition-all relative group flex gap-3 ${
                  notif.isRead
                    ? "bg-white/40 dark:bg-zinc-900/40 border-zinc-100 dark:border-zinc-850/50"
                    : "bg-indigo-500/[0.02] dark:bg-indigo-500/[0.01] border-indigo-500/10 dark:border-indigo-500/5 shadow-xs"
                }`}
              >
                {/* Active Unread Indicator Bar */}
                {!notif.isRead && (
                  <div className="absolute top-0 bottom-0 left-0 w-1 bg-indigo-500 rounded-l-2xl" />
                )}

                {/* Left Side Icon */}
                <div className="shrink-0">
                  <div className="p-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
                    {getTypeIcon(notif.type)}
                  </div>
                </div>

                {/* Central Body Context */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase ${getPriorityStyles(notif.priority)}`}>
                      {notif.priority}
                    </span>
                    <span className="text-[9px] font-mono text-zinc-400">
                      {new Date(notif.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>

                  <h4 className="text-xs font-black text-zinc-800 dark:text-zinc-100 leading-tight">
                    {notif.title}
                  </h4>
                  <p className="text-[11px] text-zinc-500 leading-relaxed font-sans">{notif.body}</p>

                  {/* Action buttons embedded */}
                  <div className="flex items-center justify-between pt-2">
                    {notif.metadata?.meetingLink && onActionTrigger && (
                      <button
                        onClick={() => onActionTrigger(notif)}
                        className="text-[10px] text-indigo-500 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Join Video Lobby</span>
                      </button>
                    )}

                    {notif.metadata?.score && (
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] font-mono font-black text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                          ATS Score: {notif.metadata.score}%
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 ml-auto">
                      {!notif.isRead && (
                        <button
                          onClick={() => onMarkRead(notif.id)}
                          className="text-[9px] text-zinc-400 hover:text-indigo-500 font-mono font-bold uppercase transition-colors cursor-pointer"
                        >
                          Mark Read
                        </button>
                      )}
                      <button
                        onClick={() => onDelete(notif.id)}
                        className="text-zinc-400 hover:text-rose-500 p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                        title="Delete dispatch"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Footer Info Statement */}
      <div className="pt-4 border-t border-zinc-100 dark:border-zinc-850 flex items-center justify-between text-[9px] font-mono text-zinc-400 shrink-0">
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          <span>Real-time Sync Active</span>
        </span>
        <span className="text-emerald-500 font-bold">● ONLINE GATEWAY</span>
      </div>
    </div>
  );
}

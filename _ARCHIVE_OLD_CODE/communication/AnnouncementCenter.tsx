/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  Megaphone,
  Briefcase,
  Calendar,
  Wrench,
  AlertTriangle,
  Heart,
  Eye,
  Plus,
  Search,
  Users,
  Send,
  Sparkles,
  BookOpen,
  ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AnnouncementItem, AnnouncementType, PriorityLevel, UserRole } from "./types";

interface AnnouncementCenterProps {
  announcements: AnnouncementItem[];
  currentUserRole: UserRole;
  currentUserName: string;
  onPublishAnnouncement: (ann: Omit<AnnouncementItem, "id" | "publishedAt" | "likes" | "viewCount">) => void;
  onLikeAnnouncement: (id: string) => void;
  onViewAnnouncement: (id: string) => void;
}

export function AnnouncementCenter({
  announcements,
  currentUserRole,
  currentUserName,
  onPublishAnnouncement,
  onLikeAnnouncement,
  onViewAnnouncement
}: AnnouncementCenterProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [showCreator, setShowCreator] = useState(false);

  // Form State for privileged creators
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formType, setFormType] = useState<AnnouncementType>("Platform Announcement");
  const [formPriority, setFormPriority] = useState<PriorityLevel>("Medium");
  const [formTargets, setFormTargets] = useState<UserRole[]>(["Student"]);

  // Roles permitted to author announcements
  const canPublish = ["Admin", "Super Admin"].includes(currentUserRole);

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

  const getIconForType = (type: AnnouncementType) => {
    switch (type) {
      case "Interview Schedule":
      case "Technical Workshop":
        return <Briefcase className="w-4 h-4 text-emerald-500" />;
      case "Training Session":
        return <BookOpen className="w-4 h-4 text-indigo-500" />;
      case "Maintenance Notice":
        return <Wrench className="w-4 h-4 text-zinc-500" />;
      case "Emergency Alert":
        return <AlertTriangle className="w-4 h-4 text-rose-500 animate-bounce" />;
      default:
        return <Megaphone className="w-4 h-4 text-purple-500" />;
    }
  };

  // Filter list
  const filteredAnnouncements = announcements.filter(ann => {
    const matchesSearch =
      ann.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ann.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "All" || ann.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formTitle.trim() === "" || formContent.trim() === "") return;

    onPublishAnnouncement({
      title: formTitle,
      content: formContent,
      type: formType,
      publishedBy: currentUserName,
      publishedByRole: currentUserRole,
      priority: formPriority,
      targets: formTargets
    });

    // Reset Form
    setFormTitle("");
    setFormContent("");
    setFormTargets(["Student"]);
    setShowCreator(false);
  };

  const toggleTarget = (role: UserRole) => {
    if (formTargets.includes(role)) {
      setFormTargets(prev => prev.filter(r => r !== role));
    } else {
      setFormTargets(prev => [...prev, role]);
    }
  };

  return (
    <div
      className="bg-white/60 dark:bg-zinc-950/60 backdrop-blur-xl border border-zinc-200/60 dark:border-zinc-850 rounded-3xl p-6 shadow-xl w-full"
      id="announcement-center-dashboard"
    >
      {/* Upper header action controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-150 dark:border-zinc-850">
        <div>
          <span className="text-[10px] text-indigo-500 font-mono font-bold tracking-widest uppercase block">
            CAMPUS DISPATCH BOARD
          </span>
          <h2 className="text-base font-black text-zinc-900 dark:text-zinc-50 mt-1">
            Placements & Workspace Announcements
          </h2>
        </div>

        {canPublish && (
          <button
            onClick={() => setShowCreator(!showCreator)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold rounded-2xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-md self-start sm:self-center"
          >
            <Plus className="w-4 h-4" />
            <span>Create Dispatch</span>
          </button>
        )}
      </div>

      {/* Slideout Publish Drawer */}
      <AnimatePresence>
        {showCreator && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-zinc-100 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-900/20"
          >
            <form onSubmit={handleCreateSubmit} className="py-6 space-y-4">
              <h3 className="text-xs font-black text-zinc-950 dark:text-zinc-50 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span>Publish Official Announcement</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Title and Category */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase font-mono">Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Google Interview Cohort Registrations"
                    value={formTitle}
                    onChange={e => setFormTitle(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-xs text-zinc-850 dark:text-zinc-100 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase font-mono">Announcement Type</label>
                  <select
                    value={formType}
                    onChange={e => setFormType(e.target.value as AnnouncementType)}
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-880 rounded-xl p-3 text-xs text-zinc-850 dark:text-zinc-100 focus:outline-none"
                  >
                    <option value="Platform Announcement">Platform Announcement</option>
                    <option value="Interview Schedule">Interview Schedule</option>
                    <option value="Technical Workshop">Technical Workshop</option>
                    <option value="Training Session">Training Session</option>
                    <option value="Practice Deadline">Practice Deadline</option>
                    <option value="Maintenance Notice">Maintenance Notice</option>
                    <option value="Emergency Alert">Emergency Alert</option>
                  </select>
                </div>
              </div>

              {/* Priority and Targeted Scope */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase font-mono">Priority Level</label>
                  <div className="flex gap-2">
                    {(["Low", "Medium", "High", "Critical"] as PriorityLevel[]).map(level => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setFormPriority(level)}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-colors cursor-pointer ${
                          formPriority === level
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "bg-white dark:bg-zinc-900 text-zinc-500 border-zinc-200 dark:border-zinc-800"
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase font-mono">Target Audience</label>
                  <div className="flex flex-wrap gap-1.5">
                    {(["Student", "Admin", "Super Admin"] as UserRole[]).map(role => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => toggleTarget(role)}
                        className={`px-3 py-1 text-[10px] font-bold rounded-xl border transition-colors cursor-pointer ${
                          formTargets.includes(role)
                            ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 border-zinc-900"
                            : "bg-white dark:bg-zinc-900 text-zinc-500 border-zinc-200 dark:border-zinc-800"
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Text Area Description */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase font-mono">Message Context</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Provide precise requirements, schedules, cut-offs, or announcements criteria..."
                  value={formContent}
                  onChange={e => setFormContent(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3 text-xs text-zinc-850 dark:text-zinc-100 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreator(false)}
                  className="px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-[10px] font-bold text-zinc-400 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Publish Notice</span>
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Query Filters Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between mt-6 bg-zinc-50/50 dark:bg-zinc-900/40 p-3 rounded-2xl border border-zinc-100 dark:border-zinc-900">
        <div className="flex items-center gap-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3 py-2 rounded-xl w-full md:max-w-xs">
          <Search className="w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search titles, descriptions..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="bg-transparent border-none text-xs focus:outline-none w-full text-zinc-800 dark:text-zinc-100"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {["All", "Platform Announcement", "Interview Schedule", "Training Session", "Maintenance Notice", "Emergency Alert"].map(category => (
            <button
              key={category}
              onClick={() => setSelectedType(category)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-bold shrink-0 transition-colors cursor-pointer ${
                selectedType === category
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950"
                  : "bg-white dark:bg-zinc-950 text-zinc-400 hover:text-zinc-700 border border-zinc-200 dark:border-zinc-900"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Announcements Stream */}
      <div className="mt-6 space-y-4">
        {filteredAnnouncements.length === 0 ? (
          <div className="text-center py-16 text-zinc-400 space-y-3">
            <div className="p-4 bg-zinc-100 dark:bg-zinc-900 rounded-full w-14 h-14 flex items-center justify-center mx-auto">
              <Megaphone className="w-6 h-6 text-zinc-300" />
            </div>
            <p className="text-xs font-bold">No announcements match your filter constraints.</p>
          </div>
        ) : (
          filteredAnnouncements.map(ann => (
            <div
              key={ann.id}
              onClick={() => onViewAnnouncement(ann.id)}
              className="p-5 bg-white/40 dark:bg-zinc-900/40 border border-zinc-200/40 dark:border-zinc-850/50 rounded-3xl hover:border-indigo-500/20 transition-all flex flex-col md:flex-row gap-4 items-start relative group"
            >
              {/* Type Category Visual Tag */}
              <div className="shrink-0 p-3 bg-zinc-100 dark:bg-zinc-850 rounded-2xl flex items-center justify-center">
                {getIconForType(ann.type)}
              </div>

              {/* Text body */}
              <div className="flex-1 space-y-2 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase ${getPriorityStyles(ann.priority)}`}>
                    {ann.priority} Priority
                  </span>
                  <span className="text-[10px] font-bold text-zinc-400 font-mono">
                    Category: {ann.type}
                  </span>
                </div>

                <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-50 leading-tight">
                  {ann.title}
                </h3>
                <p className="text-xs text-zinc-500 leading-relaxed font-sans">{ann.content}</p>

                {/* Metadata & Creator detail */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-zinc-100/50 dark:border-zinc-850/30 text-[10px] font-mono text-zinc-400">
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Published by: <strong>{ann.publishedBy}</strong> ({ann.publishedByRole})</span>
                    <span>•</span>
                    <span>{new Date(ann.publishedAt).toLocaleDateString([], { month: "short", day: "numeric" })}</span>
                  </div>

                  {/* Likes and Views interactive indicators */}
                  <div className="flex items-center gap-3 ml-auto shrink-0">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{ann.viewCount || 0} Views</span>
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onLikeAnnouncement(ann.id);
                      }}
                      className="flex items-center gap-1 text-zinc-400 hover:text-pink-500 group-hover:scale-110 transition-transform cursor-pointer font-bold"
                    >
                      <Heart className="w-3.5 h-3.5" />
                      <span>{ann.likes || 0} Likes</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}

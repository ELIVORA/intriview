/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Calendar,
  AlertCircle,
  TrendingUp,
  CheckCircle2,
  Briefcase,
  Layers,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { TaskItem, TaskCategory, PriorityLevel } from "./types";
import { taskManagerService } from "./services";

interface TaskManagerProps {
  tasks: TaskItem[];
  onRefresh: () => void;
  onShowAlert: (message: string, type: "success" | "info" | "error") => void;
}

export function TaskManager({ tasks, onRefresh, onShowAlert }: TaskManagerProps) {
  const [activeCategory, setActiveCategory] = useState<TaskCategory | "All">("All");
  const [showCreator, setShowCreator] = useState(false);

  // Form State
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskPriority, setTaskPriority] = useState<PriorityLevel>("Medium");
  const [taskCat, setTaskCat] = useState<TaskCategory>("Today");
  const [taskDue, setTaskDue] = useState("");

  const handleToggleStatus = (id: string) => {
    taskManagerService.toggleTaskStatus(id);
    onRefresh();
    onShowAlert("Task status toggled successfully!", "success");
  };

  const handleDeleteTask = (id: string) => {
    taskManagerService.deleteTask(id);
    onRefresh();
    onShowAlert("Task removed from checklist", "info");
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle) return;

    taskManagerService.addTask({
      title: taskTitle,
      description: taskDesc,
      status: "Pending",
      priority: taskPriority,
      dueDate: taskDue ? new Date(taskDue).toISOString() : new Date().toISOString(),
      category: taskCat,
      userId: "part_student_1" // Hardcoded student id for demo
    });

    onShowAlert(`Checklist item "${taskTitle}" registered!`, "success");
    setTaskTitle("");
    setTaskDesc("");
    setTaskDue("");
    setShowCreator(false);
    onRefresh();
  };

  const categories: (TaskCategory | "All")[] = [
    "All",
    "Today",
    "Pending",
    "Completed",
    "Upcoming",
    "Priority",
    "Interview Checklist",
    "Resume Checklist"
  ];

  const getPriorityDot = (p: PriorityLevel) => {
    switch (p) {
      case "Critical":
        return "bg-rose-500 shadow-rose-500/20";
      case "High":
        return "bg-amber-500 shadow-amber-500/20";
      case "Medium":
        return "bg-indigo-500 shadow-indigo-500/20";
      default:
        return "bg-zinc-400 shadow-zinc-400/20";
    }
  };

  // Filter Tasks
  const filteredTasks = tasks.filter(task => {
    if (activeCategory === "All") return true;
    if (activeCategory === "Pending") return task.status === "Pending";
    if (activeCategory === "Completed") return task.status === "Completed";
    if (activeCategory === "Priority") return task.priority === "Critical" || task.priority === "High";
    return task.category === activeCategory;
  });

  const total = tasks.length;
  const completedCount = tasks.filter(t => t.status === "Completed").length;
  const progressPercent = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-4 gap-6 w-full"
      id="task-management-workspace"
    >
      {/* LEFT COLUMN: Categories Navigation Panel */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white/60 dark:bg-zinc-950/60 backdrop-blur-xl border border-zinc-200/60 dark:border-zinc-850 p-5 rounded-3xl shadow-xl space-y-4">
          <div className="pb-3 border-b border-zinc-150 dark:border-zinc-850">
            <span className="text-[10px] text-indigo-500 font-mono font-bold tracking-widest uppercase block">
              COMPLIANCE HUB
            </span>
            <h3 className="text-sm font-black text-zinc-950 dark:text-zinc-50 mt-0.5">
              Task Checklist
            </h3>
          </div>

          <div className="space-y-1">
            {categories.map(cat => {
              const count = cat === "All"
                ? tasks.length
                : cat === "Pending"
                ? tasks.filter(t => t.status === "Pending").length
                : cat === "Completed"
                ? tasks.filter(t => t.status === "Completed").length
                : cat === "Priority"
                ? tasks.filter(t => t.priority === "Critical" || t.priority === "High").length
                : tasks.filter(t => t.category === cat).length;

              const isSelected = activeCategory === cat;

              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-100 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/40"
                  }`}
                >
                  <span>{cat}</span>
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center leading-none ${
                    isSelected ? "bg-white/20 text-white" : "bg-zinc-100 dark:bg-zinc-900 text-zinc-400"
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Compliance Progress card */}
        <div className="bg-white/60 dark:bg-zinc-950/60 backdrop-blur-xl border border-zinc-200/60 dark:border-zinc-850 p-5 rounded-3xl shadow-xl space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            <h4 className="text-xs font-black text-zinc-950 dark:text-zinc-50">
              Placement Readiness Index
            </h4>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] font-mono text-zinc-400 font-bold">
              <span>CHECKLIST METRIC</span>
              <span>{progressPercent}% Complete</span>
            </div>
            {/* Progress line */}
            <div className="w-full bg-zinc-150 dark:bg-zinc-850 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          <p className="text-[10px] text-zinc-400 leading-normal">
            Your ATS compliance rate increases as you finish resume checkpoints and dynamic coding mocks.
          </p>
        </div>
      </div>

      {/* RIGHT 3 COLUMNS: Tasks List View */}
      <div className="lg:col-span-3 space-y-6">
        <div className="bg-white/60 dark:bg-zinc-950/60 backdrop-blur-xl border border-zinc-200/60 dark:border-zinc-850 p-6 rounded-3xl shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-150 dark:border-zinc-850">
            <div>
              <span className="text-[10px] text-indigo-500 font-mono font-bold tracking-widest uppercase block">
                AUDITED OBJECTIVES
              </span>
              <h2 className="text-sm font-black text-zinc-950 dark:text-zinc-50 mt-0.5">
                Current Compliance Tasks ({filteredTasks.length})
              </h2>
            </div>

            <button
              onClick={() => setShowCreator(!showCreator)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Checklist Item</span>
            </button>
          </div>

          {/* Form to Create Checklist Item */}
          <AnimatePresence>
            {showCreator && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden bg-zinc-50/50 dark:bg-zinc-900/10 border border-zinc-200/40 dark:border-zinc-800 p-4 rounded-2xl"
              >
                <form onSubmit={handleCreateTask} className="space-y-4 text-left">
                  <h3 className="text-xs font-black text-zinc-950 dark:text-zinc-50 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    <span>Create Checklist Item</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-zinc-400 uppercase font-mono">Task Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Optimize Redis Caching Responses"
                        value={taskTitle}
                        onChange={e => setTaskTitle(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 p-2.5 rounded-xl text-xs focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-zinc-400 uppercase font-mono">Priority Level</label>
                      <select
                        value={taskPriority}
                        onChange={e => setTaskPriority(e.target.value as PriorityLevel)}
                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 p-2.5 rounded-xl text-xs focus:outline-none"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-zinc-400 uppercase font-mono">Due Date</label>
                      <input
                        type="date"
                        required
                        value={taskDue}
                        onChange={e => setTaskDue(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 p-2.5 rounded-xl text-xs focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-zinc-400 uppercase font-mono">Checklist Group</label>
                      <select
                        value={taskCat}
                        onChange={e => setTaskCat(e.target.value as TaskCategory)}
                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 p-2.5 rounded-xl text-xs focus:outline-none"
                      >
                        <option value="Today">Today</option>
                        <option value="Interview Checklist">Interview Checklist</option>
                        <option value="Resume Checklist">Resume Checklist</option>
                        <option value="Upcoming">Upcoming</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase font-mono">Agenda Description</label>
                    <textarea
                      placeholder="Brief details about what needs to be verified..."
                      rows={2}
                      value={taskDesc}
                      onChange={e => setTaskDesc(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 p-2.5 rounded-xl text-xs focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowCreator(false)}
                      className="px-4 py-2 hover:bg-zinc-150 dark:hover:bg-zinc-800 text-[10px] font-bold text-zinc-500 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded-lg cursor-pointer"
                    >
                      Register Item
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tasks Stack */}
          <div className="space-y-3.5 max-h-[460px] overflow-y-auto pr-1">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-20 text-zinc-400 space-y-3">
                <div className="p-4 bg-zinc-100 dark:bg-zinc-900 rounded-full w-14 h-14 flex items-center justify-center mx-auto">
                  <CheckSquare className="w-6 h-6 text-zinc-300" />
                </div>
                <p className="text-xs font-bold">No items catalogued under this compliance group.</p>
              </div>
            ) : (
              filteredTasks.map(task => {
                const isCompleted = task.status === "Completed";
                const isOverdue = new Date(task.dueDate) < new Date() && !isCompleted;

                return (
                  <div
                    key={task.id}
                    className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 relative group ${
                      isCompleted
                        ? "bg-zinc-50/50 dark:bg-zinc-900/5 border-zinc-200/40 opacity-70"
                        : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-850 hover:border-indigo-500/20"
                    }`}
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      {/* Checkbox Trigger Button */}
                      <button
                        onClick={() => handleToggleStatus(task.id)}
                        className="text-zinc-400 hover:text-indigo-600 mt-0.5 shrink-0 transition-transform hover:scale-110 cursor-pointer"
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-indigo-600 fill-indigo-100 dark:fill-indigo-950/40" />
                        ) : (
                          <Square className="w-5 h-5 text-zinc-300 dark:text-zinc-700" />
                        )}
                      </button>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                            {task.category}
                          </span>
                          <span className="flex items-center gap-1 text-[8px] font-bold text-zinc-400 font-mono">
                            <span className={`w-2 h-2 rounded-full shadow-xs ${getPriorityDot(task.priority)}`} />
                            <span>{task.priority} Priority</span>
                          </span>
                          {isOverdue && (
                            <span className="bg-rose-500/10 text-rose-500 text-[8px] font-mono font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                              <AlertCircle className="w-2.5 h-2.5" />
                              <span>Overdue</span>
                            </span>
                          )}
                        </div>

                        <h4 className={`text-xs font-black text-zinc-900 dark:text-zinc-150 truncate ${
                          isCompleted ? "line-through text-zinc-400" : ""
                        }`}>
                          {task.title}
                        </h4>
                        <p className="text-[10px] text-zinc-500 leading-normal mt-0.5">
                          {task.description}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-3">
                      <span className="text-[9px] font-mono font-bold text-zinc-400 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{new Date(task.dueDate).toLocaleDateString([], { month: "short", day: "numeric" })}</span>
                      </span>

                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-2 text-zinc-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer"
                        title="Delete checkpoint"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

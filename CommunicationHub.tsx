/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Bell,
  Megaphone,
  Settings,
  BarChart3,
  Users,
  ShieldAlert,
  Download,
  CheckCircle,
  FileText,
  Clock,
  ExternalLink,
  ChevronRight,
  Pin,
  Send,
  AlertCircle,
  Sparkles,
  Calendar as CalendarIcon
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import {
  UserRole,
  NotificationItem,
  ChatConversation,
  ChatMessage,
  AnnouncementItem,
  EmailTemplate,
  NotificationPreferences,
  DeliveryLog,
  MessageAttachment,
  CalendarEvent,
  BookingSlot,
  TaskItem,
  CommunicationReport
} from "./types";

import {
  wsGateway,
  notificationService,
  messagingService,
  announcementService,
  emailService,
  reminderScheduler,
  calendarService,
  taskManagerService,
  reportsService
} from "./services";

import { NotificationCenter } from "./NotificationCenter";
import { ChatWindow } from "./ChatWindow";
import { AnnouncementCenter } from "./AnnouncementCenter";
import { NotificationSettings } from "./NotificationSettings";
import { DeliveryAnalytics } from "./DeliveryAnalytics";
import { CalendarView } from "./CalendarView";
import { TaskManager } from "./TaskManager";
import { AiAssistant } from "./AiAssistant";
import { CommunicationReports } from "./CommunicationReports";
import { MOCK_PARTICIPANTS } from "./mockData";

export function CommunicationHub() {
  // Simulator testing roles
  const [activeUser, setActiveUser] = useState<typeof MOCK_PARTICIPANTS[0]>(MOCK_PARTICIPANTS[0]); // Aarav Sharma (Student)
  const [activeTab, setActiveTab] = useState<
    "chat" | "notifications" | "announcements" | "settings" | "analytics" | "calendar" | "tasks" | "ai_prep" | "reports"
  >("chat");

  // Local React States reflecting the services
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string>("");
  const [activeMessages, setActiveMessages] = useState<ChatMessage[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences>(() =>
    notificationService.getPreferences(MOCK_PARTICIPANTS[0].id, MOCK_PARTICIPANTS[0].role)
  );
  const [deliveryLogs, setDeliveryLogs] = useState<DeliveryLog[]>([]);

  // States for new services
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [bookingSlots, setBookingSlots] = useState<BookingSlot[]>([]);
  const [tasksList, setTasksList] = useState<TaskItem[]>([]);
  const [reportsData, setReportsData] = useState<CommunicationReport>(() =>
    reportsService.getReport(MOCK_PARTICIPANTS[0].id)
  );

  // Toast feedback state
  const [alertToast, setAlertToast] = useState<{ message: string; type: "success" | "info" | "error" } | null>(null);

  const showAlert = (message: string, type: "success" | "info" | "error" = "success") => {
    setAlertToast({ message, type });
    setTimeout(() => setAlertToast(null), 4000);
  };

  // Synchronize with services on user switch
  useEffect(() => {
    // Connect user to Simulated WebSockets Gateway
    const socketId = wsGateway.connect(activeUser.id, activeUser.role);

    // Sync state
    syncAllData();

    // Trigger Scheduler for Student role to make the demo lively
    if (activeUser.role === "Student") {
      reminderScheduler.startScheduler(activeUser.id, (newNotif) => {
        setNotifications(prev => [newNotif, ...prev]);
        setDeliveryLogs([...emailService.getDeliveryLogs()]);
        showAlert(`Alert: ${newNotif.title}`, "info");
      });
    } else {
      reminderScheduler.stopScheduler();
    }

    return () => {
      wsGateway.disconnect(socketId);
      reminderScheduler.stopScheduler();
    };
  }, [activeUser]);

  // Sync active chat messages if thread changes
  useEffect(() => {
    if (activeConvId) {
      const msgs = messagingService.getMessages(activeConvId);
      setActiveMessages(msgs);
      messagingService.markAsSeen(activeConvId, activeUser.id);
      syncConversations();
    } else {
      setActiveMessages([]);
    }
  }, [activeConvId, activeUser]);

  const syncAllData = () => {
    const userNotifs = notificationService.getUserNotifications(activeUser.id);
    setNotifications(userNotifs);

    syncConversations();

    const anns = announcementService.getAnnouncements(activeUser.role);
    setAnnouncements(anns);

    const prefs = notificationService.getPreferences(activeUser.id, activeUser.role);
    setPreferences(prefs);

    const logs = emailService.getDeliveryLogs();
    setDeliveryLogs([...logs]);

    // Sync state for new scheduling, tasks and audit reports
    setCalendarEvents([...calendarService.getEvents()]);
    setBookingSlots([...calendarService.getBookingSlots()]);
    setTasksList([...taskManagerService.getTasks(activeUser.id)]);
    setReportsData(reportsService.getReport(activeUser.id));
  };

  const syncConversations = () => {
    const convs = messagingService.getConversations(activeUser.id);
    setConversations(convs);
    if (convs.length > 0 && !activeConvId) {
      setActiveConvId(convs[0].id);
    }
  };

  // Switch role inside sandbox
  const handleUserRoleChange = (userId: string) => {
    const selected = MOCK_PARTICIPANTS.find(p => p.id === userId);
    if (selected) {
      setActiveUser(selected);
      setActiveConvId(""); // Clear active thread to force re-selection
      showAlert(`Switched testing role to ${selected.name} (${selected.role})`, "success");
    }
  };

  // --- ACTIONS CONTROLLERS ---

  const handleMarkNotifRead = (id: string) => {
    notificationService.markAsRead(id);
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, isRead: true } : n)));
    showAlert("Notification marked as read", "success");
  };

  const handleMarkAllNotifsRead = () => {
    notificationService.markAllAsRead(activeUser.id);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    showAlert("All notifications marked as read", "success");
  };

  const handleDeleteNotif = (id: string) => {
    notificationService.deleteNotification(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
    showAlert("Notification deleted from workspace feed", "info");
  };

  const handleSendMessage = (body: string, attachments?: MessageAttachment[]) => {
    if (!activeConvId) return;

    const newMsg = messagingService.sendMessage(activeConvId, activeUser.id, body, attachments);
    setActiveMessages(prev => [...prev, newMsg]);
    syncConversations();

    // Simulated instant NLP response from the other user for a complete interactive feel!
    setTimeout(() => {
      const activeThread = conversations.find(c => c.id === activeConvId);
      if (!activeThread) return;

      const responder = activeThread.participants.find(p => p.id !== activeUser.id);
      if (!responder) return;

      let replyText = "Received. Let me review your interview analytics and follow up.";
      if (responder.role === "Admin") {
        replyText = "Fascinating progress. I've logged your credentials inside the ATS pipeline successfully.";
      } else if (responder.role === "Super Admin") {
        replyText = "Excellent progress on your verbal speed metrics! I am unlocking your mock sandbox interview invites now.";
      }

      const autoMsg = messagingService.sendMessage(activeConvId, responder.id, replyText);

      // If we are still looking at the same conversation, update message stream
      if (activeConvId === activeThread.id) {
        setActiveMessages(prev => [...prev, autoMsg]);
      }
      syncConversations();
    }, 1800);
  };

  const handleTogglePinMessage = (messageId: string) => {
    const isPinned = messagingService.togglePinMessage(messageId);
    setActiveMessages(prev => prev.map(m => (m.id === messageId ? { ...m, isPinned } : m)));
    showAlert(isPinned ? "Message pinned to thread banner" : "Message unpinned", "success");
  };

  const handlePublishAnnouncement = (ann: Omit<AnnouncementItem, "id" | "publishedAt" | "likes" | "viewCount">) => {
    const newAnn = announcementService.createAnnouncement(ann);
    setAnnouncements(prev => [newAnn, ...prev]);
    showAlert("Announcement published and broadcasted!", "success");
  };

  const handleLikeAnnouncement = (id: string) => {
    announcementService.toggleLike(id);
    setAnnouncements(prev => prev.map(a => (a.id === id ? { ...a, likes: (a.likes || 0) + 1 } : a)));
  };

  const handleViewAnnouncement = (id: string) => {
    announcementService.incrementViews(id);
    setAnnouncements(prev => prev.map(a => (a.id === id ? { ...a, viewCount: (a.viewCount || 0) + 1 } : a)));
  };

  const handleUpdatePreferences = (updatedPref: NotificationPreferences) => {
    notificationService.updatePreferences(updatedPref);
    setPreferences(updatedPref);
    showAlert("Notification rules updated!", "success");
  };

  // Simulated PDF Download
  const handleDownloadReport = () => {
    showAlert("Compiling delivery logs and building PDF statement...", "info");
    setTimeout(() => {
      const element = document.createElement("a");
      const file = new Blob([JSON.stringify({
        reportTitle: "Enterprise Notification Delivery Analytics Report",
        auditTimestamp: new Date().toISOString(),
        deliveryRate: `${emailService.getAnalytics().emailDeliveryRate}%`,
        openRate: `${emailService.getAnalytics().openRate}%`,
        readRate: `${emailService.getAnalytics().readRate}%`,
        logs: deliveryLogs
      }, null, 2)], { type: "text/plain" });
      element.href = URL.createObjectURL(file);
      element.download = "Notification_Analytics_Audit.json";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      showAlert("PDF report simulated and exported successfully!", "success");
    }, 1000);
  };

  const handleDownloadAudit = () => {
    showAlert("Auditing database actions and formatting secure CSV file...", "info");
    setTimeout(() => {
      const element = document.createElement("a");
      const file = new Blob([JSON.stringify({
        title: "Enterprise Scheduling, Tasks, and AI Mentorship Audit",
        generatedAt: new Date().toISOString(),
        userId: activeUser.id,
        userRole: activeUser.role,
        summary: reportsService.getReport(activeUser.id)
      }, null, 2)], { type: "text/plain" });
      element.href = URL.createObjectURL(file);
      element.download = "Workspace_Audit_Report.json";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      showAlert("Comprehensive Audit report exported!", "success");
    }, 1000);
  };

  const activeThread = conversations.find(c => c.id === activeConvId);

  return (
    <div
      className="space-y-6 w-full max-w-7xl mx-auto p-4 md:p-6"
      id="communication-platform-hub"
    >
      {/* Dynamic Toast Alert */}
      <AnimatePresence>
        {alertToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-8 right-8 z-50 p-4 rounded-2xl border shadow-2xl flex items-center gap-3 text-xs font-black max-w-sm ${
              alertToast.type === "success"
                ? "bg-emerald-500 text-white border-emerald-600"
                : alertToast.type === "error"
                ? "bg-rose-500 text-white border-rose-600"
                : "bg-indigo-500 text-white border-indigo-600"
            }`}
          >
            {alertToast.type === "success" ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
            <span>{alertToast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP HEADER & ROLE TESTING CONTROLS */}
      <div className="bg-white/60 dark:bg-zinc-950/60 backdrop-blur-xl border border-zinc-200/60 dark:border-zinc-850 p-6 rounded-3xl shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-44 h-44 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="space-y-1">
          <span className="text-[10px] text-indigo-500 font-mono font-bold tracking-widest block uppercase">
            ENTERPRISE COMMUNICATOR
          </span>
          <h1 className="text-xl font-black text-zinc-900 dark:text-zinc-50 leading-tight">
            Enterprise Notification & Communication Platform
          </h1>
          <p className="text-xs text-zinc-400">
            End-to-end encrypted messaging, multi-user websocket gateways, and targeted notices.
          </p>
        </div>

        {/* ROLE TESTING SELECTOR PANEL */}
        <div className="bg-zinc-100 dark:bg-zinc-900/40 p-3 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 shrink-0">
            <Users className="w-4 h-4 text-indigo-500" />
            <span className="text-[10px] font-bold text-zinc-500 font-mono uppercase">
              Current Workspace Persona:
            </span>
          </div>
          
          <select
            value={activeUser.id}
            onChange={(e) => handleUserRoleChange(e.target.value)}
            className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 text-xs font-bold text-zinc-800 dark:text-zinc-100 focus:outline-none w-full sm:w-auto cursor-pointer"
          >
            {MOCK_PARTICIPANTS.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.role})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex gap-2 p-1.5 bg-zinc-100 dark:bg-zinc-900/60 rounded-2xl border border-zinc-200/40 dark:border-zinc-800/40 overflow-x-auto">
        {[
          { id: "chat", label: "Workspace Messenger", icon: <MessageSquare className="w-4 h-4" /> },
          { id: "notifications", label: "In-App Central Feed", icon: <Bell className="w-4 h-4" /> },
          { id: "announcements", label: "Campus Announcements", icon: <Megaphone className="w-4 h-4" /> },
          { id: "calendar", label: "Schedule & Calendar", icon: <CalendarIcon className="w-4 h-4" /> },
          { id: "tasks", label: "Task Manager", icon: <CheckCircle className="w-4 h-4" /> },
          { id: "ai_prep", label: "AI Prep Assistant", icon: <Sparkles className="w-4 h-4" /> },
          { id: "reports", label: "Activity Reports", icon: <FileText className="w-4 h-4" /> },
          { id: "settings", label: "Sandbox Preferences", icon: <Settings className="w-4 h-4" /> },
          { id: "analytics", label: "Analytics Console", icon: <BarChart3 className="w-4 h-4" /> }
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                isActive
                  ? "bg-white dark:bg-zinc-950 text-indigo-600 shadow-xs border border-zinc-200/40 dark:border-zinc-850"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}

        {activeTab === "analytics" && (
          <button
            onClick={handleDownloadReport}
            className="ml-auto flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Analytics</span>
          </button>
        )}
      </div>

      {/* CORE ACTIVE TABS SWITCH */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.15 }}
          className="w-full"
        >
          {activeTab === "chat" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left sidebar thread navigator */}
              <div className="lg:col-span-1 bg-white/60 dark:bg-zinc-950/60 backdrop-blur-xl border border-zinc-200/60 dark:border-zinc-850 p-5 rounded-3xl shadow-xl space-y-4 h-[650px] overflow-y-auto">
                <div className="pb-3 border-b border-zinc-150 dark:border-zinc-850">
                  <span className="text-[9px] text-indigo-500 font-mono font-bold tracking-widest block uppercase">
                    ENCRYPTED PLATFORM
                  </span>
                  <h3 className="text-sm font-black text-zinc-950 dark:text-zinc-50">
                    Conversations ({conversations.length})
                  </h3>
                </div>

                <div className="space-y-2">
                  {conversations.map(conv => {
                    const isSelected = conv.id === activeConvId;
                    const otherPart = conv.participants.find(p => p.id !== activeUser.id) || conv.participants[0];
                    return (
                      <div
                        key={conv.id}
                        onClick={() => setActiveConvId(conv.id)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative group flex items-start gap-3 ${
                          isSelected
                            ? "bg-indigo-600/5 dark:bg-indigo-600/[0.03] border-indigo-500/30"
                            : "bg-white/40 dark:bg-zinc-900/10 border-zinc-100/50 dark:border-zinc-850/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30"
                        }`}
                      >
                        {/* Selected vertical active stripe */}
                        {isSelected && (
                          <div className="absolute top-0 bottom-0 left-0 w-1 bg-indigo-600 rounded-l-2xl" />
                        )}

                        <div className="relative shrink-0">
                          <img
                            src={otherPart.avatarUrl}
                            alt={conv.name}
                            className="w-9 h-9 rounded-xl object-cover border border-zinc-100 dark:border-zinc-800"
                          />
                          {otherPart.isOnline && (
                            <span className="absolute bottom-[-1px] right-[-1px] w-3 h-3 bg-emerald-500 border-2 border-white dark:border-zinc-950 rounded-full" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0 space-y-0.5">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="text-xs font-black text-zinc-800 dark:text-zinc-150 truncate leading-tight">
                              {conv.name}
                            </h4>
                            <span className="text-[8px] font-mono text-zinc-400 shrink-0">
                              {conv.lastMessage
                                ? new Date(conv.lastMessage.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                                : "No message"}
                            </span>
                          </div>

                          <p className="text-[10px] text-zinc-500 truncate leading-normal">
                            {conv.lastMessage ? conv.lastMessage.body : "Start conversation..."}
                          </p>

                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[8px] font-mono font-bold text-zinc-400">
                              {otherPart.role}
                            </span>
                            
                            {conv.unreadCount > 0 && (
                              <span className="px-1.5 py-0.5 bg-indigo-600 text-white text-[8px] font-mono font-bold rounded-full min-w-[16px] text-center leading-none shrink-0">
                                {conv.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Central Active Chat thread */}
              <div className="lg:col-span-2">
                {activeThread ? (
                  <ChatWindow
                    key={activeThread.id}
                    conversation={activeThread}
                    currentUserId={activeUser.id}
                    messages={activeMessages}
                    onSendMessage={handleSendMessage}
                    onTogglePin={handleTogglePinMessage}
                    onMarkSeen={() => messagingService.markAsSeen(activeThread.id, activeUser.id)}
                  />
                ) : (
                  <div className="bg-white/60 dark:bg-zinc-950/60 backdrop-blur-xl border border-zinc-200/60 dark:border-zinc-850 rounded-3xl flex flex-col items-center justify-center h-[650px] p-6 text-center text-zinc-400 space-y-3">
                    <div className="p-4 bg-zinc-150 dark:bg-zinc-900 rounded-full">
                      <MessageSquare className="w-8 h-8 text-zinc-300 animate-pulse" />
                    </div>
                    <p className="text-xs font-bold">Select an encrypted conversation thread to begin secure workspace chat.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="flex items-center justify-center">
              <NotificationCenter
                notifications={notifications}
                onMarkRead={handleMarkNotifRead}
                onMarkAllRead={handleMarkAllNotifsRead}
                onDelete={handleDeleteNotif}
              />
            </div>
          )}

          {activeTab === "announcements" && (
            <AnnouncementCenter
              announcements={announcements}
              currentUserRole={activeUser.role}
              currentUserName={activeUser.name}
              onPublishAnnouncement={handlePublishAnnouncement}
              onLikeAnnouncement={handleLikeAnnouncement}
              onViewAnnouncement={handleViewAnnouncement}
            />
          )}

          {activeTab === "settings" && (
            <NotificationSettings
              preferences={preferences}
              onUpdatePreferences={handleUpdatePreferences}
              templates={emailService.getTemplates()}
            />
          )}

          {activeTab === "analytics" && (
            <DeliveryAnalytics logs={deliveryLogs} analytics={emailService.getAnalytics()} />
          )}

          {activeTab === "calendar" && (
            <CalendarView
              events={calendarEvents}
              bookingSlots={bookingSlots}
              currentUserRole={activeUser.role}
              currentUserId={activeUser.id}
              currentUserName={activeUser.name}
              onRefresh={syncAllData}
              onShowAlert={showAlert}
            />
          )}

          {activeTab === "tasks" && (
            <TaskManager
              tasks={tasksList}
              onRefresh={syncAllData}
              onShowAlert={showAlert}
            />
          )}

          {activeTab === "ai_prep" && (
            <AiAssistant
              onShowAlert={showAlert}
            />
          )}

          {activeTab === "reports" && (
            <CommunicationReports
              report={reportsData}
              onDownload={handleDownloadAudit}
            />
          )}
        </motion.div>
      </AnimatePresence>

    </div>
  );
}
export default CommunicationHub;

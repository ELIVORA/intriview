/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ChatParticipant,
  NotificationItem,
  ChatConversation,
  ChatMessage,
  AnnouncementItem,
  EmailTemplate,
  NotificationPreferences,
  DeliveryLog,
  NotificationAnalytics,
  UserRole,
  NotificationType,
  PriorityLevel,
  AnnouncementType,
  AttachmentType,
  MessageAttachment,
  CalendarEventType,
  CalendarEvent,
  BookingSlot,
  TaskCategory,
  TaskItem,
  AiMessage,
  AiPrepTopic,
  CommunicationReport
} from "./types";

import {
  MOCK_PARTICIPANTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_CONVERSATIONS,
  INITIAL_MESSAGES,
  INITIAL_ANNOUNCEMENTS,
  EMAIL_TEMPLATES,
  DEFAULT_PREFERENCES,
  INITIAL_DELIVERY_LOGS
} from "./mockData";

// --- WEBSOCKET GATEWAY SIMULATION ---
export interface WsConnection {
  socketId: string;
  userId: string;
  role: UserRole;
  connectedAt: string;
}

class SimWebSocketGateway {
  private activeConnections: WsConnection[] = [];
  private listeners: Record<string, ((data: any) => void)[]> = {};

  constructor() {
    // Pre-populate some online connections
    MOCK_PARTICIPANTS.filter(p => p.isOnline).forEach(p => {
      this.connect(p.id, p.role);
    });
  }

  public connect(userId: string, role: UserRole): string {
    const socketId = `ws_socket_${Math.random().toString(36).substring(2, 9)}`;
    const newConn: WsConnection = {
      socketId,
      userId,
      role,
      connectedAt: new Date().toISOString()
    };
    this.activeConnections.push(newConn);
    this.emit("connection:success", { socketId, userId, role });
    return socketId;
  }

  public disconnect(socketId: string) {
    this.activeConnections = this.activeConnections.filter(c => c.socketId !== socketId);
  }

  public on(event: string, callback: (data: any) => void) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  public emit(event: string, data: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }

  public broadcastToRole(role: UserRole, event: string, data: any) {
    this.activeConnections
      .filter(conn => conn.role === role)
      .forEach(conn => {
        this.emit(`${conn.userId}:${event}`, data);
      });
  }

  public broadcastToUser(userId: string, event: string, data: any) {
    this.emit(`${userId}:${event}`, data);
  }

  public getActiveConnections(): WsConnection[] {
    return this.activeConnections;
  }
}

export const wsGateway = new SimWebSocketGateway();

// --- ATTACHMENT VALIDATION SECURITY SERVICE ---
export class AttachmentValidator {
  private static readonly MAX_SIZE_MB = 10;
  private static readonly ALLOWED_EXTENSIONS = ["pdf", "docx", "png", "jpg", "jpeg"];

  public static validate(fileName: string, sizeBytes: number): { valid: boolean; error?: string } {
    const ext = fileName.split(".").pop()?.toLowerCase() || "";
    if (!this.ALLOWED_EXTENSIONS.includes(ext)) {
      return {
        valid: false,
        error: `Invalid file extension: .${ext}. Only PDF, DOCX, and common Images are supported.`
      };
    }

    const sizeMB = sizeBytes / (1024 * 1024);
    if (sizeMB > this.MAX_SIZE_MB) {
      return {
        valid: false,
        error: `File size exceeds the limit of ${this.MAX_SIZE_MB}MB.`
      };
    }

    return { valid: true };
  }
}

// --- EMAIL SERVICE & TEMPLATE COMPILE ---
export class EmailService {
  private templates: EmailTemplate[] = EMAIL_TEMPLATES;
  private deliveryLogs: DeliveryLog[] = INITIAL_DELIVERY_LOGS;

  public getTemplates(): EmailTemplate[] {
    return this.templates;
  }

  public compileTemplate(templateId: string, replacements: Record<string, string>): { subject: string; html: string } {
    const template = this.templates.find(t => t.id === templateId);
    if (!template) {
      throw new Error(`Email template with id ${templateId} not found.`);
    }

    let compiledBody = template.bodyHtml;
    let compiledSubject = template.subject;

    Object.keys(replacements).forEach(key => {
      const value = replacements[key];
      const placeholder = new RegExp(`{{${key}}}`, "g");
      compiledBody = compiledBody.replace(placeholder, value);
      compiledSubject = compiledSubject.replace(placeholder, value);
    });

    return {
      subject: compiledSubject,
      html: compiledBody
    };
  }

  public deliverEmail(
    recipientEmail: string,
    recipientRole: UserRole,
    subject: string,
    body: string,
    notificationId?: string
  ): DeliveryLog {
    // Check if spam simulation applies (rate limits for unrecognized domains or generic address names)
    const isSpamTriggered = recipientEmail.includes("spam") || recipientEmail.includes("invalid-user");
    const id = `dl_${Math.random().toString(36).substring(2, 9)}`;

    const newLog: DeliveryLog = {
      id,
      notificationId,
      recipientEmail,
      recipientRole,
      channel: "email",
      status: isSpamTriggered ? "failed" : "delivered",
      timestamp: new Date().toISOString(),
      errorMessage: isSpamTriggered ? "SMTP rate limits or spam block triggered on remote host" : undefined
    };

    this.deliveryLogs.unshift(newLog);

    // Simulate auto-opening email after a short delay if it did not fail
    if (!isSpamTriggered) {
      setTimeout(() => {
        newLog.status = "opened";
      }, 5000);
    }

    return newLog;
  }

  public getDeliveryLogs(): DeliveryLog[] {
    return this.deliveryLogs;
  }

  public getAnalytics(): NotificationAnalytics {
    const emailLogs = this.deliveryLogs.filter(l => l.channel === "email");
    const total = emailLogs.length;
    if (total === 0) {
      return { emailDeliveryRate: 100, openRate: 0, readRate: 0, failedDeliveriesCount: 0, totalSentCount: 0 };
    }

    const failed = emailLogs.filter(l => l.status === "failed").length;
    const opened = emailLogs.filter(l => l.status === "opened" || l.status === "read").length;
    const read = emailLogs.filter(l => l.status === "read").length;

    return {
      emailDeliveryRate: Math.round(((total - failed) / total) * 100),
      openRate: Math.round((opened / (total - failed || 1)) * 100),
      readRate: Math.round((read / (total - failed || 1)) * 100),
      failedDeliveriesCount: failed,
      totalSentCount: total
    };
  }
}

export const emailService = new EmailService();

// --- ANNOUNCEMENT SERVICE ---
export class AnnouncementService {
  private announcements: AnnouncementItem[] = INITIAL_ANNOUNCEMENTS;

  public getAnnouncements(userRole?: UserRole, search = ""): AnnouncementItem[] {
    let list = this.announcements;

    if (userRole) {
      list = list.filter(ann => !ann.targets || ann.targets.includes(userRole));
    }

    if (search.trim() !== "") {
      const s = search.toLowerCase();
      list = list.filter(
        ann =>
          ann.title.toLowerCase().includes(s) ||
          ann.content.toLowerCase().includes(s) ||
          ann.type.toLowerCase().includes(s)
      );
    }

    return list.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }

  public createAnnouncement(ann: Omit<AnnouncementItem, "id" | "publishedAt" | "likes" | "viewCount">): AnnouncementItem {
    const newAnn: AnnouncementItem = {
      ...ann,
      id: `ann_${Math.random().toString(36).substring(2, 9)}`,
      publishedAt: new Date().toISOString(),
      likes: 0,
      viewCount: 0
    };

    this.announcements.unshift(newAnn);

    // Broadcast to targets via WebSockets
    if (ann.targets) {
      ann.targets.forEach(targetRole => {
        wsGateway.broadcastToRole(targetRole, "announcement:new", newAnn);
      });
    }

    return newAnn;
  }

  public incrementViews(id: string) {
    const ann = this.announcements.find(a => a.id === id);
    if (ann) {
      ann.viewCount = (ann.viewCount || 0) + 1;
    }
  }

  public toggleLike(id: string) {
    const ann = this.announcements.find(a => a.id === id);
    if (ann) {
      ann.likes = (ann.likes || 0) + 1;
    }
  }
}

export const announcementService = new AnnouncementService();

// --- MESSAGING SERVICE ---
export class MessagingService {
  private conversations: ChatConversation[] = INITIAL_CONVERSATIONS;
  private messages: ChatMessage[] = INITIAL_MESSAGES;

  public getConversations(userId: string): ChatConversation[] {
    return this.conversations
      .filter(conv => conv.participants.some(p => p.id === userId))
      .map(conv => {
        // Hydrate with latest message
        const convMsgs = this.messages
          .filter(m => m.conversationId === conv.id)
          .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

        const lastMessage = convMsgs[convMsgs.length - 1];

        // Hydrate unread count
        const unreadCount = convMsgs.filter(m => m.senderId !== userId && !m.isSeen).length;

        // Hydrate pinned message ID
        const pinnedMsg = convMsgs.find(m => m.isPinned);

        return {
          ...conv,
          lastMessage,
          unreadCount,
          pinnedMessageId: pinnedMsg?.id
        };
      });
  }

  public getMessages(conversationId: string): ChatMessage[] {
    return this.messages
      .filter(m => m.conversationId === conversationId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  public markAsSeen(conversationId: string, readerId: string) {
    this.messages = this.messages.map(m => {
      if (m.conversationId === conversationId && m.senderId !== readerId && !m.isSeen) {
        return { ...m, isSeen: true };
      }
      return m;
    });

    // Notify sender over websockets
    const conv = this.conversations.find(c => c.id === conversationId);
    if (conv) {
      conv.participants.forEach(p => {
        if (p.id !== readerId) {
          wsGateway.broadcastToUser(p.id, "messages:seen", { conversationId });
        }
      });
    }
  }

  public sendMessage(
    conversationId: string,
    senderId: string,
    body: string,
    attachments?: MessageAttachment[]
  ): ChatMessage {
    const newMsg: ChatMessage = {
      id: `msg_${Math.random().toString(36).substring(2, 9)}`,
      conversationId,
      senderId,
      body,
      timestamp: new Date().toISOString(),
      isSeen: false,
      attachments,
      encrypted: true // Professional military-grade database encryption label enabled
    };

    this.messages.push(newMsg);

    // Broadcast to other participants in the conversation via WebSockets
    const conv = this.conversations.find(c => c.id === conversationId);
    if (conv) {
      conv.participants.forEach(p => {
        if (p.id !== senderId) {
          wsGateway.broadcastToUser(p.id, "message:new", newMsg);
        }
      });
    }

    return newMsg;
  }

  public togglePinMessage(messageId: string): boolean {
    const msg = this.messages.find(m => m.id === messageId);
    if (msg) {
      msg.isPinned = !msg.isPinned;
      return !!msg.isPinned;
    }
    return false;
  }

  public createConversation(name: string, isGroup: boolean, participantIds: string[], createdById: string): ChatConversation {
    const participants = MOCK_PARTICIPANTS.filter(p => participantIds.includes(p.id) || p.id === createdById);
    const newConv: ChatConversation = {
      id: `conv_${Math.random().toString(36).substring(2, 9)}`,
      name,
      isGroup,
      participants,
      unreadCount: 0,
      createdById,
      createdAt: new Date().toISOString()
    };

    this.conversations.unshift(newConv);

    // Broadcast conversation list update to all participants
    participants.forEach(p => {
      wsGateway.broadcastToUser(p.id, "conversation:new", newConv);
    });

    return newConv;
  }
}

export const messagingService = new MessagingService();

// --- NOTIFICATION CONTROLLER & SERVICE ---
export class NotificationService {
  private notifications: NotificationItem[] = INITIAL_NOTIFICATIONS;
  private preferences: NotificationPreferences[] = DEFAULT_PREFERENCES;

  public getUserNotifications(userId: string): NotificationItem[] {
    return this.notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public getUnreadCount(userId: string): number {
    return this.notifications.filter(n => n.userId === userId && !n.isRead).length;
  }

  public createNotification(notif: Omit<NotificationItem, "id" | "timestamp" | "isRead">): NotificationItem {
    const newNotif: NotificationItem = {
      ...notif,
      id: `notif_${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date().toISOString(),
      isRead: false
    };

    this.notifications.unshift(newNotif);

    // Retrieve recipient details for emails and preferences evaluation
    const participant = MOCK_PARTICIPANTS.find(p => p.id === notif.userId);
    const userPref = this.preferences.find(p => p.userId === notif.userId) || {
      userId: notif.userId,
      role: participant?.role || "Student",
      email: true,
      sms: false,
      push: true,
      inApp: true,
      weeklyDigest: false,
      marketing: false,
      placementAlerts: true
    };

    // 1. WebSocket / In-App delivery
    if (userPref.inApp) {
      wsGateway.broadcastToUser(notif.userId, "notification:new", newNotif);
    }

    // 2. Browser Push delivery (Simulated)
    if (userPref.push) {
      wsGateway.broadcastToUser(notif.userId, "push:new", {
        title: newNotif.title,
        body: newNotif.body
      });
    }

    // 3. Email delivery matching category template
    if (userPref.email && participant) {
      let matchingTemplateId = "temp_1"; // Default Invitation template
      const replacements: Record<string, string> = {
        role: newNotif.metadata?.jobRole || "Core Platform Engineer",
        company: newNotif.metadata?.companyName || "Google",
        roundName: newNotif.title,
        scheduledTime: new Date(Date.now() + 24 * 3600 * 1000).toLocaleString(),
        interviewer: newNotif.metadata?.interviewer || "Senior Staff Advisor",
        meetingLink: newNotif.metadata?.meetingLink || "https://meet.google.com/swe-deep-dive"
      };

      if (newNotif.type === "Interview Scheduled") {
        matchingTemplateId = "temp_1";
      } else if (newNotif.type === "Interview Reminder") {
        matchingTemplateId = "temp_2";
      } else if (newNotif.type === "Offer Letter Received") {
        matchingTemplateId = "temp_3";
      } else if (newNotif.type === "Shortlisted") {
        matchingTemplateId = "temp_4";
      } else if (newNotif.type === "Resume Analyzed") {
        matchingTemplateId = "temp_6";
        replacements.score = String(newNotif.metadata?.score || 88);
      } else if (newNotif.type === "Certificate Generated") {
        matchingTemplateId = "temp_7";
      }

      try {
        const compiled = emailService.compileTemplate(matchingTemplateId, replacements);
        emailService.deliverEmail(participant.email, participant.role, compiled.subject, compiled.html, newNotif.id);
      } catch (err) {
        console.warn("[EMAIL_SERVICE] Failed compiling template:", err);
      }
    }

    return newNotif;
  }

  public markAsRead(id: string) {
    this.notifications = this.notifications.map(n => (n.id === id ? { ...n, isRead: true } : n));
  }

  public markAllAsRead(userId: string) {
    this.notifications = this.notifications.map(n => (n.userId === userId ? { ...n, isRead: true } : n));
  }

  public deleteNotification(id: string) {
    this.notifications = this.notifications.filter(n => n.id !== id);
  }

  public getPreferences(userId: string, role: UserRole): NotificationPreferences {
    let pref = this.preferences.find(p => p.userId === userId);
    if (!pref) {
      pref = {
        userId,
        role,
        email: true,
        sms: false,
        push: true,
        inApp: true,
        weeklyDigest: true,
        marketing: false,
        placementAlerts: true
      };
      this.preferences.push(pref);
    }
    return pref;
  }

  public updatePreferences(pref: NotificationPreferences) {
    const idx = this.preferences.findIndex(p => p.userId === pref.userId);
    if (idx !== -1) {
      this.preferences[idx] = pref;
    } else {
      this.preferences.push(pref);
    }
  }
}

export const notificationService = new NotificationService();

// --- REMINDER SCHEDULER SYSTEM ---
export class ReminderScheduler {
  private timerId: any = null;

  public startScheduler(userId: string, onTrigger: (notif: NotificationItem) => void) {
    if (this.timerId) return;

    // Periodically checks due times and triggers beautiful, scheduled reminder payloads
    this.timerId = setInterval(() => {
      const odds = Math.random();
      if (odds > 0.85) {
        // Trigger a simulated Interview Reminder
        const sampleNotif = notificationService.createNotification({
          userId,
          type: "Interview Reminder",
          title: "Interview Starts in 15 mins",
          body: "Your Stripe technical system interview round begins shortly. Log into the simulator platform immediately.",
          priority: "Critical",
          metadata: { meetingLink: "https://meet.stripe.com/interview-prep" }
        });
        onTrigger(sampleNotif);
      } else if (odds > 0.7) {
        // Trigger a dynamic job recommendation or ATS alert
        const sampleNotif = notificationService.createNotification({
          userId,
          type: "Job Recommendation",
          title: "Stripe On-Campus Application Open",
          body: "Your profile matches the newly published Stripe Frontend Specialist position with 92% compatibility. Click here to apply now.",
          priority: "Medium",
          metadata: { jobRole: "Frontend Specialist", companyName: "Stripe" }
        });
        onTrigger(sampleNotif);
      }
    }, 45000); // Trigger check every 45s
  }

  public stopScheduler() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }
}

export const reminderScheduler = new ReminderScheduler();

// --- NEW CALENDAR & SCHEDULING SERVICE ---
export class CalendarService {
  private events: CalendarEvent[] = [];
  private bookingSlots: BookingSlot[] = [];

  constructor() {
    const student = MOCK_PARTICIPANTS.find(p => p.id === "part_student_1")!;
    const faculty = MOCK_PARTICIPANTS.find(p => p.id === "part_faculty_1")!;
    const recruiter = MOCK_PARTICIPANTS.find(p => p.id === "part_recruiter_1")!;
    const officer = MOCK_PARTICIPANTS.find(p => p.id === "part_officer_1")!;

    // Preloaded events
    this.events = [
      {
        id: "evt_1",
        title: "Google L4 Technical Round",
        description: "Deep dive system design, data architecture, and scale engineering with Senior Staff panels.",
        type: "Interview",
        startTime: new Date(Date.now() + 24 * 3600 * 1000).toISOString(), // Tomorrow
        endTime: new Date(Date.now() + 25 * 3600 * 1000).toISOString(),
        participants: [student, recruiter],
        timezone: "Asia/Kolkata",
        meetingLink: "https://meet.google.com/swe-deep-dive"
      },
      {
        id: "evt_2",
        title: "Stripe Technical Screening Interview",
        description: "Inaugural preparation review and preliminary interview screening.",
        type: "Interview",
        startTime: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(),
        endTime: new Date(Date.now() + 2.5 * 24 * 3600 * 1000).toISOString(),
        participants: [student, officer],
        timezone: "Asia/Kolkata"
      },
      {
        id: "evt_3",
        title: "Mock Interview Review",
        description: "Resume drill and behavioral feedback with Advisor Jenkins.",
        type: "Mock Interview",
        startTime: new Date(Date.now() - 3 * 3600 * 1000).toISOString(), // Past
        endTime: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        participants: [student, faculty],
        timezone: "Asia/Kolkata",
        meetingLink: "https://meet.google.com/faculty-advising"
      },
      {
        id: "evt_4",
        title: "System Design Bootcamp",
        description: "Training session covering caching, database partitioning, load balancing, and rate limiters.",
        type: "Training Session",
        startTime: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(),
        endTime: new Date(Date.now() + 3 * 24 * 3600 * 1000 + 2 * 3600 * 1000).toISOString(),
        participants: [student, faculty],
        timezone: "Asia/Kolkata"
      },
      {
        id: "evt_5",
        title: "National Holiday - Independence Day",
        description: "Campus remains closed. All assessments rescheduled.",
        type: "Holiday",
        startTime: "2026-08-15T00:00:00Z",
        endTime: "2026-08-15T23:59:59Z",
        participants: [],
        timezone: "Asia/Kolkata"
      }
    ];

    // Preloaded slots available for booking mock interviews / mentoring
    this.bookingSlots = [
      {
        id: "slot_1",
        hostId: faculty.id,
        hostName: faculty.name,
        hostRole: faculty.role,
        startTime: new Date(Date.now() + 5 * 3600 * 1000).toISOString(), // in 5 hours
        endTime: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
        isBooked: false,
        type: "Mock Interview"
      },
      {
        id: "slot_2",
        hostId: faculty.id,
        hostName: faculty.name,
        hostRole: faculty.role,
        startTime: new Date(Date.now() + 28 * 3600 * 1000).toISOString(), // tomorrow
        endTime: new Date(Date.now() + 29 * 3600 * 1000).toISOString(),
        isBooked: false,
        type: "Mock Interview"
      },
      {
        id: "slot_3",
        hostId: recruiter.id,
        hostName: recruiter.name,
        hostRole: recruiter.role,
        startTime: new Date(Date.now() + 48 * 3600 * 1000).toISOString(), // in 2 days
        endTime: new Date(Date.now() + 49 * 3600 * 1000).toISOString(),
        isBooked: true,
        bookedBy: student.id,
        bookedByName: student.name,
        type: "Interview"
      }
    ];
  }

  public getEvents(): CalendarEvent[] {
    return this.events;
  }

  public addEvent(event: Omit<CalendarEvent, "id">): CalendarEvent {
    const newEvent: CalendarEvent = {
      ...event,
      id: `evt_${Math.random().toString(36).substring(2, 9)}`
    };
    this.events.push(newEvent);

    // Add activity log
    reportsService.addActivityLog(
      `Created calendar event: ${newEvent.title}`,
      event.participants[0]?.name || "System",
      event.participants[0]?.role || "Student"
    );

    return newEvent;
  }

  public getBookingSlots(): BookingSlot[] {
    return this.bookingSlots;
  }

  public bookSlot(slotId: string, studentId: string, studentName: string): { success: boolean; error?: string } {
    const slot = this.bookingSlots.find(s => s.id === slotId);
    if (!slot) {
      return { success: false, error: "Booking slot not found." };
    }
    if (slot.isBooked) {
      return { success: false, error: "Slot is already booked." };
    }

    // Check for conflict in student's calendar
    const conflict = this.events.some(evt => {
      const startOverlaps = new Date(slot.startTime) >= new Date(evt.startTime) && new Date(slot.startTime) < new Date(evt.endTime);
      const endOverlaps = new Date(slot.endTime) > new Date(evt.startTime) && new Date(slot.endTime) <= new Date(evt.endTime);
      return startOverlaps || endOverlaps;
    });

    if (conflict) {
      return { success: false, error: "Automatic Conflict Detected! You have another event scheduled during this timezone." };
    }

    slot.isBooked = true;
    slot.bookedBy = studentId;
    slot.bookedByName = studentName;

    // Add booked slot as a real calendar event
    const student = MOCK_PARTICIPANTS.find(p => p.id === studentId)!;
    const host = MOCK_PARTICIPANTS.find(p => p.id === slot.hostId)!;

    this.addEvent({
      title: `${slot.type} with ${slot.hostName}`,
      description: `Scheduled mentoring/interview session. Timezone support active.`,
      type: slot.type,
      startTime: slot.startTime,
      endTime: slot.endTime,
      participants: [student, host],
      timezone: "Asia/Kolkata",
      meetingLink: "https://meet.google.com/mentor-booked-room"
    });

    return { success: true };
  }

  public createBookingSlot(slot: Omit<BookingSlot, "id" | "isBooked">): BookingSlot {
    const newSlot: BookingSlot = {
      ...slot,
      id: `slot_${Math.random().toString(36).substring(2, 9)}`,
      isBooked: false
    };
    this.bookingSlots.push(newSlot);

    reportsService.addActivityLog(
      `Offered slot for ${newSlot.type} on ${new Date(newSlot.startTime).toLocaleDateString()}`,
      slot.hostName,
      slot.hostRole
    );

    return newSlot;
  }
}

export const calendarService = new CalendarService();

// --- NEW TASK MANAGEMENT SERVICE ---
export class TaskManagerService {
  private tasks: TaskItem[] = [];

  constructor() {
    this.tasks = [
      {
        id: "task_1",
        title: "Complete ATS Resume Review",
        description: "Submit resume to AI Resume Audit engine and achieve score >85.",
        status: "Pending",
        priority: "High",
        dueDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
        category: "Resume Checklist",
        userId: "part_student_1"
      },
      {
        id: "task_2",
        title: "Prepare STAR Behavioral Responses",
        description: "Practice answering conflict management questions with the AI speech coach.",
        status: "Pending",
        priority: "High",
        dueDate: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
        category: "Interview Checklist",
        userId: "part_student_1"
      },
      {
        id: "task_3",
        title: "AWS assessment coding challenge",
        description: "Finish serverless lambda optimization assignment.",
        status: "Pending",
        priority: "Critical",
        dueDate: new Date(Date.now() + 12 * 3600 * 1000).toISOString(),
        category: "Today",
        userId: "part_student_1"
      },
      {
        id: "task_4",
        title: "Set up in-app notification rules",
        description: "Set preferences in Workspace dashboard.",
        status: "Completed",
        priority: "Low",
        dueDate: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        category: "Completed",
        userId: "part_student_1"
      },
      {
        id: "task_5",
        title: "Attempt Dynamic Verbal Mock Exam",
        description: "Practice vocal modulation to reduce filler words.",
        status: "Pending",
        priority: "Medium",
        dueDate: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(),
        category: "Upcoming",
        userId: "part_student_1"
      }
    ];
  }

  public getTasks(userId: string): TaskItem[] {
    return this.tasks.filter(t => t.userId === userId);
  }

  public addTask(task: Omit<TaskItem, "id">): TaskItem {
    const newTask: TaskItem = {
      ...task,
      id: `task_${Math.random().toString(36).substring(2, 9)}`
    };
    this.tasks.push(newTask);

    reportsService.addActivityLog(
      `Created task: ${newTask.title}`,
      "Aarav Sharma",
      "Student"
    );

    return newTask;
  }

  public toggleTaskStatus(taskId: string): TaskItem | undefined {
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      task.status = task.status === "Pending" ? "Completed" : "Pending";
      task.category = task.status === "Completed" ? "Completed" : "Pending";

      reportsService.addActivityLog(
        `Marked task as ${task.status}: ${task.title}`,
        "Aarav Sharma",
        "Student"
      );
    }
    return task;
  }

  public deleteTask(taskId: string) {
    this.tasks = this.tasks.filter(t => t.id !== taskId);
  }
}

export const taskManagerService = new TaskManagerService();

// --- NEW AI ASSISTANT COHORT & PREP SERVICE ---
export class AiAssistantService {
  private topics: AiPrepTopic[] = [
    { id: "topic_1", category: "Career Guidance", title: "Career Goals & Milestones", sampleQuestion: "What qualifications do I need for Google and Stripe?" },
    { id: "topic_2", category: "Interview Preparation", title: "STAR Method Response Framing", sampleQuestion: "How do I frame answers using the STAR method?" },
    { id: "topic_3", category: "Resume Guidance", title: "ATS Optimization Rules", sampleQuestion: "What keywords should I add to my resume for system design roles?" },
    { id: "topic_4", category: "Coding Help", title: "Caching & Partitioning Strategies", sampleQuestion: "When should I use Redis vs Memcached in architectures?" },
    { id: "topic_5", category: "English Communication", title: "Eliminating filler pauses", sampleQuestion: "How do I avoid filler words like 'um' and 'like'?" },
    { id: "topic_6", category: "Interview Preparation", title: "Stripe Technical Challenges", sampleQuestion: "What coding challenges does Stripe ask?" },
    { id: "topic_7", category: "Interview Preparation", title: "Upcoming Practice Calendar", sampleQuestion: "What mock schedules are set for the next 14 days?" },
    { id: "topic_8", category: "Career Guidance", title: "Backend vs Frontend Engineering Career", sampleQuestion: "Should I focus on Backend or Frontend for higher pay?" }
  ];

  public getTopics(): AiPrepTopic[] {
    return this.topics;
  }

  public askAssistant(category: string, userMessage: string): string {
    const msg = userMessage.toLowerCase();
    
    if (category === "Career Guidance" || msg.includes("eligible") || msg.includes("eligibility")) {
      return "Based on your verified credentials, you have an 8.9 CGPA and 0 active backlogs. This satisfies Google's cutoff (>8.0) and Stripe's threshold (>7.5). You are 100% prepared for upcoming interview profiles!";
    }
    if (category === "Interview Preparation" || msg.includes("star") || msg.includes("behavioral")) {
      if (msg.includes("stripe")) {
        return "Stripe requires a minimum CGPA of 7.5, no active backlogs, and proficiency in backend pipelines (Node.js/Go) or modern frontend frameworks (React/TypeScript). Your current profile satisfies all criteria.";
      }
      if (msg.includes("visiting") || msg.includes("calendar")) {
        return "Upcoming Mock Calendar:\n- **Stripe Preparation Session**: Drive begins in 2 days (Hybrid Specialist, Base: 32 LPA).\n- **Google L4 Prep**: System interview tomorrow at 2:30 PM.\n- **Microsoft Mock**: Technical assessments next Friday.";
      }
      return "To frame an elegant STAR answer:\n1. **Situation**: Set the scene in 2 sentences.\n2. **Task**: Explain your specific responsibility.\n3. **Action**: Spend 60% of your time explaining the exact technical steps *you* took.\n4. **Result**: Share hard metrics (e.g., 'reduced latency by 40%', 'boosted coverage to 95%').\n\nTry speaking for 90-120 seconds to drop your filler pauses.";
    }
    if (category === "Resume Guidance" || msg.includes("resume") || msg.includes("ats")) {
      return "Your ATS score is currently 88/100. To reach 95+, consider adding action-oriented verbs (e.g., 'Architected', 'Pioneered', 'Refactored') and explicit cloud tools (e.g., 'AWS Lambda', 'Redis clustering', 'PostgreSQL indexing') to your professional experience headers.";
    }
    if (category === "Coding Help" || msg.includes("coding") || msg.includes("caching") || msg.includes("redis")) {
      return "Redis supports advanced data structures (Sorted Sets, Hashes, Pub/Sub) and replication, making it perfect for complex leaderboards, chat histories, or session persistence. Memcached is multithreaded and excellent for basic, high-frequency key-value caching. For our upcoming Stripe prep, expect system design questions focusing on Redis rate limiters.";
    }
    if (category === "English Communication" || msg.includes("filler") || msg.includes("pause") || msg.includes("english")) {
      return "Filler words occur when your brain outpaces your speech. To eliminate them:\n1. Speak 10% slower.\n2. Embrace silence — a pause looks highly confident, while 'um' sounds hesitant.\n3. Practice breathing dynamically at punctuation marks. Your mock score shows a 12 filler count drop to 2, which is phenomenal progress!";
    }
    
    return "I am your AI Mentor. I've scanned your workspace performance. Your coding test compliance is 94%, English verbal index is 89%, and resume ATS rating is 88%. Ask me anything about preparing for Stripe or Google interviews!";
  }
}

export const aiAssistantService = new AiAssistantService();

// --- NEW REPORTS & AUDIT SERVICE ---
export class ReportsService {
  private activityLogs: { id: string; action: string; timestamp: string; user: string; role: UserRole }[] = [];

  constructor() {
    this.activityLogs = [
      { id: "log_1", action: "Completed Resume Audit Challenge", timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString(), user: "Aarav Sharma", role: "Student" },
      { id: "log_2", action: "Published Stripe Fast-Track Campus Notice", timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), user: "Rajesh Ramaswamy", role: "Super Admin" },
      { id: "log_3", action: "Booked mock interview with Dr. Jenkins", timestamp: new Date(Date.now() - 1 * 3600 * 1000).toISOString(), user: "Aarav Sharma", role: "Student" }
    ];
  }

  public addActivityLog(action: string, user: string, role: UserRole) {
    this.activityLogs.unshift({
      id: `log_${Math.random().toString(36).substring(2, 9)}`,
      action,
      timestamp: new Date().toISOString(),
      user,
      role
    });
  }

  public getReport(userId: string): CommunicationReport {
    const userNotifs = notificationService.getUserNotifications(userId);
    const userConvs = messagingService.getConversations(userId);
    const userEvents = calendarService.getEvents();
    const userTasks = taskManagerService.getTasks(userId);

    const completed = userTasks.filter(t => t.status === "Completed").length;
    const total = userTasks.length;

    let totalMsgs = 0;
    userConvs.forEach(c => {
      totalMsgs += messagingService.getMessages(c.id).length;
    });

    return {
      activityCount: totalMsgs,
      notificationsSent: userNotifs.length,
      meetingsCount: userEvents.length,
      tasksCompleted: completed,
      totalTasks: total,
      taskCompletionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      recentActivityLogs: this.activityLogs.slice(0, 8)
    };
  }
}

export const reportsService = new ReportsService();


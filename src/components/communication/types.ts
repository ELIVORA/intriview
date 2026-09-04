/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole =
  | "Student"
  | "Admin"
  | "Super Admin";

export interface ChatParticipant {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  isOnline: boolean;
  lastActive?: string;
  isTyping?: boolean;
}

export type NotificationType =
  | "Interview Scheduled"
  | "Interview Reminder"
  | "Resume Analyzed"
  | "ATS Score Updated"
  | "Coding Assignment"
  | "Coding Result"
  | "Mock Interview Assigned"
  | "Campus Drive Published"
  | "Job Recommendation"
  | "Application Status"
  | "Shortlisted"
  | "Rejected"
  | "Offer Letter Received"
  | "Placement Announcement"
  | "Certificate Generated"
  | "Achievement Unlocked"
  | "Subscription Expiry"
  | "Payment Successful"
  | "Security Alert";

export type PriorityLevel = "Low" | "Medium" | "High" | "Critical";

export interface NotificationItem {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  priority: PriorityLevel;
  timestamp: string;
  isRead: boolean;
  metadata?: Record<string, any>;
}

export type AttachmentType = "pdf" | "docx" | "image" | "resume" | "portfolio" | "certificate";

export interface MessageAttachment {
  id: string;
  name: string;
  type: AttachmentType;
  url: string;
  size?: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  timestamp: string;
  isSeen: boolean;
  attachments?: MessageAttachment[];
  isPinned?: boolean;
  encrypted?: boolean;
}

export interface ChatConversation {
  id: string;
  name: string;
  isGroup: boolean;
  participants: ChatParticipant[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  pinnedMessageId?: string;
  createdById?: string;
  createdAt: string;
}

export type AnnouncementType =
  | "Platform Announcement"
  | "Interview Schedule"
  | "Technical Workshop"
  | "Training Session"
  | "Practice Deadline"
  | "Maintenance Notice"
  | "Emergency Alert";

export interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  type: AnnouncementType;
  publishedBy: string; // User Name
  publishedByRole: UserRole;
  publishedAt: string;
  priority: PriorityLevel;
  targets?: UserRole[];
  likes?: number;
  viewCount?: number;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  bodyHtml: string;
  category: "interview" | "auth" | "resume" | "career" | "general";
}

export interface NotificationPreferences {
  userId: string;
  role: UserRole;
  email: boolean;
  sms: boolean; // Future-ready
  push: boolean;
  inApp: boolean;
  weeklyDigest: boolean;
  marketing: boolean;
  placementAlerts: boolean;
}

export interface DeliveryLog {
  id: string;
  notificationId?: string;
  messageId?: string;
  recipientEmail: string;
  recipientRole: UserRole;
  channel: "email" | "sms" | "push" | "in-app";
  status: "delivered" | "read" | "opened" | "failed";
  timestamp: string;
  errorMessage?: string;
}

export interface NotificationAnalytics {
  emailDeliveryRate: number;
  openRate: number;
  readRate: number;
  failedDeliveriesCount: number;
  totalSentCount: number;
}

// --- NEW CALENDAR & SCHEDULING TYPES ---
export type CalendarEventType =
  | "Interview"
  | "Mock Interview"
  | "Coding Assessment"
  | "English Assessment"
  | "Training Session"
  | "Holiday";

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  type: CalendarEventType;
  startTime: string;
  endTime: string;
  participants: ChatParticipant[];
  timezone: string;
  isRecurring?: boolean;
  recurrencePattern?: string;
  location?: string;
  meetingLink?: string;
}

export interface BookingSlot {
  id: string;
  hostId: string;
  hostName: string;
  hostRole: UserRole;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  bookedBy?: string; // Student ID
  bookedByName?: string;
  type: CalendarEventType;
}

// --- NEW TASK MANAGEMENT TYPES ---
export type TaskCategory = "Today" | "Pending" | "Completed" | "Upcoming" | "Priority" | "Interview Checklist" | "Resume Checklist";

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  status: "Pending" | "Completed";
  priority: PriorityLevel;
  dueDate: string;
  category: TaskCategory;
  userId: string;
}

// --- NEW AI ASSISTANT TYPES ---
export interface AiMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

export interface AiPrepTopic {
  id: string;
  category: "Interview Preparation" | "Resume Guidance" | "Coding Help" | "English Communication" | "Career Guidance";
  title: string;
  sampleQuestion: string;
}

// --- NEW REPORTS TYPES ---
export interface CommunicationReport {
  activityCount: number;
  notificationsSent: number;
  meetingsCount: number;
  tasksCompleted: number;
  totalTasks: number;
  taskCompletionRate: number;
  recentActivityLogs: { id: string; action: string; timestamp: string; user: string; role: UserRole }[];
}


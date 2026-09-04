/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// ==========================================
// User & Auth Types
// ==========================================

export enum UserRole {
  STUDENT = "student",
  ADMIN = "admin",
}

export interface IUser {
  uid: string;
  email: string;
  displayName?: string | null;
  photoURL?: string | null;
  role: UserRole;
  createdAt: string;
  completedProfile: boolean;
}

// ==========================================
// Candidate Profile: Single Source of Truth
// ==========================================

export interface ICandidateProject {
  id: string;
  title: string;
  techStack: string[];
  description: string;
  accomplishments: string[];
}

export interface ICandidateEducation {
  institution: string;
  degree: string;
  stream: string;
  gpa: number;
  graduationYear: number;
}

export interface ICandidateProfile {
  id: string;
  userId: string;
  fullName: string;
  resumeUrl: string;
  atsScore: number;
  experienceLevel: "entry" | "mid" | "senior";
  targetRoles: string[];
  primarySkills: string[];
  secondarySkills: string[];
  gapsDetected: string[];
  projects: ICandidateProject[];
  education: ICandidateEducation[];
  updatedAt: string;
}

// ==========================================
// Interview Modules
// ==========================================

export enum InterviewType {
  RESUME = "resume",
  HR = "hr",
  TECHNICAL = "technical",
}

export enum InterviewStatus {
  PENDING = "pending",
  ACTIVE = "active",
  COMPLETED = "completed",
  EVALUATED = "evaluated",
}

export interface IInterviewMessage {
  id: string;
  sender: "mentor" | "candidate";
  text: string;
  timestamp: string;
  audioUrl?: string;
  voiceMetrics?: {
    pitch: number;
    speed: number;
    clarity: number;
  };
}

export interface IFeedbackMetric {
  score: number; // 0 - 100
  strengths: string[];
  weaknesses: string[];
  actionableSteps: string[];
}

export interface IInterviewSession {
  id: string;
  userId: string;
  type: InterviewType;
  status: InterviewStatus;
  messages: IInterviewMessage[];
  score: number | null;
  feedback: {
    communication: IFeedbackMetric;
    technicalDepth: IFeedbackMetric;
    bodyLanguage?: IFeedbackMetric;
  } | null;
  createdAt: string;
}

// ==========================================
// Coding & Aptitude Types
// ==========================================

export interface ICodingChallenge {
  id: string;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  description: string; // Markdown
  constraints: string[];
  starterCode: string;
  testCases: {
    input: string;
    expectedOutput: string;
    isSecret: boolean;
  }[];
}

export interface IAptitudeQuestion {
  id: string;
  topic: "quantitative" | "logical" | "verbal";
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

// ==========================================
// Notification & UI Stores
// ==========================================

export interface INotification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  type: "info" | "success" | "warning";
  timestamp: string;
}

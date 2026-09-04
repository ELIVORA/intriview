/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const APP_METADATA = {
  name: "Interview Cracker",
  subtitle: "AI Powered Virtual Interview Preparation Mentor",
  version: "1.0.0",
  releaseDate: "2026-07-10",
  company: "Interview Cracker Inc.",
};

export const ROUTES = {
  LANDING: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  ONBOARDING: "/onboarding",
  DASHBOARD: "/dashboard",
  RESUME_ANALYZER: "/resume-analyzer",
  MOCK_INTERVIEW: "/mock-interviews",
  CODING_PRACTICE: "/coding",
  APTITUDE_TRAINING: "/aptitude",
  LEARNING_COACH: "/learning-coach",
  REPORTS: "/reports",
  NOTIFICATIONS: "/notifications",
  PROFILE: "/profile",
  ADMIN: {
    DASHBOARD: "/admin",
    USERS: "/admin/users",
    QUESTIONS: "/admin/questions",
    PROMPTS: "/admin/prompts",
    SETTINGS: "/admin/settings",
  },
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    ME: "/auth/me",
  },
  CANDIDATE: {
    PROFILE: "/candidate/profile",
    UPLOAD_RESUME: "/candidate/resume/upload",
    ANALYZE: "/candidate/resume/analyze",
  },
  INTERVIEW: {
    CREATE: "/interview/create",
    SEND_MESSAGE: "/interview/message",
    FINISH: "/interview/finish",
    REPORTS: "/interview/reports",
  },
  CODING: {
    CHALLENGES: "/coding/challenges",
    SUBMIT: "/coding/submit",
    RUN: "/coding/run",
  },
  APTITUDE: {
    QUESTIONS: "/aptitude/questions",
    SUBMIT_EXAM: "/aptitude/submit",
  },
  ADMIN: {
    USERS_LIST: "/admin/users",
    TELEMETRY: "/admin/telemetry",
    PROMPT_WEIGHTS: "/admin/settings/prompts",
  },
};

export const DESIGN_SYSTEM = {
  colors: {
    dark: {
      background: "#09090b", // zinc-950
      surface: "#18181b", // zinc-900
      card: "rgba(24, 24, 27, 0.75)", // translucent surface
      border: "rgba(63, 63, 70, 0.4)", // zinc-700 translucent
      textPrimary: "#f4f4f5", // zinc-100
      textSecondary: "#a1a1aa", // zinc-400
      muted: "#71717a", // zinc-500
    },
    light: {
      background: "#fafafa", // zinc-50
      surface: "#ffffff", // white
      card: "rgba(255, 255, 255, 0.75)", // translucent white
      border: "rgba(228, 228, 231, 0.6)", // zinc-200 translucent
      textPrimary: "#09090b", // zinc-950
      textSecondary: "#52525b", // zinc-600
      muted: "#a1a1aa", // zinc-400
    },
    brand: {
      primary: "#18181b", // neutral/black style
      accent: "#6366f1", // indigo-500
      success: "#10b981", // emerald-500
      warning: "#f59e0b", // amber-500
      danger: "#ef4444", // red-500
      info: "#3b82f6", // blue-500
    },
  },
  radius: {
    button: "8px",
    card: "16px",
    input: "8px",
    dialog: "20px",
  },
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "24px",
    xxl: "32px",
    layout: "40px",
  },
};

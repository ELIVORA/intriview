import { api } from "./api";

export interface CandidateMemorySnapshot {
  user_id: string;
  resume_profile: any;
  resume_versions: any[];
  skills: Record<string, any>;
  strengths: Array<any>;
  weaknesses: Array<any>;
  topics: Record<string, any>;
  communication: {
    grammar: number;
    fluency: number;
    vocabulary: number;
    pronunciation: number;
    confidence: number;
    clarity: number;
    filler_words_per_minute: number;
    speaking_speed_wpm: number;
    professionalism: number;
    sessions: number;
    trend: string;
    recurring_grammar_errors: string[];
    recurring_communication_weaknesses: string[];
    conversation_history?: Array<{ role: "ai" | "candidate"; text: string; timestamp: string; coaching?: any }>;
    last_conversation_at?: string | null;
  };
  technical: Record<string, any>;
  interview_history: Array<any>;
  improvement_plan: Array<any>;
  readiness: { overall: number; technical: number; communication: number; behavioral: number; resume_alignment: number; trend: string };
  updated_at: string;
}

export async function getCandidateMemory(): Promise<CandidateMemorySnapshot> {
  const response = await api.get("/v1/candidate/memory");
  return response.data.memory;
}

export async function getCandidateMemoryContext() {
  const response = await api.get("/v1/candidate/memory/context");
  return response.data.context;
}

export async function getCandidateInterviewHistory(limit = 30) {
  const response = await api.get("/v1/candidate/memory/history", { params: { limit } });
  return response.data.history;
}

export async function syncCandidateProfile(profile: any) {
  const response = await api.post("/v1/candidate/memory/profile", { profile });
  return response.data.memory;
}

export async function recordCommunicationReport(report: any) {
  const response = await api.post("/v1/candidate/memory/communication", { report });
  return response.data;
}

export async function getAdaptivePlan() {
  const response = await api.get("/v1/candidate/memory/plan");
  return response.data;
}

export async function recordCodingResult(result: any) {
  const response = await api.post("/v1/candidate/memory/coding", { result });
  return response.data;
}

export async function resetCandidateMemory() {
  const response = await api.delete("/v1/candidate/memory/reset");
  return response.data;
}

import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { DatabaseSync } from "node:sqlite";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";

let _ai: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!_ai) {
    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY is not set. API calls will fail.");
    }
    _ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "MISSING_KEY" });
  }
  return _ai;
}

// Fallback models to cycle through if primary model hits rate limit (429) or high demand (503)
const GEMINI_MODELS = ["gemini-3.5-flash", "gemini-3.5-flash-lite", "gemini-3.1-flash-lite"];

// Helper to sanitize Gemini message parts and avoid 400 Invalid Argument (empty data/text field)
function sanitizeContents(contents: any): any[] {
  if (typeof contents === "string") {
    return [{ role: "user", parts: [{ text: contents.trim() || "Hello" }] }];
  }
  if (!Array.isArray(contents)) {
    return [{ role: "user", parts: [{ text: "Hello" }] }];
  }

  return contents
    .filter(item => item && typeof item === "object")
    .map(item => {
      const role = item.role === "user" ? "user" : "model";
      let parts: any[] = [];
      if (Array.isArray(item.parts)) {
        parts = item.parts
          .filter((p: any) => p && typeof p === "object")
          .map((p: any) => {
            if (typeof p.text === "string") {
              return { text: p.text.trim() || " " };
            }
            if (p.text !== undefined && p.text !== null) {
              return { text: String(p.text).trim() || " " };
            }
            return { text: " " };
          });
      } else if (typeof item.content === "string") {
        parts = [{ text: item.content.trim() || " " }];
      } else if (typeof item.text === "string") {
        parts = [{ text: item.text.trim() || " " }];
      }

      if (parts.length === 0) {
        parts = [{ text: " " }];
      }

      return { role, parts };
    });
}

async function safeGenerateContent(options: {
  contents: any;
  config?: any;
  fallbackText?: string;
  fallbackJson?: any;
  thinkingMode?: boolean;
}): Promise<string> {
  const sanitized = sanitizeContents(options.contents);
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("AI service is not configured. Set GEMINI_API_KEY in the environment.");
  }

  const modelsToTry = options.thinkingMode ? ["gemini-3.1-pro-preview"] : GEMINI_MODELS;
  const generateConfig = options.thinkingMode
    ? { ...options.config, thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH } }
    : { ...options.config };

  if (options.thinkingMode && generateConfig?.maxOutputTokens) {
    delete generateConfig.maxOutputTokens;
  }

  let lastError: unknown = null;
  for (const model of modelsToTry) {
    try {
      const response = await getAI().models.generateContent({
        model,
        contents: sanitized,
        config: generateConfig
      });
      if (response?.text) return response.text;
      lastError = new Error(`Gemini returned no text from ${model}`);
    } catch (e) {
      lastError = e;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("AI service unavailable");
}

async function generateRequiredAI(options: { contents: any; config?: any; thinkingMode?: boolean }): Promise<string> {
  const sanitized = sanitizeContents(options.contents);
  const modelsToTry = options.thinkingMode ? ["gemini-3.1-pro-preview"] : GEMINI_MODELS;
  const generateConfig = options.thinkingMode
    ? { ...options.config, thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH } }
    : options.config;
  if (options.thinkingMode && generateConfig?.maxOutputTokens) delete generateConfig.maxOutputTokens;
  let lastError: unknown = null;
  for (const model of modelsToTry) {
    try {
      const response = await getAI().models.generateContent({ model, contents: sanitized, config: generateConfig });
      if (response?.text) return response.text;
      lastError = new Error(`Gemini returned no text from ${model}`);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("AI service unavailable");
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 3000);

  app.use(express.json({ limit: "2mb" }));

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // ---------------------------------------------------------------------------
  // Secure application authentication
  // ---------------------------------------------------------------------------
  // Credentials are stored server-side as salted scrypt hashes. The browser
  // never receives an administrator password or a reusable password hash.
  const dataDir = path.join(process.cwd(), "data");
  fs.mkdirSync(dataDir, { recursive: true });
  const sqlitePath = path.join(dataDir, "interview_cracker.sqlite");
  const db = new DatabaseSync(sqlitePath);
  db.exec(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS users (
      uid TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, display_name TEXT NOT NULL, role TEXT NOT NULL,
      created_at TEXT NOT NULL, completed_profile INTEGER NOT NULL DEFAULT 0, salt TEXT NOT NULL, password_hash TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS candidate_memory (user_id TEXT PRIMARY KEY, memory_json TEXT NOT NULL, updated_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS interview_sessions (session_id TEXT PRIMARY KEY, user_id TEXT NOT NULL, payload_json TEXT NOT NULL, updated_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS portfolios (user_id TEXT PRIMARY KEY, payload_json TEXT NOT NULL, updated_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS portfolio_deployments (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT NOT NULL, payload_json TEXT NOT NULL, created_at TEXT NOT NULL);
  `);
  process.on("exit", () => { try { db.close(); } catch {} });

  type StoredUser = {
    uid: string;
    email: string;
    displayName: string;
    role: "student" | "admin";
    createdAt: string;
    completedProfile: boolean;
    salt: string;
    passwordHash: string;
  };

  const readUsers = (): StoredUser[] => {
    const rows = db.prepare(`SELECT uid, email, display_name, role, created_at, completed_profile, salt, password_hash FROM users ORDER BY created_at ASC`).all() as any[];
    return rows.map((row) => ({
      uid: String(row.uid), email: String(row.email), displayName: String(row.display_name), role: row.role === "admin" ? "admin" : "student",
      createdAt: String(row.created_at), completedProfile: Boolean(row.completed_profile), salt: String(row.salt), passwordHash: String(row.password_hash)
    }));
  };

  const writeUsers = (users: StoredUser[]) => {
    const tx = db.prepare(`INSERT INTO users (uid,email,display_name,role,created_at,completed_profile,salt,password_hash) VALUES (?,?,?,?,?,?,?,?) ON CONFLICT(uid) DO UPDATE SET email=excluded.email, display_name=excluded.display_name, role=excluded.role, completed_profile=excluded.completed_profile, salt=excluded.salt, password_hash=excluded.password_hash`);
    db.exec("BEGIN");
    try {
      for (const user of users) tx.run(user.uid, user.email, user.displayName, user.role, user.createdAt, user.completedProfile ? 1 : 0, user.salt, user.passwordHash);
      db.exec("COMMIT");
    } catch (error) { db.exec("ROLLBACK"); throw error; }
  };

  // One-time migration from the previous development JSON store.
  const legacyUsersFile = path.join(dataDir, "users.json");
  if (fs.existsSync(legacyUsersFile) && readUsers().length === 0) {
    try {
      const legacy = JSON.parse(fs.readFileSync(legacyUsersFile, "utf8"));
      if (Array.isArray(legacy) && legacy.length) writeUsers(legacy);
    } catch {}
  }

  const hashPassword = (password: string, salt = crypto.randomBytes(16).toString("hex")) => ({
    salt,
    hash: crypto.scryptSync(password, salt, 64).toString("hex")
  });

  const verifyPassword = (password: string, salt: string, expectedHash: string) => {
    try {
      const actual = crypto.scryptSync(password, salt, 64);
      const expected = Buffer.from(expectedHash, "hex");
      return expected.length === actual.length && crypto.timingSafeEqual(actual, expected);
    } catch {
      return false;
    }
  };

  const publicUser = (u: StoredUser) => ({
    uid: u.uid,
    email: u.email,
    displayName: u.displayName,
    role: u.role,
    createdAt: u.createdAt,
    completedProfile: u.completedProfile
  });

  const authSecretFile = path.join(dataDir, "auth_secret");
  const getAuthSecret = () => {
    if (process.env.AUTH_SECRET) return process.env.AUTH_SECRET;
    try {
      if (fs.existsSync(authSecretFile)) {
        const existing = fs.readFileSync(authSecretFile, "utf8").trim();
        if (existing) return existing;
      }
      const generated = crypto.randomBytes(32).toString("hex");
      fs.writeFileSync(authSecretFile, generated, { encoding: "utf8", mode: 0o600 });
      console.warn("AUTH_SECRET is not set. A development-only signing secret was generated in data/auth_secret. Set AUTH_SECRET in production.");
      return generated;
    } catch {
      return "interview-cracker-local-development-secret";
    }
  };

  const signToken = (user: StoredUser) => {
    const secret = getAuthSecret();
    const payload = Buffer.from(JSON.stringify({
      uid: user.uid,
      email: user.email,
      role: user.role,
      exp: Date.now() + 1000 * 60 * 60 * 24 * 7
    })).toString("base64url");
    const signature = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
    return `${payload}.${signature}`;
  };

  const readToken = (token: string) => {
    const secret = getAuthSecret();
    const [payload, signature] = token.split(".");
    if (!payload || !signature) return null;
    const expected = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
    if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
    try {
      const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
      return data.exp > Date.now() ? data : null;
    } catch {
      return null;
    }
  };


  // ---------------------------------------------------------------------------
  // Persistent Candidate Memory + Interview Intelligence
  // ---------------------------------------------------------------------------
  // Candidate Memory is account-scoped, not session-scoped.  The development
  // provider stores data server-side in JSON.  Production can use Supabase by
  // setting SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY; the public frontend
  // never receives the service-role credential.
  const candidateMemoryFile = path.join(dataDir, "candidate_memory.json"); // legacy migration only
  const interviewSessionsFile = path.join(dataDir, "interview_sessions.json"); // legacy migration only

  type CandidateMemory = {
    user_id: string;
    resume_profile: any;
    resume_versions: any[];
    skills: Record<string, { score: number; confidence: number; evidence_count: number; last_assessed_at: string | null }>;
    strengths: Array<{ text: string; category: string; confidence: number; evidence_count: number; last_observed_at: string }>;
    weaknesses: Array<{ text: string; category: string; severity: number; confidence: number; evidence_count: number; improvement_status: string; last_observed_at: string }>;
    topics: Record<string, { score: number; confidence: number; assessment_count: number; last_assessed_at: string | null; recent_scores: number[]; status: string }>;
    communication: {
      grammar: number; fluency: number; vocabulary: number; pronunciation: number; confidence: number; clarity: number;
      filler_words_per_minute: number; speaking_speed_wpm: number; professionalism: number; sessions: number; trend: string;
      recurring_grammar_errors: string[]; recurring_communication_weaknesses: string[];
      conversation_history: Array<{ role: "ai" | "candidate"; text: string; timestamp: string; coaching?: any }>;
      last_conversation_at?: string | null;
    };
    technical: { overall: number; problem_solving: number; coding: number; system_design: number; fundamentals: number; communication: number; trend: string; coding_history?: any[] };
    interview_history: Array<{ session_id: string; mode: string; type: string; score: number; communication_score: number; technical_score: number; topics: string[]; created_at: string; completed_at?: string }>;
    improvement_plan: Array<{ topic: string; reason: string; priority: "high" | "medium" | "low"; action: string; estimated_minutes: number }>;
    readiness: { overall: number; technical: number; communication: number; behavioral: number; resume_alignment: number; trend: string };
    updated_at: string;
  };

  const emptyCandidateMemory = (uid: string): CandidateMemory => ({
    user_id: uid,
    resume_profile: {},
    resume_versions: [],
    skills: {},
    strengths: [],
    weaknesses: [],
    topics: {},
    communication: {
      grammar: 0, fluency: 0, vocabulary: 0, pronunciation: 0, confidence: 0, clarity: 0,
      filler_words_per_minute: 0, speaking_speed_wpm: 0, professionalism: 0, sessions: 0, trend: "new",
      recurring_grammar_errors: [], recurring_communication_weaknesses: [], conversation_history: [], last_conversation_at: null
    },
    technical: { overall: 0, problem_solving: 0, coding: 0, system_design: 0, fundamentals: 0, communication: 0, trend: "new", coding_history: [] },
    interview_history: [],
    improvement_plan: [],
    readiness: { overall: 0, technical: 0, communication: 0, behavioral: 0, resume_alignment: 0, trend: "new" },
    updated_at: new Date().toISOString()
  });

  const readJsonArrayOrObject = (file: string, fallback: any) => {
    try {
      if (!fs.existsSync(file)) return fallback;
      const parsed = JSON.parse(fs.readFileSync(file, "utf8"));
      return parsed ?? fallback;
    } catch {
      return fallback;
    }
  };

  const writeAtomicJson = (file: string, value: any) => {
    const tmp = `${file}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(value, null, 2), "utf8");
    fs.renameSync(tmp, file);
  };

  const supabaseConfigured = () => Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

  const supabaseFetch = async (table: string, init: RequestInit = {}) => {
    if (!supabaseConfigured()) return null;
    const base = process.env.SUPABASE_URL!.replace(/\/$/, "");
    const response = await fetch(`${base}/rest/v1/${table}`, {
      ...init,
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
        ...(init.headers || {})
      }
    });
    if (!response.ok) throw new Error(`Supabase ${table} request failed (${response.status})`);
    return response.status === 204 ? null : response.json();
  };

  const getCandidateMemory = async (uid: string): Promise<CandidateMemory> => {
    if (supabaseConfigured()) {
      try {
        const rows = await supabaseFetch(`candidate_memory?user_id=eq.${encodeURIComponent(uid)}&limit=1`);
        if (Array.isArray(rows) && rows[0]?.memory) return { ...emptyCandidateMemory(uid), ...rows[0].memory, user_id: uid };
      } catch (e) { console.warn("[CANDIDATE_MEMORY] Supabase read failed; using SQLite fallback.", e); }
    }
    const row = db.prepare(`SELECT memory_json FROM candidate_memory WHERE user_id = ?`).get(uid) as any;
    if (row?.memory_json) {
      try { return { ...emptyCandidateMemory(uid), ...JSON.parse(String(row.memory_json)), user_id: uid }; } catch {}
    }
    // One-time migration from the previous JSON memory store.
    const legacy = readJsonArrayOrObject(candidateMemoryFile, {});
    if (legacy?.[uid]) {
      const memory = { ...emptyCandidateMemory(uid), ...legacy[uid], user_id: uid };
      db.prepare(`INSERT OR REPLACE INTO candidate_memory (user_id,memory_json,updated_at) VALUES (?,?,?)`).run(uid, JSON.stringify(memory), memory.updated_at || new Date().toISOString());
      return memory;
    }
    return emptyCandidateMemory(uid);
  };

  const saveCandidateMemory = async (memory: CandidateMemory) => {
    memory.updated_at = new Date().toISOString();
    if (supabaseConfigured()) {
      try {
        await supabaseFetch(`candidates?on_conflict=user_id`, { method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=minimal" }, body: JSON.stringify({ user_id: memory.user_id, email: memory.resume_profile?.email || null, full_name: memory.resume_profile?.fullName || memory.resume_profile?.name || null, target_role: memory.resume_profile?.targetRole || memory.resume_profile?.target_role || null }) });
        await supabaseFetch(`candidate_memory?user_id=eq.${encodeURIComponent(memory.user_id)}`, { method: "PATCH", body: JSON.stringify({ memory }) });
        const existing = await supabaseFetch(`candidate_memory?user_id=eq.${encodeURIComponent(memory.user_id)}&limit=1`);
        if (!Array.isArray(existing) || existing.length === 0) await supabaseFetch("candidate_memory", { method: "POST", body: JSON.stringify({ user_id: memory.user_id, memory }) });
      } catch (e) { console.warn("[CANDIDATE_MEMORY] Supabase write failed; saving to SQLite.", e); }
    }
    db.prepare(`INSERT OR REPLACE INTO candidate_memory (user_id,memory_json,updated_at) VALUES (?,?,?)`).run(memory.user_id, JSON.stringify(memory), memory.updated_at);
    return memory;
  };

  const readInterviewSessions = (): Record<string, any> => {
    const rows = db.prepare(`SELECT session_id,payload_json FROM interview_sessions`).all() as any[];
    const sessions: Record<string, any> = {};
    for (const row of rows) { try { sessions[String(row.session_id)] = JSON.parse(String(row.payload_json)); } catch {} }
    if (Object.keys(sessions).length === 0) {
      const legacy = readJsonArrayOrObject(interviewSessionsFile, {});
      if (legacy && typeof legacy === "object") {
        const ins = db.prepare(`INSERT OR REPLACE INTO interview_sessions (session_id,user_id,payload_json,updated_at) VALUES (?,?,?,?)`);
        for (const [sessionId,payload] of Object.entries(legacy)) { if (payload && typeof payload === "object") { const p:any = payload; ins.run(sessionId, String(p.uid || ""), JSON.stringify(p), String(p.updated_at || new Date().toISOString())); sessions[sessionId]=p; } }
      }
    }
    return sessions;
  };

  const saveInterviewSession = async (session: any) => {
    const persisted = { ...session, updated_at: new Date().toISOString() };
    db.prepare(`INSERT OR REPLACE INTO interview_sessions (session_id,user_id,payload_json,updated_at) VALUES (?,?,?,?)`).run(persisted.session_id, persisted.uid, JSON.stringify(persisted), persisted.updated_at);

    if (supabaseConfigured()) {
      try {
        await supabaseFetch(`interview_sessions?on_conflict=session_id`, {
          method: "POST",
          headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
          body: JSON.stringify({
            session_id: persisted.session_id,
            candidate_user_id: persisted.uid,
            mode: persisted.interview_mode === "Resume Practice" ? "resume_practice" : "ai_mock",
            interview_type: persisted.interview_type,
            status: persisted.status,
            score: persisted.overall_report?.overall_score ?? null,
            started_at: persisted.created_at,
            completed_at: persisted.completed_at ?? null,
            payload: persisted
          })
        });
      } catch (e) {
        console.warn("[INTERVIEW_PERSISTENCE] Supabase session write failed; SQLite remains available.", e);
      }
    }
    return persisted;
  };

  const getOwnedInterviewSession = async (req: express.Request, sessionId: string): Promise<any> => {
    const authUser = getAuthenticatedUser(req);
    if (!authUser) return { error: { status: 401, body: { status: "error", code: "UNAUTHORIZED", message: "Authentication required." } } };
    let session = readInterviewSessions()[sessionId];

    if (!session && supabaseConfigured()) {
      try {
        const rows = await supabaseFetch(`interview_sessions?session_id=eq.${encodeURIComponent(sessionId)}&candidate_user_id=eq.${encodeURIComponent(authUser.uid)}&limit=1`);
        if (Array.isArray(rows) && rows[0]?.payload) session = rows[0].payload;
      } catch (e) {
        console.warn("[INTERVIEW_PERSISTENCE] Supabase session read failed.", e);
      }
    }

    if (!session) return { error: { status: 404, body: { status: "error", code: "SESSION_NOT_FOUND", message: "Interview session not found." } } };
    if (session.uid !== authUser.uid) return { error: { status: 403, body: { status: "error", code: "FORBIDDEN", message: "You do not own this interview session." } } };
    return { authUser, session };
  };

  const persistInterviewEvidence = async (session: any, historyItem: any, sequenceNumber: number) => {
    if (!supabaseConfigured()) return;
    const questionId = historyItem.persisted_question_id || crypto.randomUUID();
    historyItem.persisted_question_id = questionId;
    try {
      await supabaseFetch(`interview_questions?on_conflict=session_id,sequence_number`, {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
        body: JSON.stringify({
          id: questionId,
          session_id: session.session_id,
          sequence_number: sequenceNumber,
          question_text: historyItem.question_text || "",
          topic: historyItem.topic || null,
          difficulty: historyItem.difficulty_level || session.difficulty || null,
          generated_from: historyItem.generated_from || "candidate_memory",
          asked_at: historyItem.asked_at || new Date().toISOString()
        })
      });

      const answerId = crypto.randomUUID();
      await supabaseFetch("interview_answers", {
        method: "POST",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({
          id: answerId,
          question_id: questionId,
          answer_text: historyItem.user_answer || "",
          duration_seconds: Number(historyItem.duration_seconds || 0) || null,
          answered_at: historyItem.answered_at || new Date().toISOString()
        })
      });

      await supabaseFetch("interview_evaluations", {
        method: "POST",
        body: JSON.stringify({
          answer_id: answerId,
          overall_score: Number(historyItem.evaluation?.score || 0),
          technical_score: Number(historyItem.evaluation?.technical_score || 0),
          communication_score: Number(historyItem.evaluation?.communication_rating || 0),
          confidence_score: Number(historyItem.evaluation?.confidence_rating || 0),
          feedback: historyItem.evaluation || {}
        })
      });
    } catch (e) {
      console.warn("[INTERVIEW_PERSISTENCE] Supabase evidence write failed; session payload remains the source of truth.", e);
    }
  };

  const getRecentPersistentInterviews = async (uid: string) => {
    if (supabaseConfigured()) {
      try {
        const rows = await supabaseFetch(`interview_sessions?candidate_user_id=eq.${encodeURIComponent(uid)}&order=started_at.desc&limit=8`);
        const remote = Array.isArray(rows) ? rows.map((r: any) => r.payload).filter(Boolean) : [];
        if (remote.length) return remote;
      } catch (e) {
        console.warn("[INTERVIEW_PERSISTENCE] Supabase history read failed; using server-side fallback.", e);
      }
    }
    return Object.values(readInterviewSessions()).filter((s: any) => s.uid === uid).sort((a: any, b: any) => String(b.created_at).localeCompare(String(a.created_at))).slice(0, 8);
  };

  const parseInterviewLimit = (mode: string) => mode.includes("Quick") ? 5 : mode.includes("Comprehensive") ? 20 : 10;
  const normalizeTopic = (value: string) => value.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim().replace(/\s+/g, " ");

  const adaptiveTopicSelection = (memory: CandidateMemory, interviewType: string) => {
    const recentTopics = new Set(memory.interview_history.slice(-3).flatMap(h => h.topics || []).map(normalizeTopic));
    const now = Date.now();
    const weak = Object.entries(memory.topics)
      .map(([topic, data]) => {
        const ageDays = data.last_assessed_at ? Math.max(0, (now - new Date(data.last_assessed_at).getTime()) / 86400000) : 999;
        const staleBonus = Math.min(25, Math.round(ageDays / 7) * 5);
        return { topic, ...data, weight: (100 - data.score) + (data.status === "weak" ? 25 : 0) + (data.assessment_count === 0 ? 15 : 0) + staleBonus };
      })
      .filter(x => !recentTopics.has(normalizeTopic(x.topic)))
      .sort((a, b) => b.weight - a.weight);
    if (weak[0]) return weak[0].topic;
    const plan = memory.improvement_plan.find(p => !recentTopics.has(normalizeTopic(p.topic)));
    if (plan) return plan.topic;
    const skills = Object.keys(memory.skills).filter(s => !recentTopics.has(normalizeTopic(s)));
    return skills[0] || (interviewType.toLowerCase().includes("hr") ? "behavioral communication" : "problem solving");
  };

  const fallbackQuestionFor = (topic: string, interviewType: string) => {
    const t = topic.toLowerCase();
    if (t.includes("communication") || t.includes("grammar")) return "Explain a technical project you worked on in a clear, structured way, as if you were speaking to an interviewer who is not familiar with it.";
    if (t.includes("sql") || t.includes("database") || t.includes("index")) return "Explain how database indexes improve query performance, and describe one situation where an index can hurt performance.";
    if (t.includes("system design") || t.includes("scaling")) return "Design a scalable service for a sudden tenfold increase in traffic. Explain your architecture, bottlenecks, and trade-offs.";
    if (t.includes("react")) return "Describe how you would optimize a React application that has slow rendering and unnecessary re-renders.";
    if (t.includes("node")) return "Explain how you would design a Node.js API to remain reliable under high concurrent traffic.";
    if (t.includes("jwt") || t.includes("authentication")) return "Explain how JWT authentication works, including token expiry, refresh tokens, and the security risks you would consider.";
    return interviewType.toLowerCase().includes("hr")
      ? `Tell me about a real experience related to ${topic} and explain what you learned from it.`
      : `Explain ${topic} and give a practical example from a project or real-world system.`;
  };

  const targetCompanyHint = (interviewConfig: string) => {
    const value = interviewConfig.toLowerCase();
    if (value.includes("google")) return "General Google-like style: structured problem solving, clarity, technical depth; do not present as official Google questions.";
    if (value.includes("microsoft")) return "General Microsoft-like style: practical engineering, collaboration and problem solving; do not present as official Microsoft questions.";
    if (value.includes("amazon")) return "General Amazon-like style: ownership, customer impact and structured behavioral/technical reasoning; do not present as official Amazon questions.";
    if (value.includes("meta")) return "General Meta-like style: coding/system thinking and product-minded reasoning; do not present as official Meta questions.";
    return "No special company style; use the target role and candidate evidence.";
  };

  const generateAdaptiveQuestion = async (memory: CandidateMemory, interviewType: string, mode: string, previousAnswer?: string, previousQuestion?: string, recentQuestions: string[] = []) => {
    const topic = adaptiveTopicSelection(memory, interviewType);
    const lowerRound = interviewType.toLowerCase();
    const roundGuidance = lowerRound.includes("hr") ? "Focus on motivation, communication, goals, work style and verified background." :
      lowerRound.includes("behavioral") ? "Use evidence-based behavioral prompts about verified projects, teamwork, conflict, leadership and challenges." :
      lowerRound.includes("project") ? "Ask deep follow-ups about actual projects, architecture, trade-offs, ownership, outcomes and lessons." :
      lowerRound.includes("coding discussion") ? "Connect coding questions to technologies on the resume and practical CS fundamentals." :
      lowerRound.includes("system design") ? "Use architecture, scalability, reliability and trade-off questions appropriate to experience level." :
      lowerRound.includes("managerial") ? "Focus on leadership, prioritization, mentoring, ownership and decision-making using verified experience." :
      lowerRound.includes("final hr") ? "Focus on role fit, communication, goals, constraints and closing-stage professionalism." :
      lowerRound.includes("other professional") ? "Use a professional interview style appropriate to the target role and verified background." :
      "Focus on resume introduction, skills, experience and role-relevant technical depth.";
    const companyGuidance = targetCompanyHint(interviewType);
    const context = `You are Interview Cracker's adaptive interviewer. Generate exactly one interview question.\nCandidate memory: ${JSON.stringify({ resume: memory.resume_profile, strengths: memory.strengths.slice(-6), weaknesses: memory.weaknesses.slice(-8), topics: memory.topics, communication: memory.communication, technical: memory.technical, history: memory.interview_history.slice(-5) })}\nInterview configuration: ${interviewType}\nMode: ${mode}\nPriority topic: ${topic}\nRound guidance: ${roundGuidance}\nCompany guidance: ${companyGuidance}\nPrevious question: ${previousQuestion || "none"}\nPrevious answer: ${previousAnswer || "none"}\nRecently asked questions: ${JSON.stringify(recentQuestions.slice(-20))}\nRules: do not repeat or lightly paraphrase recent questions; prefer weak or stale topics; use only resume/history evidence; never invent skills, companies worked for, projects or experience; never claim a question is official company content; company style may influence rigor only; increase difficulty after strong answers; ask one concise, interview-ready question. Return JSON with question_id, question_text, difficulty_level, topic.`;
    const fallback = { question_id: `q_${crypto.randomUUID()}`, question_text: fallbackQuestionFor(topic, interviewType), difficulty_level: "Medium", topic };
    const text = await safeGenerateContent({
      contents: context,
      config: { responseMimeType: "application/json", responseSchema: { type: "object", properties: { question_id: { type: "string" }, question_text: { type: "string" }, difficulty_level: { type: "string" }, topic: { type: "string" } }, required: ["question_id", "question_text", "difficulty_level", "topic"] } },
      fallbackJson: fallback
    });
    try { return { ...fallback, ...JSON.parse(text) }; } catch { return fallback; }
  };

  const updateMemoryFromEvaluation = async (uid: string, session: any, evaluation: any, topic: string) => {
    const memory = await getCandidateMemory(uid);
    const now = new Date().toISOString();
    const score = Math.max(0, Math.min(100, Number(evaluation.score ?? 0)));
    const topicKey = topic || session.current_question?.topic || "general";
    const previous = memory.topics[topicKey] || { score: 0, confidence: 0, assessment_count: 0, last_assessed_at: null, recent_scores: [], status: "not_assessed" };
    const recentScores = [...previous.recent_scores, score].slice(-6);
    const mastery = Math.round(recentScores.reduce((a, b) => a + b, 0) / recentScores.length);
    memory.topics[topicKey] = {
      score: mastery,
      confidence: Math.min(1, previous.confidence + 0.15),
      assessment_count: previous.assessment_count + 1,
      last_assessed_at: now,
      recent_scores: recentScores,
      status: mastery >= 85 ? "mastered" : mastery >= 70 ? "strong" : mastery >= 55 ? "developing" : "weak"
    };
    const weaknesses = Array.isArray(evaluation.weaknesses) ? evaluation.weaknesses : [];
    const strengths = Array.isArray(evaluation.strengths) ? evaluation.strengths : [];
    weaknesses.forEach((w: string) => {
      const existing = memory.weaknesses.find(x => normalizeTopic(x.text) === normalizeTopic(w));
      if (existing) { existing.evidence_count += 1; existing.severity = Math.min(100, Math.round(existing.severity * 0.7 + (100 - score) * 0.3)); existing.last_observed_at = now; }
      else memory.weaknesses.push({ text: w, category: "interview", severity: Math.max(10, 100 - score), confidence: 0.55, evidence_count: 1, improvement_status: "active", last_observed_at: now });
    });
    strengths.forEach((st: string) => {
      const existing = memory.strengths.find(x => normalizeTopic(x.text) === normalizeTopic(st));
      if (existing) { existing.evidence_count += 1; existing.confidence = Math.min(1, existing.confidence + 0.08); existing.last_observed_at = now; }
      else memory.strengths.push({ text: st, category: "interview", confidence: 0.55, evidence_count: 1, last_observed_at: now });
    });
    const grammarErrors = Array.isArray(evaluation.grammar_errors) ? evaluation.grammar_errors : [];
    const communicationWeaknesses = Array.isArray(evaluation.recurring_communication_weaknesses) ? evaluation.recurring_communication_weaknesses : [];
    memory.communication.recurring_grammar_errors = [...new Set([...memory.communication.recurring_grammar_errors, ...grammarErrors.map((x: any) => String(x))])].slice(-20);
    memory.communication.recurring_communication_weaknesses = [...new Set([...memory.communication.recurring_communication_weaknesses, ...communicationWeaknesses.map((x: any) => String(x))])].slice(-20);
    const comm = Number(evaluation.communication_rating ?? evaluation.communication_score ?? 0);
    const conf = Number(evaluation.confidence_rating ?? evaluation.confidence_score ?? 0);
    const tech = Number(evaluation.technical_score ?? score);
    const blend = (old: number, next: number) => old > 0 ? Math.round(old * 0.65 + next * 0.35) : next;
    memory.communication.grammar = blend(memory.communication.grammar, Number(evaluation.grammar_score ?? comm));
    memory.communication.clarity = blend(memory.communication.clarity, comm);
    memory.communication.confidence = blend(memory.communication.confidence, conf);
    memory.communication.fluency = blend(memory.communication.fluency, Number(evaluation.fluency_score ?? comm));
    memory.communication.professionalism = blend(memory.communication.professionalism, Number(evaluation.professionalism_score ?? comm));
    memory.communication.sessions += 1;
    memory.communication.trend = memory.communication.clarity >= 75 ? "improving" : "needs_focus";
    memory.technical.overall = blend(memory.technical.overall, tech);
    memory.technical.problem_solving = blend(memory.technical.problem_solving, Number(evaluation.problem_solving_score ?? score));
    memory.technical.communication = blend(memory.technical.communication, comm);
    memory.technical.trend = memory.technical.overall >= 75 ? "improving" : "needs_focus";
    const topicList = Object.keys(memory.topics).sort((a,b) => memory.topics[b].score - memory.topics[a].score);
    memory.improvement_plan = topicList.filter(t => memory.topics[t].status === "weak" || memory.topics[t].status === "developing").slice(0, 8).map(t => ({ topic: t, reason: `${memory.topics[t].status} performance (${memory.topics[t].score}%)`, priority: memory.topics[t].score < 50 ? "high" : memory.topics[t].score < 70 ? "medium" : "low", action: `Practice ${t} with a targeted interview question and explain the answer aloud.`, estimated_minutes: 15 }));
    memory.readiness.technical = memory.technical.overall;
    memory.readiness.communication = memory.communication.clarity || 0;
    memory.readiness.behavioral = Math.round((memory.communication.confidence + memory.communication.professionalism) / 2);
    memory.readiness.resume_alignment = Number(memory.resume_profile?.atsScore || memory.resume_profile?.overallScore || 0);
    memory.readiness.overall = Math.round(memory.readiness.technical * 0.45 + memory.readiness.communication * 0.25 + memory.readiness.behavioral * 0.15 + memory.readiness.resume_alignment * 0.15);
    memory.readiness.trend = memory.readiness.overall >= 75 ? "ready" : "improving";
    await saveCandidateMemory(memory);
    if (supabaseConfigured()) {
      try {
        const candidateRows = await supabaseFetch(`candidates?user_id=eq.${encodeURIComponent(uid)}&limit=1`);
        const candidateId = Array.isArray(candidateRows) && candidateRows[0]?.id;
        if (candidateId) {
          await supabaseFetch(`candidate_topics?on_conflict=candidate_id,topic`, {
            method: "POST",
            headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
            body: JSON.stringify({
              candidate_id: candidateId,
              topic: topicKey,
              category: "interview",
              status: memory.topics[topicKey].status,
              mastery_score: memory.topics[topicKey].score,
              confidence: memory.topics[topicKey].confidence,
              assessment_count: memory.topics[topicKey].assessment_count,
              last_assessed_at: memory.topics[topicKey].last_assessed_at,
              recent_scores: memory.topics[topicKey].recent_scores
            })
          });
          for (const [skillName, skill] of Object.entries(memory.skills).slice(-50)) {
            await supabaseFetch(`candidate_skills?on_conflict=candidate_id,skill_name`, {
              method: "POST",
              headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
              body: JSON.stringify({ candidate_id: candidateId, skill_name: skillName, proficiency: skill.score, confidence: skill.confidence, evidence_count: skill.evidence_count, last_assessed_at: skill.last_assessed_at })
            });
          }
        }
      } catch (e) {
        console.warn("[CANDIDATE_MEMORY] Normalized topic/skill persistence failed; memory JSON remains available.", e);
      }
    }
    return memory;
  };

  const getAuthenticatedUser = (req: express.Request) => {
    const header = String(req.headers.authorization || "");
    const token = header.startsWith("Bearer ") ? header.slice(7) : "";
    const session = readToken(token);
    if (!session?.uid) return null;
    const user = readUsers().find(u => u.uid === session.uid);
    return user ? publicUser(user) : null;
  };

  const bootstrapAdmin = () => {
    const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD || "";
    if (!email || password.length < 12) return;
    const users = readUsers();
    if (users.some(u => u.email === email)) return;
    const { salt, hash } = hashPassword(password);
    users.push({
      uid: `admin_${crypto.randomUUID()}`,
      email,
      displayName: "Administrator",
      role: "admin",
      createdAt: new Date().toISOString(),
      completedProfile: true,
      salt,
      passwordHash: hash
    });
    writeUsers(users);
  };
  bootstrapAdmin();

  app.post("/api/v1/auth/register", (req, res) => {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");
    const fullName = String(req.body?.fullName || "").trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ status: "error", code: "INVALID_EMAIL", message: "Enter a valid email address." });
    }
    if (password.length < 8) {
      return res.status(400).json({ status: "error", code: "WEAK_PASSWORD", message: "Password must contain at least 8 characters." });
    }
    if (fullName.length < 2) {
      return res.status(400).json({ status: "error", code: "INVALID_NAME", message: "Enter your full name." });
    }

    const users = readUsers();
    if (users.some(u => u.email === email)) {
      return res.status(409).json({ status: "error", code: "auth/email-already-in-use", message: "This email is already registered." });
    }

    const { salt, hash } = hashPassword(password);
    const user: StoredUser = {
      uid: `student_${crypto.randomUUID()}`,
      email,
      displayName: fullName,
      role: "student",
      createdAt: new Date().toISOString(),
      completedProfile: false,
      salt,
      passwordHash: hash
    };
    users.push(user);
    writeUsers(users);
    return res.json({ status: "success", user: publicUser(user), token: signToken(user) });
  });

  app.post("/api/v1/auth/login", (req, res) => {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");
    const user = readUsers().find(u => u.email === email);

    if (!user || !verifyPassword(password, user.salt, user.passwordHash)) {
      return res.status(401).json({ status: "error", code: "auth/invalid-credential", message: "Invalid email or password." });
    }

    return res.json({ status: "success", user: publicUser(user), token: signToken(user) });
  });

  app.get("/api/v1/auth/me", (req, res) => {
    const header = String(req.headers.authorization || "");
    const token = header.startsWith("Bearer ") ? header.slice(7) : "";
    const session = readToken(token);
    if (!session) return res.status(401).json({ status: "error", message: "Session expired." });
    const user = readUsers().find(u => u.uid === session.uid);
    if (!user) return res.status(401).json({ status: "error", message: "User no longer exists." });
    return res.json({ status: "success", user: publicUser(user) });
  });


  // ---------------------------------------------------------------------------
  // Candidate Memory API
  // ---------------------------------------------------------------------------
  app.get("/api/v1/candidate/memory", async (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user) return res.status(401).json({ status: "error", code: "UNAUTHORIZED", message: "Authentication required." });
    const memory = await getCandidateMemory(user.uid);
    return res.json({ status: "success", memory });
  });

  app.get("/api/v1/candidate/memory/context", async (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user) return res.status(401).json({ status: "error", code: "UNAUTHORIZED", message: "Authentication required." });
    const memory = await getCandidateMemory(user.uid);
    const recentSessions = await getRecentPersistentInterviews(user.uid);
    const recentQuestionAnswers = recentSessions.flatMap((session: any) => (session.history || []).map((item: any) => ({
      session_id: session.session_id,
      mode: session.interview_mode,
      type: session.interview_type,
      question: item.question_text,
      answer: item.user_answer,
      score: item.evaluation?.score ?? null,
      topic: item.topic || null,
      weaknesses: item.evaluation?.weaknesses || [],
      strengths: item.evaluation?.strengths || []
    }))).slice(-30);
    return res.json({ status: "success", context: {
      resume: memory.resume_profile,
      top_strengths: memory.strengths.slice(-8),
      top_weaknesses: memory.weaknesses.slice(-8),
      assessed_topics: Object.entries(memory.topics).map(([topic, value]) => ({ topic, ...value })),
      improvement_topics: memory.improvement_plan,
      communication: memory.communication,
      technical: memory.technical,
      readiness: memory.readiness,
      recent_interviews: memory.interview_history.slice(-8),
      recent_question_answers: recentQuestionAnswers
    }});
  });

  app.get("/api/v1/candidate/memory/history", async (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user) return res.status(401).json({ status: "error", code: "UNAUTHORIZED", message: "Authentication required." });
    const limit = Math.max(1, Math.min(100, Number(req.query?.limit || 30)));
    const sessions = await getRecentPersistentInterviews(user.uid);
    const history = sessions.flatMap((session: any) => (session.history || []).map((item: any) => ({
      session_id: session.session_id,
      mode: session.interview_mode === "Resume Practice" ? "resume_practice" : "ai_mock",
      interview_type: session.interview_type,
      sequence: item.persisted_question_id || null,
      question: item.question_text || "",
      answer: item.user_answer || "",
      topic: item.topic || null,
      evaluation: item.evaluation || null,
      asked_at: item.asked_at || session.created_at,
      answered_at: item.answered_at || null
    })));
    return res.json({ status: "success", history: history.slice(-limit) });
  });

  app.post("/api/v1/candidate/memory/profile", async (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user) return res.status(401).json({ status: "error", code: "UNAUTHORIZED", message: "Authentication required." });
    const memory = await getCandidateMemory(user.uid);
    const profile = req.body?.profile || {};
    memory.resume_profile = { ...memory.resume_profile, ...profile };
    const skills = Array.isArray(profile.skills) ? profile.skills : [];
    skills.forEach((skill: string) => {
      const current = memory.skills[skill] || { score: 70, confidence: 0.4, evidence_count: 0, last_assessed_at: null };
      memory.skills[skill] = { ...current, evidence_count: current.evidence_count + 1 };
    });
    if (Array.isArray(profile.strengths)) profile.strengths.forEach((x: string) => memory.strengths.push({ text: x, category: "resume", confidence: 0.5, evidence_count: 1, last_observed_at: new Date().toISOString() }));
    if (Array.isArray(profile.weaknesses)) profile.weaknesses.forEach((x: string) => memory.weaknesses.push({ text: x, category: "resume", severity: 50, confidence: 0.5, evidence_count: 1, improvement_status: "active", last_observed_at: new Date().toISOString() }));
    await saveCandidateMemory(memory);
    return res.json({ status: "success", memory });
  });

  app.post("/api/v1/candidate/memory/communication", async (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user) return res.status(401).json({ status: "error", code: "UNAUTHORIZED", message: "Authentication required." });
    const memory = await getCandidateMemory(user.uid);
    const report = req.body?.report || req.body || {};
    const blend = (old: number, next: number) => old > 0 ? Math.round(old * 0.65 + Number(next || 0) * 0.35) : Number(next || 0);
    memory.communication.grammar = blend(memory.communication.grammar, report.grammarScore);
    memory.communication.pronunciation = blend(memory.communication.pronunciation, report.pronunciationScore);
    memory.communication.vocabulary = blend(memory.communication.vocabulary, report.vocabularyScore);
    memory.communication.fluency = blend(memory.communication.fluency, report.fluencyScore);
    memory.communication.confidence = blend(memory.communication.confidence, report.confidenceScore);
    memory.communication.clarity = blend(memory.communication.clarity, report.clarityScore || report.fluencyScore);
    memory.communication.professionalism = blend(memory.communication.professionalism, report.professionalismScore || report.confidenceScore);
    memory.communication.speaking_speed_wpm = Number(report.fluencyMetrics?.wpm || report.speakingSpeed || memory.communication.speaking_speed_wpm || 0);
    memory.communication.filler_words_per_minute = Number(report.fluencyMetrics?.fillerWordsCount || 0);
    memory.communication.sessions += 1;
    const grammarErrors = Array.isArray(report.grammarErrors) ? report.grammarErrors : [];
    grammarErrors.slice(0, 5).forEach((g: any) => {
      const text = String(g.type || g.original || "grammar pattern");
      if (!memory.communication.recurring_grammar_errors.includes(text)) memory.communication.recurring_grammar_errors.push(text);
    });
    memory.communication.trend = memory.communication.grammar >= 80 && memory.communication.fluency >= 75 ? "improving" : "needs_focus";
    memory.readiness.communication = Math.round((memory.communication.grammar + memory.communication.fluency + memory.communication.confidence + memory.communication.clarity) / 4);
    memory.readiness.overall = Math.round(memory.readiness.technical * 0.45 + memory.readiness.communication * 0.25 + memory.readiness.behavioral * 0.15 + memory.readiness.resume_alignment * 0.15);
    await saveCandidateMemory(memory);
    return res.json({ status: "success", communication: memory.communication, readiness: memory.readiness });
  });

  app.post("/api/v1/candidate/memory/coding", async (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user) return res.status(401).json({ status: "error", code: "UNAUTHORIZED", message: "Authentication required." });
    const result = req.body?.result || {};
    const memory = await getCandidateMemory(user.uid);
    const entry = {
      title: String(result.title || "Coding problem"),
      score: Math.max(0, Math.min(100, Number(result.score || 0))),
      status: String(result.status || "Unknown"),
      language: String(result.language || "unknown"),
      category: String(result.category || "general"),
      difficulty: String(result.difficulty || "unknown"),
      date: result.date || new Date().toISOString()
    };
    const codingHistory = Array.isArray(memory.technical.coding_history) ? memory.technical.coding_history : [];
    memory.technical.coding_history = [entry, ...codingHistory].slice(0, 50);
    const scores = memory.technical.coding_history.map((x:any) => Number(x.score || 0));
    memory.technical.coding = scores.length ? Math.round(scores.reduce((a,b)=>a+b,0)/scores.length) : 0;
    memory.technical.overall = memory.technical.overall > 0 ? Math.round(memory.technical.overall * 0.7 + memory.technical.coding * 0.3) : memory.technical.coding;
    memory.readiness.technical = memory.technical.overall;
    memory.readiness.overall = Math.round(memory.readiness.technical*0.45 + memory.readiness.communication*0.25 + memory.readiness.behavioral*0.15 + memory.readiness.resume_alignment*0.15);
    await saveCandidateMemory(memory);
    return res.json({ status: "success", technical: memory.technical, readiness: memory.readiness });
  });

  app.delete("/api/v1/candidate/memory/reset", async (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user) return res.status(401).json({ status: "error", code: "UNAUTHORIZED", message: "Authentication required." });
    const fresh = emptyCandidateMemory(user.uid);
    await saveCandidateMemory(fresh);
    const sessions = readInterviewSessions();
    for (const [id, session] of Object.entries(sessions)) {
      if ((session as any).uid === user.uid) delete sessions[id];
    }
    writeAtomicJson(interviewSessionsFile, sessions);
    if (supabaseConfigured()) {
      const uid = encodeURIComponent(user.uid);
      const resources = [
        `interview_evaluations?answer_id=in.(${encodeURIComponent(user.uid)})`,
        `candidate_topics?candidate_id=in.(${encodeURIComponent(user.uid)})`,
        `candidate_skills?candidate_id=in.(${encodeURIComponent(user.uid)})`,
      ];
      try {
        const candidates = await supabaseFetch(`candidates?user_id=eq.${uid}&limit=1`);
        const candidateId = Array.isArray(candidates) ? candidates[0]?.id : null;
        if (candidateId) {
          const remoteSessions = await supabaseFetch(`interview_sessions?candidate_user_id=eq.${uid}&select=session_id,payload`);
          const sessionIds = Array.isArray(remoteSessions) ? remoteSessions.map((x:any) => x.session_id).filter(Boolean) : [];
          if (sessionIds.length) {
            const qRows = await supabaseFetch(`interview_questions?session_id=in.(${sessionIds.map((x:string)=>encodeURIComponent(x)).join(",")})&select=id`);
            const questionIds = Array.isArray(qRows) ? qRows.map((x:any)=>x.id).filter(Boolean) : [];
            if (questionIds.length) {
              const aRows = await supabaseFetch(`interview_answers?question_id=in.(${questionIds.map((x:string)=>encodeURIComponent(x)).join(",")})&select=id`);
              const answerIds = Array.isArray(aRows) ? aRows.map((x:any)=>x.id).filter(Boolean) : [];
              if (answerIds.length) await supabaseFetch(`interview_evaluations?answer_id=in.(${answerIds.map((x:string)=>encodeURIComponent(x)).join(",")})`, { method: "DELETE" });
              await supabaseFetch(`interview_answers?question_id=in.(${questionIds.map((x:string)=>encodeURIComponent(x)).join(",")})`, { method: "DELETE" });
              await supabaseFetch(`interview_questions?session_id=in.(${sessionIds.map((x:string)=>encodeURIComponent(x)).join(",")})`, { method: "DELETE" });
            }
          }
          await supabaseFetch(`candidate_topics?candidate_id=eq.${encodeURIComponent(candidateId)}`, { method: "DELETE" });
          await supabaseFetch(`candidate_skills?candidate_id=eq.${encodeURIComponent(candidateId)}`, { method: "DELETE" });
          await supabaseFetch(`candidate_resumes?candidate_id=eq.${encodeURIComponent(candidateId)}`, { method: "DELETE" });
          await supabaseFetch(`candidate_memory?user_id=eq.${uid}`, { method: "DELETE" });
          await supabaseFetch(`interview_sessions?candidate_user_id=eq.${uid}`, { method: "DELETE" });
        }
      } catch (e) { console.warn("[CANDIDATE_MEMORY] Supabase reset cleanup partially failed.", e); }
    }
    return res.json({ status: "success", memory: fresh });
  });

  app.post("/api/v1/communication/conversation/start", async (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user) return res.status(401).json({ status: "error", code: "UNAUTHORIZED", message: "Authentication required." });
    try {
      const memory = await getCandidateMemory(user.uid);
      const persona = String(req.body?.persona || "Friendly Teacher").trim();
      const topic = String(req.body?.topic || "").trim();
      const topicInstruction = topic ? `The candidate explicitly chose this practice topic: ${topic}. Keep the conversation focused on that topic.` : "Do not discuss the candidate's resume, job history, projects, or technical background unless the candidate explicitly chooses interview/resume practice.";
      const prompt = `You are ${persona}, a warm, intelligent English communication teacher and mentor. Start a natural spoken English conversation. Focus on improving English communication, not resume evaluation. ${topicInstruction} Use the candidate's real communication memory only. Never invent personal facts. Ask one open-ended question that encourages the candidate to speak for 30-60 seconds. Be concise, conversational and supportive. Communication memory: ${JSON.stringify(memory.communication)}. Return JSON with opening, topic, goal.`;
      const text = await generateRequiredAI({ contents: prompt, config: { responseMimeType: "application/json" } });
      let result: any;
      try { result = JSON.parse(text); } catch { result = { opening: text.trim(), topic: "Natural conversation", goal: "Speak clearly and naturally." }; }
      const opening = String(result.opening || "Tell me about something you enjoyed working on recently.").trim();
      memory.communication.conversation_history = [
        ...memory.communication.conversation_history.slice(-39),
        { role: "ai", text: opening, timestamp: new Date().toISOString() }
      ];
      memory.communication.last_conversation_at = new Date().toISOString();
      await saveCandidateMemory(memory);
      return res.json({ status: "success", conversation: { ...result, opening }, communication: memory.communication });
    } catch (error: any) {
      console.error("[COMMUNICATION_START]", error);
      return res.status(503).json({ status: "error", code: "AI_UNAVAILABLE", message: "The communication coach is temporarily unavailable. Check your Gemini API configuration and try again." });
    }
  });

  app.post("/api/v1/communication/conversation", async (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user) return res.status(401).json({ status: "error", code: "UNAUTHORIZED", message: "Authentication required." });
    const message = String(req.body?.message || "").trim();
    if (!message) return res.status(400).json({ status: "error", code: "MESSAGE_REQUIRED", message: "message is required." });
    const memory = await getCandidateMemory(user.uid);
    const history = Array.isArray(req.body?.history) ? req.body.history.slice(-12) : memory.communication.conversation_history.slice(-12);
    const persona = String(req.body?.persona || "Friendly Teacher").trim();
    const topic = String(req.body?.topic || "").trim();
    const topicInstruction = topic ? `The candidate explicitly chose this practice topic: ${topic}. Stay within it.` : "Do not discuss resume, projects, job history or technical background unless the candidate explicitly chooses interview/resume practice.";
    const prompt = `You are ${persona}, a warm, patient, emotionally intelligent English communication teacher and mentor. Continue a real conversation naturally before teaching. Understand the candidate's intended meaning, emotion, confidence and context. Then give compact, useful coaching. ${topicInstruction} Focus ONLY on English communication: grammar, vocabulary, sentence formation, fluency, pronunciation, confidence, clarity, natural English and professionalism. Do not discuss or evaluate resume/job history unless the candidate explicitly selected an interview/resume topic. Do not shame the candidate. Do not behave like a grammar checker. Use communication history only to personalize teaching. Previous communication memory: ${JSON.stringify(memory.communication)}. Conversation so far: ${JSON.stringify(history)}. Candidate message: ${message}. Give a short natural reply that keeps the conversation moving, followed by gentle teaching feedback. Return JSON with: reply (natural conversational response), grammarScore, vocabularyScore, fluencyScore, clarityScore, confidenceScore, professionalismScore, pronunciationScore, grammarErrors (short explanations), recurringWeaknesses, naturalAlternative (optional), pronunciationTip (optional), speakingSpeedWpm (number, 0 if unavailable), fillerWordsPerMinute (number, 0 if unavailable), encouragement (one short supportive sentence). Scores should be 0 when not reasonably inferable from text alone. Pronunciation cannot be truthfully scored from transcript text alone, so pronunciationScore MUST be 0 unless actual audio evidence is supplied by the client. Never invent pronunciation measurements from text.`;
    try {
      const text = await generateRequiredAI({ contents: prompt, config: { responseMimeType: "application/json" } });
      let result: any;
      try { result = JSON.parse(text); } catch { return res.status(502).json({ status: "error", code: "INVALID_AI_RESPONSE", message: "The communication coach returned an unreadable response. Please try again." }); }
      const blend = (old:number,next:number)=>old>0 && Number(next)>0?Math.round(old*.7+Number(next)*.3):Number(next||old||0);
      memory.communication.grammar=blend(memory.communication.grammar,result.grammarScore);
      memory.communication.fluency=blend(memory.communication.fluency,result.fluencyScore);
      memory.communication.vocabulary=blend(memory.communication.vocabulary,result.vocabularyScore);
      memory.communication.clarity=blend(memory.communication.clarity,result.clarityScore);
      memory.communication.confidence=blend(memory.communication.confidence,result.confidenceScore);
      memory.communication.professionalism=blend(memory.communication.professionalism,result.professionalismScore);
      memory.communication.pronunciation=blend(memory.communication.pronunciation,result.pronunciationScore);
      if (Number(result.speakingSpeedWpm)>0) memory.communication.speaking_speed_wpm=Number(result.speakingSpeedWpm);
      if (Number(result.fillerWordsPerMinute)>0) memory.communication.filler_words_per_minute=Number(result.fillerWordsPerMinute);
      if (Array.isArray(result.grammarErrors)) memory.communication.recurring_grammar_errors=[...new Set([...memory.communication.recurring_grammar_errors,...result.grammarErrors.map((x:any)=>String(x))])].slice(-20);
      if (Array.isArray(result.recurringWeaknesses)) memory.communication.recurring_communication_weaknesses=[...new Set([...memory.communication.recurring_communication_weaknesses,...result.recurringWeaknesses.map((x:any)=>String(x))])].slice(-20);
      const now = new Date().toISOString();
      memory.communication.conversation_history = [
        ...memory.communication.conversation_history.slice(-38),
        { role: "candidate", text: message, timestamp: now },
        { role: "ai", text: String(result.reply || ""), timestamp: now, coaching: { naturalAlternative: result.naturalAlternative || "", grammarErrors: result.grammarErrors || [], pronunciationTip: result.pronunciationTip || "", encouragement: result.encouragement || "" } }
      ];
      memory.communication.sessions += 1;
      memory.communication.last_conversation_at = now;
      memory.communication.trend = memory.communication.clarity >= 75 ? "improving" : "needs_focus";
      await saveCandidateMemory(memory);
      return res.json({ status: "success", conversation: result, communication: memory.communication });
    } catch (error: any) {
      console.error("[COMMUNICATION]", error);
      return res.status(503).json({ status: "error", code: "AI_UNAVAILABLE", message: "The communication coach is temporarily unavailable. Check your Gemini API configuration and try again." });
    }
  });

  app.get("/api/v1/candidate/memory/plan", async (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user) return res.status(401).json({ status: "error", code: "UNAUTHORIZED", message: "Authentication required." });
    const memory = await getCandidateMemory(user.uid);
    return res.json({ status: "success", plan: memory.improvement_plan, readiness: memory.readiness });
  });

  // ---------------------------------------------------------------------------
  // Core adaptive Interview Engine API
  // ---------------------------------------------------------------------------
  app.post("/api/v1/interview/start", async (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user) return res.status(401).json({ status: "error", code: "UNAUTHORIZED", message: "Authentication required." });
    try {
      const interviewType = String(req.body?.interview_type || req.body?.round_type || "Resume / Introduction Round");
      const interviewMode = String(req.body?.interview_mode || "Resume Practice");
      const candidateProfile = req.body?.candidate_profile || {};
      const roundType = String(req.body?.round_type || interviewType);
      const targetRole = String(req.body?.target_role || candidateProfile?.targetRole || candidateProfile?.dreamRole || "");
      const targetCompany = String(req.body?.target_company || candidateProfile?.targetCompany || "");
      const experienceLevel = String(req.body?.experience_level || candidateProfile?.experienceLevel || "");
      const difficultyPreference = String(req.body?.difficulty || "Standard Industry Level");
      const requestedCount = Number(req.body?.question_count || 0);
      const memory = await getCandidateMemory(user.uid);
      const isResumeMode = /resume|practice/i.test(interviewMode) || /resume/i.test(roundType);
      const hasResumeEvidence = Boolean(memory.resume_versions?.length || memory.resume_profile?.raw_text || memory.resume_profile?.file_name || memory.resume_profile?.personalInfo?.fullName);
      if (isResumeMode && !hasResumeEvidence) {
        return res.status(400).json({ status: "error", code: "RESUME_REQUIRED", message: "Upload and analyze a resume before starting Resume Practice." });
      }
      if (Object.keys(candidateProfile).length) {
        memory.resume_profile = { ...memory.resume_profile, ...candidateProfile };
        await saveCandidateMemory(memory);
      }
      const priorSessions = await getRecentPersistentInterviews(user.uid);
      const recentQuestions = priorSessions.flatMap((item: any) => (item.history || []).map((h: any) => String(h.question_text || ""))).filter(Boolean);
      const question = await generateAdaptiveQuestion(memory, `${roundType} | ${targetRole} | ${experienceLevel} | ${difficultyPreference} | ${targetCompany}`, interviewMode, undefined, undefined, recentQuestions);
      question.difficulty_level = difficultyPreference;
      question.persisted_question_id = crypto.randomUUID();
      question.asked_at = new Date().toISOString();
      const session = {
        session_id: `int_${crypto.randomUUID()}`,
        uid: user.uid,
        interview_type: interviewType,
        interview_mode: interviewMode,
        difficulty: question.difficulty_level || "Medium",
        status: "active",
        current_question_index: 1,
        total_questions_limit: requestedCount >= 1 && requestedCount <= 30 ? requestedCount : parseInterviewLimit(interviewMode),
        round_type: roundType,
        target_role: targetRole,
        target_company: targetCompany,
        experience_level: experienceLevel,
        current_question: question,
        history: [],
        voice_segments: [],
        camera_metrics: { samples: [] },
        paused_at: null,
        total_paused_seconds: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      await saveInterviewSession(session);
      if (supabaseConfigured()) {
        try {
          await supabaseFetch(`interview_questions?on_conflict=session_id,sequence_number`, {
            method: "POST",
            headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
            body: JSON.stringify({
              id: question.persisted_question_id,
              session_id: session.session_id,
              sequence_number: 1,
              question_text: question.question_text,
              topic: question.topic || null,
              difficulty: question.difficulty_level || null,
              generated_from: "candidate_memory",
              asked_at: question.asked_at
            })
          });
        } catch (e) {
          console.warn("[INTERVIEW_PERSISTENCE] Initial question write failed.", e);
        }
      }
      return res.json({ status: "success", session });
    } catch (e: any) {
      console.error("Interview start error:", e);
      return res.status(500).json({ status: "error", code: "INTERVIEW_START_FAILED", message: e?.message || "Failed to start interview." });
    }
  });

  app.post("/api/v1/interview/:session_id/answer", async (req, res) => {
    const owned = await getOwnedInterviewSession(req, req.params.session_id);
    if (owned.error) return res.status(owned.error.status).json(owned.error.body);
    const session = owned.session;
    if (session.status === "paused") return res.status(409).json({ status: "error", code: "SESSION_PAUSED", message: "Resume the interview before answering." });
    if (session.status === "completed") return res.status(409).json({ status: "error", code: "SESSION_COMPLETED", message: "This interview is already completed." });
    const answer = String(req.body?.user_answer || "").trim();
    if (!answer) return res.status(400).json({ status: "error", code: "ANSWER_REQUIRED", message: "user_answer is required." });
    try {
      const q = session.current_question || {};
      const evaluationText = await safeGenerateContent({
        contents: `Evaluate this interview answer. Question: ${q.question_text || ""}\nAnswer: ${answer}\nReturn JSON only with score, is_strong_answer, evidence, strengths, weaknesses, recommened_remediation, communication_rating, confidence_rating, technical_score, problem_solving_score, grammar_score, fluency_score, professionalism_score, grammar_errors, recurring_communication_weaknesses. Score 0-100.`,
        config: { responseMimeType: "application/json", responseSchema: { type: "object", properties: {
          score: { type: "integer" }, is_strong_answer: { type: "boolean" }, evidence: { type: "string" }, strengths: { type: "array", items: { type: "string" } }, weaknesses: { type: "array", items: { type: "string" } }, recommened_remediation: { type: "string" }, communication_rating: { type: "integer" }, confidence_rating: { type: "integer" }, technical_score: { type: "integer" }, problem_solving_score: { type: "integer" }, grammar_score: { type: "integer" }, fluency_score: { type: "integer" }, professionalism_score: { type: "integer" }, grammar_errors: { type: "array", items: { type: "string" } }, recurring_communication_weaknesses: { type: "array", items: { type: "string" } }
        }}},
        fallbackJson: { score: 0, is_strong_answer: false, evidence: "AI evaluation is unavailable, so this answer was not scored.", strengths: [], weaknesses: [], recommened_remediation: "Retry evaluation when the AI service is available.", communication_rating: 0, confidence_rating: 0, technical_score: 0, problem_solving_score: 0, grammar_score: 0, fluency_score: 0, professionalism_score: 0, grammar_errors: [], recurring_communication_weaknesses: [] }
      });
      let evaluation: any;
      try { evaluation = JSON.parse(evaluationText); } catch { evaluation = { score: 0, is_strong_answer: false, strengths: [], weaknesses: [], communication_rating: 0, confidence_rating: 0, technical_score: 0, problem_solving_score: 0, grammar_score: 0, fluency_score: 0, professionalism_score: 0, grammar_errors: [], recurring_communication_weaknesses: [], recommened_remediation: "AI evaluation returned an invalid response. Retry when the service is available." }; }
      const historyItem = {
        ...q,
        user_answer: answer,
        evaluation,
        answered_at: new Date().toISOString(),
        persisted_question_id: q.persisted_question_id || crypto.randomUUID()
      };
      session.history = [...(session.history || []), historyItem];
      await persistInterviewEvidence(session, historyItem, session.current_question_index || session.history.length);
      const memory = await updateMemoryFromEvaluation(owned.authUser.uid, session, evaluation, q.topic || q.question_text || "general");
      if (session.current_question_index >= session.total_questions_limit) {
        const scores = session.history.map((h: any) => h.evaluation?.score || 0);
        const avg = scores.length ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length) : 0;
        const comm = session.history.map((h: any) => h.evaluation?.communication_rating || 0);
        const tech = session.history.map((h: any) => h.evaluation?.technical_score || h.evaluation?.score || 0);
        const report = {
          overall_score: avg,
          technical_knowledge_score: Math.round(tech.reduce((a: number,b: number)=>a+b,0)/(tech.length||1)),
          technical_knowledge_comment: "Technical performance was calculated from the evaluated answers.",
          communication_score: Math.round(comm.reduce((a: number,b: number)=>a+b,0)/(comm.length||1)),
          communication_comment: "Communication is evaluated across clarity, structure and delivery.",
          confidence_score: Math.round(session.history.reduce((a: number,h: any)=>a+(h.evaluation?.confidence_rating||0),0)/(session.history.length||1)),
          confidence_comment: "Confidence is estimated from answer delivery and structure.",
          problem_solving_score: Math.round(session.history.reduce((a: number,h: any)=>a+(h.evaluation?.problem_solving_score||0),0)/(session.history.length||1)),
          problem_solving_comment: "Problem solving is based on reasoning quality and trade-offs.",
          strengths: [...new Set(session.history.flatMap((h: any) => h.evaluation?.strengths || []))].slice(0,8),
          weaknesses: [...new Set(session.history.flatMap((h: any) => h.evaluation?.weaknesses || []))].slice(0,8),
          missed_concepts: [...new Set(session.history.flatMap((h: any) => h.evaluation?.weaknesses || []))].slice(0,8),
          suggested_improvements: memory.improvement_plan.slice(0,6).map(p => ({ area: p.topic, action: p.action })),
          company_readiness: { "General": `${avg}% readiness based on this session.` },
          role_readiness: { [String(memory.resume_profile?.targetRole || "Target Role")]: `${avg}% readiness based on this session.` },
          recommended_learning_plan: memory.improvement_plan.slice(0,5).map(p => ({ topic: p.topic, duration: `${p.estimated_minutes} min` }))
        };
        session.status = "completed";
        session.overall_report = report;
        session.completed_at = new Date().toISOString();
        session.current_question = undefined;
        memory.interview_history.push({ session_id: session.session_id, mode: session.interview_mode === "Resume Practice" ? "resume_practice" : "ai_mock", type: session.interview_type, score: avg, communication_score: report.communication_score, technical_score: report.technical_knowledge_score, topics: session.history.map((h: any) => h.topic || h.question_text).slice(0,20), created_at: session.created_at, completed_at: session.completed_at });
        memory.interview_history = memory.interview_history.slice(-50);
        await saveCandidateMemory(memory);
      } else {
        const nextQuestion = await generateAdaptiveQuestion(
          memory,
          session.interview_type,
          session.interview_mode,
          answer,
          q.question_text,
          (session.history || []).map((h: any) => String(h.question_text || "")).filter(Boolean)
        );
        session.current_question_index += 1;
        session.current_question = nextQuestion;
        session.difficulty = nextQuestion.difficulty_level;
      }
      await saveInterviewSession(session);
      return res.json({ status: "success", session, feedback: evaluation });
    } catch (e: any) {
      console.error("Interview answer error:", e);
      return res.status(500).json({ status: "error", code: "ANSWER_EVALUATION_FAILED", message: e?.message || "Failed to evaluate answer." });
    }
  });

  app.post("/api/v1/interview/:session_id/pause", async (req, res) => {
    const owned = await getOwnedInterviewSession(req, req.params.session_id);
    if (owned.error) return res.status(owned.error.status).json(owned.error.body);
    const session = owned.session;
    if (session.status !== "active") return res.status(409).json({ status: "error", code: "INVALID_STATE", message: "Only an active interview can be paused." });
    session.status = "paused"; session.paused_at = new Date().toISOString(); await saveInterviewSession(session);
    return res.json({ status: "success", session });
  });

  app.post("/api/v1/interview/:session_id/resume", async (req, res) => {
    const owned = await getOwnedInterviewSession(req, req.params.session_id);
    if (owned.error) return res.status(owned.error.status).json(owned.error.body);
    const session = owned.session;
    if (session.status !== "paused") return res.status(409).json({ status: "error", code: "INVALID_STATE", message: "Only a paused interview can be resumed." });
    if (session.paused_at) session.total_paused_seconds += Math.max(0, Math.round((Date.now() - new Date(session.paused_at).getTime()) / 1000));
    session.paused_at = null; session.status = "active"; session.resumed_at = new Date().toISOString(); await saveInterviewSession(session);
    return res.json({ status: "success", session });
  });

  app.post("/api/v1/interview/:session_id/finish", async (req, res) => {
    const owned = await getOwnedInterviewSession(req, req.params.session_id);
    if (owned.error) return res.status(owned.error.status).json(owned.error.body);
    const session = owned.session;
    if (session.status === "completed") return res.json({ status: "success", session });
    try {
      const history = session.history || [];
      const avg = history.length ? Math.round(history.reduce((a: number,h: any)=>a+(h.evaluation?.score||0),0)/history.length) : 0;
      const comm = history.length ? Math.round(history.reduce((a: number,h: any)=>a+(h.evaluation?.communication_rating||0),0)/history.length) : 0;
      const tech = history.length ? Math.round(history.reduce((a: number,h: any)=>a+(h.evaluation?.technical_score||h.evaluation?.score||0),0)/history.length) : 0;
      const memory = await getCandidateMemory(owned.authUser.uid);
      session.overall_report = {
        overall_score: avg, technical_knowledge_score: tech, technical_knowledge_comment: "Based on completed answers.",
        communication_score: comm, communication_comment: "Based on answer clarity and delivery.", confidence_score: Math.round(history.reduce((a:number,h:any)=>a+(h.evaluation?.confidence_rating||0),0)/(history.length||1)), confidence_comment: "Based on observed answer delivery.",
        problem_solving_score: Math.round(history.reduce((a:number,h:any)=>a+(h.evaluation?.problem_solving_score||0),0)/(history.length||1)), problem_solving_comment: "Based on reasoning quality.",
        strengths: [...new Set(history.flatMap((h:any)=>h.evaluation?.strengths||[]))].slice(0,8), weaknesses: [...new Set(history.flatMap((h:any)=>h.evaluation?.weaknesses||[]))].slice(0,8), missed_concepts: [...new Set(history.flatMap((h:any)=>h.evaluation?.weaknesses||[]))].slice(0,8),
        suggested_improvements: memory.improvement_plan.slice(0,6).map(p=>({area:p.topic,action:p.action})), company_readiness:{General:`${avg}%`}, role_readiness:{Target:`${avg}%`}, recommended_learning_plan:memory.improvement_plan.slice(0,5).map(p=>({topic:p.topic,duration:`${p.estimated_minutes} min`}))
      };
      session.status = "completed"; session.completed_at = new Date().toISOString(); await saveInterviewSession(session);
      memory.interview_history.push({ session_id: session.session_id, mode: session.interview_mode === "Resume Practice" ? "resume_practice" : "ai_mock", type: session.interview_type, score: avg, communication_score: comm, technical_score: tech, topics: history.map((h:any)=>h.topic||h.question_text).slice(0,20), created_at: session.created_at, completed_at: session.completed_at });
      memory.interview_history = memory.interview_history.slice(-50); await saveCandidateMemory(memory);
      return res.json({ status: "success", session });
    } catch (e:any) { return res.status(500).json({ status:"error", code:"FINISH_FAILED", message:e?.message||"Failed to finish interview." }); }
  });

  app.post("/api/v1/voice/analyze", async (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user) return res.status(401).json({ status: "error", code: "UNAUTHORIZED", message: "Authentication required." });
    const sessionId = String(req.body?.session_id || "");
    const owned = await getOwnedInterviewSession(req, sessionId);
    if (owned.error) return res.status(owned.error.status).json(owned.error.body);
    if (owned.session.status === "paused") return res.status(409).json({ status:"error", code:"SESSION_PAUSED", message:"Resume before voice analysis." });
    const transcript = String(req.body?.transcript || "").trim();
    if (!transcript) return res.status(400).json({ status:"error", code:"TRANSCRIPT_REQUIRED", message:"transcript is required." });
    const duration = Math.max(1, Number(req.body?.duration_seconds || 10));
    const words = transcript.split(/\s+/).filter(Boolean).length;
    const fillerMatches = transcript.toLowerCase().match(/\b(um|uh|like|actually|basically|you know|sort of)\b/g) || [];
    const reportText = await safeGenerateContent({
      contents: `Analyze this spoken interview transcript for English communication. Transcript: ${transcript}\nReturn JSON with grammarScore, pronunciationScore, vocabularyScore, fluencyScore, confidenceScore, clarityScore, professionalismScore, fillerWordsPerMinute, speakingSpeedWpm, grammarErrors, recurringWeaknesses, feedback.`,
      config: { responseMimeType:"application/json" },
      fallbackJson: { grammarScore: 0, pronunciationScore: 0, vocabularyScore: 0, fluencyScore: 0, confidenceScore: 0, clarityScore: 0, professionalismScore: 0, fillerWordsPerMinute: Math.round(fillerMatches.length/(duration/60)), speakingSpeedWpm: Math.round(words/(duration/60)), grammarErrors: [], recurringWeaknesses: [], feedback: "AI communication analysis is unavailable right now. No fabricated communication score was assigned." }
    });
    let analysis:any; try { analysis = JSON.parse(reportText); } catch { analysis = { grammarScore:0, pronunciationScore:0, vocabularyScore:0, fluencyScore:0, confidenceScore:0, clarityScore:0, professionalismScore:0, fillerWordsPerMinute:Math.round(fillerMatches.length/(duration/60)), speakingSpeedWpm:Math.round(words/(duration/60)), grammarErrors:[], recurringWeaknesses:[], feedback:"AI communication analysis returned an invalid response. No fabricated score was assigned." }; }
    const segment = { id:`voice_${crypto.randomUUID()}`, transcript, duration_seconds:duration, context_question:req.body?.context_question||"", ...analysis, created_at:new Date().toISOString() };
    owned.session.voice_segments = [...(owned.session.voice_segments||[]), segment]; await saveInterviewSession(owned.session);
    const memory = await getCandidateMemory(user.uid);
    const blend = (old:number,next:number)=>old>0?Math.round(old*.65+next*.35):next;
    memory.communication.grammar=blend(memory.communication.grammar,analysis.grammarScore); memory.communication.pronunciation=blend(memory.communication.pronunciation,analysis.pronunciationScore); memory.communication.vocabulary=blend(memory.communication.vocabulary,analysis.vocabularyScore); memory.communication.fluency=blend(memory.communication.fluency,analysis.fluencyScore); memory.communication.confidence=blend(memory.communication.confidence,analysis.confidenceScore); memory.communication.clarity=blend(memory.communication.clarity,analysis.clarityScore); memory.communication.professionalism=blend(memory.communication.professionalism,analysis.professionalismScore); memory.communication.filler_words_per_minute=analysis.fillerWordsPerMinute; memory.communication.speaking_speed_wpm=analysis.speakingSpeedWpm; memory.communication.sessions += 1;
    if (Array.isArray(analysis.recurringWeaknesses)) memory.communication.recurring_communication_weaknesses = [...new Set([...memory.communication.recurring_communication_weaknesses, ...analysis.recurringWeaknesses])].slice(-12);
    await saveCandidateMemory(memory);
    return res.json({ status:"success", segment });
  });

  app.get("/api/v1/voice/session/:session_id/report", async (req, res) => {
    const owned = await getOwnedInterviewSession(req, req.params.session_id); if (owned.error) return res.status(owned.error.status).json(owned.error.body);
    const segments = owned.session.voice_segments || [];
    const avg = (key:string) => segments.length ? Math.round(segments.reduce((a:number,s:any)=>a+Number(s[key]||0),0)/segments.length) : 0;
    return res.json({ status:"success", report:{ session_id:owned.session.session_id, segments, overall:{ grammar:avg("grammarScore"), pronunciation:avg("pronunciationScore"), vocabulary:avg("vocabularyScore"), fluency:avg("fluencyScore"), confidence:avg("confidenceScore"), clarity:avg("clarityScore"), professionalism:avg("professionalismScore") }, feedback: segments.length ? segments[segments.length-1].feedback : "No voice telemetry was submitted." } });
  });

  app.post("/api/v1/camera/session/:session_id/telemetry", async (req,res)=>{
    const owned=await getOwnedInterviewSession(req,req.params.session_id); if(owned.error)return res.status(owned.error.status).json(owned.error.body);
    owned.session.camera_metrics={samples:[...(owned.session.camera_metrics?.samples||[]),{...req.body,created_at:new Date().toISOString()}].slice(-300)}; await saveInterviewSession(owned.session); return res.json({status:"success"});
  });

  app.get("/api/v1/camera/session/:session_id/report", async (req,res)=>{
    const owned=await getOwnedInterviewSession(req,req.params.session_id); if(owned.error)return res.status(owned.error.status).json(owned.error.body);
    const samples=owned.session.camera_metrics?.samples||[]; const avg=(k:string)=>samples.length?Math.round(samples.reduce((a:number,s:any)=>a+Number(s[k]||0),0)/samples.length):0;
    return res.json({status:"success",report:{session_id:owned.session.session_id,samples_count:samples.length,metrics_summary:{confidence_score:avg("confidence"),clarity_score:avg("clarity"),gesture_score:avg("communication"),posture_score:avg("posture"),eye_contact_score:avg("eye_contact")},feedback:samples.length?"Behavior telemetry was collected during the interview.":"No camera telemetry was submitted by the active frontend."}});
  });

  // LLM proxy for coding problems AI recommendations
  app.post("/api/v1/coding/problems/recommend", async (req, res) => {
    try {
      const { resumeData, role, company, language, difficulty, mode, category, codingHistory, pastPerformance } = req.body;
      
      const defaultProblem = {
        id: "p_" + Date.now(),
        title: "Two Sum Target Identifier",
        slug: "two-sum-target-identifier",
        difficulty: difficulty || "Easy",
        category: category || "Arrays",
        companies: company ? [company] : ["Google", "Amazon", "Microsoft"],
        acceptance_rate: "84.2%",
        description: "Given an array of integers `nums` and an integer target `target`, return indices of the two numbers such that they add up to `target`.",
        constraints: ["1 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9", "-10^9 <= target <= 10^9"],
        templates: {
          [language ? language.toLowerCase() : "python"]: "# Write your solution here\ndef solve():\n    pass"
        },
        public_test_cases: [
          { input: "nums = [2,7,11,15], target = 9", expected_output: "[0,1]", explanation: "nums[0] + nums[1] = 9" }
        ],
        hidden_test_cases: [
          { input: "nums = [3,2,4], target = 6", expected_output: "[1,2]" }
        ],
        hints: [
          "Can you use a hash map to store the elements you have seen so far?",
          "Check if target - current_element exists in the hash map.",
          "This approach will yield an O(n) time complexity."
        ],
        solution: "Use a hash map to map values to their indices."
      };

      const systemPrompt = `You are an expert technical interviewer and coding instructor.
YOUR TASK: Generate a highly relevant coding practice problem based on the candidate's profile and request.

INPUT CONTEXT:
Resume: ${JSON.stringify(resumeData || {})}
Target Role: ${role || 'Software Engineer'}
Target Company: ${company || 'Tech Company'}
Requested Language: ${language || 'Python'}
Difficulty Level: ${difficulty || 'Medium'}
Practice Mode: ${mode || 'Practice'}
Requested Category/Topic: ${category || 'Any'}
Candidate Past Coding Performance (Strong/Weak areas): ${JSON.stringify(pastPerformance || {})}
Recent Problems Attempted (Do not repeat these): ${JSON.stringify(codingHistory || [])}

INSTRUCTIONS:
1. If Practice Mode is "Resume Practice", you MUST create a problem directly inspired by one of their projects, work experience, or specific technical skills (e.g. React, Spring Boot, SQL, Machine Learning) listed in the resume.
2. If Practice Mode is "Company Practice", adapt the problem to the style of ${company}.
3. If Practice Mode is "Debugging", provide a broken piece of code and ask them to fix it.
4. If Practice Mode is "SQL Practice", provide database tables and a SQL query problem.
5. Consider the candidate's past performance. If they are weak in a topic, provide practice for it.
6. The problem must have 3 clear hints (Hint 1: Conceptual, Hint 2: Directional, Hint 3: Approach).
7. Provide at least 2 public test cases (with explanation) and 2 hidden test cases.
8. Provide the starting code template for the requested language (${language}).
`;

      const text = await safeGenerateContent({
        contents: systemPrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              problem: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  difficulty: { type: "string" },
                  category: { type: "string" },
                  description: { type: "string" },
                  constraints: { type: "array", items: { type: "string" } },
                  templates: {
                    type: "object",
                    properties: {
                      [language ? language.toLowerCase() : "python"]: { type: "string" },
                      javascript: { type: "string" },
                      java: { type: "string" },
                      cpp: { type: "string" },
                      sql: { type: "string" }
                    }
                  },
                  public_test_cases: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        input: { type: "string" },
                        expected_output: { type: "string" },
                        explanation: { type: "string" }
                      },
                      required: ["input", "expected_output"]
                    }
                  },
                  hidden_test_cases: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        input: { type: "string" },
                        expected_output: { type: "string" }
                      },
                      required: ["input", "expected_output"]
                    }
                  },
                  hints: {
                    type: "array",
                    items: { type: "string" }
                  },
                  solution: { type: "string" }
                },
                required: ["title", "description", "public_test_cases", "hints", "solution"]
              }
            }
          }
        },
        fallbackJson: { problem: defaultProblem }
      });

      let problemObj = defaultProblem;
      try {
        const parsed = JSON.parse(text);
        if (parsed?.problem?.title) {
          problemObj = {
            ...defaultProblem,
            ...parsed.problem,
            id: "p_" + Date.now()
          };
        }
      } catch (e) {
        console.error("Parse error for coding problem", e);
      }
      
      res.json({ status: "success", problem: problemObj });
    } catch (error: any) {
      console.error("Coding recommend error:", error);
      res.json({ status: "error", problem: null });
    }
  });

  // Chat completion endpoint
  
  app.post("/api/v1/resume/analyze", async (req, res) => {
    try {
      const { raw_text, file_name } = req.body;
      if (!raw_text) {
        return res.status(400).json({ status: "error", message: "raw_text is required" });
      }

      const prompt = `You are an expert AI Resume Analyzer. Your task is to extract information from the complete resume text below and create a comprehensive candidate profile.

INSTRUCTIONS:
1. Read the COMPLETE resume.
2. Find and organize all of the following:
   - Name
   - Education, Degree, College, Graduation year
   - Work experience (all roles, companies, durations, descriptions)
   - Internships (all roles, companies, durations, descriptions)
   - Projects (read all projects, not just the first one. Include title, description, and tools/tech stack for each)
   - Technical skills (organize into Programming languages, Frameworks, Databases, Tools)
   - Certifications
   - Achievements
   - Soft skills
3. Identify the most suitable job role from the resume (e.g., Full Stack Developer, Data Analyst, Software Engineer).
4. Do NOT generate interview questions yet. Do NOT start the interview. Only analyze the resume.
5. Provide the output strictly in the exact JSON schema provided.

RESUME TEXT:
${raw_text.substring(0, 15000)} // Truncate to avoid token limits if extremely long
`;

      const responseSchema = {
        type: "object",
        properties: {
          atsScore: { type: "integer" },
          overallFeedback: { type: "string" },
          strengths: { type: "array", items: { type: "string" } },
          weaknesses: { type: "array", items: { type: "string" } },
          keywordsMatched: { type: "array", items: { type: "string" } },
          missingKeywords: { type: "array", items: { type: "string" } },
          suggestions: { type: "array", items: { type: "string" } },
          skills: { type: "array", items: { type: "string" } },
          experience: { type: "string" },
          education: { type: "string" },
          profession: { type: "string" },
          degree: { type: "string" },
          domain: { type: "string" },
          projects: { 
            type: "array", 
            items: { 
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                tools: { type: "array", items: { type: "string" } }
              },
              required: ["title", "description"]
            }
          },
          certifications: { type: "array", items: { type: "string" } },
          targetRole: { type: "string" },
          personalInfo: {
            type: "object",
            properties: {
              fullName: { type: "string" },
              email: { type: "string" },
              phone: { type: "string" },
              college: { type: "string" },
              degree: { type: "string" },
              branch: { type: "string" },
              graduationYear: { type: "string" }
            },
            required: ["fullName"]
          },
          skillsAnalysis: {
            type: "object",
            properties: {
              programmingLanguages: { type: "array", items: { type: "string" } },
              frameworks: { type: "array", items: { type: "string" } },
              tools: { type: "array", items: { type: "string" } },
              databases: { type: "array", items: { type: "string" } },
              cloud: { type: "array", items: { type: "string" } },
              softSkills: { type: "array", items: { type: "string" } }
            }
          },
          workExperience: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                company: { type: "string" },
                description: { type: "string" },
                duration: { type: "string" }
              },
              required: ["title", "company"]
            }
          },
          internships: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                company: { type: "string" },
                description: { type: "string" },
                duration: { type: "string" }
              },
              required: ["title", "company"]
            }
          },
          achievements: { type: "array", items: { type: "string" } },
          projectsAnalysis: { 
            type: "array", 
            items: { 
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                techStack: { type: "array", items: { type: "string" } }
              }
            }
          },
          candidateProfile: {
            type: "object",
            properties: {
              candidateCategory: { type: "string" },
              targetRoles: { type: "array", items: { type: "string" } },
              confidenceLevel: { type: "integer" }
            }
          },
          recommendedLearningPath: {
            type: "array",
            items: {
              type: "object",
              properties: {
                topic: { type: "string" },
                duration: { type: "string" }
              }
            }
          },
          customQuestions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                question_id: { type: "string" },
                round_name: { type: "string" },
                question_text: { type: "string" },
                difficulty_level: { type: "string" },
                resume_topic: { type: "string" },
                expected_answer: { type: "string" }
              }
            }
          }
        },
        required: [
          "atsScore", "overallFeedback", "strengths", "weaknesses", "keywordsMatched", 
          "missingKeywords", "suggestions", "skills", "experience", "education", 
          "profession", "degree", "domain", "projects", "certifications", "targetRole", 
          "personalInfo", "skillsAnalysis", "candidateProfile"
        ]
      };

      const fallbackJson = {
        atsScore: 0,
        overallFeedback: "Resume analysis is temporarily unavailable. No resume-derived score was fabricated.",
        strengths: [],
        weaknesses: [],
        keywordsMatched: [],
        missingKeywords: [],
        suggestions: [],
        skills: [],
        experience: "",
        education: "",
        profession: "",
        degree: "",
        domain: "",
        projects: [],
        certifications: [],
        targetRole: "",
        personalInfo: {
          fullName: "Candidate",
          email: "",
          phone: "",
          college: "",
          degree: "",
          branch: "",
          graduationYear: ""
        },
        skillsAnalysis: {
          programmingLanguages: [],
          frameworks: [],
          tools: [],
          databases: [],
          cloud: [],
          softSkills: []
        },
        workExperience: [],
        internships: [],
        achievements: [],
        projectsAnalysis: [],
        candidateProfile: {
          candidateCategory: "Junior",
          targetRoles: ["Software Engineer"],
          confidenceLevel: 70
        },
        recommendedLearningPath: [],
        customQuestions: []
      };

      const analysisText = await safeGenerateContent({
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: responseSchema
        },
        fallbackJson: fallbackJson
      });

      let analysisJson = fallbackJson;
      try {
        analysisJson = typeof analysisText === "string" ? JSON.parse(analysisText) : analysisText;
      } catch (e) {
        console.error("Failed to parse AI resume analysis JSON", e);
      }

      // Ensure customQuestions is at least empty array so frontend doesn't crash
      if (!analysisJson.customQuestions) {
        analysisJson.customQuestions = [];
      }

      // Persist resume intelligence into the same account-level Candidate Memory.
      const resumeUser = getAuthenticatedUser(req);
      if (resumeUser) {
        const memory = await getCandidateMemory(resumeUser.uid);
        memory.resume_profile = { ...memory.resume_profile, ...analysisJson, file_name };
        memory.resume_versions.push({ file_name, atsScore: analysisJson.atsScore, targetRole: analysisJson.targetRole, uploaded_at: new Date().toISOString() });
        const resumeSkills = Array.isArray(analysisJson.skills) ? analysisJson.skills : [];
        resumeSkills.forEach((skill: string) => {
          const current = memory.skills[skill] || { score: 70, confidence: 0.35, evidence_count: 0, last_assessed_at: null };
          memory.skills[skill] = { ...current, evidence_count: current.evidence_count + 1 };
        });
        if (Array.isArray(analysisJson.strengths)) analysisJson.strengths.slice(0, 8).forEach((x: string) => memory.strengths.push({ text: x, category: "resume", confidence: 0.55, evidence_count: 1, last_observed_at: new Date().toISOString() }));
        if (Array.isArray(analysisJson.weaknesses)) analysisJson.weaknesses.slice(0, 8).forEach((x: string) => memory.weaknesses.push({ text: x, category: "resume", severity: 50, confidence: 0.55, evidence_count: 1, improvement_status: "active", last_observed_at: new Date().toISOString() }));
        memory.readiness.resume_alignment = Number(analysisJson.atsScore || 0);
        memory.resume_versions = memory.resume_versions.slice(-20);
        await saveCandidateMemory(memory);
        if (supabaseConfigured()) {
          try {
            const candidateRows = await supabaseFetch(`candidates?user_id=eq.${encodeURIComponent(resumeUser.uid)}&limit=1`);
            const candidateId = Array.isArray(candidateRows) && candidateRows[0]?.id;
            if (candidateId) {
              await supabaseFetch("candidate_resumes", {
                method: "POST",
                body: JSON.stringify({ candidate_id: candidateId, file_name, raw_text: raw_text, parsed_profile: analysisJson, ats_score: Number(analysisJson.atsScore || 0), is_current: true })
              });
            }
          } catch (e) {
            console.warn("[CANDIDATE_MEMORY] Resume persistence failed; memory snapshot remains available.", e);
          }
        }
      }

      res.json({
        status: "success",
        analysis: analysisJson
      });
    } catch (e) {
      console.error("Resume analysis error:", e);
      res.status(500).json({ status: "error", message: e.message });
    }
  });

  
  app.post("/api/v1/coding/evaluate", async (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user) return res.status(401).json({ status: "error", code: "UNAUTHORIZED", message: "Authentication required." });
    try {
      const { code, language, problem, customInput } = req.body;
      
      const systemPrompt = `You are an expert technical interviewer and code evaluator.
YOUR TASK: Evaluate the candidate's code submission for the given problem.

Problem: ${JSON.stringify(problem)}
Language: ${language}
Candidate Code:
${code}
${customInput ? 'Custom Input:\n' + customInput : ''}

INSTRUCTIONS:
1. Determine if the code correctly solves the problem.
2. If there's a syntax error, provide the error message.
3. Check the public and hidden test cases provided in the problem description.
4. Estimate Time Complexity and Space Complexity.
5. Provide brief feedback on code quality, readability, and efficiency.
6. Score the correctness from 0 to 100.
`;

      const text = await safeGenerateContent({
        contents: systemPrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              evaluation: {
                type: "object",
                properties: {
                  status: { type: "string", enum: ["Accepted", "Wrong Answer", "Runtime Error", "Compilation Error", "Time Limit Exceeded"] },
                  correctness_score: { type: "integer" },
                  time_complexity: { type: "string" },
                  space_complexity: { type: "string" },
                  code_quality: { type: "string" },
                  feedback: { type: "string" },
                  better_approach: { type: "string" },
                  test_cases_passed: { type: "integer" },
                  total_test_cases: { type: "integer" },
                  error_message: { type: "string" },
                  output: { type: "string" }
                },
                required: ["status", "correctness_score", "time_complexity", "space_complexity", "feedback", "test_cases_passed", "total_test_cases", "output"]
              }
            }
          }
        },
        fallbackJson: {
          evaluation: {
            status: "Evaluation Unavailable",
            correctness_score: 0,
            time_complexity: "Not evaluated",
            space_complexity: "Not evaluated",
            code_quality: "Not evaluated",
            feedback: "AI evaluation is unavailable right now. Your code was not assigned a fabricated score.",
            better_approach: "Try again when the AI evaluator is available.",
            test_cases_passed: 0,
            total_test_cases: 0,
            error_message: "AI evaluator unavailable",
            output: "Not evaluated"
          }
        }
      });

      let evaluation = {};
      try {
        const parsed = JSON.parse(text);
        evaluation = parsed.evaluation;
      } catch (e) {
        evaluation = {
          status: "Evaluation Unavailable",
          correctness_score: 0,
          time_complexity: "Not evaluated",
          space_complexity: "Not evaluated",
          code_quality: "Not evaluated",
          feedback: "The AI evaluator returned an invalid response. No fabricated score was assigned.",
          better_approach: "Try the evaluation again when the AI service is available.",
          test_cases_passed: 0,
          total_test_cases: 0,
          error_message: "Invalid evaluator response",
          output: "Not evaluated"
        };
      }
      
      res.json({ status: "success", evaluation });
    } catch (error) {
      console.error("Coding evaluate error:", error);
      res.json({ status: "error", evaluation: null });
    }
  });

  app.post("/api/v1/chat", async (req, res) => {
    try {
      const { prompt, history } = req.body;
      const contents = [
        ...(history || []),
        { role: "user", content: prompt || "Hello" }
      ];

      const answer = await safeGenerateContent({
        contents,
        fallbackText: "I am your AI Interview Coach. Focus on explaining core technical concepts, describing algorithmic complexity, and stating architectural trade-offs."
      });

      res.json({ status: "success", answer });
    } catch (error: any) {
      console.error("Chat API error:", error);
      res.json({
        status: "success",
        answer: "I am your AI Interview Coach. Let's practice articulating your technical answer clearly using the STAR method."
      });
    }
  });

  // Dedicated App Assistant Chatbot Endpoint
  app.post("/api/v1/app-assistant", async (req, res) => {
    try {
      const { prompt, history, currentTab, atsScore, resumeFileName } = req.body;
      const systemInstruction = `You are the friendly, expert AI Assistant for Interview Cracker 2026.
You know everything about the application and help candidates excel in technical, behavioral, and domain mock interviews.

APP FEATURE KNOWLEDGE BASE:
1. RESUME & ATS ENGINE:
- Candidates upload their resume (PDF, DOCX, TXT up to 10MB) or paste raw text.
- The ATS Scanner calculates a score out of 100 based on structure, technical skills, missing keywords, active verbs, and quantitative achievements.
- IMPORTANT: Once a resume is uploaded, it remains permanently saved in persistent storage until the user manually clicks "Remove Resume" / "Upload New Resume".
- The ATS Score (e.g. 84/100) and analysis DO NOT reset or change when navigating between tabs or going back and forth!
- Candidates can launch an AI practice interview directly using their saved resume without re-uploading every time.

2. VOICE & INTERVIEWER PERSONA SETTINGS:
- Accessible under the Settings tab.
- Candidates can select AI Interviewers with different avatars, roles, and accents:
  * Sarah (Senior Tech Recruiter - Professional & Natural, US)
  * David (Principal Architect - Articulate & Formal, UK)
  * Elena (AI Research Lead - Expressive & Insightful, EU)
  * Marcus (Engineering Director - Executive Deep, US)
  * Priya (Staff Engineer - Clear & Technical, IN)
  * James (DevOps Specialist - Conversational & Crisp, AU)
- Candidates can fine-tune voice pitch (0.7x - 1.3x) and speaking speed (0.7x - 1.3x), and test voice playback.

3. AI PRACTICE INTERVIEW ROOMS:
- Supports real-time speech-to-text transcription and speech synthesis audio playback.
- Integrated camera feed telemetry overlay for facial expression & posture monitoring.
- Dynamically poses STAR-method technical, behavioral, and system design questions tailored to the candidate's uploaded resume or chosen domain.
- Generates post-interview diagnostic reports with scoring radar, detailed question breakdowns, and improvement tips.

4. CODING & ALGORITHM PRACTICE:
- Code editor supporting multiple programming languages (TypeScript, Python, Java, C++) with public test cases and algorithmic challenge execution.

CURRENT CANDIDATE CONTEXT:
- Active Dashboard Tab: ${currentTab || "overview"}
- Saved ATS Score: ${atsScore ? `${atsScore}/100` : "No resume uploaded yet"}
- Active Resume File: ${resumeFileName || "None"}

INSTRUCTIONS FOR RESPONDING:
- Be concise, clear, encouraging, and structured (use bolding and bullet points where appropriate).
- If the user asks about ATS scores, explain how it's calculated and reassure them that their score stays saved until manually removed.
- If the user asks how to start an interview, guide them to click "Launch Resume Practice Session" or go to the AI Interview Workspace.
- If the user asks about voice options, direct them to the Settings tab to test and customize interviewer personas.`;

      const contents = [
        { role: "user", parts: [{ text: systemInstruction }] },
        ...(history || []).map((h: any) => ({
          role: h.role === "assistant" ? "model" : "user",
          parts: [{ text: h.content || h.text || " " }]
        })),
        { role: "user", parts: [{ text: prompt || "Hello" }] }
      ];

      const answer = await safeGenerateContent({
        contents,
        fallbackText: "Hello! I am your Interview Cracker AI Assistant. I can help you understand your ATS score, customize interviewer voices in Settings, launch resume-based mock interviews, or practice coding problems. How can I help you today?"
      });

      res.json({ status: "success", answer });
    } catch (error: any) {
      console.error("App Assistant API error:", error);
      res.json({
        status: "success",
        answer: "Hello! I am your Interview Cracker AI Assistant. You can upload your resume to get a permanent ATS score out of 100, customize interviewer voices under Settings, and launch AI mock interviews anytime!"
      });
    }
  });

  // ---------------------------------------------------------------------------
  // AI Portfolio Builder API
  // ---------------------------------------------------------------------------
  const portfolioFile = path.join(dataDir, "portfolios.json");
  const deploymentsFile = path.join(dataDir, "portfolio_deployments.json");

  const portfolioDefaults = (user: any) => ({
    user_id: user.uid,
    profile: {
      fullName: user.displayName || "Candidate",
      college: "",
      branch: "",
      cgpa: "",
      graduationYear: "",
      skills: "",
      achievements: ""
    },
    theme: {
      theme_name: "Minimal",
      primary_color: "#18181b",
      accent_color: "#71717a",
      font_sans: "Inter",
      font_display: "Inter",
      card_style: "flat",
      bg_style: "solid",
      dark_mode: false,
      sections_order: ["hero", "about", "skills", "projects", "coding", "interview", "contact"],
      hidden_sections: []
    },
    content: {
      headline: "Software Engineer",
      professional_bio: "",
      about_me: "",
      career_objective: "",
      skills_description: "",
      seo: {
        title: `${user.displayName || "Candidate"} | Portfolio`,
        description: "Professional portfolio generated with Interview Cracker.",
        open_graph_title: `${user.displayName || "Candidate"} | Portfolio`,
        open_graph_desc: "Professional portfolio generated with Interview Cracker.",
        robots_txt: "User-agent: *\\nAllow: /",
        structured_data: "{}",
        sitemap_xml: ""
      }
    },
    projects: [],
    social_links: { github: "", linkedin: "", email: user.email || "", phone: "" },
    coding_stats: { coding_score: 0, problems_solved: 0, company_readiness: "New" },
    interview_analytics: { communication: 0, technical: 0, confidence: 0, overall_readiness: 0 }
  });

  const getPortfolio = (uid: string, user?: any) => {
    const base = portfolioDefaults(user || { uid, displayName: "Candidate", email: "" });
    const row = db.prepare(`SELECT payload_json FROM portfolios WHERE user_id = ?`).get(uid) as any;
    if (row?.payload_json) {
      try {
        const existing = JSON.parse(String(row.payload_json));
        return {
          ...base,
          ...existing,
          user_id: uid,
          profile: { ...base.profile, ...(existing.profile || {}) },
          theme: { ...base.theme, ...(existing.theme || {}) },
          content: { ...base.content, ...(existing.content || {}), seo: { ...base.content.seo, ...(existing.content?.seo || {}) } },
          social_links: { ...base.social_links, ...(existing.social_links || {}) },
          coding_stats: { ...base.coding_stats, ...(existing.coding_stats || {}) },
          interview_analytics: { ...base.interview_analytics, ...(existing.interview_analytics || {}) }
        };
      } catch {}
    }

    const legacyAll = readJsonArrayOrObject(portfolioFile, {});
    const legacy = legacyAll?.[uid];
    if (legacy) {
      const migrated = {
        ...base,
        ...legacy,
        user_id: uid,
        profile: { ...base.profile, ...(legacy.profile || {}) },
        theme: { ...base.theme, ...(legacy.theme || {}) },
        content: { ...base.content, ...(legacy.content || {}), seo: { ...base.content.seo, ...(legacy.content?.seo || {}) } },
        social_links: { ...base.social_links, ...(legacy.social_links || {}) },
        coding_stats: { ...base.coding_stats, ...(legacy.coding_stats || {}) },
        interview_analytics: { ...base.interview_analytics, ...(legacy.interview_analytics || {}) }
      };
      db.prepare(`INSERT OR REPLACE INTO portfolios (user_id,payload_json,updated_at) VALUES (?,?,?)`).run(uid, JSON.stringify(migrated), migrated.updated_at || new Date().toISOString());
      return migrated;
    }
    return base;
  };

  const savePortfolio = (portfolio: any) => {
    const saved = { ...portfolio, updated_at: new Date().toISOString() };
    db.prepare(`INSERT OR REPLACE INTO portfolios (user_id,payload_json,updated_at) VALUES (?,?,?)`).run(saved.user_id, JSON.stringify(saved), saved.updated_at);
    return saved;
  };

  const requirePortfolioUser = (req: express.Request, res: express.Response) => {
    const user = getAuthenticatedUser(req);
    if (!user) {
      res.status(401).json({ status: "error", code: "UNAUTHORIZED", message: "Authentication required." });
      return null;
    }
    return user;
  };

  app.get("/api/v1/portfolio", (req, res) => {
    const user = requirePortfolioUser(req, res);
    if (!user) return;
    return res.json({ status: "success", portfolio: savePortfolio(getPortfolio(user.uid, user)) });
  });

  app.get("/api/v1/portfolio/deployments", (req, res) => {
    const user = requirePortfolioUser(req, res);
    if (!user) return;
    const rows = db.prepare(`SELECT payload_json FROM portfolio_deployments WHERE user_id = ? ORDER BY id DESC LIMIT 20`).all(user.uid) as any[];
    const deployments = rows.map((row) => {
      try { return JSON.parse(String(row.payload_json)); } catch { return null; }
    }).filter(Boolean);
    if (deployments.length === 0) {
      const legacyAll = readJsonArrayOrObject(deploymentsFile, {});
      return res.json({ status: "success", deployments: Array.isArray(legacyAll?.[user.uid]) ? legacyAll[user.uid] : [] });
    }
    return res.json({ status: "success", deployments });
  });

  app.post("/api/v1/portfolio/theme", (req, res) => {
    const user = requirePortfolioUser(req, res);
    if (!user) return;
    const portfolio = getPortfolio(user.uid, user);
    portfolio.theme = { ...portfolio.theme, ...(req.body?.theme || {}) };
    return res.json({ status: "success", portfolio: savePortfolio(portfolio) });
  });

  app.post("/api/v1/portfolio/content", (req, res) => {
    const user = requirePortfolioUser(req, res);
    if (!user) return;
    const portfolio = getPortfolio(user.uid, user);
    portfolio.content = { ...portfolio.content, ...(req.body?.content || {}) };
    if (req.body?.content?.seo) portfolio.content.seo = { ...getPortfolio(user.uid, user).content.seo, ...req.body.content.seo };
    return res.json({ status: "success", portfolio: savePortfolio(portfolio) });
  });

  app.post("/api/v1/portfolio/projects", (req, res) => {
    const user = requirePortfolioUser(req, res);
    if (!user) return;
    if (!Array.isArray(req.body?.projects)) return res.status(400).json({ status: "error", message: "projects must be an array." });
    const portfolio = getPortfolio(user.uid, user);
    portfolio.projects = req.body.projects.slice(0, 30);
    return res.json({ status: "success", portfolio: savePortfolio(portfolio) });
  });

  app.post("/api/v1/portfolio/socials", (req, res) => {
    const user = requirePortfolioUser(req, res);
    if (!user) return;
    const portfolio = getPortfolio(user.uid, user);
    portfolio.social_links = { ...portfolio.social_links, ...(req.body?.social_links || {}) };
    return res.json({ status: "success", portfolio: savePortfolio(portfolio) });
  });

  app.post("/api/v1/portfolio/sections", (req, res) => {
    const user = requirePortfolioUser(req, res);
    if (!user) return;
    const order = Array.isArray(req.body?.sections_order) ? req.body.sections_order : [];
    const hidden = Array.isArray(req.body?.hidden_sections) ? req.body.hidden_sections : [];
    const portfolio = getPortfolio(user.uid, user);
    portfolio.theme.sections_order = order.length ? order : portfolio.theme.sections_order;
    portfolio.theme.hidden_sections = hidden;
    return res.json({ status: "success", portfolio: savePortfolio(portfolio) });
  });

  app.post("/api/v1/portfolio/generate", async (req, res) => {
    const user = requirePortfolioUser(req, res);
    if (!user) return;
    try {
      const profile = req.body?.profile || {};
      const portfolio = getPortfolio(user.uid, user);
      const prompt = `Create concise portfolio content for a student/candidate. Return JSON with headline, professional_bio, about_me, career_objective, skills_description, and projects (array of title, description, role, duration, technologies, features, github_link, live_demo_link). Do not invent employers, degrees, metrics, links, or achievements not present in this profile. Profile: ${JSON.stringify(profile)}`;
      const text = await generateRequiredAI({
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              headline: { type: "string" },
              professional_bio: { type: "string" },
              about_me: { type: "string" },
              career_objective: { type: "string" },
              skills_description: { type: "string" },
              projects: { type: "array", items: { type: "object" } }
            },
            required: ["headline", "professional_bio", "about_me", "career_objective", "skills_description", "projects"]
          }
        }
      });
      const generated = JSON.parse(text);
      portfolio.profile = { ...portfolio.profile, ...profile };
      portfolio.content = {
        ...portfolio.content,
        headline: generated.headline || portfolio.content.headline,
        professional_bio: generated.professional_bio || portfolio.content.professional_bio,
        about_me: generated.about_me || portfolio.content.about_me,
        career_objective: generated.career_objective || portfolio.content.career_objective,
        skills_description: generated.skills_description || portfolio.content.skills_description
      };
      if (Array.isArray(generated.projects) && generated.projects.length) portfolio.projects = generated.projects;
      return res.json({ status: "success", portfolio: savePortfolio(portfolio) });
    } catch (error: any) {
      console.error("Portfolio generation error:", error);
      return res.status(503).json({ status: "error", code: "AI_UNAVAILABLE", message: "AI portfolio generation is unavailable. Check GEMINI_API_KEY/quota and try again." });
    }
  });

  app.post("/api/v1/portfolio/deploy", (req, res) => {
    const user = requirePortfolioUser(req, res);
    if (!user) return;
    const platform = String(req.body?.platform || "Vercel").trim() || "Vercel";
    const portfolio = getPortfolio(user.uid, user);
    const slug = (portfolio.content.seo.title || user.displayName || "portfolio").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 32) || "portfolio";
    const deployment = {
      id: crypto.randomUUID(),
      platform,
      status: "simulated",
      url: `https://${slug}.example.com/`,
      created_at: new Date().toISOString(),
      logs: [
        "Validating portfolio configuration...",
        "Building static portfolio preview...",
        `Deployment simulation complete for ${platform}.`,
        "No external cloud credentials were used."
      ]
    };
    db.prepare(`INSERT INTO portfolio_deployments (user_id,payload_json,created_at) VALUES (?,?,?)`).run(user.uid, JSON.stringify({ ...deployment, user_id: user.uid }), deployment.created_at);
    return res.json({ status: "success", deployment });
  });

  // Senior FAANG Technical Interviewer Evaluation Endpoint
  app.post("/api/v1/interview/evaluate", async (req, res) => {
    try {
      const { question, user_answer, expected_answer, company, role, difficulty, thinkingMode, interviewerName, resumeData, conversationHistory, pastInterviewHistory } = req.body;
      const userAnsTrimmed = (user_answer || "").trim();
      const lowerAns = userAnsTrimmed.toLowerCase();
      // Check if candidate provided no response, said "I don't know", "skip", "pass", "idk", or requested next question
      const isIgnorantOrSkip =
        !userAnsTrimmed ||
        lowerAns.length < 5 ||
        lowerAns === "candidate provided concise response." ||
        lowerAns === "(no answer provided / candidate silent)" ||
        lowerAns.includes("don't know") ||
        lowerAns.includes("dont know") ||
        lowerAns.includes("no idea") ||
        lowerAns.includes("idk") ||
        lowerAns === "skip" ||
        lowerAns === "pass" ||
        lowerAns.includes("next question") ||
        lowerAns.includes("requested next interview question");

      if (isIgnorantOrSkip) {
        return res.json({
          status: "success",
          evaluation: {
            is_correct: "Incorrect",
            technical_accuracy: 0,
            communication: 0,
            problem_solving: 0,
            confidence: 0,
            overall_score: 0,
            strengths: [],
            weaknesses: ["Candidate did not provide a technical solution or requested to skip."],
            expected_answer: expected_answer || "Candidate should explain the complete technical architecture, key trade-offs, and implementation mechanics.",
            constructive_feedback: "No solution provided or candidate skipped. Score: 0/100.",
            spoken_feedback: "I understand. Let's move on to something else.",
            next_question_text: "Can you tell me about a different project you are proud of?"
          }
        });
      }

      
      let personalityPrompt = "";
      if (interviewerName === "Emma") {
        personalityPrompt = "You are Emma: Friendly, warm, constantly smiling in your tone. Encourage the candidate and give them confidence. Your feedback should be very supportive and kind.";
      } else if (interviewerName === "Sophia") {
        personalityPrompt = "You are Sophia: Highly technical, you ask detailed questions and focus heavily on underlying concepts and theoretical correctness.";
      } else if (interviewerName === "Daniel") {
        personalityPrompt = "You are Daniel: Very serious, strict engineering mindset. You challenge the candidate, push back on their assumptions, and demand rigorous answers.";
      } else if (interviewerName === "James") {
        personalityPrompt = "You are James: Heavily coding focused, you love problem solving and algorithmic efficiency. You care about edge cases and code optimization.";
      } else if (interviewerName === "Olivia") {
        personalityPrompt = "You are Olivia: Focused on communication, leadership, and teamwork. You look for behavioral cues, collaboration skills, and how they handle conflict.";
      } else {
        personalityPrompt = "You are a professional, expert Senior Interviewer.";
      }

      const systemPrompt = `${personalityPrompt}
You are evaluating a candidate for a ${role || "Software Engineer"} position at ${company || "a tech company"}.

CANDIDATE COMPLETE PROFILE (RESUME):
${JSON.stringify(resumeData || {}, null, 2)}

PAST INTERVIEW HISTORY (Use this to avoid repeating questions from past interviews, track progress, and focus on weak areas):
${JSON.stringify(pastInterviewHistory || [], null, 2)}

CONVERSATION HISTORY SO FAR:
${JSON.stringify(conversationHistory || [], null, 2)}

YOUR TASK:
First, analyze the COMPLETE resume to create an internal candidate profile. The profile must contain all important areas found in the resume: Education, Degree, College, Internship, Work experience, Projects, Programming languages, Technical skills, Frameworks, Libraries, Databases, Cloud technologies, Networking, DBMS, Operating Systems, Tools, Certifications, Achievements, Soft skills, and Other important resume information.
Then, create an internal interview plan from this complete profile.
Keep track of Topics already discussed, Topics not discussed yet, Projects already discussed, Skills already discussed, Questions already asked, Follow-up questions already asked.

CRITICAL INSTRUCTIONS FOR NEXT QUESTION:
- Do NOT keep asking about the same project. Projects are only ONE part of the interview.
- Do NOT keep asking about the same skill or technology.
- Do NOT keep following only the last thing the candidate mentioned. After 1 or 2 natural follow-up questions about a topic, MOVE TO ANOTHER IMPORTANT AREA from the resume (e.g., if you discussed a project, move to Education, or Databases, or Networking, etc).
- Read the PAST INTERVIEW HISTORY. Do not repeat the exact same questions unnecessarily. Give extra practice to weak areas. Reduce repeated questions about areas where the candidate already performed well. Compare the new performance with the previous performance.
- The interview must cover multiple areas of the resume (Background, Education, Experience, Different projects, Technologies, Important technical subjects, Behavioral skills, Role-related knowledge, Company-related topics).
- Do not ask about random technologies not in the resume unless directly required for the selected role.
- Keep the conversation natural.

Question asked: "${question || ""}"
Candidate's actual response: "${userAnsTrimmed}"

CRITICAL IMPORTANT FOR EVALUATION:
- Do not give a good score just because the candidate spoke. If the candidate repeats the question, says "I don't know", or gives a non-answer, mark actually_answered as false and score as 0. Evaluate the actual content of the answer.

INSTRUCTIONS FOR EVALUATION:
1. SCORING SCALE: "Correct" (75-98), "Partially Correct" (40-74), "Incorrect/Unrelated" (0).
1b. PERSONALITY: When generating spoken_feedback and next_question_text, deeply adopt your persona.
2. "spoken_feedback": EXACTLY 1 TO 2 BRIEF NATURAL SENTENCES acknowledging their answer like a real human. NEVER ask a question here.
3. "next_question_text": Generate the SINGLE NEXT QUESTION based on the complete resume, the role, the company, topics already covered, and the candidate's previous answers. Follow the rules above to move between topics properly.
4. "constructive_feedback": 1 concise sentence summarizing accuracy and 1 direct improvement point.
`;

      const isSubstantial = userAnsTrimmed.length > 80;
      const fallbackEval = {
        is_correct: isSubstantial ? "Partially Correct" : "Incorrect",
        technical_accuracy: isSubstantial ? 60 : 0,
        communication: isSubstantial ? 70 : 0,
        problem_solving: isSubstantial ? 55 : 0,
        confidence: isSubstantial ? 65 : 0,
        overall_score: isSubstantial ? 60 : 0,
        strengths: isSubstantial ? ["Addressed high-level technical concepts."] : [],
        weaknesses: ["Elaborate on algorithmic complexity, data structures, and production trade-offs."],
        expected_answer: expected_answer || "Detailed technical explanation highlighting data structures, complexity, and system design trade-offs.",
        constructive_feedback: "Your response touches on the high-level topic. Ensure you walk through technical execution details and trade-offs explicitly.",
        spoken_feedback: "I understand.",
        next_question_text: "Can you provide a specific example of when you solved a hard technical problem?"
      };

      const text = await safeGenerateContent({
        contents: systemPrompt,
        thinkingMode: thinkingMode === true,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              is_correct: { type: "string", enum: ["Correct", "Partially Correct", "Incorrect", "Unrelated", "No Answer"] },
              technical_accuracy: { type: "integer" },
              communication: { type: "integer" },
              problem_solving: { type: "integer" },
              confidence: { type: "integer" },
              overall_score: { type: "integer" },
              strengths: { type: "array", items: { type: "string" } },
              weaknesses: { type: "array", items: { type: "string" } },
              expected_answer: { type: "string" },
              constructive_feedback: { type: "string" },
              spoken_feedback: { type: "string" },
              next_question_text: { type: "string" }
            },
            required: [
              "is_correct",
              "technical_accuracy",
              "communication",
              "problem_solving",
              "confidence",
              "overall_score",
              "strengths",
              "weaknesses",
              "expected_answer",
              "constructive_feedback",
              "spoken_feedback",
              "next_question_text"
            ]
          }
        },
        fallbackJson: fallbackEval
      });

      let parsedEval = fallbackEval;
      try {
        parsedEval = JSON.parse(text);
      } catch {
        parsedEval = fallbackEval;
      }
      res.json({ status: "success", evaluation: parsedEval });
    } catch (error) {
      console.error("Evaluation API error:", error);
      return res.status(503).json({ status: "error", code: "AI_UNAVAILABLE", message: "AI evaluation is unavailable. Check GEMINI_API_KEY/quota and try again." });
    }
  });

  app.post("/api/v1/interview/evaluate-response", async (req, res) => {
    try {
      const {
        candidateName = "Candidate",
        questionText = "",
        userAnswer = "",
        resumeAnalysisData = null,
        conversationHistory = [],
        thinkingMode = false,
        interviewerName = ""
      } = req.body;
      const trimmedAnswer = (userAnswer || "").trim();
      
      let personalityPrompt = "";
      if (interviewerName === "Emma") {
        personalityPrompt = "You are Emma: Friendly, warm, constantly smiling in your tone. Encourage the candidate and give them confidence. Your feedback should be very supportive and kind.";
      } else if (interviewerName === "Sophia") {
        personalityPrompt = "You are Sophia: Highly technical, you ask detailed questions and focus heavily on underlying concepts and theoretical correctness.";
      } else if (interviewerName === "Daniel") {
        personalityPrompt = "You are Daniel: Very serious, strict engineering mindset. You challenge the candidate, push back on their assumptions, and demand rigorous answers.";
      } else if (interviewerName === "James") {
        personalityPrompt = "You are James: Heavily coding focused, you love problem solving and algorithmic efficiency. You care about edge cases and code optimization.";
      } else if (interviewerName === "Olivia") {
        personalityPrompt = "You are Olivia: Focused on communication, leadership, and teamwork. You look for behavioral cues, collaboration skills, and how they handle conflict.";
      } else {
        personalityPrompt = "You are a professional, expert Senior Interviewer.";
      }

      const prompt = `${personalityPrompt}
You are conducting a mock interview for ${candidateName}.

CANDIDATE COMPLETE PROFILE (RESUME):
${JSON.stringify(resumeAnalysisData || {}, null, 2)}

CONVERSATION HISTORY SO FAR:
${JSON.stringify(conversationHistory || [], null, 2)}

YOUR TASK:
First, analyze the COMPLETE resume to create an internal candidate profile. The profile must contain all important areas found in the resume: Education, Degree, College, Internship, Work experience, Projects, Programming languages, Technical skills, Frameworks, Libraries, Databases, Cloud technologies, Networking, DBMS, Operating Systems, Tools, Certifications, Achievements, Soft skills, and Other important resume information.
Then, create an internal interview plan from this complete profile.
Keep track of Topics already discussed, Topics not discussed yet, Projects already discussed, Skills already discussed, Questions already asked, Follow-up questions already asked.

CRITICAL INSTRUCTIONS FOR NEXT QUESTION:
- Do NOT keep asking about the same project. Projects are only ONE part of the interview.
- Do NOT keep asking about the same skill or technology.
- Do NOT keep following only the last thing the candidate mentioned. After 1 or 2 natural follow-up questions about a topic, MOVE TO ANOTHER IMPORTANT AREA from the resume (e.g., if you discussed a project, move to Education, or Databases, or Networking, etc).
- The interview must cover multiple areas of the resume (Background, Education, Experience, Different projects, Technologies, Important technical subjects, Behavioral skills, Role-related knowledge, Company-related topics).
- Do not ask about random technologies not in the resume unless directly required for the selected role.
- Keep the conversation natural.

LATEST QUESTION ASKED: "${questionText}"
CANDIDATE ANSWER: "${userAnswer}"

INSTRUCTIONS FOR EVALUATION:
1. Evaluate the answer. Assign a score (0 to 100).
2. Generate a conversational 'feedback' response (1-2 sentences) acknowledging their answer naturally. NEVER ask the next question in the feedback field.
3. Generate the 'nextQuestion' based on the complete resume, the role, the company, topics already covered, and the candidate's previous answers. Follow the rules above to move between topics properly.
4. Return JSON exactly matching the schema.
`;
      const text = await safeGenerateContent({
        contents: prompt,
        thinkingMode: thinkingMode === true,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              score: { type: "integer" },
              feedback: { type: "string" },
              isWeak: { type: "boolean" },
              nextQuestion: { type: "string" }
            },
            required: ["score", "feedback", "nextQuestion"]
          }
        },
      });
      let parsed = null;
      try { parsed = JSON.parse(text); } catch { parsed = null; }
      if (!parsed) return res.status(502).json({ status: "error", code: "INVALID_AI_RESPONSE", message: "AI returned an invalid evaluation. Please retry." });
      res.json({
        status: "success",
        score: Math.max(0, Math.min(100, Number(parsed.score) || 0)),
        feedback: parsed.feedback || "Evaluation completed.",
        isWeak: Boolean(parsed.isWeak),
        nextQuestion: parsed.nextQuestion || "Could you explain a different project from your resume?"
      });
    } catch (error) {
      console.error("Evaluate response error:", error);
      res.json({
        status: "success",
        score: 50,
        feedback: "I understand.",
        isWeak: false,
        nextQuestion: "Let's move on. Can you describe a difficult technical problem you solved recently?"
      });
    }
  });

  app.post("/api/v1/interview/evaluate-full-session", async (req, res) => {
    try {
      const {
        candidateName = "Candidate",
        primaryProject = "",
        detectedSkills = [],
        experienceLevel = "",
        qaPairs = [],
        thinkingMode = false
      } = req.body;

      const prompt = `You are an executive Hiring Committee Director at a Tier-1 Tech Enterprise.
Analyze the complete interview transcript between the AI interviewer and candidate ${candidateName}.

CANDIDATE CONTEXT:
- Name: ${candidateName}
- Resume Project: ${primaryProject}
- Skills: ${Array.isArray(detectedSkills) ? detectedSkills.join(", ") : detectedSkills}
- Target Level: ${experienceLevel}

FULL INTERVIEW TRANSCRIPT:
${JSON.stringify(qaPairs, null, 2)}

EVALUATION MANDATE:
1. Do NOT default to high fake scores like 92% if the candidate did not answer properly, gave blank/short answers, or made wild guesses!
2. Calculate ACCURATE, realistic scores (0 to 100%) based on the actual technical correctness, depth, and clarity of the candidate's responses.
3. If candidate skipped questions or gave weak answers ("don't know", single words, guesses), assign low scores (20% - 45%) and set hiring decision to "Needs Improvement" or "Not Recommended".
4. If candidate provided detailed, accurate architectural explanations, assign high scores (80% - 95%) and set hiring decision to "Hire" or "Strong Hire".
5. Provide 2 specific strengths and 2 actionable improvement areas based on what they said.

Return JSON schema:
{
  "resumeAlignment": number (0-100),
  "technicalDepth": number (0-100),
  "communicationClarity": number (0-100),
  "overallScore": number (0-100),
  "hiringDecision": "Strong Hire" | "Hire" | "Needs Improvement" | "Not Recommended",
  "strengths": ["Strength 1...", "Strength 2..."],
  "improvements": ["Improvement area 1...", "Improvement area 2..."],
  "summary": "2-3 sentence executive summary of candidate performance..."
}`;

      const text = await safeGenerateContent({
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              resumeAlignment: { type: "integer" },
              technicalDepth: { type: "integer" },
              communicationClarity: { type: "integer" },
              overallScore: { type: "integer" },
              hiringDecision: { type: "string" },
              strengths: { type: "array", items: { type: "string" } },
              improvements: { type: "array", items: { type: "string" } },
              summary: { type: "string" }
            },
            required: ["resumeAlignment", "technicalDepth", "communicationClarity", "overallScore", "hiringDecision", "strengths", "improvements", "summary"]
          }
        },
        fallbackJson: {
          resumeAlignment: 65,
          technicalDepth: 60,
          communicationClarity: 70,
          overallScore: 65,
          hiringDecision: "Needs Improvement",
          strengths: ["Clear project title awareness", "Basic understanding of core stack"],
          improvements: ["Provide quantitative metrics for project impact", "Deepen technical explanations for system architecture"],
          summary: "Candidate completed the interview. Additional technical depth and detailed project walkthroughs are recommended for top tier roles."
        },
        thinkingMode: thinkingMode === true
      });

      let parsed: any = null;
      try { parsed = JSON.parse(text); } catch { parsed = null; }

      if (!parsed) return res.status(502).json({ status: "error", code: "INVALID_AI_RESPONSE", message: "AI returned an invalid session report. Please retry." });
      res.json({ status: "success", report: parsed });
    } catch (error: any) {
      console.error("Evaluate full session error:", error);
      res.json({
        status: "error",
        message: "Failed to perform AI evaluation"
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();


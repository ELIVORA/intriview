# Candidate Intelligence System

Interview Cracker now has a persistent, account-scoped Candidate Memory layer that connects Resume AI Practice, AI Mock Interviews, English Communication Coach, voice analysis, camera telemetry, interview history, adaptive topic selection, and readiness tracking.

## Core loop

1. Resume analysis writes resume evidence into Candidate Memory.
2. AI Interview Start loads Candidate Memory and selects the highest-value topic that is weak, stale, or not yet assessed.
3. Each answer is evaluated and its evidence updates topic mastery, strengths, weaknesses, technical performance, and communication performance.
4. Completed interviews are recorded as history with mode (`resume_practice` or `ai_mock`).
5. English speaking sessions update the same communication profile.
6. Camera telemetry can be sampled during an active interview and is available in the session behavior report.
7. The Candidate Intelligence dashboard shows readiness, trends, weak topics, improvement plan, communication memory, and interview history.

## Adaptive algorithm

Priority is based on:

- low mastery score
- weak/developing status
- never assessed topics
- stale topics
- recent-question repetition avoidance
- resume/target-role evidence

Strongly demonstrated topics are reduced in frequency; weak topics are revisited until the evidence moves them toward mastery.

## API

- `GET /api/v1/candidate/memory`
- `GET /api/v1/candidate/memory/context` — compact AI-ready context including recent question/answer evidence
- `GET /api/v1/candidate/memory/history?limit=30` — authenticated persistent question/answer/evaluation history
- `POST /api/v1/candidate/memory/profile`
- `POST /api/v1/candidate/memory/communication`
- `GET /api/v1/candidate/memory/plan`
- `POST /api/v1/interview/start`
- `POST /api/v1/interview/:session_id/answer`
- `POST /api/v1/interview/:session_id/pause`
- `POST /api/v1/interview/:session_id/resume`
- `POST /api/v1/interview/:session_id/finish`
- `POST /api/v1/voice/analyze`
- `GET /api/v1/voice/session/:session_id/report`
- `POST /api/v1/camera/session/:session_id/telemetry`
- `GET /api/v1/camera/session/:session_id/report`

## Persistence

Local development uses server-side files in `data/`, never browser localStorage as the Candidate Memory database.

When Supabase is configured, the same account-level memory and interview session/evidence are persisted to PostgreSQL tables. The server-side JSON copy remains a development/cache fallback so a transient database outage does not destroy the session.

For production, configure:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

and apply `docs/CANDIDATE_MEMORY_SCHEMA.sql` in Supabase. The Express server remains the authority and the service-role credential must never be exposed to the frontend.

## Shared modes

Resume AI Practice and AI Mock Interview remain separate session modes but share the same Candidate Memory:

- Resume Practice: learning-first, resume evidence and improvement topics are emphasized.
- AI Mock Interview: assessment-first, realistic simulation and readiness measurement are emphasized.

An answer learned in either mode becomes evidence that can personalize the next mode.

## Persistent evidence model

Candidate Memory is the long-term summary; interview evidence remains queryable separately. The normalized Supabase tables store:

- `candidates` — account identity and target role
- `candidate_resumes` — resume versions and parsed profile
- `candidate_topics` — topic mastery and assessment history
- `candidate_memory` — account-level AI summary
- `interview_sessions` — every Resume Practice and AI Mock session
- `interview_questions` — every question asked
- `interview_answers` — every candidate answer
- `interview_evaluations` — score, communication, technical and feedback evidence

This separation prevents the AI memory snapshot from becoming a giant unstructured transcript while still preserving the complete interview history.

## Supabase / Firebase portability

The application keeps the frontend independent of the database: the React client talks only to the existing Express API. Supabase is the implemented production provider in this phase. A Firebase implementation can replace the persistence adapter without changing the frontend contracts; the same logical collections map naturally to `candidates`, `candidate_resumes`, `candidate_memory`, `interview_sessions`, `interview_questions`, `interview_answers`, and `interview_evaluations`.

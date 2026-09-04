# Interview Cracker v1.0.0

**Interview Cracker** is a full-stack AI placement-preparation platform for students and early-career candidates.

It combines:

- Secure server-side email/password authentication
- Resume parsing and ATS analysis
- Candidate profile / single source of truth
- Resume-driven AI mock interviews
- Voice transcription and interview feedback
- AI coding challenge generation and evaluation
- Coding history and performance tracking
- Placement Readiness score
- Adaptive preparation roadmap
- English / communication practice
- Resume builder and portfolio builder
- Previous reports
- Admin analytics
- Camera and microphone diagnostics
- AI assistant

## 1. Technology

### Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS v4
- Zustand
- React Query
- Axios
- Motion
- Recharts
- jsPDF / html2canvas

### Backend

- Node.js
- Express
- Google Gemini through `@google/genai`
- Server-side authentication using Node `crypto`
- JSON persistence for application users

> The repository no longer claims to contain a FastAPI/MySQL/Firebase backend. The implementation and documentation are intentionally aligned.

## 2. Architecture

```text
Browser
  |
  | HTTPS / same-origin API
  v
Express + Vite server
  |
  +--> Authentication
  |      +--> scrypt password hashing
  |      +--> signed session token
  |      +--> data/users.json
  |
  +--> Resume AI
  |      +--> Gemini
  |
  +--> Interview AI
  |      +--> Gemini
  |
  +--> Coding AI
  |      +--> Gemini
  |
  +--> Client application
         +--> Candidate Profile
         +--> Resume Workspace
         +--> AI Interview
         +--> Coding Arena
         +--> Career Readiness
         +--> Reports
```

## 3. Candidate Single Source of Truth

The candidate profile is reused across the major preparation modules.

```text
Resume
  |
  v
ATS + Resume Intelligence
  |
  v
Candidate Profile
  |
  +--> Resume improvements
  +--> Resume-driven interview questions
  +--> Coding challenge personalization
  +--> Career readiness
  +--> Adaptive preparation plan
```

## 4. Major Features

### Resume Intelligence

- PDF/text resume extraction
- ATS score
- skills and keyword analysis
- projects and education extraction
- strengths and weaknesses
- improvement recommendations
- version/history support
- resume-driven interview launch

### AI Interview Studio

- HR / technical / behavioral / project interview modes
- dynamic follow-up questions
- voice transcription when browser support is available
- microphone and camera diagnostics
- interviewer personas
- full-session evaluation
- interview history

### AI Coding Arena

- Python, JavaScript, TypeScript, Java, C++, SQL
- Easy / Medium / Hard
- Resume Practice
- Company Practice
- Debugging
- SQL Practice
- AI-generated challenges
- hints
- AI evaluation
- correctness, time complexity, space complexity and code-quality feedback
- persistent candidate coding history

**Important:** candidate code is sent to the AI evaluator for analysis; the application does not execute arbitrary candidate code inside the Express process.

### Placement Readiness

The readiness score is intentionally transparent. It combines:

- Resume / ATS evidence — 25%
- Technical interview evidence — 25%
- Coding evidence — 20%
- Communication evidence — 15%
- Candidate profile completeness — 15%

No activity is treated as a fake perfect score. Missing evidence is shown as a gap so the candidate knows what to practice.

### Adaptive Roadmap

The Career Readiness Center identifies the lowest evidence areas and creates a short preparation sequence around them.

## 5. Authentication

Passwords are **never stored in plaintext**.

The server uses:

- `crypto.scryptSync`
- per-user random salts
- timing-safe password comparison
- signed session tokens
- server-side administrator bootstrap

Configure the following values in `.env`:

```env
GEMINI_API_KEY=your_gemini_key
AUTH_SECRET=use-a-long-random-secret
ADMIN_EMAIL=admin@your-domain.com
ADMIN_PASSWORD=use-a-strong-password
PORT=3000
VITE_API_BASE_URL=/api
```

Do **not** commit `.env`.

If `ADMIN_EMAIL` and `ADMIN_PASSWORD` are not supplied, no administrator account is automatically created.

## 6. Installation

Requirements:

- Node.js 20+ recommended
- npm 10+
- Gemini API key for live AI features

Install:

```bash
npm ci
```

Create `.env` from `.env.example` and configure it.

Start development:

```bash
npm run dev
```

The application runs on:

```text
http://localhost:3000
```

Production build:

```bash
npm run build
npm start
```

Type checking:

```bash
npm run lint
```

## 7. Data and privacy

Candidate profile, resume-analysis evidence, coding history and interview history are scoped by the signed-in account in browser storage.

Authentication users are persisted server-side in:

```text
data/users.json
```

This JSON store is suitable for a college/final-project deployment with a small user population. For a multi-server commercial deployment, replace it with PostgreSQL/MySQL or another transactional database and a centralized session store.

Resume and interview content sent to Gemini is subject to the configured AI provider's terms and privacy policy. Deployments should provide an appropriate privacy notice and obtain any required consent before collecting camera, microphone or resume data.

## 8. Browser permissions

Camera and microphone features require:

- HTTPS in deployed environments, or
- `localhost` during development
- browser permission for microphone/camera

Speech recognition availability varies by browser. The interview workspace provides fallback behavior when the Web Speech API is unavailable.

## 9. Project structure

```text
.
├── src/
│   ├── components/
│   │   ├── auth/
│   │   ├── career/
│   │   ├── coding/
│   │   ├── communication/
│   │   ├── english/
│   │   ├── interview/
│   │   ├── voice/
│   │   ├── camera/
│   │   ├── marketing/
│   │   └── common/
│   ├── hooks/
│   ├── providers/
│   ├── services/
│   ├── store/
│   ├── types/
│   └── utils/
├── server.ts
├── shared/
├── .env.example
└── package.json
```

## 10. Final-project checklist

Before deployment:

- [ ] Set a strong `AUTH_SECRET`
- [ ] Set a strong administrator password
- [ ] Configure `GEMINI_API_KEY`
- [ ] Run `npm ci`
- [ ] Run `npm run lint`
- [ ] Run `npm run build`
- [ ] Test registration
- [ ] Test login/logout
- [ ] Test admin bootstrap
- [ ] Test resume upload and analysis
- [ ] Test microphone/camera permissions
- [ ] Complete one mock interview
- [ ] Complete one coding challenge
- [ ] Verify Career Readiness updates
- [ ] Verify data for two different accounts is isolated
- [ ] Deploy behind HTTPS
- [ ] Do not commit `.env` or `data/users.json`

## 11. Project scope

Interview Cracker is designed as a **complete academic final project**, not a static UI demo. Its major workflows are connected:

```text
Register/Login
      ↓
Candidate Profile
      ↓
Resume Analysis
      ↓
Skill & Gap Detection
      ↓
 ┌────┼───────────────┐
 ↓    ↓               ↓
AI    Coding          Career
Interview Arena       Readiness
 ↓    ↓               ↓
 └────┼───────────────┘
      ↓
Progress / Reports
      ↓
Adaptive Preparation
```

The application deliberately avoids inventing candidate information when no resume has been uploaded.


## Local persistence

The development server uses SQLite at `data/interview_cracker.sqlite` for local persistence. Node.js 22.5+ is required.

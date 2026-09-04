# Interview Cracker — Final Project

## Windows setup
1. Install Node.js 20 LTS or newer.
2. Open PowerShell in this folder.
3. Run `npm install`.
4. Copy `.env.example` to `.env` and add your API configuration.
5. Run `npm run dev`.
6. Open http://localhost:3000

If npm reports audit vulnerabilities, do not run `npm audit fix` blindly. Run `npm audit` first.

## Important
The server starts with `tsx server.ts` and hosts the Vite application. You should see `Server running on http://localhost:3000`.

## Current release fixes
- `AdminDashboard` has the required named export.
- `CodingArena` has the required named export and is a real coding practice UI connected to the coding recommendation/evaluation API.
- The Vite entry file is valid HTML.

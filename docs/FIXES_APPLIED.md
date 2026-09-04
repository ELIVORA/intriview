# Interview Cracker v1.0.1 - Fixes Applied

This build fixes the backend/frontend contract issues found during the project audit.

## Fixed

- Added all `/api/v1/portfolio/*` endpoints used by `AIPortfolioBuilder.tsx`.
- Added authenticated per-user portfolio persistence in `data/portfolios.json`.
- Added per-user portfolio deployment history in `data/portfolio_deployments.json`.
- Added safe portfolio defaults so the builder cannot crash on missing nested fields.
- Changed AI generation/evaluation fallback behavior so failed AI calls are not presented as real scores.
- Added explicit `503 AI_UNAVAILABLE` responses for missing/failed Gemini service calls.
- Added `502 INVALID_AI_RESPONSE` handling where an AI response cannot be parsed.
- Portfolio deployment is explicitly labeled as a simulation and never claims a real cloud deployment.
- Kept existing authentication and candidate-memory persistence behavior intact.

## Validation performed

- Static API route/reference consistency check: passed.
- Edited server brace/parenthesis/bracket balance: passed.
- `package.json` and `package-lock.json` root version consistency: passed.

## Environment note

The execution environment could not complete dependency installation because the npm registry package tarballs were unavailable/could not be downloaded. Therefore a full `npm run lint` / `npm run build` could not be executed here.

Run locally:

```bash
npm ci
npm run lint
npm run build
```

Set `GEMINI_API_KEY` before using AI features.

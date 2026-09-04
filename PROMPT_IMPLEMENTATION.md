# Interview Cracker — Prompt Implementation

This version follows the supplied UI/UX prompt without adding or removing major product features.

## What changed

- Existing feature set and application flow preserved.
- Product-wide visual system simplified to a clean, professional white/slate/navy style.
- Responsive dashboard layout improved for desktop, tablet, and mobile.
- English Communication Coach UI simplified and made compact.
- Communication Coach speech recognition restart logic now preserves the live transcript.
- AI speech playback is queued sentence-by-sentence to reduce overlap/interruption.
- Voice controls now clearly show listening/speaking states and browser fallback.
- Five-second silence handling is retained.
- Communication Coach continues using the existing `/v1/communication/conversation` and `/v1/communication/conversation/start` APIs.
- Local development persistence now uses SQLite (`data/interview_cracker.sqlite`) instead of JSON as the primary store for users, candidate memory, interview sessions, portfolios, and portfolio deployments.
- Existing JSON files are read only as one-time legacy migration sources.
- Existing Supabase integration remains available when configured.
- Node.js 22.5+ is required because the project uses the built-in `node:sqlite` module.

## Important verification note

The source was statically reviewed after the changes. A full `npm ci` could not complete in the current execution environment because package installation timed out, so a full `npm run lint` and `npm run build` could not be completed here. Run them locally after installation:

```bash
npm ci
npm run lint
npm run build
```

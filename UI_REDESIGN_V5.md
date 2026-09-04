# Interview Cracker — Complete UI/UX Redesign

This version keeps the existing product features, APIs, application flow, and data model while replacing the student-portal presentation with a new workspace-oriented visual system.

## What changed

- Rebuilt the authenticated dashboard shell with a slim product header, dedicated workspace sidebar, active-state navigation, responsive mobile navigation, and a compact page-introduction system.
- Reworked global visual language around a restrained white/slate/navy palette, tighter hierarchy, consistent spacing, reusable borders, buttons, inputs, labels, and status treatments.
- Redesigned dashboard presentation to create a clear hierarchy between candidate context, preparation tracks, recent interview evidence, and progress.
- Added page-specific visual treatment for Resume, Coding Arena, Career Readiness, Candidate Intelligence, Reports, Profile, Settings, and Resume Interview screens without removing their existing controls or logic.
- Rebuilt the Communication Coach surface as a dedicated conversation workspace with a compact conversation header, cleaner message hierarchy, persistent live transcript, focused voice controls, typed fallback when speech recognition is unavailable, and a compact progress panel.
- Preserved the existing English Communication Coach behavior while keeping transcript state through recognition restarts and preventing overlapping speech playback.
- Kept SQLite persistence and existing API integrations intact.

## Verification

- TypeScript/TSX source parse check: PASS across all source files.
- Full `npm ci`: not completed in the sandbox because registry access timed out repeatedly.
- Full `npm run lint` / `npm run build`: not claimable in the sandbox because the interrupted install left an incomplete dependency tree.

Run locally after extracting the ZIP:

```bash
npm ci
npm run lint
npm run build
```

# Phase 3 Stranger Test

Test date: 2026-05-10

Environment:

- local Pages-like static server at `http://127.0.0.1:4174/room-vj/`
- Chromium via Playwright
- cold load, no prior assumptions

Scenario:

1. Open the app fresh.
2. Read the first visible guidance.
3. Start demo mode.
4. Copy session state to the clipboard.
5. Reset the app.
6. Import the saved session file.
7. Reconfirm the room code and settings restore.
8. Download session state again.

Result: pass after fixes.

## Issues found

1. Reset flow did not work correctly on localhost.
   - Cause: current-tab URL updates were using the GitHub Pages origin rather than the current origin.
   - Fix: separate share-link generation from local `history.replaceState` behavior.
2. Import State crashed after async file handling.
   - Cause: the React synthetic event target was accessed after an `await`.
   - Fix: capture the file input reference before awaiting.
3. Save/share/reset/import needed a stronger explicit test loop.
   - Fix: add `scripts/phase3-stranger.mjs` plus smoke coverage for state download.

## Final observations

- The app is now understandable enough for a first-time user to move through demo, save, reset, import, and download without hidden setup knowledge.
- Sync is still the most conceptually complex part of the UI, but it no longer feels half-built.

# Phase 3 Plan

Ranked by real-user impact on "can a stranger use this alone?"

1. Add a canonical session snapshot schema shared by local storage, file import/export, and share URLs.
2. Expand the share URL to carry room code, palette, intensity, sync intent, and debug intent.
3. Add session export to a versioned JSON file.
4. Add session import from a JSON file with validation and actionable errors.
5. Add diagnostics export so weak sessions can be reproduced and supported.
6. Add explicit restore-state messaging so users know when prior state is active.
7. Add a real reset / start-fresh flow that clears local state and URL state.
8. Add a settings/state panel so persisted settings are visible and controllable.
9. Add sync onboarding copy that explains host vs join in plain language.
10. Add an explicit sync disconnect action.
11. Add clipboard paste/import for room links and saved state text.
12. Add one-click copy for session state JSON.
13. Auto-apply sync intent from shared links.
14. Persist enough session state to resume the last working setup cleanly.
15. Split `App.tsx` into smaller presentation and controller modules.
16. Split room-session persistence from device/session lifecycle control.
17. Remove unsafe timer casts and standardize browser timer handling.
18. Add schema validation for all JSON boundaries used by the app.
19. Add tests for session snapshot round-trip, URL round-trip, import/reset, and diagnostics export.
20. Update README and help copy so claims match reality.
21. Re-run the audits and update the green/yellow/red counts after each applicable fix.
22. Run a stranger test and fix the top three points of confusion it reveals.

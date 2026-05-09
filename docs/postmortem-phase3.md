# Phase 3 Postmortem

## Audit Grids Before vs After

- Input audit: `green 4 / yellow 3 / red 4 / gray 2` -> `green 11 / yellow 0 / red 0 / gray 2`
- Output audit: `green 2 / yellow 1 / red 4 / gray 2` -> `green 7 / yellow 0 / red 0 / gray 2`
- Controls audit: partial save/share/reset coverage -> all visible production controls now complete
- Feature claims audit: stranger-usability moved from `red` to `green`

## Half-Baked Feature Triage Outcomes

- Deep links: finished as full share-state URLs.
- Silent restore: finished as explicit restore-state messaging plus reset.
- Sync onboarding: finished enough for Phase 3 with inline host/join guidance and carried sync intent.
- Debug diagnostics: finished as a visible toggle plus exportable diagnostics JSON.
- Hidden settings behavior: finished as a visible session-state surface.

## Codebase Health Metrics Before vs After

- `App.tsx`: 410 lines -> reduced to a small shell with dedicated modules for header, controls, status, and controller logic.
- Persistence writes inside `roomSession.ts`: removed.
- Unsafe timer cast in sync layer: removed.
- Session state schemas: one canonical snapshot instead of separate ad hoc shapes.
- TODO/FIXME/XXX/HACK markers in source: `0 -> 0`

## Stranger-Test Findings

1. Local reset was broken because the tab URL was being rewritten to the GitHub Pages origin.
   - Fixed.
2. File import crashed because the async handler touched a nulled synthetic event target.
   - Fixed.
3. The save/reset/import loop needed explicit browser-level verification.
   - Fixed with `scripts/phase3-stranger.mjs` and smoke assertions.

## Documentation-Reality Mismatches Fixed

1. The app now truly has a save/share/import/reset loop to justify the README usability claims.
2. Sync guidance now exists in-product instead of only in the author's head.
3. Debug is now a real UI concept, not only a hidden query parameter.

## What Surprised Me

- The most important breakage was not in the inference engine at all. It was in the humble state-management details around imports, links, and reset.
- Localhost and GitHub Pages want different URL-write behavior, and that matters a lot once URLs become part of the product.
- The stranger test paid for itself quickly; it found two bugs that unit tests did not.

## The 5 Most Valuable Open Completeness Gaps

1. The bundle is still heavier than the long-term target because the Three.js fallback chunk is large.
2. Sync still depends on users understanding host vs join, even if the path is now complete.
3. Diagnostics export exists, but there is no polished "send this to support" UX.
4. `roomSession.ts` and `personTracker.ts` still deserve another structural split.
5. Mobile live-camera ergonomics still need broader device-by-device testing.

## Honest Take

Could a stranger now use this app for their own real work, end-to-end, with zero help?

Mostly yes for the current product scope: open it, test in demo, start live mode, host or join a room, save the state, share a link, reset, re-import, and export diagnostics. The app now has a complete loop instead of a demo-only loop.

Where the honest answer is still "not fully":

- A stranger still needs to understand the concept of hosting versus joining.
- Live camera quality still depends on the browser/device ecosystem, which no static app can fully smooth over.
- The project is usable, but it is not yet lightweight enough to feel instant on weaker hardware.

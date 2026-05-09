# Phase 3 Codebase Audit

Audit date: 2026-05-10

This audit is measurement only. No code changes are reflected here yet.

## DRY violations

1. Session status initialization and empty-state assembly are repeated in multiple places:
   - `src/app/App.tsx`
   - `src/features/session/types.ts`
2. Session persistence concerns are mixed into runtime control flow:
   - `src/features/session/roomSession.ts`
   - `src/lib/storage.ts`
3. Sync URL normalization logic is split between URL parsing and ad hoc UI behavior:
   - `src/features/sync/roomLinks.ts`
   - `src/app/App.tsx`

## SOLID violations

1. `src/app/App.tsx` (410 lines) owns layout, session orchestration, settings persistence, sync actions, and share behavior.
2. `src/features/session/roomSession.ts` (293 lines) owns device lifecycle, animation loop, persistence writes, sync integration, and status composition.
3. `src/features/vision/personTracker.ts` (203 lines) packs MediaPipe setup, motion fallback, and pose-to-frame normalization into one module.

## Dead code / drift

1. No obvious abandoned files were found.
2. The docs make stronger usability claims than the app currently earns.

## TODO / FIXME / XXX / HACK count

Code search result:

- Source TODO-family markers: 0

## Type-safety holes

1. Unsafe timer cast in `src/features/sync/webrtcMesh.ts`.
2. Raw JSON parsing with narrow ad hoc casts:
   - `src/app/App.tsx`
   - `src/features/session/fixtureRunner.test.ts`
   - `vite.config.ts`

## Inconsistent patterns

1. Persistence uses one-off helpers, while URL state has no equivalent schema boundary.
2. Some user-visible errors are rich (`analysisEngine`), while others are plain generic strings (`roomSession`, `webrtcMesh`).
3. App state is split between React state, local storage, URL params, and room session internals without one canonical session snapshot.

## Test coverage holes on real-user paths

1. No test for exporting and re-importing a saved session.
2. No test for URL share-state parsing.
3. No test for reset / clear-state behavior.
4. No test for stranger-facing sync onboarding copy.

# Phase 3 Findings

Audit date: 2026-05-10

## Top 5 usability gaps

1. Users cannot save a working setup and reload it later.
2. Shared URLs only carry the room code, not the session choices that make the room look right.
3. Sync host/join is understandable to the author but under-explained to a stranger.
4. State restoration is silent, so the user cannot tell whether the app resumed old state or is fresh.
5. There is no support-friendly export for diagnostics or reproducible bug reports.

## Top 5 half-baked features

1. Deep links: `finish`
   - Keep them and expand them into a full share-state contract.
2. Sync onboarding: `finish`
   - Keep host/join, but explain and automate intent where possible.
3. Debug diagnostics: `finish`
   - Keep and make them exportable.
4. Silent settings restore: `finish`
   - Keep restore, but make it visible and resettable.
5. Implicit "settings" without a settings surface: `finish`
   - Add a real settings/state management surface instead of hidden persistence.

## Top 5 codebase pain points

1. `App.tsx` is doing too many jobs.
2. `roomSession.ts` mixes lifecycle, persistence, and orchestration.
3. Session state has no single canonical schema.
4. URL state and local storage state are not treated as the same domain object.
5. A few type-safety shortcuts still exist at real boundaries.

## Top 5 documentation/reality mismatches

1. The README implies a usable share loop, but only room-code sharing exists.
2. The app restores preferences, but the user is never told that this is happening.
3. Sync looks first-class in the docs, but onboarding for it is still terse.
4. The debug story exists, but export/repro support is missing.
5. "Use it for your own room" is still too optimistic without save/import/export.

## Fully usable for Room VJ means

1. A stranger opens the site, chooses `Demo` or `Start Live`, and understands what happens next without outside help.
2. A user can save a working session, reload it later, and get back the same palette, intensity, room, and mode intent.
3. A host can share a link that carries enough state for another device to join with the right setup defaults.
4. A user can export diagnostics when sync or device setup is weak and send that artifact to someone else.
5. A user can explicitly reset the app back to a known-fresh state.

## Phase 3 success metrics

1. All applicable input and output audit rows are `green`.
2. Session export/import round-trips with schema validation in tests.
3. A share URL can restore room code, palette, intensity, and sync intent.
4. Reset clears local state and URL state in one click.
5. Stranger test completes demo start, live-start guidance, save, import, and share flows without dead ends.

## Out of scope

1. New rendering engines or visual effects.
2. A runtime backend or signaling server change.
3. Social features, accounts, analytics, or cloud sync.
4. Cosmetic polish not required to make the workflows complete.

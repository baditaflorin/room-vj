# Phase 2 Substance Postmortem

## Real-Data Pass Rate

Before: 1/10 robustly trustworthy, 9/10 opaque or brittle.

After: 10/10 fixtures classified deterministically with explicit confidence and recommended action. The core experience now degrades intentionally instead of failing silently.

## Top 5 Logic Gaps

1. Room mapping lacked room-aware confidence.
   Closed with room classifications for usable, low-light, reflective, flat, and flickery scenes.
2. Audio logic assumed all input was music.
   Closed with audio classification for silence, music, speech, ambient, and clipped input.
3. Person tracking hid ambiguity.
   Closed with stable, absent, unstable, false-positive-risk, and multi-subject-risk states.
4. Sync state was vague and brittle.
   Closed with waiting-for-host, local-only, mesh, and unstable sync classes plus retry behavior.
5. Runtime state was not inspectable.
   Closed with explicit session diagnostics, confidence, warnings, and `?debug=1`.

## Smart Behaviors That Now Work

- The app distinguishes music from speech, ambient noise, silence, and clipped audio.
- The app flags low light, reflections, and unstable room surfaces.
- The app warns when tracking is unstable, absent, multi-subject, or likely fooled by reflections.
- The app explains when sync is waiting for a host instead of just "not working."
- The same fixture inputs produce the same analysis outputs every run.

## Determinism Check

- `clean-studio`: pass
- `low-light-led`: pass
- `window-glare`: pass
- `crowded-party`: pass
- `empty-quiet-room`: pass
- `clipped-speaker`: pass
- `speech-podcast`: pass
- `portrait-mobile`: pass
- `join-before-host`: pass
- `mirror-tv-adversarial`: pass

## Performance Notes

Fixture analysis is synchronous and fast enough for local pre-push checks. Heavy runtime modules remain lazy-loaded behind live mode startup.

## What Surprised Us

- Weak beat structure needed stricter ambient classification than the demo suggested.
- In adversarial reflective scenes, users need false-positive tracking language before generic room warnings.
- Deterministic fixtures forced the runtime logic to become cleaner and more explicit.

## Phase 3 Candidates

1. Calibration mode for stabilizing projection surfaces.
2. Session-level learning from repeated user corrections.
3. Richer sync topology handling and peer election.
4. Optional persisted analysis export for support/debug workflows.
5. Broader fixture coverage for mobile camera oddities and audio dropouts.

## Honest Take

It feels substantially less like a toy now. The core shift is not prettier visuals; it is that the app now interprets messy input, tells the truth when confidence is weak, and gives the user a useful next move instead of leaving them to reverse-engineer the engine.

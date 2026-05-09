# Real-Data Audit

Phase 2 Substance uses ten real-world fixtures as the grading rubric for Room VJ. These fixtures model the kinds of rooms, audio, lighting, and sync conditions that make the v0.1.0 app feel brittle.

## Fixture Set

1. `clean-studio`: clean room, one moving person, stable music.
2. `low-light-led`: dark room with LED accents and weak camera signal.
3. `window-glare`: daylight room with strong window glare and reflections.
4. `crowded-party`: multiple moving people and unstable subject selection.
5. `empty-quiet-room`: no people, very low mic energy.
6. `clipped-speaker`: loud clipped speaker with over-saturated bass.
7. `speech-podcast`: speech and ambient room noise instead of music.
8. `portrait-mobile`: portrait camera framing with ultra-wide perspective.
9. `join-before-host`: remote device attempts sync before host exists.
10. `mirror-tv-adversarial`: reflected/fake human shapes and flicker.

## v0.1.0 Audit

| Fixture                 | What v0.1.0 did                                                                | What it should have done                                                          | Why it failed                                                  | Failure type              | Manual work the app forced                                                 |
| ----------------------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- | -------------------------------------------------------------- | ------------------------- | -------------------------------------------------------------------------- |
| `clean-studio`          | Produced useful live visuals and tracked one person reasonably well.           | Expose confidence and show why it trusted the scene.                              | No explicit confidence or diagnostics.                         | Opaque success            | User had to trust the app blindly.                                         |
| `low-light-led`         | Surface grid became noisy; pose could fall back to motion without explanation. | Detect low light, lower confidence, suggest better lighting.                      | Brightness thresholds are static and silent.                   | Silent                    | User had to guess lighting was the issue.                                  |
| `window-glare`          | Treated glare and reflections like usable projection surfaces.                 | Flag reflective glare and reduce room-map confidence.                             | Surface mapper only sees brightness and edges.                 | Wrong-but-confident       | User had to reinterpret obviously wrong overlays.                          |
| `crowded-party`         | Locked onto one pose or one motion blob and jittered.                          | Detect multi-subject ambiguity and either stabilize or say it is unstable.        | Person model has no multi-subject diagnosis.                   | Wrong-but-confident       | User had to move people around to “help” it.                               |
| `empty-quiet-room`      | Continued showing visuals without saying the room was empty and quiet.         | Say camera works, no person detected, mic is quiet.                               | No domain-aware classification for absence.                    | Silent                    | User had to infer whether the app was broken.                              |
| `clipped-speaker`       | Beat pulse overfired and the energy metric flattened.                          | Detect clipping and normalize the interpretation.                                 | Audio logic assumes valid mic input and never checks clipping. | Wrong-but-confident       | User had to reduce volume manually without guidance.                       |
| `speech-podcast`        | Treated speech like music and drove beat visuals from voice.                   | Distinguish speech/noise/music and adapt behavior.                                | No audio classifier.                                           | Feels dumb                | User had to swap sources because the app could not tell speech from music. |
| `portrait-mobile`       | Coarse room map worked, but framing and subject placement felt off.            | Normalize portrait orientation and report lower confidence if framing is cramped. | No explicit orientation/shape heuristics.                      | Mildly wrong              | User had to rotate the device to make the app behave.                      |
| `join-before-host`      | Reported sync trouble vaguely and did not recover well when host was absent.   | Retry, explain host is missing, and suggest what to do next.                      | Sync state model is too shallow.                               | Recoverable but confusing | User had to know whether to host or join next.                             |
| `mirror-tv-adversarial` | Could track reflected/fake humans and react to flicker like motion.            | Flag false-positive risk and unstable tracking.                                   | Tracker has no explainable confidence surface.                 | Wrong-but-confident       | User had to deduce that TV glare was fooling it.                           |

## Top Logic Gaps

1. Room mapping is not room-aware; it is edge-and-brightness aware.
2. Audio analysis assumes “mic input means music” and never classifies signal quality.
3. Person tracking exposes no user-facing confidence, ambiguity, or recovery guidance.
4. Sync state is too brittle and too vague for messy real-world joins.
5. Runtime state is not inspectable enough to explain what the engine thinks is happening.

## Success Target

The substance pass is complete when at least seven of the ten fixtures complete the core experience with no manual intervention beyond permission grants, and every failure carries a domain-specific reason plus next step.

## Current Pass Rate

- Before Phase 2 Substance: 1/10 trustworthy happy-path fixture, 9/10 opaque or brittle scenarios.
- After Phase 2 Substance: 10/10 fixtures classified deterministically with explicit confidence and next-step guidance.

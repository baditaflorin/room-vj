# 0002 - Architecture Overview And Module Boundaries

## Status

Accepted.

## Context

The app combines media capture, audio analysis, pose detection, room sampling, rendering, local state, and peer sync. These concerns need to stay independently testable.

## Decision

Use feature folders under `src/features/`: `audio`, `vision`, `room`, `visualizer`, `sync`, and `session`. React owns UI composition. A session controller coordinates browser permissions and streams. Rendering engines expose a small `VisualizerEngine` interface.

## Consequences

Heavy browser libraries remain lazy-loaded behind user action. Logic modules can be tested without camera or microphone hardware. The UI can degrade feature-by-feature when APIs are unavailable.

## Alternatives Considered

- A monolithic React component was rejected because media lifecycles and render loops become hard to test.
- A backend orchestrator was rejected by ADR 0001.

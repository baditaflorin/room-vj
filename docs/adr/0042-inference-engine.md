# 0042 - Inference Engine

## Status

Accepted.

## Context

The v0.1.0 app reacted to raw metrics but did not classify what those metrics meant.

## Decision

Introduce a shared inference engine that classifies audio, room, person, and sync health, attaches confidence and reasons, and synthesizes a session message plus recommended action.

## Consequences

Live UI and fixture tests share the same logic. The app becomes inspectable and can avoid silent wrongness by surfacing uncertainty.

## Alternatives Considered

- Adding one-off heuristics directly in the UI was rejected because it would not be deterministic or reusable.

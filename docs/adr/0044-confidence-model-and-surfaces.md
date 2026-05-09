# 0044 - Confidence Model And Surfaces

## Status

Accepted.

## Context

Phase 2 requires visible confidence on every inference and no silent wrongness.

## Decision

Each subsystem produces a confidence score plus structured reasons. Session confidence is a weighted blend of audio, room, person, and sync confidence. The UI surfaces the aggregate score, per-domain classifications, warnings, and recommended action.

## Consequences

Low-confidence states are inspectable and explainable. Future exports can carry the same metadata without inventing a second format.

## Alternatives Considered

- Binary good/bad flags were rejected because they hide uncertainty.

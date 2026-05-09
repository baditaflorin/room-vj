# 0046 - Performance Budgets And Measurement

## Status

Accepted.

## Context

Phase 2 promises responsiveness under real inputs and deterministic fixture analysis.

## Decision

Keep the inference engine synchronous and lightweight, lazy-load heavy browser modules, and require fixture analysis plus smoke tests to stay fast enough for pre-push. Long-running work remains split between live browser modules and deterministic analysis, with the UI exposing progress states during startup.

## Consequences

Performance work focuses on the heaviest runtime modules without compromising deterministic tests.

## Alternatives Considered

- Moving Phase 2 logic to a backend was rejected by the project’s Mode A constraint.

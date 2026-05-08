# 0012 - Metrics And Observability

## Status

Accepted.

## Context

Mode A has no server metrics. The app processes camera and microphone input, so privacy matters.

## Decision

Ship no analytics in v1. Surface local FPS, renderer mode, audio energy, peer count, and permission state in the UI.

## Consequences

There is no usage dashboard. Users can inspect local health without sending telemetry.

## Alternatives Considered

- Plausible analytics was considered and deferred until there is a concrete product need.

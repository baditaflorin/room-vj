# 0045 - State Taxonomy And State Machine

## Status

Accepted.

## Context

The runtime previously had broad status strings but no explicit state taxonomy.

## Decision

Adopt explicit session states: idle, starting, live-ready, live-degraded, demo, and stopped. Input-health states degrade into warnings and recommended actions rather than implicit half-loaded states.

## Consequences

Every reachable state has an intentional message and exit path. The debug surface can show the exact state machine output.

## Alternatives Considered

- Keeping state implicit in ad hoc strings was rejected as too fragile.

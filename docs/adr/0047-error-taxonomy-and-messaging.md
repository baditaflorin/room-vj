# 0047 - Error Taxonomy And Messaging

## Status

Accepted.

## Context

The app needs actionable what/why/now-what messaging for weak or failed inputs.

## Decision

Map degraded conditions to domain-specific reason codes and user-facing labels. Every degraded state also carries a recommended action. Recoverable sync, light, and signal issues stay in the main flow instead of throwing fatal errors.

## Consequences

Users receive guidance instead of dead ends. The fixture suite can assert on meaningful messages rather than stack traces.

## Alternatives Considered

- Silent degradation was rejected because it hides wrongness.

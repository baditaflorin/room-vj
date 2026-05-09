# 0048 - Determinism And Reproducibility

## Status

Accepted.

## Context

Phase 2 requires same input, same output, especially for the real-data fixture suite.

## Decision

The inference engine is deterministic and pure over normalized frames. Fixture analysis uses a fixed provenance timestamp in tests. Real exports carry version, commit, schema version, source id, and generation time.

## Consequences

Regression tests can assert byte-for-byte equality for repeated fixture runs. Live artifacts remain inspectable with provenance.

## Alternatives Considered

- Allowing incidental randomness or hidden wall-clock dependence was rejected as a logic bug.

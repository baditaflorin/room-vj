# 0049 - Inspectability And Debug Surface

## Status

Accepted.

## Context

Phase 2 calls for explainable decisions and a power-user debug surface.

## Decision

Expose a `?debug=1` overlay that shows derived state and subsystem assessments. Keep the main UI concise, but let advanced users inspect the engine’s classifications, confidence, and reasons in-place.

## Consequences

Support and debugging are easier without adding a new screen or backend.

## Alternatives Considered

- Hiding all diagnostics behind development-only tooling was rejected because the user also needs visibility.

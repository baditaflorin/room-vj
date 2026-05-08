# 0013 - Testing Strategy

## Status

Accepted.

## Context

Hardware APIs are hard to test headlessly, but core math, storage, room codes, and smoke behavior are testable.

## Decision

Use Vitest for unit tests and Playwright for a static-site smoke test. `make test` runs unit tests. `make smoke` builds, serves `docs/`, and verifies the homepage, demo mode, links, and metadata.

## Consequences

The test suite stays fast enough for local hooks. Real camera/microphone behavior remains a manual acceptance test.

## Alternatives Considered

- Full automated media-device emulation was deferred because it adds complexity and still misses real-room behavior.

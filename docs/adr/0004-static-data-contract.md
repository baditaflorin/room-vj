# 0004 - Static Data Contract

## Status

Accepted.

## Context

Mode A has no backend data. The only public data fetched at runtime is optional GitHub commit metadata.

## Decision

There is no committed data API in v1. Version metadata is injected by Vite constants. The UI may fetch `https://api.github.com/repos/baditaflorin/room-vj/commits/main` to show the current public main-branch commit, falling back to a stable build constant when unavailable.

## Consequences

No schema migrations or data freshness jobs are needed. The app works offline after first load except for live peer signaling and optional GitHub metadata.

## Alternatives Considered

- Committed JSON metadata was unnecessary.
- A runtime API was rejected by ADR 0001.

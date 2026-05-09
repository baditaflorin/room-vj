# 0069 - Type-Safety Policy At Boundaries

## Status

Accepted.

## Context

The app still has a few ad hoc JSON casts and browser timer casts at real boundaries.

## Decision

Use schema-backed parsing or typed helper functions at every JSON boundary touched in Phase 3:

- imported session files
- copied session text
- URL share state
- GitHub metadata responses
- package metadata used by scripts where practical

Replace unsafe timer casts with browser-native timer types.

## Consequences

Completeness work improves reliability instead of introducing new hidden edge cases.

## Alternatives Considered

- Leaving existing casts in place was rejected because import/export makes those boundaries more important, not less.

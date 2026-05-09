# 0064 - DRY Consolidation Map

## Status

Accepted.

## Context

Session state currently lives across React state, URL helpers, local storage, and room-session internals without one canonical snapshot.

## Decision

Introduce one canonical session snapshot schema that powers:

- local persistence
- share URL encode/decode
- file export/import
- reset and restore logic

Also extract app presentation and session-state controls from `App.tsx` so the domain object can be reused without UI duplication.

## Consequences

New flows gain one source of truth instead of adding more ad hoc wiring.

## Alternatives Considered

- Keeping separate schemas for storage, URL, and exported files was rejected because it would recreate drift immediately.

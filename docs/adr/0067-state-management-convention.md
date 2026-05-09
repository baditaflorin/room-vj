# 0067 - State-Management Convention

## Status

Accepted.

## Context

The app currently splits state across React local state, local storage, URL params, and `RoomSession` internals without one explicit canonical object.

## Decision

Introduce a canonical `SessionSnapshot` domain object and treat it as the source of truth for:

- persisted user settings
- share links
- file import/export
- visible state controls

React state mirrors the snapshot for rendering, while `RoomSession` consumes updates through explicit setters.

## Consequences

The app can restore, reset, export, and import without bespoke wiring for each field.

## Alternatives Considered

- Adding more independent `useState` fields and bespoke storage calls was rejected because that keeps the state model fragmented.

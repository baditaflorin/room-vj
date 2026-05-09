# 0068 - Persistence Schema And Migration Policy

## Status

Accepted.

## Context

Phase 2 only stored palette, intensity, and room code. Phase 3 needs more complete persistence without breaking older saved data.

## Decision

Persist a versioned session snapshot schema. Support migration from the legacy settings shape into the new snapshot shape at read time. Exported files include the snapshot version. Invalid or unknown shapes fail validation with actionable errors.

## Consequences

Old local state is preserved where possible, and future schema changes have a clear place to hook migrations.

## Alternatives Considered

- Replacing the old local-storage key with a new undocumented shape was rejected because it would silently strand existing users.

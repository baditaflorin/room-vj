# 0066 - Error-Handling Convention

## Status

Accepted.

## Context

Room VJ already has strong domain-aware diagnostics in the inference engine, but several user-facing actions still collapse into generic failures.

## Decision

All interactive failures introduced or touched in Phase 3 must surface:

- what failed
- why it likely failed in product language
- what the user can do next

Boundary parsing errors use schema validation and return human-readable messages rather than exceptions leaking into the UI.

## Consequences

Import, paste, copy, and sync actions become supportable without opening devtools.

## Alternatives Considered

- Reusing terse generic errors was rejected because they leave strangers stuck.

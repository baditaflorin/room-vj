# 0070 - Documentation-Reality Alignment Process

## Status

Accepted.

## Context

The README and postmortems are only useful if they describe what a stranger can actually do today.

## Decision

Any user-facing workflow added in Phase 3 must satisfy all three conditions before it is claimed in the README:

1. it exists in the UI
2. it is covered by an automated test or smoke assertion
3. it is described with the same terminology used in the product

Claims that do not meet that bar are removed or rewritten.

## Consequences

Documentation becomes a verification surface instead of a wishlist.

## Alternatives Considered

- Keeping aspirational copy was rejected because it hides completeness gaps instead of fixing them.

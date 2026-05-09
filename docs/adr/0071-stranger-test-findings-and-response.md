# 0071 - Stranger-Test Findings And Response

## Status

Accepted.

## Context

Phase 3 requires a cold-user pass that exercises the product as a person would, not just as a unit-test harness would.

## Decision

Adopt the Phase 3 stranger test as a release gate for the save/share/reset/import loop. The first pass found two real bugs:

- current-tab reset tried to rewrite the URL to the GitHub Pages origin instead of the current origin
- file import touched the React synthetic event target after an `await`

Both were fixed before closing Phase 3.

## Consequences

The app now treats local Pages preview and deployed Pages behavior as two valid runtime contexts instead of assuming one hard-coded origin.

## Alternatives Considered

- Treating the stranger test as only a documentation step was rejected because it found real release-blocking issues.

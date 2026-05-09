# 0063 - Half-Baked Feature Triage Decisions

## Status

Accepted.

## Context

Several features exist in implied or partial form: deep links, silent restore, sync onboarding, and debug diagnostics. None should remain half-finished in production UI.

## Decision

- Deep links: keep and finish as versioned share-state URLs.
- Silent restore: keep and finish with visible session-state controls.
- Sync onboarding: keep and finish with explicit copy and intent-carrying links.
- Diagnostics overlay: keep and finish with export support.
- Hidden "settings" behavior: keep and finish as a visible state/settings surface.

No Phase 3 features are deleted outright, but hidden incomplete behavior is not allowed to remain implicit.

## Consequences

The app grows a real session-state workflow without expanding the product scope beyond the existing room-visualizer domain.

## Alternatives Considered

- Removing deep links and restore entirely was rejected because they are already part of how the app behaves.
- Leaving them implicit was rejected because that keeps the app confusing to strangers.

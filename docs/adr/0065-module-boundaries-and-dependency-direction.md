# 0065 - Module Boundaries And Dependency Direction

## Status

Accepted.

## Context

`App.tsx` and `roomSession.ts` both carry too many responsibilities, which makes completeness fixes easy to ship but hard to keep coherent.

## Decision

Adopt these boundaries:

- `lib/`: pure constants, math, persistence, and session-state helpers
- `features/session/`: runtime orchestration and analysis
- `features/sync/`: room-link and mesh concerns
- `app/`: React controller and presentation modules

React presentation modules may depend on feature and lib modules. Runtime feature modules may depend on lib modules. Lib modules may not depend on React or feature modules.

## Consequences

State import/export and restore logic can be tested independently from the visual UI.

## Alternatives Considered

- Leaving the current structure intact was rejected because it slows every completeness fix.

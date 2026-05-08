# 0011 - Logging Strategy

## Status

Accepted.

## Context

There is no server log stream in Mode A. Browser console noise should be minimal in production.

## Decision

Use user-visible status messages for expected errors such as permission denial or missing WebGPU. Avoid production console logs. Development-only diagnostics may use the console.

## Consequences

Users see actionable messages without needing devtools. Production smoke tests can fail on unexpected console errors.

## Alternatives Considered

- Remote logging was rejected because it would add analytics/privacy surface.

# 0014 - Error Handling Conventions

## Status

Accepted.

## Context

Browser capabilities vary widely. Permission denials and unsupported APIs are normal outcomes.

## Decision

Return typed status objects from session modules and show concise UI messages. Never throw from animation loops. Cleanup functions must be idempotent.

## Consequences

The app degrades to demo mode or lower-fidelity rendering instead of crashing.

## Alternatives Considered

- Global console-only failures were rejected because live users need visible recovery paths.

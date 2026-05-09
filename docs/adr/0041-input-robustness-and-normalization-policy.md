# 0041 - Input Robustness And Normalization Policy

## Status

Accepted.

## Context

Room VJ consumes noisy camera frames, microphone descriptors, pose estimates, and peer state. These inputs are partial, inconsistent, and sometimes adversarial.

## Decision

Normalize all runtime inputs into deterministic analysis frames before making inferences. Missing or weak inputs degrade into typed states such as silence, absent person, reflective room, or waiting-for-host instead of failing silently.

## Consequences

The UI can explain weak input in domain language. Fixture tests can exercise the same normalization path as the live app.

## Alternatives Considered

- Letting each subsystem interpret raw browser data independently was rejected because it makes behavior inconsistent and hard to test.

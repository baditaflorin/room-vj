# 0043 - Domain Vocabulary And UI Language

## Status

Accepted.

## Context

Users think in terms like dark room, glare, clipped speaker, waiting for host, and unstable tracking rather than raw metrics.

## Decision

All user-facing logic states use room-performance vocabulary: low light, reflective surfaces, speech, clipped audio, false-positive tracking, waiting for host, and healthy mesh.

## Consequences

The app explains failures in terms users can act on. Debug output still preserves structured classifications and reasons.

## Alternatives Considered

- Generic technical errors were rejected because they make the app feel opaque and toy-like.

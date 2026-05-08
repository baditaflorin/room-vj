# 0017 - Dependency Policy

## Status

Accepted.

## Context

The app depends on complex domains: GPU rendering, pose estimation, audio descriptors, and WebRTC.

## Decision

Use production-ready libraries where available: React, Vite, Three.js, MediaPipe Tasks Vision, Meyda, PeerJS, Zod, TanStack Query, Vitest, and Playwright. Avoid custom implementations for signaling, pose estimation, and audio feature extraction.

## Consequences

The app inherits maintenance from established packages while keeping custom code focused on orchestration and visual behavior.

## Alternatives Considered

- Hand-rolled pose detection, signaling, or DSP was rejected as too risky for v1.

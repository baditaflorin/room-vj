# 0006 - WASM And Browser DSP Modules

## Status

Accepted.

## Context

The concept references librosa. Python librosa is not suitable for runtime GitHub Pages. Browser live audio needs low-latency descriptors.

## Decision

Use Web Audio plus Meyda for live RMS, spectral centroid, spectral flux, and zero-crossing descriptors. Treat these as librosa-style descriptors for v1. MediaPipe Tasks Vision loads its browser WASM assets from the official package CDN. Future CQT/librosa-compatible WASM can be lazy-loaded after the app proves the live path.

## Consequences

Audio analysis runs locally with low latency and no secrets. The app avoids blocking initial load with large WASM modules.

## Alternatives Considered

- Running Python librosa in a backend was rejected by ADR 0001.
- Loading CQT WASM in v1 was deferred to protect the first-load asset budget.

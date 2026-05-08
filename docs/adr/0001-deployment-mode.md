# 0001 - Deployment Mode

## Status

Accepted.

## Context

Room VJ must be reachable by URL, avoid secrets, and keep the public surface simple. The core capabilities are camera input, microphone analysis, GPU shaders, pose detection, and peer synchronization.

## Decision

Use Mode A: Pure GitHub Pages. All runtime work happens in the browser with Web APIs, lazy-loaded WASM/browser libraries, IndexedDB/localStorage, and WebRTC data channels. The project owns no runtime backend. WebRTC signaling uses a static-friendly public PeerJS signaling service by default, with the peer traffic itself carried by WebRTC.

## Consequences

GitHub Pages can host the complete v1. Camera, microphone, WebGPU, and WebRTC require HTTPS, which Pages provides. Cross-device sync depends on public signaling availability and browser WebRTC support. If public signaling becomes unacceptable, a future ADR can move only signaling to Mode C.

## Alternatives Considered

- Mode B: no offline data pipeline is needed.
- Mode C: a backend would simplify signaling, but it adds operational burden and secrets without being required for v1.

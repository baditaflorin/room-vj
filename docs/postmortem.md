# Postmortem

## What Was Built

Room VJ v0.1.0 is a static GitHub Pages app with live/demo visualization, WebGPU shader rendering with Three.js fallback, Web Audio + Meyda analysis, MediaPipe pose tracking with motion fallback, coarse webcam room sampling, PeerJS/WebRTC sync, local hooks, tests, smoke checks, ADRs, and Pages deployment.

Live site:

https://baditaflorin.github.io/room-vj/

Repository:

https://github.com/baditaflorin/room-vj

## Was Mode A Correct?

Yes for v0.1.0. The browser can handle the first useful version without a project-owned backend. The only architectural pressure is signaling: PeerJS avoids operating a server, but production-grade rooms may eventually justify a tiny Mode C signaling service.

## What Worked

- GitHub Pages is enough for HTTPS, camera, microphone, WebGPU, and service worker scope.
- Lazy-loading keeps the first payload below the 200 KB gzipped budget.
- Demo mode makes smoke testing and unsupported hardware paths practical.
- Local hooks caught gitleaks config and smoke port issues before final push.

## What Did Not Work

- Embedding the git commit directly in the bundle made `docs/` dirty after each commit. The fix was to fetch the public `main` commit at runtime.
- A fixed smoke-test port collided with a stale local process. The fix was a randomized port.
- Browser "librosa" is not a drop-in runtime dependency; v1 uses Meyda for librosa-style live descriptors.

## Surprises

- The current Lucide package does not export a GitHub brand icon, so the UI uses a git fork icon for the repository link.
- Media-heavy builds are fine when split, but generated Pages assets need targeted cleaning because docs and build output share `docs/`.

## Accepted Tech Debt

- WebRTC sync depends on public PeerJS signaling.
- Room mapping is coarse surface/edge sampling, not true SLAM or calibrated projection mapping.
- Automated tests do not exercise real camera and microphone hardware.

## Next Improvements

1. Add a manual SDP fallback for rooms where PeerJS is blocked.
2. Add a calibration mode for pinning detected surfaces to projection zones.
3. Add a browser-compatible CQT/WASM audio descriptor path for richer music analysis.

## Time Spent Vs Estimate

Estimated: 3 to 5 hours for a solid static v1 scaffold and prototype.

Actual: about 3 hours, including repo creation, Pages setup, implementation, hooks, tests, smoke, and deployment.

# Phase 3 Feature Claims Audit

Audit date: 2026-05-10

Sources checked:

- `README.md`
- `docs/architecture.md`
- `docs/postmortem-phase2-substance.md`
- in-app labels and visible controls

| Claim                                                    | Status   | Notes                                                             |
| -------------------------------------------------------- | -------- | ----------------------------------------------------------------- |
| WebGPU with Three.js fallback                            | `green`  | Implemented                                                       |
| Live microphone analysis                                 | `green`  | Implemented                                                       |
| MediaPipe pose tracking with motion fallback             | `green`  | Implemented                                                       |
| Low-resolution room surface sampling                     | `green`  | Implemented                                                       |
| PeerJS/WebRTC room sync by room code                     | `yellow` | Works, but first-time join/host flow is still under-explained     |
| Real-data inference engine with confidence and actions   | `green`  | Implemented                                                       |
| Deterministic fixture suite                              | `green`  | Implemented                                                       |
| `?debug=1` overlay                                       | `green`  | Implemented                                                       |
| Version and commit visible in header                     | `green`  | Implemented                                                       |
| Public repo and PayPal links in live UI                  | `green`  | Implemented                                                       |
| "Could a stranger use it end-to-end for their own room?" | `red`    | Not yet true because save/reload/share/import workflow is missing |

Highest-priority mismatches:

1. Sync is described more confidently than it is onboarded.
2. The README suggests a durable usable app, but the product still lacks a real save/share/reload loop.
3. Debug is available but still support-oriented rather than user-legible.

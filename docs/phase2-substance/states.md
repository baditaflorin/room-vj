# State Taxonomy

Room VJ must make every reachable state intentional.

## Primary Session States

- `idle`: no active media or demo loop.
- `starting`: permissions or modules are loading.
- `live-ready`: media streams are active and analysis confidence is sufficient.
- `live-degraded`: media is active but one or more subsystems are weak, uncertain, or degraded.
- `demo`: synthetic mode with no device input.
- `stopped`: user explicitly stopped the session.

## Input Health States

- `camera-unavailable`
- `camera-low-light`
- `camera-reflective-glare`
- `camera-orientation-risk`
- `microphone-silent`
- `microphone-speech`
- `microphone-ambient`
- `microphone-clipped`
- `tracking-absent`
- `tracking-unstable`
- `tracking-false-positive-risk`
- `sync-offline`
- `sync-waiting-for-host`
- `sync-online-local-only`
- `sync-online-mesh`

## Exit Rules

- Every degraded state must present a next step.
- No recoverable state may clear user settings.
- Any pending operation longer than 300ms must surface progress.
- Any pending operation longer than 5s must present a cancel path.

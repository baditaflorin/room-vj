# Runbook

## Local Verification

```bash
make lint
make test
make smoke
```

## Common Issues

Camera or microphone denied:

- Use demo mode.
- Re-enable browser permissions for https://baditaflorin.github.io/room-vj/

WebGPU unavailable:

- The app falls back to Three.js WebGL.
- Try a current Chrome, Edge, or Safari Technology Preview build for WebGPU.

Sync unavailable:

- PeerJS public signaling may be blocked or temporarily unavailable.
- Local visuals continue without sync.

## Resource Expectations

- Recent laptop: target 30 FPS or better.
- Mobile: demo and sync are expected to work; MediaPipe and WebGPU support varies.
- No server CPU, RAM, disk, or backup plan is required because there is no backend.

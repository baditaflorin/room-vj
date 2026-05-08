# Architecture

Room VJ is a Mode A GitHub Pages application. Runtime work stays in the browser.

## Context

```mermaid
flowchart LR
  visitor["Room visitor"] --> roomvj["Room VJ static app"]
  roomvj --> pages["GitHub Pages"]
  roomvj --> github["GitHub public commits API"]
  roomvj --> peerjs["PeerJS public signaling"]
  roomvj <--> peers["Nearby browsers over WebRTC"]
```

## Containers

```mermaid
flowchart TB
  subgraph pages["GitHub Pages boundary"]
    docs["docs/ static files"]
  end

  subgraph browser["Browser"]
    react["React UI"]
    session["Session controller"]
    audio["Audio analyzer: Web Audio + Meyda"]
    vision["Person tracker: MediaPipe + motion fallback"]
    room["Room mapper: webcam surface sampling"]
    visual["Renderer: WebGPU WGSL or Three.js WebGL"]
    sync["Sync: PeerJS + WebRTC mesh"]
    storage["localStorage settings"]
  end

  docs --> react
  react --> session
  session --> audio
  session --> vision
  session --> room
  session --> visual
  session --> sync
  session --> storage
```

## Module Boundaries

- `src/features/audio/` extracts live music descriptors.
- `src/features/vision/` detects people and movement.
- `src/features/room/` samples coarse room surfaces.
- `src/features/visualizer/` renders shaders.
- `src/features/sync/` manages room links and WebRTC peers.
- `src/features/session/` coordinates browser permissions and frame updates.

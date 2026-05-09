# Fixture Schema

Each frame may include:

```json
{
  "audio": {
    "rms": 0.34,
    "energy": 0.41,
    "spectralCentroid": 0.62,
    "spectralFlux": 0.48,
    "zeroCrossingRate": 0.31,
    "beatPulse": 0.92,
    "beatCount": 12
  },
  "surface": {
    "brightness": 0.43,
    "edgeEnergy": 0.51,
    "planeCount": 26,
    "width": 16,
    "height": 9,
    "grid": []
  },
  "person": {
    "active": true,
    "centerX": 0.51,
    "centerY": 0.44,
    "radius": 0.17,
    "velocity": 0.21,
    "confidence": 0.88,
    "source": "mediapipe",
    "subjectCount": 1
  },
  "sync": {
    "roomCode": "ROOM42",
    "peerCount": 1,
    "leader": true,
    "remotePulse": 0.61,
    "remoteHue": 0.28,
    "latencyMs": 32,
    "status": "connected to 1 peer"
  }
}
```

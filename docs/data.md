# Data Contract

Room VJ is Mode A and has no static data pipeline in v0.1.0.

## Runtime Public Fetches

The app may fetch:

https://api.github.com/repos/baditaflorin/room-vj/commits/main

Expected response field:

```json
{
  "sha": "string"
}
```

If the fetch fails, the UI falls back to a stable build constant.

## Local State

`localStorage` key: `room-vj-settings`

```json
{
  "roomCode": "ROOM42",
  "palette": "prism",
  "intensity": 1
}
```

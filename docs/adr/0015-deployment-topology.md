# 0015 - Deployment Topology

## Status

Accepted.

## Context

Mode C topology is unnecessary for a pure static app.

## Decision

Deploy only to GitHub Pages. There is no Docker Compose stack, nginx, GHCR image, or server port.

## Consequences

Operational rollback is a git revert and Pages rebuild. WebRTC peer signaling relies on the configured public signaling provider.

## Alternatives Considered

- A Docker-hosted backend on port 25342 was rejected because Mode A is sufficient for v1.

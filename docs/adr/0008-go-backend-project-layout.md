# 0008 - Go Backend Project Layout

## Status

Accepted as not applicable.

## Context

The bootstrap template specifies Go layout for Mode B and Mode C projects.

## Decision

Do not create a Go backend in v1. There is no `cmd/`, `internal/`, `pkg/`, or server process.

## Consequences

Docker, Prometheus, nginx, and backend health endpoints are omitted. If signaling later moves to a project-owned service, a new ADR will introduce the Go layout.

## Alternatives Considered

- A tiny Go signaling server was rejected because public static-friendly signaling is enough for v1.

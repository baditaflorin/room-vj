# 0005 - Client-Side Storage Strategy

## Status

Accepted.

## Context

The app needs to remember non-sensitive user preferences such as palette, intensity, and last room code.

## Decision

Use `localStorage` with Zod validation for small settings. Do not store media streams, peer messages, or personal data.

## Consequences

Storage stays transparent and easy to reset. Invalid settings are ignored and replaced with defaults.

## Alternatives Considered

- IndexedDB and OPFS were considered but are unnecessary for v1 settings.

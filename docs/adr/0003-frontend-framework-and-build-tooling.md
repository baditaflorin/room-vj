# 0003 - Frontend Framework And Build Tooling

## Status

Accepted.

## Context

The UI needs stateful controls, live status, permission flow, and a canvas-heavy rendering surface.

## Decision

Use React, TypeScript strict mode, Vite, Tailwind CSS, Vitest, and Playwright. Vite builds directly into `docs/` for GitHub Pages.

## Consequences

The app has a familiar local workflow and fast builds. TypeScript catches integration issues across media APIs. Tailwind keeps the UI compact without adding a component framework.

## Alternatives Considered

- Vanilla TypeScript was possible, but React reduces friction for panels and state.
- Next.js was rejected because static Pages hosting and the asset budget are simpler with Vite.

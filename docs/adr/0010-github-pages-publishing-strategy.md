# 0010 - GitHub Pages Publishing Strategy

## Status

Accepted.

## Context

The live URL is a first-class deliverable and must work from day one. The repo also needs documentation under `docs/`.

## Decision

Publish GitHub Pages from the `main` branch `/docs` folder at `https://baditaflorin.github.io/room-vj/`. Vite uses `base: "/room-vj/"`, hashed assets, and `docs/404.html` as the SPA fallback. `docs/` is intentionally committed and not gitignored.

## Consequences

Docs and built site coexist in `docs/`. Builds use `emptyOutDir: false`, so ADRs remain intact. Rollback is a git revert of the publishing commit.

## Alternatives Considered

- `gh-pages` branch was rejected because source and published output are easier to inspect together for this v1.
- Root publishing was rejected because it would mix app assets into the repo root.

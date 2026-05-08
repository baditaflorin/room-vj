# 0016 - Local Git Hooks

## Status

Accepted.

## Context

The project intentionally avoids GitHub Actions. Checks must run locally.

## Decision

Use plain `.githooks/` wired by `make install-hooks`. Pre-commit runs formatting checks, lint, typecheck, and gitleaks. Commit messages are validated for Conventional Commits. Pre-push runs tests, build, and smoke.

## Consequences

Contributors must install hooks locally. The hooks are also exposed as `make hooks-*` targets.

## Alternatives Considered

- Lefthook was considered, but plain hooks reduce moving parts.

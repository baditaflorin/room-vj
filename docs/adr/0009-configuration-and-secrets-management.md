# 0009 - Configuration And Secrets Management

## Status

Accepted.

## Context

Mode A cannot keep runtime secrets. Browser configuration must be public.

## Decision

Use Vite build constants for public URLs and package metadata. Keep `.env*` ignored except `.env.example`. Do not require API keys. Run gitleaks in the pre-commit hook.

## Consequences

The frontend contains only public values. Any future secret-bearing feature requires a new ADR and cannot be hidden in the static bundle.

## Alternatives Considered

- Obfuscated frontend secrets were rejected because they are still secrets in git/browser code.

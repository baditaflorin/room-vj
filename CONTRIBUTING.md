# Contributing

Live site: https://baditaflorin.github.io/room-vj/

Repository: https://github.com/baditaflorin/room-vj

## Local Setup

```bash
npm install
make install-hooks
make dev
```

## Commit Rules

Use Conventional Commits:

```text
feat: add shader preset
fix: stabilize room sync
docs: update privacy notes
```

The local hooks run formatting, linting, TypeScript, gitleaks, tests, build, and smoke checks. There are no GitHub Actions in this repo.

## Pull Request Expectations

- Keep changes scoped.
- Add or update tests for logic changes.
- Run `make lint`, `make test`, and `make smoke`.
- Never commit secrets, real `.env` files, private keys, or credentials.

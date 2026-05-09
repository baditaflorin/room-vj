# 0040 - Real-Data Audit And Success Metrics

## Status

Accepted.

## Context

Phase 2 Substance needs a measurable definition of "smarter" based on messy room, audio, lighting, and sync conditions rather than demo behavior.

## Decision

Adopt ten real-data fixtures as the quality rubric and require deterministic fixture analysis in tests. The headline success metric is at least seven of ten fixtures completing the core flow without manual intervention beyond permission grants.

## Consequences

Logic regressions are blocked by fixture failures. Claims about improved intelligence must map back to fixture outcomes and pass-rate changes.

## Alternatives Considered

- Manual exploratory-only testing was rejected because it is not reproducible.
- Adding new UI features instead of logic improvements was rejected because it would polish a weak core.

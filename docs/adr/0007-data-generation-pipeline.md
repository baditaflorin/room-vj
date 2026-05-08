# 0007 - Data Generation Pipeline

## Status

Accepted as not applicable.

## Context

Mode B pipelines generate static artifacts before deployment. Room VJ v1 does not need precomputed datasets.

## Decision

Do not add a data-generation pipeline. `make data` is a no-op that documents Mode A.

## Consequences

No scheduled jobs, generated Parquet, SQLite, or JSON artifacts are maintained.

## Alternatives Considered

- A sample shader preset artifact was considered but static TypeScript constants are simpler.

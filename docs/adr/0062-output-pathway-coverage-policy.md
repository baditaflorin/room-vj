# 0062 - Output Pathway Coverage Policy

## Status

Accepted.

## Context

The live canvas is only one kind of output. For a browser-native room tool to be usable, users also need portable state and reproducible diagnostics.

## Decision

Treat the following as first-class output pathways:

- live visuals
- invite URL copy
- share URL that can recreate setup defaults
- downloadable session-state file
- copyable session-state text
- downloadable diagnostics JSON

Print views, screenshots, embed code, and API snippets are out of scope because the product does not claim them.

## Consequences

Completeness work must implement and test state export/import and diagnostics export before Phase 3 is considered done.

## Alternatives Considered

- Leaving live visuals as the only output was rejected because users cannot resume, share, or troubleshoot their setup.

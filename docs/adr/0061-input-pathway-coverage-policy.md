# 0061 - Input Pathway Coverage Policy

## Status

Accepted.

## Context

Room VJ is not a file-processing tool, so the generic Phase 3 input matrix must be translated into the inputs this product actually promises.

## Decision

Treat the following as first-class input pathways:

- camera and microphone permissions
- demo mode
- room-code entry
- deep links
- imported session-state files
- clipboard-pasted room links or session-state text
- restored local session state

Treat drag-and-drop, folder uploads, pasted HTML, and pasted images as out of scope for this product because they are not part of the declared user stories.

## Consequences

The app must support and test every first-class input path. Out-of-scope paths are documented explicitly so they do not remain ambiguous.

## Alternatives Considered

- Pretending every generic input path applies was rejected because it would force fake features into a camera-first product.

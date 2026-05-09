# Phase 3 Output Audit

Audit date: 2026-05-10

Status key:

- `green` - works fully for a real user
- `yellow` - works partially or with avoidable confusion
- `red` - expected but missing
- `gray` - not part of the product surface

| Output pathway                               | Status   | Current behavior in v0.2.0                                  | What a stranger needs          |
| -------------------------------------------- | -------- | ----------------------------------------------------------- | ------------------------------ |
| Live visual output on canvas                 | `green`  | Core visuals render in demo and live mode                   | Keep                           |
| Copy invite URL                              | `green`  | URL copies to clipboard                                     | Keep                           |
| Shareable URL that recreates session choices | `red`    | URL only carries `room`                                     | Add versioned share-state URL  |
| Downloadable session state file              | `red`    | No export path                                              | Add JSON export                |
| Import/export round trip                     | `red`    | No import/export pair exists                                | Add schema-backed state bundle |
| Diagnostics export                           | `red`    | Debug overlay exists, but it cannot be taken out of the app | Add JSON export                |
| Visible confirmation after copy/export       | `yellow` | Invite copy confirms; other outputs do not exist            | Add uniform confirmations      |
| Screenshot / print / embed code              | `gray`   | Not part of the declared product                            | Keep out of scope and document |
| API / curl-ready output                      | `gray`   | No runtime backend exists                                   | Keep out of scope and document |

Summary:

- `green`: 2
- `yellow`: 1
- `red`: 4
- `gray`: 2

Top blockers:

1. Users cannot save or reload a working setup.
2. There is no portable diagnostics artifact for support or reproduction.
3. Shared links are too thin to count as a true output path.

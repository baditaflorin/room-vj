# Phase 3 Output Audit

Audit date: 2026-05-10

Status key:

- `green` - works fully for a real user
- `yellow` - works partially or with avoidable confusion
- `red` - expected but missing
- `gray` - not part of the product surface

| Output pathway                               | Status  | Final behavior in v0.3.0                                                       | Notes                    |
| -------------------------------------------- | ------- | ------------------------------------------------------------------------------ | ------------------------ |
| Live visual output on canvas                 | `green` | Core visuals render in demo and live mode                                      | Shipped                  |
| Copy invite URL                              | `green` | `Copy Link` writes the share URL                                               | Shipped                  |
| Shareable URL that recreates session choices | `green` | Share URL includes room, palette, intensity, sync intent, launch intent, debug | Shipped                  |
| Downloadable session state file              | `green` | `Download State` exports a versioned JSON file                                 | Shipped                  |
| Import/export round trip                     | `green` | Exported state imports back and restores the same session choices              | Shipped                  |
| Diagnostics export                           | `green` | `Export Diagnostics` downloads a portable JSON artifact                        | Shipped                  |
| Visible confirmation after copy/export       | `green` | Copy, export, import, reset, and diagnostics actions all show explicit notices | Shipped                  |
| Screenshot / print / embed code              | `gray`  | Not part of the declared product                                               | Out of scope by ADR 0062 |
| API / curl-ready output                      | `gray`  | No runtime backend exists                                                      | Out of scope by ADR 0062 |

Summary after implementation:

- `green`: 7
- `yellow`: 0
- `red`: 0
- `gray`: 2

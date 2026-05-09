# Phase 3 Controls Audit

Audit date: 2026-05-10

| Control          | Status   | Current behavior in v0.2.0                                                             | Gap                                     |
| ---------------- | -------- | -------------------------------------------------------------------------------------- | --------------------------------------- |
| `Start Live`     | `green`  | Requests devices and starts live mode                                                  | Keep                                    |
| `Demo`           | `green`  | Starts synthetic mode                                                                  | Keep                                    |
| `Stop`           | `yellow` | Stops the loop, but the app does not clearly preserve or reset the rest of the session | Add explicit reset/export semantics     |
| Palette swatches | `green`  | Persist and update visuals                                                             | Keep                                    |
| Intensity slider | `green`  | Persists and updates visuals                                                           | Keep                                    |
| Room code field  | `green`  | Normalizes text and persists                                                           | Keep                                    |
| `Host`           | `yellow` | Works, but does not explain what "host" means to a first-time user                     | Add inline help and share intent        |
| `Join`           | `yellow` | Works, but a deep-linked room does not guide the next step                             | Add auto-join intent or clear next step |
| `Copy` invite    | `green`  | Copies URL and confirms                                                                | Keep                                    |
| Repo link        | `green`  | Opens the repo                                                                         | Keep                                    |
| PayPal link      | `green`  | Opens PayPal                                                                           | Keep                                    |
| Debug overlay    | `yellow` | Exists via `?debug=1`, but no in-app explanation or export                             | Add explicit import/export and help     |

Control conclusions:

1. No button is a dead stub, which is good.
2. Several controls are still under-explained, especially around sync.
3. The control surface is too thin for a user who needs to save, reload, or share a working setup.

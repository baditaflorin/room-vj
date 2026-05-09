# Phase 3 Input Audit

Audit date: 2026-05-10

Status key:

- `green` - works fully for a real user
- `yellow` - works partially or with avoidable confusion
- `red` - claimed, implied, or expected but not actually usable
- `gray` - not part of the product surface and should stay out of scope

| Input pathway                            | Status  | Final behavior in v0.3.0                                                           | Notes                    |
| ---------------------------------------- | ------- | ---------------------------------------------------------------------------------- | ------------------------ |
| Camera + microphone permission grant     | `green` | `Start Live` requests both and starts the session on success                       | Shipped                  |
| Demo mode                                | `green` | `Demo` starts synthetic visuals without permissions                                | Shipped                  |
| Deep link with `?room=`                  | `green` | Share links restore room code, palette, intensity, sync intent, mode intent, debug | Shipped                  |
| Restored local settings                  | `green` | Local session restore is explicit in the UI and resettable                         | Shipped                  |
| Manual room-code entry                   | `green` | Input normalizes values and can host or join                                       | Shipped                  |
| Clipboard write of invite URL            | `green` | `Copy Link` writes the share URL                                                   | Shipped                  |
| Clipboard read of invite URL / room code | `green` | `Paste Link / State` reads a Room VJ link, room code, or session JSON              | Shipped                  |
| Importing saved session state            | `green` | `Import State` accepts validated session JSON                                      | Shipped                  |
| Loading session state from a shared URL  | `green` | Shared URLs hydrate visible session state and can auto-join                        | Shipped                  |
| Restoring last workflow after reload     | `green` | Launch intent, room code, palette, intensity, debug, and sync intent persist       | Shipped                  |
| Mobile share-sheet / file picker import  | `green` | Standard file input works for mobile-capable pickers                               | Shipped                  |
| Drag and drop                            | `gray`  | Not a natural fit for this product                                                 | Out of scope by ADR 0061 |
| Paste HTML / image / multi-file / folder | `gray`  | Not part of the product domain                                                     | Out of scope by ADR 0061 |

Summary after implementation:

- `green`: 11
- `yellow`: 0
- `red`: 0
- `gray`: 2

# Phase 3 Input Audit

Audit date: 2026-05-10

Status key:

- `green` - works fully for a real user
- `yellow` - works partially or with avoidable confusion
- `red` - claimed, implied, or expected but not actually usable
- `gray` - not part of the product surface and should stay out of scope

| Input pathway                            | Status   | Current behavior in v0.2.0                                       | What a stranger needs                        |
| ---------------------------------------- | -------- | ---------------------------------------------------------------- | -------------------------------------------- |
| Camera + microphone permission grant     | `green`  | `Start Live` requests both and starts the session on success     | Keep                                         |
| Demo mode                                | `green`  | `Demo` starts synthetic visuals without permissions              | Keep                                         |
| Deep link with `?room=`                  | `yellow` | Room code pre-fills, but the app does not explain or auto-use it | Auto-join intent or explicit guidance        |
| Restored local settings                  | `yellow` | Palette, intensity, and room code restore silently               | Restore should be explicit and resettable    |
| Manual room-code entry                   | `green`  | Input normalizes values and can host or join                     | Keep                                         |
| Clipboard write of invite URL            | `green`  | `Copy` writes the invite URL                                     | Keep                                         |
| Clipboard read of invite URL / room code | `red`    | No paste/import affordance besides the raw text input            | Add explicit paste/import path               |
| Importing saved session state            | `red`    | Not supported                                                    | Add file import and validation               |
| Loading session state from a shared URL  | `red`    | Only room code survives in the URL                               | Add full shareable URL contract              |
| Restoring last workflow after reload     | `yellow` | Preferences restore, but sync intent and recent mode do not      | Persist enough state to resume cleanly       |
| Mobile share-sheet / file picker import  | `red`    | No import surface exists                                         | Add file input that works on mobile browsers |
| Drag and drop                            | `gray`   | Not a natural fit for this product                               | Keep out of scope and document               |
| Paste HTML / image / multi-file / folder | `gray`   | Not part of the product domain                                   | Keep out of scope and document               |

Summary:

- `green`: 4
- `yellow`: 3
- `red`: 4
- `gray`: 4

Top blockers:

1. There is no durable session import path.
2. Shared links only carry the room code, not the user-visible setup choices.
3. The app restores state silently, so users cannot tell whether they are resuming an old setup or starting fresh.

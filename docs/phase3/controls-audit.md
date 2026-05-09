# Phase 3 Controls Audit

Audit date: 2026-05-10

| Control              | Status  | Final behavior in v0.3.0                                                   |
| -------------------- | ------- | -------------------------------------------------------------------------- |
| `Start Live`         | `green` | Requests devices and starts live mode                                      |
| `Demo`               | `green` | Starts synthetic mode                                                      |
| `Stop`               | `green` | Stops playback while keeping session state available for save/share/import |
| Palette swatches     | `green` | Persist and update visuals                                                 |
| Intensity slider     | `green` | Persists and updates visuals                                               |
| Room code field      | `green` | Normalizes text and persists                                               |
| `Host`               | `green` | Hosts the current room and the UI explains what hosting means              |
| `Join`               | `green` | Joins the current room and can be driven by a shared URL                   |
| `Copy Link`          | `green` | Copies the share URL and confirms                                          |
| `Paste Link / State` | `green` | Reads clipboard text and applies a room link, room code, or session JSON   |
| `Download State`     | `green` | Downloads a versioned session JSON file                                    |
| `Copy State`         | `green` | Copies session JSON to the clipboard                                       |
| `Import State`       | `green` | Loads session JSON from a file                                             |
| `Export Diagnostics` | `green` | Downloads current diagnostics JSON                                         |
| `Disconnect`         | `green` | Ends sync while keeping local visuals running                              |
| `Start Fresh`        | `green` | Clears local and URL state and generates a new room code                   |
| Repo link            | `green` | Opens the repo                                                             |
| PayPal link          | `green` | Opens PayPal                                                               |
| Debug overlay        | `green` | Exists in the UI as a real toggle and can be carried in links and exports  |

Control conclusions:

1. No production control is a stub.
2. The app now has a complete save/share/import/reset loop.
3. Sync actions are still the highest-cognitive-load part of the surface, but they are now explained in-product.

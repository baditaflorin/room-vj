# Security Policy

## Supported Version

The current supported line is `0.1.x`.

## Reporting A Vulnerability

Report security issues through GitHub private vulnerability reporting on:

https://github.com/baditaflorin/room-vj/security

Fallback disclosure email:

florinbadita@users.noreply.github.com

Please do not open a public issue for an unpatched vulnerability.

## Security Notes

- The frontend contains no secrets.
- Camera and microphone streams stay in the browser.
- WebRTC peer traffic is browser-to-browser.
- Public PeerJS signaling is used only to establish WebRTC connections.
- Gitleaks runs in the local pre-commit hook.

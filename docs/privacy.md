# Privacy

Room VJ ships no analytics in v0.1.0.

## Camera And Microphone

Camera and microphone permissions are requested only when pressing `Start Live`. Streams are processed locally in the browser for room sampling, pose/motion tracking, and audio descriptors. The project does not upload raw camera or microphone data.

## WebRTC Sync

Room sync uses public PeerJS signaling to establish browser-to-browser WebRTC data channels. Sync messages contain timing, beat pulse, hue, and peer metadata. They do not contain audio, video, or user identity.

## GitHub Metadata

The header fetches public commit metadata from:

https://api.github.com/repos/baditaflorin/room-vj/commits/main

This is used only to display the current public commit.

## Local Storage

The app stores palette, intensity, and the last room code in `localStorage`.

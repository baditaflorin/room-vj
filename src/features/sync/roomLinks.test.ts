import { describe, expect, it, vi } from "vitest";
import {
  applySnapshotToLocation,
  clearShareStateFromLocation,
  createShareUrl,
  normalizeRoomCode,
  parseClipboardState,
  snapshotFromUrl,
} from "./roomLinks";
import { fallbackSessionSnapshot } from "../../lib/storage";

describe("room links", () => {
  it("normalizes room codes for URLs and PeerJS ids", () => {
    expect(normalizeRoomCode(" vj-12 room ")).toBe("VJ12ROOM");
  });

  it("creates GitHub Pages share URLs", () => {
    expect(
      createShareUrl({
        ...fallbackSessionSnapshot,
        roomCode: "ROOM42",
        palette: "thermal",
        intensity: 1.35,
        syncIntent: "join",
        launchMode: "demo",
        debug: true,
      }),
    ).toBe(
      "https://baditaflorin.github.io/room-vj/?room=ROOM42&palette=thermal&intensity=1.35&sync=join&mode=demo&debug=1",
    );
  });

  it("reads session state from the current URL", () => {
    expect(
      snapshotFromUrl(
        new URL(
          "https://baditaflorin.github.io/room-vj/?room=abc123&palette=noir&intensity=1.7&sync=join&mode=demo&debug=1",
        ),
      ),
    ).toMatchObject({
      roomCode: "ABC123",
      palette: "noir",
      intensity: 1.7,
      syncIntent: "join",
      launchMode: "demo",
      debug: true,
    });
  });

  it("parses room links from the clipboard", () => {
    expect(
      parseClipboardState(
        "https://baditaflorin.github.io/room-vj/?room=abc123&sync=join",
      ),
    ).toMatchObject({
      kind: "room-link",
      snapshot: expect.objectContaining({ roomCode: "ABC123" }),
    });
  });

  it("updates and clears the current location", () => {
    const replaceState = vi
      .spyOn(window.history, "replaceState")
      .mockImplementation(() => {});
    window.history.replaceState({}, "", "http://127.0.0.1:4174/room-vj/");
    applySnapshotToLocation({
      ...fallbackSessionSnapshot,
      roomCode: "ROOM42",
      syncIntent: "join",
    });
    expect(replaceState).toHaveBeenCalledWith(
      {},
      "",
      "http://localhost:3000/?room=ROOM42&palette=prism&intensity=1.00&sync=join",
    );
    clearShareStateFromLocation();
    expect(replaceState).toHaveBeenLastCalledWith(
      {},
      "",
      "http://localhost:3000/",
    );
  });
});

import { describe, expect, it, vi } from "vitest";
import { createRoomUrl, normalizeRoomCode, roomCodeFromUrl } from "./roomLinks";

describe("room links", () => {
  it("normalizes room codes for URLs and PeerJS ids", () => {
    expect(normalizeRoomCode(" vj-12 room ")).toBe("VJ12ROOM");
  });

  it("creates GitHub Pages invite URLs", () => {
    expect(createRoomUrl("ROOM42")).toBe(
      "https://baditaflorin.github.io/room-vj/?room=ROOM42",
    );
  });

  it("reads a room code from the current URL", () => {
    vi.stubGlobal(
      "location",
      new URL("https://baditaflorin.github.io/room-vj/?room=abc123"),
    );
    expect(roomCodeFromUrl()).toBe("ABC123");
    vi.unstubAllGlobals();
  });
});

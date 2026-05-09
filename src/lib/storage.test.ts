import { beforeEach, describe, expect, it } from "vitest";
import {
  clearSessionSnapshot,
  createSessionExport,
  fallbackSessionSnapshot,
  parseSessionImport,
  readSessionSnapshot,
  writeSessionSnapshot,
} from "./storage";

describe("settings storage", () => {
  beforeEach(() => localStorage.clear());

  it("returns defaults when storage is empty", () => {
    expect(readSessionSnapshot()).toEqual(fallbackSessionSnapshot);
  });

  it("round-trips valid settings", () => {
    writeSessionSnapshot({
      ...fallbackSessionSnapshot,
      palette: "thermal",
      intensity: 1.4,
      roomCode: "ROOM42",
      syncIntent: "join",
      launchMode: "demo",
    });
    expect(readSessionSnapshot()).toEqual({
      ...fallbackSessionSnapshot,
      palette: "thermal",
      intensity: 1.4,
      roomCode: "ROOM42",
      syncIntent: "join",
      launchMode: "demo",
    });
  });

  it("ignores invalid stored settings", () => {
    localStorage.setItem(
      "room-vj-session",
      JSON.stringify({ palette: "bad", intensity: 100 }),
    );
    expect(readSessionSnapshot()).toEqual(fallbackSessionSnapshot);
  });

  it("migrates legacy settings", () => {
    localStorage.setItem(
      "room-vj-settings",
      JSON.stringify({ palette: "noir", intensity: 0.7, roomCode: "ROOM42" }),
    );
    expect(readSessionSnapshot()).toEqual({
      ...fallbackSessionSnapshot,
      palette: "noir",
      intensity: 0.7,
      roomCode: "ROOM42",
    });
  });

  it("exports and imports session snapshots", () => {
    const exported = createSessionExport({
      ...fallbackSessionSnapshot,
      roomCode: "GLOW88",
      syncIntent: "join",
      debug: true,
    });
    expect(parseSessionImport(JSON.stringify(exported, null, 2))).toMatchObject(
      {
        roomCode: "GLOW88",
        syncIntent: "join",
        debug: true,
      },
    );
  });

  it("clears stored session state", () => {
    writeSessionSnapshot(fallbackSessionSnapshot);
    clearSessionSnapshot();
    expect(readSessionSnapshot()).toEqual(fallbackSessionSnapshot);
  });
});

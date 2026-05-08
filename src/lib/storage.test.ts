import { beforeEach, describe, expect, it } from "vitest";
import { readSettings, writeSettings } from "./storage";

describe("settings storage", () => {
  beforeEach(() => localStorage.clear());

  it("returns defaults when storage is empty", () => {
    expect(readSettings()).toMatchObject({ palette: "prism", intensity: 1 });
  });

  it("round-trips valid settings", () => {
    writeSettings({ palette: "thermal", intensity: 1.4, roomCode: "ROOM42" });
    expect(readSettings()).toEqual({
      palette: "thermal",
      intensity: 1.4,
      roomCode: "ROOM42",
    });
  });

  it("ignores invalid stored settings", () => {
    localStorage.setItem(
      "room-vj-settings",
      JSON.stringify({ palette: "bad", intensity: 100 }),
    );
    expect(readSettings()).toMatchObject({ palette: "prism", intensity: 1 });
  });
});

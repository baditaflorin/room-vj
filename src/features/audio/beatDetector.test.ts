import { describe, expect, it } from "vitest";
import { createBeatDetectorState, updateBeatDetector } from "./beatDetector";

describe("beat detector", () => {
  it("fires on an energy spike after the refractory window", () => {
    let state = createBeatDetectorState();
    state = updateBeatDetector(state, 0.04, 0);
    state = updateBeatDetector(state, 0.9, 250);

    expect(state.beatCount).toBe(1);
    expect(state.beatPulse).toBe(1);
  });

  it("does not double count beats inside the refractory window", () => {
    let state = createBeatDetectorState();
    state = updateBeatDetector(state, 0.9, 250);
    state = updateBeatDetector(state, 0.95, 300);

    expect(state.beatCount).toBe(1);
  });
});

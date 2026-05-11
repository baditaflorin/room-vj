import { describe, expect, it } from "vitest";
import {
  createBeatDetectorState,
  estimateBpm,
  updateBeatDetector,
} from "./beatDetector";

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

  it("estimates BPM from a 120 BPM pulse train", () => {
    // 120 BPM = one beat every 500 ms.
    let state = createBeatDetectorState();
    for (let i = 0; i < 12; i += 1) {
      state = updateBeatDetector(state, 0.9, i * 500);
    }
    expect(state.bpm).toBeGreaterThan(115);
    expect(state.bpm).toBeLessThan(125);
    expect(state.tempoConfidence).toBeGreaterThan(0.8);
  });

  it("folds half-time intervals back into the standard 60-180 range", () => {
    // 240 BPM = 250 ms intervals — but refractory rejects that. So feed
    // 80 BPM (750 ms) and verify we get the same range back (not 40 BPM).
    let state = createBeatDetectorState();
    for (let i = 0; i < 10; i += 1) {
      state = updateBeatDetector(state, 0.9, i * 750);
    }
    expect(state.bpm).toBeGreaterThan(75);
    expect(state.bpm).toBeLessThan(85);
  });

  it("reports low tempo confidence for jittery beats", () => {
    let state = createBeatDetectorState();
    const intervals = [400, 800, 420, 760, 380, 820, 410];
    let now = 0;
    for (const interval of intervals) {
      now += interval;
      state = updateBeatDetector(state, 0.9, now);
    }
    expect(state.tempoConfidence).toBeLessThan(0.6);
  });

  it("returns zero BPM for fewer than two intervals", () => {
    expect(estimateBpm([])).toEqual({ bpm: 0, confidence: 0 });
    expect(estimateBpm([500])).toEqual({ bpm: 0, confidence: 0 });
  });
});

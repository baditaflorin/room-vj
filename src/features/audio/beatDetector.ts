import { clamp, smooth } from "../../lib/math";

export interface BeatDetectorState {
  beatCount: number;
  beatPulse: number;
  energyFloor: number;
  lastBeatAt: number;
}

export function createBeatDetectorState(): BeatDetectorState {
  return {
    beatCount: 0,
    beatPulse: 0,
    energyFloor: 0.04,
    lastBeatAt: 0,
  };
}

export function updateBeatDetector(
  state: BeatDetectorState,
  energy: number,
  now: number,
): BeatDetectorState {
  const floor = smooth(state.energyFloor, energy, 0.04);
  const threshold = Math.max(0.1, floor * 1.65);
  const beatReady = now - state.lastBeatAt > 190;
  const isBeat = energy > threshold && beatReady;
  const decayedPulse = Math.max(0, state.beatPulse - 0.055);

  return {
    energyFloor: floor,
    beatCount: state.beatCount + (isBeat ? 1 : 0),
    beatPulse: clamp(isBeat ? 1 : decayedPulse),
    lastBeatAt: isBeat ? now : state.lastBeatAt,
  };
}

import { clamp, smooth } from "../../lib/math";

/**
 * Beat detector that keeps a rolling history of recent inter-beat intervals
 * and estimates BPM from the median interval. Median is chosen over mean to
 * stay robust against the occasional missed or doubled beat.
 *
 * The IBI history is capped at MAX_IBI_HISTORY entries (~last 16 beats).
 * BPM is reported in standard music range (60–180); intervals outside the
 * 333 ms (180 BPM) – 1000 ms (60 BPM) window are still recorded but a low
 * tempoConfidence is reported so consumers can fade BPM-driven effects.
 */
export interface BeatDetectorState {
  beatCount: number;
  beatPulse: number;
  energyFloor: number;
  lastBeatAt: number;
  intervals: number[];
  bpm: number;
  tempoConfidence: number;
}

const MAX_IBI_HISTORY = 16;
const MIN_INTERVAL_MS = 333; // 180 BPM upper bound
const MAX_INTERVAL_MS = 1500; // 40 BPM lower bound (we still consider half-time)
const REFRACTORY_MS = 190;

export function createBeatDetectorState(): BeatDetectorState {
  return {
    beatCount: 0,
    beatPulse: 0,
    energyFloor: 0.04,
    lastBeatAt: 0,
    intervals: [],
    bpm: 0,
    tempoConfidence: 0,
  };
}

export function updateBeatDetector(
  state: BeatDetectorState,
  energy: number,
  now: number,
): BeatDetectorState {
  const floor = smooth(state.energyFloor, energy, 0.04);
  const threshold = Math.max(0.1, floor * 1.65);
  const beatReady = now - state.lastBeatAt > REFRACTORY_MS;
  const isBeat = energy > threshold && beatReady;
  const decayedPulse = Math.max(0, state.beatPulse - 0.055);

  let intervals = state.intervals;
  let bpm = state.bpm;
  let tempoConfidence = state.tempoConfidence;

  if (isBeat && state.lastBeatAt > 0) {
    const interval = now - state.lastBeatAt;
    if (interval >= MIN_INTERVAL_MS && interval <= MAX_INTERVAL_MS) {
      intervals = appendInterval(intervals, interval);
      const estimate = estimateBpm(intervals);
      bpm = estimate.bpm;
      tempoConfidence = estimate.confidence;
    }
  }

  return {
    energyFloor: floor,
    beatCount: state.beatCount + (isBeat ? 1 : 0),
    beatPulse: clamp(isBeat ? 1 : decayedPulse),
    lastBeatAt: isBeat ? now : state.lastBeatAt,
    intervals,
    bpm,
    tempoConfidence,
  };
}

function appendInterval(history: number[], interval: number): number[] {
  if (history.length < MAX_IBI_HISTORY) {
    return [...history, interval];
  }
  return [...history.slice(1), interval];
}

interface BpmEstimate {
  bpm: number;
  confidence: number;
}

/**
 * Estimate BPM from inter-beat intervals using the median, then verify the
 * estimate by checking how many intervals agree with it within a tolerance
 * window. A high agreement ratio yields high confidence; otherwise we fall
 * back to "low confidence" so callers can fade tempo-driven effects.
 */
export function estimateBpm(intervals: readonly number[]): BpmEstimate {
  if (intervals.length < 2) return { bpm: 0, confidence: 0 };
  const sorted = [...intervals].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)] ?? 0;
  if (median <= 0) return { bpm: 0, confidence: 0 };
  const rawBpm = 60_000 / median;
  // Fold half/double-time estimates back into [60, 180] so a single steady
  // beat doesn't flip between 60 and 120 each step.
  let bpm = rawBpm;
  while (bpm < 60) bpm *= 2;
  while (bpm > 180) bpm /= 2;
  const tolerance = median * 0.12;
  let agreeing = 0;
  for (const value of intervals) {
    if (Math.abs(value - median) <= tolerance) agreeing += 1;
  }
  const confidence = clamp(agreeing / intervals.length);
  return { bpm: Math.round(bpm * 10) / 10, confidence };
}

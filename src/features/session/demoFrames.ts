import { clamp } from "../../lib/math";
import type { AudioFeatures, PersonFrame } from "./types";

export function createDemoAudioFeatures(now: number): AudioFeatures {
  const kick = Math.pow(Math.max(0, Math.sin(now / 310)), 10);
  const shimmer = (Math.sin(now / 970) + 1) / 2;
  return {
    rms: clamp(0.25 + kick * 0.75),
    energy: clamp(0.18 + kick * 0.82),
    spectralCentroid: clamp(0.35 + shimmer * 0.5),
    spectralFlux: clamp(kick * 0.8 + shimmer * 0.2),
    zeroCrossingRate: clamp(0.2 + Math.sin(now / 1400) * 0.15),
    beatPulse: kick > 0.82 ? 1 : clamp(kick),
    beatCount: Math.floor(now / 620),
  };
}

export function createDemoPersonFrame(now: number): PersonFrame {
  return {
    active: true,
    centerX: 0.5 + Math.sin(now / 1700) * 0.22,
    centerY: 0.52 + Math.cos(now / 2300) * 0.12,
    radius: 0.18 + Math.sin(now / 700) * 0.025,
    velocity: 0.35 + Math.abs(Math.cos(now / 900)) * 0.45,
    confidence: 0.92,
    source: "demo",
  };
}

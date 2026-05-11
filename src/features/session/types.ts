export type PaletteName = "prism" | "thermal" | "noir";

export type PermissionStateName =
  | "idle"
  | "requesting"
  | "granted"
  | "denied"
  | "unavailable";

export interface AudioFeatures {
  rms: number;
  energy: number;
  spectralCentroid: number;
  spectralFlux: number;
  zeroCrossingRate: number;
  beatPulse: number;
  beatCount: number;
  bpm: number;
  tempoConfidence: number;
}

export interface SurfaceFrame {
  brightness: number;
  edgeEnergy: number;
  planeCount: number;
  grid: number[];
  width: number;
  height: number;
}

export interface PersonFrame {
  active: boolean;
  centerX: number;
  centerY: number;
  radius: number;
  velocity: number;
  confidence: number;
  subjectCount?: number;
  source: "mediapipe" | "motion" | "demo" | "none";
}

export interface SyncFrame {
  roomCode?: string;
  peerCount: number;
  leader: boolean;
  remotePulse: number;
  remoteHue: number;
  latencyMs: number;
  status: string;
}

export interface VisualizerFrame {
  audio: AudioFeatures;
  surface: SurfaceFrame;
  person: PersonFrame;
  sync: SyncFrame;
  palette: PaletteName;
  intensity: number;
}

export interface RuntimeStatus {
  mode: "idle" | "demo" | "live";
  renderer: string;
  fps: number;
  camera: PermissionStateName;
  microphone: PermissionStateName;
  vision: string;
  sync: SyncFrame;
  message: string;
  recommendedAction: string;
  sessionConfidence: number;
  warnings: string[];
  audio: AudioFeatures;
  person: PersonFrame;
  surface: SurfaceFrame;
  diagnostics?: import("./analysisTypes").SessionDiagnostics;
}

export const emptyAudioFeatures: AudioFeatures = {
  rms: 0,
  energy: 0,
  spectralCentroid: 0,
  spectralFlux: 0,
  zeroCrossingRate: 0,
  beatPulse: 0,
  beatCount: 0,
  bpm: 0,
  tempoConfidence: 0,
};

export const emptySurfaceFrame: SurfaceFrame = {
  brightness: 0,
  edgeEnergy: 0,
  planeCount: 0,
  grid: [],
  width: 16,
  height: 9,
};

export const emptyPersonFrame: PersonFrame = {
  active: false,
  centerX: 0.5,
  centerY: 0.5,
  radius: 0,
  velocity: 0,
  confidence: 0,
  subjectCount: 0,
  source: "none",
};

export const emptySyncFrame: SyncFrame = {
  peerCount: 0,
  leader: true,
  remotePulse: 0,
  remoteHue: 0,
  latencyMs: 0,
  status: "offline",
};

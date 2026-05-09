import type {
  AudioFeatures,
  PermissionStateName,
  PersonFrame,
  SurfaceFrame,
  SyncFrame,
} from "./types";

export type AudioClass = "silence" | "music" | "speech" | "ambient" | "clipped";

export type RoomClass =
  | "usable"
  | "low-light"
  | "reflective"
  | "flat"
  | "flickery";

export type TrackingClass =
  | "stable"
  | "absent"
  | "unstable"
  | "false-positive-risk"
  | "multi-subject-risk";

export type SyncClass =
  | "offline"
  | "waiting-for-host"
  | "local-only"
  | "mesh"
  | "unstable";

export interface ConfidenceReason {
  code: string;
  label: string;
}

export interface AudioAssessment {
  classification: AudioClass;
  confidence: number;
  clipped: boolean;
  signalStrength: number;
  reasons: ConfidenceReason[];
}

export interface RoomAssessment {
  classification: RoomClass;
  confidence: number;
  usablePlaneRatio: number;
  glareRisk: number;
  flickerRisk: number;
  reasons: ConfidenceReason[];
}

export interface PersonAssessment {
  classification: TrackingClass;
  confidence: number;
  subjectCount: number;
  reasons: ConfidenceReason[];
}

export interface SyncAssessment {
  classification: SyncClass;
  confidence: number;
  nextStep: string;
  reasons: ConfidenceReason[];
}

export interface AnalysisSnapshot {
  audio: AudioFeatures;
  surface: SurfaceFrame;
  person: PersonFrame;
  sync: SyncFrame;
  audioAssessment: AudioAssessment;
  roomAssessment: RoomAssessment;
  personAssessment: PersonAssessment;
  syncAssessment: SyncAssessment;
  message: string;
  sessionConfidence: number;
  warnings: string[];
  recommendedAction: string;
}

export interface SessionDiagnostics {
  camera: PermissionStateName;
  microphone: PermissionStateName;
  renderer: string;
  mode: "idle" | "demo" | "live";
  state:
    | "idle"
    | "starting"
    | "live-ready"
    | "live-degraded"
    | "demo"
    | "stopped";
  analysis: AnalysisSnapshot;
}

export interface AnalysisFrameInput {
  audio: AudioFeatures;
  surface: SurfaceFrame;
  person: PersonFrame;
  sync: SyncFrame;
}

export interface AnalysisProvenance {
  version: string;
  commit: string;
  schemaVersion: string;
  sourceId: string;
  generatedAt: string;
}

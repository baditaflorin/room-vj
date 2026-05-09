import type {
  AudioFeatures,
  PersonFrame,
  SurfaceFrame,
  SyncFrame,
} from "./types";
import type {
  AudioClass,
  RoomClass,
  SyncClass,
  TrackingClass,
} from "./analysisTypes";

export interface FixtureFrame {
  audio: AudioFeatures;
  surface: SurfaceFrame;
  person: PersonFrame & { subjectCount?: number };
  sync: SyncFrame;
}

export interface FixtureDefinition {
  id: string;
  title: string;
  description: string;
  category: "clean" | "messy" | "broken" | "adversarial" | "edge";
  frames: FixtureFrame[];
}

export interface FixtureExpectation {
  id: string;
  audioClass: AudioClass;
  roomClass: RoomClass;
  trackingClass: TrackingClass;
  syncClass: SyncClass;
  minSessionConfidence: number;
  messageIncludes: string;
  actionIncludes: string;
}

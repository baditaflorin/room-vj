import { APP_COMMIT, APP_VERSION } from "../../lib/constants";
import { clamp } from "../../lib/math";
import type {
  AnalysisFrameInput,
  AnalysisProvenance,
  AnalysisSnapshot,
  AudioAssessment,
  PersonAssessment,
  RoomAssessment,
  SessionDiagnostics,
  SyncAssessment,
} from "./analysisTypes";
import type { FixtureDefinition } from "./fixtureTypes";
import type { PermissionStateName, RuntimeStatus } from "./types";

const SCHEMA_VERSION = "phase2-substance/v1";

export function analyzeFrame(input: AnalysisFrameInput): AnalysisSnapshot {
  const audioAssessment = assessAudio(input.audio);
  const roomAssessment = assessRoom(input.surface, input.person);
  const personAssessment = assessPerson(input.person, roomAssessment);
  const syncAssessment = assessSync(input.sync);

  const warnings = [
    ...audioAssessment.reasons.map((reason) => reason.label),
    ...roomAssessment.reasons.map((reason) => reason.label),
    ...personAssessment.reasons.map((reason) => reason.label),
    ...syncAssessment.reasons.map((reason) => reason.label),
  ];

  const sessionConfidence = clamp(
    audioAssessment.confidence * 0.25 +
      roomAssessment.confidence * 0.3 +
      personAssessment.confidence * 0.3 +
      syncAssessment.confidence * 0.15,
  );

  const message = buildMessage(
    audioAssessment,
    roomAssessment,
    personAssessment,
    syncAssessment,
  );
  const recommendedAction = buildAction(
    audioAssessment,
    roomAssessment,
    personAssessment,
    syncAssessment,
  );

  return {
    ...input,
    audioAssessment,
    roomAssessment,
    personAssessment,
    syncAssessment,
    message,
    sessionConfidence,
    warnings,
    recommendedAction,
  };
}

export function buildDiagnostics(args: {
  camera: PermissionStateName;
  microphone: PermissionStateName;
  renderer: string;
  mode: "idle" | "demo" | "live";
  analysis: AnalysisSnapshot;
  stopped?: boolean;
}): SessionDiagnostics {
  const state = args.stopped
    ? "stopped"
    : args.mode === "demo"
      ? "demo"
      : args.mode === "idle"
        ? "idle"
        : args.camera === "requesting" || args.microphone === "requesting"
          ? "starting"
          : args.analysis.sessionConfidence >= 0.65
            ? "live-ready"
            : "live-degraded";

  return {
    camera: args.camera,
    microphone: args.microphone,
    renderer: args.renderer,
    mode: args.mode,
    state,
    analysis: args.analysis,
  };
}

export function statusFromDiagnostics(
  diagnostics: SessionDiagnostics,
  fps: number,
  vision: string,
): RuntimeStatus {
  return {
    mode: diagnostics.mode,
    renderer: diagnostics.renderer,
    fps,
    camera: diagnostics.camera,
    microphone: diagnostics.microphone,
    vision,
    sync: diagnostics.analysis.sync,
    message: diagnostics.analysis.message,
    recommendedAction: diagnostics.analysis.recommendedAction,
    sessionConfidence: diagnostics.analysis.sessionConfidence,
    warnings: diagnostics.analysis.warnings,
    audio: diagnostics.analysis.audio,
    person: diagnostics.analysis.person,
    surface: diagnostics.analysis.surface,
    diagnostics,
  };
}

export function buildProvenance(
  sourceId: string,
  generatedAt = new Date().toISOString(),
): AnalysisProvenance {
  return {
    version: APP_VERSION,
    commit: APP_COMMIT,
    schemaVersion: SCHEMA_VERSION,
    sourceId,
    generatedAt,
  };
}

export function analyzeFixture(
  fixture: FixtureDefinition,
  generatedAt = "1970-01-01T00:00:00.000Z",
) {
  const history = fixture.frames.map((frame) => analyzeFrame(frame));
  const final = history.at(-1)!;
  return {
    provenance: buildProvenance(fixture.id, generatedAt),
    fixture: {
      id: fixture.id,
      title: fixture.title,
      description: fixture.description,
      category: fixture.category,
      frameCount: fixture.frames.length,
    },
    final,
    history,
  };
}

function assessAudio(audio: AnalysisFrameInput["audio"]): AudioAssessment {
  const reasons: AudioAssessment["reasons"] = [];
  const signalStrength = clamp(audio.rms * 0.8 + audio.energy * 0.9);
  const clipped =
    audio.rms > 0.82 || (audio.energy > 0.92 && audio.spectralFlux < 0.12);

  let classification: AudioAssessment["classification"];
  let confidence: number;

  if (signalStrength < 0.08) {
    classification = "silence";
    confidence = 0.96;
    reasons.push({ code: "audio-silence", label: "Mic is mostly silent." });
  } else if (clipped) {
    classification = "clipped";
    confidence = 0.94;
    reasons.push({
      code: "audio-clipped",
      label: "Audio looks clipped or speaker-limited.",
    });
  } else if (audio.spectralFlux < 0.1 && audio.zeroCrossingRate > 0.24) {
    classification = "speech";
    confidence = 0.72;
    reasons.push({
      code: "audio-speech",
      label: "Input behaves more like speech than music.",
    });
  } else if (audio.spectralFlux < 0.2 && audio.beatPulse < 0.45) {
    classification = "ambient";
    confidence = 0.68;
    reasons.push({
      code: "audio-ambient",
      label: "Room noise is present but beat confidence is weak.",
    });
  } else {
    classification = "music";
    confidence = clamp(
      0.55 +
        audio.spectralFlux * 0.25 +
        audio.beatPulse * 0.15 +
        signalStrength * 0.1,
    );
    if (audio.beatPulse < 0.2) {
      reasons.push({
        code: "audio-soft-beat",
        label: "Music signal is present but beat confidence is soft.",
      });
    }
  }

  return {
    classification,
    confidence,
    clipped,
    signalStrength,
    reasons,
  };
}

function assessRoom(
  surface: AnalysisFrameInput["surface"],
  person: AnalysisFrameInput["person"],
): RoomAssessment {
  const reasons: RoomAssessment["reasons"] = [];
  const usablePlaneRatio =
    surface.width * surface.height
      ? surface.planeCount / (surface.width * surface.height)
      : 0;
  const glareRisk = clamp(
    surface.brightness * 1.15 - surface.edgeEnergy * 0.35,
  );
  const flickerRisk = clamp(
    surface.edgeEnergy * 0.9 + (person.velocity > 0.7 ? 0.1 : 0),
  );

  let classification: RoomAssessment["classification"];
  let confidence: number;

  if (surface.brightness < 0.16) {
    classification = "low-light";
    confidence = 0.28;
    reasons.push({
      code: "room-low-light",
      label: "Camera sees a very dark room.",
    });
  } else if (glareRisk > 0.65 && usablePlaneRatio < 0.18) {
    classification = "reflective";
    confidence = 0.34;
    reasons.push({
      code: "room-reflective",
      label: "Bright reflections look stronger than stable surfaces.",
    });
  } else if (usablePlaneRatio < 0.08) {
    classification = "flat";
    confidence = 0.42;
    reasons.push({
      code: "room-flat",
      label: "The room map has very few stable planes.",
    });
  } else if (flickerRisk > 0.72 && glareRisk > 0.45) {
    classification = "flickery";
    confidence = 0.38;
    reasons.push({
      code: "room-flicker",
      label: "Lighting flicker is making the room map unstable.",
    });
  } else {
    classification = "usable";
    confidence = clamp(
      0.45 +
        usablePlaneRatio * 1.2 +
        surface.edgeEnergy * 0.18 -
        glareRisk * 0.12,
    );
  }

  if (person.active && person.radius > 0.28) {
    reasons.push({
      code: "room-tight-frame",
      label: "Subject fills much of the frame; room confidence is reduced.",
    });
    confidence = clamp(confidence - 0.08);
  }

  return {
    classification,
    confidence,
    usablePlaneRatio,
    glareRisk,
    flickerRisk,
    reasons,
  };
}

function assessPerson(
  person: AnalysisFrameInput["person"],
  room: RoomAssessment,
): PersonAssessment {
  const subjectCount = person.subjectCount ?? (person.active ? 1 : 0);

  if (!person.active || person.confidence < 0.08) {
    return {
      classification: "absent",
      confidence: 0.95,
      subjectCount,
      reasons: [
        { code: "person-absent", label: "No reliable person is visible." },
      ],
    };
  }

  if (subjectCount > 1) {
    return {
      classification: "multi-subject-risk",
      confidence: 0.44,
      subjectCount,
      reasons: [
        {
          code: "person-multi",
          label: "Multiple people are competing for the distortion target.",
        },
      ],
    };
  }

  if (person.source === "motion" && room.classification === "reflective") {
    return {
      classification: "false-positive-risk",
      confidence: 0.31,
      subjectCount,
      reasons: [
        {
          code: "person-reflection-risk",
          label: "Motion tracking may be following a reflection or screen.",
        },
      ],
    };
  }

  if (person.confidence < 0.52 || person.velocity > 0.82) {
    return {
      classification: "unstable",
      confidence: clamp(person.confidence * 0.7),
      subjectCount,
      reasons: [
        {
          code: "person-unstable",
          label: "Person tracking is unstable or moving too abruptly.",
        },
      ],
    };
  }

  return {
    classification: "stable",
    confidence: clamp(0.55 + person.confidence * 0.4),
    subjectCount,
    reasons: [],
  };
}

function assessSync(sync: AnalysisFrameInput["sync"]): SyncAssessment {
  const reasons: SyncAssessment["reasons"] = [];

  if (!sync.roomCode) {
    return {
      classification: "offline",
      confidence: 0.95,
      nextStep: "Start local visuals or enter a room code to sync devices.",
      reasons: [{ code: "sync-offline", label: "No shared room is active." }],
    };
  }

  if (sync.status.includes("waiting") || sync.status.includes("joining room")) {
    return {
      classification: "waiting-for-host",
      confidence: 0.4,
      nextStep:
        "Open the same room on the host device or switch this device to host.",
      reasons: [
        {
          code: "sync-waiting",
          label: "This device is waiting for a host peer.",
        },
      ],
    };
  }

  if (sync.status.includes("unavailable") || sync.status.includes("error")) {
    return {
      classification: "unstable",
      confidence: 0.25,
      nextStep:
        "Retry the room or switch to local-only mode if signaling is blocked.",
      reasons: [
        {
          code: "sync-error",
          label: "Signaling or peer connection is unstable.",
        },
      ],
    };
  }

  if (sync.peerCount === 0) {
    return {
      classification: "local-only",
      confidence: 0.64,
      nextStep: "Share the invite URL with another device to start the mesh.",
      reasons: [
        {
          code: "sync-local",
          label: "Room is active, but no remote peers are connected yet.",
        },
      ],
    };
  }

  if (sync.latencyMs > 180) {
    reasons.push({
      code: "sync-latency",
      label: "Peer latency is high; visuals may drift.",
    });
    return {
      classification: "unstable",
      confidence: 0.48,
      nextStep: "Move devices to a stronger network or reduce peer count.",
      reasons,
    };
  }

  return {
    classification: "mesh",
    confidence: clamp(0.65 + Math.min(sync.peerCount, 3) * 0.08),
    nextStep: "Mesh is healthy. Keep devices on the same room code.",
    reasons,
  };
}

function buildMessage(
  audio: AudioAssessment,
  room: RoomAssessment,
  person: PersonAssessment,
  sync: SyncAssessment,
) {
  if (audio.classification === "clipped") {
    return "Audio is clipping; visuals are reacting to a saturated signal.";
  }
  if (room.classification === "low-light") {
    return "The room is too dark for a trustworthy room map.";
  }
  if (person.classification === "multi-subject-risk") {
    return "Multiple people are competing for the distortion target.";
  }
  if (person.classification === "false-positive-risk") {
    return "Tracking may be following a screen or reflection instead of a person.";
  }
  if (room.classification === "reflective") {
    return "Reflections are stronger than stable room surfaces right now.";
  }
  if (sync.classification === "waiting-for-host") {
    return "Sync is waiting for a host device on this room code.";
  }
  if (audio.classification === "speech") {
    return "Speech is driving the scene more than music.";
  }
  if (audio.classification === "ambient") {
    return "The mic hears room ambience, but beat confidence is weak.";
  }
  if (
    audio.classification === "silence" &&
    person.classification === "absent"
  ) {
    return "Camera is live, but the room is quiet and no person is visible.";
  }
  if (sync.classification === "mesh") {
    return "Live room visualization is running and the device mesh is healthy.";
  }
  return "Live room visualization is running.";
}

function buildAction(
  audio: AudioAssessment,
  room: RoomAssessment,
  person: PersonAssessment,
  sync: SyncAssessment,
) {
  if (audio.classification === "clipped") {
    return "Lower the source volume or move the microphone farther from the speaker.";
  }
  if (room.classification === "low-light") {
    return "Add more front light or point the camera toward brighter surfaces.";
  }
  if (person.classification === "multi-subject-risk") {
    return "Center a single subject or step back so one person dominates the frame.";
  }
  if (person.classification === "false-positive-risk") {
    return "Move reflective screens out of frame or use a direct human silhouette.";
  }
  if (room.classification === "reflective") {
    return "Turn the camera away from windows, mirrors, or bright screens.";
  }
  if (sync.classification === "waiting-for-host") {
    return "Open the same room on the host device or switch this device to host.";
  }
  if (audio.classification === "speech") {
    return "Switch to music or accept lower beat confidence for spoken audio.";
  }
  if (audio.classification === "ambient") {
    return "Raise the music source or move the mic closer to the sound source.";
  }
  if (
    audio.classification === "silence" &&
    person.classification === "absent"
  ) {
    return "Start music or step into frame to give the engine a stronger signal.";
  }
  return sync.nextStep;
}

import { createRoomMapper, type RoomMapper } from "../room/roomMapper";
import type { MeshSync } from "../sync/webrtcMesh";
import type { VisualizerEngine } from "../visualizer/visualizerEngine";
import {
  analyzeFrame,
  buildDiagnostics,
  statusFromDiagnostics,
} from "./analysisEngine";
import { createDemoAudioFeatures, createDemoPersonFrame } from "./demoFrames";
import {
  emptyAudioFeatures,
  emptyPersonFrame,
  emptySurfaceFrame,
  emptySyncFrame,
  type AudioFeatures,
  type PaletteName,
  type PersonFrame,
  type RuntimeStatus,
  type SurfaceFrame,
} from "./types";

interface RoomSessionOptions {
  visualCanvas: HTMLCanvasElement;
  overlayCanvas: HTMLCanvasElement;
  video: HTMLVideoElement;
  onStatus(status: RuntimeStatus): void;
}

export interface RoomSession {
  startDemo(): Promise<void>;
  startLive(): Promise<void>;
  stop(): void;
  setPalette(palette: PaletteName): void;
  setIntensity(intensity: number): void;
  connectSync(roomCode: string, mode: "host" | "join"): Promise<void>;
  disconnectSync(): void;
}

interface AudioAnalyzerRef {
  start(): Promise<void>;
  stop(): void;
  getFeatures(): AudioFeatures;
}

interface PersonTrackerRef {
  status: string;
  detect(video: HTMLVideoElement, now: number): PersonFrame;
  dispose(): void;
}

export function createRoomSession(options: RoomSessionOptions): RoomSession {
  const roomMapper: RoomMapper = createRoomMapper(options.overlayCanvas);
  let settings = {
    palette: "prism" as PaletteName,
    intensity: 1,
  };
  let visualizer: VisualizerEngine | undefined;
  let mediaStream: MediaStream | undefined;
  let audioAnalyzer: AudioAnalyzerRef | undefined;
  let personTracker: PersonTrackerRef | undefined;
  let sync: MeshSync | undefined;
  let animationFrame = 0;
  let mode: RuntimeStatus["mode"] = "idle";
  let renderer = "not started";
  let camera: RuntimeStatus["camera"] = "idle";
  let microphone: RuntimeStatus["microphone"] = "idle";
  let vision = "idle";
  let message = "Ready";
  let currentAudio = emptyAudioFeatures;
  let currentSurface: SurfaceFrame = emptySurfaceFrame;
  let currentPerson: PersonFrame = emptyPersonFrame;
  let lastStatusAt = 0;
  let lastFrameAt = performance.now();
  let fps = 0;
  let lastSyncAt = 0;
  let stopped = false;

  const emit = (force = false) => {
    const now = performance.now();
    if (!force && now - lastStatusAt < 220) return;
    lastStatusAt = now;
    const analysis = analyzeFrame({
      audio: currentAudio,
      surface: currentSurface,
      person: currentPerson,
      sync: sync?.getFrame() ?? emptySyncFrame,
    });
    if (message !== "Stopped") {
      message = analysis.message;
    }
    const diagnostics = buildDiagnostics({
      camera,
      microphone,
      renderer,
      mode,
      analysis,
      stopped,
    });
    options.onStatus(statusFromDiagnostics(diagnostics, fps, vision));
  };

  const ensureVisualizer = async () => {
    if (visualizer) return visualizer;
    const { createVisualizerEngine } =
      await import("../visualizer/visualizerEngine");
    visualizer = await createVisualizerEngine(options.visualCanvas);
    renderer = visualizer.name;
    return visualizer;
  };

  const stopMedia = () => {
    audioAnalyzer?.stop();
    audioAnalyzer = undefined;
    personTracker?.dispose();
    personTracker = undefined;
    if (mediaStream) {
      for (const track of mediaStream.getTracks()) track.stop();
      mediaStream = undefined;
    }
    options.video.pause();
    options.video.srcObject = null;
  };

  const tick = (now: number) => {
    const delta = Math.max(1, now - lastFrameAt);
    fps = fps === 0 ? 1000 / delta : fps * 0.9 + (1000 / delta) * 0.1;
    lastFrameAt = now;

    if (mode === "demo") {
      currentAudio = createDemoAudioFeatures(now);
      currentPerson = createDemoPersonFrame(now);
      currentSurface = roomMapper.sample(undefined, now);
    } else if (mode === "live") {
      currentAudio = audioAnalyzer?.getFeatures() ?? emptyAudioFeatures;
      currentSurface = roomMapper.sample(options.video, now);
      currentPerson =
        personTracker?.detect(options.video, now) ?? emptyPersonFrame;
    }

    if (sync && now - lastSyncAt > 120) {
      sync.broadcast(currentAudio);
      lastSyncAt = now;
    }

    const frame = {
      audio: currentAudio,
      surface: currentSurface,
      person: currentPerson,
      sync: sync?.getFrame() ?? emptySyncFrame,
      palette: settings.palette,
      intensity: settings.intensity,
    };
    visualizer?.update(frame, now);
    roomMapper.drawOverlay(currentSurface, currentPerson);
    emit();
    animationFrame = requestAnimationFrame(tick);
  };

  const startLoop = () => {
    cancelAnimationFrame(animationFrame);
    lastFrameAt = performance.now();
    animationFrame = requestAnimationFrame(tick);
  };

  const handleResize = () => {
    visualizer?.resize();
    roomMapper.resize();
  };

  window.addEventListener("resize", handleResize);

  return {
    async startDemo() {
      stopMedia();
      await ensureVisualizer();
      stopped = false;
      mode = "demo";
      camera = "idle";
      microphone = "idle";
      vision = "synthetic demo";
      message = "Demo mode is running without camera or microphone.";
      startLoop();
      emit(true);
    },
    async startLive() {
      stopped = false;
      mode = "idle";
      camera = "requesting";
      microphone = "requesting";
      message = "Requesting camera and microphone.";
      emit(true);
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
          },
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });
      } catch {
        camera = "denied";
        microphone = "denied";
        message =
          "Camera or microphone permission was denied. Demo mode still works.";
        emit(true);
        return;
      }

      await ensureVisualizer();
      options.video.srcObject = mediaStream;
      options.video.muted = true;
      await options.video.play();

      const audioTrackCount = mediaStream.getAudioTracks().length;
      const videoTrackCount = mediaStream.getVideoTracks().length;
      microphone = audioTrackCount > 0 ? "granted" : "unavailable";
      camera = videoTrackCount > 0 ? "granted" : "unavailable";

      const [{ createAudioAnalyzer }, { createPersonTracker }] =
        await Promise.all([
          import("../audio/audioAnalyzer"),
          import("../vision/personTracker"),
        ]);
      if (audioTrackCount > 0) {
        audioAnalyzer = await createAudioAnalyzer(mediaStream);
        await audioAnalyzer.start();
      }
      vision = "loading MediaPipe";
      emit(true);
      personTracker = await createPersonTracker();
      vision = personTracker.status;
      mode = "live";
      message = "Live room visualization is running.";
      startLoop();
      emit(true);
    },
    stop() {
      cancelAnimationFrame(animationFrame);
      stopped = true;
      mode = "idle";
      stopMedia();
      currentAudio = emptyAudioFeatures;
      currentSurface = emptySurfaceFrame;
      currentPerson = emptyPersonFrame;
      message = "Stopped";
      window.removeEventListener("resize", handleResize);
      emit(true);
    },
    setPalette(palette) {
      settings = { ...settings, palette };
      emit(true);
    },
    setIntensity(intensity) {
      settings = { ...settings, intensity };
      emit(true);
    },
    async connectSync(roomCode, syncMode) {
      const { createMeshSync } = await import("../sync/webrtcMesh");
      sync?.dispose();
      sync = createMeshSync();
      message =
        syncMode === "host"
          ? `Hosting room ${roomCode}.`
          : `Joining room ${roomCode}.`;
      emit(true);
      try {
        await sync.connect(roomCode, syncMode);
      } catch {
        message =
          "WebRTC signaling is unavailable right now. Local visuals keep running.";
      }
      emit(true);
    },
    disconnectSync() {
      sync?.dispose();
      sync = undefined;
      message = "Sync disconnected.";
      emit(true);
    },
  };
}

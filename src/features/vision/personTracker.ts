import { clamp, smooth } from "../../lib/math";
import type { PersonFrame } from "../session/types";
import { emptyPersonFrame } from "../session/types";

type PoseLandmarkerInstance = import("@mediapipe/tasks-vision").PoseLandmarker;

export interface PersonTracker {
  status: string;
  detect(video: HTMLVideoElement, now: number): PersonFrame;
  dispose(): void;
}

export async function createPersonTracker(): Promise<PersonTracker> {
  const motion = createMotionTracker();

  try {
    const { FilesetResolver, PoseLandmarker } =
      await import("@mediapipe/tasks-vision");
    const fileset = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm",
    );
    const landmarker = await PoseLandmarker.createFromOptions(fileset, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task",
        delegate: "GPU",
      },
      runningMode: "VIDEO",
      numPoses: 1,
      minPoseDetectionConfidence: 0.35,
      minPosePresenceConfidence: 0.35,
      minTrackingConfidence: 0.35,
    });
    return createMediaPipeTracker(landmarker, motion);
  } catch {
    return motion;
  }
}

function createMediaPipeTracker(
  landmarker: PoseLandmarkerInstance,
  fallback: PersonTracker,
): PersonTracker {
  let previous = emptyPersonFrame;

  return {
    status: "MediaPipe pose",
    detect(video, now) {
      if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA)
        return previous;
      const result = landmarker.detectForVideo(video, now);
      const landmarks = result.landmarks[0];
      if (!landmarks || landmarks.length === 0) {
        const motionFrame = fallback.detect(video, now);
        previous = motionFrame.active
          ? motionFrame
          : { ...previous, active: false, confidence: 0, source: "none" };
        return previous;
      }

      const visible = landmarks.filter(
        (point) => (point.visibility ?? 1) > 0.32,
      );
      if (visible.length < 6) {
        const motionFrame = fallback.detect(video, now);
        previous = motionFrame.active
          ? motionFrame
          : { ...previous, active: false, confidence: 0, source: "none" };
        return previous;
      }

      const xs = visible.map((point) => point.x);
      const ys = visible.map((point) => point.y);
      const minX = clamp(Math.min(...xs));
      const maxX = clamp(Math.max(...xs));
      const minY = clamp(Math.min(...ys));
      const maxY = clamp(Math.max(...ys));
      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;
      const radius = clamp(
        Math.max(maxX - minX, maxY - minY) * 0.68,
        0.08,
        0.34,
      );
      const velocity = clamp(
        Math.hypot(centerX - previous.centerX, centerY - previous.centerY) *
          18 +
          previous.velocity * 0.65,
      );

      previous = {
        active: true,
        centerX: smooth(previous.centerX, centerX, 0.38),
        centerY: smooth(previous.centerY, centerY, 0.38),
        radius: smooth(previous.radius, radius, 0.3),
        velocity,
        confidence: clamp(visible.length / landmarks.length),
        source: "mediapipe",
      };
      return previous;
    },
    dispose() {
      landmarker.close();
      fallback.dispose();
    },
  };
}

function createMotionTracker(): PersonTracker {
  const canvas = document.createElement("canvas");
  canvas.width = 96;
  canvas.height = 54;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  let lastFrame: Uint8ClampedArray | undefined;
  let previous = emptyPersonFrame;

  return {
    status: "motion fallback",
    detect(video) {
      if (!context || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA)
        return previous;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const image = context.getImageData(0, 0, canvas.width, canvas.height);
      if (!lastFrame) {
        lastFrame = new Uint8ClampedArray(image.data);
        return previous;
      }

      let minX = canvas.width;
      let minY = canvas.height;
      let maxX = 0;
      let maxY = 0;
      let changed = 0;

      for (let y = 0; y < canvas.height; y += 2) {
        for (let x = 0; x < canvas.width; x += 2) {
          const i = (y * canvas.width + x) * 4;
          const diff =
            Math.abs(image.data[i] - lastFrame[i]) +
            Math.abs(image.data[i + 1] - lastFrame[i + 1]) +
            Math.abs(image.data[i + 2] - lastFrame[i + 2]);
          if (diff > 48) {
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
            changed += 1;
          }
        }
      }

      lastFrame = new Uint8ClampedArray(image.data);
      if (changed < 16) {
        previous = {
          ...previous,
          active: false,
          confidence: 0,
          velocity: smooth(previous.velocity, 0, 0.2),
        };
        return previous;
      }

      const centerX = clamp((minX + maxX) / 2 / canvas.width);
      const centerY = clamp((minY + maxY) / 2 / canvas.height);
      const radius = clamp(
        Math.max(maxX - minX, maxY - minY) / canvas.width,
        0.07,
        0.28,
      );
      previous = {
        active: true,
        centerX: smooth(previous.centerX, centerX, 0.28),
        centerY: smooth(previous.centerY, centerY, 0.28),
        radius: smooth(previous.radius, radius, 0.25),
        velocity: clamp(changed / 90),
        confidence: clamp(changed / 180),
        source: "motion",
      };
      return previous;
    },
    dispose() {
      lastFrame = undefined;
    },
  };
}

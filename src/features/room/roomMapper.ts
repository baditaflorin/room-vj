import { clamp, smooth } from "../../lib/math";
import type { PersonFrame, SurfaceFrame } from "../session/types";
import { emptySurfaceFrame } from "../session/types";

const GRID_WIDTH = 16;
const GRID_HEIGHT = 9;
const SAMPLE_WIDTH = 160;
const SAMPLE_HEIGHT = 90;

export interface RoomMapper {
  sample(video: HTMLVideoElement | undefined, demoTime?: number): SurfaceFrame;
  drawOverlay(surface: SurfaceFrame, person: PersonFrame): void;
  resize(): void;
}

export function createRoomMapper(canvas: HTMLCanvasElement): RoomMapper {
  const sampleCanvas = document.createElement("canvas");
  sampleCanvas.width = SAMPLE_WIDTH;
  sampleCanvas.height = SAMPLE_HEIGHT;
  const sampleContext = sampleCanvas.getContext("2d", {
    willReadFrequently: true,
  });
  const overlayContext = canvas.getContext("2d");
  let previous = emptySurfaceFrame;

  const resize = () => {
    const { width, height } = canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.round(width * ratio));
    canvas.height = Math.max(1, Math.round(height * ratio));
    overlayContext?.setTransform(ratio, 0, 0, ratio, 0, 0);
  };

  resize();

  return {
    sample(video, demoTime = 0) {
      if (
        !sampleContext ||
        !video ||
        video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA
      ) {
        previous = createDemoSurface(demoTime, previous);
        return previous;
      }

      sampleContext.drawImage(video, 0, 0, SAMPLE_WIDTH, SAMPLE_HEIGHT);
      const image = sampleContext.getImageData(
        0,
        0,
        SAMPLE_WIDTH,
        SAMPLE_HEIGHT,
      );
      const grid = new Array<number>(GRID_WIDTH * GRID_HEIGHT).fill(0);
      let brightness = 0;
      let edgeEnergy = 0;

      for (let gy = 0; gy < GRID_HEIGHT; gy += 1) {
        for (let gx = 0; gx < GRID_WIDTH; gx += 1) {
          let cellLum = 0;
          let cellEdge = 0;
          let samples = 0;
          const startX = Math.floor((gx / GRID_WIDTH) * SAMPLE_WIDTH);
          const endX = Math.floor(((gx + 1) / GRID_WIDTH) * SAMPLE_WIDTH);
          const startY = Math.floor((gy / GRID_HEIGHT) * SAMPLE_HEIGHT);
          const endY = Math.floor(((gy + 1) / GRID_HEIGHT) * SAMPLE_HEIGHT);

          for (let y = startY; y < endY; y += 2) {
            for (let x = startX; x < endX; x += 2) {
              const i = (y * SAMPLE_WIDTH + x) * 4;
              const lum =
                (image.data[i] * 0.2126 +
                  image.data[i + 1] * 0.7152 +
                  image.data[i + 2] * 0.0722) /
                255;
              const right = Math.min(SAMPLE_WIDTH - 1, x + 2);
              const below = Math.min(SAMPLE_HEIGHT - 1, y + 2);
              const ri = (y * SAMPLE_WIDTH + right) * 4;
              const bi = (below * SAMPLE_WIDTH + x) * 4;
              const rLum =
                (image.data[ri] + image.data[ri + 1] + image.data[ri + 2]) /
                765;
              const bLum =
                (image.data[bi] + image.data[bi + 1] + image.data[bi + 2]) /
                765;
              cellLum += lum;
              cellEdge += Math.abs(lum - rLum) + Math.abs(lum - bLum);
              samples += 1;
            }
          }

          const value =
            samples > 0
              ? clamp(cellLum / samples + (cellEdge / samples) * 1.8)
              : 0;
          grid[gy * GRID_WIDTH + gx] = value;
          brightness += value;
          edgeEnergy += samples > 0 ? cellEdge / samples : 0;
        }
      }

      brightness /= grid.length;
      edgeEnergy = clamp((edgeEnergy / grid.length) * 4);
      const planeCount = grid.filter(
        (value) => value > brightness + 0.16,
      ).length;
      previous = {
        brightness: smooth(previous.brightness, brightness, 0.25),
        edgeEnergy: smooth(previous.edgeEnergy, edgeEnergy, 0.22),
        planeCount,
        grid,
        width: GRID_WIDTH,
        height: GRID_HEIGHT,
      };
      return previous;
    },
    drawOverlay(surface, person) {
      if (!overlayContext) return;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      overlayContext.clearRect(0, 0, width, height);
      overlayContext.lineWidth = 1;

      const cellW = width / surface.width;
      const cellH = height / surface.height;
      for (let y = 0; y < surface.height; y += 1) {
        for (let x = 0; x < surface.width; x += 1) {
          const value = surface.grid[y * surface.width + x] ?? 0;
          if (value < surface.brightness + 0.12) continue;
          overlayContext.strokeStyle = `rgba(158, 232, 255, ${0.12 + value * 0.34})`;
          overlayContext.strokeRect(x * cellW, y * cellH, cellW, cellH);
        }
      }

      overlayContext.strokeStyle = `rgba(255, 247, 176, ${0.24 + surface.edgeEnergy * 0.34})`;
      for (let x = 1; x < surface.width; x += 3) {
        overlayContext.beginPath();
        overlayContext.moveTo(x * cellW, 0);
        overlayContext.lineTo(x * cellW, height);
        overlayContext.stroke();
      }

      if (person.active) {
        overlayContext.strokeStyle = "rgba(255, 105, 180, 0.72)";
        overlayContext.lineWidth = 2;
        overlayContext.beginPath();
        overlayContext.arc(
          person.centerX * width,
          person.centerY * height,
          person.radius * width,
          0,
          Math.PI * 2,
        );
        overlayContext.stroke();
      }
    },
    resize,
  };
}

function createDemoSurface(now: number, previous: SurfaceFrame): SurfaceFrame {
  const grid = new Array<number>(GRID_WIDTH * GRID_HEIGHT)
    .fill(0)
    .map((_, index) => {
      const x = index % GRID_WIDTH;
      const y = Math.floor(index / GRID_WIDTH);
      return clamp(
        0.25 +
          Math.sin(now / 900 + x * 0.7) * 0.18 +
          Math.cos(now / 1200 + y * 0.8) * 0.18 +
          ((x + y) % 5 === 0 ? 0.14 : 0),
      );
    });
  const brightness = grid.reduce((sum, value) => sum + value, 0) / grid.length;
  const edgeEnergy = clamp(0.45 + Math.sin(now / 1000) * 0.18);
  return {
    brightness: smooth(previous.brightness, brightness, 0.18),
    edgeEnergy: smooth(previous.edgeEnergy, edgeEnergy, 0.18),
    planeCount: grid.filter((value) => value > brightness + 0.1).length,
    grid,
    width: GRID_WIDTH,
    height: GRID_HEIGHT,
  };
}

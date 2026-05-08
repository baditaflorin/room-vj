import type { VisualizerFrame } from '../session/types'
import { createWebGpuRenderer } from './webGpuRenderer'

export interface VisualizerEngine {
  readonly name: string
  update(frame: VisualizerFrame, now: number): void
  resize(): void
  dispose(): void
}

export async function createVisualizerEngine(canvas: HTMLCanvasElement): Promise<VisualizerEngine> {
  const webGpu = await createWebGpuRenderer(canvas)
  if (webGpu) return webGpu

  const { createThreeFallbackRenderer } = await import('./threeFallbackRenderer')
  return createThreeFallbackRenderer(canvas)
}

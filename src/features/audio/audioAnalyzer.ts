import type { AudioFeatures } from '../session/types'
import { emptyAudioFeatures } from '../session/types'
import { updateBeatDetector, createBeatDetectorState } from './beatDetector'
import { clamp, normalize, smooth } from '../../lib/math'

type MeydaModule = typeof import('meyda')
type MeydaDefault = MeydaModule['default']
type MeydaAnalyzer = ReturnType<MeydaDefault['createMeydaAnalyzer']>
type MeydaFeatures = Partial<import('meyda').MeydaFeaturesObject> & { spectralFlux?: number }

export interface AudioAnalyzer {
  start(): Promise<void>
  stop(): void
  getFeatures(): AudioFeatures
}

export async function createAudioAnalyzer(stream: MediaStream): Promise<AudioAnalyzer> {
  const module = await import('meyda')
  const Meyda = module.default
  const audioContext = new AudioContext({ latencyHint: 'interactive' })
  const source = audioContext.createMediaStreamSource(stream)
  const analyser = audioContext.createAnalyser()
  analyser.fftSize = 1024
  source.connect(analyser)

  let features = emptyAudioFeatures
  let detector = createBeatDetectorState()
  let meydaAnalyzer: MeydaAnalyzer | undefined

  meydaAnalyzer = Meyda.createMeydaAnalyzer({
    audioContext,
    source,
    bufferSize: 512,
    featureExtractors: ['rms', 'energy', 'spectralCentroid', 'spectralFlux', 'zcr'],
    callback(nextFeatures: MeydaFeatures) {
      const now = performance.now()
      const rms = clamp(Number(nextFeatures.rms ?? 0) * 3)
      const energy = clamp(Number(nextFeatures.energy ?? 0) / 18)
      detector = updateBeatDetector(detector, energy, now)
      features = {
        rms: smooth(features.rms, rms, 0.35),
        energy: smooth(features.energy, energy, 0.32),
        spectralCentroid: smooth(
          features.spectralCentroid,
          normalize(Number(nextFeatures.spectralCentroid ?? 0), 100, 5000),
          0.22,
        ),
        spectralFlux: smooth(features.spectralFlux, clamp(Number(nextFeatures.spectralFlux ?? 0) / 80), 0.28),
        zeroCrossingRate: smooth(features.zeroCrossingRate, clamp(Number(nextFeatures.zcr ?? 0) / 120), 0.2),
        beatPulse: detector.beatPulse,
        beatCount: detector.beatCount,
      }
    },
  })

  return {
    async start() {
      if (audioContext.state !== 'running') await audioContext.resume()
      meydaAnalyzer?.start()
    },
    stop() {
      meydaAnalyzer?.stop()
      void audioContext.close()
    },
    getFeatures() {
      return features
    },
  }
}

export function createDemoAudioFeatures(now: number): AudioFeatures {
  const kick = Math.pow(Math.max(0, Math.sin(now / 310)), 10)
  const shimmer = (Math.sin(now / 970) + 1) / 2
  return {
    rms: clamp(0.25 + kick * 0.75),
    energy: clamp(0.18 + kick * 0.82),
    spectralCentroid: clamp(0.35 + shimmer * 0.5),
    spectralFlux: clamp(kick * 0.8 + shimmer * 0.2),
    zeroCrossingRate: clamp(0.2 + Math.sin(now / 1400) * 0.15),
    beatPulse: kick > 0.82 ? 1 : clamp(kick),
    beatCount: Math.floor(now / 620),
  }
}

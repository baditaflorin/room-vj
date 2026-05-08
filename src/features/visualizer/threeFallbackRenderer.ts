import type { VisualizerEngine } from './visualizerEngine'

const fragmentShader = `
precision highp float;
uniform vec2 uResolution;
uniform float uTime;
uniform vec4 uAudio;
uniform vec4 uPerson;
uniform vec4 uSurface;
uniform vec4 uSync;
varying vec2 vUv;

vec3 palette(float t) {
  return .55 + .45 * cos(6.28318 * (vec3(0.0, .34, .67) + t));
}

void main() {
  vec2 uv = vUv;
  float aspect = uResolution.x / max(1.0, uResolution.y);
  vec2 p = (uv - .5) * vec2(aspect, 1.0);
  vec2 person = (uPerson.xy - .5) * vec2(aspect, 1.0);
  float d = distance(p, person);
  float field = exp(-d * d / max(.004, uPerson.z * uPerson.z));
  p += normalize(p - person + vec2(.001)) * field * (.08 + uPerson.w * .05);
  float ring = sin(length(p) * (14.0 + uSurface.z * .1) - uTime * (2.0 + uAudio.x * 4.0));
  float wall = cos((p.x - p.y) * (9.0 + uSurface.y * 8.0) + uTime);
  float value = clamp(.45 + ring * .24 + wall * .18 + uAudio.y * .32 + field * .55 + max(uAudio.w, uSync.y) * .28, 0.0, 1.0);
  vec3 color = palette(fract(value + uAudio.z * .2 + uSync.x + uTime * .025));
  color += vec3(1.0, .22, .58) * field * .45;
  gl_FragColor = vec4(color, 1.0);
}
`

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`

export async function createThreeFallbackRenderer(canvas: HTMLCanvasElement): Promise<VisualizerEngine> {
  const THREE = await import('three')
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' })
  const scene = new THREE.Scene()
  const camera = new THREE.Camera()
  const geometry = new THREE.PlaneGeometry(2, 2)
  const uniforms = {
    uResolution: { value: new THREE.Vector2(1, 1) },
    uTime: { value: 0 },
    uAudio: { value: new THREE.Vector4() },
    uPerson: { value: new THREE.Vector4() },
    uSurface: { value: new THREE.Vector4() },
    uSync: { value: new THREE.Vector4() },
  }
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    depthWrite: false,
    depthTest: false,
  })
  scene.add(new THREE.Mesh(geometry, material))

  const resize = () => {
    const width = Math.max(1, canvas.clientWidth)
    const height = Math.max(1, canvas.clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio || 1)
    renderer.setSize(width, height, false)
    uniforms.uResolution.value.set(canvas.width, canvas.height)
  }
  resize()

  return {
    name: 'Three.js WebGL',
    update(frame, now) {
      resize()
      uniforms.uTime.value = now / 1000
      uniforms.uAudio.value.set(
        frame.audio.rms,
        frame.audio.energy,
        frame.audio.spectralCentroid,
        frame.audio.beatPulse,
      )
      uniforms.uPerson.value.set(
        frame.person.centerX,
        frame.person.centerY,
        frame.person.active ? frame.person.radius : 0,
        frame.person.velocity,
      )
      uniforms.uSurface.value.set(
        frame.surface.brightness,
        frame.surface.edgeEnergy,
        frame.surface.planeCount,
        frame.sync.peerCount,
      )
      uniforms.uSync.value.set(frame.sync.remoteHue, frame.sync.remotePulse, frame.intensity, 0)
      renderer.render(scene, camera)
    },
    resize,
    dispose() {
      geometry.dispose()
      material.dispose()
      renderer.dispose()
    },
  }
}

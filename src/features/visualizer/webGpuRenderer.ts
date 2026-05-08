import type { VisualizerEngine } from "./visualizerEngine";

const shader = /* wgsl */ `
struct VertexOut {
  @builtin(position) position: vec4<f32>,
  @location(0) uv: vec2<f32>,
};

@group(0) @binding(0) var<uniform> u: array<vec4<f32>, 5>;

@vertex
fn vertexMain(@builtin(vertex_index) index: u32) -> VertexOut {
  var positions = array<vec2<f32>, 3>(
    vec2<f32>(-1.0, -1.0),
    vec2<f32>(3.0, -1.0),
    vec2<f32>(-1.0, 3.0)
  );
  var out: VertexOut;
  out.position = vec4<f32>(positions[index], 0.0, 1.0);
  out.uv = positions[index] * 0.5 + vec2<f32>(0.5, 0.5);
  return out;
}

fn palettePrism(t: f32) -> vec3<f32> {
  return 0.55 + 0.45 * cos(6.28318 * (vec3<f32>(0.0, 0.34, 0.67) + t));
}

fn paletteThermal(t: f32) -> vec3<f32> {
  return mix(vec3<f32>(0.02, 0.02, 0.08), vec3<f32>(1.0, 0.12, 0.03), smoothstep(0.0, 0.7, t)) +
    vec3<f32>(0.0, 0.45, 0.2) * smoothstep(0.55, 1.0, t);
}

fn paletteNoir(t: f32) -> vec3<f32> {
  let ink = vec3<f32>(0.02, 0.03, 0.05);
  let ice = vec3<f32>(0.72, 0.96, 1.0);
  let pink = vec3<f32>(1.0, 0.18, 0.55);
  return mix(ink, ice, smoothstep(0.15, 0.8, t)) + pink * pow(max(0.0, sin(t * 9.0)), 8.0) * 0.55;
}

@fragment
fn fragmentMain(in: VertexOut) -> @location(0) vec4<f32> {
  let resolution = u[0].xy;
  let time = u[0].z;
  let rms = u[0].w;
  let energy = u[1].x;
  let centroid = u[1].y;
  let flux = u[1].z;
  let beat = u[1].w;
  let person = u[2];
  let surface = u[3];
  let sync = u[4];
  let intensity = max(0.2, sync.z);
  let palette = sync.w;

  var uv = in.uv;
  let aspect = resolution.x / max(1.0, resolution.y);
  var p = (uv - 0.5) * vec2<f32>(aspect, 1.0);
  let personPoint = (person.xy - 0.5) * vec2<f32>(aspect, 1.0);
  let dist = distance(p, personPoint);
  let personField = exp(-dist * dist / max(0.004, person.z * person.z));
  let pulse = max(beat, sync.y);

  p += normalize(p - personPoint + vec2<f32>(0.001, -0.002)) * personField * (0.09 + person.w * 0.07);
  p += vec2<f32>(
    sin(p.y * (8.0 + surface.z * 0.14) + time * (1.4 + centroid * 2.0)),
    cos(p.x * (7.0 + surface.w * 0.4) - time * (1.1 + flux * 2.2))
  ) * (0.025 + energy * 0.05) * intensity;

  let rings = sin(length(p) * (15.0 + surface.x * 10.0) - time * (2.0 + rms * 5.0));
  let walls = sin((p.x + p.y) * (9.0 + surface.z * 0.09) + surface.y * 4.0 + time);
  let scan = smoothstep(0.9, 1.0, sin((uv.y + time * 0.05) * 80.0)) * 0.12;
  let value = clamp(0.45 + rings * 0.22 + walls * 0.22 + energy * 0.28 + personField * 0.55 + pulse * 0.35, 0.0, 1.0);
  let hue = fract(value + centroid * 0.18 + sync.x + time * 0.025);

  var color: vec3<f32>;
  if (palette < 0.5) {
    color = palettePrism(hue);
  } else if (palette < 1.5) {
    color = paletteThermal(value);
  } else {
    color = paletteNoir(hue);
  }

  color *= 0.55 + value * 0.9 + scan;
  color += vec3<f32>(1.0, 0.35, 0.7) * personField * (0.25 + pulse * 0.55);
  return vec4<f32>(color, 1.0);
}
`;

export async function createWebGpuRenderer(
  canvas: HTMLCanvasElement,
): Promise<VisualizerEngine | undefined> {
  if (!("gpu" in navigator)) return undefined;
  const adapter = await navigator.gpu.requestAdapter({
    powerPreference: "high-performance",
  });
  if (!adapter) return undefined;
  const device = await adapter.requestDevice();
  const context = canvas.getContext("webgpu");
  if (!context) return undefined;
  const format = navigator.gpu.getPreferredCanvasFormat();
  const uniformBuffer = device.createBuffer({
    size: 5 * 4 * Float32Array.BYTES_PER_ELEMENT,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });
  const bindGroupLayout = device.createBindGroupLayout({
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.FRAGMENT,
        buffer: { type: "uniform" },
      },
    ],
  });
  const bindGroup = device.createBindGroup({
    layout: bindGroupLayout,
    entries: [{ binding: 0, resource: { buffer: uniformBuffer } }],
  });
  const pipeline = device.createRenderPipeline({
    layout: device.createPipelineLayout({
      bindGroupLayouts: [bindGroupLayout],
    }),
    vertex: {
      module: device.createShaderModule({ code: shader }),
      entryPoint: "vertexMain",
    },
    fragment: {
      module: device.createShaderModule({ code: shader }),
      entryPoint: "fragmentMain",
      targets: [{ format }],
    },
    primitive: { topology: "triangle-list" },
  });

  const resize = () => {
    const ratio = window.devicePixelRatio || 1;
    const width = Math.max(1, Math.floor(canvas.clientWidth * ratio));
    const height = Math.max(1, Math.floor(canvas.clientHeight * ratio));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      context.configure({ device, format, alphaMode: "opaque" });
    }
  };

  resize();

  return {
    name: "WebGPU WGSL",
    update(frame, now) {
      resize();
      const palette =
        frame.palette === "prism" ? 0 : frame.palette === "thermal" ? 1 : 2;
      const values = new Float32Array([
        canvas.width,
        canvas.height,
        now / 1000,
        frame.audio.rms,
        frame.audio.energy,
        frame.audio.spectralCentroid,
        frame.audio.spectralFlux,
        frame.audio.beatPulse,
        frame.person.centerX,
        frame.person.centerY,
        frame.person.radius,
        frame.person.velocity,
        frame.surface.brightness,
        frame.surface.edgeEnergy,
        frame.surface.planeCount,
        frame.sync.peerCount,
        frame.sync.remoteHue,
        frame.sync.remotePulse,
        frame.intensity,
        palette,
      ]);
      device.queue.writeBuffer(uniformBuffer, 0, values);
      const encoder = device.createCommandEncoder();
      const pass = encoder.beginRenderPass({
        colorAttachments: [
          {
            view: context.getCurrentTexture().createView(),
            clearValue: { r: 0.02, g: 0.02, b: 0.03, a: 1 },
            loadOp: "clear",
            storeOp: "store",
          },
        ],
      });
      pass.setPipeline(pipeline);
      pass.setBindGroup(0, bindGroup);
      pass.draw(3);
      pass.end();
      device.queue.submit([encoder.finish()]);
    },
    resize,
    dispose() {
      device.destroy();
    },
  };
}

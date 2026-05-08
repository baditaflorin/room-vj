const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/threeFallbackRenderer-BjuziJC-.js","assets/vision-CJm-kdft.js","assets/rolldown-runtime-S-ySWqyJ.js"])))=>i.map(i=>d[i]);
import{n as e}from"./vision-CJm-kdft.js";var t=`
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
`;async function n(e){if(!(`gpu`in navigator))return;let n=await navigator.gpu.requestAdapter({powerPreference:`high-performance`});if(!n)return;let r=await n.requestDevice(),i=e.getContext(`webgpu`);if(!i)return;let a=navigator.gpu.getPreferredCanvasFormat(),o=r.createBuffer({size:20*Float32Array.BYTES_PER_ELEMENT,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),s=r.createBindGroupLayout({entries:[{binding:0,visibility:GPUShaderStage.FRAGMENT,buffer:{type:`uniform`}}]}),c=r.createBindGroup({layout:s,entries:[{binding:0,resource:{buffer:o}}]}),l=r.createRenderPipeline({layout:r.createPipelineLayout({bindGroupLayouts:[s]}),vertex:{module:r.createShaderModule({code:t}),entryPoint:`vertexMain`},fragment:{module:r.createShaderModule({code:t}),entryPoint:`fragmentMain`,targets:[{format:a}]},primitive:{topology:`triangle-list`}}),u=()=>{let t=window.devicePixelRatio||1,n=Math.max(1,Math.floor(e.clientWidth*t)),o=Math.max(1,Math.floor(e.clientHeight*t));(e.width!==n||e.height!==o)&&(e.width=n,e.height=o,i.configure({device:r,format:a,alphaMode:`opaque`}))};return u(),{name:`WebGPU WGSL`,update(t,n){u();let a=t.palette===`prism`?0:t.palette===`thermal`?1:2,s=new Float32Array([e.width,e.height,n/1e3,t.audio.rms,t.audio.energy,t.audio.spectralCentroid,t.audio.spectralFlux,t.audio.beatPulse,t.person.centerX,t.person.centerY,t.person.radius,t.person.velocity,t.surface.brightness,t.surface.edgeEnergy,t.surface.planeCount,t.sync.peerCount,t.sync.remoteHue,t.sync.remotePulse,t.intensity,a]);r.queue.writeBuffer(o,0,s);let d=r.createCommandEncoder(),f=d.beginRenderPass({colorAttachments:[{view:i.getCurrentTexture().createView(),clearValue:{r:.02,g:.02,b:.03,a:1},loadOp:`clear`,storeOp:`store`}]});f.setPipeline(l),f.setBindGroup(0,c),f.draw(3),f.end(),r.queue.submit([d.finish()])},resize:u,dispose(){r.destroy()}}}async function r(t){let r=await n(t);if(r)return r;let{createThreeFallbackRenderer:i}=await e(async()=>{let{createThreeFallbackRenderer:e}=await import(`./threeFallbackRenderer-BjuziJC-.js`);return{createThreeFallbackRenderer:e}},__vite__mapDeps([0,1,2]));return i(t)}export{r as createVisualizerEngine};
//# sourceMappingURL=visualizerEngine-ChvH1Z9r.js.map
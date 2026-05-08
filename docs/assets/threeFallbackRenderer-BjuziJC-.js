const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/three-wBo___vi.js","assets/rolldown-runtime-S-ySWqyJ.js"])))=>i.map(i=>d[i]);
import{n as e}from"./vision-CJm-kdft.js";var t=`
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
`,n=`
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;async function r(r){let i=await e(()=>import(`./three-wBo___vi.js`).then(e=>e.t),__vite__mapDeps([0,1])),a=new i.WebGLRenderer({canvas:r,antialias:!1,powerPreference:`high-performance`}),o=new i.Scene,s=new i.Camera,c=new i.PlaneGeometry(2,2),l={uResolution:{value:new i.Vector2(1,1)},uTime:{value:0},uAudio:{value:new i.Vector4},uPerson:{value:new i.Vector4},uSurface:{value:new i.Vector4},uSync:{value:new i.Vector4}},u=new i.ShaderMaterial({uniforms:l,vertexShader:n,fragmentShader:t,depthWrite:!1,depthTest:!1});o.add(new i.Mesh(c,u));let d=()=>{let e=Math.max(1,r.clientWidth),t=Math.max(1,r.clientHeight);a.setPixelRatio(window.devicePixelRatio||1),a.setSize(e,t,!1),l.uResolution.value.set(r.width,r.height)};return d(),{name:`Three.js WebGL`,update(e,t){d(),l.uTime.value=t/1e3,l.uAudio.value.set(e.audio.rms,e.audio.energy,e.audio.spectralCentroid,e.audio.beatPulse),l.uPerson.value.set(e.person.centerX,e.person.centerY,e.person.active?e.person.radius:0,e.person.velocity),l.uSurface.value.set(e.surface.brightness,e.surface.edgeEnergy,e.surface.planeCount,e.sync.peerCount),l.uSync.value.set(e.sync.remoteHue,e.sync.remotePulse,e.intensity,0),a.render(o,s)},resize:d,dispose(){c.dispose(),u.dispose(),a.dispose()}}}export{r as createThreeFallbackRenderer};
//# sourceMappingURL=threeFallbackRenderer-BjuziJC-.js.map
// GLSL for the film composite (storyboard §5.1, prototype scope S01 + T1 + S02).
// S01: three graded photographs, painted with a 4-sector Kuwahara filter, slow push-in.
// T1:  ink bleed — a noise front sweeps out from the leaf, leaving sepia ink on parchment.
// S02: the plate ring, rendered to a texture (uS02).

export const compositeVert = /* glsl */ `
out vec2 vUv;
void main() { vUv = position.xy * 0.5 + 0.5; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

export const compositeFrag = /* glsl */ `
precision highp float;
in vec2 vUv;
out vec4 outColor;

uniform sampler2D uStill0; uniform sampler2D uStill1; uniform sampler2D uStill2;
uniform vec2 uStillSize;       // source still size (px), all three share it
uniform sampler2D uS02;        // plate ring render target
uniform vec2 uRes;             // drawing buffer px
uniform float uP;              // damped film progress 0..1
uniform float uTime;
uniform float uKuwahara;       // radius in px (0 = off)
uniform float uGrain;
uniform vec3 uNight; uniform vec3 uParchment; uniform vec3 uSepia;

// --- helpers -------------------------------------------------------------
float seg(float x, float a, float b) { return clamp((x - a) / (b - a), 0.0, 1.0); }
float smoother(float t) { return t * t * t * (t * (6.0 * t - 15.0) + 10.0); }
float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) { float a = 0.5, s = 0.0; for (int i = 0; i < 5; i++) { s += a * noise(p); p = p * 2.03 + 11.7; a *= 0.5; } return s; }

// cover-fit uv for a still, with zoom about a focus point
vec2 coverUv(vec2 uv, float zoom, vec2 focus) {
  float ra = uRes.x / uRes.y, ri = uStillSize.x / uStillSize.y;
  vec2 s = ra > ri ? vec2(1.0, ri / ra) : vec2(ra / ri, 1.0);
  vec2 c = (uv - 0.5) * s / zoom + focus;
  return clamp(c, 0.001, 0.999);
}

// 4-sector Kuwahara: flat painted strokes that keep edges. Radius in px of the screen.
vec3 kuwahara(sampler2D t, vec2 uv, float r) {
  if (r < 0.5) return texture(t, uv).rgb;
  vec2 px = 1.0 / uRes;
  vec3 m[4]; vec3 s[4];
  for (int k = 0; k < 4; k++) { m[k] = vec3(0.0); s[k] = vec3(0.0); }
  int R = int(r);
  float n = float((R + 1) * (R + 1));
  for (int j = 0; j <= 6; j++) {
    if (j > R) break;
    for (int i = 0; i <= 6; i++) {
      if (i > R) break;
      vec3 c0 = texture(t, uv + vec2(-i, -j) * px).rgb; m[0] += c0; s[0] += c0 * c0;
      vec3 c1 = texture(t, uv + vec2( i, -j) * px).rgb; m[1] += c1; s[1] += c1 * c1;
      vec3 c2 = texture(t, uv + vec2(-i,  j) * px).rgb; m[2] += c2; s[2] += c2 * c2;
      vec3 c3 = texture(t, uv + vec2( i,  j) * px).rgb; m[3] += c3; s[3] += c3 * c3;
    }
  }
  vec3 best = vec3(0.0); float minV = 1e9;
  for (int k = 0; k < 4; k++) {
    vec3 mu = m[k] / n; vec3 v = abs(s[k] / n - mu * mu);
    float sv = v.r + v.g + v.b;
    if (sv < minV) { minV = sv; best = mu; }
  }
  return best;
}

// Academic-oil grade: lift blacks to warm umber, compress highlights, warm the mids, slight desaturation.
vec3 grade(vec3 c) {
  float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
  c = mix(vec3(l), c, 0.86);
  c = pow(c, vec3(1.08, 1.0, 0.94));                 // warm
  c = c / (c + vec3(0.62)) * 1.55;                   // soft shoulder
  c = mix(uNight * 1.3, c, smoothstep(-0.05, 0.55, l) * 0.85 + 0.15); // umber toe
  return c;
}

vec3 s01(vec2 uv) {
  float l = seg(uP, 0.0, 0.14);
  // three shots: wide evergreen → shola understorey → Vitex macro
  float a = smoother(seg(l, 0.30, 0.46));
  float b = smoother(seg(l, 0.62, 0.76));
  vec3 c0 = kuwahara(uStill0, coverUv(uv, 1.0 + 0.10 * l, vec2(0.5, 0.48)), uKuwahara);
  vec3 c1 = kuwahara(uStill1, coverUv(uv, 1.05 + 0.14 * seg(l, 0.3, 0.8), vec2(0.5, 0.55)), uKuwahara);
  vec3 c2 = kuwahara(uStill2, coverUv(uv, 1.1 + 0.35 * seg(l, 0.62, 1.0), vec2(0.52, 0.5)), uKuwahara * 0.8);
  vec3 c = mix(mix(c0, c1, a), c2, b);
  c = grade(c);
  // open from near-black (B01.1)
  c = mix(uNight, c, smoother(seg(uP, 0.0, 0.017)));
  // vignette −0.3 EV at radius .35
  float v = smoothstep(0.35, 0.95, length((uv - 0.5) * vec2(uRes.x / uRes.y, 1.0)));
  c *= mix(1.0, 0.81, v);
  return c;
}

// The macro still turned to engraving ink: luminance edges + a hatching ramp, sepia on parchment.
vec3 inkOf(vec2 uv) {
  vec2 suv = coverUv(uv, 1.45, vec2(0.52, 0.5));
  vec2 px = 1.5 / uRes;
  float l = dot(texture(uStill2, suv).rgb, vec3(0.3, 0.59, 0.11));
  float gx = dot(texture(uStill2, suv + vec2(px.x, 0)).rgb - texture(uStill2, suv - vec2(px.x, 0)).rgb, vec3(0.33));
  float gy = dot(texture(uStill2, suv + vec2(0, px.y)).rgb - texture(uStill2, suv - vec2(0, px.y)).rgb, vec3(0.33));
  float edge = smoothstep(0.04, 0.16, length(vec2(gx, gy)));
  float hatch = step(0.5, fract((uv.x + uv.y) * uRes.y * 0.18)) * smoothstep(0.42, 0.12, l);
  float ink = clamp(edge + hatch * 0.55, 0.0, 1.0);
  return mix(uParchment, uSepia, ink);
}

void main() {
  vec2 uv = vUv;
  vec3 col;

  // T1 window (storyboard §0.3): 0.1232–0.1656
  float t1 = smoother(seg(uP, 0.1232, 0.1656));
  if (uP < 0.1232) {
    col = s01(uv);
  } else if (t1 >= 1.0) {
    col = texture(uS02, uv).rgb;
  } else {
    // front grows from the leaf's centre, ragged by fbm like ink running into paper fibres
    vec2 q = (uv - vec2(0.52, 0.5)) * vec2(uRes.x / uRes.y, 1.0);
    float d = length(q) + (fbm(uv * 6.0 + 3.1) - 0.5) * 0.35;
    float front = t1 * 1.6;
    float toInk = smoothstep(front, front - 0.08, d);                // painted → ink
    float toS02 = smoothstep(front - 0.55, front - 0.85, d);         // ink → plate ring
    float bleed = smoothstep(0.035, 0.0, abs(d - front)) * (1.0 - t1); // wet edge
    vec3 painted = s01(uv);
    vec3 ink = inkOf(uv);
    col = mix(painted, ink, toInk);
    col = mix(col, texture(uS02, uv).rgb, toS02);
    col = mix(col, uSepia * 0.7, bleed * 0.65);
  }

  // runtime grain (CD C9): dark .028, parchment .018, seeded at 24 Hz
  float seed = floor(uTime * 24.0);
  float g = hash(uv * uRes + seed) - 0.5;
  col += g * uGrain;
  outColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}`;

// Parchment plate: procedural paper + the engraving's ink (multiplied), lit like a sheet under archival light.
export const plateVert = /* glsl */ `
uniform float uCurl;
out vec2 vUv; out vec3 vN; out vec3 vW;
void main() {
  vUv = uv;
  vec3 p = position;
  // gentle sheet curl along x (paper is never flat)
  p.z += uCurl * (p.x * p.x) * 0.18 + uCurl * sin(p.y * 2.2) * 0.02;
  vec4 w = modelMatrix * vec4(p, 1.0);
  vW = w.xyz;
  vN = normalize(mat3(modelMatrix) * vec3(-uCurl * p.x * 0.36, 0.0, 1.0));
  gl_Position = projectionMatrix * viewMatrix * w;
}`;

export const plateFrag = /* glsl */ `
precision highp float;
in vec2 vUv; in vec3 vN; in vec3 vW;
out vec4 outColor;
uniform sampler2D uInk;
uniform vec3 uPaper; uniform vec3 uPaper2; uniform vec3 uSepia;
uniform float uSeed; uniform float uFocus; uniform float uOpacity;
float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p) { vec2 i = floor(p), f = fract(p); vec2 u = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), u.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), u.x), u.y); }
float fbm(vec2 p) { float a=.5,s=0.; for(int i=0;i<5;i++){ s+=a*noise(p); p=p*2.03+7.7; a*=.5; } return s; }
void main() {
  vec2 uv = vUv;
  // paper: two tones, long fibres, foxing, darker edges
  float fib = fbm(vec2(uv.x * 3.0, uv.y * 40.0) + uSeed);
  float blot = smoothstep(0.62, 0.9, fbm(uv * 5.0 + uSeed * 3.0));
  vec3 paper = mix(uPaper, uPaper2, fib * 0.55 + blot * 0.35);
  float edge = smoothstep(0.0, 0.06, min(min(uv.x, 1.0 - uv.x), min(uv.y, 1.0 - uv.y)));
  paper *= mix(0.82, 1.0, edge);
  // engraving ink, levelled: white = paper, dark = sepia line
  float ink = 1.0 - texture(uInk, uv).r;
  ink = smoothstep(0.08, 0.75, ink);
  vec3 col = mix(paper, uSepia, ink * 0.92);
  // archival light: warm key from upper left, falloff
  vec3 L = normalize(vec3(-0.5, 0.6, 0.8));
  float diff = clamp(dot(normalize(vN), L), 0.0, 1.0);
  col *= 0.72 + 0.34 * diff;
  col *= mix(0.62, 1.0, uFocus); // plates not in focus sit back in shadow
  outColor = vec4(col, uOpacity);
  #include <colorspace_fragment>
}`;

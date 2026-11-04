// GLSL for the AVVVS film composite (storyboard §5.1, scenes S01 through S06).
// S01: three graded photographs, painted with a 4-sector Kuwahara filter, slow push-in.
// T1:  ink bleed — a noise front sweeps out from the leaf, leaving sepia ink on parchment.
// S02: the plate ring, rendered to a texture (uS02).
// T2:  ember burn — oval combustion front from the rhizome into dark extraction ground.
// S03: extraction — ginger fibres to golden warm amber.
// T3:  liquid displace — viscous oil ripple transition.
// S04: alchemy — brass uruli with slow spiral caustics.
// T4:  gilt ring — expanding golden spiral ring revealing the product group.
// S05: AVVVS reveal — forest green ground with gold rim lighting on classical medicines.
// T5:  closing burn — rising ember line transitioning into clean site paper (--bg).
// S06: handoff — pristine site ground.

export const compositeVert = /* glsl */ `
out vec2 vUv;
void main() {
  vUv = position.xy * 0.5 + 0.5;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}`;

export const compositeFrag = /* glsl */ `
precision highp float;
in vec2 vUv;
out vec4 outColor;

uniform sampler2D uStill0;
uniform sampler2D uStill1;
uniform sampler2D uStill2;
uniform vec2 uStillSize;       // source still size (px), all three share it
uniform sampler2D uS02;        // plate ring render target
uniform vec2 uRes;             // drawing buffer px
uniform float uP;              // damped film progress 0..1
uniform float uTime;
uniform float uKuwahara;       // radius in px (0 = off)
uniform float uGrain;
uniform vec3 uNight;
uniform vec3 uParchment;
uniform vec3 uSepia;
uniform vec3 uAmber;
uniform vec3 uGold;
uniform vec3 uPaper;

// --- helpers -------------------------------------------------------------
float seg(float x, float a, float b) {
  return clamp((x - a) / (b - a), 0.0, 1.0);
}

float smoother(float t) {
  return t * t * t * (t * (6.0 * t - 15.0) + 10.0);
}

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float a = 0.5, s = 0.0;
  for (int i = 0; i < 5; i++) {
    s += a * noise(p);
    p = p * 2.03 + 11.7;
    a *= 0.5;
  }
  return s;
}

// cover-fit uv for a still, with zoom about a focus point
vec2 coverUv(vec2 uv, float zoom, vec2 focus) {
  float ra = uRes.x / uRes.y, ri = uStillSize.x / uStillSize.y;
  vec2 s = ra > ri ? vec2(1.0, ri / ra) : vec2(ra / ri, 1.0);
  vec2 c = (uv - 0.5) * s / zoom + focus;
  return clamp(c, 0.001, 0.999);
}

// 4-sector Kuwahara: flat painted strokes that keep edges.
vec3 kuwahara(sampler2D t, vec2 uv, float r) {
  if (r < 0.5) return texture(t, uv).rgb;
  vec2 px = 1.0 / uRes;
  vec3 m[4];
  vec3 s[4];
  for (int k = 0; k < 4; k++) {
    m[k] = vec3(0.0);
    s[k] = vec3(0.0);
  }
  int R = int(r);
  float n = float((R + 1) * (R + 1));
  for (int j = 0; j <= 5; j++) {
    if (j > R) break;
    for (int i = 0; i <= 5; i++) {
      if (i > R) break;
      vec3 c0 = texture(t, uv + vec2(-i, -j) * px).rgb; m[0] += c0; s[0] += c0 * c0;
      vec3 c1 = texture(t, uv + vec2( i, -j) * px).rgb; m[1] += c1; s[1] += c1 * c1;
      vec3 c2 = texture(t, uv + vec2(-i,  j) * px).rgb; m[2] += c2; s[2] += c2 * c2;
      vec3 c3 = texture(t, uv + vec2( i,  j) * px).rgb; m[3] += c3; s[3] += c3 * c3;
    }
  }
  vec3 best = vec3(0.0);
  float minV = 1e9;
  for (int k = 0; k < 4; k++) {
    vec3 mu = m[k] / n;
    vec3 v = abs(s[k] / n - mu * mu);
    float sv = v.r + v.g + v.b;
    if (sv < minV) {
      minV = sv;
      best = mu;
    }
  }
  return best;
}

// Academic-oil grade: lift blacks to warm umber, compress highlights, warm the mids
vec3 grade(vec3 c) {
  float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
  c = mix(vec3(l), c, 0.86);
  c = pow(c, vec3(1.08, 1.0, 0.94));                 // warm
  c = c / (c + vec3(0.62)) * 1.55;                   // soft shoulder
  c = mix(uNight * 1.3, c, smoothstep(-0.05, 0.55, l) * 0.85 + 0.15); // umber toe
  return c;
}

// S01: Into the origins (0.00 - 0.14)
vec3 s01(vec2 uv) {
  float l = seg(uP, 0.0, 0.14);
  float a = smoother(seg(l, 0.30, 0.46));
  float b = smoother(seg(l, 0.62, 0.76));
  vec3 c0 = kuwahara(uStill0, coverUv(uv, 1.0 + 0.10 * l, vec2(0.5, 0.48)), uKuwahara);
  vec3 c1 = kuwahara(uStill1, coverUv(uv, 1.05 + 0.14 * seg(l, 0.3, 0.8), vec2(0.5, 0.55)), uKuwahara);
  vec3 c2 = kuwahara(uStill2, coverUv(uv, 1.1 + 0.35 * seg(l, 0.62, 1.0), vec2(0.52, 0.5)), uKuwahara * 0.8);
  vec3 c = mix(mix(c0, c1, a), c2, b);
  c = grade(c);

  // Subtle fade from mist on first paint (never pitch black)
  c = mix(c * 0.82, c, smoother(seg(uP, 0.0, 0.02)));

  // Vignette
  float v = smoothstep(0.35, 0.95, length((uv - 0.5) * vec2(uRes.x / uRes.y, 1.0)));
  c *= mix(1.0, 0.82, v);
  return c;
}

// Macro still turned to engraving ink: luminance edges + hatching ramp
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

// S03: Extraction (0.46 - 0.60)
vec3 s03(vec2 uv) {
  float l = seg(uP, 0.46, 0.60);
  vec2 q = (uv - 0.5) * vec2(uRes.x / uRes.y, 1.0);
  float d = length(q);

  // Earth ground
  vec3 earth = mix(vec3(0.08, 0.05, 0.03), vec3(0.18, 0.12, 0.07), fbm(uv * 4.0));

  // Liquid pool warming to amber (B03.4)
  float pool = smoothstep(0.55, 0.15, d + (fbm(uv * 5.0) - 0.5) * 0.15);
  float amberProgress = smoother(seg(l, 0.45, 0.90));
  vec3 liquid = mix(vec3(0.25, 0.22, 0.18), uAmber, amberProgress);

  // Surface highlight from upper-left key light
  float spec = smoothstep(0.45, 0.0, length(q - vec2(-0.25, -0.15)));
  liquid += spec * vec3(0.35, 0.28, 0.15) * amberProgress;

  vec3 c = mix(earth, liquid, pool * (0.6 + 0.4 * amberProgress));
  c = grade(c);
  return c;
}

// S04: The Alchemy of Nature (0.60 - 0.74)
vec3 s04(vec2 uv) {
  vec2 q = (uv - vec2(0.62, 0.52)) * vec2(uRes.x / uRes.y, 1.0);
  float r = length(q);
  float ang = atan(q.y, q.x);

  // Teak tabletop ground
  vec3 teak = mix(vec3(0.07, 0.04, 0.02), vec3(0.14, 0.08, 0.04), fbm(uv * vec2(1.0, 8.0)));

  // Brass uruli rim (r ≈ 0.38)
  float rim = smoothstep(0.03, 0.0, abs(r - 0.38));
  vec3 brass = mix(uGold * 0.7, uGold * 1.3, smoothstep(-0.3, 0.3, -q.x + q.y));

  // Concentric spiral caustics in medicated oil
  float spiral = sin(ang * 2.0 - r * 22.0 + uTime * 0.5);
  vec3 oil = mix(uAmber * 0.85, uAmber * 1.25, spiral * 0.25 + 0.5);

  float inUruli = smoothstep(0.38, 0.36, r);
  vec3 c = mix(teak, oil, inUruli);
  c = mix(c, brass, rim);
  c = grade(c);
  return c;
}

// S05: The AVVVS Reveal (0.74 - 0.92)
vec3 s05(vec2 uv) {
  // Dark botanical forest green ground
  vec3 forest = mix(vec3(0.04, 0.07, 0.05), vec3(0.08, 0.14, 0.10), fbm(uv * 3.0));

  // Soft key light on product zone (x_s ≈ 0.68, y_s ≈ 0.58)
  vec2 pq = (uv - vec2(0.68, 0.58)) * vec2(uRes.x / uRes.y, 1.0);
  float pl = length(pq);
  float spot = smoothstep(0.42, 0.05, pl);

  // Teak pedestal
  float base = smoothstep(0.65, 0.68, uv.y);
  vec3 teak = mix(vec3(0.08, 0.05, 0.03), vec3(0.16, 0.10, 0.06), fbm(uv * vec2(2.0, 10.0)));
  forest = mix(forest, teak, base * 0.7);

  // Warm key + gold rim glow
  forest += spot * vec3(0.12, 0.10, 0.06);
  float rim = smoothstep(0.22, 0.18, pl) * smoothstep(0.14, 0.18, pl);
  forest += rim * uGold * 0.45;

  return grade(forest);
}

void main() {
  vec2 uv = vUv;
  vec3 col;

  // Transition windows (storyboard §0.3 & §5)
  float t1 = smoother(seg(uP, 0.1232, 0.1656));
  float t2 = smoother(seg(uP, 0.4216, 0.4712));
  float t3 = smoother(seg(uP, 0.5832, 0.6112));
  float t4 = smoother(seg(uP, 0.7232, 0.7544));
  float t5 = smoother(seg(uP, 0.8984, 0.9264));

  if (uP < 0.1232) {
    // S01: Into the origins
    col = s01(uv);
  } else if (uP < 0.1656) {
    // T1: Ink bleed (S01 → S02)
    vec2 q = (uv - vec2(0.52, 0.5)) * vec2(uRes.x / uRes.y, 1.0);
    float d = length(q) + (fbm(uv * 6.0 + 3.1) - 0.5) * 0.35;
    float front = t1 * 1.6;
    float toInk = smoothstep(front, front - 0.08, d);
    float toS02 = smoothstep(front - 0.55, front - 0.85, d);
    float bleed = smoothstep(0.035, 0.0, abs(d - front)) * (1.0 - t1);
    vec3 painted = s01(uv);
    vec3 ink = inkOf(uv);
    col = mix(painted, ink, toInk);
    col = mix(col, texture(uS02, uv).rgb, toS02);
    col = mix(col, uSepia * 0.7, bleed * 0.65);
  } else if (uP < 0.4216) {
    // S02: The botanical archive
    col = texture(uS02, uv).rgb;
  } else if (uP < 0.4712) {
    // T2: Ember burn (S02 → S03)
    vec2 q = (uv - vec2(0.5, 0.5)) * vec2(uRes.x / uRes.y, 1.0);
    float field = length(q) + (fbm(uv * 4.0 + uTime * 0.04) - 0.5) * 0.28;
    float front = mix(-0.25, 1.25, t2);
    float d = field - front;

    vec3 s02Col = texture(uS02, uv).rgb;
    vec3 s03Col = s03(uv);

    // Glowing ember line
    float emberLine = smoothstep(0.035, 0.0, abs(d));
    vec3 ember = vec3(1.3, 0.55, 0.12) * (1.0 + 0.5 * sin(uTime * 3.0 + uv.x * 12.0));

    // Char band
    float charBand = smoothstep(0.0, 0.05, d) * smoothstep(0.12, 0.05, d);
    s02Col = mix(s02Col, vec3(0.08, 0.05, 0.03), charBand * 0.85);

    col = mix(s03Col, s02Col, smoothstep(-0.02, 0.02, d));
    col += emberLine * ember;
  } else if (uP < 0.5832) {
    // S03: Extraction
    col = s03(uv);
  } else if (uP < 0.6112) {
    // T3: Liquid displace (S03 → S04)
    float n = fbm(uv * 3.0);
    vec2 dv = vec2(n - 0.5, fbm(uv * 3.0 + 19.0) - 0.5) * 0.08;
    vec3 aCol = s03(uv + dv * t3);
    vec3 bCol = s04(uv - dv * (1.0 - t3));
    col = mix(aCol, bCol, smoother(t3));
  } else if (uP < 0.7232) {
    // S04: The alchemy of nature
    col = s04(uv);
  } else if (uP < 0.7544) {
    // T4: Gilt spiral ring (S04 → S05)
    vec2 q = (uv - vec2(0.68, 0.60)) * vec2(uRes.x / uRes.y, 1.0);
    float r = length(q);
    float front = mix(0.0, 1.25, t4);
    float ringDist = abs(r - front);
    float ring = smoothstep(0.05, 0.0, ringDist);

    vec3 aCol = s04(uv);
    vec3 bCol = s05(uv);
    col = mix(aCol, bCol, smoothstep(front - 0.02, front + 0.02, r));
    col += ring * uGold * 1.4;
  } else if (uP < 0.8984) {
    // S05: The AVVVS reveal
    col = s05(uv);
  } else if (uP < 0.9264) {
    // T5: Closing burn into site paper (S05 → S06)
    float yb = 1.0 - uv.y;
    float field = yb + (fbm(uv * 5.0 + uTime * 0.03) - 0.5) * 0.22;
    float front = mix(-0.15, 1.15, t5);
    float d = field - front;

    vec3 s05Col = s05(uv);
    vec3 s06Col = uPaper;

    float emberLine = smoothstep(0.03, 0.0, abs(d));
    vec3 ember = vec3(1.2, 0.48, 0.10) * (1.0 + 0.4 * sin(uTime * 3.0 + uv.x * 10.0));

    col = mix(s06Col, s05Col, smoothstep(-0.02, 0.02, d));
    col += emberLine * ember;
  } else {
    // S06: Handoff into site
    col = uPaper;
  }

  // Runtime grain seeded at 24 Hz (CD C9)
  float seed = floor(uTime * 24.0);
  float g = hash(uv * uRes + seed) - 0.5;
  col += g * uGrain;

  outColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}`;

// Parchment plate: procedural paper + the engraving's ink (multiplied), lit like a sheet under archival light.
export const plateVert = /* glsl */ `
uniform float uCurl;
out vec2 vUv;
out vec3 vN;
out vec3 vW;

void main() {
  vUv = uv;
  vec3 p = position;
  p.z += uCurl * (p.x * p.x) * 0.18 + uCurl * sin(p.y * 2.2) * 0.02;
  vec4 w = modelMatrix * vec4(p, 1.0);
  vW = w.xyz;
  vN = normalize(mat3(modelMatrix) * vec3(-uCurl * p.x * 0.36, 0.0, 1.0));
  gl_Position = projectionMatrix * viewMatrix * w;
}`;

export const plateFrag = /* glsl */ `
precision highp float;
in vec2 vUv;
in vec3 vN;
in vec3 vW;
out vec4 outColor;

uniform sampler2D uInk;
uniform vec3 uPaper;
uniform vec3 uPaper2;
uniform vec3 uSepia;
uniform float uSeed;
uniform float uFocus;
uniform float uOpacity;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float a = 0.5, s = 0.0;
  for (int i = 0; i < 5; i++) {
    s += a * noise(p);
    p = p * 2.03 + 7.7;
    a *= 0.5;
  }
  return s;
}

void main() {
  vec2 uv = vUv;
  float fib = fbm(vec2(uv.x * 3.0, uv.y * 40.0) + uSeed);
  float blot = smoothstep(0.62, 0.9, fbm(uv * 5.0 + uSeed * 3.0));
  vec3 paper = mix(uPaper, uPaper2, fib * 0.55 + blot * 0.35);
  float edge = smoothstep(0.0, 0.06, min(min(uv.x, 1.0 - uv.x), min(uv.y, 1.0 - uv.y)));
  paper *= mix(0.82, 1.0, edge);

  float ink = 1.0 - texture(uInk, uv).r;
  ink = smoothstep(0.08, 0.75, ink);
  vec3 col = mix(paper, uSepia, ink * 0.92);

  // Archival light: warm key from upper left
  vec3 L = normalize(vec3(-0.5, 0.6, 0.8));
  float diff = clamp(dot(normalize(vN), L), 0.0, 1.0);
  col *= 0.72 + 0.34 * diff;
  col *= mix(0.62, 1.0, uFocus);
  outColor = vec4(col, uOpacity);
  #include <colorspace_fragment>
}`;

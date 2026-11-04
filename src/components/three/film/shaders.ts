// GLSL for the AVVVS Luxury Botanical Film Composite (GLSL 3.0 ES).
// S01: Silent Valley mist canopy to living Karinochi leaf macro (Kuwahara oil glaze & sunbeams).
// T1:  Ink bleed — leaf mid-vein morphs to sepia ink lines and capillary bleed on 1678 parchment.
// S02: Hortus Malabaricus 3D botanical plate ring with copperplate indentation and palm dapple.
// T2:  Ember burn — irregular fractal combustion front into rich dark extraction earth.
// S03: Extraction — dried Zingiber rhizome breaking into fine golden choornam powder and warm amber oil.
// T3:  Liquid displace — viscous sesame oil ripple wave.
// S04: Alchemy — authentic Kerala brass/bronze Uruli with concentric stirring caustics and steam.
// T4:  Gilt spiral ring — expanding antique gold ring revealing the signature formulations.
// S05: AVVVS reveal — authentic studio hero reveal of Rujanth, Mezhu Thailam, and Lakshol with 3000 K gold rim light.
// T5:  Closing burn — ascending warm ember line transitioning into clean warm ivory site paper.
// S06: Handoff — pristine site ground handing off to the luxury pharmacopoeia.

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

uniform sampler2D uStill0;     // S01 Silent Valley evergreen canopy
uniform sampler2D uStill1;     // S01 Shola forest descent
uniform sampler2D uStill2;     // S01 Vitex negundo leaf macro
uniform sampler2D uStill3;     // S03 Extraction (Ginger rhizome & choornam powder)
uniform sampler2D uStill4;     // S04 Uruli compounding vessel
uniform sampler2D uStill5;     // S05 Signature products reveal
uniform vec2 uStillSize;       // Reference still size (px)
uniform sampler2D uS02;        // S02 3D plate ring render target (FBO)
uniform vec2 uRes;             // Drawing buffer dimensions
uniform float uP;              // Damped film progress 0..1
uniform float uTime;           // Elapsed time in seconds
uniform float uKuwahara;       // Oil paint filter radius
uniform float uGrain;          // Film grain amplitude
uniform vec3 uNight;           // Deep Forest Green #142B22
uniform vec3 uForest;          // Botanical Green #344C38
uniform vec3 uParchment;       // Warm Ivory / Rag Paper #F4F0E7
uniform vec3 uParchment2;      // Aged Deckle Paper
uniform vec3 uSepia;           // Sepia Engraving Ink #3D2E24
uniform vec3 uAmber;           // Luminous Amber Medicated Oil #D98218
uniform vec3 uGold;            // Antique Gold #B69A62
uniform vec3 uEarth;           // Earth Brown #69513C
uniform vec3 uPaper;           // Clean Site Paper

// --- mathematical helpers ----------------------------------------------------
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
    p = p * 2.02 + 11.7;
    a *= 0.5;
  }
  return s;
}

// Cover-fit UV mapping with zoom around focus center
vec2 coverUv(vec2 uv, float zoom, vec2 focus) {
  float ra = uRes.x / uRes.y, ri = uStillSize.x / uStillSize.y;
  vec2 s = ra > ri ? vec2(1.0, ri / ra) : vec2(ra / ri, 1.0);
  vec2 c = (uv - 0.5) * s / zoom + focus;
  return clamp(c, 0.001, 0.999);
}

// 4-sector Kuwahara filter: painterly brush strokes while preserving crisp anatomical edges
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
  for (int j = 0; j <= 4; j++) {
    if (j > R) break;
    for (int i = 0; i <= 4; i++) {
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

// Academic oil color grade: rich Kerala umber toe, luminous mids, soft highlights
vec3 grade(vec3 c) {
  float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
  c = mix(vec3(l), c, 0.88);
  c = pow(c, vec3(1.06, 1.0, 0.94));                 // Warm sunlight shift
  c = c / (c + vec3(0.58)) * 1.52;                   // Film shoulder compression
  c = mix(uNight * 1.25, c, smoothstep(-0.04, 0.50, l) * 0.88 + 0.12); // Umber toe
  return c;
}

// Floating golden botanical motes (ambient dust drifting in light shafts)
vec3 motes(vec2 uv, float density, float speed) {
  vec2 p = uv * vec2(uRes.x / uRes.y, 1.0) * 12.0;
  p.y += uTime * speed * 0.35;
  p.x += sin(uTime * 0.25 + p.y * 0.5) * 0.4;
  vec2 cell = floor(p);
  vec2 f = fract(p);
  float h = hash(cell);
  float sparkle = 0.0;
  if (h > 1.0 - density) {
    float dist = length(f - 0.5);
    sparkle = smoothstep(0.18, 0.0, dist) * (0.6 + 0.4 * sin(uTime * 3.5 + h * 6.28));
  }
  return uGold * sparkle * 0.65;
}

// S01: Into the Origins (0.00 - 0.14)
vec3 s01(vec2 uv) {
  float l = seg(uP, 0.0, 0.14);
  float a = smoother(seg(l, 0.28, 0.48));
  float b = smoother(seg(l, 0.58, 0.78));

  // Cinematic 3-stage camera descent
  vec3 c0 = kuwahara(uStill0, coverUv(uv, 1.00 + 0.12 * l, vec2(0.50, 0.46)), uKuwahara);
  vec3 c1 = kuwahara(uStill1, coverUv(uv, 1.05 + 0.15 * seg(l, 0.25, 0.80), vec2(0.50, 0.54)), uKuwahara);
  vec3 c2 = kuwahara(uStill2, coverUv(uv, 1.10 + 0.32 * seg(l, 0.55, 1.00), vec2(0.52, 0.50)), uKuwahara * 0.7);

  vec3 c = mix(mix(c0, c1, a), c2, b);
  c = grade(c);

  // Sunlight shaft from upper-left (40° angle)
  vec2 sq = uv - vec2(0.20, 0.15);
  float beam = smoothstep(0.85, 0.20, abs(sq.x * 0.85 - sq.y * 0.52)) * 0.14;
  c += beam * vec3(1.1, 0.95, 0.65);

  // Floating forest motes
  c += motes(uv, 0.12, 0.6);

  // Smooth fade-in from atmospheric forest dawn (never pitch black)
  c = mix(uNight * 1.1, c, smoother(seg(uP, 0.0, 0.035)));

  // Subtle perimeter vignette
  float v = smoothstep(0.38, 0.98, length((uv - 0.5) * vec2(uRes.x / uRes.y, 1.0)));
  c *= mix(1.0, 0.82, v);
  return c;
}

// Leaf veins morphing to sepia ink lines
vec3 inkOf(vec2 uv) {
  vec2 suv = coverUv(uv, 1.42, vec2(0.52, 0.50));
  vec2 px = 1.4 / uRes;
  float l = dot(texture(uStill2, suv).rgb, vec3(0.299, 0.587, 0.114));
  float gx = dot(texture(uStill2, suv + vec2(px.x, 0)).rgb - texture(uStill2, suv - vec2(px.x, 0)).rgb, vec3(0.33));
  float gy = dot(texture(uStill2, suv + vec2(0, px.y)).rgb - texture(uStill2, suv - vec2(0, px.y)).rgb, vec3(0.33));
  float edge = smoothstep(0.035, 0.15, length(vec2(gx, gy)));
  float hatch = step(0.5, fract((uv.x + uv.y) * uRes.y * 0.16)) * smoothstep(0.40, 0.10, l);
  float ink = clamp(edge + hatch * 0.50, 0.0, 1.0);
  return mix(uParchment, uSepia, ink);
}

// S03: From Illustration to Extraction (0.46 - 0.60)
vec3 s03(vec2 uv) {
  float l = seg(uP, 0.46, 0.60);
  vec2 suv = coverUv(uv, 1.02 + 0.10 * l, vec2(0.54, 0.50));

  // Authentic extraction master still (dried Zingiber rhizome & cascading choornam)
  vec3 extractionStill = kuwahara(uStill3, suv, uKuwahara * 0.6);
  extractionStill = grade(extractionStill);

  // Directional 3600 K narrow cone key light from upper-left
  vec2 q = (uv - vec2(0.68, 0.54)) * vec2(uRes.x / uRes.y, 1.0);
  float d = length(q);
  float keyCone = smoothstep(0.65, 0.10, d);

  // Dynamic warm amber sesame oil pool
  float pool = smoothstep(0.52, 0.18, d + (fbm(uv * 4.5) - 0.5) * 0.12);
  float amberProgress = smoother(seg(l, 0.35, 0.90));
  vec3 amberGlow = uAmber * (1.0 + 0.35 * sin(uTime * 1.5 + d * 8.0));

  vec3 c = mix(extractionStill, mix(extractionStill, amberGlow, 0.65), pool * amberProgress);

  // Falling golden choornam particles
  c += motes(uv, 0.22, 1.2) * (0.8 + 0.5 * amberProgress);

  return c;
}

// S04: The Alchemy of Nature (0.60 - 0.74)
vec3 s04(vec2 uv) {
  float l = seg(uP, 0.60, 0.74);
  vec2 suv = coverUv(uv, 1.04 + 0.08 * l, vec2(0.60, 0.50));

  // Authentic compounding vessel master still
  vec3 uruliStill = kuwahara(uStill4, suv, uKuwahara * 0.5);
  uruliStill = grade(uruliStill);

  // Simmering concentric stirring caustics inside the medicated oil
  vec2 q = (uv - vec2(0.64, 0.52)) * vec2(uRes.x / uRes.y, 1.0);
  float r = length(q);
  float ang = atan(q.y, q.x);

  float caustics = sin(ang * 3.0 - r * 20.0 + uTime * 0.8) * 0.5 + 0.5;
  float inVessel = smoothstep(0.42, 0.30, r);
  vec3 simmeringOil = mix(uAmber * 0.85, uAmber * 1.35, caustics);

  // Blend simmering oil caustics into vessel core
  vec3 c = mix(uruliStill, simmeringOil, inVessel * 0.55);

  // Antique brass specular rim highlight catching 3400 K high window key light
  float rim = smoothstep(0.04, 0.0, abs(r - 0.39)) * smoothstep(0.0, 0.4, -q.x + q.y);
  c += rim * uGold * 0.9;

  // Rising herbal aroma motes / steam
  c += motes(uv, 0.18, 0.85);

  return c;
}

// S05: The AVVVS Reveal (0.74 - 0.92)
vec3 s05(vec2 uv) {
  float l = seg(uP, 0.74, 0.92);
  vec2 suv = coverUv(uv, 1.03 + 0.06 * l, vec2(0.62, 0.50));

  // Authentic AVVVS signature formulations studio hero still
  vec3 productStill = kuwahara(uStill5, suv, uKuwahara * 0.35); // Sharp label preservation

  // 3000 K Antique gold rim lighting tracing the shoulders of the bottles
  vec2 pq = (uv - vec2(0.68, 0.52)) * vec2(uRes.x / uRes.y, 1.0);
  float pl = length(pq);
  float goldRimGlow = smoothstep(0.48, 0.15, pl) * smoothstep(0.05, 0.25, pl);
  vec3 rimLight = uGold * goldRimGlow * (0.8 + 0.2 * sin(uTime * 1.2));

  // Left copy zone calm scrim
  float scrim = smoothstep(0.55, 0.05, uv.x);
  vec3 c = mix(productStill + rimLight * 0.45, uNight * 0.95, scrim * 0.40);

  return c;
}

void main() {
  vec2 uv = vUv;
  vec3 col;

  // Transition windows
  float t1 = smoother(seg(uP, 0.1232, 0.1656));
  float t2 = smoother(seg(uP, 0.4216, 0.4712));
  float t3 = smoother(seg(uP, 0.5832, 0.6112));
  float t4 = smoother(seg(uP, 0.7232, 0.7544));
  float t5 = smoother(seg(uP, 0.8984, 0.9264));

  if (uP < 0.1232) {
    // S01: The Origin
    col = s01(uv);
  } else if (uP < 0.1656) {
    // T1: Ink Bleed (S01 -> S02)
    vec2 q = (uv - vec2(0.52, 0.50)) * vec2(uRes.x / uRes.y, 1.0);
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
    // S02: The Botanical Archive (Hortus Malabaricus 3D Plate Ring)
    col = texture(uS02, uv).rgb;
  } else if (uP < 0.4712) {
    // T2: Ember Burn (S02 -> S03)
    vec2 q = (uv - vec2(0.50, 0.50)) * vec2(uRes.x / uRes.y, 1.0);
    float field = length(q) + (fbm(uv * 4.5 + uTime * 0.04) - 0.5) * 0.28;
    float front = mix(-0.25, 1.25, t2);
    float d = field - front;

    vec3 s02Col = texture(uS02, uv).rgb;
    vec3 s03Col = s03(uv);

    // Glowing ember combustion line & sparks
    float emberLine = smoothstep(0.035, 0.0, abs(d));
    vec3 ember = vec3(1.35, 0.52, 0.12) * (1.0 + 0.5 * sin(uTime * 3.5 + uv.x * 12.0));

    // Char band
    float charBand = smoothstep(0.0, 0.05, d) * smoothstep(0.12, 0.05, d);
    s02Col = mix(s02Col, uEarth * 0.6, charBand * 0.85);

    col = mix(s03Col, s02Col, smoothstep(-0.02, 0.02, d));
    col += emberLine * ember;
  } else if (uP < 0.5832) {
    // S03: From Illustration to Extraction
    col = s03(uv);
  } else if (uP < 0.6112) {
    // T3: Liquid Displacement (S03 -> S04)
    float n = fbm(uv * 3.5 + uTime * 0.1);
    vec2 dv = vec2(n - 0.5, fbm(uv * 3.5 + 19.0) - 0.5) * 0.07;
    vec3 aCol = s03(uv + dv * t3);
    vec3 bCol = s04(uv - dv * (1.0 - t3));
    col = mix(aCol, bCol, smoother(t3));
  } else if (uP < 0.7232) {
    // S04: The Alchemy of Nature
    col = s04(uv);
  } else if (uP < 0.7544) {
    // T4: Gilt Spiral Ring (S04 -> S05)
    vec2 q = (uv - vec2(0.65, 0.52)) * vec2(uRes.x / uRes.y, 1.0);
    float r = length(q);
    float front = mix(0.0, 1.25, t4);
    float ringDist = abs(r - front);
    float ring = smoothstep(0.05, 0.0, ringDist);

    vec3 aCol = s04(uv);
    vec3 bCol = s05(uv);
    col = mix(aCol, bCol, smoothstep(front - 0.02, front + 0.02, r));
    col += ring * uGold * 1.5;
  } else if (uP < 0.8984) {
    // S05: The AVVVS Product Reveal
    col = s05(uv);
  } else if (uP < 0.9264) {
    // T5: Closing Burn into Site Paper (S05 -> S06)
    float yb = 1.0 - uv.y;
    float field = yb + (fbm(uv * 5.0 + uTime * 0.03) - 0.5) * 0.22;
    float front = mix(-0.15, 1.15, t5);
    float d = field - front;

    vec3 s05Col = s05(uv);
    vec3 s06Col = uPaper;

    float emberLine = smoothstep(0.03, 0.0, abs(d));
    vec3 ember = vec3(1.30, 0.48, 0.10) * (1.0 + 0.4 * sin(uTime * 3.0 + uv.x * 10.0));

    col = mix(s06Col, s05Col, smoothstep(-0.02, 0.02, d));
    col += emberLine * ember;
  } else {
    // S06: Beyond the Film / Site Handoff
    col = uPaper;
  }

  // Authentic 24 Hz film grain
  float seed = floor(uTime * 24.0);
  float g = hash(uv * uRes + seed) - 0.5;
  col += g * uGrain;

  outColor = vec4(col, 1.0);
}`;

// Parchment plate: 3D paper curvature, intaglio copperplate impression, raking light & palm dapple
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
uniform float uTime;

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
  for (int i = 0; i < 4; i++) {
    s += a * noise(p);
    p = p * 2.03 + 7.7;
    a *= 0.5;
  }
  return s;
}

void main() {
  vec2 uv = vUv;

  // Antique rag paper fiber & subtle foxing flecks
  float fib = fbm(vec2(uv.x * 3.0, uv.y * 36.0) + uSeed);
  float blot = smoothstep(0.68, 0.95, fbm(uv * 6.0 + uSeed * 2.5));
  vec3 paper = mix(uPaper, uPaper2, fib * 0.45 + blot * 0.25);

  // Deckled paper edge
  float edge = smoothstep(0.0, 0.05, min(min(uv.x, 1.0 - uv.x), min(uv.y, 1.0 - uv.y)));
  paper *= mix(0.85, 1.0, edge);

  // Embossed copperplate platemark border (intaglio impression)
  float borderDist = min(min(abs(uv.x - 0.06), abs(uv.x - 0.94)), min(abs(uv.y - 0.06), abs(uv.y - 0.94)));
  float platemark = smoothstep(0.008, 0.0, borderDist) * 0.06;
  paper -= platemark;

  // Sepia engraving ink
  float ink = 1.0 - texture(uInk, uv).r;
  ink = smoothstep(0.08, 0.75, ink);
  vec3 col = mix(paper, uSepia, ink * 0.94);

  // Archival window raking key light from upper-left (4300 K)
  vec3 L = normalize(vec3(-0.45, 0.65, 0.75));
  float diff = clamp(dot(normalize(vN), L), 0.0, 1.0);
  col *= 0.74 + 0.32 * diff;

  // Moving tropical palm-frond dapple shadow wafting across the sheet
  vec2 dappleUv = uv * 2.8 + vec2(uTime * 0.04, uTime * 0.02);
  float dapple = sin(dappleUv.x * 3.0 + dappleUv.y * 2.0) * cos(dappleUv.x * 1.5 - dappleUv.y * 3.0);
  float dappleShadow = smoothstep(-0.2, 0.6, dapple) * 0.10;
  col *= 1.0 - dappleShadow;

  // Focal plate prominence
  col *= mix(0.68, 1.0, uFocus);

  outColor = vec4(col, uOpacity);
}`;

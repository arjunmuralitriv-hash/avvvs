// Procedural leaf blades. Each blade lies in the XY plane, base at the origin, tip at +y, length 1.
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { palette } from "./palette";
import { timeU, windU } from "./core";

export type LeafKind = "slender" | "calotropis" | "datura" | "vitex";

type StripOpts = {
  half: (y: number) => number;
  rows: number;
  fold?: number;
  bend?: number;
  teeth?: number;
  toothDepth?: number;
};

/** A blade as a three-column strip (edge, midrib, edge) so it can fold along the midrib and bend along its length. */
function strip({ half, rows, fold = 0.5, bend = 0.25, teeth = 0, toothDepth = 0 }: StripOpts) {
  const P = palette();
  const pos: number[] = [];
  const col: number[] = [];
  const idx: number[] = [];
  const base = P.leafDeep;
  const tip = P.leaf;
  const rib = P.leafPale;
  const c = new THREE.Color();
  for (let i = 0; i <= rows; i++) {
    const y = i / rows;
    let w = half(y);
    if (teeth) w *= 1 - toothDepth * ((y * teeth) % 1);
    const zb = -bend * y * y;
    pos.push(-w, y, zb + fold * w, 0, y, zb, w, y, zb + fold * w);
    c.copy(base).lerp(tip, Math.min(1, y * 1.3));
    col.push(c.r, c.g, c.b);
    c.lerp(rib, 0.35);
    col.push(c.r, c.g, c.b);
    c.copy(base).lerp(tip, Math.min(1, y * 1.3));
    col.push(c.r, c.g, c.b);
  }
  for (let i = 0; i < rows; i++) {
    const a = i * 3;
    const b = (i + 1) * 3;
    idx.push(a, a + 1, b + 1, a, b + 1, b, a + 1, a + 2, b + 2, a + 1, b + 2, b + 1);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

const slenderHalf = (w: number) => (y: number) => w * Math.pow(Math.sin(Math.PI * Math.pow(y, 0.78)), 0.9);

export function leafGeometry(kind: LeafKind, rows = 12): THREE.BufferGeometry {
  switch (kind) {
    case "slender":
      return strip({ half: slenderHalf(0.085), rows, fold: 0.6, bend: 0.3 });
    case "calotropis": // broad, oval, slightly cupped
      return strip({ half: (y) => 0.31 * Math.pow(Math.sin(Math.PI * Math.pow(y, 0.82)), 0.72), rows, fold: 0.7, bend: 0.2 });
    case "datura": // large, ovate, toothed
      return strip({
        half: (y) => 0.3 * Math.pow(Math.sin(Math.PI * Math.pow(y, 0.72)), 0.8),
        rows: Math.max(rows, 20), fold: 0.5, bend: 0.28, teeth: 5, toothDepth: 0.32,
      });
    case "vitex": {
      // five narrow fingers from one point
      const parts: THREE.BufferGeometry[] = [];
      const fan = [-0.95, -0.48, 0, 0.48, 0.95];
      const len = [0.7, 0.88, 1, 0.88, 0.7];
      fan.forEach((a, i) => {
        const g = strip({ half: slenderHalf(0.062), rows: Math.max(6, rows - 4), fold: 0.5, bend: 0.2 });
        g.scale(1, len[i], 1);
        g.rotateZ(-a);
        parts.push(g);
      });
      const m = mergeGeometries(parts) as THREE.BufferGeometry;
      parts.forEach((p) => p.dispose());
      return m;
    }
  }
}

/** Standard material for blades: vertex colour gradient, double sided, with a vertex-shader sway. */
export function leafMaterial(opts: { sway?: number; roughness?: number } = {}) {
  const sway = opts.sway ?? 1;
  const m = new THREE.MeshStandardMaterial({
    vertexColors: true,
    side: THREE.DoubleSide,
    roughness: opts.roughness ?? 0.55,
    metalness: 0,
    envMapIntensity: 0.45,
    emissive: palette().leafDeep,
    emissiveIntensity: 0.4,
  });
  m.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = timeU;
    shader.uniforms.uWind = windU;
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nuniform float uTime;\nuniform float uWind;")
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
        #ifdef USE_INSTANCING
          vec3 ip = vec3(instanceMatrix[3].x, instanceMatrix[3].y, instanceMatrix[3].z);
        #else
          vec3 ip = vec3(0.0);
        #endif
        float ph = ip.x * 0.9 + ip.z * 0.7 + ip.y * 0.5;
        float gust = sin(uTime * 0.7 + ip.x * 0.35 + ip.z * 0.25) * 0.5 + 0.5;
        float flap = sin(uTime * 1.6 + ph) * (0.5 + gust);
        float h = max(position.y, 0.0);
        transformed.z += flap * ${(0.11 * sway).toFixed(3)} * uWind * h * h;
        transformed.x += sin(uTime * 1.1 + ph * 1.3) * ${(0.05 * sway).toFixed(3)} * uWind * h * h;`,
      );
  };
  m.customProgramCacheKey = () => `leaf-sway-${sway}`;
  return m;
}

// OKLCH → linear sRGB for shader uniforms (storyboard §9.3). Never hex in components.
import * as THREE from "three";

export function oklchToLinear(l: number, c: number, hDeg: number): [number, number, number] {
  const h = (hDeg * Math.PI) / 180;
  const a = c * Math.cos(h);
  const b = c * Math.sin(h);
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.291485548 * b;
  const L = l_ ** 3, M = m_ ** 3, S = s_ ** 3;
  const r = 4.0767416621 * L - 3.3077115913 * M + 0.2309699292 * S;
  const g = -1.2684380046 * L + 2.6097574011 * M - 0.3413193965 * S;
  const bl = -0.0041960863 * L - 0.7034186147 * M + 1.707614701 * S;
  return [Math.max(0, r), Math.max(0, g), Math.max(0, bl)];
}

export const oklch = (l: number, c: number, h: number) => new THREE.Vector3(...oklchToLinear(l, c, h));

/** Film palette (01-creative-direction §3.3 `--film-*`), linear sRGB for shaders. */
export const FILM = {
  night: oklch(0.14, 0.015, 160),
  forest: oklch(0.2, 0.035, 150),
  parchment: oklch(0.9, 0.035, 82),
  parchment2: oklch(0.84, 0.045, 78),
  sepia: oklch(0.3, 0.045, 55),
  sepiaSoft: oklch(0.45, 0.05, 60),
  gold: oklch(0.762, 0.099, 80.7),
  amber: oklch(0.62, 0.13, 65),
  earth: oklch(0.3, 0.05, 60),
  paper: oklch(0.97, 0.002, 140),
};

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

/** Film palette (Luxury Ayurveda: RANAVAT × Forest Essentials × Aesop), linear sRGB for shaders. */
export const FILM = {
  night: oklch(0.24, 0.04, 165),       // Deep Forest Green #142B22
  forest: oklch(0.38, 0.05, 150),      // Botanical Green #344C38
  parchment: oklch(0.915, 0.015, 85),  // Warm Ivory / Rag Paper #F4F0E7
  parchment2: oklch(0.86, 0.025, 82),  // Aged deckle edge
  sepia: oklch(0.28, 0.035, 55),       // Sepia engraving ink #3D2E24
  sepiaSoft: oklch(0.45, 0.045, 60),
  gold: oklch(0.68, 0.10, 85),         // Antique Gold #B69A62
  amber: oklch(0.62, 0.13, 65),        // Luminous amber oil #D98218
  earth: oklch(0.42, 0.05, 65),        // Earth Brown #69513C
  paper: oklch(0.95, 0.01, 85),        // Clean site paper
};

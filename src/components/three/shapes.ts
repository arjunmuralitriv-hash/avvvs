// Shared lathe profiles. Every container is a revolved (radius, height) profile, bottom to top.
import * as THREE from "three";

const V = (r: number, y: number) => new THREE.Vector2(r, y);

/** Smooth a list of [r, y] control points with a Catmull-Rom spline. */
function spline(pts: [number, number][], n: number) {
  const c = new THREE.SplineCurve(pts.map(([r, y]) => V(r, y)));
  return c.getPoints(n);
}
const line = (pts: [number, number][]) => pts.map(([r, y]) => V(r, y));

/** Wide, shallow brass bowl with a rolled rim (uruli). Rim radius 1, height about 0.5. */
export const urUliProfile = () => [
  ...spline([[0, 0], [0.32, 0.0], [0.62, 0.09], [0.86, 0.25], [0.99, 0.43]], 14),
  ...line([[1.04, 0.47], [1.07, 0.485], [1.04, 0.5], [1.0, 0.485]]),
  ...spline([[0.97, 0.44], [0.84, 0.27], [0.6, 0.13], [0.3, 0.06], [0, 0.05]], 14),
];
/** Inner surface height at radius r (for tumbling fragments). */
export const urUliFloor = (r: number) => 0.05 + 0.4 * Math.pow(Math.min(1, r / 0.97), 2.2);
export const URULI_OIL_Y = 0.3;
export const URULI_OIL_R = 0.9;

/** Shallow plate (thali) with a lifted rim. Radius 1. */
export const plateProfile = () => [
  ...spline([[0, 0], [0.5, 0.01], [0.85, 0.05], [0.98, 0.12]], 10),
  ...line([[1.0, 0.16], [0.98, 0.17], [0.95, 0.15]]),
  ...spline([[0.84, 0.08], [0.5, 0.04], [0, 0.035]], 10),
];

/** Round-shouldered glass kuppi bottle, 1.57 tall, body radius 0.38. Closed shell with a wall thickness. */
export const kuppiProfile = () => [
  ...spline([[0, 0], [0.3, 0.0], [0.38, 0.1], [0.385, 0.8], [0.34, 1.0], [0.22, 1.16], [0.14, 1.26], [0.125, 1.4], [0.14, 1.52]], 24),
  ...line([[0.165, 1.55], [0.15, 1.57], [0.115, 1.56]]),
  ...spline([[0.105, 1.5], [0.108, 1.38], [0.12, 1.26], [0.2, 1.14], [0.32, 0.98], [0.355, 0.8], [0.355, 0.14], [0.28, 0.07], [0, 0.07]], 24),
];
/** What the oil occupies inside the kuppi (inner wall; clipped by a plane while filling). */
export const kuppiInner = () =>
  spline([[0, 0.075], [0.28, 0.075], [0.35, 0.15], [0.35, 0.8], [0.32, 0.98], [0.2, 1.14], [0.118, 1.26], [0.1, 1.38]], 22);
export const KUPPI_H = 1.57;

/** Taller, narrower bottle for arishtam and kashayam. 1.4 tall, radius 0.3. */
export const tallProfile = () => [
  ...spline([[0, 0], [0.24, 0.0], [0.3, 0.06], [0.3, 0.82], [0.26, 0.96], [0.12, 1.08], [0.1, 1.24], [0.115, 1.36]], 22),
  ...line([[0.135, 1.38], [0.12, 1.4], [0.09, 1.39]]),
  ...spline([[0.085, 1.34], [0.085, 1.22], [0.1, 1.08], [0.24, 0.94], [0.275, 0.82], [0.275, 0.1], [0.2, 0.05], [0, 0.05]], 22),
];
export const tallInner = () =>
  spline([[0, 0.055], [0.2, 0.055], [0.272, 0.12], [0.272, 0.82], [0.238, 0.94], [0.1, 1.08], [0.083, 1.2]], 20);
export const TALL_H = 1.4;

/** Wide jar for lehyam and ghritham: 0.62 tall, radius 0.5. The lid is separate. */
export const jarProfile = () => [
  ...spline([[0, 0], [0.4, 0.0], [0.5, 0.06], [0.52, 0.3], [0.48, 0.5], [0.42, 0.56]], 20),
  ...line([[0.4, 0.58], [0.36, 0.56], [0.38, 0.5]]),
  ...spline([[0.4, 0.46], [0.46, 0.3], [0.44, 0.1], [0, 0.07]], 12),
];
export const jarLidProfile = () => [
  ...line([[0, 0.6], [0.2, 0.6], [0.3, 0.6]]),
  ...spline([[0.34, 0.6], [0.45, 0.58], [0.455, 0.62], [0.43, 0.68], [0.3, 0.72], [0.16, 0.74], [0.08, 0.78], [0.07, 0.84], [0.03, 0.87], [0, 0.87]], 14),
];
export const JAR_H = 0.87;

/** Cylindrical tin for choornam: 0.58 tall, radius 0.4, lid with a rolled band. */
export const tinProfile = () => [
  ...line([[0, 0], [0.37, 0], [0.4, 0.03], [0.4, 0.5], [0.38, 0.5]]),
];
export const tinLidProfile = () => [
  ...line([[0, 0.66], [0.3, 0.66], [0.405, 0.64], [0.42, 0.58], [0.42, 0.5], [0.4, 0.5], [0.4, 0.58], [0.38, 0.62], [0.2, 0.64], [0, 0.64]]),
];
export const TIN_H = 0.66;

/** Round-bellied brass pourer (lota), 0.95 tall. */
export const lotaProfile = () => [
  ...spline([[0, 0], [0.22, 0.0], [0.4, 0.14], [0.46, 0.36], [0.34, 0.58], [0.2, 0.7], [0.2, 0.82], [0.3, 0.92]], 20),
  ...line([[0.32, 0.93], [0.3, 0.95], [0.27, 0.93]]),
  ...spline([[0.17, 0.82], [0.17, 0.7], [0.3, 0.56], [0.42, 0.36], [0.36, 0.16], [0.2, 0.06], [0, 0.05]], 18),
];

export function lathe(profile: THREE.Vector2[], segments = 48, phiLength = Math.PI * 2) {
  return new THREE.LatheGeometry(profile, segments, 0, phiLength);
}

export type ContainerKind = "bottle" | "tall" | "jar" | "tin";

/** product_type (Shopify) to container shape. */
export function containerKind(productType: string): ContainerKind {
  const t = productType.toUpperCase();
  if (t === "THAILAM" || t === "TAILAM" || t === "KERAM") return "bottle";
  if (t === "LEHYAM" || t === "GHRITHAM") return "jar";
  if (t === "CHOORNAM") return "tin";
  if (t === "ARISHTAM" || t === "KASHAYAM") return "tall";
  return "bottle";
}

export type ContainerParts = {
  height: number;
  /** body: glass shell, jar or tin */
  shell: THREE.BufferGeometry;
  /** contents seen through glass (bottles only) */
  content: THREE.BufferGeometry | null;
  /** cap, cork or lid */
  cap: THREE.BufferGeometry;
  /** label: an arc of cylinder around the body, centred on +z */
  label: THREE.BufferGeometry;
  /** arc length / height of the label, to crop the product photo */
  labelAspect: number;
  glass: boolean;
};

function labelArc(r: number, y0: number, y1: number, arc: number, seg = 18) {
  const g = new THREE.CylinderGeometry(r, r, y1 - y0, seg, 1, true, -arc / 2, arc);
  g.translate(0, (y0 + y1) / 2, 0);
  return g;
}

export function makeContainer(kind: ContainerKind, segs = 40): ContainerParts {
  switch (kind) {
    case "bottle": {
      const cap = lathe(line([[0, 1.5], [0.1, 1.5], [0.108, 1.6], [0.098, 1.7], [0.06, 1.72], [0, 1.72]]), 16);
      return {
        height: 1.72, glass: true, labelAspect: (0.392 * 2.6) / 0.54,
        shell: lathe(kuppiProfile(), segs),
        content: lathe(kuppiInner(), segs),
        cap,
        label: labelArc(0.392, 0.3, 0.84, 2.6),
      };
    }
    case "tall":
      return {
        height: 1.46, glass: true, labelAspect: (0.307 * 2.4) / 0.58,
        shell: lathe(tallProfile(), segs),
        content: lathe(tallInner(), segs),
        cap: lathe(line([[0, 1.32], [0.088, 1.32], [0.095, 1.42], [0.08, 1.46], [0, 1.46]]), 16),
        label: labelArc(0.307, 0.22, 0.8, 2.4),
      };
    case "jar":
      return {
        height: JAR_H, glass: false, labelAspect: (0.535 * 2.4) / 0.3,
        shell: lathe(jarProfile(), segs),
        content: null,
        cap: lathe(jarLidProfile(), segs),
        label: labelArc(0.535, 0.14, 0.44, 2.4),
      };
    case "tin":
      return {
        height: TIN_H, glass: false, labelAspect: (0.405 * 2.6) / 0.36,
        shell: lathe(tinProfile(), segs),
        content: null,
        cap: lathe(tinLidProfile(), segs),
        label: labelArc(0.405, 0.1, 0.46, 2.6),
      };
  }
}

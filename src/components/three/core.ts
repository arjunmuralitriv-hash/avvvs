// Shared state, quality tiers, tiny helpers and procedural textures for the story scenes.
import { createContext, useContext, useEffect } from "react";
import * as THREE from "three";

export type Quality = {
  tier: 0 | 1 | 2 | 3;
  maxDpr: number;
  /** instanced leaves in the garden (hard cap 2000) */
  leaves: number;
  fragments: number;
  steam: number;
  /** radial segments on lathe geometry */
  segs: number;
  /** rows along a leaf blade */
  rows: number;
};

export function qualityFor(tier: number): Quality {
  if (tier >= 3) return { tier: 3, maxDpr: 2, leaves: 1800, fragments: 260, steam: 10, segs: 56, rows: 14 };
  if (tier === 2) return { tier: 2, maxDpr: 1.5, leaves: 1100, fragments: 170, steam: 7, segs: 40, rows: 10 };
  if (tier === 1) return { tier: 1, maxDpr: 1, leaves: 420, fragments: 70, steam: 4, segs: 28, rows: 7 };
  return { tier: 0, maxDpr: 1, leaves: 240, fragments: 40, steam: 3, segs: 24, rows: 6 };
}

/** Mutable per-frame state. Written once per frame by the controller, read by every scene. */
export type Story = {
  /** damped scroll position: chapter + local, 0..8 */
  t: number;
  time: number;
  dt: number;
  /** per chapter: progress through that chapter's own animation, 0..1 */
  p: number[];
  /** per chapter: visibility weight, 0..1 (cross-dissolve) */
  w: number[];
  q: Quality;
  /** latest hovered almirah shelf (-1 none) */
  hover: number;
  /** highest chapter index that should be built */
  reach: number;
};

export const StoryContext = createContext<Story | null>(null);
export function useStory(): Story {
  const s = useContext(StoryContext);
  if (!s) throw new Error("StoryContext missing");
  return s;
}

/** Uniforms shared by every swaying leaf material. */
export const timeU = { value: 0 };
export const windU = { value: 1 };

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const smooth = (a: number, b: number, v: number) => {
  const x = clamp01((v - a) / (b - a));
  return x * x * (3 - 2 * x);
};
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const easeOut = (x: number) => 1 - (1 - x) * (1 - x) * (1 - x);
export const easeIn = (x: number) => x * x;

export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Disposable = { dispose: () => void } | null | undefined;
/** Dispose geometries, materials and textures when the component unmounts. */
export function useDispose(items: Disposable[]) {
  useEffect(
    () => () => {
      items.forEach((i) => i?.dispose());
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
}

// ---- procedural textures (cached, disposed with the canvas) ----
const made: THREE.Texture[] = [];
const cache: Record<string, THREE.Texture> = {};

function canvasTexture(size: number, draw: (c: CanvasRenderingContext2D, s: number) => void, srgb = true) {
  const cv = document.createElement("canvas");
  cv.width = cv.height = size;
  const c = cv.getContext("2d") as CanvasRenderingContext2D;
  draw(c, size);
  const tex = new THREE.CanvasTexture(cv);
  if (srgb) tex.colorSpace = THREE.SRGBColorSpace;
  made.push(tex);
  return tex;
}

/** Soft round alpha falloff (contact shadow when tinted dark). */
export function softTexture(): THREE.Texture {
  return (cache.soft ??= canvasTexture(128, (c, s) => {
    const g = c.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.45, "rgba(255,255,255,0.55)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    c.fillStyle = g;
    c.fillRect(0, 0, s, s);
  }));
}

/** Cloudy puff for steam. */
export function steamTexture(): THREE.Texture {
  return (cache.steam ??= canvasTexture(128, (c, s) => {
    const r = rng(7);
    for (let i = 0; i < 9; i++) {
      const x = s * (0.3 + r() * 0.4);
      const y = s * (0.3 + r() * 0.4);
      const rad = s * (0.16 + r() * 0.2);
      const g = c.createRadialGradient(x, y, 0, x, y, rad);
      g.addColorStop(0, "rgba(255,255,255,0.55)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      c.fillStyle = g;
      c.fillRect(0, 0, s, s);
    }
  }));
}

/** Wood grain, greyscale, multiplied by a wood colour. */
export function grainTexture(): THREE.Texture {
  if (cache.grain) return cache.grain;
  const tex = canvasTexture(256, (c, s) => {
    c.fillStyle = "#dcdcdc";
    c.fillRect(0, 0, s, s);
    const r = rng(11);
    for (let i = 0; i < 70; i++) {
      const y = r() * s;
      const amp = 2 + r() * 6;
      const f = 0.01 + r() * 0.03;
      c.strokeStyle = `rgba(60,60,60,${0.06 + r() * 0.16})`;
      c.lineWidth = 0.6 + r() * 1.8;
      c.beginPath();
      for (let x = 0; x <= s; x += 8) c.lineTo(x, y + Math.sin(x * f + i) * amp);
      c.stroke();
    }
  });
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  cache.grain = tex;
  return tex;
}

export function disposeShared() {
  made.splice(0).forEach((t) => t.dispose());
  for (const k of Object.keys(cache)) delete cache[k];
}

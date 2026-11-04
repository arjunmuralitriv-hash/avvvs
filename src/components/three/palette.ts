// The only place colours live for the 3D scenes.
// Brand colours are read from the CSS tokens at runtime (src/app/styles/tokens.css) so the scene follows the
// design system; the literals are the same oklch values and act as the fallback (and for scene-only colours).
import * as THREE from "three";

function oklchToColor(src: string): THREE.Color | null {
  const m = /oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)/.exec(src);
  if (!m) return null;
  const L = m[2] ? parseFloat(m[1]) / 100 : parseFloat(m[1]);
  const C = parseFloat(m[3]);
  const h = (parseFloat(m[4]) * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const mm = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const cl = (v: number) => Math.min(1, Math.max(0, v));
  return new THREE.Color().setRGB(
    cl(4.0767416621 * l - 3.3077115913 * mm + 0.2309699292 * s),
    cl(-1.2684380046 * l + 2.6097574011 * mm - 0.3413193965 * s),
    cl(-0.0041960863 * l - 0.7034186147 * mm + 1.707614701 * s),
    THREE.LinearSRGBColorSpace,
  );
}

function token(name: string, fallback: string): THREE.Color {
  if (typeof document !== "undefined") {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    const c = v && oklchToColor(v);
    if (c) return c;
  }
  return oklchToColor(fallback) as THREE.Color;
}

const lit = (s: string) => oklchToColor(s) as THREE.Color;

function build() {
  return {
    // brand (tokens)
    brass: token("--color-brass", "oklch(74% 0.1 78)"),
    gold: token("--color-gold", "oklch(75.5% 0.095 80)"),
    paper: token("--color-paper", "oklch(95.5% 0.022 88)"),
    ground: token("--color-paper-3", "oklch(86% 0.044 80)"),
    ink: token("--color-ink", "oklch(25% 0.04 35)"),
    accent: token("--color-accent", "oklch(50.5% 0.137 251)"),
    accentDeep: token("--color-accent-deep", "oklch(41% 0.12 252)"),
    // story ground for the dark chapter (mirrors .story[data-chapter="4"])
    oxblood: lit("oklch(27% 0.09 20)"),
    // scene only
    leaf: lit("oklch(56% 0.12 140)"),
    leafDeep: lit("oklch(38% 0.09 150)"),
    leafPale: lit("oklch(72% 0.13 125)"),
    leafRoast: lit("oklch(52% 0.08 80)"),
    soil: lit("oklch(46% 0.06 55)"),
    soilDark: lit("oklch(34% 0.05 45)"),
    wood: lit("oklch(52% 0.07 60)"),
    woodDark: lit("oklch(38% 0.07 45)"),
    cloth: lit("oklch(90% 0.04 88)"),
    clothStain: lit("oklch(72% 0.07 110)"),
    rope: lit("oklch(56% 0.08 70)"),
    oil: lit("oklch(48% 0.13 62)"),
    oilDeep: lit("oklch(24% 0.07 40)"),
    oilBright: lit("oklch(70% 0.15 70)"),
    glass: lit("oklch(94% 0.015 190)"),
    tea: lit("oklch(40% 0.1 45)"),
    ceramic: lit("oklch(46% 0.1 48)"),
    cork: lit("oklch(68% 0.07 75)"),
    steam: lit("oklch(96% 0.02 85)"),
    lamp: lit("oklch(82% 0.13 70)"),
    dawn: lit("oklch(90% 0.07 75)"),
    cool: lit("oklch(84% 0.03 235)"),
  };
}

let cache: ReturnType<typeof build> | null = null;
export function palette() {
  return (cache ??= build());
}
export type Palette = ReturnType<typeof palette>;

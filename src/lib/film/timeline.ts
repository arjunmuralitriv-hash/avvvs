// Film timeline: pure data, server-safe. Values from docs/plan/02-storyboard.md §0.2–0.3.
// Prototype scope (roadmap phase 4): S01 → T1 ink bleed → S02 plate ring.

export type SceneId = "s01" | "s02" | "s03" | "s04" | "s05" | "s06";

export const SCENES: Record<SceneId, { start: number; end: number; tone: "dark" | "parchment" | "site" }> = {
  s01: { start: 0.0, end: 0.14, tone: "dark" },
  s02: { start: 0.14, end: 0.46, tone: "parchment" },
  s03: { start: 0.46, end: 0.6, tone: "dark" },
  s04: { start: 0.6, end: 0.74, tone: "dark" },
  s05: { start: 0.74, end: 0.92, tone: "dark" },
  s06: { start: 0.92, end: 1.0, tone: "site" },
};

/** Transition windows: last 12% of the outgoing scene + first 8% of the incoming one. */
export const TRANSITIONS = {
  t1: { a: 0.1232, b: 0.1656, mid: 0.1444 }, // S01 → S02 ink bleed
  t2: { a: 0.4216, b: 0.4712, mid: 0.4464 }, // S02 → S03 ember burn
} as const;

/** Prototype track: S01 + S02 only, so the track ends at the S02 end and the scroll map is rescaled. */
export const PROTOTYPE_END = SCENES.s02.end;

export const TRACK_VH = { desktop: 1400, mobile: 1000 } as const;

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const seg = (x: number, a: number, b: number) => clamp01((x - a) / (b - a));
export const smoother = (t: number) => t * t * t * (t * (6 * t - 15) + 10);
export const local = (p: number, id: SceneId) => seg(p, SCENES[id].start, SCENES[id].end);

/** S02 beats (storyboard §1): ring reveal, then 5 plates in turn, then the specimen. */
export const S02_BEATS = {
  ringReveal: { a: 0.166, b: 0.204 },
  plates: { a: 0.204, b: 0.396 }, // 5 equal sub-segments
  specimen: { a: 0.396, b: 0.422 },
} as const;

/** Text cues (copy ids from 01-creative-direction §4.2). show/hide in film progress p. */
export const CUES = [
  { id: "s01.title", show: 0.0, hide: 0.028 },
  { id: "s01.head", show: 0.056, hide: 0.09 },
  { id: "s01.caption", show: 0.095, hide: 0.122 },
  { id: "s02.head", show: 0.17, hide: 0.2 },
  { id: "s02.plate.0", show: 0.208, hide: 0.24 },
  { id: "s02.plate.1", show: 0.246, hide: 0.278 },
  { id: "s02.plate.2", show: 0.285, hide: 0.317 },
  { id: "s02.plate.3", show: 0.323, hide: 0.355 },
  { id: "s02.plate.4", show: 0.362, hide: 0.394 },
] as const;

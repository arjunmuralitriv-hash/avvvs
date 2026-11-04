// Film timeline: pure data, server-safe. Values from docs/plan/02-storyboard.md §0.2–0.3 and §9.1.

export type SceneId = "s01" | "s02" | "s03" | "s04" | "s05" | "s06";

export const SCENES: Record<SceneId, { start: number; end: number; tone: "dark" | "parchment" | "site" }> = {
  s01: { start: 0.0, end: 0.14, tone: "dark" },
  s02: { start: 0.14, end: 0.46, tone: "parchment" },
  s03: { start: 0.46, end: 0.6, tone: "dark" },
  s04: { start: 0.6, end: 0.74, tone: "dark" },
  s05: { start: 0.74, end: 0.92, tone: "dark" },
  s06: { start: 0.92, end: 1.0, tone: "site" },
};

/** Transition windows: last 12% of the outgoing scene + first 8% of the incoming one (storyboard §0.3). */
export const TRANSITIONS = {
  t1: { a: 0.1232, b: 0.1656, mid: 0.1444, mode: 1 }, // S01 → S02 ink bleed
  t2: { a: 0.4216, b: 0.4712, mid: 0.4464, mode: 2 }, // S02 → S03 ember burn
  t3: { a: 0.5832, b: 0.6112, mid: 0.5972, mode: 3 }, // S03 → S04 liquid displace
  t4: { a: 0.7232, b: 0.7544, mid: 0.7388, mode: 4 }, // S04 → S05 spiral ring
  t5: { a: 0.8984, b: 0.9264, mid: 0.9124, mode: 5 }, // S05 → S06 closing burn
} as const;

export const TONE_SWITCH = [
  { p: 0.1444, tone: "parchment" as const },
  { p: 0.4464, tone: "dark" as const },
  { p: 0.9124, tone: "site" as const },
] as const;

/** Full film scroll end. */
export const PROTOTYPE_END = 1.0;

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

export type Cue = { id: string; show: number; hide: number | null; scene: SceneId };

/** Text cues (storyboard §9.1 CUES). show/hide in film progress p. */
export const CUES: Cue[] = [
  { id: "s01.title", show: 0.0, hide: 0.028, scene: "s01" }, // visible at first paint, no entry tween
  { id: "s01.head", show: 0.0588, hide: 0.0896, scene: "s01" },
  { id: "s01.caption", show: 0.098, hide: 0.1204, scene: "s01" },
  { id: "s02.head", show: 0.1688, hide: 0.2008, scene: "s02" },
  { id: "s02.plate.0", show: 0.2194, hide: 0.2378, scene: "s02" },
  { id: "s02.plate.1", show: 0.2578, hide: 0.2762, scene: "s02" },
  { id: "s02.plate.2", show: 0.2962, hide: 0.3146, scene: "s02" },
  { id: "s02.plate.3", show: 0.3346, hide: 0.353, scene: "s02" },
  { id: "s02.plate.4", show: 0.373, hide: 0.4088, scene: "s02" },
  { id: "s03.head", show: 0.474, hide: 0.5804, scene: "s03" },
  { id: "s04.head", show: 0.614, hide: 0.7176, scene: "s04" },
  { id: "s05.head", show: 0.812, hide: 0.8948, scene: "s05" },
  { id: "s05.productNames", show: 0.8228, hide: 0.8948, scene: "s05" },
  { id: "handoff.note", show: 0.928, hide: null, scene: "s06" },
];

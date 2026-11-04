// Shared scroll progress for the homepage story.
// StoryTrack (DOM) writes it; StoryCanvas (three.js) reads it inside useFrame without re-rendering React.
//   progress: 0 at the hero, 1 at the end of chapter 7, linear in scroll distance.
//   chapter:  index of the chapter in view (0 = hero … 7 = clinic).
//   local:    0..1 progress inside the current chapter.

type Snapshot = { progress: number; chapter: number; local: number };
const state: Snapshot = { progress: 0, chapter: 0, local: 0 };
const subs = new Set<() => void>();

export const storyProgress = {
  get: (): Snapshot => state,
  set(next: Snapshot) {
    if (next.progress === state.progress && next.chapter === state.chapter) return;
    const chapterChanged = next.chapter !== state.chapter;
    state.progress = next.progress;
    state.chapter = next.chapter;
    state.local = next.local;
    if (chapterChanged) subs.forEach((f) => f());
  },
  /** Fires only when the chapter changes (for React state); per-frame readers should call get(). */
  subscribe(fn: () => void) {
    subs.add(fn);
    return () => {
      subs.delete(fn);
    };
  },
};

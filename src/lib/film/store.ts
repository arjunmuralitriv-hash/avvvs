// Mutable film state. ScrollTrigger writes `target`; the canvas damps toward it inside useFrame.
// No React state here: nothing re-renders per frame.

export const film = {
  target: 0, // raw scroll progress 0..1 (ScrollTrigger self.progress, mapped to film p)
  p: 0, // damped progress, written by the canvas each frame
  velocity: 0,
  live: false,
  setTarget(p: number, v = 0) {
    this.target = p;
    this.velocity = v;
  },
};

export type Film = typeof film;

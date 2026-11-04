"use client";
// One master ScrollTrigger on the track writes film progress (storyboard §0.4). No pin: the stage is sticky.
import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { film } from "@/lib/film/store";
import { PROTOTYPE_END } from "@/lib/film/timeline";

export function FilmScroll() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    // Reuse the site Lenis instance (SmoothScroll) so there is one scroller; feed it into ScrollTrigger.
    const lenis = (window as unknown as { __lenis?: { on: (e: string, f: () => void) => void; off?: (e: string, f: () => void) => void; options?: { lerp?: number } } }).__lenis;
    const update = () => ScrollTrigger.update();
    if (lenis) {
      if (lenis.options) lenis.options.lerp = 0.085; // pear's measured feel (CD C10)
      lenis.on("scroll", update);
    }
    const st = ScrollTrigger.create({
      trigger: "#film-track",
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      invalidateOnRefresh: true,
      onUpdate: (self) => film.setTarget(self.progress * PROTOTYPE_END, self.getVelocity()),
    });
    film.setTarget(st.progress * PROTOTYPE_END);
    return () => {
      st.kill();
      lenis?.off?.("scroll", update);
    };
  }, []);
  return null;
}

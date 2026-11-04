"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { storyProgress } from "@/lib/story-progress";

/**
 * Measures how far the visitor is through the story and publishes it to storyProgress.
 * Also mirrors the current chapter into data-chapter so CSS can switch tone (dark chapter).
 * Works with native scroll and Lenis (both fire 'scroll').
 */
export function StoryTrack({ chapterCount, children }: { chapterCount: number; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const steps = [...el.querySelectorAll<HTMLElement>("[data-step]")];
    let raf = 0;

    const measure = () => {
      raf = 0;
      const vh = window.innerHeight;
      const rect = el.getBoundingClientRect();
      const total = Math.max(1, rect.height - vh);
      const progress = Math.min(1, Math.max(0, -rect.top / total));
      // The chapter whose block straddles the middle of the viewport.
      let chapter = 0;
      let local = 0;
      const mid = vh * 0.5;
      for (let i = 0; i < steps.length; i++) {
        const r = steps[i].getBoundingClientRect();
        if (r.top <= mid) {
          chapter = i;
          local = Math.min(1, Math.max(0, (mid - r.top) / Math.max(1, r.height)));
        }
      }
      storyProgress.set({ progress, chapter, local });
      if (el.dataset.chapter !== String(chapter)) el.dataset.chapter = String(chapter);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [chapterCount]);

  return (
    <div ref={ref} className="story" data-chapter="0">
      {children}
    </div>
  );
}

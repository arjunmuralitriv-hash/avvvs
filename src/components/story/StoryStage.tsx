"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const StoryCanvas = dynamic(() => import("@/components/three/StoryCanvas"), { ssr: false });

/**
 * The pinned 3D stage. Mounts the canvas only when: WebGL exists, the visitor allows motion,
 * and the browser is idle after first paint. Until then (and forever, under reduced motion)
 * the per-chapter stills in the DOM carry the story.
 */
export function StoryStage() {
  const [mount, setMount] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const c = document.createElement("canvas");
    if (!(c.getContext("webgl2") || c.getContext("webgl"))) return;
    const go = () => setMount(true);
    const ric = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
    const id = ric ? ric(go, { timeout: 1500 }) : window.setTimeout(go, 600);
    const onLive = () => document.documentElement.dataset.storyLive = "true";
    window.addEventListener("story:live", onLive);
    return () => {
      window.removeEventListener("story:live", onLive);
      if (!ric) clearTimeout(id);
    };
  }, []);

  return (
    <div className="story__stage" aria-hidden="true">
      {mount ? <StoryCanvas /> : null}
    </div>
  );
}

"use client";
// Sticky stage: mounts the canvas only with WebGL and motion allowed, otherwise the server stills carry the film.
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { film } from "@/lib/film/store";
import { CUES } from "@/lib/film/timeline";
import { FilmScroll } from "./FilmScroll";

const FilmCanvas = dynamic(() => import("@/components/three/film/FilmCanvas"), { ssr: false });

export function FilmStage({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<"static" | "live">("static");
  const [ready, setReady] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const c = document.createElement("canvas");
    if (!c.getContext("webgl2")) return;
    queueMicrotask(() => setMode("live"));
    const onLive = () => setReady(true);
    window.addEventListener("film:live", onLive);
    return () => window.removeEventListener("film:live", onLive);
  }, []);

  // Text cues: toggle data-on per cue from the damped progress. Not scrubbed (storyboard §0.4).
  useEffect(() => {
    if (mode !== "live") return;
    let raf = 0;
    const els = new Map<string, HTMLElement>();
    textRef.current?.querySelectorAll<HTMLElement>("[data-cue]").forEach((el) => els.set(el.dataset.cue!, el));
    const tick = () => {
      const p = film.p;
      for (const c of CUES) {
        const el = els.get(c.id);
        if (!el) continue;
        const on = p >= c.show && p < c.hide;
        if ((el.dataset.on === "true") !== on) el.dataset.on = String(on);
      }
      document.documentElement.dataset.filmTone = p > 0.1444 ? "parchment" : "dark";
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); delete document.documentElement.dataset.filmTone; };
  }, [mode]);

  return (
    <div className="film" data-mode={mode} data-ready={ready}>
      <div className="film__stage">
        {mode === "live" ? <FilmCanvas /> : null}
        <div ref={textRef} className="film__text">{children}</div>
      </div>
      {mode === "live" ? <FilmScroll /> : null}
    </div>
  );
}

"use client";
// Sticky stage: mounts the canvas with WebGL and motion allowed; server stills carry the film otherwise.
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
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

  // Text cues: toggle data-on per cue from the damped progress.
  useEffect(() => {
    if (mode !== "live") return;
    let raf = 0;
    const els = new Map<string, HTMLElement>();
    textRef.current?.querySelectorAll<HTMLElement>("[data-cue]").forEach((el) => {
      els.set(el.dataset.cue!, el);
    });

    const tick = () => {
      const p = film.p;
      for (const c of CUES) {
        const el = els.get(c.id);
        if (!el) continue;
        // Keep title on if at the top of the page
        const on = c.id === "s01.title" ? (p < 0.032 || window.scrollY <= 10) : (p >= c.show && (c.hide === null || p < c.hide));
        if ((el.dataset.on === "true") !== on) {
          el.dataset.on = String(on);
        }
      }

      // Update film tone for chrome & styling
      let tone: "dark" | "parchment" | "site" = "dark";
      if (p >= 0.1444 && p < 0.4464) {
        tone = "parchment";
      } else if (p >= 0.9124) {
        tone = "site";
      }
      if (document.documentElement.dataset.filmTone !== tone) {
        document.documentElement.dataset.filmTone = tone;
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      delete document.documentElement.dataset.filmTone;
    };
  }, [mode]);

  return (
    <div className="film is-live" data-mode={mode} data-ready={ready}>
      <div className="film__stage">
        {/* Fast first-paint backdrop image before Three.js loads */}
        <div className="film__backdrop" aria-hidden="true">
          <Image
            src="/film/stills/s01-evergreen-d.webp"
            alt="Misty Kerala evergreen forest, origins of AVVVS herbs"
            fill
            priority
            sizes="100vw"
          />
        </div>

        {mode === "live" ? <FilmCanvas /> : null}

        <div ref={textRef} className="film__text">
          {children}
        </div>

        {/* Quiet chrome */}
        <div className="film__chrome" aria-hidden="true">
          <span className="film__tag">Arya Vaidya Vilasini Vaidya Sala · Founded 1921</span>
          <Link href="#site" className="film__skip">
            Skip film →
          </Link>
        </div>
      </div>

      {mode === "live" ? <FilmScroll /> : null}
    </div>
  );
}

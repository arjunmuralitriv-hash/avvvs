"use client";

import dynamic from "next/dynamic";

// Agent B owns the shader; until it ships the component renders null and the header looks complete without it.
const TreatmentShader = dynamic(() => import("@/components/three/TreatmentShader"), { ssr: false });

/** Warm-oil shader behind a treatment header. Decorative: aria-hidden, no content lives in it. */
export function ShaderBackdrop({ className }: { className?: string }) {
  return (
    <div className={className} aria-hidden="true">
      <TreatmentShader tone="paper" />
    </div>
  );
}

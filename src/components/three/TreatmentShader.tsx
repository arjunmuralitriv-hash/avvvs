"use client";
/* eslint-disable react-hooks/immutability -- react-three-fiber scenes mutate three.js objects and shared frame state inside useFrame by design */
// A slow warm-oil / ink-in-water shader. Very low contrast. Fills its positioned parent, aria-hidden, pauses offscreen.
import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { palette } from "./palette";

const vert = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

const frag = /* glsl */ `
uniform float uTime;
uniform float uAspect;
uniform vec3 uBase;
uniform vec3 uInk;
uniform float uAmount;
varying vec2 vUv;
vec2 hash2(vec2 p) { p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3))); return -1.0 + 2.0 * fract(sin(p) * 43758.5453); }
float gnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(dot(hash2(i), f), dot(hash2(i + vec2(1, 0)), f - vec2(1, 0)), u.x),
             mix(dot(hash2(i + vec2(0, 1)), f - vec2(0, 1)), dot(hash2(i + vec2(1, 1)), f - vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) { float a = 0.5, s = 0.0; for (int i = 0; i < 4; i++) { s += a * gnoise(p); p = p * 2.0 + 7.3; a *= 0.5; } return s; }
void main() {
  vec2 p = vec2(vUv.x * uAspect, vUv.y) * 1.4;
  float t = uTime * 0.035;
  vec2 q = vec2(fbm(p + t), fbm(p + vec2(5.2, 1.3) - t));
  float f = fbm(p + 2.2 * q + vec2(0.0, t * 0.6));
  float m = smoothstep(-0.25, 0.45, f);
  vec3 col = mix(uBase, uInk, m * uAmount);
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}`;

function Plane({ tone, paused }: { tone: "paper" | "dark"; paused: React.RefObject<boolean> }) {
  const P = palette();
  const aspect = useThree((s) => s.size.width / s.size.height);
  const mat = useMemo(() => {
    const dark = tone === "dark";
    return new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      uniforms: {
        uTime: { value: 0 },
        uAspect: { value: 1 },
        uBase: { value: dark ? P.oxblood : P.paper },
        uInk: { value: dark ? P.oilDeep.clone().lerp(P.oxblood, 0.4) : P.brass },
        uAmount: { value: dark ? 0.45 : 0.16 },
      },
    });
  }, [P, tone]);
  const geo = useMemo(() => new THREE.PlaneGeometry(2, 2), []);
  useEffect(
    () => () => {
      mat.dispose();
      geo.dispose();
    },
    [mat, geo],
  );
  useFrame((_, dt) => {
    if (paused.current) return;
    mat.uniforms.uTime.value += Math.min(dt, 0.05);
    mat.uniforms.uAspect.value = aspect;
  });
  return <mesh geometry={geo} material={mat} frustumCulled={false} />;
}

export default function TreatmentShader({ tone = "paper" }: { tone?: "paper" | "dark" }) {
  const host = useRef<HTMLDivElement>(null);
  const paused = useRef(true);
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => (paused.current = !e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={host} aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <Canvas dpr={1} frameloop="always" gl={{ antialias: false, alpha: false }} camera={{ position: [0, 0, 1] }}>
        <Plane tone={tone} paused={paused} />
      </Canvas>
    </div>
  );
}

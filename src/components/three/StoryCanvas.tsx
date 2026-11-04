"use client";
/* eslint-disable react-hooks/immutability -- react-three-fiber scenes mutate three.js objects and shared frame state inside useFrame by design */
// The pinned story stage. One transparent WebGL canvas, scrubbed by storyProgress (written by StoryTrack).
//   chapter scenes: sprig(0) garden(1) picking(2) preparing(3) oil(4) factory(5) almirah(6) clinic(7)
// The scene is lit and framed per chapter; each chapter's prop sits on the side opposite the DOM copy panel.
// Fires window event "story:live" after the first frames so the per-chapter stills fade out.
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { getGPUTier } from "detect-gpu";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { storyProgress } from "@/lib/story-progress";
import { palette } from "./palette";
import { clamp01, disposeShared, lerp, qualityFor, smooth, StoryContext, timeU, windU, type Quality, type Story } from "./core";
import SprigScene from "./scenes/Sprig";
import GardenScene from "./scenes/Garden";
import PickingScene from "./scenes/Picking";
import PreparingScene from "./scenes/Preparing";
import OilScene from "./scenes/Oil";
import FactoryScene from "./scenes/Factory";
import AlmirahScene from "./scenes/Almirah";
import ClinicScene from "./scenes/Clinic";

const CHAPTERS = 8;
type V3 = [number, number, number];
type Pose = { pos: V3; look: V3 };

/** Camera path per chapter, as a function of that chapter's own progress p (0..1). */
const POSES: ((p: number) => Pose)[] = [
  (p) => ({ pos: [-0.4 + 0.8 * p, 0.35, 8.4], look: [0.2, 0.1, 0] }),
  (p) => ({ pos: [0.7, 0.55, lerp(4.4, -2.2, p)], look: [0.7, 0.66, lerp(4.4, -2.2, p) - 5] }),
  (p) => ({ pos: [0.3 - 0.4 * p, 1.0, 7.4], look: [0, -0.05, 0] }),
  (p) => ({ pos: [0, 2.7, 5.6 - 0.4 * p], look: [0, 0.4, 0] }),
  (p) => ({ pos: [-0.8 + 1.6 * p, 3.0, 7.4], look: [0, 0.15, 0] }),
  () => ({ pos: [0.2, 1.1, 9.6], look: [0.4, 0.75, 0] }),
  (p) => ({ pos: [-0.9 + 1.2 * p, 0.1, 10.6], look: [0, -0.1, 0] }),
  (p) => ({ pos: [-1.4 + 0.6 * p, 1.7, 6.4], look: [0.3, 0.7, 0] }),
];
/** +1: prop on the right (copy panel bottom-left, odd chapters and the hero); -1: prop on the left. */
const SIDE = [1, 1, -1, 1, -1, 1, -1, 1];
/** Light rig per chapter. */
const LIGHT = [
  { hemi: 0.5, key: 2.6, kp: [-4, 2.2, 3] as V3, lamp: 0, lp: [0, 0, 0] as V3, env: 0.5, wind: 0.8, fog: [30, 60] },
  { hemi: 0.7, key: 2.8, kp: [-4, 2.6, 2] as V3, lamp: 0, lp: [0, 0, 0] as V3, env: 0.4, wind: 1.3, fog: [4, 15] },
  { hemi: 0.6, key: 2.6, kp: [-3, 4, 4] as V3, lamp: 0, lp: [0, 0, 0] as V3, env: 0.65, wind: 0.4, fog: [40, 80] },
  { hemi: 0.5, key: 2.6, kp: [-3, 5, 3] as V3, lamp: 0, lp: [0, 0, 0] as V3, env: 0.65, wind: 0.3, fog: [40, 80] },
  { hemi: 0.1, key: 0, kp: [0, 0, 0] as V3, lamp: 38, lp: [-2.6, 2.4, 2.8] as V3, env: 0.28, wind: 0.2, fog: [40, 80] },
  { hemi: 0.6, key: 2.6, kp: [-3, 4, 4] as V3, lamp: 0, lp: [0, 0, 0] as V3, env: 0.75, wind: 0.2, fog: [40, 80] },
  { hemi: 0.55, key: 2.4, kp: [-3, 3, 5] as V3, lamp: 0, lp: [0, 0, 0] as V3, env: 0.55, wind: 0.2, fog: [40, 80] },
  { hemi: 0.6, key: 2.6, kp: [-4, 3, 3] as V3, lamp: 7, lp: [-1, 2, 2.4] as V3, env: 0.55, wind: 0.2, fog: [40, 80] },
];

function Environment() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pm = new THREE.PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const rt = pm.fromScene(room, 0.04);
    scene.environment = rt.texture;
    return () => {
      scene.environment = null;
      rt.dispose();
      pm.dispose();
      room.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose();
        (m.material as THREE.Material | undefined)?.dispose?.();
      });
    };
  }, [gl, scene]);
  return null;
}

/** Reads storyProgress every frame, damps toward it, and drives the camera, lights, fog and fades. */
function Controller({ S }: { S: Story }) {
  const { camera, scene, size, gl } = useThree();
  const hemi = useRef<THREE.HemisphereLight>(null);
  const key = useRef<THREE.DirectionalLight>(null);
  const lamp = useRef<THREE.PointLight>(null);
  const frames = useRef(0);
  const P = palette();
  const tmp = useMemo(() => ({ pos: new THREE.Vector3(), look: new THREE.Vector3(), c: new THREE.Color() }), []);

  // Pace the canvas: full rate while the page is scrolling, half rate when only ambient motion remains,
  // nothing when the tab is hidden or the stage is off screen.
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    let raf = 0;
    let last = 0;
    let vis = !document.hidden;
    let inView = true;
    const io = new IntersectionObserver(([e]) => (inView = e.isIntersecting));
    io.observe(gl.domElement);
    const onVis = () => (vis = !document.hidden);
    document.addEventListener("visibilitychange", onVis);
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!vis || !inView) return;
      const sp = storyProgress.get();
      const moving = Math.abs(sp.chapter + sp.local - S.t) > 0.002;
      if (now - last >= (moving ? 0 : 33)) {
        last = now;
        invalidate();
      }
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [gl, invalidate, S]);

  useFrame((_, raw) => {
    const dt = Math.min(raw, 0.05);
    S.dt = dt;
    S.time += dt;
    timeU.value = S.time;
    const sp = storyProgress.get();
    const target = sp.chapter + sp.local;
    S.t += (target - S.t) * (1 - Math.exp(-dt * 5.5));
    const t = S.t;

    let sum = 0;
    for (let i = 0; i < CHAPTERS; i++) {
      const rise = i === 0 ? 1 : smooth(i - 0.25, i + 0.15, t);
      const fall = i === CHAPTERS - 1 ? 1 : 1 - smooth(i + 0.85, i + 1.25, t);
      S.w[i] = rise * fall;
      S.p[i] = clamp01((t - i) / (i === 0 ? 0.85 : 0.8));
      sum += S.w[i];
    }
    sum = Math.max(sum, 1e-4);

    // blended camera, lights and fog
    const aspect = size.width / size.height;
    const fit = THREE.MathUtils.clamp(1.5 / aspect, 1, 2.3);
    tmp.pos.set(0, 0, 0);
    tmp.look.set(0, 0, 0);
    let side = 0;
    let hemiI = 0, keyI = 0, lampI = 0, env = 0, wind = 0, near = 0, far = 0;
    const kp = new THREE.Vector3();
    const lp = new THREE.Vector3();
    for (let i = 0; i < CHAPTERS; i++) {
      const b = S.w[i] / sum;
      if (b < 1e-3) continue;
      const pose = POSES[i](S.p[i]);
      tmp.pos.x += pose.pos[0] * b; tmp.pos.y += pose.pos[1] * b; tmp.pos.z += pose.pos[2] * b;
      tmp.look.x += pose.look[0] * b; tmp.look.y += pose.look[1] * b; tmp.look.z += pose.look[2] * b;
      side += SIDE[i] * b;
      const L = LIGHT[i];
      hemiI += L.hemi * b; keyI += L.key * b; lampI += L.lamp * b; env += L.env * b; wind += L.wind * b;
      near += L.fog[0] * b; far += L.fog[1] * b;
      kp.x += L.kp[0] * b; kp.y += L.kp[1] * b; kp.z += L.kp[2] * b;
      lp.x += L.lp[0] * b; lp.y += L.lp[1] * b; lp.z += L.lp[2] * b;
    }
    tmp.pos.sub(tmp.look).multiplyScalar(fit).add(tmp.look);
    camera.position.copy(tmp.pos);
    camera.lookAt(tmp.look);

    // frame the prop away from the copy panel
    const wide = smooth(1.15, 1.5, aspect);
    const dx = side * 0.21 * size.width * wide;
    const dy = (1 - wide) * 0.17 * size.height;
    (camera as THREE.PerspectiveCamera).setViewOffset(size.width, size.height, -dx, dy, size.width, size.height);

    if (hemi.current) hemi.current.intensity = hemiI;
    if (key.current) {
      key.current.intensity = keyI;
      key.current.position.copy(kp);
    }
    if (lamp.current) {
      lamp.current.intensity = lampI;
      lamp.current.position.copy(lp);
    }
    scene.environmentIntensity = env;
    windU.value = wind;
    // fog matches the DOM ground, which turns oxblood in chapter 4
    const fog = scene.fog as THREE.Fog;
    fog.color.copy(P.ground).lerp(P.oxblood, S.w[4]);
    fog.near = near;
    fog.far = far;
    scene.background = null;

    if (++frames.current === 3) window.dispatchEvent(new Event("story:live"));
  }, -10);

  return (
    <>
      <fog attach="fog" args={[P.ground, 40, 80]} />
      <hemisphereLight ref={hemi} args={[P.paper, P.soilDark, 0.5]} />
      <directionalLight ref={key} color={P.dawn} />
      <pointLight ref={lamp} color={P.lamp} decay={2} />
    </>
  );
}

export default function StoryCanvas() {
  const [q, setQ] = useState<Quality | null>(null);
  const [dpr, setDpr] = useState(1);
  const [reach, setReach] = useState(() => storyProgress.get().chapter + 2);
  const S = useMemo<Story>(
    () => ({
      t: storyProgress.get().chapter + storyProgress.get().local,
      time: 0, dt: 0.016,
      p: Array(CHAPTERS).fill(0), w: Array(CHAPTERS).fill(0),
      q: qualityFor(2), hover: -1, reach: storyProgress.get().chapter + 2,
    }),
    [],
  );

  // GPU tier decides pixel ratio, instance counts and segment counts.
  useEffect(() => {
    let done = false;
    const pick = (tier: number) => {
      if (done) return;
      done = true;
      const quality = qualityFor(tier);
      S.q = quality;
      setDpr(Math.min(window.devicePixelRatio || 1, quality.maxDpr));
      setQ(quality);
    };
    const fallback = window.setTimeout(() => pick((navigator.hardwareConcurrency || 4) <= 4 ? 1 : 2), 1200);
    getGPUTier()
      .then((r) => pick(r.tier))
      .catch(() => pick(2))
      .finally(() => clearTimeout(fallback));
    return () => {
      done = true;
      clearTimeout(fallback);
    };
  }, [S]);

  // Build later chapters only when the visitor gets near them.
  useEffect(() => {
    const sync = () => {
      S.reach = Math.max(S.reach, storyProgress.get().chapter + 2);
      setReach(S.reach);
    };
    sync();
    return storyProgress.subscribe(sync);
  }, [S]);

  useEffect(() => () => disposeShared(), []);

  if (!q) return null;
  const maxDpr = q.maxDpr;
  return (
    <Canvas
      frameloop="demand"
      dpr={dpr}
      camera={{ fov: 30, near: 0.1, far: 80, position: [0, 0.4, 8.4] }}
      gl={{ alpha: true, antialias: q.tier >= 2, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.localClippingEnabled = true;
        gl.toneMapping = THREE.NeutralToneMapping;
        gl.setClearColor(0x000000, 0);
        gl.domElement.setAttribute("aria-hidden", "true");
        gl.domElement.style.pointerEvents = "none";
      }}
      style={{ pointerEvents: "none" }}
    >
      <StoryContext.Provider value={S}>
        <PerformanceMonitor
          bounds={() => [20, 45]}
          flipflops={3}
          onChange={({ factor }) => setDpr(Math.round(Math.min(maxDpr, 1 + (maxDpr - 1) * factor) * 10) / 10)}
        />
        <Environment />
        <Controller S={S} />
        <SprigScene />
        {reach >= 1 ? <GardenScene /> : null}
        {reach >= 2 ? <PickingScene /> : null}
        {reach >= 3 ? <PreparingScene /> : null}
        {reach >= 4 ? <OilScene /> : null}
        {reach >= 5 ? <FactoryScene /> : null}
        {reach >= 6 ? <AlmirahScene /> : null}
        {reach >= 7 ? <ClinicScene /> : null}
      </StoryContext.Provider>
    </Canvas>
  );
}

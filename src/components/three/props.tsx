"use client";
// Shared building blocks: the per-chapter fade wrapper, contact shadows, steam, brass and glass materials, the kizhi.
import { useMemo, useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { palette } from "./palette";
import { rng, smooth, softTexture, steamTexture, useDispose, useStory } from "./core";
import { lathe } from "./shapes";

/** One chapter's set. Cross-dissolves by fading every material it owns, and drifts a little as it enters and leaves. */
export function Chapter({ i, children }: { i: number; children: ReactNode }) {
  const S = useStory();
  const g = useRef<THREE.Group>(null);
  const list = useRef<THREE.Material[] | null>(null);
  useFrame(() => {
    const grp = g.current;
    if (!grp) return;
    const w = S.w[i];
    grp.visible = w > 0.004;
    if (!grp.visible) return;
    const d = S.t - i - 0.5;
    grp.position.y = Math.sign(d) * Math.max(0, Math.abs(d) - 0.36) * 1.5;
    if (!list.current) {
      const set = new Set<THREE.Material>();
      grp.traverse((o) => {
        const m = (o as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined;
        if (m) (Array.isArray(m) ? m : [m]).forEach((x) => set.add(x));
      });
      list.current = [...set];
    }
    for (const m of list.current) {
      const u = m.userData as { base?: number; t0?: boolean };
      if (u.base === undefined) {
        u.base = m.opacity;
        u.t0 = m.transparent;
      }
      const sm = m as THREE.ShaderMaterial;
      if (sm.uniforms?.uFade) sm.uniforms.uFade.value = w;
      else {
        m.opacity = u.base * w;
        m.transparent = !!u.t0 || w < 0.995;
      }
    }
  });
  return <group ref={g}>{children}</group>;
}

const flat = new THREE.PlaneGeometry(1, 1);

/** Soft contact shadow on the ground. */
export function Blob({
  position, scale = 1, opacity = 0.35, y = 0.004,
}: { position: [number, number, number]; scale?: number | [number, number]; opacity?: number; y?: number }) {
  const map = useMemo(() => softTexture(), []);
  const mat = useMemo(
    () => new THREE.MeshBasicMaterial({ map, color: palette().ink, transparent: true, opacity, depthWrite: false, fog: false }),
    [map, opacity],
  );
  useDispose([mat]);
  const s = typeof scale === "number" ? [scale, scale] : scale;
  return (
    <mesh geometry={flat} material={mat} position={[position[0], position[1] + y, position[2]]} rotation-x={-Math.PI / 2} scale={[s[0], s[1], 1]} renderOrder={-1} />
  );
}

/** Slow, faint steam: a few soft puffs rising and widening. */
export function Steam({
  count, position = [0, 0, 0], spread = 0.3, height = 1.6, size = 0.8, strength = 0.16, speed = 0.06,
}: {
  count: number; position?: [number, number, number]; spread?: number; height?: number; size?: number; strength?: number; speed?: number;
}) {
  const S = useStory();
  const g = useRef<THREE.Group>(null);
  const items = useMemo(() => {
    const r = rng(5);
    return Array.from({ length: count }, () => ({ o: r(), x: (r() - 0.5) * spread * 2, z: (r() - 0.5) * spread * 2, s: 0.7 + r() * 0.6, v: 0.8 + r() * 0.5, rot: r() * 6 }));
  }, [count, spread]);
  const mats = useMemo(() => {
    const tex = steamTexture();
    return items.map(() => {
      const m = new THREE.SpriteMaterial({ map: tex, color: palette().steam, transparent: true, depthWrite: false, opacity: 0, fog: false });
      m.userData.t0 = true;
      return m;
    });
  }, [items]);
  useDispose(mats);
  useFrame(() => {
    const grp = g.current;
    if (!grp || !grp.parent?.visible) return;
    items.forEach((it, k) => {
      const age = (S.time * speed * it.v + it.o) % 1;
      const sp = grp.children[k] as THREE.Sprite;
      sp.position.set(it.x + Math.sin(age * 5 + it.rot) * 0.12, age * height, it.z);
      const sc = size * it.s * (0.55 + age * 1.5);
      sp.scale.set(sc, sc, 1);
      mats[k].rotation = it.rot + age * 0.5;
      mats[k].userData.base = strength * Math.pow(Math.sin(Math.PI * age), 1.4);
    });
  });
  return (
    <group ref={g} position={position}>
      {mats.map((m, k) => (
        <sprite key={k} material={m} />
      ))}
    </group>
  );
}

export function brassMaterial(roughness = 0.3) {
  const P = palette();
  return new THREE.MeshStandardMaterial({ color: P.brass, metalness: 1, roughness, side: THREE.DoubleSide, envMapIntensity: 1.25 });
}

export function glassMaterial(opacity = 0.3) {
  const P = palette();
  return new THREE.MeshPhysicalMaterial({
    color: P.glass, roughness: 0.04, metalness: 0, transparent: true, opacity, side: THREE.DoubleSide,
    depthWrite: false, clearcoat: 1, clearcoatRoughness: 0.04, envMapIntensity: 1.6,
  });
}

export function liquidMaterial(color: THREE.Color) {
  return new THREE.MeshStandardMaterial({
    color, emissive: color, emissiveIntensity: 0.12, roughness: 0.15, metalness: 0, side: THREE.DoubleSide,
  });
}

/** Cloth poultice (kizhi): a gathered bundle, tied at the neck with rope, tufted at the top. About 1.4 tall. */
export function kizhiGeometry(segs = 40) {
  const P = palette();
  const pts: [number, number][] = [
    [0, 0], [0.3, 0.0], [0.48, 0.07], [0.58, 0.24], [0.57, 0.42], [0.47, 0.62], [0.3, 0.8], [0.14, 0.92], [0.09, 1.0],
    [0.085, 1.04], [0.15, 1.12], [0.21, 1.26], [0.18, 1.36], [0.09, 1.4], [0, 1.4],
  ];
  const prof = new THREE.SplineCurve(pts.map(([r, y]) => new THREE.Vector2(r, y))).getPoints(70);
  const g = lathe(prof, segs);
  const pos = g.attributes.position;
  const col = new Float32Array(pos.count * 3);
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const th = Math.atan2(z, x);
    const pleat = smooth(0.6, 0.95, y) * (1 - smooth(1.0, 1.06, y));
    const fray = smooth(1.1, 1.4, y);
    const k =
      1 + 0.05 * Math.sin(th * 6 + y * 4) + 0.035 * Math.sin(th * 11 - y * 7) + pleat * 0.24 * Math.sin(th * 8) + fray * 0.16 * Math.sin(th * 9 + y * 20);
    pos.setXYZ(i, x * k, y, z * k);
    const stain = Math.max(0, 1 - y / 0.75) * (0.55 + 0.45 * Math.sin(th * 3 + 1));
    c.copy(P.cloth).lerp(P.clothStain, stain * 0.8);
    col.set([c.r, c.g, c.b], i * 3);
  }
  g.setAttribute("color", new THREE.BufferAttribute(col, 3));
  g.computeVertexNormals();
  return g;
}

export function Kizhi({ steam = 0, glow = 0 }: { steam?: number; glow?: number }) {
  const P = palette();
  const parts = useMemo(
    () => ({
      body: kizhiGeometry(40),
      tie: new THREE.TorusGeometry(0.1, 0.03, 8, 18),
      cloth: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.96, metalness: 0, side: THREE.DoubleSide, emissive: P.oilBright, emissiveIntensity: glow }),
      rope: new THREE.MeshStandardMaterial({ color: P.rope, roughness: 0.9 }),
    }),
    [P, glow],
  );
  useDispose([parts.body, parts.tie, parts.cloth, parts.rope]);
  return (
    <group>
      <mesh geometry={parts.body} material={parts.cloth} />
      <mesh geometry={parts.tie} material={parts.rope} position={[0, 0.99, 0]} rotation-x={Math.PI / 2} />
      {steam > 0 ? <Steam count={steam} position={[0, 0.5, 0]} spread={0.25} height={1.7} size={0.75} strength={0.2} /> : null}
    </group>
  );
}

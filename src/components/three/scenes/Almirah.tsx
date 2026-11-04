"use client";
/* eslint-disable react-hooks/immutability -- react-three-fiber scenes mutate three.js objects and shared frame state inside useFrame by design */
// 6. A wooden almirah with six shelves, one per product type. Its doors swing open; each container's shape follows its type
// and its label is the real Shopify product photograph (plain brand labels until, or unless, the photographs load).
import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { shelves } from "@/content/story";
import { palette } from "../palette";
import { clamp01, grainTexture, lerp, rng, smooth, useDispose, useStory } from "../core";
import { containerKind, makeContainer, type ContainerKind } from "../shapes";
import { fetchShopImages, loadLabelTexture, plainLabel } from "../labels";
import { Blob, brassMaterial, Chapter, glassMaterial, liquidMaterial } from "../props";

const W = 2.7;
const H = 3.7;
const D = 0.75;
const T = 0.07;
const CAV = (H - 2 * T - 5 * T) / 6;
const INNER = W - 2 * T;
const FIT: Record<ContainerKind, { scale: number; count: number }> = {
  bottle: { scale: 0.28, count: 6 },
  tall: { scale: 0.32, count: 6 },
  jar: { scale: 0.5, count: 4 },
  tin: { scale: 0.64, count: 4 },
};
const shelfY = (i: number) => -H / 2 + T + (5 - i) * (CAV + T);

export default function AlmirahScene() {
  const S = useStory();
  const P = palette();
  const camera = useThree((s) => s.camera);
  const started = useRef(false);
  const alive = useRef(true);
  const pointer = useRef<THREE.Vector2 | null>(null);
  const doorL = useRef<THREE.Group>(null);
  const doorR = useRef<THREE.Group>(null);
  const backs = useRef<(THREE.Mesh | null)[]>([]);
  const shellRefs = useRef<(THREE.InstancedMesh | null)[]>([]);
  const contentRefs = useRef<(THREE.InstancedMesh | null)[]>([]);
  const capRefs = useRef<(THREE.InstancedMesh | null)[]>([]);

  const d = useMemo(() => {
    const r = rng(61);
    const wood = new THREE.MeshStandardMaterial({ color: P.wood, map: grainTexture(), roughness: 0.78 });
    const woodDark = new THREE.MeshStandardMaterial({ color: P.woodDark, map: grainTexture(), roughness: 0.9 });
    const brass = brassMaterial(0.3);
    const glass = glassMaterial(0.28);
    const box = new THREE.BoxGeometry(1, 1, 1);
    const knob = new THREE.SphereGeometry(0.045, 12, 8);
    const tints: Record<string, THREE.Color> = {
      THAILAM: P.oilBright.clone().lerp(P.oil, 0.5),
      ARISHTAM: P.oilDeep.clone().lerp(P.oxblood, 0.5),
      KASHAYAM: P.tea,
    };
    const rows = shelves.map((s, i) => {
      const kind = containerKind(s.type);
      const parts = makeContainer(kind, S.q.segs);
      const fit = FIT[kind];
      const items = Array.from({ length: fit.count }, (_, k) => {
        const sc = fit.scale * (0.94 + r() * 0.12);
        return {
          x: -INNER / 2 + (INNER / fit.count) * (k + 0.5),
          s: sc,
          ry: (r() - 0.5) * 0.5,
          variant: k % 3,
          m: new THREE.Matrix4().compose(
            new THREE.Vector3(-INNER / 2 + (INNER / fit.count) * (k + 0.5), shelfY(i) + 0.005, 0.06),
            new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), (r() - 0.5) * 0.5),
            new THREE.Vector3(sc, sc, sc),
          ),
        };
      });
      const shellMat =
        kind === "tin"
          ? new THREE.MeshStandardMaterial({ color: P.accent, metalness: 0.5, roughness: 0.4 })
          : kind === "jar"
            ? new THREE.MeshStandardMaterial({ color: s.type === "GHRITHAM" ? P.ceramic.clone().lerp(P.gold, 0.45) : P.ceramic, roughness: 0.35 })
            : glass;
      const capMat =
        kind === "bottle" || kind === "tall"
          ? new THREE.MeshStandardMaterial({ color: P.cork, roughness: 0.9 })
          : brass;
      const content = parts.content ? liquidMaterial(tints[s.type] ?? P.oil) : null;
      const back = new THREE.MeshStandardMaterial({ color: P.woodDark.clone().lerp(P.ink, 0.25), roughness: 1, emissive: P.lamp, emissiveIntensity: 0 });
      const aspect = parts.labelAspect;
      const labels = [0, 1, 2].map(() => new THREE.MeshStandardMaterial({ map: plainLabel(s.label, P.accent, aspect), roughness: 0.85, side: THREE.DoubleSide }));
      return { s, i, kind, parts, items, shellMat, capMat, content, back, aspect, labels };
    });
    return { wood, woodDark, brass, glass, box, knob, rows };
  }, [S.q.segs, P]);

  useDispose([
    d.wood, d.woodDark, d.brass, d.glass, d.box, d.knob,
    ...d.rows.flatMap((r) => [r.parts.shell, r.parts.content, r.parts.cap, r.parts.label, r.shellMat, r.capMat, r.content, r.back, ...r.labels.flatMap((m) => [m.map, m])]),
  ]);

  useLayoutEffect(() => {
    d.rows.forEach((row, i) => {
      row.items.forEach((it, k) => {
        shellRefs.current[i]?.setMatrixAt(k, it.m);
        contentRefs.current[i]?.setMatrixAt(k, it.m);
        capRefs.current[i]?.setMatrixAt(k, it.m);
      });
      [shellRefs, contentRefs, capRefs].forEach((r) => {
        const m = r.current[i];
        if (m) m.instanceMatrix.needsUpdate = true;
      });
    });
  }, [d]);

  useLayoutEffect(() => {
    alive.current = true;
    const move = (e: PointerEvent) => {
      const el = e.target as Element | null;
      if (el?.closest?.(".story__copy")) {
        pointer.current = null;
        return;
      }
      (pointer.current ??= new THREE.Vector2()).set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      alive.current = false;
      window.removeEventListener("pointermove", move);
    };
  }, []);

  const ray = useMemo(() => new THREE.Raycaster(), []);
  useFrame(() => {
    const p = S.p[6];
    const open = smooth(0.06, 0.46, p) * 1.95;
    if (doorL.current) doorL.current.rotation.y = -open;
    if (doorR.current) doorR.current.rotation.y = open;

    if (!started.current && S.reach >= 5) {
      started.current = true;
      fetchShopImages().then((imgs) => {
        d.rows.forEach((row) => {
          const urls = [...new Set(imgs[row.s.type] ?? [])].slice(0, 3);
          if (!urls.length) return;
          row.labels.forEach((m, k) =>
            loadLabelTexture(urls[k % urls.length], row.aspect).then((tex) => {
              if (!tex || !alive.current) return tex?.dispose();
              m.map?.dispose();
              m.map = tex;
              m.needsUpdate = true;
            }),
          );
        });
      });
    }

    // hover: which shelf is the pointer over
    let hover = -1;
    if (pointer.current && S.w[6] > 0.5) {
      ray.setFromCamera(pointer.current, camera);
      const hit = ray.intersectObjects(backs.current.filter(Boolean) as THREE.Object3D[], false)[0];
      if (hit) hover = backs.current.indexOf(hit.object as THREE.Mesh);
    }
    S.hover = hover;
    d.rows.forEach((row, i) => {
      const m = row.back;
      m.emissiveIntensity = lerp(m.emissiveIntensity, hover === i ? 0.32 : 0, clamp01(S.dt * 8));
    });
  });

  return (
    <Chapter i={6}>
      <group>
        {/* carcase */}
        <mesh geometry={d.box} material={d.wood} position={[-W / 2 + T / 2, 0, 0]} scale={[T, H, D]} />
        <mesh geometry={d.box} material={d.wood} position={[W / 2 - T / 2, 0, 0]} scale={[T, H, D]} />
        <mesh geometry={d.box} material={d.wood} position={[0, H / 2 - T / 2, 0]} scale={[W, T, D]} />
        <mesh geometry={d.box} material={d.wood} position={[0, -H / 2 + T / 2, 0]} scale={[W, T, D]} />
        <mesh geometry={d.box} material={d.woodDark} position={[0, 0, -D / 2 + T / 2]} scale={[W, H, T]} />
        <mesh geometry={d.box} material={d.wood} position={[0, H / 2 + 0.06, 0.03]} scale={[W + 0.2, 0.12, D + 0.1]} />
        <mesh geometry={d.box} material={d.woodDark} position={[0, -H / 2 - 0.08, 0.03]} scale={[W + 0.1, 0.16, D + 0.06]} />
        {d.rows.map((row, i) => (
          <group key={row.s.type}>
            {i < 5 ? <mesh geometry={d.box} material={d.wood} position={[0, shelfY(i) - T / 2, 0.0]} scale={[INNER, T, D - T]} /> : null}
            <mesh
              ref={(m) => {
                backs.current[i] = m;
              }}
              geometry={d.box}
              material={row.back}
              position={[0, shelfY(i) + CAV / 2, -D / 2 + T + 0.004]}
              scale={[INNER, CAV, 0.004]}
            />
            <instancedMesh
              ref={(m) => {
                shellRefs.current[i] = m;
              }}
              args={[row.parts.shell, row.shellMat, row.items.length]}
              frustumCulled={false}
              renderOrder={row.parts.glass ? 2 : 0}
            />
            {row.parts.content && row.content ? (
              <instancedMesh
                ref={(m) => {
                  contentRefs.current[i] = m;
                }}
                args={[row.parts.content, row.content, row.items.length]}
                frustumCulled={false}
              />
            ) : null}
            <instancedMesh
              ref={(m) => {
                capRefs.current[i] = m;
              }}
              args={[row.parts.cap, row.capMat, row.items.length]}
              frustumCulled={false}
            />
            {row.items.map((it, k) => (
              <mesh
                key={k}
                geometry={row.parts.label}
                material={row.labels[it.variant]}
                position={[it.x, shelfY(i) + 0.005, 0.06]}
                rotation-y={it.ry}
                scale={it.s}
              />
            ))}
          </group>
        ))}
        {/* doors, swung open */}
        {([-1, 1] as const).map((side) => (
          <group key={side} ref={side < 0 ? doorL : doorR} position={[side * (W / 2), 0, D / 2 + 0.02]}>
            <mesh geometry={d.box} material={d.wood} position={[-side * (W / 4), 0, 0]} scale={[W / 2 - 0.01, H - 0.02, 0.06]} />
            <mesh geometry={d.box} material={d.woodDark} position={[-side * (W / 4), 0, 0.035]} scale={[W / 2 - 0.3, H - 0.4, 0.02]} />
            <mesh geometry={d.knob} material={d.brass} position={[-side * (W / 2 - 0.16), 0, 0.09]} />
          </group>
        ))}
      </group>
      <Blob position={[0, -H / 2 - 0.16, 0.1]} scale={[5.2, 2.6]} opacity={0.4} />
    </Chapter>
  );
}

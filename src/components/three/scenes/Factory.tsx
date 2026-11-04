"use client";
/* eslint-disable react-hooks/immutability -- react-three-fiber scenes mutate three.js objects and shared frame state inside useFrame by design */
// 5. Amber oil pours into a glass kuppi bottle; then a short row of filled bottles slides into place.
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { palette } from "../palette";
import { easeOut, lerp, smooth, useDispose, useStory, grainTexture } from "../core";
import { lathe, lotaProfile, makeContainer } from "../shapes";
import { plainLabel } from "../labels";
import { Blob, brassMaterial, Chapter, glassMaterial, liquidMaterial } from "../props";

const FINAL_X = [-2.2, -1.35, -0.5, 0.35, 1.2];
const LIP_LOCAL = new THREE.Vector2(-0.42, 0.62);
const FILL_MIN = 0.08;
const FILL_MAX = 1.3;

export default function FactoryScene() {
  const S = useStory();
  const P = palette();
  const bottles = useRef<(THREE.Group | null)[]>([]);
  const pitcher = useRef<THREE.Group>(null);
  const stream = useRef<THREE.Mesh>(null);
  const d = useMemo(() => {
    const c = makeContainer("bottle", S.q.segs);
    const plane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);
    const glass = glassMaterial(0.26);
    const oil = liquidMaterial(P.oil);
    const heroOil = oil.clone();
    heroOil.clippingPlanes = [plane];
    const cork = new THREE.MeshStandardMaterial({ color: P.cork, roughness: 0.9 });
    const labelTex = plainLabel("Thailam");
    const label = new THREE.MeshStandardMaterial({ map: labelTex, roughness: 0.85, side: THREE.DoubleSide });
    const lota = lathe(lotaProfile(), S.q.segs);
    const brass = brassMaterial(0.28);
    const streamGeo = new THREE.CylinderGeometry(0.03, 0.022, 1, 8, 1, true);
    streamGeo.translate(0, -0.5, 0);
    const streamMat = new THREE.MeshStandardMaterial({ color: P.oilBright, emissive: P.oil, emissiveIntensity: 0.5, roughness: 0.1, transparent: true, opacity: 0.92 });
    const bench = new THREE.BoxGeometry(18, 0.14, 1.9);
    const benchMat = new THREE.MeshStandardMaterial({ color: P.wood, map: grainTexture(), roughness: 0.8 });
    return { c, plane, glass, oil, heroOil, cork, labelTex, label, lota, brass, streamGeo, streamMat, bench, benchMat };
  }, [S.q.segs, P]);
  useDispose([d.c.shell, d.c.content, d.c.cap, d.c.label, d.glass, d.oil, d.heroOil, d.cork, d.labelTex, d.label, d.lota, d.brass, d.streamGeo, d.streamMat, d.bench, d.benchMat]);

  const tmp = useMemo(() => new THREE.Vector3(), []);
  useFrame(() => {
    const p = S.p[5];
    const fill = smooth(0.1, 0.5, p);
    const fillH = lerp(FILL_MIN, FILL_MAX, fill);
    // hero bottle slides to the left end of the row, the others slide in behind it
    bottles.current.forEach((g, k) => {
      if (!g) return;
      const final = FINAL_X[k];
      if (k === 0) g.position.x = lerp(-0.5, final, easeOut(smooth(0.5, 0.7, p)));
      else g.position.x = lerp(final + 4.2, final, easeOut(smooth(0.52 + 0.05 * k, 0.76 + 0.04 * k, p)));
      g.visible = k === 0 || p > 0.5;
    });
    const hero = bottles.current[0];
    if (hero) d.plane.constant = hero.position.y + fillH;
    // the pitcher tips in, pours, then withdraws
    const tilt = lerp(0.25, 1.0, smooth(0, 0.1, p)) - 0.75 * smooth(0.5, 0.62, p);
    const lipX = LIP_LOCAL.x * Math.cos(tilt) - LIP_LOCAL.y * Math.sin(tilt);
    const lipY = LIP_LOCAL.x * Math.sin(tilt) + LIP_LOCAL.y * Math.cos(tilt);
    const lift = 1.6 * smooth(0.5, 0.64, p) + 0.0;
    if (pitcher.current) {
      pitcher.current.rotation.z = tilt;
      pitcher.current.position.set((hero?.position.x ?? 0) - lipX, 2.75 - lipY + lift, 0);
    }
    const pouring = p > 0.06 && p < 0.52;
    const s = stream.current;
    if (s) {
      s.visible = pouring;
      if (pouring) {
        const top = 2.75 + lift;
        const bottom = fillH + (hero?.position.y ?? 0);
        tmp.set(1, Math.max(0.01, top - bottom), 1);
        s.scale.copy(tmp);
        s.position.set(hero?.position.x ?? 0, top, 0);
        s.scale.x = 1 + Math.sin(S.time * 7) * 0.08;
        s.scale.z = s.scale.x;
      }
    }
  });

  return (
    <Chapter i={5}>
      <mesh geometry={d.bench} material={d.benchMat} position={[0, -0.07, 0]} />
      {FINAL_X.map((_, k) => (
        <group
          key={k}
          ref={(g) => {
            bottles.current[k] = g;
          }}
          position={[k === 0 ? -0.5 : 6, 0, 0.05 * (k % 2)]}
          rotation-y={0.1 * (k - 2)}
        >
          <mesh geometry={d.c.shell} material={d.glass} renderOrder={2} />
          {d.c.content ? <mesh geometry={d.c.content} material={k === 0 ? d.heroOil : d.oil} /> : null}
          <mesh geometry={d.c.cap} material={d.cork} />
          <mesh geometry={d.c.label} material={d.label} />
          <Blob position={[0, 0, 0]} scale={1.3} opacity={0.4} y={0.005} />
        </group>
      ))}
      <group ref={pitcher} scale={1.1}>
        <mesh geometry={d.lota} material={d.brass} />
      </group>
      <mesh ref={stream} geometry={d.streamGeo} material={d.streamMat} />
    </Chapter>
  );
}

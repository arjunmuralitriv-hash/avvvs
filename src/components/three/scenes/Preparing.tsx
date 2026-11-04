"use client";
// 3. Leaves break into fragments that tumble in the uruli, then gather into a tied cloth kizhi.
import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { palette } from "../palette";
import { clamp01, easeIn, easeOut, lerp, rng, smooth, useDispose, useStory } from "../core";
import { leafGeometry } from "../leaves";
import { urUliFloor } from "../shapes";
import { Blob, Chapter, Kizhi } from "../props";
import { Uruli } from "../uruli";

const B = 1.35; // bowl scale
const CENTRE = new THREE.Vector3(0, 0.5 * B, 0);

export default function PreparingScene() {
  const S = useStory();
  const P = palette();
  const frag = useRef<THREE.InstancedMesh>(null);
  const kiz = useRef<THREE.Group>(null);
  const d = useMemo(() => {
    const n = S.q.fragments;
    const r = rng(41);
    const items = Array.from({ length: n }, () => ({
      a0: r() * 6.28, rho: 0.1 + 0.78 * Math.sqrt(r()), delay: r() * 0.24, w: (0.5 + r() * 1.2) * (r() < 0.5 ? -1 : 1),
      s: 0.07 + r() * 0.07, ax: new THREE.Vector3(r() - 0.5, r() - 0.5, r() - 0.5).normalize(), ph: r() * 6.28, h: 2.2 + r() * 1.2,
      c: new THREE.Color().setScalar(0.8 + r() * 0.35),
    }));
    const geo = leafGeometry("calotropis", 3);
    const mat = new THREE.MeshStandardMaterial({ color: P.leaf, roughness: 0.8, side: THREE.DoubleSide });
    return { items, geo, mat };
  }, [S.q.fragments, P]);
  useDispose([d.geo, d.mat]);
  useLayoutEffect(() => {
    d.items.forEach((it, i) => frag.current?.setColorAt(i, it.c));
    if (frag.current?.instanceColor) frag.current.instanceColor.needsUpdate = true;
  }, [d]);

  const tmp = useMemo(() => ({ o: new THREE.Object3D(), v: new THREE.Vector3() }), []);
  useFrame(() => {
    const p = S.p[3];
    const m = frag.current;
    if (!m) return;
    const gather = smooth(0.52, 0.86, p);
    const vanish = smooth(0.8, 0.95, p);
    d.items.forEach((it, i) => {
      const t = p - it.delay;
      const drop = clamp01(t / 0.2);
      const live = Math.max(0, t - 0.2);
      const a = it.a0 + it.w * Math.max(0, t) * 3;
      const rr = it.rho * 0.97 * B;
      const floor = urUliFloor(it.rho) * B;
      const bounce = Math.abs(Math.sin(live * 22 + it.ph)) * 0.07 * Math.exp(-live * 6) + 0.012;
      const y = lerp(floor + it.h, floor + bounce, easeIn(drop));
      tmp.v.set(Math.cos(a) * rr, y, Math.sin(a) * rr);
      tmp.v.lerp(CENTRE, gather);
      tmp.o.position.copy(tmp.v);
      tmp.o.quaternion.setFromAxisAngle(it.ax, it.w * t * 7 + it.ph);
      // whole leaves at the top, chopped to chips as they land
      const big = lerp(2.8, 1, easeOut(drop));
      const sc = it.s * big * (1 - vanish) * (t < 0 ? 0 : 1);
      tmp.o.scale.set(sc * 1.4, sc * 1.9, sc);
      tmp.o.updateMatrix();
      m.setMatrixAt(i, tmp.o.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
    d.mat.color.copy(P.leaf).lerp(P.leafRoast, smooth(0.25, 0.7, p));
    const k = kiz.current;
    if (k) {
      const g = smooth(0.5, 0.84, p);
      k.visible = g > 0.01;
      k.scale.setScalar(0.12 + 0.5 * easeOut(g));
      k.position.set(0, lerp(0.1, 0.17, g) * B + 0.2 * smooth(0.85, 1, p), 0);
      k.rotation.y = p * 2;
    }
  });

  return (
    <Chapter i={3}>
      <group scale={B}>
        <Uruli />
      </group>
      <instancedMesh ref={frag} args={[d.geo, d.mat, d.items.length]} frustumCulled={false} />
      <group ref={kiz}>
        <Kizhi />
      </group>
      <Blob position={[0, 0, 0]} scale={[4.4, 3.8]} opacity={0.34} />
    </Chapter>
  );
}

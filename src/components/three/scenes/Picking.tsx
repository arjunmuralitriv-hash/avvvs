"use client";
// 2. Three kinds of leaf (Calotropis, Datura, Vitex) come off their boughs one by one and settle in a brass plate.
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { palette } from "../palette";
import { clamp01, easeIn, rng, smooth, useDispose, useStory } from "../core";
import { leafGeometry, leafMaterial, type LeafKind } from "../leaves";
import { lathe, plateProfile } from "../shapes";
import { Blob, brassMaterial, Chapter } from "../props";

const KINDS: LeafKind[] = ["calotropis", "datura", "vitex"];
const SIZE = [0.9, 1.02, 0.8];
const PLATE_Y = -1.05;
const PLATE_S = 1.55;
const N = 18;

type Leaf = {
  kind: number;
  from: THREE.Vector3;
  to: THREE.Vector3;
  q0: THREE.Quaternion;
  q1: THREE.Quaternion;
  rel: number;
  k: number;
  size: number;
};

export default function PickingScene() {
  const S = useStory();
  const P = palette();
  const meshes = useRef<(THREE.Mesh | null)[]>([]);
  const d = useMemo(() => {
    const r = rng(31);
    const geos = KINDS.map((k) => leafGeometry(k, S.q.rows + 4));
    const mats = KINDS.map(() => leafMaterial({ sway: 0.3 }));
    const stemMat = new THREE.MeshStandardMaterial({ color: P.leafDeep.clone().lerp(P.rope, 0.5), roughness: 0.8 });
    const xs = [-1.3, 0, 1.3];
    const curves = xs.map(
      (x, i) =>
        new THREE.CatmullRomCurve3(
          [[x - 0.1 * i, 3.6, 0], [x - 0.15, 2.7, 0.05], [x + 0.14, 2.0, 0], [x + 0.05 * (i - 1), 1.25, 0.04]].map((p) => new THREE.Vector3(...p)),
        ),
    );
    const stems = curves.map((c) => new THREE.TubeGeometry(c, 30, 0.032, 6, false));
    const up = new THREE.Vector3(0, 1, 0);
    const ay = new THREE.Vector3(0, 1, 0);
    const ax = new THREE.Vector3(1, 0, 0);
    const leaves: Leaf[] = [];
    for (let k = 0; k < N; k++) {
      const kind = k % 3;
      const idx = Math.floor(k / 3);
      const u = 0.3 + 0.62 * (idx / 5);
      const side = idx % 2 ? 1 : -1;
      const from = curves[kind].getPoint(u);
      const dir = new THREE.Vector3(side * 0.65, -0.78, 0.18).normalize();
      const q0 = new THREE.Quaternion().setFromUnitVectors(up, dir);
      const rr = 0.2 + 0.78 * Math.sqrt(k / N);
      const ang = k * 2.39996;
      const to = new THREE.Vector3(Math.cos(ang) * rr * PLATE_S * 0.8, PLATE_Y + 0.1 * PLATE_S + k * 0.013, Math.sin(ang) * rr * PLATE_S * 0.62);
      const q1 = new THREE.Quaternion()
        .setFromAxisAngle(ay, r() * 6.28)
        .multiply(new THREE.Quaternion().setFromAxisAngle(ax, -Math.PI / 2 + (r() - 0.5) * 0.22));
      leaves.push({ kind, from, to, q0, q1, rel: 0.08 + 0.6 * (k / (N - 1)), k, size: SIZE[kind] * (0.92 + r() * 0.16) });
    }
    const plate = lathe(plateProfile(), S.q.segs);
    const plateMat = brassMaterial(0.26);
    return { geos, mats, stemMat, stems, leaves, plate, plateMat };
  }, [S.q, P]);
  useDispose([...d.geos, ...d.mats, d.stemMat, ...d.stems, d.plate, d.plateMat]);

  const tmp = useMemo(() => ({ q: new THREE.Quaternion(), s: new THREE.Quaternion(), e: new THREE.Euler() }), []);
  useFrame(() => {
    const p = S.p[2];
    d.leaves.forEach((l, i) => {
      const m = meshes.current[i];
      if (!m) return;
      const u = clamp01((p - l.rel) / 0.22);
      const sway = (1 - u) * (u === 0 ? 1 : 0);
      if (u === 0) {
        m.position.copy(l.from);
        tmp.e.set(Math.sin(S.time * 0.9 + l.k) * 0.05 * sway, 0, Math.sin(S.time * 0.7 + l.k * 2) * 0.06 * sway);
        tmp.s.setFromEuler(tmp.e);
        m.quaternion.copy(l.q0).multiply(tmp.s);
      } else {
        const e = smooth(0, 1, u);
        const fl = Math.sin(u * Math.PI * 3 + l.k) * 0.28 * (1 - u) * Math.sin(u * Math.PI);
        m.position.set(
          l.from.x + (l.to.x - l.from.x) * e + fl,
          l.from.y + (l.to.y - l.from.y) * easeIn(u * 0.5 + 0.5 * u * u),
          l.from.z + (l.to.z - l.from.z) * e,
        );
        tmp.e.set(Math.sin(u * 9 + l.k) * 0.7 * (1 - u), u * 3.4 * (l.k % 2 ? 1 : -1) * (1 - u), 0);
        tmp.s.setFromEuler(tmp.e);
        tmp.q.slerpQuaternions(l.q0, l.q1, e);
        m.quaternion.copy(tmp.q).multiply(tmp.s);
      }
    });
  });

  return (
    <Chapter i={2}>
      {d.stems.map((g, i) => (
        <mesh key={i} geometry={g} material={d.stemMat} />
      ))}
      {d.leaves.map((l, i) => (
        <mesh
          key={i}
          ref={(m) => {
            meshes.current[i] = m;
          }}
          geometry={d.geos[l.kind]}
          material={d.mats[l.kind]}
          scale={l.size}
        />
      ))}
      <mesh geometry={d.plate} material={d.plateMat} position={[0, PLATE_Y, 0]} scale={PLATE_S} />
      <Blob position={[0.1, PLATE_Y, 0.15]} scale={[4.6, 3.6]} opacity={0.34} />
    </Chapter>
  );
}

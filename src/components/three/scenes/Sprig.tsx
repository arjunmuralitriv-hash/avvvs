"use client";
// 0. The hero prop: a leaf sprig like the one in the AVVVS logo (slender leaves in alternate pairs on an arching stem).
import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { palette } from "../palette";
import { rng, useDispose, useStory } from "../core";
import { leafGeometry, leafMaterial } from "../leaves";
import { Chapter } from "../props";

function Sprig({ seed, position, rotation, scale }: { seed: number; position: [number, number, number]; rotation: number; scale: number }) {
  const S = useStory();
  const P = palette();
  const root = useRef<THREE.Group>(null);
  const mesh = useRef<THREE.InstancedMesh>(null);
  const data = useMemo(() => {
    const r = rng(seed);
    const curve = new THREE.CatmullRomCurve3(
      [[-1.6, -1.5, 0], [-0.9, -0.55, 0.06], [-0.1, 0.1, 0], [0.7, 0.55, -0.05], [1.5, 0.78, 0.04], [2.1, 0.66, 0]].map((p) => new THREE.Vector3(...p)),
    );
    const stem = new THREE.TubeGeometry(curve, 48, 0.026, 6, false);
    const geo = leafGeometry("slender", S.q.rows);
    const mat = leafMaterial({ sway: 1.2 });
    const stemMat = new THREE.MeshStandardMaterial({ color: P.leafDeep.clone().lerp(P.rope, 0.45), roughness: 0.75 });
    const mats: THREE.Matrix4[] = [];
    const cols: THREE.Color[] = [];
    const n = 11;
    const up = new THREE.Vector3(0, 1, 0);
    for (let k = 0; k <= n; k++) {
      const u = k === n ? 0.995 : 0.14 + 0.82 * (k / (n - 1 + 0.001));
      const side = k % 2 ? 1 : -1;
      const p = curve.getPoint(Math.min(u, 0.999));
      const T = curve.getTangent(Math.min(u, 0.999));
      const ang = k === n ? 0.05 : 0.8 + (r() - 0.5) * 0.25;
      const d = T.clone().applyAxisAngle(new THREE.Vector3(0, 0, 1), side * ang);
      d.z += (r() - 0.5) * 0.25;
      d.normalize();
      const q = new THREE.Quaternion().setFromUnitVectors(up, d);
      q.premultiply(new THREE.Quaternion().setFromAxisAngle(d, side * 0.55 + (r() - 0.5) * 0.3));
      const len = (0.62 + 0.5 * u) * (0.9 + r() * 0.2);
      mats.push(new THREE.Matrix4().compose(p, q, new THREE.Vector3(len * 1.9, len, len)));
      const j = 0.88 + r() * 0.26;
      cols.push(new THREE.Color(j, j, j));
    }
    return { stem, geo, mat, stemMat, mats, cols };
  }, [P, S.q.rows, seed]);
  useDispose([data.stem, data.geo, data.mat, data.stemMat]);
  useLayoutEffect(() => {
    const m = mesh.current;
    if (!m) return;
    data.mats.forEach((mx, k) => {
      m.setMatrixAt(k, mx);
      m.setColorAt(k, data.cols[k]);
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [data]);
  useFrame(() => {
    if (!root.current) return;
    const t = S.time;
    root.current.rotation.z = rotation + Math.sin(t * 0.55 + seed) * 0.022;
    root.current.rotation.y = Math.sin(t * 0.37 + seed * 2) * 0.05;
  });
  return (
    <group ref={root} position={position} scale={scale}>
      <mesh geometry={data.stem} material={data.stemMat} />
      <instancedMesh ref={mesh} args={[data.geo, data.mat, data.mats.length]} frustumCulled={false} />
    </group>
  );
}

export default function SprigScene() {
  return (
    <Chapter i={0}>
      <Sprig seed={3} position={[-0.3, -0.05, 0]} rotation={0.04} scale={0.92} />
      <Sprig seed={9} position={[-2.2, 0.5, -3.4]} rotation={-0.22} scale={0.85} />
    </Chapter>
  );
}

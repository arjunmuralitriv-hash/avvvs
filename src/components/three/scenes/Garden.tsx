"use client";
// 1. Rows of herb plants, three species in turn, swaying in the shader. The camera drifts low between two rows.
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { palette } from "../palette";
import { rng, softTexture, useDispose, useStory } from "../core";
import { leafGeometry, leafMaterial, type LeafKind } from "../leaves";
import { Chapter } from "../props";

export const GARDEN_ROW_GAP = 1.4;
export const GARDEN_Z0 = 4;
const KINDS: LeafKind[] = ["calotropis", "datura", "vitex"];
const LEN = [0.42, 0.5, 0.4];
const XS = [1.0, 1.0, 0.85];

export default function GardenScene() {
  const S = useStory();
  const P = palette();
  const refs = useRef<(THREE.InstancedMesh | null)[]>([]);
  const stemRef = useRef<THREE.InstancedMesh>(null);
  const shadowRef = useRef<THREE.InstancedMesh>(null);

  const d = useMemo(() => {
    const q = S.q;
    const rows = q.tier >= 2 ? 7 : 5;
    const per = q.tier >= 2 ? 11 : 8;
    const L = Math.max(4, Math.floor(q.leaves / (rows * per)));
    const r = rng(21);
    const leafMats: THREE.Matrix4[][] = [[], [], []];
    const leafCols: THREE.Color[][] = [[], [], []];
    const stems: THREE.Matrix4[] = [];
    const shadows: THREE.Matrix4[] = [];
    const qa = new THREE.Quaternion();
    const qb = new THREE.Quaternion();
    const ax = new THREE.Vector3(1, 0, 0);
    const ay = new THREE.Vector3(0, 1, 0);
    for (let row = 0; row < rows; row++) {
      const kind = row % 3;
      const x = (row - (rows - 1) / 2) * GARDEN_ROW_GAP;
      for (let j = 0; j < per; j++) {
        const z = GARDEN_Z0 - j * 1.0 + (r() - 0.5) * 0.2;
        const px = x + (r() - 0.5) * 0.18;
        const h = 0.85 + r() * 0.3;
        stems.push(new THREE.Matrix4().compose(new THREE.Vector3(px, 0, z), new THREE.Quaternion().setFromAxisAngle(ax, (r() - 0.5) * 0.1), new THREE.Vector3(1, h, 1)));
        shadows.push(new THREE.Matrix4().compose(new THREE.Vector3(px, 0.012, z), new THREE.Quaternion().setFromAxisAngle(ax, -Math.PI / 2), new THREE.Vector3(1.1, 1.1, 1)));
        for (let i = 0; i < L; i++) {
          const f = L > 1 ? i / (L - 1) : 0;
          const phi = i * 2.39996 + r() * 0.4;
          const pitch = 1.15 - 0.75 * f + (r() - 0.5) * 0.25;
          qa.setFromAxisAngle(ay, phi);
          qb.setFromAxisAngle(ax, pitch);
          qa.multiply(qb);
          const len = LEN[kind] * (1.05 - 0.5 * f) * (0.85 + r() * 0.3);
          leafMats[kind].push(new THREE.Matrix4().compose(new THREE.Vector3(px, (0.1 + 0.72 * Math.pow(f, 0.9)) * h, z), qa.clone(), new THREE.Vector3(len * XS[kind], len, len)));
          const j2 = 0.82 + r() * 0.32;
          leafCols[kind].push(new THREE.Color(j2, j2 * (0.95 + r() * 0.1), j2 * 0.95));
        }
      }
    }
    const geos = KINDS.map((k) => leafGeometry(k, q.rows));
    const mats = KINDS.map(() => leafMaterial({ sway: 1 }));
    const stemGeo = new THREE.CylinderGeometry(0.011, 0.02, 0.85, 5);
    stemGeo.translate(0, 0.425, 0);
    const stemMat = new THREE.MeshStandardMaterial({ color: P.leafDeep.clone().lerp(P.rope, 0.4), roughness: 0.85 });
    const bedLen = per * 1.0 + 0.6;
    const bedGeo = new THREE.CapsuleGeometry(0.46, bedLen, 4, 14);
    bedGeo.rotateX(Math.PI / 2);
    bedGeo.scale(1, 0.34, 1);
    const bedMat = new THREE.MeshStandardMaterial({ color: P.soil.clone().lerp(P.ground, 0.35), roughness: 1 });
    const floorGeo = new THREE.CircleGeometry(30, 48);
    floorGeo.rotateX(-Math.PI / 2);
    const floorMat = new THREE.MeshStandardMaterial({ color: P.soil.clone().lerp(P.ground, 0.55), roughness: 1 });
    const shGeo = new THREE.PlaneGeometry(1, 1);
    const shMat = new THREE.MeshBasicMaterial({ map: softTexture(), color: P.ink, transparent: true, opacity: 0.28, depthWrite: false, fog: false });
    const beds = Array.from({ length: rows }, (_, row) => ({
      x: (row - (rows - 1) / 2) * GARDEN_ROW_GAP,
      z: GARDEN_Z0 - (per - 1) / 2,
    }));
    return { rows, leafMats, leafCols, stems, shadows, geos, mats, stemGeo, stemMat, bedGeo, bedMat, floorGeo, floorMat, shGeo, shMat, beds };
  }, [S.q, P]);
  useDispose([...d.geos, ...d.mats, d.stemGeo, d.stemMat, d.bedGeo, d.bedMat, d.floorGeo, d.floorMat, d.shGeo, d.shMat]);

  useLayoutEffect(() => {
    d.leafMats.forEach((arr, k) => {
      const m = refs.current[k];
      if (!m) return;
      arr.forEach((mx, i) => {
        m.setMatrixAt(i, mx);
        m.setColorAt(i, d.leafCols[k][i]);
      });
      m.instanceMatrix.needsUpdate = true;
      if (m.instanceColor) m.instanceColor.needsUpdate = true;
    });
    d.stems.forEach((mx, i) => stemRef.current?.setMatrixAt(i, mx));
    if (stemRef.current) stemRef.current.instanceMatrix.needsUpdate = true;
    d.shadows.forEach((mx, i) => shadowRef.current?.setMatrixAt(i, mx));
    if (shadowRef.current) shadowRef.current.instanceMatrix.needsUpdate = true;
  }, [d]);

  return (
    <Chapter i={1}>
      <mesh geometry={d.floorGeo} material={d.floorMat} position={[0, -0.02, 0]} />
      {d.beds.map((b, i) => (
        <mesh key={i} geometry={d.bedGeo} material={d.bedMat} position={[b.x, 0, b.z]} />
      ))}
      <instancedMesh ref={shadowRef} args={[d.shGeo, d.shMat, d.shadows.length]} frustumCulled={false} />
      <instancedMesh ref={stemRef} args={[d.stemGeo, d.stemMat, d.stems.length]} frustumCulled={false} />
      {KINDS.map((k, i) => (
        <instancedMesh
          key={k}
          ref={(m) => {
            refs.current[i] = m;
          }}
          args={[d.geos[i], d.mats[i], d.leafMats[i].length]}
          frustumCulled={false}
        />
      ))}
    </Chapter>
  );
}

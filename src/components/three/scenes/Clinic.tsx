"use client";
// 7. The kizhi returns: warm, steaming gently, on a plain wooden treatment table, with a small brass uruli of oil beside it.
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { palette } from "../palette";
import { grainTexture, useDispose, useStory } from "../core";
import { Blob, Chapter, Kizhi, liquidMaterial } from "../props";
import { Uruli } from "../uruli";

const TOP_Y = 0.92;

export default function ClinicScene() {
  const S = useStory();
  const P = palette();
  const kiz = useRef<THREE.Group>(null);
  const d = useMemo(() => {
    const box = new THREE.BoxGeometry(1, 1, 1);
    const wood = new THREE.MeshStandardMaterial({ color: P.wood, map: grainTexture(), roughness: 0.72 });
    const woodDark = new THREE.MeshStandardMaterial({ color: P.woodDark, map: grainTexture(), roughness: 0.8 });
    const cloth = new THREE.MeshStandardMaterial({ color: P.cloth, roughness: 1 });
    const pad = new THREE.CapsuleGeometry(0.28, 0.7, 4, 12);
    pad.rotateZ(Math.PI / 2);
    pad.scale(1, 0.32, 1);
    const oil = new THREE.CircleGeometry(0.88, 40);
    oil.rotateX(-Math.PI / 2);
    const oilMat = liquidMaterial(P.oil);
    oilMat.roughness = 0.05;
    return { box, wood, woodDark, cloth, pad, oil, oilMat };
  }, [P]);
  useDispose([d.box, d.wood, d.woodDark, d.cloth, d.pad, d.oil, d.oilMat]);
  useFrame(() => {
    if (kiz.current) kiz.current.scale.setScalar(0.78 * (1 + Math.sin(S.time * 0.8) * 0.006));
  });
  const legs: [number, number][] = [[-1.55, -0.55], [1.55, -0.55], [-1.55, 0.55], [1.55, 0.55]];
  return (
    <Chapter i={7}>
      <mesh geometry={d.box} material={d.wood} position={[0, TOP_Y - 0.07, 0]} scale={[3.7, 0.14, 1.6]} />
      <mesh geometry={d.box} material={d.woodDark} position={[0, TOP_Y - 0.2, 0]} scale={[3.3, 0.12, 1.2]} />
      {legs.map(([x, z], i) => (
        <mesh key={i} geometry={d.box} material={d.woodDark} position={[x, (TOP_Y - 0.14) / 2, z]} scale={[0.14, TOP_Y - 0.14, 0.14]} />
      ))}
      <mesh geometry={d.pad} material={d.cloth} position={[0.05, TOP_Y + 0.07, 0.05]} scale={[1.15, 1, 1.1]} />
      <group ref={kiz} position={[0.05, TOP_Y + 0.09, 0.05]}>
        <Kizhi steam={S.q.steam} glow={0.06} />
      </group>
      <group position={[1.18, TOP_Y, -0.28]} scale={0.4}>
        <Uruli />
        <mesh geometry={d.oil} material={d.oilMat} position={[0, 0.3, 0]} />
      </group>
      <Blob position={[0, 0, 0]} scale={[5.2, 3]} opacity={0.4} />
    </Chapter>
  );
}

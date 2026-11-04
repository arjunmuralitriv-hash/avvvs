"use client";
// The brass uruli: a wide, shallow, lathe-turned bowl with two ring lugs. Radius 1 at the rim.
import { useMemo } from "react";
import * as THREE from "three";
import { lathe, urUliProfile } from "./shapes";
import { useDispose, useStory } from "./core";
import { brassMaterial } from "./props";

export function Uruli({ rough = 0.3 }: { rough?: number }) {
  const S = useStory();
  const d = useMemo(() => {
    const body = lathe(urUliProfile(), S.q.segs);
    const lug = new THREE.TorusGeometry(0.11, 0.028, 8, 16);
    return { body, lug, mat: brassMaterial(rough) };
  }, [S.q.segs, rough]);
  useDispose([d.body, d.lug, d.mat]);
  return (
    <group>
      <mesh geometry={d.body} material={d.mat} />
      <mesh geometry={d.lug} material={d.mat} position={[1.08, 0.43, 0]} rotation={[0, Math.PI / 2, 0.5]} />
      <mesh geometry={d.lug} material={d.mat} position={[-1.08, 0.43, 0]} rotation={[0, Math.PI / 2, -0.5]} />
    </group>
  );
}

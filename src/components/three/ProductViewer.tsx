"use client";
/* eslint-disable react-hooks/set-state-in-effect -- react-three-fiber scenes mutate three.js objects and shared frame state inside useFrame by design */
// Drag-to-rotate 3D bottle, jar or tin. Shape follows product_type; the Shopify image is the label.
//   props: { imageUrl: string | null; productType: string; title: string }
// Import ONLY via next/dynamic({ ssr: false }) and render a fallback <Image> beside it.
import { useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { PresentationControls } from "@react-three/drei";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { palette } from "./palette";
import { containerKind, makeContainer } from "./shapes";
import { ledgerLabel, loadLabelTexture } from "./labels";
import { brassMaterial, glassMaterial, liquidMaterial } from "./props";

export type ProductViewerProps = { imageUrl: string | null; productType: string; title: string };

function Env() {
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  useEffect(() => {
    const cv = document.createElement("canvas");
    const gl = new THREE.WebGLRenderer({ canvas: cv });
    const pm = new THREE.PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const rt = pm.fromScene(room, 0.04);
    setTex(rt.texture);
    return () => {
      rt.dispose();
      pm.dispose();
      gl.dispose();
    };
  }, []);
  return tex ? <primitive object={tex} attach="environment" /> : null;
}

function Container({ imageUrl, productType, title }: ProductViewerProps) {
  const P = palette();
  const kind = containerKind(productType);
  const parts = useMemo(() => makeContainer(kind, 56), [kind]);
  const mats = useMemo(() => {
    const shell =
      kind === "tin"
        ? new THREE.MeshStandardMaterial({ color: P.accent, metalness: 0.5, roughness: 0.4 })
        : kind === "jar"
          ? new THREE.MeshStandardMaterial({ color: P.ceramic, roughness: 0.35 })
          : glassMaterial(0.3);
    const cap = kind === "bottle" || kind === "tall" ? new THREE.MeshStandardMaterial({ color: P.cork, roughness: 0.9 }) : brassMaterial(0.3);
    const content = liquidMaterial(kind === "tall" ? P.tea : P.oil);
    const label = new THREE.MeshStandardMaterial({ map: ledgerLabel(title, parts.labelAspect), roughness: 0.85, side: THREE.DoubleSide });
    return { shell, cap, content, label };
  }, [P, kind, title, parts.labelAspect]);

  useEffect(() => {
    if (!imageUrl) return;
    let live = true;
    loadLabelTexture(imageUrl, parts.labelAspect, 640).then((t) => {
      if (!t || !live) return t?.dispose();
      mats.label.map?.dispose();
      mats.label.map = t;
      mats.label.needsUpdate = true;
    });
    return () => {
      live = false;
    };
  }, [imageUrl, parts.labelAspect, mats]);

  useEffect(
    () => () => {
      [parts.shell, parts.content, parts.cap, parts.label, mats.shell, mats.cap, mats.content, mats.label.map, mats.label].forEach((x) => x?.dispose());
    },
    [parts, mats],
  );

  const s = 2.6 / parts.height;
  return (
    <group scale={s} position={[0, -1.3, 0]}>
      <mesh geometry={parts.shell} material={mats.shell} renderOrder={2} />
      {parts.content ? <mesh geometry={parts.content} material={mats.content} /> : null}
      <mesh geometry={parts.cap} material={mats.cap} />
      <mesh geometry={parts.label} material={mats.label} />
    </group>
  );
}

export default function ProductViewer(props: ProductViewerProps) {
  const P = palette();
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ fov: 30, position: [0, 0, 7.5] }}
      gl={{ alpha: true, antialias: true }}
      style={{ touchAction: "pan-y" }}
      aria-label={props.title}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.NeutralToneMapping;
        gl.setClearColor(0x000000, 0);
      }}
    >
      <Env />
      <hemisphereLight args={[P.paper, P.soilDark, 0.7]} />
      <directionalLight color={P.dawn} position={[-3, 4, 4]} intensity={2.4} />
      <PresentationControls global snap rotation={[0, -0.4, 0]} polar={[0, 0]} azimuth={[-Infinity, Infinity]}>
        <Container {...props} />
      </PresentationControls>
    </Canvas>
  );
}

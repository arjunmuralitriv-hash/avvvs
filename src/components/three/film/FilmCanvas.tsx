"use client";
// One persistent canvas (tech A1): the S02 plate ring renders into a target; one composite pass draws the screen.
import { useEffect, useMemo, useRef } from "react";
import { Canvas, createPortal, useFrame, useThree } from "@react-three/fiber";
import { useFBO, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { film } from "@/lib/film/store";
import { FILM } from "@/lib/film/color";
import { seg, smoother, S02_BEATS } from "@/lib/film/timeline";
import { plates } from "@/content/plates";
import { compositeFrag, compositeVert, plateFrag, plateVert } from "./shaders";

const STILLS = ["s01-evergreen", "s01-shola-2", "s01-vitex-1"];
const RING_R = 3.4;
const N = plates.length;

function PlateRing({ cam, mobile }: { cam: THREE.PerspectiveCamera; mobile: boolean }) {
  const inks = useTexture(plates.map((p) => `/plates/${p.slug}-ink-2048.webp`));
  const group = useRef<THREE.Group>(null);
  const mats = useMemo(
    () =>
      inks.map((t, i) => {
        t.colorSpace = THREE.NoColorSpace;
        t.anisotropy = 8;
        return new THREE.ShaderMaterial({
          glslVersion: THREE.GLSL3,
          vertexShader: plateVert,
          fragmentShader: plateFrag,
          transparent: true,
          side: THREE.DoubleSide,
          uniforms: {
            uInk: { value: t },
            uPaper: { value: FILM.parchment },
            uPaper2: { value: FILM.parchment2 },
            uSepia: { value: FILM.sepia },
            uSeed: { value: i * 3.17 },
            uFocus: { value: 0 },
            uOpacity: { value: 1 },
            uCurl: { value: 0.25 },
          },
        });
      }),
    [inks],
  );
  const geo = useMemo(() => new THREE.PlaneGeometry(2.4, 2.4 * 0.82, 48, 24), []);
  useEffect(() => () => { geo.dispose(); mats.forEach((m) => m.dispose()); }, [geo, mats]);

  useFrame(() => {
    const p = film.p;
    // ring reveal: start on plate 0 filling the frame (matches the S01 Vitex macro), pull back to the ring
    const reveal = smoother(seg(p, 0.14, S02_BEATS.ringReveal.b));
    // which plate is in front: 0..N-1 across the plates beat, eased within each plate
    const pp = seg(p, S02_BEATS.plates.a, S02_BEATS.plates.b) * N;
    const idx = Math.min(N - 1, Math.floor(pp));
    const within = pp - idx;
    // plate i turns to the front during the first 30% of its own segment, then holds
    const front = idx === 0 ? 0 : idx - 1 + smoother(seg(within, 0.0, 0.3));
    const step = (Math.PI * 2) / N;
    if (group.current) {
      const target = -front * step;
      group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, target, 4, 1 / 60);
    }
    mats.forEach((m, i) => {
      const focus = 1 - Math.min(1, Math.abs(i - front));
      m.uniforms.uFocus.value = THREE.MathUtils.lerp(m.uniforms.uFocus.value, focus, 0.08);
    });
    // camera: close on plate 0 → pulled back; plate in focus comes forward a little
    const near = mobile ? 2.6 : 2.15;
    const far = mobile ? 9.5 : 7.4;
    const z = THREE.MathUtils.lerp(near, far, reveal) - (pp > 0.2 ? 1.9 : 0) * smoother(seg(p, S02_BEATS.ringReveal.b, S02_BEATS.ringReveal.b + 0.02));
    cam.position.set(0, THREE.MathUtils.lerp(0, 0.35, reveal), RING_R + z);
    cam.lookAt(0, 0, RING_R * 0.55);
  });

  return (
    <group ref={group}>
      {plates.map((pl, i) => {
        const a = (i / N) * Math.PI * 2;
        return (
          <mesh
            key={pl.slug}
            geometry={geo}
            material={mats[i]}
            position={[Math.sin(a) * RING_R, 0, Math.cos(a) * RING_R]}
            rotation={[0, a, 0]}
          />
        );
      })}
    </group>
  );
}

function Film({ mobile }: { mobile: boolean }) {
  const { gl, size, viewport } = useThree();
  const fbo = useFBO({ samples: mobile ? 0 : 4 });
  const s02Scene = useMemo(() => {
    const s = new THREE.Scene();
    const g = FILM.parchment2.clone().multiplyScalar(0.52);
    s.background = new THREE.Color().setRGB(g.x, g.y, g.z, THREE.LinearSRGBColorSpace);
    return s;
  }, []);
  const s02Cam = useMemo(() => new THREE.PerspectiveCamera(32, 1, 0.1, 100), []);
  const stills = useTexture(STILLS.map((s) => `/film/stills/${s}-${mobile ? "m" : "d"}.webp`));
  const mat = useMemo(() => {
    stills.forEach((t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.minFilter = THREE.LinearFilter;
      t.generateMipmaps = false;
    });
    const img = stills[0].image as { width: number; height: number };
    return new THREE.ShaderMaterial({
      glslVersion: THREE.GLSL3,
      vertexShader: compositeVert,
      fragmentShader: compositeFrag,
      depthTest: false,
      uniforms: {
        uStill0: { value: stills[0] },
        uStill1: { value: stills[1] },
        uStill2: { value: stills[2] },
        uStillSize: { value: new THREE.Vector2(img.width, img.height) },
        uS02: { value: fbo.texture },
        uRes: { value: new THREE.Vector2() },
        uP: { value: 0 },
        uTime: { value: 0 },
        uKuwahara: { value: mobile ? 2 : 4 },
        uGrain: { value: 0.028 },
        uNight: { value: FILM.night },
        uParchment: { value: FILM.parchment },
        uSepia: { value: FILM.sepia },
        uAmber: { value: FILM.amber },
        uGold: { value: FILM.gold },
        uPaper: { value: FILM.paper },
      },
    });
  }, [stills, fbo, mobile]);

  const tri = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
    return g;
  }, []);

  const matRef = useRef(mat);
  const s02CamRef = useRef(s02Cam);
  useEffect(() => {
    matRef.current = mat;
    s02CamRef.current = s02Cam;
  }, [mat, s02Cam]);
  const sent = useRef(false);

  useFrame((state, delta) => {
    if (film.target === 0 && film.p < 0.08) {
      film.p = 0;
    } else {
      film.p = THREE.MathUtils.damp(film.p, film.target, 6, Math.min(delta, 0.05));
    }
    const p = film.p;
    const currentMat = matRef.current;
    const currentCam = s02CamRef.current;
    const dpr = gl.getPixelRatio();
    currentMat.uniforms.uRes.value.set(size.width * dpr, size.height * dpr);
    currentMat.uniforms.uP.value = p;
    currentMat.uniforms.uTime.value = state.clock.elapsedTime;
    currentMat.uniforms.uGrain.value = p > 0.1444 && p < 0.4464 ? 0.018 : 0.028;

    if (p > 0.115 && p < 0.50) {
      currentCam.aspect = size.width / size.height;
      currentCam.updateProjectionMatrix();
      gl.setRenderTarget(fbo);
      gl.render(s02Scene, currentCam);
      gl.setRenderTarget(null);
    }

    gl.render(state.scene, state.camera);
    if (!sent.current) {
      sent.current = true;
      film.live = true;
      window.dispatchEvent(new Event("film:live"));
    }
  }, 1);

  useEffect(() => {
    fbo.setSize(size.width * viewport.dpr, size.height * viewport.dpr);
  }, [fbo, size, viewport.dpr]);

  useEffect(() => () => {
    tri.dispose();
    mat.dispose();
  }, [tri, mat]);

  return (
    <>
      {createPortal(<PlateRing cam={s02Cam} mobile={mobile} />, s02Scene)}
      <mesh geometry={tri} material={mat} frustumCulled={false} />
    </>
  );
}

export default function FilmCanvas() {
  const mobile = typeof window !== "undefined" && window.innerWidth < 768;
  return (
    <Canvas
      dpr={mobile ? 1 : [1, 1.5]}
      gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
      flat
      aria-hidden="true"
      style={{ position: "absolute", inset: 0 }}
      onCreated={({ gl }) => {
        gl.outputColorSpace = THREE.SRGBColorSpace;
      }}
    >
      <Film mobile={mobile} />
    </Canvas>
  );
}

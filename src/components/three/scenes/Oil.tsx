"use client";
/* eslint-disable react-hooks/immutability -- react-three-fiber scenes mutate three.js objects and shared frame state inside useFrame by design */
// 4. The dark chapter. Dark amber medicated oil in a brass uruli, a slow ripple shader lit by one warm lamp, faint steam.
import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { palette } from "../palette";
import { useDispose, useStory } from "../core";
import { URULI_OIL_R, URULI_OIL_Y } from "../shapes";
import { Blob, Chapter, Steam } from "../props";
import { Uruli } from "../uruli";

export const OIL_SCALE = 1.7;
/** The virtual lamp the oil reflects (behind and above the bowl, so its glint lands inside the bowl). */
export const OIL_LAMP: [number, number, number] = [-1.7, 2.0, -3.2];

const vert = /* glsl */ `
varying vec3 vWorld;
void main() {
  vec4 w = modelMatrix * vec4(position, 1.0);
  vWorld = w.xyz;
  gl_Position = projectionMatrix * viewMatrix * w;
}`;

const frag = /* glsl */ `
uniform float uTime;
uniform float uFade;
uniform vec2 uCentre;
uniform float uR;
uniform vec3 uLamp;
uniform vec3 uOil;
uniform vec3 uDeep;
uniform vec3 uSpec;
varying vec3 vWorld;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
}
float height(vec2 p, float t) {
  float r = length(p);
  float h = sin(r * 20.0 - t * 0.8) * 0.5 * exp(-r * 1.4);
  h += (noise(p * 4.0 + vec2(t * 0.07, -t * 0.05)) - 0.5) * 0.9;
  h += (noise(p * 9.0 - vec2(t * 0.05, t * 0.06)) - 0.5) * 0.45;
  return h * 0.05;
}
void main() {
  vec2 p = (vWorld.xz - uCentre) / uR;
  float r = length(p);
  float e = 0.012;
  float hx = height(p + vec2(e, 0.0), uTime) - height(p - vec2(e, 0.0), uTime);
  float hz = height(p + vec2(0.0, e), uTime) - height(p - vec2(0.0, e), uTime);
  vec3 n = normalize(vec3(-hx / (2.0 * e) * 0.9, 1.0, -hz / (2.0 * e) * 0.9));
  vec3 v = normalize(cameraPosition - vWorld);
  vec3 l = normalize(uLamp - vWorld);
  vec3 hv = normalize(l + v);
  float nh = max(dot(n, hv), 0.0);
  float spec = pow(nh, 220.0) * 2.4 + pow(nh, 38.0) * 0.32;
  float fres = pow(1.0 - max(dot(n, v), 0.0), 3.0);
  float tint = 0.5 + 0.4 * noise(p * 2.2 + uTime * 0.02);
  vec3 col = mix(uDeep, uOil, tint * (1.0 - 0.55 * smoothstep(0.6, 1.0, r)));
  col += uOil * fres * 0.55 + uSpec * spec;
  float a = uFade * (1.0 - smoothstep(0.985, 1.0, r));
  gl_FragColor = vec4(col, a);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

export default function OilScene() {
  const S = useStory();
  const P = palette();
  const d = useMemo(() => {
    const geo = new THREE.CircleGeometry(URULI_OIL_R * OIL_SCALE, 72);
    geo.rotateX(-Math.PI / 2);
    const mat = new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      transparent: true,
      uniforms: {
        uTime: { value: 0 },
        uFade: { value: 1 },
        uCentre: { value: new THREE.Vector2(0, 0) },
        uR: { value: URULI_OIL_R * OIL_SCALE },
        uLamp: { value: new THREE.Vector3(...OIL_LAMP) },
        uOil: { value: P.oil },
        uDeep: { value: P.oilDeep },
        uSpec: { value: P.lamp },
      },
    });
    return { geo, mat };
  }, [P]);
  useDispose([d.geo, d.mat]);
  useFrame(() => {
    d.mat.uniforms.uTime.value = S.time;
  });
  return (
    <Chapter i={4}>
      <group scale={OIL_SCALE}>
        <Uruli rough={0.34} />
      </group>
      <mesh geometry={d.geo} material={d.mat} position={[0, URULI_OIL_Y * OIL_SCALE, 0]} />
      <Steam count={S.q.steam} position={[0, URULI_OIL_Y * OIL_SCALE, 0]} spread={0.7} height={2.2} size={1.3} strength={0.1} speed={0.045} />
      <Blob position={[0, 0, 0]} scale={[5.6, 4.6]} opacity={0.55} />
    </Chapter>
  );
}

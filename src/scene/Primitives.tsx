import { useMemo, useEffect, type ReactNode } from 'react';
import type { ThreeElements } from '@react-three/fiber';
import * as THREE from 'three';
import { useSceneResources } from './SceneResources';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// Direct bevel geometry avoids ExtrudeGeometry + expensive creased-normal rebuilds.
export function RoundedBox({
  args,
  radius = 0.04,
  children,
  ...props
}: Omit<ThreeElements['mesh'], 'args'> & {
  args: [number, number, number];
  radius?: number;
}) {
  const pool = useSceneResources();
  const [width, height, depth] = args;
  const geometry = useMemo(
    () =>
      pool?.geometry(
        `box|${width}|${height}|${depth}|${radius}`,
        () => new RoundedBoxGeometry(width, height, depth, 2, radius),
      ) ?? new RoundedBoxGeometry(width, height, depth, 2, radius),
    [pool, width, height, depth, radius],
  );
  useEffect(
    () => () => {
      if (!pool) geometry.dispose();
    },
    [pool, geometry],
  );
  return (
    <mesh {...props} geometry={geometry}>
      {children}
    </mesh>
  );
}
function useStandard(color: string, roughness: number, metalness: number) {
  const pool = useSceneResources();
  const material = useMemo(
    () =>
      pool?.standard(color, roughness, metalness) ??
      new THREE.MeshStandardMaterial({ color, roughness, metalness }),
    [pool, color, roughness, metalness],
  );
  useEffect(
    () => () => {
      if (!pool) material.dispose();
    },
    [pool, material],
  );
  return material;
}
const ceramic = '#becbcf',
  metal = '#879ba5';
export function Block({
  at = [0, 0, 0],
  size = [1, 1, 1],
  color = ceramic,
  rotation = [0, 0, 0],
  radius = 0.04,
  children,
}: {
  at?: [number, number, number];
  size?: [number, number, number];
  color?: string;
  rotation?: [number, number, number];
  radius?: number;
  children?: ReactNode;
}) {
  const material = useStandard(color, 0.42, 0.25);
  return (
    <RoundedBox
      position={at}
      args={size}
      radius={radius}
      rotation={rotation}
      castShadow={size[0] > 0.4 && size[1] > 0.15}
      receiveShadow
      material={material}
    >
      {children}
    </RoundedBox>
  );
}
export function Disc({
  at = [0, 0, 0],
  radius = 1,
  height = 0.1,
  color = ceramic,
}: {
  at?: [number, number, number];
  radius?: number;
  height?: number;
  color?: string;
}) {
  return (
    <mesh position={at} castShadow receiveShadow>
      <cylinderGeometry args={[radius, radius * 1.025, height, 64]} />
      <meshStandardMaterial color={color} roughness={0.46} metalness={0.28} />
    </mesh>
  );
}
export function Arc({
  radius = 1,
  tube = 0.025,
  angle = Math.PI * 2,
  color = metal,
  rotation = [0, 0, 0],
  at = [0, 0, 0],
  lit = false,
}: {
  radius?: number;
  tube?: number;
  angle?: number;
  color?: string;
  rotation?: [number, number, number];
  at?: [number, number, number];
  lit?: boolean;
}) {
  return (
    <mesh position={at} rotation={rotation} castShadow={!lit}>
      <torusGeometry args={[radius, tube, 6, 64, angle]} />
      <meshStandardMaterial
        color={color}
        metalness={lit ? 0 : 0.55}
        roughness={0.32}
        emissive={lit ? color : '#000000'}
        emissiveIntensity={lit ? 0.6 : 0}
      />
    </mesh>
  );
}

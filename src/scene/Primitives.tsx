import { RoundedBox } from '@react-three/drei';
import type { ReactNode } from 'react';
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
  return (
    <RoundedBox
      position={at}
      args={size}
      radius={radius}
      smoothness={1}
      rotation={rotation}
      castShadow={size[0] > 0.4 && size[1] > 0.15}
      receiveShadow
    >
      <meshStandardMaterial color={color} roughness={0.42} metalness={0.25} />
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

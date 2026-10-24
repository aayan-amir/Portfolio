import { useMemo } from 'react';
import * as THREE from 'three';
import { Block } from './Primitives';
import type { BodyId } from '../data/celestial';

export const cabin = {
  hull: '#d9ded4',
  petrol: '#204c59',
  recess: '#102b39',
  orange: '#c77743',
  trim: '#839b9c',
  light: '#f5d5a0',
};
export function CabinShell({ body }: { body: BodyId }) {
  const wall = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-7, 0);
    s.lineTo(7, 0);
    s.lineTo(7, 6.6);
    s.lineTo(-7, 6.6);
    s.closePath();
    const h = new THREE.Path();
    // A single recessed viewport cut through a substantial hull.
    h.moveTo(-1.8, 2.15);
    h.lineTo(-1.8, 4.85);
    h.quadraticCurveTo(-1.8, 5.65, -1, 5.65);
    h.lineTo(5.55, 5.65);
    h.quadraticCurveTo(6.25, 5.65, 6.25, 4.95);
    h.lineTo(6.25, 2.65);
    h.quadraticCurveTo(6.25, 2.15, 5.75, 2.15);
    h.closePath();
    s.holes.push(h);
    return s;
  }, []);
  const frame = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(
      [
        [-1.93, 2.06, -4.7],
        [-1.93, 4.85, -4.7],
        [-1.7, 5.65, -4.7],
        [-0.95, 5.79, -4.7],
        [5.52, 5.79, -4.7],
        [6.38, 5.55, -4.7],
        [6.39, 4.92, -4.7],
        [6.39, 2.65, -4.7],
        [5.8, 2.01, -4.7],
        [-1, 2.01, -4.7],
      ].map((p) => new THREE.Vector3(...(p as [number, number, number]))),
      true,
      'centripetal',
    );
    return curve;
  }, []);
  return (
    <group>
      <Block
        at={[0, -0.17, 1]}
        size={[14, 0.32, 18]}
        color={cabin.petrol}
        radius={0.1}
      />
      {[-5, -2.5, 0, 2.5, 5].map((x) => (
        <group key={x}>
          <Block
            at={[x, 0.005, 1]}
            size={[2.46, 0.035, 16]}
            color={x === 0 ? '#3f626a' : '#34545e'}
            radius={0.008}
          />
          <Block
            at={[x, 0.027, 1]}
            size={[0.018, 0.007, 16]}
            color="#738987"
            radius={0.002}
          />
        </group>
      ))}
      <mesh position={[0, 0, -5.05]} receiveShadow>
        <extrudeGeometry
          args={[
            wall,
            {
              depth: 0.48,
              bevelEnabled: true,
              bevelSize: 0.09,
              bevelThickness: 0.09,
              bevelSegments: 3,
              curveSegments: 24,
            },
          ]}
        />
        <meshStandardMaterial
          color={cabin.hull}
          roughness={0.72}
          metalness={0.12}
        />
      </mesh>
      <mesh>
        <tubeGeometry args={[frame, 128, 0.14, 8, true]} />
        <meshStandardMaterial
          color={cabin.petrol}
          metalness={0.35}
          roughness={0.45}
        />
      </mesh>
      <Block
        at={[2.15, 2, -4.48]}
        size={[8.45, 0.16, 0.68]}
        color={cabin.trim}
        radius={0.06}
      />
      <Block
        at={[2.15, 1.89, -4.35]}
        size={[8.25, 0.035, 0.065]}
        color={cabin.light}
      />
      <Block
        at={[-4.4, 3.4, -4.35]}
        size={[3.95, 5.5, 0.2]}
        color={cabin.petrol}
        radius={0.18}
      />
      <Block
        at={[-4.4, 5.45, -4.19]}
        size={[3.3, 0.12, 0.12]}
        color={cabin.light}
      />
      {[-6.8, 6.8].map((x) => (
        <group key={x}>
          <Block
            at={[x, 3.2, 1.1]}
            size={[0.4, 6.4, 12.8]}
            color={cabin.hull}
            radius={0.15}
          />
          <Block
            at={[x * 0.97, 1.15, 1.1]}
            size={[0.23, 2.2, 12.5]}
            color={cabin.petrol}
            radius={0.07}
          />
          {[-2, 1.5, 5].map((z) => (
            <group key={z}>
              <Block
                at={[x * 0.97, 3.75, z]}
                size={[0.12, 3.55, 3.38]}
                color="#b7c8c3"
                radius={0.09}
              />
              <Block
                at={[x * 0.95, 0.24, z]}
                size={[0.07, 0.045, 2.95]}
                color={cabin.light}
              />
            </group>
          ))}
        </group>
      ))}
      <Block
        at={[0, 6.5, 1]}
        size={[14, 0.38, 16]}
        color={cabin.hull}
        radius={0.1}
      />
      {[-4.6, 3.9].map((x) => (
        <group key={x}>
          <Block
            at={[x, 6.19, 1]}
            size={[0.28, 0.36, 15]}
            color={cabin.petrol}
            radius={0.07}
          />
          <Block
            at={[x, 5.985, 1]}
            size={[0.1, 0.035, 13.5]}
            color={cabin.light}
          />
        </group>
      ))}
      {[-3.2, 1.5, 6.1].map((z) => (
        <Block
          key={z}
          at={[0, 6.12, z]}
          size={[13.4, 0.28, 0.3]}
          color="#7c999c"
          radius={0.05}
        />
      ))}
      {/* Rear bulkhead and a recessed hatch complete the enclosure when looking sideways. */}
      <Block at={[0, 3.2, 9.6]} size={[14, 6.4, 0.5]} color={cabin.hull} />
      <Block
        at={[-2.8, 2.25, 9.25]}
        size={[3.2, 4.5, 0.2]}
        color={cabin.petrol}
        radius={0.25}
      />
      <Block
        at={[-2.8, 2.25, 9.1]}
        size={[2.75, 4.1, 0.18]}
        color="#61858a"
        radius={0.22}
      />
      {/* Built-in lower hull beneath the viewport, with service access panels. */}
      <Block
        at={[1.9, 0.8, -4.5]}
        size={[9, 1.6, 0.95]}
        color={cabin.petrol}
        radius={0.12}
      />
      {[-0.8, 1.2, 3.2, 5.2].map((x) => (
        <group key={x}>
          <Block
            at={[x, 0.85, -3.99]}
            size={[1.8, 1.12, 0.065]}
            color="#35616b"
            radius={0.06}
          />
          <Block
            at={[x, 1.2, -3.94]}
            size={[0.4, 0.055, 0.055]}
            color={cabin.orange}
            radius={0.01}
          />
        </group>
      ))}
      <pointLight
        position={[-4, 4.8, -2.7]}
        intensity={12}
        distance={8}
        color="#ffe2b5"
      />
      <pointLight
        position={[3.5, 4.9, 1.5]}
        intensity={16}
        distance={10}
        color="#d5e9eb"
      />
      {body === 'sun' &&
        [0, 1, 2].map((i) => (
          <group key={i}>
            <Block
              at={[2.2, 5.4 - i * 0.23, -4.4]}
              size={[7.6, 0.16, 0.12]}
              color={cabin.petrol}
              radius={0.02}
            />
            <Block
              at={[2.2, 5.32 - i * 0.23, -4.32]}
              size={[7.3, 0.025, 0.03]}
              color={cabin.orange}
              radius={0.005}
            />
          </group>
        ))}
      {body === 'neptune' &&
        [-1.7, 6.15].map((x) => (
          <mesh key={x} position={[x, 3.7, -4.47]}>
            <planeGeometry args={[0.14, 2.5]} />
            <meshBasicMaterial
              color="#b1e1f2"
              transparent
              opacity={0.22}
              depthWrite={false}
            />
          </mesh>
        ))}
      {[-6, -2.6].map((x) => (
        <group key={x}>
          <Block
            at={[x, 3.55, -4.16]}
            size={[0.028, 3.3, 0.028]}
            color="#62818a"
            radius={0.004}
          />
          {[2.2, 4.9].map((y) => (
            <mesh
              key={y}
              position={[x, y, -4.11]}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <cylinderGeometry args={[0.04, 0.04, 0.035, 12]} />
              <meshStandardMaterial
                color={cabin.trim}
                metalness={0.7}
                roughness={0.4}
              />
            </mesh>
          ))}
        </group>
      ))}{' '}
    </group>
  );
}

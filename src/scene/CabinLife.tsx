import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Block, Arc } from './Primitives';
import { cabin } from './CabinShell';

/** A bounded 30 Hz wake-up for the demand renderer; camera input may render faster. */
export function CabinLife({ paused }: { paused: boolean }) {
  const { invalidate, gl } = useThree();
  const drone = useRef<THREE.Group>(null),
    rotor = useRef<THREE.Group>(null),
    satellite = useRef<THREE.Group>(null);
  const time = useRef(0);
  useEffect(() => {
    if (paused) {
      invalidate();
      return;
    }
    let timer: ReturnType<typeof setInterval> | undefined;
    const update = () => {
      if (timer) clearInterval(timer);
      timer = undefined;
      if (!document.hidden) timer = setInterval(() => invalidate(), 1000 / 30);
    };
    update();
    document.addEventListener('visibilitychange', update);
    return () => {
      if (timer) clearInterval(timer);
      document.removeEventListener('visibilitychange', update);
    };
  }, [paused, invalidate]);
  useFrame((_, dt) => {
    if (paused || document.hidden) return;
    time.current += Math.min(dt, 0.05);
    const t = time.current;
    if (drone.current) {
      drone.current.position.set(
        1.15 + Math.sin(t * 0.28) * 0.55,
        3.45 + Math.sin(t * 0.9) * 0.22,
        -2.45,
      );
      drone.current.rotation.set(
        Math.sin(t * 0.7) * 0.07,
        Math.sin(t * 0.35) * 0.35,
        Math.sin(t * 0.6) * 0.08,
      );
    }
    if (rotor.current) rotor.current.rotation.z = t * 1.7;
    if (satellite.current) {
      satellite.current.position.set(
        1.8 + Math.sin(t * 0.08) * 9,
        6.2 + Math.sin(t * 0.13) * 0.8,
        -18,
      );
      satellite.current.rotation.z = t * 0.08;
    }
    gl.domElement.dataset.cabinTime = t.toFixed(3);
  });
  return (
    <group>
      {/* A small inspection drone gives the foreground a clear, gentle motion. */}
      <group ref={drone} position={[1.15, 3.45, -2.45]} scale={0.68}>
        <mesh>
          <sphereGeometry args={[0.32, 24, 16]} />
          <meshStandardMaterial
            color={cabin.hull}
            roughness={0.5}
            metalness={0.3}
          />
        </mesh>
        <group ref={rotor}>
          <Arc
            radius={0.46}
            tube={0.025}
            rotation={[0, 0, 0]}
            color={cabin.orange}
          />
          {[-1, 1].map((sign) => (
            <Block
              key={sign}
              at={[sign * 0.41, 0, 0]}
              size={[0.16, 0.14, 0.16]}
              color={cabin.petrol}
              radius={0.035}
            />
          ))}
        </group>
        <mesh position={[0, 0, 0.29]}>
          <cylinderGeometry args={[0.15, 0.15, 0.1, 24]} />
          <meshStandardMaterial color={cabin.recess} roughness={0.25} />
        </mesh>
        <mesh position={[0, 0, 0.36]}>
          <sphereGeometry args={[0.09, 16, 12]} />
          <meshStandardMaterial
            color="#92dace"
            emissive="#70c7bc"
            emissiveIntensity={0.7}
          />
        </mesh>
        {[-1, 1].map((sign) => (
          <mesh key={sign} position={[sign * 0.17, -0.26, 0]}>
            <coneGeometry args={[0.045, 0.2, 12]} />
            <meshBasicMaterial color="#9edddc" transparent opacity={0.5} />
          </mesh>
        ))}
      </group>
      {/* A distant satellite travels slowly beyond the window, separate from the cabin. */}
      <group ref={satellite} position={[1.8, 6.2, -18]} scale={0.6}>
        <Block size={[0.42, 0.48, 0.6]} color="#bbc8c7" />
        {[-1, 1].map((sign) => (
          <group key={sign}>
            <Block
              at={[sign * 1.05, 0, 0]}
              size={[1.5, 0.62, 0.04]}
              color="#24496b"
              radius={0.008}
            />
            {[0, 1, 2, 3].map((i) => (
              <Block
                key={i}
                at={[sign * 0.45 + sign * i * 0.35, 0, 0.03]}
                size={[0.016, 0.6, 0.01]}
                color="#81aab5"
                radius={0.002}
              />
            ))}
          </group>
        ))}
      </group>
    </group>
  );
}

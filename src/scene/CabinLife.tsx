import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Block, Arc } from './Primitives';
import { cabin } from './CabinShell';

/** A bounded 30 Hz wake-up for the demand renderer; camera input may render faster. */
export function CabinLife({
  paused,
  docked,
  attention,
  onDock,
}: {
  paused: boolean;
  docked: boolean;
  attention: string | null;
  onDock: () => void;
}) {
  const { invalidate, gl } = useThree();
  const drone = useRef<THREE.Group>(null),
    rotor = useRef<THREE.Group>(null),
    satellite = useRef<THREE.Group>(null);
  const time = useRef(0);
  const intervals = useRef<number[]>([]);
  const target = useRef(new THREE.Vector3());
  useEffect(() => {
    if (paused && drone.current)
      drone.current.position.set(
        ...((docked ? [-5.3, 2.24, 1.55] : [1.15, 3.45, -2.45]) as [
          number,
          number,
          number,
        ]),
      );
    invalidate();
  }, [paused, docked, invalidate]);
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
    intervals.current.push(dt * 1000);
    if (intervals.current.length === 120) {
      const samples = intervals.current.sort((a, b) => a - b);
      gl.domElement.dataset.frameIntervalP50 = samples[60].toFixed(1);
      gl.domElement.dataset.frameIntervalP95 = samples[114].toFixed(1);
      intervals.current = [];
    }
    time.current += Math.min(dt, 0.05);
    const t = time.current;
    if (drone.current) {
      target.current.set(
        docked ? -5.3 : 1.15 + Math.sin(t * 0.28) * 0.55,
        docked ? 2.24 : 3.45 + Math.sin(t * 0.9) * 0.22,
        docked ? 1.55 : -2.45,
      );
      drone.current.position.lerp(
        target.current,
        1 - Math.exp(-4 * Math.min(dt, 0.05)),
      );
      const aimX =
        attention === 'noclash'
          ? -0.8
          : attention === 'student-portal'
            ? -4.1
            : attention === 'noterm'
              ? 3.7
              : 1.15;
      drone.current.rotation.set(
        Math.sin(t * 0.7) * 0.05,
        THREE.MathUtils.damp(
          drone.current.rotation.y,
          attention
            ? Math.atan2(aimX - drone.current.position.x, 5)
            : Math.sin(t * 0.35) * 0.35,
          4,
          Math.min(dt, 0.05),
        ),
        docked ? 0 : Math.sin(t * 0.6) * 0.08,
      );
    }
    if (rotor.current && !docked) rotor.current.rotation.z = t * 1.7;
    if (satellite.current) {
      satellite.current.position.set(
        1.8 + Math.sin(t * 0.08) * 9,
        6.2 + Math.sin(t * 0.13) * 0.8,
        -18,
      );
      satellite.current.rotation.z = t * 0.08;
    }
    gl.domElement.dataset.cabinTime = t.toFixed(3);
    gl.domElement.dataset.droneState = docked
      ? 'docked'
      : attention
        ? 'attending'
        : 'idle';
  });
  return (
    <group>
      {/* A small inspection drone gives the foreground a clear, gentle motion. */}
      <group
        ref={drone}
        position={[1.15, 3.45, -2.45]}
        scale={0.68}
        onClick={(e) => {
          if (e.delta > 6) return;
          e.stopPropagation();
          onDock();
        }}
      >
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

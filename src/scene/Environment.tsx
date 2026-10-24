import { useEffect, useMemo, useRef, type RefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { BodyId } from '../data/celestial';
export type ArrivalPhase = 'preparing' | 'travelling' | 'settled' | 'fallback';
export function Arrival({
  motion,
  body,
  paused,
  reduced,
  onPhase,
  onSettled,
}: {
  motion: RefObject<number>;
  body: BodyId;
  paused: boolean;
  reduced: boolean;
  onPhase: (phase: ArrivalPhase) => void;
  onSettled: (body: BodyId) => void;
}) {
  const { gl, invalidate } = useThree();
  const progress = useRef(1),
    last = useRef<BodyId | null>(null),
    phase = useRef<ArrivalPhase>('preparing'),
    waiting = useRef(true);
  const cover = useRef<THREE.MeshBasicMaterial>(null),
    trails = useRef<THREE.InstancedMesh>(null);
  const seeds = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        x: -5 + ((i * 2.39) % 15),
        y: 1.8 + ((i * 0.67) % 5.4),
        z: -11 - ((i * 0.53) % 5),
      })),
    [],
  );
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const callbacks = useRef({ onPhase, onSettled });
  callbacks.current = { onPhase, onSettled };
  useEffect(() => {
    waiting.current = true;
    progress.current = last.current === null || reduced ? 1 : 0;
    last.current = body;
    phase.current = 'preparing';
    callbacks.current.onPhase('preparing');
    invalidate();
  }, [body, invalidate]);
  useEffect(() => invalidate(), [reduced, paused, invalidate]);
  useFrame((_, dt) => {
    const ready =
      gl.domElement.dataset.destination === body &&
      ['ready', 'fallback'].includes(gl.domElement.dataset.planetTexture ?? '');
    if (waiting.current && ready) {
      waiting.current = false;
      phase.current = 'travelling';
      callbacks.current.onPhase('travelling');
    }
    if (!waiting.current && progress.current < 1 && !paused) {
      progress.current = Math.min(
        1,
        progress.current + Math.min(dt, 0.05) / 1.25,
      );
      invalidate();
    }
    if (reduced || paused) {
      progress.current = 1;
    }
    if (
      !waiting.current &&
      progress.current === 1 &&
      phase.current === 'travelling'
    ) {
      phase.current =
        gl.domElement.dataset.planetTexture === 'fallback'
          ? 'fallback'
          : 'settled';
      callbacks.current.onPhase(phase.current);
      callbacks.current.onSettled(body);
    }
    const intensity =
      reduced || paused ? 0 : Math.sin(progress.current * Math.PI);
    if (cover.current)
      cover.current.opacity = waiting.current ? 0.12 : intensity * 0.68;
    if (trails.current && intensity > 0.025) {
      trails.current.visible = intensity > 0.025;
      seeds.forEach((s, i) => {
        dummy.position.set(s.x, s.y, s.z + progress.current * 5);
        dummy.scale.set(0.012, 0.012, 0.2 + intensity * 2.5);
        dummy.updateMatrix();
        trails.current!.setMatrixAt(i, dummy.matrix);
      });
      trails.current.instanceMatrix.needsUpdate = true;
    } else if (trails.current) trails.current.visible = false;
    motion.current = progress.current;
    gl.domElement.dataset.arrivalPhase = waiting.current
      ? 'preparing'
      : phase.current;
    gl.domElement.dataset.arrivalProgress = progress.current.toFixed(3);
  }, -1);
  return (
    <group>
      <mesh position={[2.2, 3.92, -4.42]}>
        <planeGeometry args={[7.5, 3.25]} />
        <meshBasicMaterial
          ref={cover}
          color="#07121c"
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>
      <instancedMesh
        ref={trails}
        args={[undefined, undefined, 24]}
        visible={false}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="#cce5ec" transparent opacity={0.65} />
      </instancedMesh>
    </group>
  );
}
/** The cabin uses one static working-light setup; planets add their own treatment. */
export function CabinLighting() {
  return (
    <>
      <hemisphereLight args={['#e3eee9', '#34505b', 0.85]} />
      <directionalLight position={[-4, 7, 6]} intensity={1.1} color="#ffedcf" />
      <directionalLight
        position={[6, 5, -5]}
        intensity={0.55}
        color="#c2d7d3"
      />
    </>
  );
}

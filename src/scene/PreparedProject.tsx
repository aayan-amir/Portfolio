import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type * as THREE from 'three';
import type { ProjectId } from '../data/navigation';
import { useMechanism } from './ProjectObjects';
export function PreparedProject({
  id,
  model,
  active,
  demo = 0,
  reduced = false,
}: {
  id: ProjectId;
  model: THREE.Object3D;
  active: boolean;
  demo?: number;
  reduced?: boolean;
}) {
  const phase = useMechanism(active, demo, reduced),
    idle = useRef(0),
    start = useRef(0.65);
  const parts = useMemo(
    () => ({
      arm: model.getObjectByName('planner-arm'),
      tray: model.getObjectByName('archive-tray'),
      lever: model.getObjectByName('terminal-lever'),
    }),
    [model],
  );
  const trayBase = useMemo(() => parts.tray?.position.z || 0, [parts]);
  useEffect(() => {
    if (active) start.current = parts.arm?.rotation.z ?? 0.65;
  }, [active, demo, parts]);
  useFrame((_, dt) => {
    if (id === 'noclash' && parts.arm) {
      if (!reduced) idle.current += Math.min(dt, 0.05);
      parts.arm.rotation.z = active
        ? start.current + (1 - Math.pow(1 - phase.current, 3)) * Math.PI * 2
        : 0.65 + idle.current * 0.45;
    }
    if (id === 'student-portal' && parts.tray)
      parts.tray.position.z =
        trayBase + (active ? 0.8 * (1 - Math.pow(1 - phase.current, 3)) : 0);
    if (id === 'noterm') {
      const response =
        active && !reduced ? Math.sin(phase.current * Math.PI) : 0;
      model.position.y = response * 0.12;
      model.rotation.x = -response * 0.07;
      if (parts.lever)
        parts.lever.rotation.x = active
          ? -0.95 * Math.sin(phase.current * Math.PI)
          : 0;
    }
  });
  return <primitive object={model} dispose={null} />;
}

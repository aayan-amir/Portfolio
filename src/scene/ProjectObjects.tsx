import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Block, Disc, Arc } from './Primitives';
import { cabin } from './CabinShell';
type DemoProps = { active: boolean; demo?: number; reduced?: boolean };
export function useMechanism(active: boolean, demo: number, reduced: boolean) {
  const phase = useRef(0);
  const { invalidate, gl } = useThree();
  useEffect(() => {
    phase.current = active ? (reduced ? 1 : 0) : 0;
    invalidate();
  }, [active, demo, reduced, invalidate]);
  useFrame((_, dt) => {
    if (!active) return;
    if (!reduced && phase.current < 1) {
      phase.current = Math.min(1, phase.current + Math.min(dt, 0.05) / 0.48);
      invalidate();
    }
    gl.domElement.dataset.demoProgress = phase.current.toFixed(3);
  }, -2);
  return phase;
}
function InstrumentFace({
  kind,
  width,
  height,
  at,
}: {
  kind: 'planner' | 'archive' | 'maintenance';
  width: number;
  height: number;
  at: [number, number, number];
}) {
  const map = useMemo(() => {
    const el = document.createElement('canvas');
    el.width = 1024;
    el.height = 512;
    const c = el.getContext('2d')!;
    c.fillStyle = '#102b39';
    c.fillRect(0, 0, 1024, 512);
    c.fillStyle = '#b9dad4';
    c.font = '500 30px sans-serif';
    c.fillText(
      kind === 'planner'
        ? 'NoClash / planning'
        : kind === 'archive'
          ? 'Student Portal / resources'
          : 'NoTerm / maintenance',
      48,
      62,
    );
    c.strokeStyle = '#365864';
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(48, 88);
    c.lineTo(976, 88);
    c.stroke();
    if (kind === 'planner') {
      c.font = '22px sans-serif';
      ['MON', 'TUE', 'WED', 'THU', 'FRI'].forEach((s, i) => {
        c.fillStyle = '#789fa6';
        c.fillText(s, 95 + i * 179, 128);
      });
      for (let x = 0; x < 5; x++)
        for (let y = 0; y < 4; y++) {
          c.strokeStyle = '#284854';
          c.strokeRect(60 + x * 179, 155 + y * 72, 165, 60);
        }
      [
        [0, 0, 2],
        [1, 2, 1],
        [2, 0, 1],
        [3, 1, 2],
        [4, 2, 1],
      ].forEach(([x, y, h], i) => {
        c.fillStyle = ['#76bdb5', '#d7a567', '#7ba8c0'][i % 3];
        c.fillRect(64 + x * 179, 159 + y * 72, 154, 52 * h);
      });
      c.fillStyle = '#b9dad4';
      c.font = '22px sans-serif';
      c.fillText('Review sections. Check overlaps.', 60, 483);
    } else if (kind === 'archive') {
      c.fillStyle = '#edc28c';
      c.font = '42px sans-serif';
      c.fillText('Shared knowledge', 50, 165);
      ['Course material', 'Submission review', 'Approved resources'].forEach(
        (s, i) => {
          c.fillStyle = '#244653';
          c.fillRect(48, 202 + i * 84, 928, 64);
          c.fillStyle = '#b9dad4';
          c.font = '28px sans-serif';
          c.fillText(s, 76, 244 + i * 84);
          c.fillStyle = i === 2 ? '#8bc2ab' : '#d8b782';
          c.beginPath();
          c.arc(929, 234 + i * 84, 8, 0, Math.PI * 2);
          c.fill();
        },
      );
    } else {
      c.fillStyle = '#edc28c';
      c.font = '24px monospace';
      c.fillText('PREVIEW / illustrative action', 50, 145);
      c.fillStyle = '#dae5da';
      c.font = '37px monospace';
      c.fillText('Check disk usage', 50, 216);
      c.fillStyle = '#83beb8';
      c.font = '34px monospace';
      c.fillText('$ df -h', 50, 290);
      c.fillStyle = '#789fa6';
      c.font = '23px monospace';
      c.fillText('Choose > inspect > confirm', 50, 365);
      c.fillStyle = '#b9dad4';
      c.fillText('Predefined actions. Clear feedback.', 50, 451);
    }
    const t = new THREE.CanvasTexture(el);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }, [kind]);
  useEffect(() => () => map.dispose(), [map]);
  return (
    <mesh position={at}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={map} toneMapped={false} />
    </mesh>
  );
}
function Fasteners({
  width,
  height,
  z,
}: {
  width: number;
  height: number;
  z: number;
}) {
  return (
    <>
      {[-1, 1].flatMap((x) =>
        [-1, 1].map((y) => (
          <mesh
            key={`${x}${y}`}
            position={[(x * width) / 2, (y * height) / 2, z]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <cylinderGeometry args={[0.026, 0.026, 0.025, 8]} />
            <meshStandardMaterial
              color={cabin.trim}
              metalness={0.8}
              roughness={0.3}
            />
          </mesh>
        )),
      )}
    </>
  );
}
export function NavigationPlanner({
  active,
  demo = 0,
  reduced = false,
}: DemoProps) {
  const phase = useMechanism(active, demo, reduced);
  const arm = useRef<THREE.Group>(null);
  const idleTime = useRef(0);
  const startAngle = useRef(0.65);
  useEffect(() => {
    if (active) startAngle.current = arm.current?.rotation.z ?? 0.65;
  }, [active, demo]);
  useFrame((_, dt) => {
    if (!reduced) idleTime.current += Math.min(dt, 0.05);
    if (arm.current)
      arm.current.rotation.z = active
        ? startAngle.current +
          (1 - Math.pow(1 - phase.current, 3)) * Math.PI * 2
        : 0.65 + idleTime.current * 0.45;
  });
  return (
    <group name="project-noclash">
      <Block
        at={[0, 0.12, 0]}
        size={[2.65, 0.24, 1.65]}
        color={cabin.petrol}
        radius={0.12}
      />
      <group position={[-0.45, 0.77, -0.05]} rotation={[-0.3, 0, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.8, 0.87, 0.22, 64]} />
          <meshStandardMaterial
            color={cabin.hull}
            metalness={0.25}
            roughness={0.5}
          />
        </mesh>
        <mesh position={[0, 0, 0.13]}>
          <circleGeometry args={[0.72, 64]} />
          <meshStandardMaterial color={cabin.recess} />
        </mesh>
        {[0.25, 0.46, 0.65].map((r) => (
          <Arc
            key={r}
            radius={r}
            tube={0.008}
            at={[0, 0, 0.15]}
            color="#6d999b"
          />
        ))}
        {Array.from({ length: 24 }, (_, i) => (
          <group key={i} rotation={[0, 0, (i * Math.PI) / 12]}>
            <Block
              at={[0, 0.75, 0.17]}
              size={[0.015, i % 3 === 0 ? 0.07 : 0.035, 0.015]}
              color={cabin.petrol}
              radius={0.002}
            />
          </group>
        ))}
        <group ref={arm} name="planner-arm">
          <Block
            at={[0, 0.29, 0.18]}
            size={[0.018, 0.58, 0.015]}
            color={cabin.orange}
          />
          <mesh position={[0, 0.58, 0.2]}>
            <sphereGeometry args={[0.065, 16, 12]} />
            <meshStandardMaterial
              color="#e5b96e"
              emissive="#d5a662"
              emissiveIntensity={0.25}
            />
          </mesh>
        </group>
        {[
          [-0.36, 0.29],
          [0.35, -0.29],
          [0.38, 0.34],
        ].map(([x, y], i) => (
          <mesh key={i} position={[x, y, 0.18]}>
            <circleGeometry args={[0.038, 16]} />
            <meshBasicMaterial color={i === 0 ? '#d4a26b' : '#90c8c2'} />
          </mesh>
        ))}
      </group>
      <group position={[0.95, 0.7, -0.06]} rotation={[-0.3, 0, 0]}>
        <Block size={[0.78, 1.18, 0.26]} color={cabin.petrol} radius={0.08} />
        <InstrumentFace
          kind="planner"
          width={0.64}
          height={0.86}
          at={[0, 0.07, 0.137]}
        />
        <Block
          at={[0, -0.47, 0.15]}
          size={[0.34, 0.045, 0.035]}
          color={cabin.orange}
        />
      </group>
      <group position={[0, 0.28, 0.6]}>
        <Block size={[2.22, 0.12, 0.38]} color={cabin.hull} radius={0.035} />
        {[-0.65, -0.35, 0].map((x) => (
          <Block
            key={x}
            at={[x, 0.075, 0]}
            size={[0.17, 0.04, 0.18]}
            color={x === 0 ? '#c77743' : '#547b83'}
            radius={0.018}
          />
        ))}
        <Disc
          at={[0.72, 0.11, 0]}
          radius={0.19}
          height={0.14}
          color={cabin.orange}
        />
      </group>
    </group>
  );
}
export function ResourceArchive({
  active,
  demo = 0,
  reduced = false,
}: DemoProps) {
  const phase = useMechanism(active, demo, reduced);
  const tray = useRef<THREE.Group>(null);
  useFrame(() => {
    if (tray.current)
      tray.current.position.z = active
        ? 0.8 * (1 - Math.pow(1 - phase.current, 3))
        : 0;
  });
  return (
    <group name="project-student-portal">
      <Block
        at={[0, 0.97, -0.15]}
        size={[2.1, 1.94, 0.72]}
        color={cabin.hull}
        radius={0.13}
      />
      <Block
        at={[0, 1, -0.15]}
        size={[1.89, 1.7, 0.78]}
        color={cabin.petrol}
        radius={0.08}
      />
      <group position={[-0.49, 1.07, 0.26]}>
        <Fasteners width={0.8} height={1.5} z={0.07} />
        {[0, 1, 2, 3].map((i) => (
          <group key={i} position={[0, 0.52 - i * 0.35, 0.03]}>
            <Block
              size={[0.7, 0.27, 0.13]}
              color={cabin.recess}
              radius={0.025}
            />
            <group
              ref={i === 2 ? tray : undefined}
              name={i === 2 ? 'archive-tray' : undefined}
            >
              <Block
                at={[0, 0, 0.09]}
                size={[0.59, 0.19, 0.3]}
                color={i === 2 ? cabin.orange : '#709590'}
                radius={0.02}
              />
              <Block
                at={[-0.1, 0, 0.25]}
                size={[0.22, 0.035, 0.025]}
                color={cabin.hull}
              />
              <Block
                at={[0.21, 0, 0.25]}
                size={[0.025, 0.08, 0.025]}
                color="#b1d6ba"
              />
            </group>
          </group>
        ))}
      </group>
      <InstrumentFace
        kind="archive"
        width={0.83}
        height={1.15}
        at={[0.48, 1.16, 0.252]}
      />
      <Block
        at={[0.49, 0.42, 0.29]}
        size={[0.6, 0.13, 0.1]}
        color={cabin.orange}
        radius={0.025}
      />
      <Block
        at={[0, 0.08, 0.05]}
        size={[2.25, 0.16, 1]}
        color={cabin.petrol}
        radius={0.08}
      />
      <Block
        at={[0, 1.96, -0.13]}
        size={[1.5, 0.035, 0.16]}
        color={cabin.light}
      />
    </group>
  );
}
export function MaintenanceTerminal({
  active,
  demo = 0,
  reduced = false,
}: DemoProps) {
  const phase = useMechanism(active, demo, reduced);
  const lever = useRef<THREE.Group>(null);
  const chassis = useRef<THREE.Group>(null);
  useFrame(() => {
    const response = active && !reduced ? Math.sin(phase.current * Math.PI) : 0;
    if (chassis.current) {
      chassis.current.position.y = response * 0.12;
      chassis.current.rotation.x = -response * 0.07;
    }
    if (lever.current)
      lever.current.rotation.x = active
        ? -0.95 * Math.sin(phase.current * Math.PI)
        : 0;
  });
  return (
    <group ref={chassis} name="project-noterm">
      <Block
        at={[0, 0.23, 0]}
        size={[2.15, 0.46, 1.5]}
        color={cabin.petrol}
        radius={0.13}
      />
      {[-1, 1].map((sign) => (
        <group key={sign}>
          <Block
            at={[sign * 1.02, 0.57, -0.12]}
            size={[0.16, 1.12, 0.9]}
            color={cabin.orange}
            radius={0.04}
          />
          <Block
            at={[sign * 1.03, 1.17, -0.1]}
            size={[0.18, 0.12, 0.6]}
            color={cabin.recess}
            radius={0.04}
          />
        </group>
      ))}
      <group position={[0, 0.83, -0.22]} rotation={[-0.23, 0, 0]}>
        <Block size={[1.8, 1.15, 0.23]} color={cabin.hull} radius={0.08} />
        <Block
          at={[0, 0, 0.125]}
          size={[1.58, 0.95, 0.035]}
          color={cabin.recess}
          radius={0.025}
        />
        <InstrumentFace
          kind="maintenance"
          width={1.45}
          height={0.82}
          at={[0, 0, 0.15]}
        />
        <Fasteners width={1.66} height={1.03} z={0.15} />
      </group>
      <Block
        at={[0, 0.49, 0.47]}
        size={[1.73, 0.12, 0.5]}
        color="#668d91"
        radius={0.05}
      />
      {[-0.61, -0.35, -0.09, 0.17].map((x, i) => (
        <Block
          key={x}
          at={[x, 0.57, 0.48]}
          size={[0.18, 0.07, 0.22]}
          color={i === 3 ? cabin.orange : cabin.hull}
          radius={0.02}
        />
      ))}
      <group ref={lever} name="terminal-lever" position={[0.67, 0.53, 0.43]}>
        <Block at={[0, 0.12, 0]} size={[0.08, 0.28, 0.08]} color={cabin.trim} />
        <Block
          at={[0, 0.28, 0]}
          size={[0.23, 0.1, 0.13]}
          color={cabin.orange}
        />
      </group>
      {Array.from({ length: 9 }, (_, i) => (
        <Block
          key={i}
          at={[-0.65 + i * 0.16, 0.21, 0.762]}
          size={[0.065, 0.14, 0.018]}
          color={cabin.recess}
          radius={0.005}
        />
      ))}
    </group>
  );
}

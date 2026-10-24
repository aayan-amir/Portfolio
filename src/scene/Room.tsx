import {
  Canvas,
  useFrame,
  useThree,
  type ThreeEvent,
} from '@react-three/fiber';
import { RoundedBox, ContactShadows, Html } from '@react-three/drei';
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import * as THREE from 'three';
import type { Section, ProjectId } from '../data/navigation';

type Props = {
  section: Section | null;
  project: ProjectId | null;
  reduced: boolean;
  reset: number;
  onSelect: (section: Section, project?: ProjectId) => void;
  onReady: () => void;
  onFailure: () => void;
};
const colors = {
  wall: '#e2dfd1',
  trim: '#bfc3b1',
  desk: '#b68c60',
  dark: '#34443f',
  green: '#71816e',
  orange: '#b9673c',
  metal: '#a5afa2',
  paper: '#e9e5d3',
};

function Box({
  at = [0, 0, 0],
  size = [1, 1, 1],
  color = colors.wall,
  radius = 0.03,
  rotation = [0, 0, 0],
  metal = 0,
  texture,
  children,
}: {
  at?: [number, number, number];
  size?: [number, number, number];
  color?: string;
  radius?: number;
  rotation?: [number, number, number];
  metal?: number;
  texture?: THREE.Texture;
  children?: ReactNode;
}) {
  return (
    <RoundedBox
      position={at}
      args={size}
      radius={radius}
      smoothness={2}
      rotation={rotation}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial
        color={color}
        map={texture}
        roughness={metal ? 0.4 : 0.78}
        metalness={metal}
      />
      {children}
    </RoundedBox>
  );
}
function RepeatedBoxes({
  positions,
  size,
  color,
}: {
  positions: [number, number, number][];
  size: [number, number, number];
  color: string;
}) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const { invalidate } = useThree();
  useLayoutEffect(() => {
    if (!mesh.current) return;
    const object = new THREE.Object3D();
    positions.forEach((point, index) => {
      object.position.set(...point);
      object.updateMatrix();
      mesh.current!.setMatrixAt(index, object.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
    mesh.current.computeBoundingSphere();
    invalidate();
  }, [positions]);
  return (
    <instancedMesh
      ref={mesh}
      args={[undefined, undefined, positions.length]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.8} />
    </instancedMesh>
  );
}
function Cylinder({
  at,
  args,
  color,
  rotation = [0, 0, 0],
}: {
  at: [number, number, number];
  args: [number, number, number, number?];
  color: string;
  rotation?: [number, number, number];
}) {
  return (
    <mesh position={at} rotation={rotation} castShadow receiveShadow>
      <cylinderGeometry args={args} />
      <meshStandardMaterial color={color} roughness={0.65} />
    </mesh>
  );
}
function useTexture(
  paint: (ctx: CanvasRenderingContext2D) => void,
  width = 1024,
  height = 640,
) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    paint(ctx);
    const result = new THREE.CanvasTexture(canvas);
    result.colorSpace = THREE.SRGBColorSpace;
    return result;
  }, []);
  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
}
function MonitorScreen() {
  const texture = useTexture((ctx) => {
    ctx.fillStyle = '#152f34';
    ctx.fillRect(0, 0, 1024, 640);
    ctx.fillStyle = '#e6e4cc';
    ctx.font = '500 52px sans-serif';
    ctx.fillText('NoClash', 60, 90);
    ctx.fillStyle = '#8eaaa3';
    ctx.font = '22px sans-serif';
    ctx.fillText('A little less timetable chaos.', 60, 132);
    const palette = ['#c99b75', '#8aa796', '#9ca9b6', '#c3b982'];
    ['MON', 'TUE', 'WED', 'THU', 'FRI'].forEach((day, i) => {
      ctx.fillStyle = '#8eaaa3';
      ctx.font = '18px sans-serif';
      ctx.fillText(day, 66 + i * 184, 205);
    });
    for (let i = 0; i < 5; i++)
      for (let j = 0; j < 4; j++) {
        ctx.fillStyle = '#203e41';
        ctx.fillRect(58 + i * 184, 225 + j * 83, 170, 72);
      }
    [
      [0, 0],
      [1, 2],
      [2, 1],
      [3, 3],
      [4, 0],
      [4, 2],
    ].forEach(([i, j], n) => {
      ctx.fillStyle = palette[n % 4];
      ctx.fillRect(58 + i * 184, 225 + j * 83, 170, 72);
      ctx.fillStyle = '#203335';
      ctx.font = '19px sans-serif';
      ctx.fillText(
        ['Systems', 'Design', 'Studio', 'Lab'][n % 4],
        70 + i * 184,
        267 + j * 83,
      );
    });
    ctx.fillStyle = '#8eaaa3';
    ctx.font = '17px sans-serif';
    ctx.fillText('REVIEW  /  PLAN  /  MAKE ROOM', 60, 610);
  });
  return (
    <mesh position={[0, 0.025, 0.086]}>
      <planeGeometry args={[1.77, 1.1]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}
function Window() {
  const sky = useTexture(
    (ctx) => {
      const grad = ctx.createRadialGradient(390, 500, 10, 512, 512, 700);
      grad.addColorStop(0, '#344d59');
      grad.addColorStop(1, '#0b1e30');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1024, 1024);
      let seed = 108;
      const rand = () => {
        seed = (seed * 16807) % 2147483647;
        return seed / 2147483647;
      };
      for (let i = 0; i < 160; i++) {
        ctx.fillStyle = `rgba(233,235,218,${rand() * 0.65 + 0.15})`;
        ctx.beginPath();
        ctx.arc(
          rand() * 1024,
          rand() * 1024,
          rand() * 1.8 + 0.5,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
      ctx.save();
      ctx.beginPath();
      ctx.arc(620, 740, 430, 0, Math.PI * 2);
      ctx.clip();
      const planet = ctx.createRadialGradient(420, 470, 20, 650, 800, 510);
      planet.addColorStop(0, '#9bc3c5');
      planet.addColorStop(0.38, '#538fa0');
      planet.addColorStop(0.8, '#224d65');
      planet.addColorStop(1, '#102334');
      ctx.fillStyle = planet;
      ctx.fillRect(0, 0, 1024, 1024);
      ctx.fillStyle = '#77958b';
      ctx.beginPath();
      ctx.moveTo(300, 440);
      ctx.bezierCurveTo(490, 390, 440, 550, 570, 520);
      ctx.bezierCurveTo(700, 480, 620, 620, 710, 670);
      ctx.lineTo(650, 730);
      ctx.lineTo(620, 650);
      ctx.lineTo(540, 660);
      ctx.lineTo(500, 570);
      ctx.lineTo(430, 610);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(680, 870);
      ctx.bezierCurveTo(720, 750, 800, 690, 830, 730);
      ctx.lineTo(950, 810);
      ctx.lineTo(920, 940);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(242,240,218,.43)';
      ctx.lineWidth = 15;
      for (let i = 0; i < 15; i++) {
        let x = rand() * 800 + 200,
          y = rand() * 550 + 400;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.bezierCurveTo(x + 40, y - 30, x + 90, y + 15, x + 140, y - 20);
        ctx.stroke();
      }
      ctx.restore();
      ctx.strokeStyle = 'rgba(166,215,221,.45)';
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.arc(620, 740, 433, 0, Math.PI * 2);
      ctx.stroke();
    },
    1024,
    1024,
  );
  return (
    <group position={[2.15, 3.48, -3.16]}>
      <mesh position={[0, 0, 0.015]}>
        <circleGeometry args={[1.54, 96]} />
        <meshBasicMaterial map={sky} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, 0.02]}>
        <torusGeometry args={[1.63, 0.13, 16, 96]} />
        <meshStandardMaterial
          color="#8d9b8e"
          roughness={0.5}
          metalness={0.35}
        />
      </mesh>
      <mesh position={[0, 0, 0.12]}>
        <torusGeometry args={[1.52, 0.035, 12, 96]} />
        <meshStandardMaterial
          color="#d3cdbb"
          metalness={0.35}
          roughness={0.45}
        />
      </mesh>
      <mesh position={[0, 0, 0.045]}>
        <torusGeometry args={[1.79, 0.055, 12, 96]} />
        <meshStandardMaterial color={colors.trim} roughness={0.7} />
      </mesh>
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * Math.PI) / 6;
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * 1.65, Math.sin(a) * 1.65, 0.16]}
          >
            <cylinderGeometry args={[0.036, 0.036, 0.04, 12]} />
            <meshStandardMaterial
              color="#4e615b"
              metalness={0.5}
              roughness={0.4}
            />
          </mesh>
        );
      })}
    </group>
  );
}
function Rocket({ active, reduced }: { active: boolean; reduced: boolean }) {
  const rocket = useRef<THREE.Group>(null);
  const { invalidate } = useThree();
  const progress = useRef(0);
  const started = useRef(0);
  useEffect(() => {
    started.current = performance.now();
    invalidate();
  }, [active, reduced]);
  useFrame((_, rawDelta) => {
    if (!rocket.current) return;
    const target = active ? 1 : 0;
    const delta = Math.min(rawDelta, 0.05);
    progress.current = reduced
      ? target
      : THREE.MathUtils.damp(progress.current, target, 5, delta);
    const p = progress.current;
    rocket.current.position.set(
      -1.65 + Math.sin(p * Math.PI * 0.6) * 0.55,
      1.85 + p * 1.32,
      0.2 - p * 0.35,
    );
    rocket.current.rotation.z = -p * 0.23;
    if (Math.abs(p - target) > 0.001) invalidate();
  });
  return (
    <>
      <Cylinder
        at={[-1.65, 1.48, 0.2]}
        args={[0.38, 0.43, 0.07, 48]}
        color="#6e7865"
      />
      <Cylinder
        at={[-1.65, 1.54, 0.2]}
        args={[0.28, 0.32, 0.06, 48]}
        color="#b5ac8a"
      />
      <group ref={rocket} position={[-1.65, 1.85, 0.2]}>
        <Cylinder
          at={[0, 0.22, 0]}
          args={[0.16, 0.16, 0.64, 40]}
          color="#e7e4d1"
        />
        <Cylinder
          at={[0, 0.07, 0]}
          args={[0.163, 0.163, 0.12, 40]}
          color={colors.orange}
        />
        <mesh position={[0, 0.68, 0]} castShadow>
          <coneGeometry args={[0.16, 0.3, 40]} />
          <meshStandardMaterial color="#647c72" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.38, 0.153]}>
          <sphereGeometry args={[0.075, 24, 16]} />
          <meshStandardMaterial
            color="#243b41"
            metalness={0.5}
            roughness={0.15}
          />
        </mesh>
        <mesh position={[0, 0.38, 0.17]}>
          <torusGeometry args={[0.073, 0.014, 10, 32]} />
          <meshStandardMaterial
            color="#bbab87"
            metalness={0.5}
            roughness={0.4}
          />
        </mesh>
        {[0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].map((a) => (
          <group rotation={[0, a, 0]} key={a}>
            <Box
              at={[0.19, -0.05, 0]}
              size={[0.11, 0.32, 0.08]}
              radius={0.015}
              color="#677e71"
              rotation={[0, 0, -0.4]}
            />
          </group>
        ))}
        <Cylinder
          at={[0, -0.15, 0]}
          args={[0.11, 0.14, 0.13, 32]}
          color="#6b6a5b"
        />
        {active && !reduced && (
          <mesh position={[0, -0.32, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.075, 0.22, 20]} />
            <meshBasicMaterial color="#e9bb73" />
          </mesh>
        )}
      </group>
    </>
  );
}
function RoomObjects({
  section,
  project,
  reduced,
  reset,
  onSelect,
  onReady,
  onFailure,
}: Props) {
  const { gl, camera, invalidate, size } = useThree();
  const wood = useTexture((ctx) => {
    ctx.fillStyle = '#ddd1b5';
    ctx.fillRect(0, 0, 1024, 640);
    for (let i = 0; i < 130; i++) {
      const y = i * 5;
      ctx.strokeStyle = `rgba(104,74,38,${0.035 + (i % 4) * 0.012})`;
      ctx.lineWidth = i % 3 === 0 ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x <= 1024; x += 32)
        ctx.lineTo(x, y + Math.sin(x * 0.009 + i) * 2.8);
      ctx.stroke();
    }
  });
  const [hover, setHover] = useState<string | null>(null);
  const pointer = useRef<{
    x: number;
    y: number;
    lastX: number;
    lastY: number;
    dragged: boolean;
  } | null>(null);
  const angles = useRef({ yaw: 0, pitch: 0 });
  const desired = useRef({ yaw: 0, pitch: 0 });
  const saved = useRef({ yaw: 0, pitch: 0 });
  const previousSection = useRef<Section | null>(null);
  const first = useRef(false);
  useEffect(() => {
    let second = 0;
    const frame = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => {
        gl.domElement.dataset.ready = 'true';
        gl.domElement.dataset.drawCalls = String(gl.info.render.calls);
        gl.domElement.dataset.triangles = String(gl.info.render.triangles);
        onReady();
      });
    });
    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(second);
    };
  }, []);
  useEffect(() => {
    const canvas = gl.domElement;
    const lost = (event: Event) => {
      event.preventDefault();
      onFailure();
    };
    canvas.addEventListener('webglcontextlost', lost);
    return () => canvas.removeEventListener('webglcontextlost', lost);
  }, [gl, onFailure]);
  useEffect(() => {
    const lens = camera as THREE.PerspectiveCamera;
    lens.fov =
      size.width < 600
        ? 78
        : import.meta.env.DEV &&
            new URLSearchParams(window.location.search).has('wide')
          ? 56
          : 48;
    lens.updateProjectionMatrix();
    first.current = false;
    invalidate();
  }, [size.width, size.height, camera]);
  useEffect(() => {
    angles.current = { yaw: 0, pitch: 0 };
    desired.current = { yaw: 0, pitch: 0 };
    saved.current = { yaw: 0, pitch: 0 };
    invalidate();
  }, [reset]);
  useEffect(() => {
    if (section && !previousSection.current)
      saved.current = { ...desired.current };
    if (!section && previousSection.current)
      desired.current = { ...saved.current };
    if (section)
      desired.current = {
        yaw: section === 'about' ? -0.12 : section === 'work' ? 0.07 : 0,
        pitch: 0,
      };
    previousSection.current = section;
    invalidate();
  }, [section, project]);
  useEffect(() => {
    const canvas = gl.domElement;
    const down = (e: PointerEvent) => {
      if (section) return;
      pointer.current = {
        x: e.clientX,
        y: e.clientY,
        lastX: e.clientX,
        lastY: e.clientY,
        dragged: false,
      };
    };
    const move = (e: PointerEvent) => {
      const p = pointer.current;
      if (!p || section) return;
      const distance = Math.hypot(e.clientX - p.x, e.clientY - p.y);
      if (distance > 6) p.dragged = true;
      if (p.dragged) {
        desired.current.yaw = THREE.MathUtils.clamp(
          desired.current.yaw - (e.clientX - p.lastX) * 0.0015,
          -0.32,
          0.32,
        );
        desired.current.pitch = THREE.MathUtils.clamp(
          desired.current.pitch + (e.clientY - p.lastY) * 0.0012,
          -0.13,
          0.13,
        );
        invalidate();
      }
      p.lastX = e.clientX;
      p.lastY = e.clientY;
    };
    const up = () => {
      window.setTimeout(() => {
        pointer.current = null;
      }, 0);
    };
    const cancel = () => {
      pointer.current = null;
    };
    canvas.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', cancel);
    return () => {
      canvas.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', cancel);
    };
  }, [gl, section]);
  useFrame((_, rawDelta) => {
    const a = angles.current,
      d = desired.current;
    const delta = Math.min(rawDelta, 0.05);
    const changing =
      Math.abs(a.yaw - d.yaw) + Math.abs(a.pitch - d.pitch) > 0.0001;
    if (changing || !first.current) {
      a.yaw = reduced ? d.yaw : THREE.MathUtils.damp(a.yaw, d.yaw, 6, delta);
      a.pitch = reduced
        ? d.pitch
        : THREE.MathUtils.damp(a.pitch, d.pitch, 6, delta);
      camera.rotation.set(
        (size.width < 600 ? 0.1 : -0.14) + a.pitch,
        a.yaw,
        0,
        'YXZ',
      );
      first.current = true;
      if (changing) invalidate();
    }
  });
  function selectable(id: string, target: Section, projectId?: ProjectId) {
    return {
      onPointerOver: (e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        if (!section) {
          setHover(id);
          gl.domElement.style.cursor = 'pointer';
        }
      },
      onPointerOut: () => {
        setHover(null);
        gl.domElement.style.cursor = 'grab';
      },
      onClick: (e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        if (pointer.current?.dragged || section) return;
        setHover(null);
        gl.domElement.style.cursor = 'grab';
        onSelect(target, projectId);
      },
    };
  }
  return (
    <>
      <color attach="background" args={['#dedbce']} />
      <fog attach="fog" args={['#dedbce', 15, 28]} />
      <hemisphereLight args={['#edf2e0', '#9f8c6c', 1.6]} />
      <directionalLight
        position={[-3, 7, 5]}
        intensity={2.6}
        color="#fff0d2"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-6}
        shadow-radius={4}
        shadow-normalBias={0.025}
        shadow-bias={-0.0001}
      />
      <directionalLight position={[4, 4, -2]} intensity={1.3} color="#b8dae3" />
      <pointLight
        position={[-0.8, 3, 0.1]}
        intensity={8}
        color="#ffd599"
        distance={4}
        decay={2}
      />
      <Box
        at={[0, -0.12, 0]}
        size={[15, 0.2, 13]}
        color="#bbb19a"
        radius={0.02}
      />
      <RepeatedBoxes
        positions={Array.from(
          { length: 17 },
          (_, i) => [-7 + i * 0.85, -0.005, 0] as [number, number, number],
        )}
        size={[0.008, 0.006, 13]}
        color="#a79c85"
      />

      <Box at={[0, 3, -3.42]} size={[15, 6, 0.35]} color={colors.wall} />
      <Box at={[-5.5, 3, 0]} size={[0.25, 6, 7]} color="#cccbbb" />
      <Box at={[0, 0.13, -3.1]} size={[13, 0.24, 0.18]} color="#8d9988" />
      {[-4.8, -0.3, 4.7].map((x) => (
        <Box
          key={x}
          at={[x, 3, -3.2]}
          size={[0.028, 5.7, 0.03]}
          color="#b7bcaa"
          radius={0.003}
        />
      ))}
      <Box at={[0, 5.4, -3.15]} size={[12, 0.035, 0.06]} color="#d3c5a3" />
      <Window />
      {/* Desk: quiet, substantial, and rounded at the touch points. */}
      <Box
        at={[0.6, 1.36, -0.15]}
        size={[6.65, 0.19, 2.1]}
        color={colors.desk}
        texture={wood}
        radius={0.075}
      />
      <Box
        at={[0.6, 1.25, -0.15]}
        size={[6.4, 0.08, 1.95]}
        color="#806b4f"
        radius={0.03}
      />
      {[-2.25, 3.45].map((x) => (
        <group key={x}>
          <Box
            at={[x, 0.63, -0.25]}
            size={[0.18, 1.24, 1.6]}
            color={colors.green}
            radius={0.045}
          />
          <Box
            at={[x, 0.1, -0.25]}
            size={[0.7, 0.1, 1.8]}
            color="#5b6e60"
            radius={0.04}
          />
        </group>
      ))}
      <Box
        at={[2.5, 0.87, -0.35]}
        size={[1.2, 0.7, 1.4]}
        color="#9ba58c"
        radius={0.05}
      />
      {[0.7, 0.94].map((y) => (
        <group key={y}>
          <Box
            at={[2.5, y, 0.375]}
            size={[1.08, 0.015, 0.018]}
            color="#697b67"
            radius={0.002}
          />
          <Box
            at={[2.5, y + 0.1, 0.4]}
            size={[0.24, 0.04, 0.045]}
            color="#626e5b"
          />
        </group>
      ))}
      {/* Monitor / NoClash */}
      <group
        position={[0.4, 2.22, -0.52]}
        rotation={[-0.05, -0.08, 0]}
        {...selectable('monitor', 'work', 'noclash')}
      >
        <Box
          size={[2.04, 1.4, 0.17]}
          color={hover === 'monitor' ? '#596d60' : '#3d4e45'}
          radius={0.085}
        />
        <MonitorScreen />
        <Box at={[0, -0.8, -0.04]} size={[0.12, 0.3, 0.14]} color="#6b7b69" />
        <Box at={[0, -0.94, 0.04]} size={[0.75, 0.055, 0.45]} color="#7b8771" />
        <mesh position={[0.88, -0.6, 0.1]}>
          <sphereGeometry args={[0.015, 12, 8]} />
          <meshBasicMaterial color="#bcce95" />
        </mesh>
      </group>
      <Box
        at={[0.4, 1.49, 0.57]}
        size={[1.55, 0.045, 0.46]}
        color="#d5d2bb"
        radius={0.03}
      />
      <RepeatedBoxes
        positions={Array.from(
          { length: 52 },
          (_, i) =>
            [
              -0.29 + (i % 13) * 0.112,
              1.518,
              0.42 + Math.floor(i / 13) * 0.095,
            ] as [number, number, number],
        )}
        size={[0.085, 0.012, 0.067]}
        color="#e7e3cf"
      />

      <Box
        at={[1.55, 1.48, 0.48]}
        size={[0.33, 0.08, 0.45]}
        color="#d1d0b8"
        radius={0.08}
      />
      <group {...selectable('rocket', 'about')}>
        <Rocket active={section === 'about'} reduced={reduced} />
        <mesh position={[-1.5, 2, 0.2]} visible={false}>
          <boxGeometry args={[1, 2, 1]} />
          <meshBasicMaterial />
        </mesh>
      </group>
      {/* A simple lamp with an articulated arm and warm practical light. */}
      <group position={[-0.9, 1.47, -0.8]}>
        <Cylinder
          at={[0, 0.03, 0]}
          args={[0.27, 0.3, 0.06, 40]}
          color="#7b8569"
        />
        <Box
          at={[-0.05, 0.54, 0]}
          size={[0.045, 1.05, 0.055]}
          rotation={[0, 0, -0.18]}
          color="#65765e"
          radius={0.015}
        />
        <Box
          at={[0.1, 1.12, 0]}
          size={[0.045, 0.4, 0.055]}
          rotation={[0, 0, -0.7]}
          color="#65765e"
          radius={0.015}
        />
        <mesh position={[0.23, 1.28, 0.02]} rotation={[0, 0, -0.25]} castShadow>
          <coneGeometry args={[0.32, 0.35, 40, 1, true]} />
          <meshStandardMaterial
            color="#75826a"
            side={THREE.DoubleSide}
            roughness={0.7}
          />
        </mesh>
        <mesh position={[0.23, 1.12, 0.02]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.285, 32]} />
          <meshBasicMaterial color="#f5d599" />
        </mesh>
      </group>
      {/* In-house work */}
      <group
        position={[2, 1.49, 0.55]}
        rotation={[0, -0.3, 0]}
        {...selectable('scanner', 'work', 'inventory')}
      >
        <Box size={[0.28, 0.13, 0.43]} color="#5f7769" radius={0.04} />
        <Box
          at={[0, 0.15, -0.04]}
          size={[0.25, 0.2, 0.2]}
          color={hover === 'scanner' ? '#b78a5c' : '#a8ac92'}
          rotation={[-0.3, 0, 0]}
          radius={0.04}
        />
        <Box
          at={[0, 0.17, 0.07]}
          size={[0.17, 0.07, 0.025]}
          color="#213b39"
          radius={0.01}
        />
      </group>
      <group
        position={[2.35, 1.5, -0.8]}
        rotation={[0, 0.1, 0]}
        {...selectable('records', 'work', 'outreach')}
      >
        <Box size={[0.62, 0.14, 0.48]} color="#c7bda2" />
        <Box
          at={[0, 0.23, -0.12]}
          size={[0.56, 0.4, 0.06]}
          color="#73816c"
          rotation={[-0.2, 0, 0]}
        />
        <Box
          at={[0, 0.23, -0.08]}
          size={[0.44, 0.26, 0.015]}
          color={hover === 'records' ? '#b5b99b' : '#b1b6a1'}
          rotation={[-0.2, 0, 0]}
        />
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            at={[-0.08, 0.29 - i * 0.065, -0.035]}
            size={[0.2, 0.012, 0.01]}
            color="#667764"
            radius={0.002}
          />
        ))}
      </group>
      <group
        position={[-2.45, 1.49, 0.2]}
        rotation={[0, 0.2, 0]}
        {...selectable('book', 'experience')}
      >
        <Box
          size={[0.55, 0.09, 0.75]}
          color={hover === 'book' ? '#a56b46' : '#8d5339'}
          radius={0.025}
        />
        <Box
          at={[0, 0.015, 0.01]}
          size={[0.51, 0.07, 0.68]}
          color="#dad0ae"
          radius={0.01}
        />
        <Box
          at={[0, 0.06, 0]}
          size={[0.55, 0.015, 0.75]}
          color="#9e6747"
          radius={0.01}
        />
        <Box
          at={[0.19, 0.075, 0]}
          size={[0.018, 0.01, 0.74]}
          color="#c8b77c"
          radius={0.002}
        />
      </group>
      {/* A radio for getting in touch. */}
      <group
        position={[-2.33, 1.75, -0.85]}
        rotation={[0, 0.3, 0]}
        {...selectable('radio', 'contact')}
      >
        <Box size={[0.85, 0.58, 0.35]} color="#b9b39b" radius={0.06} />
        <Box
          at={[-0.15, 0.03, 0.185]}
          size={[0.36, 0.34, 0.015]}
          color="#67745e"
          radius={0.025}
        />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Box
            key={i}
            at={[-0.15, -0.1 + i * 0.05, 0.2]}
            size={[0.3, 0.012, 0.01]}
            color="#394b3e"
            radius={0.002}
          />
        ))}
        <Cylinder
          at={[0.23, -0.12, 0.21]}
          args={[0.08, 0.08, 0.06, 24]}
          rotation={[Math.PI / 2, 0, 0]}
          color="#66755f"
        />
        <Box
          at={[0.2, 0.12, 0.19]}
          size={[0.22, 0.08, 0.015]}
          color={hover === 'radio' ? '#e0be7e' : '#8d9a7c'}
          radius={0.01}
        />
        <Box
          at={[0.25, 0.55, -0.1]}
          size={[0.012, 0.55, 0.012]}
          color="#8a9887"
          radius={0.004}
          rotation={[0, 0, -0.15]}
        />
      </group>
      {/* Shelf and personal curiosities. */}
      <Box
        at={[-3.55, 2.85, -2.65]}
        size={[2.4, 0.09, 0.8]}
        color="#ae8d67"
        radius={0.035}
      />
      <Box
        at={[-3.55, 4, -2.65]}
        size={[2.4, 0.09, 0.8]}
        color="#ae8d67"
        radius={0.035}
      />
      {[-4.4, -2.7].map((x) => (
        <Box
          key={x}
          at={[x, 3.4, -2.96]}
          size={[0.045, 1.6, 0.08]}
          color="#788874"
          radius={0.015}
        />
      ))}
      <group position={[-3.4, 4.13, -2.6]} rotation={[0, 0.3, 0]}>
        <Box size={[0.7, 0.07, 0.11]} color="#dfdfc9" radius={0.035} />
        <Box
          size={[0.2, 0.035, 0.7]}
          color="#9aa99b"
          radius={0.02}
          rotation={[0, 0.15, 0]}
        />
        <Box
          at={[-0.28, 0.08, 0]}
          size={[0.12, 0.16, 0.035]}
          color="#a5b09c"
          radius={0.015}
        />
      </group>
      {Array.from({ length: 5 }, (_, i) => (
        <Box
          key={i}
          at={[-4.2 + i * 0.19, 3.13, -2.65]}
          size={[0.14, 0.48 + (i % 3) * 0.07, 0.34]}
          color={['#6b7c6b', '#b3a584', '#c3b59c', '#936951', '#788d8b'][i]}
          rotation={[0, 0, i === 4 ? -0.13 : 0]}
          radius={0.014}
        />
      ))}
      <group position={[-2.8, 2.96, -2.65]}>
        <Box size={[0.44, 0.1, 0.24]} color="#495f56" radius={0.09} />
        <mesh position={[-0.11, 0.07, 0.06]}>
          <sphereGeometry args={[0.035, 12, 8]} />
          <meshStandardMaterial color="#c5c5a9" />
        </mesh>
        <mesh position={[0.11, 0.07, 0.06]}>
          <sphereGeometry args={[0.035, 12, 8]} />
          <meshStandardMaterial color="#b97c52" />
        </mesh>
      </group>
      {/* Framed star chart */}
      <group position={[-1.2, 3.9, -3.17]}>
        <Box size={[0.95, 1.15, 0.06]} color="#77856e" radius={0.015} />
        <Box
          at={[0, 0, 0.04]}
          size={[0.82, 1.02, 0.015]}
          color="#d3d1b8"
          radius={0.003}
        />
        {Array.from({ length: 8 }, (_, i) => {
          const x = Math.sin(i * 3.7) * 0.3,
            y = Math.cos(i * 2.2) * 0.36;
          return (
            <mesh key={i} position={[x, y, 0.06]}>
              <sphereGeometry args={[0.018, 8, 8]} />
              <meshBasicMaterial color="#607764" />
            </mesh>
          );
        })}
        <mesh position={[0, 0, 0.06]}>
          <torusGeometry args={[0.28, 0.004, 6, 64]} />
          <meshBasicMaterial color="#8c997b" />
        </mesh>
      </group>
      {/* Cup, plant, and a generous empty patch of desk. */}
      <group position={[1.55, 1.56, -1.03]}>
        <Cylinder
          at={[0, 0.09, 0]}
          args={[0.13, 0.11, 0.22, 32]}
          color="#d7cfb2"
        />
        <Cylinder
          at={[0, 0.205, 0]}
          args={[0.115, 0.115, 0.007, 32]}
          color="#624d37"
        />
        <mesh position={[0.14, 0.09, 0]}>
          <torusGeometry args={[0.09, 0.025, 12, 24]} />
          <meshStandardMaterial color="#d7cfb2" />
        </mesh>
      </group>
      <group position={[3.35, 1.48, -0.77]}>
        <Cylinder
          at={[0, 0.16, 0]}
          args={[0.18, 0.13, 0.32, 32]}
          color="#b47b57"
        />
        {Array.from({ length: 6 }, (_, i) => (
          <group rotation={[0, i * 2.4, 0]} key={i}>
            <mesh
              position={[0.08, 0.53, 0]}
              rotation={[0, 0, -0.4]}
              scale={[0.09, 0.29, 0.045]}
              castShadow
            >
              <sphereGeometry args={[1, 16, 12]} />
              <meshStandardMaterial
                color={i % 2 ? '#738561' : '#596f53'}
                roughness={0.9}
              />
            </mesh>
          </group>
        ))}
      </group>
      {/* Seat grounds the camera in a lived-in workspace. */}
      <group position={[0.5, 0, 1.7]} rotation={[0, -0.15, 0]}>
        <Cylinder
          at={[0, 0.69, 0]}
          args={[0.47, 0.44, 0.13, 48]}
          color="#778772"
        />
        <Box
          at={[0, 1.13, 0.27]}
          size={[0.88, 0.72, 0.12]}
          color="#7a8870"
          radius={0.09}
          rotation={[-0.12, 0, 0]}
        />
        {[-0.32, 0.32].map((x) => (
          <Box
            key={x}
            at={[x, 0.33, 0]}
            size={[0.055, 0.65, 0.055]}
            color="#566b5c"
            radius={0.015}
          />
        ))}
        <Box
          at={[0, 0.14, 0]}
          size={[0.9, 0.055, 0.75]}
          color="#61725f"
          radius={0.025}
        />
      </group>
      {hover && !section && (
        <Html
          position={
            hover === 'rocket'
              ? [-1.65, 2.9, 0.2]
              : hover === 'monitor'
                ? [0.4, 3.2, -0.5]
                : hover === 'scanner'
                  ? [2, 2.1, 0.55]
                  : hover === 'book'
                    ? [-2.45, 1.9, 0.2]
                    : hover === 'radio'
                      ? [-2.33, 2.4, -0.85]
                      : [2.35, 2.2, -0.8]
          }
          center
          zIndexRange={[5, 4]}
          style={{ pointerEvents: 'none' }}
        >
          <span className="object-label">
            {
              {
                rocket: 'Meet Aayan',
                monitor: 'Explore NoClash',
                scanner: 'Inventory tools',
                book: 'My approach',
                radio: 'Get in touch',
                records: 'Outreach records',
              }[hover]
            }{' '}
            <b>↗</b>
          </span>
        </Html>
      )}
      <ContactShadows
        position={[0, 0.012, 0]}
        opacity={0.22}
        scale={16}
        blur={2.4}
        far={4}
        frames={1}
        resolution={512}
        color="#51442f"
      />
    </>
  );
}
export default function Room(props: Props) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const change = () => setVisible(!document.hidden);
    document.addEventListener('visibilitychange', change);
    return () => document.removeEventListener('visibilitychange', change);
  }, []);
  return (
    <div
      className="room-canvas"
      data-scene="interactive"
      aria-label="Interactive orbital workshop. Drag to look around; select the rocket, monitor, notebook, or radio. Equivalent controls are in the navigation."
    >
      <Canvas
        shadows={{ type: THREE.PCFShadowMap }}
        dpr={[1, 1.5]}
        frameloop={visible ? 'demand' : 'never'}
        camera={{ position: [0, 3.15, 8.4], fov: 48, near: 0.1, far: 40 }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
        }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.12;
          gl.domElement.style.cursor = 'grab';
        }}
      >
        <RoomObjects {...props} />
      </Canvas>
    </div>
  );
}

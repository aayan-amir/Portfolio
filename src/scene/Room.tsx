import {
  Canvas,
  addAfterEffect,
  useFrame,
  useThree,
  type ThreeEvent,
} from '@react-three/fiber';
import { Environment, Lightformer, ContactShadows } from '@react-three/drei';
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import * as THREE from 'three';
import { CelestialBackdrop } from './Observatory';
import { CabinShell } from './CabinShell';
import { WallDecor } from './WallDecor';
import {
  IntegratedWorkbench,
  ReadingNook,
  Notebook,
  ResumeFolio,
  ContactRadio,
  PersonalDetails,
} from './Workbench';
import {
  NavigationPlanner,
  ResourceArchive,
  MaintenanceTerminal,
} from './ProjectObjects';
import { useAnchoredCamera } from './useAnchoredCamera';
import { CabinLife } from './CabinLife';
import { PlanetTreatment } from './PlanetTreatment';
import { resume, downloadResume } from '../data/resume';
import type { BodyId } from '../data/celestial';
import type { ProjectId, Section } from '../data/navigation';
type Props = {
  section: Section | null;
  project: ProjectId | null;
  activeProject: ProjectId | null;
  demo: number;
  body: BodyId;
  reduced: boolean;
  lowEffects: boolean;
  frozen: boolean;
  reset: number;
  look: number;
  labelBottom: number | null;
  onSelect: (section: Section, project?: ProjectId) => void;
  onReady: () => void;
  onFailure: () => void;
};
type Point = [number, number, number];
type LabelNodes = RefObject<
  Record<string, HTMLButtonElement | HTMLAnchorElement | null>
>;
const labels = [
  {
    id: 'noclash',
    title: 'NoClash',
    detail: 'Timetable planning',
    section: 'work',
    project: 'noclash',
  },
  {
    id: 'student-portal',
    title: 'Student Portal',
    detail: 'Shared classroom resources',
    section: 'work',
    project: 'student-portal',
  },
  {
    id: 'noterm',
    title: 'NoTerm',
    detail: 'Linux, made approachable',
    section: 'work',
    project: 'noterm',
  },
  {
    id: 'career',
    title: 'About & experience',
    detail: 'The person behind the work',
    section: 'experience',
  },
  {
    id: 'resume',
    title: 'Download résumé',
    detail: 'PDF · Aayan Amir',
    section: 'contact',
  },
  {
    id: 'contact',
    title: 'Contact',
    detail: 'Start a conversation',
    section: 'contact',
  },
] as const;
function RoomObject({
  id,
  labelNodes,
  labelBottom,
  at,
  scale = 1,
  rotation = 0,
  labelAt = [0, -0.12, 1],
  onActivate,
  canSelect,
  motion,
  dragged,
  children,
}: {
  id: string;
  labelNodes: LabelNodes;
  labelBottom: number | null;
  at: Point;
  scale?: number;
  rotation?: number;
  labelAt?: Point;
  onActivate: () => void;
  canSelect: boolean;
  motion: boolean;
  dragged: () => boolean;
  children: ReactNode;
}) {
  const anchor = useRef<THREE.Group>(null);
  const projected = useRef(new THREE.Vector3());
  const group = useRef<THREE.Group>(null);
  const [hover, setHover] = useState(false);
  const { gl, invalidate, camera, size } = useThree();
  const activate = () => {
    if (canSelect && !dragged()) onActivate();
  };
  useFrame((_, dt) => {
    const node = labelNodes.current[id];
    if (node && anchor.current) {
      anchor.current.updateWorldMatrix(true, false);
      projected.current
        .set(...labelAt)
        .applyMatrix4(anchor.current.matrixWorld)
        .project(camera);
      const point = projected.current;
      const x = (point.x * 0.5 + 0.5) * size.width,
        rawY = (-point.y * 0.5 + 0.5) * size.height,
        y = labelBottom === null ? rawY : Math.min(rawY, labelBottom);
      const visible =
        point.z < 1 &&
        point.z > -1 &&
        x > 64 &&
        x < size.width - 64 &&
        y > 100 &&
        y < size.height - 105;
      node.style.visibility = visible ? 'visible' : 'hidden';
      node.style.transform = `translate(${x}px,${y}px) translate(-50%,-50%)`;
      node.tabIndex = visible && canSelect ? 0 : -1;
    }
    if (!group.current) return;
    const target = hover && canSelect && motion ? 0.055 : 0;
    const old = group.current.position.y;
    group.current.position.y = THREE.MathUtils.damp(
      old,
      target,
      10,
      Math.min(dt, 0.05),
    );
    if (Math.abs(old - target) > 0.0001) invalidate();
  });
  return (
    <group ref={anchor} position={at} rotation={[0, rotation, 0]} scale={scale}>
      <group
        ref={group}
        onPointerOver={(e) => {
          e.stopPropagation();
          if (canSelect) {
            setHover(true);
            gl.domElement.style.cursor = 'pointer';
          }
        }}
        onPointerOut={() => {
          setHover(false);
          gl.domElement.style.cursor = 'grab';
        }}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          activate();
        }}
      >
        {children}
        <mesh position={[0, 0.4, 0]} visible={false}>
          <boxGeometry args={[2.5, 1.7, 1.5]} />
          <meshBasicMaterial />
        </mesh>
      </group>
    </group>
  );
}
function Scene(props: Props & { labelNodes: LabelNodes }) {
  const { gl, invalidate } = useThree();
  const pointer = useAnchoredCamera(
    props.section,
    props.project,
    props.reduced,
    props.reset,
    props.frozen,
    props.look,
  );
  const frames = useRef(0);
  useEffect(() => {
    const canvas = gl.domElement;
    canvas.tabIndex = 0;
    canvas.setAttribute(
      'aria-label',
      'Engineering cabin. Drag or use arrow keys to look. Select a labeled object to read about a project, career, resume or contact.',
    );
    const lost = (e: Event) => {
      e.preventDefault();
      props.onFailure();
    };
    canvas.addEventListener('webglcontextlost', lost);
    return () => canvas.removeEventListener('webglcontextlost', lost);
  }, [gl, props.onFailure]);
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      gl.domElement.dataset.ready = 'true';
      props.onReady();
    });
    return () => cancelAnimationFrame(id);
  }, []);
  useEffect(() => {
    invalidate();
  }, [props.body, props.section]);
  useFrame(() => {
    gl.domElement.dataset.frames = String(++frames.current);
    gl.domElement.dataset.activeProject = props.activeProject ?? '';
    gl.domElement.dataset.roomObjects =
      'noclash,student-portal,noterm,career,resume,contact';
  });
  useEffect(() => {
    const previous = gl.info.autoReset;
    gl.info.autoReset = false;
    const unsubscribe = addAfterEffect(() => {
      gl.domElement.dataset.drawCalls = String(gl.info.render.calls);
      gl.domElement.dataset.triangles = String(gl.info.render.triangles);
      gl.domElement.dataset.geometries = String(gl.info.memory.geometries);
      gl.domElement.dataset.textures = String(gl.info.memory.textures);
    });
    return () => {
      unsubscribe();
      gl.info.autoReset = previous;
    };
  }, [gl]);
  useFrame(() => gl.info.reset(), -100);
  const available = !props.section;
  const dragged = () => !!pointer.current?.dragged;
  return (
    <>
      <color attach="background" args={['#07121c']} />
      <hemisphereLight args={['#e3eee9', '#34505b', 0.85]} />
      <directionalLight
        position={[-4, 7, 6]}
        intensity={1.1}
        color="#ffedcf"
        castShadow={false}
        shadow-mapSize={props.lowEffects ? [512, 512] : [1024, 1024]}
        shadow-camera-left={-9}
        shadow-camera-right={9}
        shadow-camera-top={9}
        shadow-camera-bottom={-7}
        shadow-normalBias={0.035}
      />
      <directionalLight
        position={[6, 5, -5]}
        intensity={0.55}
        color="#c2d7d3"
      />
      <Environment resolution={128} frames={1}>
        <Lightformer
          intensity={1.7}
          color="#d6e6e5"
          position={[0, 6, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[12, 8, 1]}
        />
        <Lightformer
          intensity={1}
          color="#e6c6a1"
          position={[-7, 2, 4]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[5, 4, 1]}
        />
      </Environment>
      <CelestialBackdrop
        body={props.body}
        reduced={props.reduced || props.frozen || !!props.section}
        lowEffects={props.lowEffects}
      />
      <CabinLife paused={props.reduced || props.frozen || !!props.section} />
      <CabinShell body={props.body} />
      <PlanetTreatment body={props.body} lowEffects={props.lowEffects} />
      <IntegratedWorkbench />
      <ReadingNook />
      <PersonalDetails />
      <WallDecor />
      <ContactShadows
        position={[0, 0.018, 0]}
        frames={1}
        opacity={0.3}
        scale={16}
        blur={2.4}
        far={4}
        resolution={256}
        color="#594132"
      />
      <RoomObject
        labelNodes={props.labelNodes}
        labelBottom={props.labelBottom}
        id="noclash"
        at={[-0.8, 1.35, 0.35]}
        scale={1.03}
        rotation={0.24}
        labelAt={[0, -0.1, 1.25]}
        motion={!props.reduced && !props.frozen}
        canSelect={available}
        dragged={dragged}
        onActivate={() => props.onSelect('work', 'noclash')}
      >
        <NavigationPlanner
          active={props.activeProject === 'noclash'}
          demo={props.demo}
          reduced={props.reduced || props.frozen || !!props.section}
        />
      </RoomObject>
      <RoomObject
        labelNodes={props.labelNodes}
        labelBottom={props.labelBottom}
        id="student-portal"
        at={[-4.12, 1.42, -2.85]}
        scale={1.06}
        rotation={0.43}
        labelAt={[0, -0.1, 1.05]}
        motion={!props.reduced && !props.frozen}
        canSelect={available}
        dragged={dragged}
        onActivate={() => props.onSelect('work', 'student-portal')}
      >
        <ResourceArchive
          active={props.activeProject === 'student-portal'}
          demo={props.demo}
          reduced={props.reduced || props.frozen || !!props.section}
        />
      </RoomObject>
      <RoomObject
        labelNodes={props.labelNodes}
        labelBottom={props.labelBottom}
        id="noterm"
        at={[3.7, 1.255, 0.65]}
        scale={0.98}
        rotation={-0.43}
        labelAt={[0, -0.12, 1.25]}
        motion={!props.reduced && !props.frozen}
        canSelect={available}
        dragged={dragged}
        onActivate={() => props.onSelect('work', 'noterm')}
      >
        <MaintenanceTerminal
          active={props.activeProject === 'noterm'}
          demo={props.demo}
          reduced={props.reduced || props.frozen || !!props.section}
        />
      </RoomObject>
      <RoomObject
        labelNodes={props.labelNodes}
        labelBottom={props.labelBottom}
        id="career"
        at={[-4.05, 1.14, 0.8]}
        scale={0.9}
        rotation={0.28}
        labelAt={[0, -0.16, 0.82]}
        motion={!props.reduced && !props.frozen}
        canSelect={available}
        dragged={dragged}
        onActivate={() => props.onSelect('experience')}
      >
        <Notebook />
      </RoomObject>
      <RoomObject
        labelNodes={props.labelNodes}
        labelBottom={props.labelBottom}
        id="resume"
        at={[5.9, 1.46, 1.25]}
        scale={0.85}
        rotation={-0.2}
        labelAt={[0, -0.12, 0.83]}
        motion={!props.reduced && !props.frozen}
        canSelect={available}
        dragged={dragged}
        onActivate={downloadResume}
      >
        <ResumeFolio />
      </RoomObject>
      <RoomObject
        labelNodes={props.labelNodes}
        labelBottom={props.labelBottom}
        id="contact"
        at={[6.1, 1.46, 0.3]}
        scale={0.9}
        labelAt={[0, 0.65, 0.35]}
        motion={!props.reduced && !props.frozen}
        canSelect={available}
        dragged={dragged}
        onActivate={() => props.onSelect('contact')}
      >
        <ContactRadio />
      </RoomObject>
    </>
  );
}
export default function Room(props: Props) {
  const [visible, setVisible] = useState(true);
  const labelNodes = useRef<
    Record<string, HTMLButtonElement | HTMLAnchorElement | null>
  >({});
  useEffect(() => {
    const change = () => setVisible(!document.hidden);
    document.addEventListener('visibilitychange', change);
    return () => document.removeEventListener('visibilitychange', change);
  }, []);
  return (
    <div className="room-canvas" data-scene="engineering-cabin">
      <Canvas
        shadows={{ type: THREE.PCFShadowMap }}
        dpr={props.lowEffects ? 1 : [1, 1.5]}
        frameloop={visible ? 'demand' : 'never'}
        camera={{ position: [0.25, 3.1, 8.4], fov: 49, near: 0.1, far: 180 }}
        gl={{ antialias: true, alpha: false }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
          gl.domElement.style.cursor = 'grab';
        }}
      >
        <Scene {...props} labelNodes={labelNodes} />
      </Canvas>
      <div className="room-label-layer">
        {labels.map((label) =>
          label.id === 'resume' ? (
            <a
              key={label.id}
              ref={(node) => {
                labelNodes.current[label.id] = node;
              }}
              className="scene-label"
              data-object={label.id}
              style={{ visibility: 'hidden' }}
              href={resume.url}
              download={resume.filename}
              onPointerDown={(event) => event.stopPropagation()}
              tabIndex={props.section ? -1 : 0}
            >
              <span>
                {label.title}
                <b>↓</b>
              </span>
              <small>{label.detail}</small>
            </a>
          ) : (
            <button
              key={label.id}
              ref={(node) => {
                labelNodes.current[label.id] = node;
              }}
              className="scene-label"
              data-object={label.id}
              style={{ visibility: 'hidden' }}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() =>
                props.onSelect(
                  label.section,
                  'project' in label ? label.project : undefined,
                )
              }
              tabIndex={props.section ? -1 : 0}
            >
              <span>
                {label.title}
                <b>↗</b>
              </span>
              <small>{label.detail}</small>
            </button>
          ),
        )}
      </div>
    </div>
  );
}

import { Canvas, useThree, useFrame, addAfterEffect } from '@react-three/fiber';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from 'react';
import * as THREE from 'three';
import { Environment, Lightformer } from '@react-three/drei';
import { BakeEnvironment } from './BakeEnvironment';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import assetUrl from '../assets/orbital-workbench.croom?url';
import { validateStaticCabin } from './staticCabinAsset';
import { useAnchoredCamera } from './useAnchoredCamera';
import { usePreparedRenderer } from './usePreparedRenderer';
import { CabinEnvironment } from './CabinEnvironment';
import { CelestialBackdrop } from './Observatory';
import { PlanetTreatment } from './PlanetTreatment';
import { Arrival } from './Environment';
import { projectPresentation } from '../data/projectPresentation';
import { mechanismPose } from './workbenchMotion';
import { downloadResume } from '../data/resume';
import type { Props } from './Room';
import type { ProjectId } from '../data/navigation';

type ItemId = ProjectId | 'career' | 'resume' | 'contact';
type Models = Record<ItemId, THREE.Object3D>;
type LabelNodes = RefObject<Record<string, HTMLButtonElement | null>>;
function release(roots: THREE.Object3D[]) {
  const geometries = new Set<THREE.BufferGeometry>(),
    materials = new Set<THREE.Material>(),
    textures = new Set<THREE.Texture>();
  roots.forEach((root) =>
    root.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        geometries.add(object.geometry);
        for (const m of Array.isArray(object.material)
          ? object.material
          : [object.material]) {
          materials.add(m);
          for (const t of Object.values(m))
            if (t instanceof THREE.Texture) textures.add(t);
        }
      }
    }),
  );
  geometries.forEach((v) => v.dispose());
  materials.forEach((v) => v.dispose());
  textures.forEach((v) => {
    if (typeof ImageBitmap !== 'undefined' && v.image instanceof ImageBitmap)
      v.image.close();
    v.dispose();
  });
}
function StudioAsset({
  onReady,
  onFailure,
}: {
  onReady: (scene: THREE.Group, models: Models) => void;
  onFailure: () => void;
}) {
  const callbacks = useRef({ onReady, onFailure });
  callbacks.current = { onReady, onFailure };
  useEffect(() => {
    const abort = new AbortController();
    let owned: THREE.Group | null = null;
    let detached: THREE.Object3D[] = [];
    void (async () => {
      performance.mark('workbench-download-start');
      const lit =
        import.meta.env.DEV &&
        new URLSearchParams(location.search).has('litStudio');
      const source = lit
        ? (await import('../assets/orbital-workbench-lit.croom?url')).default
        : assetUrl;
      const response = await fetch(source, {
        signal: abort.signal,
      });
      if (!response.ok) throw Error('Workbench unavailable');
      let bytes = await response.arrayBuffer();
      if (new Uint8Array(bytes)[0] === 31)
        bytes = await new Response(
          new Blob([bytes])
            .stream()
            .pipeThrough(new DecompressionStream('gzip')),
        ).arrayBuffer();
      validateStaticCabin(bytes);
      performance.mark('workbench-parse-start');
      const gltf = await new GLTFLoader()
        .setMeshoptDecoder(MeshoptDecoder)
        .parseAsync(bytes, '');
      if (abort.signal.aborted) {
        release([gltf.scene]);
        return;
      }
      owned = gltf.scene;
      const models = {} as Models;
      for (const id of [
        'noclash',
        'student-portal',
        'noterm',
        'career',
        'resume',
        'contact',
      ] as const) {
        const root = owned.getObjectByName('project-' + id);
        if (!root) throw Error('Missing workbench assembly ' + id);
        models[id] = root;
        root.removeFromParent();
        root.position.set(0, 0, 0);
        root.rotation.set(0, 0, 0);
        detached.push(root);
      }
      for (const root of [owned, ...detached])
        root.traverse((o) => {
          if (o instanceof THREE.Mesh) {
            o.castShadow = false;
            o.receiveShadow = false;
            for (const m of Array.isArray(o.material)
              ? o.material
              : [o.material])
              if (m instanceof THREE.MeshBasicMaterial) m.toneMapped = false;
          }
        });
      performance.mark('cabin-static-ready');
      callbacks.current.onReady(owned, models);
    })().catch(() => {
      if (!abort.signal.aborted) callbacks.current.onFailure();
    });
    return () => {
      abort.abort();
      if (owned) release([owned, ...detached]);
    };
  }, []);
  return null;
}
function Instrument({
  id,
  model,
  props,
  labels,
  dragged,
}: {
  id: ItemId;
  model: THREE.Object3D;
  props: Props;
  labels: LabelNodes;
  dragged: () => boolean;
}) {
  const { camera, size, gl, invalidate } = useThree();
  const point = useRef(new THREE.Vector3());
  const phase = useRef(0);
  const selected = props.activeProject === id;
  const [hover, setHover] = useState(false);
  const at: [number, number, number] =
    id in projectPresentation
      ? projectPresentation[id as ProjectId].anchor
      : id === 'career'
        ? [-4, 1.43, 0.75]
        : id === 'resume'
          ? [4.03, 1.43, 0.75]
          : [4.1, 1.43, -0.85];
  const strips = useRef<
    { object: THREE.Object3D; position: THREE.Vector3; rotation: THREE.Euler }[]
  >([]);
  const pieces = useRef<
    { object: THREE.Object3D; position: THREE.Vector3; rotation: THREE.Euler }[]
  >([]);
  useEffect(() => {
    pieces.current = [];
    strips.current = [];
    model.traverse((o) => {
      if (o.name.startsWith('Timetable input strip'))
        strips.current.push({
          object: o,
          position: o.position.clone(),
          rotation: o.rotation.clone(),
        });
      if (
        [
          'planner-input',
          'planner-wing',
          'archive-tray',
          'terminal-lever',
        ].includes(o.name)
      )
        pieces.current.push({
          object: o,
          position: o.position.clone(),
          rotation: o.rotation.clone(),
        });
    });
  }, [model]);
  useEffect(() => {
    phase.current = selected ? (props.reduced ? 1 : 0) : 0;
    invalidate();
  }, [selected, props.demo, props.reduced, invalidate]);
  useFrame((_, dt) => {
    if (selected && phase.current < 1 && !props.reduced) {
      phase.current = Math.min(1, phase.current + Math.min(dt, 0.05) / 0.6);
      invalidate();
    }
    const pose = mechanismPose(phase.current);
    const settled = 1 - Math.pow(1 - phase.current, 3);
    strips.current.forEach((strip, i) => {
      strip.object.position.copy(strip.position);
      strip.object.rotation.copy(strip.rotation);
      strip.object.position.x +=
        (1 - settled) * [-0.12, 0.08, 0.15][i % 3] +
        (i === 0 ? settled * 0.36 : 0);
      strip.object.position.z += (1 - settled) * [0.12, -0.07, 0.06][i % 3];
      strip.object.rotation.y += (1 - settled) * [-0.18, 0.12, -0.09][i % 3];
    });
    for (const part of pieces.current) {
      part.object.position.copy(part.position);
      part.object.rotation.copy(part.rotation);
      if (part.object.name === 'planner-input')
        part.object.position.x += pose.inputSlide;
      if (part.object.name === 'planner-wing')
        part.object.rotation.y += pose.wingAngle;
      if (part.object.name === 'archive-tray')
        part.object.position.z += pose.traySlide;
      if (part.object.name === 'terminal-lever')
        part.object.rotation.x += pose.leverAngle;
    }
    if (selected) gl.domElement.dataset.demoProgress = phase.current.toFixed(3);
    const node = labels.current[id];
    if (node) {
      const anchor =
        id in projectPresentation
          ? projectPresentation[id as ProjectId].label
          : id === 'career' || id === 'resume'
            ? [at[0], at[1] + 0.12, at[2] + 0.365]
            : [at[0], at[1] + 0.3, at[2] + 0.7];
      point.current
        .set(...(anchor as [number, number, number]))
        .project(camera);
      const x = (point.current.x * 0.5 + 0.5) * size.width,
        y = (-point.current.y * 0.5 + 0.5) * size.height;
      const primary =
        id in projectPresentation || id === 'career' || id === 'resume';
      const show =
        point.current.z < 1 &&
        point.current.z > -1 &&
        x > 60 &&
        x < size.width - 60 &&
        y > size.height * 0.33 &&
        y < size.height - 110 &&
        !props.section &&
        (primary || hover);
      node.style.visibility = show ? 'visible' : 'hidden';
      node.dataset.hovered = String(hover);
      node.style.transform = `translate(${x}px,${y}px) translate(-50%,-50%)`;
      node.tabIndex = show ? 0 : -1;
    }
  });
  const activate = () => {
    if (props.section || dragged()) return;
    if (id === 'resume') downloadResume();
    else if (id === 'contact') props.onRadio();
    else if (id === 'career') props.onSelect('about');
    else props.onSelect('work', id);
  };
  return (
    <group position={at}>
      <primitive object={model} dispose={null} />
      <mesh
        position={[0, 0.5, 0]}
        visible={false}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHover(true);
          gl.domElement.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHover(false);
          gl.domElement.style.cursor = 'grab';
        }}
        onClick={(e) => {
          e.stopPropagation();
          activate();
        }}
      >
        <boxGeometry
          args={
            id === 'noclash'
              ? [3.8, 1.5, 1.7]
              : id in projectPresentation
                ? [2.1, 1.7, 1.5]
                : [0.7, 0.7, 0.8]
          }
        />
        <meshBasicMaterial />
      </mesh>
    </group>
  );
}
function StudioLife({
  paused,
  docked,
  onDock,
}: {
  paused: boolean;
  docked: boolean;
  onDock: () => void;
}) {
  const { invalidate, gl } = useThree();
  const drone = useRef<THREE.Group>(null),
    time = useRef(0);
  useEffect(() => {
    invalidate();
    if (paused) return;
    const timer = setInterval(() => {
      if (!document.hidden) invalidate();
    }, 1000 / 24);
    return () => clearInterval(timer);
  }, [paused, invalidate]);
  useFrame((_, dt) => {
    if (!paused) {
      time.current += Math.min(dt, 0.05);
      if (drone.current) {
        drone.current.position.y =
          (docked ? 1.75 : 3.1) +
          Math.sin(time.current * 0.7) * (docked ? 0 : 0.07);
        drone.current.rotation.y = Math.sin(time.current * 0.3) * 0.18;
      }
    }
    gl.domElement.dataset.droneState = docked ? 'docked' : 'idle';
  });
  return (
    <group
      ref={drone}
      position={docked ? [-4, 1.75, -0.3] : [1.4, 3.1, -2.4]}
      onClick={(e) => {
        e.stopPropagation();
        onDock();
      }}
    >
      <mesh>
        <sphereGeometry args={[0.14, 20, 12]} />
        <meshStandardMaterial color="#eeece2" roughness={0.45} />
      </mesh>
      <mesh position={[0, 0, 0.13]}>
        <boxGeometry args={[0.12, 0.05, 0.035]} />
        <meshBasicMaterial color="#76bdb5" />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.22, 0.018, 6, 32]} />
        <meshStandardMaterial color="#d7a567" />
      </mesh>
    </group>
  );
}
function Scene({ props, labels }: { props: Props; labels: LabelNodes }) {
  const { gl, camera, size, invalidate, setDpr } = useThree();
  const pointer = useAnchoredCamera(
    props.section,
    props.project,
    props.reduced,
    props.reset,
    props.frozen,
    props.look,
    props.lookVertical,
  );
  const [models, setModels] = useState<Models | null>(null),
    [fixed, setFixed] = useState<THREE.Group | null>(null),
    [environmentReady, setEnvironmentReady] = useState(false);
  const environmentLoaded = useCallback(() => setEnvironmentReady(true), []);
  const assetReady = useCallback(
    (root: THREE.Group, m: Models) => {
      setFixed(root);
      setModels(m);
      gl.domElement.dataset.cabinAsset = 'ready';
    },
    [gl],
  );
  const prepared = usePreparedRenderer(
    environmentReady && !!models,
    props.onReady,
    props.onFailure,
  );
  useEffect(
    () =>
      addAfterEffect(() => {
        gl.domElement.dataset.drawCalls = String(gl.info.render.calls);
        gl.domElement.dataset.triangles = String(gl.info.render.triangles);
        gl.domElement.dataset.geometries = String(gl.info.memory.geometries);
        gl.domElement.dataset.textures = String(gl.info.memory.textures);
      }),
    [gl],
  );
  useEffect(() => {
    const canvas = gl.domElement;
    canvas.tabIndex = 0;
    canvas.setAttribute(
      'aria-label',
      'Orbital workbench. Drag or use arrow keys to look. Select a project to read its full case study.',
    );
    const lost = (e: Event) => {
      e.preventDefault();
      props.onFailure();
    };
    canvas.addEventListener('webglcontextlost', lost);
    return () => canvas.removeEventListener('webglcontextlost', lost);
  }, [gl, props.onFailure]);
  useEffect(() => {
    invalidate();
  }, [props.body, props.section, invalidate]);
  const arrival = useRef(1);
  const bake =
    import.meta.env.DEV &&
    new URLSearchParams(location.search).has('bakeStudio');
  useEffect(() => {
    camera.position.set(0, 3.3, size.width < 700 ? 13.2 : 9.3);
    invalidate();
  }, [camera, size.width, invalidate]);
  const quality = useRef({ slow: 0, fast: 0, dpr: 1.4, changed: 0 });
  useFrame((_, dt) => {
    if (props.lowEffects || gl.domElement.dataset.cameraDragging !== 'true')
      return;
    const q = quality.current;
    const now = performance.now();
    if (dt > 0.027) {
      q.slow++;
      q.fast = 0;
    } else if (dt < 0.019) {
      q.fast++;
      q.slow = 0;
    } else {
      q.fast = 0;
      q.slow = 0;
    }
    if (
      now - q.changed > 8000 &&
      ((q.slow >= 24 && q.dpr > 1) || (q.fast >= 240 && q.dpr < 1.4))
    ) {
      q.dpr = q.slow >= 24 ? 1 : 1.4;
      q.changed = now;
      q.fast = q.slow = 0;
      setDpr(q.dpr);
      gl.domElement.dataset.adaptiveDpr = String(q.dpr);
      invalidate();
    }
  });

  return (
    <>
      <color attach="background" args={['#091a24']} />
      <hemisphereLight args={['#d6e7e1', '#244c56', 1.7]} />
      <directionalLight position={[-3, 6, 5]} intensity={2.2} color="#fff0d9" />
      <directionalLight
        position={[5, 4, -3]}
        intensity={0.65}
        color="#bdd9e5"
      />
      {bake ? (
        <>
          <Environment resolution={128} frames={1}>
            <Lightformer
              intensity={1.5}
              color="#fff0d9"
              position={[-3, 6, 3]}
              rotation={[Math.PI / 2, 0, 0]}
              scale={[7, 5, 1]}
            />
            <Lightformer
              intensity={0.65}
              color="#76bdb5"
              position={[6, 3, -2]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={[4, 3, 1]}
            />
          </Environment>
          <BakeEnvironment />
        </>
      ) : (
        <CabinEnvironment onReady={environmentLoaded} fallback={null} />
      )}

      <StudioAsset onReady={assetReady} onFailure={props.onFailure} />
      {fixed && <primitive object={fixed} dispose={null} />}
      {models &&
        Object.entries(models).map(([id, model]) => (
          <Instrument
            key={id}
            id={id as ItemId}
            model={model}
            props={props}
            labels={labels}
            dragged={() => !!pointer.current?.dragged}
          />
        ))}
      <CelestialBackdrop
        body={props.body}
        arrivalMotion={arrival}
        reduced={props.reduced || props.frozen || !!props.section}
        lowEffects={props.lowEffects}
      />
      <Arrival
        motion={arrival}
        body={props.body}
        paused={props.frozen || !!props.section}
        reduced={props.reduced}
        onPhase={props.onArrivalPhase}
        onSettled={props.onArrived}
      />
      <PlanetTreatment body={props.body} lowEffects={props.lowEffects} />
      <StudioLife
        paused={!prepared || props.reduced || props.frozen || !!props.section}
        docked={props.docked}
        onDock={props.onDock}
      />
    </>
  );
}
export default function OrbitalWorkbench(props: Props) {
  const [visible, setVisible] = useState(true);
  const labels = useRef<Record<string, HTMLButtonElement | null>>({});
  useEffect(() => {
    const update = () => setVisible(!document.hidden);
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);
  return (
    <div className="room-canvas" data-scene="orbital-workbench">
      <Canvas
        dpr={props.lowEffects ? 1 : [1, 1.4]}
        frameloop={visible ? 'demand' : 'never'}
        camera={{ position: [0, 3.3, 9.3], fov: 49, near: 0.1, far: 160 }}
        gl={{ antialias: true, alpha: false }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
          gl.domElement.style.cursor = 'grab';
          gl.domElement.dataset.roomObjects =
            'noclash,student-portal,noterm,career,resume,contact';
        }}
      >
        <Scene props={props} labels={labels} />
      </Canvas>
      <div className="room-label-layer">
        {(
          [
            'noclash',
            'student-portal',
            'noterm',
            'career',
            'resume',
            'contact',
          ] as ItemId[]
        ).map((id) => (
          <button
            key={id}
            ref={(node) => {
              labels.current[id] = node;
            }}
            className={
              'scene-label ' +
              (id in projectPresentation || id === 'career' || id === 'resume'
                ? 'primary-label'
                : 'secondary-label') +
              (id === 'career' || id === 'resume' ? ' folio-label' : '')
            }
            data-object={id}
            style={{ visibility: 'hidden' }}
            tabIndex={-1}
            onClick={() =>
              id === 'resume'
                ? downloadResume()
                : id === 'contact'
                  ? props.onRadio()
                  : id === 'career'
                    ? props.onSelect('about')
                    : props.onSelect('work', id)
            }
          >
            {id === 'noclash'
              ? 'NoClash'
              : id === 'student-portal'
                ? 'Student Portal'
                : id === 'noterm'
                  ? 'NoTerm'
                  : id === 'career'
                    ? 'About'
                    : id === 'resume'
                      ? 'Résumé'
                      : 'Cabin radio'}
            <span aria-hidden="true"> ↗</span>
          </button>
        ))}
      </div>
    </div>
  );
}

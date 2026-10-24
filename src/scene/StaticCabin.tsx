import { useEffect, useLayoutEffect, useState, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import modelUrl from '../assets/static-cabin.croom?url';
import { StaticCabinSource } from './StaticCabinSource';
import type { ProjectId } from '../data/navigation';
import { validateStaticCabin } from './staticCabinAsset';

function disposeCabin(roots: THREE.Object3D[]) {
  const geometries = new Set<THREE.BufferGeometry>(),
    materials = new Set<THREE.Material>(),
    textures = new Set<THREE.Texture>(),
    images = new Set<{ close?: () => void }>();
  roots.forEach((root) =>
    root.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      geometries.add(object.geometry);
      for (const material of Array.isArray(object.material)
        ? object.material
        : [object.material]) {
        materials.add(material);
        for (const value of Object.values(material))
          if (value instanceof THREE.Texture) {
            textures.add(value);
            if (value.image) images.add(value.image);
          }
      }
    }),
  );
  geometries.forEach((g) => g.dispose());
  materials.forEach((m) => m.dispose());
  textures.forEach((t) => t.dispose());
  images.forEach((image) => image.close?.());
}
export type ProjectModels = Record<ProjectId, THREE.Object3D>;
export function StaticCabin({
  onReady,
}: {
  onReady: (models: ProjectModels | null) => void;
}) {
  const { gl, invalidate } = useThree();
  const projectModels = useRef<ProjectModels | null>(null);
  const [model, setModel] = useState<THREE.Group | null>(null),
    [failed, setFailed] = useState(false);
  useEffect(() => {
    const abort = new AbortController();
    let owned: THREE.Group | null = null;
    void (async () => {
      const response = await fetch(modelUrl, { signal: abort.signal });
      if (!response.ok) throw new Error('Cabin model unavailable');
      let buffer = await response.arrayBuffer();
      const signature = new Uint8Array(
        buffer,
        0,
        Math.min(buffer.byteLength, 2),
      );
      if (signature[0] === 0x1f && signature[1] === 0x8b)
        buffer = await new Response(
          new Blob([buffer])
            .stream()
            .pipeThrough(new DecompressionStream('gzip')),
        ).arrayBuffer();
      validateStaticCabin(buffer);
      if (abort.signal.aborted) return;
      const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
      const gltf = await loader.parseAsync(buffer, '');
      if (abort.signal.aborted) {
        disposeCabin([gltf.scene]);
        return;
      }
      const models = {} as ProjectModels;
      for (const id of ['noclash', 'student-portal', 'noterm'] as const) {
        const object = gltf.scene.getObjectByName('project-' + id);
        if (!object) {
          disposeCabin([gltf.scene]);
          throw new Error('Missing project model');
        }
        models[id] = object;
      }
      for (const object of Object.values(models)) object.removeFromParent();
      projectModels.current = models;
      owned = gltf.scene;
      for (const root of [owned, ...Object.values(models)])
        root.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.castShadow = true;
            object.receiveShadow = true;
            for (const material of Array.isArray(object.material)
              ? object.material
              : [object.material]) {
              if (typeof material.userData.bakedToneMapped === 'boolean')
                material.toneMapped = material.userData.bakedToneMapped;
              for (const value of Object.values(material))
                if (value instanceof THREE.Texture)
                  value.anisotropy = Math.min(
                    4,
                    gl.capabilities.getMaxAnisotropy(),
                  );
            }
          }
        });
      setModel(owned);
    })().catch(() => {
      if (!abort.signal.aborted) setFailed(true);
    });
    return () => {
      abort.abort();
      if (owned)
        disposeCabin([owned, ...Object.values(projectModels.current || {})]);
    };
  }, [gl]);
  useLayoutEffect(() => {
    if (!model && !failed) return;
    gl.domElement.dataset.cabinAsset = failed ? 'procedural-fallback' : 'ready';
    performance.mark(failed ? 'cabin-static-fallback' : 'cabin-static-ready');
    invalidate();
    onReady(failed ? null : projectModels.current);
  }, [model, failed, gl, invalidate, onReady]);
  if (failed) return <StaticCabinSource />;
  return model ? <primitive object={model} dispose={null} /> : null;
}

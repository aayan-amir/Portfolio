import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import {
  mergeGeometries,
  mergeVertices,
} from 'three/addons/utils/BufferGeometryUtils.js';

/** Development-only bake: merge fixed surfaces by source zone and material. */
export function BakeStaticCabin() {
  const { scene } = useThree();
  useEffect(() => {
    const panel = document.createElement('div');
    panel.style.cssText =
      'position:fixed;top:175px;right:20px;background:white;color:black;padding:14px;z-index:300';
    const button = document.createElement('button');
    button.textContent = 'Bake static cabin';
    panel.append(button);
    document.body.append(panel);
    button.onclick = () => {
      void (async () => {
        button.disabled = true;
        const source = scene.getObjectByName('cabin-static-source');
        if (!source) throw new Error('Static cabin source missing');
        source.updateWorldMatrix(true, true);
        const root = new THREE.Group();
        root.name = 'Cabin';
        const buckets = new Map<
          string,
          {
            geometries: THREE.BufferGeometry[];
            material: THREE.Material;
            zone: string;
          }
        >();
        let meshes = 0;
        source.traverse((object) => {
          if (object instanceof THREE.PointLight) {
            const light = object.clone(false);
            object.matrixWorld.decompose(
              light.position,
              light.quaternion,
              light.scale,
            );
            root.add(light);
            return;
          }
          if (!(object instanceof THREE.Mesh)) return;
          if (Array.isArray(object.material))
            throw new Error('Multi-material mesh needs explicit bake support');
          meshes++;
          const mat = object.material as THREE.MeshStandardMaterial;
          let zone: THREE.Object3D = object;
          while (zone.parent && zone.parent !== source) zone = zone.parent;
          const key = JSON.stringify([
            zone.name,
            mat.type,
            mat.color?.getHex(),
            mat.roughness,
            mat.metalness,
            mat.emissive?.getHex(),
            mat.emissiveIntensity,
            mat.map?.uuid,
            mat.side,
            mat.transparent,
            mat.opacity,
          ]);
          let bucket = buckets.get(key);
          if (!bucket) {
            const material = mat.clone();
            material.userData = {
              ...material.userData,
              bakedToneMapped: mat.toneMapped,
            };
            if (material.map) {
              material.map = material.map.clone();
              material.map.userData = {
                ...material.map.userData,
                mimeType: 'image/webp',
              };
            }
            bucket = { geometries: [], material, zone: zone.name };
            buckets.set(key, bucket);
          }
          const geometry = object.geometry.index
            ? object.geometry.toNonIndexed()
            : object.geometry.clone();
          geometry.applyMatrix4(object.matrixWorld);
          for (const name of ['position', 'normal', 'uv']) {
            const attribute = geometry.getAttribute(name);
            if (!attribute) continue;
            const factor = name === 'position' ? 1000 : 10000;
            for (let i = 0; i < attribute.array.length; i++)
              attribute.array[i] =
                Math.round(attribute.array[i] * factor) / factor;
          }
          bucket.geometries.push(geometry);
        });
        for (const bucket of buckets.values()) {
          const merged = mergeGeometries(bucket.geometries, false);
          if (!merged) throw new Error('Incompatible fixed geometry');
          const geometry = mergeVertices(merged, 1e-5);
          merged.dispose();
          geometry.computeBoundingBox();
          const center = geometry.boundingBox!.getCenter(new THREE.Vector3());
          const size = geometry.boundingBox!.getSize(new THREE.Vector3());
          const scale = Math.max(size.x, size.y, size.z) / 2 || 1;
          const position = geometry.getAttribute('position'),
            normal = geometry.getAttribute('normal');
          const packedPosition = new Int16Array(position.count * 3),
            packedNormal = new Int16Array(normal.count * 3);
          for (let i = 0; i < position.count; i++) {
            packedPosition[i * 3] = Math.round(
              ((position.getX(i) - center.x) / scale) * 32767,
            );
            packedPosition[i * 3 + 1] = Math.round(
              ((position.getY(i) - center.y) / scale) * 32767,
            );
            packedPosition[i * 3 + 2] = Math.round(
              ((position.getZ(i) - center.z) / scale) * 32767,
            );
            packedNormal[i * 3] = Math.round(normal.getX(i) * 32767);
            packedNormal[i * 3 + 1] = Math.round(normal.getY(i) * 32767);
            packedNormal[i * 3 + 2] = Math.round(normal.getZ(i) * 32767);
          }
          geometry.setAttribute(
            'position',
            new THREE.BufferAttribute(packedPosition, 3, true),
          );
          geometry.setAttribute(
            'normal',
            new THREE.BufferAttribute(packedNormal, 3, true),
          );
          geometry.computeBoundingBox();
          geometry.computeBoundingSphere();
          const mesh = new THREE.Mesh(geometry, bucket.material);
          mesh.name = bucket.zone;
          mesh.position.copy(center);
          mesh.scale.setScalar(scale);
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          root.add(mesh);
          bucket.geometries.forEach((g) => g.dispose());
        }
        for (const name of [
          'project-noclash',
          'project-student-portal',
          'project-noterm',
        ]) {
          const sourceModel = scene.getObjectByName(name);
          if (!sourceModel) throw new Error('Missing project source ' + name);
          sourceModel.updateWorldMatrix(true, true);
          root.add(bakeProject(sourceModel));
        }
        const binary = await new GLTFExporter().parseAsync(root, {
          binary: true,
          maxTextureSize: 512,
          onlyVisible: true,
        });
        if (!(binary instanceof ArrayBuffer))
          throw new Error('Expected binary glTF');
        const packed = new Uint8Array(
          await new Response(
            new Blob([binary])
              .stream()
              .pipeThrough(new CompressionStream('gzip')),
          ).arrayBuffer(),
        );
        let encoded = '';
        for (let i = 0; i < packed.length; i += 16384)
          encoded += String.fromCharCode(...packed.subarray(i, i + 16384));
        const link = document.createElement('a');
        link.href = 'data:application/octet-stream;base64,' + btoa(encoded);
        link.download = 'static-cabin.croom';
        link.dataset.bakedCabin = 'ready';
        link.textContent = `Baked ${meshes} surfaces into ${buckets.size} meshes (${packed.length} bytes)`;
        panel.replaceChildren(link);
        root.traverse((o) => {
          if (o instanceof THREE.Mesh) {
            o.geometry.dispose();
            (o.material as THREE.Material).dispose();
          }
        });
      })().catch((error) => {
        panel.textContent = String(error);
      });
    };
    return () => panel.remove();
  }, [scene]);
  return null;
}

function bakeProject(source: THREE.Object3D) {
  const root = new THREE.Group();
  root.name = source.name;
  const owners = new Map<THREE.Object3D, THREE.Group>([[source, root]]);
  source.traverse((object) => {
    if (['planner-arm', 'archive-tray', 'terminal-lever'].includes(object.name))
      owners.set(object, new THREE.Group());
  });
  for (const [object, target] of owners) {
    if (object === source) continue;
    let parent = object.parent;
    while (parent && !owners.has(parent)) parent = parent.parent;
    if (!parent) throw new Error('Missing mechanism parent');
    const local = parent.matrixWorld
      .clone()
      .invert()
      .multiply(object.matrixWorld);
    target.name = object.name;
    local.decompose(target.position, target.quaternion, target.scale);
    owners.get(parent)!.add(target);
  }
  const buckets = new Map<
    string,
    {
      geometries: THREE.BufferGeometry[];
      material: THREE.Material;
      owner: THREE.Group;
    }
  >();
  source.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    if (Array.isArray(object.material))
      throw new Error('Project multi-material mesh unsupported');
    let owner: THREE.Object3D | null = object;
    while (owner && !owners.has(owner)) owner = owner.parent;
    if (!owner) throw new Error('No project owner');
    const mat = object.material as THREE.MeshStandardMaterial;
    const key = JSON.stringify([
      owner.name,
      mat.type,
      mat.color?.getHex(),
      mat.roughness,
      mat.metalness,
      mat.emissive?.getHex(),
      mat.emissiveIntensity,
      mat.map?.uuid,
      mat.side,
      mat.transparent,
      mat.opacity,
      mat.toneMapped,
    ]);
    let bucket = buckets.get(key);
    if (!bucket) {
      const material = mat.clone();
      material.userData = {
        ...material.userData,
        bakedToneMapped: mat.toneMapped,
      };
      if (material.map) {
        material.map = material.map.clone();
        material.map.userData = {
          ...material.map.userData,
          mimeType: 'image/webp',
        };
      }
      bucket = { geometries: [], material, owner: owners.get(owner)! };
      buckets.set(key, bucket);
    }
    const geometry = object.geometry.index
      ? object.geometry.toNonIndexed()
      : object.geometry.clone();
    geometry.applyMatrix4(
      owner.matrixWorld.clone().invert().multiply(object.matrixWorld),
    );
    for (const name of ['position', 'normal', 'uv']) {
      const a = geometry.getAttribute(name);
      if (!a) continue;
      const factor = name === 'position' ? 10000 : 100000;
      for (let i = 0; i < a.array.length; i++)
        a.array[i] = Math.round(a.array[i] * factor) / factor;
    }
    bucket.geometries.push(geometry);
  });
  for (const bucket of buckets.values()) {
    const merged = mergeGeometries(bucket.geometries, false);
    if (!merged) throw new Error('Project geometry mismatch');
    const geometry = mergeVertices(merged, 1e-5);
    merged.dispose();
    geometry.computeBoundingBox();
    const center = geometry.boundingBox!.getCenter(new THREE.Vector3()),
      size = geometry.boundingBox!.getSize(new THREE.Vector3()),
      scale = Math.max(size.x, size.y, size.z) / 2 || 1;
    const position = geometry.getAttribute('position'),
      normal = geometry.getAttribute('normal'),
      p = new Int16Array(position.count * 3),
      n = new Int16Array(normal.count * 3);
    for (let i = 0; i < position.count; i++) {
      p[i * 3] = Math.round(((position.getX(i) - center.x) / scale) * 32767);
      p[i * 3 + 1] = Math.round(
        ((position.getY(i) - center.y) / scale) * 32767,
      );
      p[i * 3 + 2] = Math.round(
        ((position.getZ(i) - center.z) / scale) * 32767,
      );
      n[i * 3] = Math.round(normal.getX(i) * 32767);
      n[i * 3 + 1] = Math.round(normal.getY(i) * 32767);
      n[i * 3 + 2] = Math.round(normal.getZ(i) * 32767);
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(p, 3, true));
    geometry.setAttribute('normal', new THREE.BufferAttribute(n, 3, true));
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
    const mesh = new THREE.Mesh(geometry, bucket.material);
    mesh.name = 'surface';
    mesh.position.copy(center);
    mesh.scale.setScalar(scale);
    bucket.owner.add(mesh);
    bucket.geometries.forEach((g) => g.dispose());
  }
  return root;
}

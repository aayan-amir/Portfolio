import * as THREE from 'three';

export class SceneResourcePool {
  private geometries = new Map<string, THREE.BufferGeometry>();
  private materials = new Map<string, THREE.MeshStandardMaterial>();
  geometry(key: string, create: () => THREE.BufferGeometry) {
    let resource = this.geometries.get(key);
    if (!resource) {
      resource = create();
      this.geometries.set(key, resource);
    }
    return resource;
  }
  standard(color: string, roughness: number, metalness: number) {
    const key = `${color}|${roughness}|${metalness}`;
    let resource = this.materials.get(key);
    if (!resource) {
      resource = new THREE.MeshStandardMaterial({
        color,
        roughness,
        metalness,
      });
      this.materials.set(key, resource);
    }
    return resource;
  }
  dispose() {
    this.geometries.forEach((resource) => resource.dispose());
    this.materials.forEach((resource) => resource.dispose());
    this.geometries.clear();
    this.materials.clear();
  }
}

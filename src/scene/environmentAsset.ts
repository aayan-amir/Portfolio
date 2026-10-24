import * as THREE from 'three';

export function decodeEnvironment(buffer: ArrayBuffer) {
  if (buffer.byteLength < 16) throw new Error('Incomplete cabin environment');
  const header = new DataView(buffer);
  const width = header.getUint32(8, true),
    height = header.getUint32(12, true);
  if (
    header.getUint32(0, true) !== 0x4341424e ||
    header.getUint32(4, true) !== 1 ||
    width !== 384 ||
    height !== 512 ||
    buffer.byteLength !== 16 + width * height * 8
  )
    throw new Error('Invalid cabin environment');
  const texture = new THREE.DataTexture(
    new Uint16Array(buffer, 16),
    width,
    height,
    THREE.RGBAFormat,
    THREE.HalfFloatType,
  );
  texture.mapping = THREE.CubeUVReflectionMapping;
  texture.minFilter = texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
}

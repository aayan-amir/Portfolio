import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/** Development-only exporter for the cabin's original, filtered reflection lighting. */
export function BakeEnvironment() {
  const { gl, scene, invalidate } = useThree();
  const requested = useRef(false),
    busy = useRef(false);
  const panel = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const element = document.createElement('div');
    element.style.cssText =
      'position:fixed;top:120px;right:30px;z-index:200;background:white;padding:15px;color:black';
    const button = document.createElement('button');
    button.textContent = 'Bake cabin reflections';
    button.onclick = () => {
      requested.current = true;
      invalidate();
    };
    element.append(button);
    document.body.append(element);
    panel.current = element;
    return () => {
      element.remove();
      panel.current = null;
    };
  }, [invalidate]);
  useFrame(() => {
    if (!requested.current || busy.current || !scene.environment) return;
    busy.current = true;
    const generator = new THREE.PMREMGenerator(gl);
    const target = generator.fromCubemap(
      scene.environment as THREE.CubeTexture,
    );
    const header = new Uint32Array([
      0x4341424e,
      1,
      target.width,
      target.height,
    ]);
    const pixels = new Uint16Array(target.width * target.height * 4);
    gl.readRenderTargetPixels(
      target,
      0,
      0,
      target.width,
      target.height,
      pixels,
    );
    if (!pixels.some((v) => v > 0))
      throw new Error('Reflection bake was empty');
    const bytes = new Uint8Array(header.byteLength + pixels.byteLength);
    bytes.set(new Uint8Array(header.buffer));
    bytes.set(new Uint8Array(pixels.buffer), header.byteLength);
    target.dispose();
    generator.dispose();
    void (async () => {
      const stream = new Blob([bytes.buffer])
        .stream()
        .pipeThrough(new CompressionStream('gzip'));
      const packed = new Uint8Array(await new Response(stream).arrayBuffer());
      let binary = '';
      for (let i = 0; i < packed.length; i += 16384)
        binary += String.fromCharCode(...packed.subarray(i, i + 16384));
      if (!panel.current) return;
      const link = document.createElement('a');
      link.dataset.bakedEnvironment = 'ready';
      link.href = 'data:application/octet-stream;base64,' + btoa(binary);
      link.download = 'cabin-reflections.cenv';
      link.textContent = `Baked ${header[2]} × ${header[3]} reflections (${packed.length} bytes)`;
      panel.current.replaceChildren(link);
    })();
  }, 2);
  return null;
}

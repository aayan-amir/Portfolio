import { useEffect, useState, type ReactNode } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { decodeEnvironment } from './environmentAsset';
import environmentUrl from '../assets/orbital-reflections.cenv?url';

/** A baked version of the original lightformers, including all roughness levels. */
export function CabinEnvironment({
  onReady,
  fallback,
}: {
  onReady: () => void;
  fallback: ReactNode;
}) {
  const { scene, invalidate, gl } = useThree();
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const abort = new AbortController();
    let owned: THREE.DataTexture | null = null;
    const previous = scene.environment;
    void (async () => {
      const response = await fetch(environmentUrl, { signal: abort.signal });
      if (!response.ok) throw new Error('Reflection asset unavailable');
      let buffer = await response.arrayBuffer();
      const signature = new Uint8Array(
        buffer,
        0,
        Math.min(buffer.byteLength, 2),
      );
      if (signature[0] === 0x1f && signature[1] === 0x8b) {
        const stream = new Blob([buffer])
          .stream()
          .pipeThrough(new DecompressionStream('gzip'));
        buffer = await new Response(stream).arrayBuffer();
      }
      if (abort.signal.aborted) return;
      owned = decodeEnvironment(buffer);
      scene.environment = owned;
      gl.domElement.dataset.environment = 'baked';
      performance.mark('cabin-environment-baked');
      invalidate();
      onReady();
    })().catch(() => {
      if (!abort.signal.aborted) setFailed(true);
    });
    return () => {
      abort.abort();
      if (scene.environment === owned) scene.environment = previous;
      owned?.dispose();
    };
  }, [scene, gl, invalidate, onReady]);
  useEffect(() => {
    if (failed) {
      gl.domElement.dataset.environment = 'realtime-fallback';
      performance.mark('cabin-environment-fallback');
      // The fallback's layout effect installs its map before this effect runs.
      invalidate();
      onReady();
    }
  }, [failed, gl, invalidate, onReady]);
  return failed ? fallback : null;
}

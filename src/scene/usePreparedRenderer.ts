import { useEffect, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

function yieldToBrowser() {
  return new Promise<void>((resolve) => {
    const channel = new MessageChannel();
    channel.port1.onmessage = () => {
      channel.port1.close();
      channel.port2.close();
      resolve();
    };
    channel.port2.postMessage(null);
  });
}

/** Compile materials in parallel before the first visible render, keeping HTML responsive. */
export function usePreparedRenderer(
  environmentReady: boolean,
  onReady: () => void,
  onFailure: () => void,
) {
  const { gl, scene, camera, invalidate } = useThree();
  const [prepared, setPrepared] = useState(false);
  const ready = useRef(false),
    announced = useRef(false);
  const callbacks = useRef({ onReady, onFailure });
  callbacks.current = { onReady, onFailure };
  useEffect(() => {
    if (!environmentReady) return;
    let live = true;
    const started = performance.now();
    performance.mark('cabin-compile-start');
    performance.mark(
      'cabin-parallel-' + gl.extensions.has('KHR_parallel_shader_compile'),
    );
    gl.domElement.dataset.shaderWarmup = 'compiling';
    scene.updateMatrixWorld(true);
    camera.updateMatrixWorld();
    const compilation = gl.compileAsync(scene, camera);
    performance.mark('cabin-compile-submitted');
    void compilation
      .then(async () => {
        performance.mark('cabin-compile-ready');
        if (!live) return;
        // Three defers uniform/attribute introspection until first draw. Warm each
        // linked program separately so a single frame doesn't pay every query.
        for (const program of gl.info.programs || []) {
          if (!live) return;
          program.getUniforms();
          program.getAttributes();
          await yieldToBrowser();
        }
        const textures = new Set<THREE.Texture>();
        if (scene.environment) textures.add(scene.environment);
        scene.traverse((object) => {
          if (!(object instanceof THREE.Mesh || object instanceof THREE.Points))
            return;
          for (const material of Array.isArray(object.material)
            ? object.material
            : [object.material]) {
            for (const value of Object.values(material))
              if (value instanceof THREE.Texture) textures.add(value);
            if (material instanceof THREE.ShaderMaterial)
              for (const uniform of Object.values(material.uniforms))
                if (uniform.value instanceof THREE.Texture)
                  textures.add(uniform.value);
          }
        });
        for (const texture of textures) {
          if (!live) return;
          if (!texture.isRenderTargetTexture && texture.image)
            gl.initTexture(texture);
          await yieldToBrowser();
        }
        if (!live) return;
        performance.mark('cabin-uploads-ready');
        ready.current = true;
        setPrepared(true);
        gl.domElement.dataset.shaderWarmupMs = (
          performance.now() - started
        ).toFixed(1);
        invalidate();
      })
      .catch(() => {
        if (live) callbacks.current.onFailure();
      });
    return () => {
      live = false;
      ready.current = false;
    };
  }, [environmentReady, gl, scene, camera, invalidate]);
  // Positive priority takes ownership of the main render; auxiliary finite passes remain intact.
  useFrame(() => {
    if (!ready.current) return;
    try {
      if (!announced.current) performance.mark('cabin-first-render-start');
      gl.render(scene, camera);
      if (!announced.current) {
        performance.mark('cabin-first-render-end');
        announced.current = true;
        gl.domElement.dataset.shaderWarmup = 'ready';
        gl.domElement.dataset.ready = 'true';
        callbacks.current.onReady();
      }
    } catch {
      ready.current = false;
      callbacks.current.onFailure();
    }
  }, 1);
  return prepared;
}

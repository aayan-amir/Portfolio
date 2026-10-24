import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { bodies, type BodyId } from '../data/celestial';
import {
  planetVertex,
  planetFragment,
  atmosphereFragment,
  ringVertex,
  ringFragment,
} from './planetShaders';
export function CelestialBackdrop({
  arrivalMotion,
  body,
  reduced,
  lowEffects,
}: {
  arrivalMotion: RefObject<number>;
  body: BodyId;
  reduced: boolean;
  lowEffects: boolean;
}) {
  const { gl, invalidate, size } = useThree();
  const [surface, setSurface] = useState<{
    body: BodyId;
    texture: THREE.Texture;
  } | null>(null);
  const cache = useRef(new Map<BodyId, THREE.Texture>());
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      cache.current.forEach((t) => t.dispose());
      cache.current.clear();
    };
  }, []);
  useEffect(() => {
    let current = true;
    const urls: Record<BodyId, string | null> = {
      earth: '/earth-day-2048.jpg',
      mercury: '/planets/mercury.jpg',
      venus: '/planets/venus_atmosphere.jpg',
      mars: '/planets/mars.jpg',
      jupiter: '/planets/jupiter.jpg',
      saturn: '/planets/saturn.jpg',
      uranus: '/planets/uranus.jpg',
      neptune: '/planets/neptune.jpg',
      sun: '/planets/sun.jpg',
    };
    const url = urls[body];
    gl.domElement.dataset.destination = body;
    gl.domElement.dataset.planetTexture = url ? 'loading' : 'procedural';
    if (!url) {
      setSurface(null);
      invalidate();
      return;
    }
    const existing = cache.current.get(body);
    if (existing) {
      cache.current.delete(body);
      cache.current.set(body, existing);
      setSurface({ body, texture: existing });
      gl.domElement.dataset.planetTexture = 'ready';
      invalidate();
      return;
    }
    new THREE.TextureLoader().load(
      url,
      (texture) => {
        if (!current || !mounted.current) {
          texture.dispose();
          return;
        }
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = 4;
        cache.current.set(body, texture);
        while (cache.current.size > 3) {
          const oldest = cache.current.keys().next().value;
          if (!oldest || oldest === body) break;
          cache.current.get(oldest)?.dispose();
          cache.current.delete(oldest);
        }
        setSurface({ body, texture });
        gl.domElement.dataset.planetTexture = 'ready';
        invalidate();
      },
      undefined,
      () => {
        if (current && mounted.current) {
          setSurface(null);
          gl.domElement.dataset.planetTexture = 'fallback';
          invalidate();
        }
      },
    );
    return () => {
      current = false;
    };
  }, [body, gl, invalidate]);
  const index = bodies.findIndex((b) => b.id === body);
  const info = bodies[index];
  const uniforms = useMemo(
    () => ({
      tint: { value: new THREE.Color(info.color) },
      kind: { value: index },
      time: { value: 0 },
      surfaceMap: { value: surface?.body === body ? surface.texture : null },
      hasSurface: { value: surface?.body === body },
    }),
    [body, surface],
  );
  const atmosphere = useMemo(
    () => ({
      tint: {
        value: new THREE.Color(body === 'mars' ? '#d8aa80' : info.color),
      },
      strength: {
        value:
          body === 'mercury'
            ? 0
            : body === 'mars'
              ? 0.12
              : body === 'sun'
                ? 0.18
                : 0.24,
      },
    }),
    [body],
  );
  const stars = useMemo(() => {
    const a = new Float32Array(480 * 3);
    for (let i = 0; i < 480; i++) {
      const t = i * 2.39996,
        z = 1 - (2 * (i + 0.5)) / 480,
        r = Math.sqrt(1 - z * z);
      a.set([Math.cos(t) * r * 90, z * 90, Math.sin(t) * r * 90], i * 3);
    }
    return a;
  }, []);
  const planet = useRef<THREE.Mesh>(null);
  const journey = useRef<THREE.Group>(null);
  useEffect(() => {
    invalidate();
  }, [body, surface]);
  useFrame((_, dt) => {
    gl.domElement.dataset.destination = body;
    if (journey.current) {
      const ease = 1 - Math.pow(1 - arrivalMotion.current, 3);
      journey.current.position.x =
        (size.width < 600 ? 3.5 : 7) + (1 - ease) * 5;
      journey.current.scale.setScalar(scale * (0.9 + 0.1 * ease));
    }
    gl.domElement.dataset.planetLighting = 'view-space';
    if (!reduced && !document.hidden) {
      uniforms.time.value += Math.min(dt, 0.05);
      if (planet.current)
        planet.current.rotation.y += Math.min(dt, 0.05) * 0.055;
      gl.domElement.dataset.orbitTime = uniforms.time.value.toFixed(3);
    }
  });
  const ringed = body === 'saturn' || body === 'uranus';
  const portrait = size.width < 600;
  const scale =
    body === 'saturn'
      ? portrait
        ? 1.02
        : 0.98
      : body === 'uranus'
        ? 1.18
        : 1.25;
  return (
    <group>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[stars, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#b8cdd5" size={0.055} depthWrite={false} />
      </points>
      <group
        ref={journey}
        position={portrait ? [3.5, 7.0, -29] : [7.0, 6.6, -30]}
        scale={scale}
      >
        <mesh
          ref={planet}
          rotation={[0.12, 3.5, body === 'uranus' ? -1.1 : -0.2]}
        >
          <sphereGeometry args={[7, 64, 48]} />
          <shaderMaterial
            vertexShader={planetVertex}
            fragmentShader={planetFragment}
            uniforms={uniforms}
          />
        </mesh>
        {body !== 'mercury' && (
          <mesh scale={1.025}>
            <sphereGeometry args={[7, 48, 32]} />
            <shaderMaterial
              transparent
              depthWrite={false}
              side={THREE.BackSide}
              blending={THREE.AdditiveBlending}
              vertexShader={planetVertex}
              fragmentShader={atmosphereFragment}
              uniforms={atmosphere}
            />
          </mesh>
        )}
        {ringed && (
          <mesh
            rotation={
              body === 'saturn' ? [-1.08, 0.15, -0.28] : [0.75, 0.7, 1.05]
            }
          >
            <ringGeometry
              args={body === 'saturn' ? [8.15, 12.15, 160] : [7.8, 8.52, 128]}
            />
            <shaderMaterial
              vertexShader={ringVertex}
              fragmentShader={ringFragment}
              uniforms={{ ice: { value: body === 'uranus' } }}
              transparent
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}
        {body === 'sun' && !lowEffects && (
          <mesh>
            <planeGeometry args={[21, 21]} />
            <shaderMaterial
              transparent
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              vertexShader={planetVertex}
              uniforms={uniforms}
              fragmentShader={`varying vec3 vP;uniform float time;void main(){float r=length(vP.xy);float angle=atan(vP.y,vP.x);float ray=.5+.5*sin(angle*19.+sin(angle*7.-time*.15));float glow=(1.-smoothstep(7.2,10.4,r))*smoothstep(6.9,7.5,r);gl_FragColor=vec4(1.,.35,.04,glow*(.10+ray*.13));
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`}
            />
          </mesh>
        )}
      </group>
    </group>
  );
}

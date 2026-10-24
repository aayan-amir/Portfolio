import * as THREE from 'three';
import type { BodyId } from '../data/celestial';
export const treatments: Record<
  BodyId,
  { color: string; strength: number; pattern: string }
> = {
  earth: { color: '#94b9c8', strength: 0.12, pattern: 'cloud' },
  mercury: { color: '#d2ae7b', strength: 0.19, pattern: 'slats' },
  venus: { color: '#e2bc7b', strength: 0.14, pattern: 'haze' },
  mars: { color: '#c7866b', strength: 0.17, pattern: 'dust' },
  jupiter: { color: '#d3b79c', strength: 0.14, pattern: 'bands' },
  saturn: { color: '#d6c39a', strength: 0.18, pattern: 'rings' },
  uranus: { color: '#91cacc', strength: 0.16, pattern: 'tilt' },
  neptune: { color: '#8ab8d8', strength: 0.18, pattern: 'frost' },
  sun: { color: '#edb46f', strength: 0.22, pattern: 'warmth' },
};
export function PlanetTreatment({
  body,
  lowEffects,
}: {
  body: BodyId;
  lowEffects: boolean;
}) {
  const effect = treatments[body];
  return (
    <group>
      <directionalLight
        position={[4, 5, -7]}
        color={effect.color}
        intensity={body === 'sun' ? 0.65 : 0.28}
      />
      {!lowEffects && (
        <>
          <mesh position={[0, 0.031, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[7.7, 64]} />
            <shaderMaterial
              transparent
              depthWrite={false}
              uniforms={{
                tint: { value: new THREE.Color(effect.color) },
                strength: { value: effect.strength },
                kind: {
                  value: [
                    'cloud',
                    'slats',
                    'haze',
                    'dust',
                    'bands',
                    'rings',
                    'tilt',
                    'frost',
                    'warmth',
                  ].indexOf(effect.pattern),
                },
              }}
              vertexShader={`varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`}
              fragmentShader={`varying vec2 v;uniform vec3 tint;uniform float strength;uniform int kind;void main(){vec2 p=(v-.5)*2.;float edge=1.-smoothstep(.6,1.,length(p));float a=.3;if(kind==0)a=smoothstep(.25,.8,sin(p.x*5.+sin(p.y*8.))*.5+.5)*.5;if(kind==1)a=step(.83,fract(p.x*8.+p.y*2.));if(kind==2)a=.4+sin(p.x*2.)*.2;if(kind==3)a=pow(max(0.,sin(p.x*32.)*sin(p.y*29.)),7.);if(kind==4)a=smoothstep(.5,.9,sin(p.y*16.)*.5+.5);if(kind==5)a=step(.65,fract(length(p-vec2(.7,.6))*9.));if(kind==6)a=step(.7,fract((p.x+p.y)*4.));if(kind==7)a=pow(abs(p.x),3.);if(kind==8)a=(.5+.5*sin(p.x*3.+p.y));gl_FragColor=vec4(tint,a*strength*edge);}`}
            />
          </mesh>
          {(body === 'neptune' || body === 'venus') &&
            [-1, 1].map((sign) => (
              <mesh key={sign} position={[sign * 6.6, 3.5, -4.98]}>
                <planeGeometry args={[0.2, 3.5]} />
                <meshBasicMaterial
                  color={effect.color}
                  transparent
                  opacity={body === 'neptune' ? 0.13 : 0.06}
                  depthWrite={false}
                />
              </mesh>
            ))}
        </>
      )}
    </group>
  );
}

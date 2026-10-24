import { Block, Disc, Arc } from './Primitives';
import { cabin } from './CabinShell';
import { useLinen } from './WorkshopSurfaces';
import { RoundedBox } from './Primitives';

function Vent({ at }: { at: [number, number, number] }) {
  return (
    <group position={at}>
      {Array.from({ length: 8 }, (_, i) => (
        <Block
          key={i}
          at={[-0.63 + i * 0.18, 0, 0]}
          size={[0.075, 0.3, 0.035]}
          color={cabin.recess}
          radius={0.01}
        />
      ))}
    </group>
  );
}
function Bay({
  at,
  size,
  rotation = 0,
}: {
  at: [number, number, number];
  size: [number, number, number];
  rotation?: number;
}) {
  return (
    <group position={at} rotation={[0, rotation, 0]}>
      <Block
        at={[0, size[1] / 2, 0]}
        size={size}
        color={cabin.petrol}
        radius={0.13}
      />
      <Block
        at={[0, size[1] + 0.07, 0]}
        size={[size[0] + 0.16, 0.14, size[2] + 0.16]}
        color={cabin.hull}
        radius={0.08}
      />
      <Block
        at={[0, size[1] - 0.05, size[2] / 2 + 0.06]}
        size={[size[0] - 0.15, 0.035, 0.04]}
        color={cabin.orange}
      />
      <Vent at={[0, 0.48, size[2] / 2 + 0.03]} />
    </group>
  );
}
export function IntegratedWorkbench() {
  return (
    <group>
      <Bay at={[-0.8, 0, 0.1]} size={[3.4, 1.2, 2.2]} rotation={0.12} />
      <Bay at={[-4.12, 0, -2.85]} size={[2.7, 1.28, 1.15]} rotation={0.43} />
      <Bay at={[3.7, 0, 0.65]} size={[2.9, 1.1, 1.8]} rotation={-0.43} />
      {/* The work surfaces connect to the hull rather than standing as separate desks. */}
      <Block
        at={[1.55, 1.12, -2.65]}
        size={[9.7, 0.18, 2.25]}
        color={cabin.hull}
        radius={0.16}
      />
      <Block
        at={[-0.8, 1.15, -1.4]}
        size={[2.9, 0.16, 2.2]}
        color={cabin.hull}
        radius={0.08}
      />
      <Block
        at={[4.5, 1.08, -1.2]}
        size={[2.1, 0.16, 2.3]}
        color={cabin.hull}
        radius={0.08}
      />
      <Bay at={[-4.15, 0, 0.65]} size={[1.55, 1.05, 1.4]} rotation={0.28} />
      <Bay at={[5.9, 0, 1.1]} size={[1.3, 1.28, 2.1]} />
      <group position={[-1.6, 0, 2.4]} rotation={[0, 0.25, 0]}>
        <Disc
          at={[0, 0.12, 0]}
          radius={0.48}
          height={0.15}
          color={cabin.recess}
        />
        <Block at={[0, 0.53, 0]} size={[0.16, 0.8, 0.16]} color={cabin.trim} />
        <Block
          at={[0, 1, 0]}
          size={[0.95, 0.22, 0.9]}
          color="#598b8b"
          radius={0.1}
        />
        <Block
          at={[0, 1.53, 0.38]}
          size={[0.9, 0.9, 0.18]}
          color="#598b8b"
          radius={0.09}
        />
        <Block
          at={[0, 1.48, 0.495]}
          size={[0.12, 0.72, 0.025]}
          color={cabin.orange}
        />
      </group>
    </group>
  );
}
export function ReadingNook() {
  const linen = useLinen();
  return (
    <group position={[-5.35, 0, 2.65]} rotation={[0, 0.65, 0]}>
      <Block
        at={[0, 0.38, 0]}
        size={[2.1, 0.76, 1.4]}
        color={cabin.petrol}
        radius={0.1}
      />
      <RoundedBox position={[0, 0.87, 0]} args={[2, 0.25, 1.2]} radius={0.1}>
        <meshStandardMaterial map={linen} color="#598783" roughness={1} />
      </RoundedBox>
      <RoundedBox position={[0, 1.35, -0.55]} args={[2, 1, 0.22]} radius={0.12}>
        <meshStandardMaterial map={linen} color="#598783" roughness={1} />
      </RoundedBox>
      <Block
        at={[-0.7, 1.13, 0.1]}
        size={[0.22, 0.08, 1]}
        color={cabin.orange}
        radius={0.025}
      />
    </group>
  );
}
export function Notebook() {
  return (
    <group rotation={[-0.26, 0, 0]}>
      <Block size={[1.08, 0.12, 0.8]} color={cabin.orange} radius={0.07} />
      <Block at={[0, 0.08, 0]} size={[0.94, 0.04, 0.64]} color={cabin.recess} />
      {[0, 1, 2].map((i) => (
        <Block
          key={i}
          at={[-0.08, 0.105, -0.18 + i * 0.15]}
          size={[0.55 - i * 0.09, 0.008, 0.035]}
          color="#b6d2cd"
          radius={0.005}
        />
      ))}
    </group>
  );
}
export function ResumeFolio() {
  return (
    <group rotation={[-0.18, -0.22, 0]}>
      <Block size={[0.82, 0.12, 1.03]} color={cabin.orange} radius={0.06} />
      <Block at={[0, 0.08, 0]} size={[0.7, 0.025, 0.9]} color={cabin.hull} />
      {[0, 1, 2, 3].map((i) => (
        <Block
          key={i}
          at={[0, 0.1, -0.25 + i * 0.15]}
          size={[i === 0 ? 0.3 : 0.48, 0.01, 0.025]}
          color={cabin.petrol}
          radius={0.005}
        />
      ))}
    </group>
  );
}
export function ContactRadio() {
  return (
    <group>
      <Block
        at={[0, 0.2, 0]}
        size={[0.84, 0.42, 0.5]}
        color={cabin.petrol}
        radius={0.09}
      />
      {[0, 1, 2, 3, 4].map((i) => (
        <Block
          key={i}
          at={[-0.24 + i * 0.075, 0.23, 0.26]}
          size={[0.025, 0.23, 0.025]}
          color={cabin.recess}
          radius={0.004}
        />
      ))}
      <Block
        at={[0.23, 0.23, 0.27]}
        size={[0.18, 0.16, 0.04]}
        color={cabin.orange}
      />
      <Arc
        radius={0.22}
        tube={0.025}
        angle={Math.PI}
        at={[0, 0.56, 0]}
        color={cabin.trim}
      />
    </group>
  );
}
export function PersonalDetails() {
  return (
    <group>
      <group position={[-4.5, 1.22, -0.1]}>
        <Block
          at={[0, 0.35, 0]}
          size={[0.045, 0.7, 0.045]}
          color={cabin.trim}
        />
        <Block
          at={[0.18, 0.73, 0]}
          size={[0.52, 0.1, 0.24]}
          color={cabin.orange}
        />
        <pointLight
          position={[0.2, 0.6, 0.1]}
          intensity={3}
          distance={2.5}
          color="#ffdcac"
        />
      </group>
      {/* A few personal traces, held in place as shipboard objects. */}
      <group position={[1.3, 1.3, -2.2]}>
        <Disc
          at={[0, 0, 0]}
          radius={0.22}
          height={0.035}
          color={cabin.recess}
        />
        <Disc
          at={[0, 0.13, 0]}
          radius={0.13}
          height={0.24}
          color={cabin.orange}
        />
        <Arc
          radius={0.08}
          tube={0.02}
          at={[0.14, 0.14, 0]}
          color={cabin.orange}
        />
      </group>
    </group>
  );
}

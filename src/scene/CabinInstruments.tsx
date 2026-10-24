import { Block, Disc, Arc } from './Primitives';
import { cabin } from './CabinShell';
export function NavigationChart() {
  return (
    <group>
      <Disc
        at={[0, 0.07, 0]}
        radius={0.68}
        height={0.12}
        color={cabin.petrol}
      />
      {[0.2, 0.36, 0.53].map((r) => (
        <Arc
          key={r}
          radius={r}
          tube={0.009}
          at={[0, 0.14, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          color="#8eb9b4"
        />
      ))}
      <Disc
        at={[0, 0.15, 0]}
        radius={0.075}
        height={0.03}
        color={cabin.orange}
      />
      {[
        [-0.28, 0.24],
        [0.39, -0.26],
        [0.1, -0.49],
      ].map(([x, z], i) => (
        <Disc
          key={i}
          at={[x, 0.15, z]}
          radius={0.045}
          height={0.035}
          color={['#70b8df', '#dfcc9b', '#548fe5'][i]}
        />
      ))}
    </group>
  );
}
export function DroneDock() {
  return (
    <group position={[-5.3, 1.95, 1.55]}>
      <Block size={[0.8, 0.1, 0.7]} color={cabin.petrol} />
      <Arc
        at={[0, 0.07, 0]}
        radius={0.27}
        tube={0.025}
        rotation={[-Math.PI / 2, 0, 0]}
        color="#8bb8af"
        lit
      />
    </group>
  );
}

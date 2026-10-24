import { useEffect, useState } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Block, Arc } from './Primitives';
import { cabin } from './CabinShell';

type PrintKind =
  'saturn' | 'orbits' | 'rocket' | 'note' | 'patch' | 'moon' | 'constellation';
function drawPrint(kind: PrintKind) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = kind === 'patch' ? 512 : 768;
  const c = canvas.getContext('2d')!;
  const paper = '#e6ddbf',
    ink = '#173d4a',
    orange = '#c77d4c',
    blue = '#739fa7';
  c.fillStyle = kind === 'orbits' || kind === 'patch' ? ink : paper;
  c.fillRect(0, 0, 512, canvas.height);
  // A restrained, deterministic paper grain: no extra image requests.
  for (let i = 0; i < 4200; i++) {
    const x = (i * 139.31) % 512,
      y = (i * 73.87) % canvas.height;
    c.fillStyle = i % 2 ? '#ffffff09' : '#102b3909';
    c.fillRect(x, y, 1.4, 1.4);
  }
  const text = (
    value: string,
    x: number,
    y: number,
    size: number,
    color = ink,
  ) => {
    c.fillStyle = color;
    c.font = `500 ${size}px sans-serif`;
    c.fillText(value, x, y);
  };
  if (kind === 'moon') {
    text('Lunar', 38, 88, 64);
    text('studies', 38, 155, 64);
    c.fillStyle = ink;
    c.beginPath();
    c.arc(256, 389, 155, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = blue;
    c.beginPath();
    c.arc(256, 389, 145, 0, Math.PI * 2);
    c.fill();
    [
      [204, 321, 22],
      [300, 403, 32],
      [215, 468, 18],
      [318, 306, 15],
      [166, 394, 11],
    ].forEach(([x, y, r]) => {
      c.fillStyle = '#527b85';
      c.beginPath();
      c.arc(x, y, r, 0, Math.PI * 2);
      c.fill();
    });
    c.strokeStyle = orange;
    c.lineWidth = 2;
    c.beginPath();
    c.ellipse(256, 389, 191, 184, -0.3, 0, Math.PI * 2);
    c.stroke();
    text('A familiar light. A new perspective.', 38, 699, 22);
  } else if (kind === 'constellation') {
    c.fillStyle = ink;
    c.fillRect(0, 0, 512, 768);
    text('Night notes', 38, 91, 52, paper);
    const stars = [
      [98, 280],
      [205, 246],
      [300, 331],
      [396, 305],
      [344, 463],
      [220, 509],
      [122, 456],
    ];
    c.strokeStyle = blue;
    c.lineWidth = 2;
    c.beginPath();
    stars.forEach(([x, y], i) => (i === 0 ? c.moveTo(x, y) : c.lineTo(x, y)));
    c.stroke();
    stars.forEach(([x, y], i) => {
      c.fillStyle = i === 2 ? orange : paper;
      c.beginPath();
      c.arc(x, y, i === 2 ? 9 : 5, 0, Math.PI * 2);
      c.fill();
    });
    for (let i = 0; i < 32; i++) {
      c.fillStyle = '#c6d7cb';
      c.fillRect(40 + ((i * 73) % 430), 180 + ((i * 47) % 400), 2, 2);
    }
    text('Leave room for wonder.', 38, 699, 25, paper);
  } else if (kind === 'saturn') {
    text('Saturn', 38, 91, 64);
    text('A study in orbits', 40, 129, 21);
    c.save();
    c.translate(252, 380);
    c.rotate(-0.4);
    c.strokeStyle = ink;
    c.lineWidth = 2;
    for (let r = 0; r < 9; r++) {
      c.beginPath();
      c.ellipse(0, 0, 222 - r * 6, 64 - r * 1.8, 0, 0, Math.PI * 2);
      c.stroke();
    }
    c.fillStyle = orange;
    c.beginPath();
    c.arc(0, 0, 126, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = paper;
    c.lineWidth = 3;
    for (let y = -80; y < 100; y += 17) {
      c.beginPath();
      c.moveTo(-86, y);
      c.lineTo(86, y);
      c.stroke();
    }
    c.strokeStyle = ink;
    c.lineWidth = 2;
    for (let r = 0; r < 8; r++) {
      c.beginPath();
      c.ellipse(0, 0, 222 - r * 6, 64 - r * 1.8, 0, 0, Math.PI);
      c.stroke();
    }
    c.restore();
    c.strokeStyle = ink;
    c.beginPath();
    c.moveTo(40, 651);
    c.lineTo(472, 651);
    c.stroke();
    text('There is more out there.', 40, 697, 25);
  } else if (kind === 'orbits') {
    text('Orbital', 38, 85, 57, paper);
    text('mechanics', 38, 145, 57, paper);
    c.save();
    c.translate(258, 405);
    c.rotate(-0.45);
    [65, 105, 145, 185].forEach((r, i) => {
      c.strokeStyle = i === 2 ? orange : blue;
      c.lineWidth = i === 2 ? 4 : 1.5;
      c.beginPath();
      c.ellipse(0, 0, r, r * 0.69, 0, 0, Math.PI * 2);
      c.stroke();
      const a = i * 1.7;
      c.fillStyle = paper;
      c.beginPath();
      c.arc(Math.cos(a) * r, Math.sin(a) * r * 0.69, 7, 0, Math.PI * 2);
      c.fill();
    });
    c.fillStyle = orange;
    c.beginPath();
    c.arc(0, 0, 18, 0, Math.PI * 2);
    c.fill();
    c.restore();
    text('Curiosity is a good compass.', 38, 691, 24, paper);
  } else if (kind === 'rocket') {
    text('Keep', 38, 86, 62);
    text('building.', 38, 155, 62);
    c.save();
    c.translate(256, 404);
    c.rotate(0.3);
    c.fillStyle = orange;
    c.beginPath();
    c.moveTo(0, -142);
    c.bezierCurveTo(65, -78, 57, 72, 42, 100);
    c.lineTo(-42, 100);
    c.bezierCurveTo(-57, 72, -65, -78, 0, -142);
    c.fill();
    c.fillStyle = ink;
    c.beginPath();
    c.arc(0, -40, 26, 0, Math.PI * 2);
    c.fill();
    c.beginPath();
    c.moveTo(-40, 30);
    c.lineTo(-85, 116);
    c.lineTo(-38, 92);
    c.moveTo(40, 30);
    c.lineTo(85, 116);
    c.lineTo(38, 92);
    c.fill();
    c.strokeStyle = blue;
    c.lineWidth = 4;
    [-22, 0, 22].forEach((x) => {
      c.beginPath();
      c.moveTo(x, 125);
      c.lineTo(x, 185 + Math.abs(x));
      c.stroke();
    });
    c.restore();
    text('Small steps. Useful things.', 38, 702, 25);
  } else if (kind === 'note') {
    text('Build.', 40, 240, 73);
    text('Review.', 40, 350, 73);
    text('Refine.', 40, 460, 73);
    c.strokeStyle = orange;
    c.lineWidth = 7;
    c.beginPath();
    c.moveTo(40, 489);
    c.quadraticCurveTo(220, 510, 363, 488);
    c.stroke();
  } else {
    c.strokeStyle = orange;
    c.lineWidth = 10;
    c.beginPath();
    c.arc(256, 256, 222, 0, Math.PI * 2);
    c.stroke();
    c.strokeStyle = paper;
    c.lineWidth = 2;
    c.beginPath();
    c.ellipse(256, 256, 191, 68, -0.55, 0, Math.PI * 2);
    c.stroke();
    text('AA', 164, 291, 118, paper);
    text('Personal mission', 146, 397, 27, paper);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}
function Print({
  kind,
  at,
  width,
  height,
  rotation = [0, 0, 0],
}: {
  kind: PrintKind;
  at: [number, number, number];
  width: number;
  height: number;
  rotation?: [number, number, number];
}) {
  const [map, setMap] = useState<THREE.Texture | null>(null);
  const { invalidate } = useThree();
  useEffect(() => {
    const t = drawPrint(kind);
    setMap(t);
    invalidate();
    return () => t.dispose();
  }, [kind, invalidate]);
  return (
    <group position={at} rotation={rotation}>
      {kind !== 'patch' && (
        <Block
          at={[0, 0, -0.035]}
          size={[width + 0.06, height + 0.06, 0.055]}
          color={cabin.trim}
          radius={0.012}
        />
      )}
      <mesh>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial
          map={map}
          color={map ? '#ffffff' : '#e6ddbf'}
          roughness={0.95}
          metalness={0}
        />
      </mesh>
      {kind !== 'patch' &&
        [-1, 1].map((sign) => (
          <Block
            key={sign}
            at={[sign * width * 0.32, height * 0.49, 0.012]}
            size={[0.09, 0.08, 0.028]}
            color={cabin.orange}
            radius={0.009}
          />
        ))}
    </group>
  );
}
export function WallDecor() {
  return (
    <group>
      <Print
        kind="saturn"
        at={[-5.25, 4.4, -4.17]}
        width={1.02}
        height={1.53}
        rotation={[0, 0, 0.035]}
      />
      <Print
        kind="orbits"
        at={[-3.88, 4.47, -4.17]}
        width={0.94}
        height={1.41}
        rotation={[0, 0, -0.025]}
      />
      <Print
        kind="note"
        at={[-2.91, 4.66, -4.16]}
        width={0.4}
        height={0.6}
        rotation={[0, 0, 0.09]}
      />
      <Print
        kind="patch"
        at={[-2.96, 3.68, -4.16]}
        width={0.59}
        height={0.59}
      />
      <Print
        kind="rocket"
        at={[6.4, 3.8, -1.15]}
        width={1.18}
        height={1.77}
        rotation={[0, -Math.PI / 2, 0]}
      />
      <Print
        kind="moon"
        at={[-6.4, 3.85, -1.3]}
        width={1.2}
        height={1.8}
        rotation={[0, Math.PI / 2, 0]}
      />
      <Print
        kind="constellation"
        at={[-6.4, 3.65, 0.65]}
        width={0.86}
        height={1.29}
        rotation={[0, Math.PI / 2, 0]}
      />
      {/* A shallow picture rail makes the front prints feel physically mounted. */}
      <Block
        at={[-4.5, 3.55, -4.08]}
        size={[3.3, 0.07, 0.17]}
        color={cabin.hull}
        radius={0.018}
      />
      <Arc
        at={[-2.96, 3.68, -4.12]}
        radius={0.31}
        tube={0.018}
        color={cabin.orange}
      />
    </group>
  );
}

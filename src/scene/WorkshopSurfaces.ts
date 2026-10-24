import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
export function useTimber() {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const c = canvas.getContext('2d')!;
    c.fillStyle = '#cc9e68';
    c.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 220; i++) {
      const y = i * 2.4;
      c.strokeStyle = `rgba(106,66,30,${0.02 + (i % 5) * 0.009})`;
      c.lineWidth = i % 3 ? 1 : 2;
      c.beginPath();
      for (let x = 0; x <= 512; x += 8) {
        const sy =
          y +
          Math.sin(x * 0.012 + i * 0.17) * 3 +
          Math.sin(x * 0.035 + i) * 0.8;
        x ? c.lineTo(x, sy) : c.moveTo(x, sy);
      }
      c.stroke();
    }
    const map = new THREE.CanvasTexture(canvas);
    map.colorSpace = THREE.SRGBColorSpace;
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(1, 2);
    map.anisotropy = 4;
    return map;
  }, []);
  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
}
export function useLinen() {
  const texture = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d')!;
    g.fillStyle = '#e8dbbd';
    g.fillRect(0, 0, 128, 128);
    for (let i = 0; i < 128; i += 3) {
      g.fillStyle = i % 2 ? '#d7c9aa' : '#efe4cc';
      g.fillRect(i, 0, 1, 128);
      g.fillRect(0, i, 128, 1);
    }
    const map = new THREE.CanvasTexture(c);
    map.colorSpace = THREE.SRGBColorSpace;
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(5, 3);
    return map;
  }, []);
  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
}

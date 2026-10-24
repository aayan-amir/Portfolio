import { dragAngles } from './cameraMath';
import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Section, ProjectId } from '../data/navigation';
export function useAnchoredCamera(
  section: Section | null,
  project: ProjectId | null,
  reduced: boolean,
  reset: number,
  frozen: boolean,
  look: number = 0,
  lookVertical: number = 0,
) {
  const { gl, camera, invalidate, size } = useThree();
  const pointer = useRef<{
    id: number;
    x: number;
    y: number;
    lastX: number;
    lastY: number;
    dragged: boolean;
  } | null>(null);
  const angles = useRef({ yaw: 0, pitch: 0 });
  const desired = useRef({ yaw: 0, pitch: 0 });
  const saved = useRef({ yaw: 0, pitch: 0 });
  const previousSection = useRef<Section | null>(null);
  const first = useRef(false);
  useEffect(() => {
    const lens = camera as THREE.PerspectiveCamera;
    lens.fov =
      size.width < 600
        ? 63
        : import.meta.env.DEV &&
            new URLSearchParams(window.location.search).has('wide')
          ? 56
          : 49;
    lens.updateProjectionMatrix();
    first.current = false;
    invalidate();
  }, [size.width, size.height, camera]);
  useEffect(() => {
    first.current = false;
    angles.current = { yaw: 0, pitch: 0 };
    desired.current = { yaw: 0, pitch: 0 };
    saved.current = { yaw: 0, pitch: 0 };
    invalidate();
  }, [reset]);
  useEffect(() => {
    if (section && !previousSection.current)
      saved.current = { ...desired.current };
    if (!section && previousSection.current)
      desired.current = { ...saved.current };

    previousSection.current = section;
    invalidate();
  }, [section, project]);
  const previousLook = useRef(look);
  useEffect(() => {
    const delta = look - previousLook.current;
    previousLook.current = look;
    if (!delta || section || frozen) return;
    desired.current = dragAngles(
      desired.current.yaw,
      desired.current.pitch,
      Math.sign(delta) * 120,
      0,
    );
    invalidate();
  }, [look, section, frozen]);
  const previousVertical = useRef(lookVertical);
  useEffect(() => {
    const delta = lookVertical - previousVertical.current;
    previousVertical.current = lookVertical;
    if (!delta || section || frozen) return;
    desired.current = dragAngles(
      desired.current.yaw,
      desired.current.pitch,
      0,
      Math.sign(delta) * 100,
    );
    invalidate();
  }, [lookVertical, section, frozen, invalidate]);
  useEffect(() => {
    const canvas = gl.domElement;
    const down = (e: PointerEvent) => {
      if (section || frozen) return;
      if (!e.isPrimary || e.button !== 0) return;
      canvas.setPointerCapture(e.pointerId);
      canvas.style.cursor = 'grabbing';
      pointer.current = {
        id: e.pointerId,
        x: e.clientX,
        y: e.clientY,
        lastX: e.clientX,
        lastY: e.clientY,
        dragged: false,
      };
    };
    const move = (e: PointerEvent) => {
      const p = pointer.current;
      if (!p || section || e.pointerId !== p.id) return;
      const distance = Math.hypot(e.clientX - p.x, e.clientY - p.y);
      if (distance > 6) p.dragged = true;
      if (p.dragged) {
        // Camera owns this gesture. Skip R3F's recursive mesh picking and
        // hover/React updates until release; clicks still use normal picking.
        e.stopPropagation();
        canvas.dataset.cameraDragging = 'true';
        desired.current = dragAngles(
          desired.current.yaw,
          desired.current.pitch,
          e.clientX - p.lastX,
          e.clientY - p.lastY,
        );
        invalidate();
      }
      p.lastX = e.clientX;
      p.lastY = e.clientY;
    };
    const up = (e: PointerEvent) => {
      if (canvas.hasPointerCapture(e.pointerId))
        canvas.releasePointerCapture(e.pointerId);
      canvas.style.cursor = 'grab';
      canvas.dataset.cameraDragging = 'false';
      window.setTimeout(() => {
        if (pointer.current?.id === e.pointerId) pointer.current = null;
      }, 0);
    };
    const cancel = () => {
      if (pointer.current && canvas.hasPointerCapture(pointer.current.id))
        canvas.releasePointerCapture(pointer.current.id);
      pointer.current = null;
      canvas.style.cursor = 'grab';
      canvas.dataset.cameraDragging = 'false';
    };
    const key = (e: KeyboardEvent) => {
      if (
        section ||
        frozen ||
        !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)
      )
        return;
      e.preventDefault();
      desired.current = dragAngles(
        desired.current.yaw,
        desired.current.pitch,
        e.key === 'ArrowRight' ? 35 : e.key === 'ArrowLeft' ? -35 : 0,
        e.key === 'ArrowDown' ? 35 : e.key === 'ArrowUp' ? -35 : 0,
      );
      invalidate();
    };
    canvas.addEventListener('keydown', key);
    canvas.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move, {
      capture: true,
      passive: true,
    });
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', cancel);
    window.addEventListener('blur', cancel);
    return () => {
      canvas.removeEventListener('keydown', key);
      canvas.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move, true);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', cancel);
      window.removeEventListener('blur', cancel);
      cancel();
    };
  }, [gl, section, frozen]);
  useFrame((_, rawDelta) => {
    const a = angles.current,
      d = desired.current;
    const delta = Math.min(rawDelta, 0.05);
    // Fast tracking while held; a short ease-out for keys and release.
    const damping = pointer.current?.dragged ? 22 : 14;
    const changing =
      Math.abs(a.yaw - d.yaw) + Math.abs(a.pitch - d.pitch) > 0.0001;
    if (changing || !first.current) {
      a.yaw = reduced
        ? d.yaw
        : THREE.MathUtils.damp(a.yaw, d.yaw, damping, delta);
      a.pitch = reduced
        ? d.pitch
        : THREE.MathUtils.damp(a.pitch, d.pitch, damping, delta);
      camera.rotation.set(
        (size.width < 600 ? -0.045 : -0.105) + a.pitch,
        a.yaw,
        0,
        'YXZ',
      );
      camera.updateMatrixWorld();
      gl.domElement.dataset.yaw = String(a.yaw);
      gl.domElement.dataset.pitch = String(a.pitch);

      first.current = true;
      if (changing) invalidate();
    }
  }, -10);

  return pointer;
}

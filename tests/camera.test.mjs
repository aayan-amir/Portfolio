import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { dragAngles } from '../src/scene/cameraMath.ts';
function project(dx, dy) {
  const a = dragAngles(0, 0, dx, dy);
  const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 100);
  camera.rotation.set(a.pitch, a.yaw, 0, 'YXZ');
  camera.updateMatrixWorld();
  return new THREE.Vector3(0, 0, -10).project(camera);
}
test('drag right looks right: stationary landmark moves left', () =>
  assert.ok(project(100, 0).x < 0));
test('drag up looks up: stationary landmark moves down', () =>
  assert.ok(project(0, -100).y < 0));
test('drag down reveals floor: stationary landmark moves up', () =>
  assert.ok(project(0, 100).y > 0));
test('look angles remain bounded', () =>
  assert.deepEqual(dragAngles(0, 0, 99999, -99999), {
    yaw: -0.61,
    pitch: 0.35,
  }));

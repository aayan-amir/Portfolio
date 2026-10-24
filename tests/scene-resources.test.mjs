import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { SceneResourcePool } from '../src/scene/sceneResourcePool.ts';
test('matching scene parts reuse resources without sharing between room lifetimes', () => {
  const pool = new SceneResourcePool(),
    nextRoom = new SceneResourcePool();
  let constructions = 0;
  const make = () => {
    constructions++;
    return new THREE.BoxGeometry(1, 1, 1);
  };
  const geometry = pool.geometry('unit-box', make);
  assert.equal(pool.geometry('unit-box', make), geometry);
  assert.equal(constructions, 1);
  assert.notEqual(nextRoom.geometry('unit-box', make), geometry);
  assert.equal(
    pool.standard('#204c59', 0.42, 0.25),
    pool.standard('#204c59', 0.42, 0.25),
  );
  assert.notEqual(
    pool.standard('#204c59', 0.42, 0.25),
    pool.standard('#c77743', 0.42, 0.25),
  );
  pool.dispose();
  nextRoom.dispose();
});
test('room teardown disposes each shared resource exactly once', () => {
  const pool = new SceneResourcePool();
  const geometry = pool.geometry(
    'unit-box',
    () => new THREE.BoxGeometry(1, 1, 1),
  );
  const material = pool.standard('#204c59', 0.42, 0.25);
  let geometries = 0,
    materials = 0;
  geometry.addEventListener('dispose', () => geometries++);
  material.addEventListener('dispose', () => materials++);
  pool.geometry('unit-box', () => {
    throw new Error('must reuse geometry');
  });
  pool.dispose();
  pool.dispose();
  assert.equal(geometries, 1);
  assert.equal(materials, 1);
});

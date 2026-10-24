import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import * as THREE from 'three';
import { decodeEnvironment } from '../src/scene/environmentAsset.ts';
const bytes = gunzipSync(
  readFileSync(
    new URL('../src/assets/cabin-reflections.cenv', import.meta.url),
  ),
);
const buffer = bytes.buffer.slice(
  bytes.byteOffset,
  bytes.byteOffset + bytes.byteLength,
);
test('shipped reflection asset decodes with HDR roughness-atlas dimensions and mapping', () => {
  const texture = decodeEnvironment(buffer);
  assert.equal(texture.image.width, 384);
  assert.equal(texture.image.height, 512);
  assert.equal(texture.mapping, THREE.CubeUVReflectionMapping);
  assert.equal(texture.type, THREE.HalfFloatType);
  assert.ok(texture.image.data.some((v) => v > 0));
  assert.ok(
    !texture.image.data.some((v) => (v & 0x7c00) === 0x7c00),
    'asset must have no HDR infinities/NaNs',
  );
  texture.dispose();
});
test('truncated or unsupported reflection assets fail before GPU allocation', () => {
  assert.throws(() => decodeEnvironment(buffer.slice(0, 8)), /Incomplete/);
  assert.throws(
    () => decodeEnvironment(buffer.slice(0, buffer.byteLength - 8)),
    /Invalid/,
  );
  const altered = buffer.slice(0);
  new DataView(altered).setUint32(4, 99, true);
  assert.throws(() => decodeEnvironment(altered), /Invalid/);
});

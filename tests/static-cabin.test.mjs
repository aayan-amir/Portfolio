import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { validateStaticCabin } from '../src/scene/staticCabinAsset.ts';
const bytes = gunzipSync(
  readFileSync(new URL('../src/assets/static-cabin.croom', import.meta.url)),
);
const buffer = bytes.buffer.slice(
  bytes.byteOffset,
  bytes.byteOffset + bytes.byteLength,
);

test('shipped cabin contains embedded assets and separately animated project mechanisms', () => {
  const json = validateStaticCabin(buffer);
  assert.ok(json.meshes.length < 100);
  for (const name of [
    'project-noclash',
    'project-student-portal',
    'project-noterm',
    'planner-arm',
    'archive-tray',
    'terminal-lever',
  ])
    assert.ok(
      json.nodes.some((node) => node.name === name),
      name,
    );
  assert.ok(json.extensionsRequired.includes('EXT_meshopt_compression'));
  assert.ok(json.extensionsUsed.includes('KHR_lights_punctual'));
  assert.ok(json.images.length > 0);
  assert.ok(json.images.every((image) => Number.isInteger(image.bufferView)));
});

test('runtime Meshopt decoder can expand every cabin mesh to finite, indexed geometry', async () => {
  await MeshoptDecoder.ready;
  const io = new NodeIO()
    .registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({ 'meshopt.decoder': MeshoptDecoder });
  const document = await io.readBinary(new Uint8Array(buffer));
  const meshes = document.getRoot().listMeshes();
  assert.ok(meshes.length > 0);
  for (const mesh of meshes)
    for (const primitive of mesh.listPrimitives()) {
      const positions = primitive.getAttribute('POSITION');
      assert.ok(positions.getCount() > 0);
      assert.ok(positions.getArray().every(Number.isFinite));
      const indices = primitive.getIndices();
      assert.ok(
        indices &&
          indices.getArray().every((index) => index < positions.getCount()),
      );
    }
});

test('damaged and externally referenced cabin packages fail validation', () => {
  assert.throws(() => validateStaticCabin(buffer.slice(0, 16)), /Incomplete/);
  assert.throws(() => validateStaticCabin(buffer.slice(0, -8)), /Invalid/);
  const altered = buffer.slice(0);
  new DataView(altered).setUint32(4, 99, true);
  assert.throws(() => validateStaticCabin(altered), /Invalid/);
  const json = validateStaticCabin(buffer);
  json.images[0].uri = 'https://example.com/external.png';
  const payload = new TextEncoder().encode(JSON.stringify(json));
  const fake = new ArrayBuffer(20 + payload.length);
  const view = new DataView(fake);
  view.setUint32(0, 0x46546c67, true);
  view.setUint32(4, 2, true);
  view.setUint32(8, fake.byteLength, true);
  view.setUint32(12, payload.length, true);
  view.setUint32(16, 0x4e4f534a, true);
  new Uint8Array(fake, 20).set(payload);
  assert.throws(() => validateStaticCabin(fake), /External/);
});

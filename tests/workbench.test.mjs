import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { validateStaticCabin } from '../src/scene/staticCabinAsset.ts';
import { mechanismPose } from '../src/scene/workbenchMotion.ts';
import { projectPresentation } from '../src/data/projectPresentation.ts';
const bytes = gunzipSync(
  readFileSync(
    new URL('../src/assets/orbital-workbench.croom', import.meta.url),
  ),
);
const buffer = bytes.buffer.slice(
  bytes.byteOffset,
  bytes.byteOffset + bytes.byteLength,
);
test('workbench retains semantic mechanisms, embedded evidence and baked static lighting', () => {
  const json = validateStaticCabin(buffer);
  for (const name of [
    'baked-studio',
    'project-noclash',
    'project-student-portal',
    'project-noterm',
    'project-career',
    'project-resume',
    'project-contact',
    'planner-input',
    'planner-wing',
    'archive-tray',
    'terminal-lever',
  ])
    assert.ok(
      json.nodes.some((n) => n.name === name),
      name,
    );
  assert.ok(json.extensionsRequired.includes('EXT_meshopt_compression'));
  assert.ok(json.images.every((i) => Number.isInteger(i.bufferView)));
  assert.ok(!json.extensionsUsed.includes('KHR_lights_punctual'));
  assert.ok(bytes.length < 3000000);
});
test('runtime decoder expands workbench to finite indexed geometry', async () => {
  await MeshoptDecoder.ready;
  const io = new NodeIO()
    .registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({ 'meshopt.decoder': MeshoptDecoder });
  const doc = await io.readBinary(new Uint8Array(buffer));
  for (const mesh of doc.getRoot().listMeshes())
    for (const p of mesh.listPrimitives()) {
      const positions = p.getAttribute('POSITION');
      assert.ok(positions.getArray().every(Number.isFinite));
      assert.ok(
        p
          .getIndices()
          .getArray()
          .every((i) => i < positions.getCount()),
      );
    }
});
test('mechanisms settle safely, clamp phase, and reveal review state without accumulating transforms', () => {
  assert.deepEqual(mechanismPose(-1), mechanismPose(0));
  assert.deepEqual(mechanismPose(2), mechanismPose(1));
  let last = 0;
  for (let i = 0; i <= 60; i++) {
    const pose = mechanismPose(i / 60);
    assert.ok(Object.values(pose).every(Number.isFinite));
    assert.ok(pose.inputSlide >= last);
    last = pose.inputSlide;
  }
  assert.ok(Math.abs(mechanismPose(1).leverAngle) < 1e-10);
  assert.equal(mechanismPose(1).traySlide, -0.42);
  assert.equal(mechanismPose(0.5).leverAngle, -0.5);
});
test('evidence explicitly distinguishes actual captures from illustrations', () => {
  assert.equal(projectPresentation.noclash.evidence, 'actual');
  for (const id of ['student-portal', 'noterm']) {
    assert.equal(projectPresentation[id].evidence, 'illustration');
    assert.match(
      projectPresentation[id].caption,
      /not an application screenshot/i,
    );
  }
  for (const data of Object.values(projectPresentation)) {
    assert.ok(data.alt.length > 15);
    assert.ok(data.mechanism.length);
  }
});

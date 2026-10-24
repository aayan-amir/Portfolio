import { readFile, writeFile } from 'node:fs/promises';
import { gzipSync, gunzipSync } from 'node:zlib';
import { NodeIO } from '@gltf-transform/core';
import {
  ALL_EXTENSIONS,
  EXTMeshoptCompression,
} from '@gltf-transform/extensions';
import { MeshoptEncoder, MeshoptDecoder } from 'meshoptimizer';
const input = process.argv[2];
if (!input)
  throw new Error(
    'Usage: node scripts/compress-static-cabin.mjs <exported.croom>',
  );
await Promise.all([MeshoptEncoder.ready, MeshoptDecoder.ready]);
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({
    'meshopt.encoder': MeshoptEncoder,
    'meshopt.decoder': MeshoptDecoder,
  });
const document = await io.readBinary(
  new Uint8Array(gunzipSync(await readFile(input))),
);
document
  .createExtension(EXTMeshoptCompression)
  .setRequired(true)
  .setEncoderOptions({ method: EXTMeshoptCompression.EncoderMethod.QUANTIZE });
const output = gzipSync(await io.writeBinary(document), { level: 9 });
await writeFile(
  new URL('../src/assets/static-cabin.croom', import.meta.url),
  output,
);
console.log(`Compressed static cabin: ${output.byteLength} bytes`);

/** Validate the repository-owned GLB before handing it to the loader. */
export function validateStaticCabin(buffer: ArrayBuffer) {
  if (buffer.byteLength < 24) throw new Error('Incomplete static cabin');
  const view = new DataView(buffer);
  if (
    view.getUint32(0, true) !== 0x46546c67 ||
    view.getUint32(4, true) !== 2 ||
    view.getUint32(8, true) !== buffer.byteLength ||
    view.getUint32(16, true) !== 0x4e4f534a
  )
    throw new Error('Invalid static cabin');
  const length = view.getUint32(12, true);
  if (length > buffer.byteLength - 20)
    throw new Error('Invalid static cabin metadata');
  const json = JSON.parse(
    new TextDecoder().decode(new Uint8Array(buffer, 20, length)),
  );
  if (
    !Array.isArray(json.meshes) ||
    json.meshes.length > 100 ||
    !Array.isArray(json.nodes) ||
    json.nodes.length > 150
  )
    throw new Error('Unexpected cabin complexity');
  if (
    (json.images || []).some((image: { uri?: string }) => image.uri) ||
    (json.buffers || []).some((entry: { uri?: string }) => entry.uri)
  )
    throw new Error('External cabin assets are not allowed');
  return json;
}

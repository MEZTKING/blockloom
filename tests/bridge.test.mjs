import test from 'node:test';
import assert from 'node:assert/strict';
import {
  batchZip,
  capabilities,
  renderTextureSet,
  serializeTextureSet,
  texturePng,
  textureResultZip,
} from '../server/bridge.mjs';

function zipNames(bytes) {
  const buffer = Buffer.from(bytes);
  const signatures = [];
  for (let i = 0; i < buffer.length - 4; i++) {
    if (buffer.readUInt32LE(i) === 0x02014b50) {
      const nameLength = buffer.readUInt16LE(i + 28);
      signatures.push(buffer.toString('utf8', i + 46, i + 46 + nameLength));
    }
  }
  return signatures;
}

test('bridge renders a deterministic three-face set', () => {
  const first = renderTextureSet({ prompt: 'mossy cobblestone with cyan crystals', seed: 42, size: 16 });
  const second = renderTextureSet({ prompt: 'mossy cobblestone with cyan crystals', seed: 42, size: 16 });
  assert.equal(first.material.id, 'cobblestone');
  assert.equal(first.seed, 42);
  assert.equal(first.size, 16);
  assert.ok(first.palette.length >= 4);
  assert.deepEqual([...texturePng(first, 'side')], [...texturePng(second, 'side')]);
  assert.notDeepEqual([...texturePng(first, 'side')], [...texturePng(first, 'top')]);
});

test('JSON serialization exposes faces as data URLs', () => {
  const result = renderTextureSet({ prompt: 'frosted oak planks', seed: 7, size: 32 });
  const json = serializeTextureSet(result);
  assert.equal(json.faces.side.dataUrl.slice(0, 22), 'data:image/png;base64,');
  assert.equal(json.normalized, undefined);
  assert.equal(json.faces.top.dataUrl.startsWith('data:image/png;base64,'), true);
});

test('texture ZIP includes all faces, metadata, and README', async () => {
  const result = renderTextureSet({ prompt: 'cracked deepslate', seed: 9, size: 16 });
  const { zip, filename } = await textureResultZip(result);
  assert.match(filename, /\.zip$/);
  assert.deepEqual(zipNames(zip), ['side.png', 'top.png', 'bottom.png', 'texture.json', 'README.txt']);
});

test('batch ZIP namespaces textures and writes a manifest', async () => {
  const batch = await batchZip([
    { id: 'mossy', prompt: 'mossy cobblestone' },
    { id: 'amber', prompt: 'cracked deepslate with glowing amber veins', size: 32 },
  ]);
  assert.equal(batch.manifest.count, 2);
  assert.equal(batch.manifest.textures[0].id, 'mossy');
  assert.deepEqual(zipNames(batch.zip).sort(), [
    'manifest.json',
    'textures/amber/bottom.png',
    'textures/amber/side.png',
    'textures/amber/texture.json',
    'textures/amber/top.png',
    'textures/mossy/bottom.png',
    'textures/mossy/side.png',
    'textures/mossy/texture.json',
    'textures/mossy/top.png',
  ]);
});

test('capabilities list the recipe vocabulary', () => {
  const caps = capabilities();
  assert.equal(caps.materials.length, 26);
  assert.equal(caps.modifiers.length, 11);
  assert.deepEqual(caps.faces, ['side', 'top', 'bottom']);
  assert.deepEqual(caps.formats, ['png', 'json', 'zip']);
  assert.equal(caps.bridge.aiRequired, false);
});

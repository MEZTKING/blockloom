import test from 'node:test';
import assert from 'node:assert/strict';
import { createZip } from '../js/zip.js';

function readU16(bytes, offset) {
  return bytes[offset] | (bytes[offset + 1] << 8);
}

function readU32(bytes, offset) {
  return (bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16) | (bytes[offset + 3] << 24)) >>> 0;
}

function parseZip(bytes) {
  let eocd = -1;
  for (let i = bytes.length - 22; i >= 0; i--) {
    if (readU32(bytes, i) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  assert.notEqual(eocd, -1, 'end-of-central-directory record');
  const total = readU16(bytes, eocd + 10);
  const centralOffset = readU32(bytes, eocd + 16);
  const entries = [];
  let pos = centralOffset;
  for (let i = 0; i < total; i++) {
    assert.equal(readU32(bytes, pos), 0x02014b50, 'central directory signature');
    const nameLength = readU16(bytes, pos + 28);
    const extraLength = readU16(bytes, pos + 30);
    const commentLength = readU16(bytes, pos + 32);
    const localOffset = readU32(bytes, pos + 42);
    const name = Buffer.from(bytes.slice(pos + 46, pos + 46 + nameLength)).toString('utf8');
    const localNameLength = readU16(bytes, localOffset + 26);
    const localExtraLength = readU16(bytes, localOffset + 28);
    const dataOffset = localOffset + 30 + localNameLength + localExtraLength;
    const size = readU32(bytes, pos + 24);
    const raw = Buffer.from(bytes.slice(dataOffset, dataOffset + size));
    entries.push({ name, data: raw.toString('utf8'), bytes: raw, size });
    pos += 46 + nameLength + extraLength + commentLength;
  }
  return entries;
}

test('zip writer produces a parseable archive', async () => {
  const blob = await createZip([
    { name: 'pack.mcmeta', data: '{"pack":{"pack_format":34}}' },
    { name: 'assets/minecraft/textures/block/stone.png', data: new Uint8Array([137, 80, 78, 71]) },
    { name: 'README.txt', data: 'blockloom' },
  ]);
  assert.equal(blob.type, 'application/zip');
  const entries = parseZip(new Uint8Array(await blob.arrayBuffer()));
  assert.deepEqual(entries.map((entry) => entry.name), [
    'pack.mcmeta',
    'assets/minecraft/textures/block/stone.png',
    'README.txt',
  ]);
  assert.equal(entries[0].data, '{"pack":{"pack_format":34}}');
  assert.deepEqual([...entries[1].bytes], [137, 80, 78, 71]);
  assert.equal(entries[2].data, 'blockloom');
});

test('empty archives are valid', async () => {
  const blob = await createZip([]);
  const entries = parseZip(new Uint8Array(await blob.arrayBuffer()));
  assert.deepEqual(entries, []);
});

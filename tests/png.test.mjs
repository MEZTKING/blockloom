import test from 'node:test';
import assert from 'node:assert/strict';
import { inflateSync } from 'node:zlib';
import { encodePng } from '../server/png.mjs';

function chunks(buffer) {
  const out = [];
  let offset = 8;
  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString('ascii', offset + 4, offset + 8);
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    out.push({ type, data });
    offset += 12 + length;
  }
  return out;
}

test('PNG encoder writes a valid RGBA image', () => {
  const rgba = Uint8Array.from([
    255, 0, 0, 255, 0, 255, 0, 255,
    0, 0, 255, 255, 255, 255, 255, 0,
  ]);
  const png = encodePng(2, 2, rgba);
  assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  const parts = chunks(png);
  assert.deepEqual(parts.map((part) => part.type), ['IHDR', 'IDAT', 'IEND']);
  assert.equal(parts[0].data.readUInt32BE(0), 2);
  assert.equal(parts[0].data.readUInt32BE(4), 2);
  assert.equal(parts[0].data[8], 8);
  assert.equal(parts[0].data[9], 6);
  const raw = inflateSync(parts[1].data);
  assert.equal(raw.length, 2 * (2 * 4 + 1));
  assert.equal(raw[0], 0);
  assert.deepEqual([...raw.subarray(1, 9)], [255, 0, 0, 255, 0, 255, 0, 255]);
  assert.equal(raw[9], 0);
  assert.deepEqual([...raw.subarray(10, 14)], [0, 0, 255, 255]);
});

test('PNG encoder validates buffer length and clamps to limits', () => {
  assert.throws(() => encodePng(2, 2, new Uint8Array(3)), /expected/);
  const png = encodePng(4096, 1, new Uint8Array(2048 * 4));
  assert.equal(png.readUInt32BE(16), 2048);
});

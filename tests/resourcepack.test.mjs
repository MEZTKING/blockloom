import test from 'node:test';
import assert from 'node:assert/strict';
import {
  GRASS_TINT_FREE_MODEL,
  GRASS_TINT_FREE_MODEL_PATH,
  PACK_FORMATS,
  PACK_TARGETS,
  getPackFormat,
  getPackTarget,
  packTargetFor,
} from '../js/resourcepack.js';

test('pack targets cover all vanilla texture mappings', () => {
  assert.equal(PACK_TARGETS.length, 26);
  assert.equal(new Set(PACK_TARGETS.map((target) => target.id)).size, 26);
  for (const target of PACK_TARGETS) {
    assert.ok(target.label);
    assert.ok(target.files.length >= 1);
    for (const file of target.files) {
      assert.ok(file.path);
      assert.ok(['side', 'top', 'bottom'].includes(file.face) || file.transparent);
    }
  }
});

test('multi-face mappings are correct', () => {
  const grass = getPackTarget('grass_block');
  assert.equal(grass.files.length, 3);
  assert.deepEqual(grass.files.map((file) => file.path), [
    'grass_block_top',
    'grass_block_side',
    'grass_block_side_overlay',
  ]);
  assert.equal(grass.files[2].transparent, true);
  const log = packTargetFor('oak_log');
  assert.deepEqual(log.files.map((file) => file.path), ['oak_log', 'oak_log_top']);
  assert.ok(getPackTarget('leaves').note);
});

test('format profiles include legacy and current metadata', () => {
  assert.equal(PACK_FORMATS.length, 3);
  assert.deepEqual(PACK_FORMATS.map((format) => format.packFormat), [15, 34, 69]);
  const broad = getPackFormat('broad');
  assert.deepEqual(broad.supportedFormats, [15, 99]);
  assert.equal(broad.minFormat, 15);
  assert.equal(broad.maxFormat, 99);
  assert.equal(getPackFormat('missing').id, 'modern');
  assert.ok(PACK_FORMATS.every((format) => format.note && format.label));
});


test('tint-free grass override is a complete vanilla model with no tint indices', () => {
  assert.equal(GRASS_TINT_FREE_MODEL_PATH, 'assets/minecraft/models/block/grass_block.json');
  assert.equal(GRASS_TINT_FREE_MODEL.parent, 'block/block');
  assert.equal(GRASS_TINT_FREE_MODEL.elements.length, 2);
  assert.equal(GRASS_TINT_FREE_MODEL.elements[0].faces.up.texture, '#top');
  assert.ok(!JSON.stringify(GRASS_TINT_FREE_MODEL).includes('tintindex'));
});

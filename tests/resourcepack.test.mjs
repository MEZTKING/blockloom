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
import { MATERIALS } from '../core/index.js';

test('pack targets cover all vanilla texture mappings', () => {
  assert.equal(PACK_TARGETS.length, 89);
  assert.equal(new Set(PACK_TARGETS.map((target) => target.id)).size, 89);
  assert.ok(PACK_TARGETS.every((target) => target.group));
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

test('all 90 recipe families map to a real target', () => {
  for (const material of MATERIALS) {
    const target = packTargetFor(material.id);
    assert.ok(target, material.id);
    assert.notEqual(target.id, undefined);
    assert.ok(target.files.length >= 1, material.id);
  }
});

test('new families use their actual vanilla texture paths', () => {
  const cases = {
    stained_glass_red: 'red_stained_glass',
    wool_red: 'red_wool',
    concrete_red: 'red_concrete',
    iron_block: 'iron_block',
    oxidized_copper: 'oxidized_copper',
    stone_bricks: 'stone_bricks',
    glass: 'glass',
    leaves_cutout: 'oak_leaves',
  };
  for (const [materialId, path] of Object.entries(cases)) {
    const target = packTargetFor(materialId);
    assert.equal(target.files[0].path, path, materialId);
    assert.ok(target.group, materialId);
  }
});

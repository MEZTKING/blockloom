import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ITEM_ENGINE_VERSION,
  ITEM_MATERIALS,
  ITEM_TYPES,
  generateItem,
  itemTargetId,
  listItemMaterials,
  listItemTypes,
} from '../core/index.js';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const golden = JSON.parse(readFileSync(join(root, 'core/item-golden.json'), 'utf8'));

test('item generator exposes types, materials, and target names', () => {
  assert.equal(ITEM_TYPES.length, 6);
  assert.equal(ITEM_MATERIALS.length, 8);
  assert.equal(listItemTypes().length, 6);
  assert.equal(listItemMaterials().length, 8);
  assert.equal(itemTargetId('sword', 'iron'), 'iron_sword');
  assert.equal(itemTargetId('bow', 'diamond'), 'bow');
  assert.equal(itemTargetId('shield', 'gold'), 'shield');
});

test('item sprites are deterministic, opaque, and contain transparency', () => {
  const a = generateItem({ type: 'sword', material: 'diamond', seed: 42, size: 16 });
  const b = generateItem({ type: 'sword', material: 'diamond', seed: 42, size: 16 });
  assert.equal(a.width, 16);
  assert.equal(a.height, 16);
  assert.equal(a.rgba.length, 16 * 16 * 4);
  assert.deepEqual([...a.rgba], [...b.rgba]);
  assert.equal(a.version, ITEM_ENGINE_VERSION);
  assert.ok([...a.rgba.filter((_, index) => index % 4 === 3)].some((alpha) => alpha === 0));
  assert.ok([...a.rgba.filter((_, index) => index % 4 === 3)].some((alpha) => alpha === 255));
});

test('item golden hashes stay pinned', () => {
  assert.equal(ITEM_ENGINE_VERSION, golden.engineVersion);
  for (const item of golden.cases) {
    const result = generateItem({ type: item.type, material: item.material, seed: golden.seed, size: 16 });
    const hash = createHash('sha256').update(result.rgba).digest('hex');
    assert.equal(hash, item.hash, `${item.type}/${item.material}`);
    assert.equal(result.recipe.itemId, item.itemId);
  }
});

test('32 and 64 px item sprites scale cleanly', () => {
  for (const size of [32, 64]) {
    const item = generateItem({ type: 'axe', material: 'netherite', seed: 3, size });
    assert.equal(item.width, size);
    assert.equal(item.rgba.length, size * size * 4);
  }
});

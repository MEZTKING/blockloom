import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ITEM_THEMES,
  ITEM_THEME_ENGINE_VERSION,
  generateItemMotif,
  generateItemThemeSheet,
  listItemThemes,
} from '../core/index.js';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const golden = JSON.parse(readFileSync(join(root, 'core/itemtheme-golden.json'), 'utf8'));

test('five item theme families expose 16 distinct motifs each', () => {
  assert.equal(ITEM_THEMES.length, 5);
  assert.equal(listItemThemes().length, 5);
  for (const theme of ITEM_THEMES) {
    assert.equal(theme.motifs.length, 16, theme.id);
    assert.equal(new Set(theme.motifs.map(([id]) => id)).size, 16, theme.id);
    const sheet = generateItemThemeSheet({ themeId: theme.id, seed: 20261124 });
    assert.equal(sheet.motifs.length, 16);
    const hashes = new Set(sheet.motifs.map((motif) => createHash('sha256').update(motif.rgba).digest('hex')));
    assert.equal(hashes.size, 16, `${theme.id} motifs must differ from each other`);
  }
});

test('item motifs are transparent sprites with visible pixels', () => {
  for (const theme of ITEM_THEMES) {
    for (const [id] of theme.motifs) {
      const result = generateItemMotif({ themeId: theme.id, motifId: id, seed: 7 });
      assert.equal(result.width, 16);
      assert.equal(result.height, 16);
      assert.equal(result.rgba.length, 16 * 16 * 4);
      const alphas = [...result.rgba].filter((_, index) => index % 4 === 3);
      const opaque = alphas.filter((alpha) => alpha === 255).length;
      assert.ok(opaque > 20, `${theme.id}/${id} has too few visible pixels`);
      assert.ok(opaque < 200, `${theme.id}/${id} is not a cut-out sprite`);
      assert.equal(result.version, ITEM_THEME_ENGINE_VERSION);
      assert.equal(result.recipe.theme, theme.id);
      assert.equal(result.recipe.motif, id);
    }
  }
});

test('item motifs scale by whole pixels without blurring', () => {
  const small = generateItemMotif({ themeId: 'jade_axe', motifId: 'jade_sun', seed: 3, size: 16 });
  const big = generateItemMotif({ themeId: 'jade_axe', motifId: 'jade_sun', seed: 3, size: 32 });
  assert.equal(big.width, 32);
  assert.equal(big.rgba.length, 32 * 32 * 4);
  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < 32; x++) {
      const src = (Math.floor(y / 2) * 16 + Math.floor(x / 2)) * 4;
      const dst = (y * 32 + x) * 4;
      assert.deepEqual([...big.rgba.subarray(dst, dst + 4)], [...small.rgba.subarray(src, src + 4)]);
    }
  }
});

test('item motif golden hashes stay pinned', () => {
  assert.equal(ITEM_THEME_ENGINE_VERSION, golden.engineVersion);
  assert.equal(golden.cases.length, 80);
  for (const item of golden.cases) {
    const result = generateItemMotif({ themeId: item.theme, motifId: item.motif, seed: golden.seed, size: 16 });
    assert.equal(createHash('sha256').update(result.rgba).digest('hex'), item.hash, `${item.theme}/${item.motif}`);
  }
});

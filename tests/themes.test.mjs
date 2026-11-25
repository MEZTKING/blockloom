import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  THEMES,
  THEME_ENGINE_VERSION,
  detectTheme,
  generateThemeMotif,
  generateThemeSheet,
  listThemes,
} from '../core/index.js';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const golden = JSON.parse(readFileSync(join(root, 'core/theme-golden.json'), 'utf8'));

test('four theme sheets expose 16 distinct motifs each', () => {
  assert.equal(THEMES.length, 4);
  assert.equal(listThemes().length, 4);
  for (const theme of THEMES) {
    assert.equal(theme.motifs.length, 16, theme.id);
    assert.equal(new Set(theme.motifs.map(([id]) => id)).size, 16, theme.id);
    const sheet = generateThemeSheet({ themeId: theme.id, seed: 20261124 });
    assert.equal(sheet.motifs.length, 16);
    assert.ok(sheet.motifs.every((motif) => motif.rgba.some((value, index) => index % 4 === 3 && value === 255)));
  }
});

test('theme detection maps the reference prompts', () => {
  assert.equal(detectTheme('black and white checkerboard tiles with brass trim'), 'brass_checker');
  assert.equal(detectTheme('white marble with gold inlay'), 'gold_marble');
  assert.equal(detectTheme('sunken aztec temple with turquoise mosaics and gold glyphs'), 'aztec_temple');
  assert.equal(detectTheme('sky blue and white, city of heaven above the clouds'), 'celestial');
});

test('theme motifs are deterministic and scale', () => {
  const a = generateThemeMotif({ themeId: 'aztec_temple', motifId: 'jaguar_relief_block', seed: 42, size: 16 });
  const b = generateThemeMotif({ themeId: 'aztec_temple', motifId: 'jaguar_relief_block', seed: 42, size: 16 });
  assert.deepEqual([...a.rgba], [...b.rgba]);
  assert.equal(a.version, THEME_ENGINE_VERSION);
  for (const size of [32, 64]) {
    const c = generateThemeMotif({ themeId: 'gold_marble', motifId: 'veined_marble', seed: 1, size });
    assert.equal(c.width, size);
    assert.equal(c.rgba.length, size * size * 4);
  }
});

test('theme golden hashes stay pinned', () => {
  for (const item of golden.cases) {
    const result = generateThemeMotif({ themeId: item.theme, motifId: item.motif, seed: golden.seed, size: 16 });
    assert.equal(createHash('sha256').update(result.rgba).digest('hex'), item.hash, `${item.theme}/${item.motif}`);
  }
});

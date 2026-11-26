import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ENGINE_VERSION,
  MATERIAL_GROUPS,
  MATERIALS,
  generate,
  generateSet,
  getMaterial,
  listMaterials,
  listModifiers,
  parsePrompt,
  textureTitle,
} from '../core/index.js';

const root = dirname(dirname(fileURLToPath(import.meta.url)));

test('core API returns deterministic RGBA and a resolved recipe', () => {
  const first = generate({
    prompt: 'mossy cobblestone with tiny cyan crystals',
    seed: 123,
    size: 16,
    face: 'side',
    finish: 'balanced',
  });
  const second = generate({
    prompt: 'mossy cobblestone with tiny cyan crystals',
    seed: 123,
    size: 16,
    face: 'side',
    finish: 'balanced',
  });
  assert.equal(first.width, 16);
  assert.equal(first.height, 16);
  assert.ok(first.rgba instanceof Uint8ClampedArray);
  assert.equal(first.rgba.length, 16 * 16 * 4);
  assert.equal(first.version, ENGINE_VERSION);
  assert.equal(first.recipe.materialId, 'cobblestone');
  assert.deepEqual([...first.rgba], [...second.rgba]);
});

test('explicit recipes and prompt recipes resolve the same way', () => {
  const recipe = listMaterials().find((material) => material.id === 'oxidized_copper');
  const byRecipe = generate({ recipe, seed: 4, size: 16, face: 'side' });
  const byPrompt = generate({ prompt: 'oxidized copper block', seed: 4, size: 16, face: 'side' });
  assert.equal(byRecipe.recipe.materialId, 'oxidized_copper');
  assert.equal(byPrompt.recipe.materialId, 'oxidized_copper');
  assert.deepEqual([...byRecipe.rgba], [...byPrompt.rgba]);
});

test('new families are present and parseable', () => {
  assert.equal(MATERIALS.length, 90);
  assert.ok(MATERIAL_GROUPS.includes('Glass'));
  assert.ok(MATERIAL_GROUPS.includes('Wool'));
  assert.ok(MATERIAL_GROUPS.includes('Concrete'));
  assert.ok(MATERIAL_GROUPS.includes('Metal'));
  assert.equal(parsePrompt('red stained glass').materialId, 'stained_glass_red');
  assert.equal(parsePrompt('blue concrete').materialId, 'concrete_blue');
  assert.equal(parsePrompt('weathered copper').materialId, 'weathered_copper');
  assert.equal(parsePrompt('cutout leaves').materialId, 'leaves_cutout');
  assert.equal(getMaterial('leaves_cutout').type, 'leaves_cutout');
  assert.equal(listModifiers().length, 11);
  assert.match(textureTitle('leaves_cutout', []), /Cutout Leaves/);
});

test('transparent families emit alpha and opaque families stay opaque', () => {
  for (const id of ['glass', 'stained_glass_blue', 'leaves_cutout']) {
    const result = generate({ recipe: id, seed: 1, size: 16, face: 'side' });
    const alpha = new Set();
    for (let i = 3; i < result.rgba.length; i += 4) alpha.add(result.rgba[i]);
    assert.ok([...alpha].some((value) => value < 255), `${id} should contain transparency`);
  }
  const opaque = generate({ recipe: 'bricks', seed: 1, size: 16, face: 'side' });
  for (let i = 3; i < opaque.rgba.length; i += 4) assert.equal(opaque.rgba[i], 255);
});

test('core modules contain no DOM, canvas, network, or randomness', () => {
  for (const file of ['engine.js', 'data.js', 'items.js', 'itemthemes.js', 'themes.js', 'index.js']) {
    const source = readFileSync(join(root, 'core', file), 'utf8');
    assert.doesNotMatch(source, /\bdocument\.|\bwindow\.|HTMLCanvasElement|\bfetch\s*\(/, file);
    assert.doesNotMatch(source, /Math\.random|Date\.now/, file);
  }
});

test('generateSet returns side, top, and bottom from one recipe', () => {
  const set = generateSet({ prompt: 'cutout leaves', seed: 11, size: 16 });
  assert.equal(set.version, ENGINE_VERSION);
  assert.equal(set.recipe.materialId, 'leaves_cutout');
  assert.deepEqual(Object.keys(set.faces), ['side', 'top', 'bottom']);
  for (const face of ['side', 'top', 'bottom']) {
    const single = generate({ recipe: set.recipe, seed: 11, size: 16, face });
    assert.deepEqual([...set.faces[face].rgba], [...single.rgba]);
  }
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  FINISHES,
  MATERIALS,
  MODIFIERS,
  parsePrompt,
  renderTextureBuffer,
  textureTitle,
} from '../js/engine.js';

const base = {
  seed: 482910,
  size: 16,
  finish: 'balanced',
  grain: 58,
  contrast: 55,
  hue: 0,
  modifiers: [],
};

function diff(buffer, a, b) {
  return Math.abs(buffer[a] - buffer[b])
    + Math.abs(buffer[a + 1] - buffer[b + 1])
    + Math.abs(buffer[a + 2] - buffer[b + 2]);
}

function seamRatio(buffer, size) {
  let edge = 0;
  let edgeCount = 0;
  let inner = 0;
  let innerCount = 0;
  for (let y = 0; y < size; y++) {
    edge += diff(buffer, (y * size) * 4, (y * size + size - 1) * 4);
    edgeCount += 1;
    for (let x = 1; x < size; x++) {
      inner += diff(buffer, (y * size + x - 1) * 4, (y * size + x) * 4);
      innerCount += 1;
    }
  }
  for (let x = 0; x < size; x++) {
    edge += diff(buffer, x * 4, ((size - 1) * size + x) * 4);
    edgeCount += 1;
    for (let y = 1; y < size; y++) {
      inner += diff(buffer, ((y - 1) * size + x) * 4, (y * size + x) * 4);
      innerCount += 1;
    }
  }
  return (edge / edgeCount) / Math.max(1, inner / innerCount);
}

test('the recipe library is complete', () => {
  assert.equal(MATERIALS.length, 26);
  assert.equal(new Set(MATERIALS.map((material) => material.id)).size, MATERIALS.length);
  assert.equal(FINISHES.length, 3);
  assert.ok(MODIFIERS.length >= 10);
});

test('prompt parser extracts materials, effects, colours, and accents', () => {
  const moss = parsePrompt('mossy cobblestone with tiny cyan crystals');
  assert.equal(moss.materialId, 'cobblestone');
  assert.ok(moss.modifiers.includes('mossy'));
  assert.ok(moss.modifiers.includes('crystal'));
  assert.equal(moss.color.name, 'Cyan');
  assert.equal(moss.colorAsAccent, true);

  const tint = parsePrompt('blue stone');
  assert.equal(tint.materialId, 'stone');
  assert.equal(tint.color.name, 'Blue');
  assert.equal(tint.colorAsAccent, false);

  const amber = parsePrompt('cracked deepslate with glowing amber veins');
  assert.equal(amber.materialId, 'deepslate');
  assert.ok(amber.modifiers.includes('cracked'));
  assert.ok(amber.modifiers.includes('glowing'));
  assert.ok(amber.modifiers.includes('flecked'));
  assert.equal(amber.colorAsAccent, true);

  const unknown = parsePrompt('a completely mysterious thing');
  assert.equal(unknown.materialId, null);
});

test('titles stay compact', () => {
  const title = textureTitle('deepslate', ['ancient', 'cracked', 'frosted', 'guilded', 'mossy', 'glowing']);
  assert.ok(title.endsWith('Deepslate'));
  assert.ok(title.split(' ').length <= 3);
});

test('every material and face renders a complete RGBA buffer', () => {
  for (const material of MATERIALS) {
    for (const face of ['side', 'top', 'bottom']) {
      const texture = renderTextureBuffer({ ...base, materialId: material.id, face });
      assert.equal(texture.buffer.length, 16 * 16 * 4, `${material.id}/${face} buffer size`);
      for (let i = 3; i < texture.buffer.length; i += 4) {
        assert.equal(texture.buffer[i], 255, `${material.id}/${face} alpha at ${i}`);
      }
    }
  }
});

test('rendering is deterministic for a seed and changes with a new seed', () => {
  const params = { ...base, materialId: 'cobblestone' };
  const first = renderTextureBuffer(params);
  const second = renderTextureBuffer(params);
  const third = renderTextureBuffer({ ...params, seed: 482911 });
  assert.deepEqual([...first.buffer], [...second.buffer]);
  assert.notDeepEqual([...first.buffer], [...third.buffer]);
});

test('all finishes and effect overlays render', () => {
  for (const finish of FINISHES) {
    const texture = renderTextureBuffer({ ...base, materialId: 'stone', finish: finish.id });
    assert.equal(texture.buffer.length, 1024);
  }
  for (const modifier of MODIFIERS) {
    const texture = renderTextureBuffer({ ...base, materialId: 'cobblestone', modifiers: [modifier.id] });
    assert.equal(texture.buffer.length, 1024, modifier.id);
  }
});

test('surface textures pass a seam sanity check', () => {
  for (const material of MATERIALS) {
    const texture = renderTextureBuffer({ ...base, materialId: material.id, face: 'side' });
    const ratio = seamRatio(texture.buffer, 16);
    assert.ok(ratio < 2.6, `${material.id} seam ratio ${ratio.toFixed(2)}`);
  }
});

test('grass and log faces are distinct', () => {
  const grassSide = renderTextureBuffer({ ...base, materialId: 'grass_block', face: 'side' });
  const grassTop = renderTextureBuffer({ ...base, materialId: 'grass_block', face: 'top' });
  const logSide = renderTextureBuffer({ ...base, materialId: 'oak_log', face: 'side' });
  const logTop = renderTextureBuffer({ ...base, materialId: 'oak_log', face: 'top' });
  assert.notDeepEqual([...grassSide.buffer], [...grassTop.buffer]);
  assert.notDeepEqual([...logSide.buffer], [...logTop.buffer]);
});

test('larger resolutions stay complete and deterministic', () => {
  for (const size of [32, 64]) {
    const texture = renderTextureBuffer({ ...base, size, materialId: 'cobblestone' });
    assert.equal(texture.buffer.length, size * size * 4);
    assert.equal(texture.size, size);
  }
});

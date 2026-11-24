import test from 'node:test';
import assert from 'node:assert/strict';
import { importSummary, importTitle, planTextureImport } from '../js/importer.js';

test('square block and item textures keep their resolution', () => {
  const plan = planTextureImport(32, 32);
  assert.equal(plan.ok, true);
  assert.equal(plan.targetSize, 32);
  assert.equal(plan.frames, 1);
  assert.equal(plan.animated, false);
});

test('large textures are losslessly planned for a 512 px cap', () => {
  const plan = planTextureImport(1024, 1024);
  assert.equal(plan.ok, true);
  assert.equal(plan.targetSize, 512);
  assert.equal(plan.scaled, true);
});

test('vertical animation strips import the first frame', () => {
  const plan = planTextureImport(16, 64);
  assert.equal(plan.ok, true);
  assert.equal(plan.frames, 4);
  assert.equal(plan.animated, true);
  assert.equal(plan.cropHeight, 16);
  assert.equal(plan.targetSize, 16);
  assert.match(importSummary(plan), /frame 1 of 4/);
});

test('non-square GUI and armor sheets are rejected clearly', () => {
  const plan = planTextureImport(64, 32);
  assert.equal(plan.ok, false);
  assert.match(plan.reason, /must be square/);
});

test('filenames become readable titles', () => {
  assert.equal(importTitle('oak_planks.png'), 'Oak Planks');
  assert.equal(importTitle('deepslate-top.PNG'), 'Deepslate Top');
  assert.equal(importTitle('.png'), 'Imported texture');
});

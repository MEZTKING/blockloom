import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ENGINE_VERSION, generate } from '../core/index.js';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const golden = JSON.parse(readFileSync(join(root, 'core/golden.json'), 'utf8'));

test('golden texture hashes pin the engine output', () => {
  assert.equal(ENGINE_VERSION, golden.engineVersion);
  for (const item of golden.cases) {
    const result = generate({ prompt: item.prompt, seed: golden.seed, size: item.size, face: item.face, finish: 'balanced' });
    const hash = createHash('sha256').update(result.rgba).digest('hex');
    assert.equal(hash, item.hash, `${item.prompt} (${item.face}, ${item.size}px) — update ENGINE_VERSION before changing this hash`);
    assert.equal(result.version, ENGINE_VERSION);
  }
});

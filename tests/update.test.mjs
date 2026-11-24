import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { compareVersions, parseVersion, releaseInfo } from '../js/update.js';
import { APP_VERSION } from '../js/version.js';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const packageJson = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));

test('application version stays in sync with package.json', () => {
  assert.equal(APP_VERSION, packageJson.version);
  assert.deepEqual(parseVersion(`v${APP_VERSION}`), APP_VERSION.split('.').map(Number));
});

test('version comparison handles minor and patch releases', () => {
  assert.equal(compareVersions('1.10.0', '1.9.9'), 1);
  assert.equal(compareVersions('1.9.9', '1.10.0'), -1);
  assert.equal(compareVersions('v1.10.0', '1.10.0'), 0);
  assert.equal(compareVersions('nonsense', '1.10.0'), 0);
});

test('release metadata identifies a newer GitHub release', () => {
  const info = releaseInfo({ tag_name: 'v1.11.0', html_url: 'https://github.com/MEZTKING/blockloom/releases/tag/v1.11.0', body: 'notes' }, '1.10.0');
  assert.equal(info.latest, '1.11.0');
  assert.equal(info.newer, true);
  assert.match(info.url, /github\.com/);
  assert.equal(releaseInfo({ tag_name: 'v1.10.0' }, '1.10.0').newer, false);
});

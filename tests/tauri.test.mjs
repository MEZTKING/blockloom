import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const packageJson = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const config = JSON.parse(readFileSync(join(root, 'src-tauri/tauri.conf.json'), 'utf8'));
const capability = JSON.parse(readFileSync(join(root, 'src-tauri/capabilities/default.json'), 'utf8'));
const mobileCapability = JSON.parse(readFileSync(join(root, 'src-tauri/capabilities/mobile.json'), 'utf8'));
const rust = readFileSync(join(root, 'src-tauri/src/lib.rs'), 'utf8');
const cargo = readFileSync(join(root, 'src-tauri/Cargo.toml'), 'utf8');
const app = readFileSync(join(root, 'js/app.js'), 'utf8');
const engine = readFileSync(join(root, 'js/engine.js'), 'utf8');

test('Tauri config packages the same app version for Windows', () => {
  assert.equal(config.productName, 'Blockloom');
  assert.equal(config.version, packageJson.version);
  assert.match(cargo, new RegExp(`version = "${packageJson.version.replace(/\./g, '\\.')}"`));
  assert.equal(config.identifier, 'com.meztking.blockloom');
  assert.equal(config.build.devUrl, 'http://localhost:4173');
  assert.equal(config.build.frontendDist, '../dist');
  assert.equal(config.build.beforeBuildCommand, 'npm run build:native');
  assert.deepEqual(config.bundle.targets, ['msi', 'nsis']);
  assert.equal(config.bundle.windows.nsis.installMode, 'currentUser');
});

test('Tauri icons, capability, and native save command exist', () => {
  for (const icon of config.bundle.icon) {
    assert.ok(existsSync(join(root, 'src-tauri', icon)), icon);
  }
  assert.ok(capability.permissions.includes('core:default'));
  assert.ok(capability.permissions.includes('dialog:default'));
  assert.deepEqual(mobileCapability.platforms, ['android']);
  assert.ok(mobileCapability.permissions.includes('dialog:default'));
  assert.match(rust, /fn save_file/);
  assert.match(rust, /blocking_save_file/);
  assert.match(rust, /fn open_external/);
  assert.match(rust, /releases\//);
  assert.match(engine, /save_file/);
  assert.match(engine, /__TAURI_INTERNALS__/);
});

test('native shell disables AI, service worker, and uses the web share origin', () => {
  assert.match(app, /const IS_TAURI = Boolean\(window\.__TAURI_INTERNALS__\)/);
  assert.match(app, /IS_TAURI \|\| IS_STATIC_DEMO/);
  assert.match(app, /if \(IS_TAURI \|\| !\('serviceWorker' in navigator\)/);
  assert.match(app, /https:\/\/meztking\.github\.io/);
  assert.match(app, /api\.github\.com/);
  assert.match(app, /Desktop build/);
});

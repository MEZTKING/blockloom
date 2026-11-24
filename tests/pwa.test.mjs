import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const manifest = JSON.parse(readFileSync(join(root, 'manifest.webmanifest'), 'utf8'));
const worker = readFileSync(join(root, 'sw.js'), 'utf8');
const packageJson = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));

test('web app manifest is installable and offline-first', () => {
  assert.equal(manifest.start_url, './');
  assert.equal(manifest.scope, './');
  assert.equal(manifest.display, 'standalone');
  assert.equal(manifest.theme_color, '#0b0d09');
  assert.ok(manifest.icons.some((icon) => icon.sizes === '192x192'));
  assert.ok(manifest.icons.some((icon) => icon.sizes === '512x512'));
  assert.ok(manifest.icons.some((icon) => icon.purpose === 'maskable'));
  for (const icon of manifest.icons) {
    assert.ok(existsSync(join(root, icon.src)), icon.src);
  }
});

test('service worker caches the full app shell', () => {
  assert.ok(worker.includes(`const CACHE = 'blockloom-v${packageJson.version}'`));
  const assets = [...worker.matchAll(/'\.\/([^']*)'/g)].map((match) => match[1]);
  const required = [
    '',
    'index.html',
    'styles.css',
    'manifest.webmanifest',
    'js/app.js',
    'js/engine.js',
    'js/ai.js',
    'js/finisher.js',
    'js/library.js',
    'js/resourcepack.js',
    'js/zip.js',
    'js/share.js',
    'assets/fonts/space-grotesk.woff2',
    'assets/fonts/ibm-plex-mono-400.woff2',
    'assets/fonts/ibm-plex-mono-500.woff2',
    'assets/fonts/silkscreen.woff2',
    'assets/favicon.svg',
    'assets/icon-192.png',
    'assets/icon-512.png',
    'assets/icon-512-maskable.png',
  ];
  for (const file of required) {
    assert.ok(assets.includes(file), `missing cached asset: ${file || 'root'}`);
    if (file) assert.ok(existsSync(join(root, file)), file);
  }
  assert.ok(worker.includes("url.pathname.includes('/api/')"));
  assert.ok(worker.includes("request.mode === 'navigate'"));
});

import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import net from 'node:net';

let child;
let base;
const TOKEN = 'test-bridge-token';

async function freePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
  });
}

async function waitForServer(process, port) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Server did not start')), 8000);
    const onData = (chunk) => {
      if (chunk.toString().includes(`127.0.0.1:${port}`)) {
        clearTimeout(timer);
        process.stdout.off('data', onData);
        resolve();
      }
    };
    process.stdout.on('data', onData);
    process.once('exit', (code) => {
      clearTimeout(timer);
      reject(new Error(`Server exited early with ${code}`));
    });
  });
}

before(async () => {
  const port = await freePort();
  base = `http://127.0.0.1:${port}`;
  child = spawn(process.execPath, ['server.mjs'], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      HOST: '127.0.0.1',
      PORT: String(port),
      BRIDGE_TOKEN: TOKEN,
      AI_ENABLED: 'false',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  await waitForServer(child, port);
});

after(async () => {
  if (child && !child.killed) {
    child.kill('SIGTERM');
    await new Promise((resolve) => {
      const timer = setTimeout(resolve, 2000);
      child.once('exit', () => { clearTimeout(timer); resolve(); });
    });
  }
});

test('bridge rejects missing token', async () => {
  const response = await fetch(`${base}/api/health`);
  assert.equal(response.status, 401);
});

test('health and materials work with a bearer token', async () => {
  const response = await fetch(`${base}/api/health`, { headers: { Authorization: `Bearer ${TOKEN}` } });
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.service, 'blockloom-local-bridge');
  assert.equal(body.aiRequired, false);
  assert.equal(body.capabilities.materials, 90);
  const materials = await fetch(`${base}/api/materials`, { headers: { 'X-Blockloom-Token': TOKEN } });
  assert.equal((await materials.json()).modifiers.length, 11);
});

test('GET generate returns a 16px PNG, JSON, and ZIP', async () => {
  const auth = { Authorization: `Bearer ${TOKEN}` };
  const png = await fetch(`${base}/api/generate?prompt=mossy%20cobblestone&seed=42&size=16`, { headers: auth });
  assert.equal(png.headers.get('content-type'), 'image/png');
  const pngBytes = Buffer.from(await png.arrayBuffer());
  assert.deepEqual([...pngBytes.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  assert.equal(pngBytes.readUInt32BE(16), 16);

  const json = await fetch(`${base}/api/generate?prompt=frosted%20oak%20planks&seed=7&size=32&format=json`, { headers: auth });
  const body = await json.json();
  assert.equal(body.ok, true);
  assert.equal(body.material.id, 'oak_planks');
  assert.ok(body.faces.side.dataUrl.startsWith('data:image/png;base64,'));

  const zip = await fetch(`${base}/api/generate?prompt=cracked%20deepslate&seed=9&size=32&format=zip`, { headers: auth });
  assert.equal(zip.headers.get('content-type'), 'application/zip');
  assert.equal(zip.headers.get('x-blockloom-seed'), '9');
  assert.ok((await zip.arrayBuffer()).byteLength > 1000);
});

test('POST generate accepts explicit effects and batch returns a manifest ZIP', async () => {
  const auth = { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' };
  const generated = await fetch(`${base}/api/generate`, {
    method: 'POST',
    headers: auth,
    body: JSON.stringify({ prompt: 'ancient stone', seed: 3, size: 16, format: 'json', modifiers: ['ancient', 'gilded'] }),
  });
  const body = await generated.json();
  assert.deepEqual(body.modifiers, ['ancient', 'gilded']);
  assert.equal(body.accent, '#e9c253');

  const batch = await fetch(`${base}/api/batch`, {
    method: 'POST',
    headers: auth,
    body: JSON.stringify({ items: [{ id: 'mossy', prompt: 'mossy cobblestone' }, { id: 'amber', prompt: 'cracked deepslate' }] }),
  });
  assert.equal(batch.status, 200);
  assert.equal(batch.headers.get('x-blockloom-count'), '2');
  assert.ok((await batch.arrayBuffer()).byteLength > 2000);
});

test('CORS preflight allows local development origins', async () => {
  const response = await fetch(`${base}/api/generate`, {
    method: 'OPTIONS',
    headers: {
      Origin: 'http://localhost:3000',
      'Access-Control-Request-Method': 'POST',
    },
  });
  assert.equal(response.status, 204);
  assert.equal(response.headers.get('access-control-allow-origin'), 'http://localhost:3000');
  assert.match(response.headers.get('access-control-allow-headers'), /Authorization/);
});

test('item endpoint returns an item PNG and JSON', async () => {
  const auth = { Authorization: `Bearer ${TOKEN}` };
  const png = await fetch(`${base}/api/item?type=sword&material=diamond&seed=4&size=16`, { headers: auth });
  assert.equal(png.headers.get('content-type'), 'image/png');
  const bytes = Buffer.from(await png.arrayBuffer());
  assert.deepEqual([...bytes.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  assert.equal(bytes.readUInt32BE(16), 16);
  const json = await fetch(`${base}/api/item?type=axe&material=iron&format=json`, { headers: auth });
  const body = await json.json();
  assert.equal(body.ok, true);
  assert.equal(body.recipe.itemId, 'iron_axe');
  assert.ok(body.image.startsWith('data:image/png;base64,'));
});

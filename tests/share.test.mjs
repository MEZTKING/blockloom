import test from 'node:test';
import assert from 'node:assert/strict';
import { decodeShare, encodeShare, makeShareUrl, readShareHash } from '../js/share.js';

const payload = {
  v: 1,
  app: 'Blockloom',
  title: 'Mossy Cobblestone',
  materialId: 'cobblestone',
  seed: 482910,
  size: 16,
  palette: ['#5c5c5c', '#7a7b76', '#62ebe6'],
  faces: {
    side: 'data:image/png;base64,AAAA',
    top: 'data:image/png;base64,AAAA',
    bottom: 'data:image/png;base64,AAAA',
  },
  modifiers: ['mossy', 'crystal'],
};

test('share payloads round-trip through compressed URL tokens', async () => {
  const token = await encodeShare(payload);
  assert.ok(token.startsWith('gz.'));
  const decoded = await decodeShare(token);
  assert.deepEqual(decoded, payload);
});

test('share URLs stay in the URL fragment', async () => {
  const url = await makeShareUrl(payload, { origin: 'https://example.test', pathname: '/blockloom/' });
  assert.ok(url.startsWith('https://example.test/blockloom/#blockloom=gz.'));
  const fragment = new URL(url).hash;
  const decoded = await readShareHash(fragment);
  assert.deepEqual(decoded, payload);
});

test('oversize links fail with a useful code', async () => {
  await assert.rejects(
    () => makeShareUrl(payload, { origin: 'https://example.test', pathname: '/', maxLength: 20 }),
    (error) => error.code === 'TOO_LONG',
  );
});

test('unknown versions and malformed tokens are rejected', async () => {
  const token = await encodeShare({ ...payload, v: 2 });
  await assert.rejects(() => decodeShare(token), /Unsupported share link version/);
  await assert.rejects(() => decodeShare('gz.not-base64'), /.+/);
});

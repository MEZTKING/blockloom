/* Shareable texture links: gzip JSON in the URL fragment. No server needed. */

const PREFIX = '#blockloom=';
const GZIP = 'gz.';

function bytesToBase64Url(bytes) {
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlToBytes(value) {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function gzipBytes(bytes) {
  const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream('gzip'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function gunzipBytes(bytes) {
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

export async function encodeShare(payload) {
  const raw = new TextEncoder().encode(JSON.stringify(payload));
  if (typeof CompressionStream === 'function') {
    try {
      return GZIP + bytesToBase64Url(await gzipBytes(raw));
    } catch {
      // Fall through to plain payloads where compression is blocked.
    }
  }
  return bytesToBase64Url(raw);
}

export async function decodeShare(token) {
  if (!token) throw new Error('No share data found.');
  const compressed = token.startsWith(GZIP);
  const bytes = base64UrlToBytes(compressed ? token.slice(GZIP.length) : token);
  let raw = bytes;
  if (compressed) {
    if (typeof DecompressionStream !== 'function') throw new Error('This browser cannot decompress the share link.');
    raw = await gunzipBytes(bytes);
  }
  const payload = JSON.parse(new TextDecoder().decode(raw));
  if (!payload || payload.v !== 1) throw new Error('Unsupported share link version.');
  return payload;
}

export async function makeShareUrl(payload, { origin, pathname, maxLength = 30000 } = {}) {
  const token = await encodeShare(payload);
  const base = origin || location.origin;
  const path = pathname || location.pathname;
  const url = `${base}${path}${PREFIX}${token}`;
  if (url.length > maxLength) {
    const error = new Error('This texture is too detailed for a share link. Export a texture set instead.');
    error.code = 'TOO_LONG';
    throw error;
  }
  return url;
}

export async function readShareHash(hash = location.hash) {
  if (!hash.startsWith(PREFIX)) return null;
  return decodeShare(hash.slice(PREFIX.length));
}

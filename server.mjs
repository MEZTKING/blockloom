import http from 'node:http';
import { createReadStream, statSync } from 'node:fs';
import { extname, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { API_DOCS, BRIDGE_API_VERSION, OPENAPI, batchZip, capabilities, renderItem, renderItemMotif, itemThemeSheetZip, renderTextureSet, renderTheme, serializeItem, serializeItemMotif, serializeTextureSet, serializeTheme, texturePng, textureResultZip, themeSheetZip } from './server/bridge.mjs';
import { ITEM_THEME_ENGINE_VERSION, THEME_ENGINE_VERSION, listItemThemes, listThemes } from './core/index.js';

const root = resolve(fileURLToPath(new URL('.', import.meta.url)));
const port = Number(process.env.PORT) || 4173;
const host = process.env.HOST || '127.0.0.1';
const BRIDGE_TOKEN = process.env.BRIDGE_TOKEN || '';
const BRIDGE_ALLOWED_ORIGINS = (process.env.BRIDGE_ALLOWED_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const AI_PROVIDER = (process.env.AI_PROVIDER || 'pollinations').toLowerCase();
const AI_ENABLED = process.env.AI_ENABLED !== 'false' && AI_PROVIDER !== 'none';
const AI_API_KEY =
  process.env.AI_API_KEY ||
  (AI_PROVIDER === 'openai' ? process.env.OPENAI_API_KEY : '') ||
  (AI_PROVIDER === 'replicate' ? process.env.REPLICATE_API_TOKEN : '') ||
  '';
const AI_BASE_URL = (process.env.AI_BASE_URL || '').replace(/\/$/, '');
const AI_IMAGE_SIZE = Math.min(1536, Math.max(384, Number(process.env.AI_IMAGE_SIZE) || 768));
const AI_TIMEOUT_MS = Math.min(180000, Math.max(10000, Number(process.env.AI_TIMEOUT_MS) || 90000));

const PROVIDERS = {
  pollinations: {
    label: 'Pollinations',
    model: process.env.AI_MODEL || 'sana',
    free: true,
    configured: true,
    privacy: 'Prompts are sent to pollinations.ai, a free public image service.',
  },
  openai: {
    label: 'OpenAI Images',
    model: process.env.AI_MODEL || 'gpt-image-1',
    free: false,
    configured: Boolean(AI_API_KEY),
    privacy: 'Prompts are sent to your configured OpenAI-compatible image endpoint.',
  },
  replicate: {
    label: 'Replicate',
    model: process.env.AI_MODEL || 'black-forest-labs/flux-schnell',
    free: false,
    configured: Boolean(AI_API_KEY),
    privacy: 'Prompts are sent to Replicate and processed by the selected model.',
  },
  a1111: {
    label: 'Local Stable Diffusion',
    model: process.env.AI_MODEL || 'Automatic1111',
    free: true,
    configured: Boolean(AI_BASE_URL),
    privacy: 'Prompts stay on your machine and are sent to your local Automatic1111 endpoint.',
  },
};

const provider = PROVIDERS[AI_PROVIDER];
const aiConfigured = Boolean(AI_ENABLED && provider && provider.configured);

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
};

const rateBuckets = new Map();
const inFlight = new Set();
const POLLINATIONS_COOLDOWN_MS = 45000;
let lastPollinationsAt = 0;

function rateAllowed(ip, limit = 5, windowMs = 60000) {
  const now = Date.now();
  const bucket = rateBuckets.get(ip);
  if (!bucket || now > bucket.reset) {
    rateBuckets.set(ip, { count: 1, reset: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}

function json(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  res.end(body);
}

function readJson(req, maxBytes = 16 * 1024) {
  return new Promise((resolvePromise, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > maxBytes) {
        reject(new Error('Request body too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      try {
        const text = Buffer.concat(chunks).toString('utf8');
        resolvePromise(text ? JSON.parse(text) : {});
      } catch {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

function cleanPrompt(value) {
  return String(value || '')
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 360);
}

function conceptPrompt(userPrompt) {
  const subject = cleanPrompt(userPrompt);
  return [
    subject + '.',
    'A single seamless Minecraft block texture.',
    'Top-down orthographic view, flat even lighting, no shadows, no scene, no perspective.',
    'Pixel art, crisp hard edges, limited palette, dense surface detail, fills the entire square frame.',
    'Tileable four ways, no border, no text, no watermark, no UI.',
  ].join(' ');
}

function timeoutSignal(ms) {
  return AbortSignal.timeout(ms);
}

async function fetchChecked(url, options = {}, timeout = AI_TIMEOUT_MS) {
  const response = await fetch(url, { ...options, signal: timeoutSignal(timeout) });
  if (!response.ok) {
    let detail = '';
    try {
      detail = (await response.text()).slice(0, 240);
    } catch {}
    const err = new Error(`${response.status}${detail ? `: ${detail}` : ''}`);
    err.status = response.status;
    throw err;
  }
  return response;
}

async function imageUrlToDataUrl(url) {
  const response = await fetchChecked(url, { headers: { 'User-Agent': 'Blockloom/1.0' } });
  const type = response.headers.get('content-type') || 'image/png';
  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length > 16 * 1024 * 1024) throw new Error('Generated image is too large');
  if (!type.startsWith('image/')) throw new Error('Provider returned a non-image response');
  return `data:${type};base64,${buffer.toString('base64')}`;
}

async function generatePollinations(prompt, seed) {
  const since = Date.now() - lastPollinationsAt;
  if (since < POLLINATIONS_COOLDOWN_MS) {
    const error = new Error('Free provider cooldown');
    error.status = 402;
    error.retryAfter = Math.ceil((POLLINATIONS_COOLDOWN_MS - since) / 1000);
    throw error;
  }
  const url = new URL(`https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`);
  url.searchParams.set('width', String(AI_IMAGE_SIZE));
  url.searchParams.set('height', String(AI_IMAGE_SIZE));
  url.searchParams.set('seed', String(seed));
  url.searchParams.set('model', provider.model);
  url.searchParams.set('nologo', 'true');
  url.searchParams.set('enhance', 'false');
  url.searchParams.set('referrer', 'blockloom');
  lastPollinationsAt = Date.now();
  let lastError;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(
        url,
        {
          headers: { Accept: 'image/jpeg,image/png,image/*', 'User-Agent': 'Blockloom/1.0' },
          signal: timeoutSignal(Math.max(AI_TIMEOUT_MS, 75000)),
        },
      );
      if (!response.ok) {
        const err = new Error(`Pollinations returned HTTP ${response.status}`);
        err.status = response.status;
        if (response.status === 402 || response.status === 429) {
          lastPollinationsAt = Date.now();
          err.retryAfter = 45;
          throw err;
        }
        throw err;
      }
      const type = response.headers.get('content-type') || 'image/jpeg';
      const buffer = Buffer.from(await response.arrayBuffer());
      if (buffer.length > 16 * 1024 * 1024) throw new Error('Generated image is too large');
      if (!type.startsWith('image/')) throw new Error('Pollinations returned a non-image response');
      return { image: `data:${type};base64,${buffer.toString('base64')}`, model: provider.model };
    } catch (error) {
      lastError = error;
      if (error.status === 402 || error.status === 429) throw error;
      if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 1800 * (attempt + 1)));
    }
  }
  throw lastError || new Error('Pollinations failed');
}

async function generateOpenAI(prompt, seed) {
  const base = AI_BASE_URL || 'https://api.openai.com/v1';
  const vite = AI_IMAGE_SIZE <= 1024 ? `${AI_IMAGE_SIZE}x${AI_IMAGE_SIZE}` : '1024x1024';
  const payload = {
    model: provider.model,
    prompt,
    n: 1,
    size: vite,
  };
  if (/^dall-e/i.test(provider.model)) payload.response_format = 'b64_json';
  const response = await fetchChecked(`${base}/images/generations`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${AI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  const item = data?.data?.[0];
  if (!item) throw new Error('Image endpoint returned no image');
  if (item.b64_json) {
    return { image: `data:image/png;base64,${item.b64_json}`, model: provider.model };
  }
  if (item.url) {
    return { image: await imageUrlToDataUrl(item.url), model: provider.model };
  }
  throw new Error('Image endpoint returned no usable image data');
}

async function generateReplicate(prompt, seed) {
  const base = AI_BASE_URL || 'https://api.replicate.com/v1';
  const response = await fetchChecked(`${base}/models/${provider.model}/predictions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${AI_API_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'wait=60',
    },
    body: JSON.stringify({
      input: {
        prompt,
        seed,
        aspect_ratio: '1:1',
        output_format: 'png',
        num_outputs: 1,
      },
    }),
  });
  let prediction = await response.json();
  const deadline = Date.now() + AI_TIMEOUT_MS;
  while (prediction.status && !['succeeded', 'failed', 'canceled'].includes(prediction.status)) {
    if (Date.now() > deadline) throw new Error('Replicate generation timed out');
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 2000));
    const poll = await fetchChecked(prediction.urls?.get || '', {
      headers: { Authorization: `Bearer ${AI_API_KEY}` },
    });
    prediction = await poll.json();
  }
  if (prediction.status !== 'succeeded') {
    throw new Error(`Replicate generation ${prediction.status || 'failed'}`);
  }
  const output = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
  const url = typeof output === 'string' ? output : output?.url;
  if (!url) throw new Error('Replicate returned no image URL');
  return { image: await imageUrlToDataUrl(url), model: provider.model };
}

async function generateA1111(prompt, seed) {
  const base = AI_BASE_URL || 'http://127.0.0.1:7860';
  const response = await fetchChecked(`${base}/sdapi/v1/txt2img`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: `masterpiece, best quality, ${prompt}`,
      negative_prompt: 'text, watermark, border, frame, perspective, scene, shadow, blurry, low quality',
      width: AI_IMAGE_SIZE,
      height: AI_IMAGE_SIZE,
      steps: 24,
      cfg_scale: 6,
      sampler_name: 'DPM++ 2M',
      seed: seed % 2147483647,
    }),
  });
  const data = await response.json();
  if (!data?.images?.[0]) throw new Error('Automatic1111 returned no image');
  return { image: `data:image/png;base64,${data.images[0]}`, model: provider.model };
}

async function generateImage(rawPrompt, seed) {
  const prompt = conceptPrompt(rawPrompt);
  switch (AI_PROVIDER) {
    case 'pollinations': return generatePollinations(prompt, seed);
    case 'openai': return generateOpenAI(prompt, seed);
    case 'replicate': return generateReplicate(prompt, seed);
    case 'a1111': return generateA1111(prompt, seed);
    default: throw new Error('No image provider configured');
  }
}

function aiStatus() {
  return {
    enabled: AI_ENABLED,
    configured: aiConfigured,
    provider: provider?.label || 'None',
    providerId: AI_ENABLED ? AI_PROVIDER : 'none',
    model: provider?.model || null,
    free: Boolean(provider?.free),
    privacy: provider?.privacy || 'AI generation is disabled.',
    maxPromptLength: 360,
    targetNote: 'The returned concept is downscaled, palette-quantized, and seam-repaired in your browser.',
    rateLimit: AI_PROVIDER === 'pollinations' ? 'Free tier: 1 image / 45 s' : null,
    setup: !aiConfigured
      ? AI_ENABLED
        ? 'Set AI_API_KEY (or OPENAI_API_KEY / REPLICATE_API_TOKEN) and restart, or switch AI_PROVIDER.'
        : 'AI is disabled. Set AI_ENABLED=true or configure a provider to turn it on.'
      : null,
  };
}

const BRIDGE_PATHS = new Set(['/api', '/api/health', '/api/materials', '/api/generate', '/api/batch', '/api/item', '/api/themes', '/api/theme', '/api/theme-sheet', '/api/item-themes', '/api/item-motif', '/api/item-motif-sheet', '/api/openapi.json']);

function isLoopbackHost(value) {
  return value === '127.0.0.1' || value === 'localhost' || value === '::1';
}

function isLoopback(req) {
  const address = req.socket.remoteAddress || '';
  return address === '127.0.0.1' || address === '::1' || address === '::ffff:127.0.0.1';
}

function bridgePath(url) {
  if (url.pathname === '/api') return true;
  return BRIDGE_PATHS.has(url.pathname);
}

function originAllowed(origin) {
  if (!origin) return false;
  if (BRIDGE_ALLOWED_ORIGINS.length) return BRIDGE_ALLOWED_ORIGINS.includes(origin);
  if (BRIDGE_TOKEN) return true;
  return origin === 'null'
    || origin === 'https://meztking.github.io'
    || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
}

function applyBridgeCors(req, res) {
  const origin = req.headers.origin;
  if (!originAllowed(origin)) return false;
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, X-Blockloom-Token');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition, X-Blockloom-Title, X-Blockloom-Seed, X-Blockloom-Material, X-Blockloom-Generator');
  res.setHeader('Access-Control-Max-Age', '600');
  return true;
}

function bridgeAuthorized(req) {
  if (!BRIDGE_TOKEN) return isLoopback(req);
  const bearer = req.headers.authorization || '';
  return bearer === `Bearer ${BRIDGE_TOKEN}` || req.headers['x-blockloom-token'] === BRIDGE_TOKEN;
}

function bridgeInputFromQuery(url) {
  const q = url.searchParams;
  const modifiers = q.get('modifiers') || q.getAll('modifier').join(',');
  return {
    prompt: q.get('prompt') || '',
    materialId: q.get('material') || q.get('materialId') || '',
    seed: q.get('seed') || undefined,
    size: q.get('size') || undefined,
    finish: q.get('finish') || undefined,
    grain: q.get('grain') || undefined,
    contrast: q.get('contrast') || undefined,
    hue: q.get('hue') || undefined,
    modifiers: modifiers || undefined,
    accent: q.get('accent') || undefined,
    tint: q.get('tint') || undefined,
    title: q.get('title') || undefined,
    face: q.get('face') || 'side',
  };
}

function bridgeFormat(value, input, accept = '') {
  const requested = String(value || '').toLowerCase();
  if (requested === 'json' || requested === 'zip' || requested === 'png') return requested;
  if (input.face === 'all') return 'zip';
  if (String(accept).includes('application/json')) return 'json';
  return 'png';
}

function bridgeError(res, status, message) {
  json(res, status, { ok: false, error: message });
}

function sendBuffer(res, status, data, type, filename, headers = {}) {
  const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
  res.writeHead(status, {
    'Content-Type': type,
    'Content-Length': buffer.length,
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    ...headers,
  });
  res.end(buffer);
}

async function sendTextureResult(req, res, result, input, format, { download = false } = {}) {
  const headers = {
    'X-Blockloom-Title': encodeURIComponent(result.title),
    'X-Blockloom-Seed': String(result.seed),
    'X-Blockloom-Material': encodeURIComponent(result.material.name),
    'X-Blockloom-Generator': 'blockloom-local-bridge',
  };
  if (format === 'json') {
    json(res, 200, { ok: true, ...serializeTextureSet(result) });
    return;
  }
  if (format === 'zip') {
    const { zip, filename } = await textureResultZip(result);
    sendBuffer(res, 200, zip, 'application/zip', filename, {
      ...headers,
      'Content-Disposition': `${download ? 'attachment' : 'inline'}; filename="${filename}"`,
    });
    return;
  }
  if (input.face === 'all') {
    bridgeError(res, 400, 'format=png needs one face; use face=side, top, or bottom, or format=zip for all faces.');
    return;
  }
  const face = ['side', 'top', 'bottom'].includes(input.face) ? input.face : 'side';
  const png = texturePng(result, face);
  const filename = `${result.filename}_${face}.png`;
  sendBuffer(res, 200, png, 'image/png', filename, {
    ...headers,
    'Content-Disposition': `${download ? 'attachment' : 'inline'}; filename="${filename}"`,
  });
}

async function handleBridge(req, res, url) {
  if (!bridgePath(url)) return false;

  applyBridgeCors(req, res);
  if (req.method === 'OPTIONS') {
    if (!originAllowed(req.headers.origin)) {
      bridgeError(res, 403, 'Origin is not allowed by BRIDGE_ALLOWED_ORIGINS.');
      return true;
    }
    res.writeHead(204);
    res.end();
    return true;
  }

  if (!bridgeAuthorized(req)) {
    if (BRIDGE_TOKEN) res.setHeader('WWW-Authenticate', 'Bearer');
    json(res, 401, {
      ok: false,
      error: BRIDGE_TOKEN ? 'Missing or invalid bridge token.' : 'Bridge access is limited to loopback clients.',
      auth: BRIDGE_TOKEN ? 'Bearer token required' : 'loopback only',
    });
    return true;
  }

  if (url.pathname === '/api' && req.method === 'GET') {
    json(res, 200, {
      ok: true,
      ...API_DOCS,
      auth: {
        required: Boolean(BRIDGE_TOKEN),
        mode: BRIDGE_TOKEN ? 'Bearer token' : 'loopback only',
        headers: ['Authorization: Bearer <token>', 'X-Blockloom-Token: <token>'],
      },
    });
    return true;
  }

  if (url.pathname === '/api/health' && req.method === 'GET') {
    const caps = capabilities();
    json(res, 200, {
      ok: true,
      service: 'blockloom-local-bridge',
      bridgeVersion: BRIDGE_API_VERSION,
      appVersion: process.env.npm_package_version || '1.10.0',
      auth: BRIDGE_TOKEN ? 'token' : 'loopback',
      aiRequired: false,
      capabilities: {
        materials: caps.materials.length,
        modifiers: caps.modifiers.length,
        finishes: caps.finishes.map((finish) => finish.id),
        faces: caps.faces,
        formats: caps.formats,
        maxBatchItems: caps.bridge.maxBatchItems,
        sizes: caps.bridge.sizes,
        itemTypes: caps.items.types.length,
        itemMaterials: caps.items.materials.length,
      },
    });
    return true;
  }

  if (url.pathname === '/api/materials' && req.method === 'GET') {
    json(res, 200, { ok: true, ...capabilities() });
    return true;
  }

  if (url.pathname === '/api/openapi.json' && req.method === 'GET') {
    json(res, 200, OPENAPI);
    return true;
  }

  if (url.pathname === '/api/generate' && (req.method === 'GET' || req.method === 'POST')) {
    let body = {};
    if (req.method === 'POST') {
      body = await readJson(req, 64 * 1024);
    }
    const input = { ...bridgeInputFromQuery(url), ...body };
    input.face = body.face || url.searchParams.get('face') || 'side';
    const format = bridgeFormat(body.format || url.searchParams.get('format'), input, req.headers.accept);
    const result = renderTextureSet(input);
    await sendTextureResult(req, res, result, input, format, {
      download: url.searchParams.get('download') === '1' || body.download === true,
    });
    return true;
  }

  if (url.pathname === '/api/themes' && req.method === 'GET') {
    json(res, 200, { ok: true, version: BRIDGE_API_VERSION, themes: listThemes(), themeEngineVersion: THEME_ENGINE_VERSION });
    return true;
  }

  if (url.pathname === '/api/item-themes' && req.method === 'GET') {
    json(res, 200, { ok: true, version: BRIDGE_API_VERSION, themes: listItemThemes(), engineVersion: ITEM_THEME_ENGINE_VERSION });
    return true;
  }

  if (url.pathname === '/api/item-motif' && (req.method === 'GET' || req.method === 'POST')) {
    let body = {};
    if (req.method === 'POST') body = await readJson(req, 32 * 1024);
    const q = url.searchParams;
    const result = renderItemMotif({
      theme: body.theme || q.get('theme') || undefined,
      motif: body.motif || q.get('motif') || undefined,
      seed: body.seed || q.get('seed') || 1,
      size: body.size || q.get('size') || 16,
    });
    const format = String(body.format || q.get('format') || (String(req.headers.accept || '').includes('application/json') ? 'json' : 'png')).toLowerCase();
    if (format === 'json') json(res, 200, serializeItemMotif(result));
    else if (format === 'png') sendBuffer(res, 200, result.png, 'image/png', `${result.filename}.png`, { 'X-Blockloom-Item-Motif': result.recipe.motif, 'Content-Disposition': `inline; filename="${result.filename}.png"` });
    else bridgeError(res, 400, 'Item motif format must be png or json.');
    return true;
  }

  if (url.pathname === '/api/item-motif-sheet' && (req.method === 'GET' || req.method === 'POST')) {
    let body = {};
    if (req.method === 'POST') body = await readJson(req, 32 * 1024);
    const q = url.searchParams;
    const { zip, filename, theme } = await itemThemeSheetZip({
      theme: body.theme || q.get('theme') || undefined,
      seed: body.seed || q.get('seed') || 1,
      size: body.size || q.get('size') || 16,
    });
    sendBuffer(res, 200, zip, 'application/zip', filename, { 'X-Blockloom-Item-Theme': theme.id });
    return true;
  }

  if (url.pathname === '/api/theme' && (req.method === 'GET' || req.method === 'POST')) {
    let body = {};
    if (req.method === 'POST') body = await readJson(req, 32 * 1024);
    const q = url.searchParams;
    const input = {
      theme: body.theme || q.get('theme') || undefined,
      motif: body.motif || q.get('motif') || undefined,
      prompt: body.prompt || q.get('prompt') || undefined,
      seed: body.seed || q.get('seed') || 1,
      size: body.size || q.get('size') || 16,
    };
    const result = renderTheme(input);
    const format = String(body.format || q.get('format') || (String(req.headers.accept || '').includes('application/json') ? 'json' : 'png')).toLowerCase();
    const headers = {
      'X-Blockloom-Theme': result.recipe.theme,
      'X-Blockloom-Motif': result.recipe.motif,
      'X-Blockloom-Generator': 'blockloom-local-bridge',
    };
    if (format === 'json') json(res, 200, serializeTheme(result));
    else if (format === 'png') sendBuffer(res, 200, result.png, 'image/png', `${result.filename}.png`, { ...headers, 'Content-Disposition': `inline; filename="${result.filename}.png"` });
    else bridgeError(res, 400, 'Theme format must be png or json.');
    return true;
  }

  if (url.pathname === '/api/theme-sheet' && (req.method === 'GET' || req.method === 'POST')) {
    let body = {};
    if (req.method === 'POST') body = await readJson(req, 32 * 1024);
    const q = url.searchParams;
    const { zip, filename, theme } = await themeSheetZip({
      theme: body.theme || q.get('theme') || undefined,
      prompt: body.prompt || q.get('prompt') || undefined,
      seed: body.seed || q.get('seed') || 1,
      size: body.size || q.get('size') || 16,
    });
    sendBuffer(res, 200, zip, 'application/zip', filename, { 'X-Blockloom-Theme': theme.id, 'X-Blockloom-Generator': 'blockloom-local-bridge' });
    return true;
  }

  if (url.pathname === '/api/item' && (req.method === 'GET' || req.method === 'POST')) {
    let body = {};
    if (req.method === 'POST') body = await readJson(req, 32 * 1024);
    const q = url.searchParams;
    const input = {
      type: body.type || q.get('type') || 'sword',
      material: body.material || body.materialId || q.get('material') || q.get('materialId') || 'iron',
      seed: body.seed || q.get('seed') || 1,
      size: body.size || q.get('size') || 16,
      accent: body.accent || q.get('accent') || undefined,
    };
    const item = renderItem(input);
    const format = String(body.format || q.get('format') || (String(req.headers.accept || '').includes('application/json') ? 'json' : 'png')).toLowerCase();
    const headers = {
      'X-Blockloom-Title': encodeURIComponent(`${item.recipe.materialName} ${item.recipe.typeName}`),
      'X-Blockloom-Item': item.recipe.itemId,
      'X-Blockloom-Generator': 'blockloom-local-bridge',
    };
    if (format === 'json') {
      json(res, 200, serializeItem(item));
    } else if (format === 'png') {
      sendBuffer(res, 200, item.png, 'image/png', `${item.filename}.png`, {
        ...headers,
        'Content-Disposition': `inline; filename="${item.filename}.png"`,
      });
    } else {
      bridgeError(res, 400, 'Item format must be png or json.');
    }
    return true;
  }

  if (url.pathname === '/api/batch' && req.method === 'POST') {
    const body = await readJson(req, 512 * 1024);
    const batch = await batchZip(body.items);
    const filename = String(body.filename || batch.filename).replace(/[\r\n"]/g, '_');
    sendBuffer(res, 200, batch.zip, 'application/zip', filename, {
      'Content-Disposition': `attachment; filename="${filename}"`,
      'X-Blockloom-Count': String(batch.manifest.count),
      'X-Blockloom-Generator': 'blockloom-local-bridge',
    });
    return true;
  }

  bridgeError(res, 405, 'Method not allowed. See GET /api for the bridge reference.');
  return true;
}


async function handleApi(req, res, url) {
  try {
    if (await handleBridge(req, res, url)) return true;
  } catch (error) {
    console.error('[bridge] request failed:', error);
    bridgeError(res, error?.status || 400, error?.message || 'Bridge request failed.');
    return true;
  }

  if (url.pathname === '/api/ai/status' && req.method === 'GET') {
    json(res, 200, aiStatus());
    return true;
  }

  if (url.pathname === '/api/ai/generate' && req.method === 'POST') {
    if (!aiConfigured) {
      json(res, 503, { error: 'AI provider is not configured.', status: aiStatus() });
      return true;
    }
    const ip = req.socket.remoteAddress || 'unknown';
    if (!rateAllowed(ip)) {
      json(res, 429, { error: 'Too many AI concepts. Wait a minute and try again.' });
      return true;
    }
    if (inFlight.has(ip)) {
      json(res, 429, { error: 'One AI concept is already generating. Give it a moment.' });
      return true;
    }
    inFlight.add(ip);
    try {
      const body = await readJson(req);
      const prompt = cleanPrompt(body.prompt);
      if (prompt.length < 3) {
        json(res, 400, { error: 'Add a few words to describe the texture.' });
        return true;
      }
      const seed = Math.max(1, Math.min(999999999, Math.floor(Number(body.seed) || Date.now() % 999999999)));
      const result = await generateImage(prompt, seed);
      json(res, 200, {
        ...result,
        prompt,
        seed,
        provider: provider.label,
        providerId: AI_PROVIDER,
      });
    } catch (error) {
      console.error('[ai] generation failed:', error?.message || error);
      const isFreeLimit = error?.status === 402 || error?.status === 429;
      const status = isFreeLimit ? 429 : error?.status >= 500 ? 503 : 502;
      const retryAfter = error?.retryAfter
        ? Math.max(1, error.retryAfter)
        : Math.max(1, Math.ceil((POLLINATIONS_COOLDOWN_MS - (Date.now() - lastPollinationsAt)) / 1000));
      json(res, status, {
        error: isFreeLimit
          ? AI_PROVIDER === 'pollinations'
            ? `Free provider limit: one concept every 45 seconds. Try again in ${retryAfter}s, or configure a private provider.`
            : 'The image provider is rate-limiting requests. Try again in a little while.'
          : status === 503
            ? 'The image provider is busy right now. Try again in a minute, or configure a private provider.'
            : 'The image provider did not return a usable concept. Try another prompt.',
      });
    } finally {
      inFlight.delete(ip);
    }
    return true;
  }

  if (url.pathname.startsWith('/api/')) {
    json(res, 404, { error: 'Not found' });
    return true;
  }

  return false;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  try {
    if (await handleApi(req, res, url)) return;
  } catch (error) {
    console.error(error);
    json(res, 500, { error: 'Internal server error' });
    return;
  }

  const requested = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname);
  const filePath = normalize(resolve(root, `.${requested}`));
  if (!filePath.startsWith(root)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Forbidden');
    return;
  }
  try {
    const stat = statSync(filePath);
    if (!stat.isFile()) throw new Error('not a file');
    res.writeHead(200, {
      'Content-Type': mime[extname(filePath)] || 'application/octet-stream',
      'Content-Length': stat.size,
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
    });
    createReadStream(filePath).pipe(res);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Not found');
  }
});

server.listen(port, host, () => {
  console.log(`Blockloom running at http://${host}:${port}`);
  console.log(`Local texture bridge: http://${host}:${port}/api  (AI not required)`);
  console.log(`Bridge auth: ${BRIDGE_TOKEN ? 'Bearer token required' : `loopback only${isLoopbackHost(host) ? '' : ' — set BRIDGE_TOKEN for remote access'}`}`);
  console.log(`AI provider: ${provider?.label || 'disabled'} (${aiConfigured ? 'ready' : 'not configured'})`);
});

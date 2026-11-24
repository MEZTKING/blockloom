/* Local, AI-free texture generation bridge. Shared by the HTTP API and CLI. */
import {
  FINISHES,
  MATERIALS,
  MODIFIERS,
  getMaterial,
  parsePrompt,
  renderTextureBuffer,
  textureTitle,
} from '../core/index.js';
import { createZip } from '../js/zip.js';
import { encodePng } from './png.mjs';

export const BRIDGE_API_VERSION = '1.0.0';
export const MAX_BATCH_ITEMS = 64;
export const MAX_SIZE = 512;
export const FACES = ['side', 'top', 'bottom'];

const VALID_FINISHES = new Set(FINISHES.map((finish) => finish.id));
const VALID_MODIFIERS = new Set(MODIFIERS.map((modifier) => modifier.id));
const VALID_MATERIALS = new Set(MATERIALS.map((material) => material.id));

const DEFAULT_ACCENTS = {
  crystal: '#5ee8df',
  gilded: '#e9c253',
  glowing: '#b9ee6a',
  flecked: '#e5bf58',
};

function clampInt(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(min, Math.min(max, Math.round(number)));
}

function normalizeHex(value) {
  if (!value) return null;
  const hex = String(value).trim();
  return /^#[0-9a-f]{6}$/i.test(hex) ? hex.toLowerCase() : null;
}

function hexToHsl(hex) {
  const value = String(hex).replace('#', '');
  if (!/^[0-9a-f]{6}$/i.test(value)) return null;
  const [r, g, b] = [0, 2, 4].map((offset) => parseInt(value.slice(offset, offset + 2), 16) / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  let h = 0;
  if (d !== 0) {
    if (max === r) h = 60 * (((g - b) / d) % 6);
    else if (max === g) h = 60 * ((b - r) / d + 2);
    else h = 60 * ((r - g) / d + 4);
  }
  if (h < 0) h += 360;
  return { hue: h, sat: Math.min(1, Math.max(0, s)), light: l - 0.5 };
}

function cleanPrompt(value) {
  return String(value || '')
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 360);
}

function slugify(value, fallback = 'texture') {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 64) || fallback;
}

function randomSeed() {
  return Math.floor(Math.random() * 900000) + 1000;
}

function normalizeModifiers(value) {
  const list = Array.isArray(value)
    ? value
    : String(value || '').split(',').map((item) => item.trim()).filter(Boolean);
  return [...new Set(list.filter((item) => VALID_MODIFIERS.has(item)))];
}

export function normalizeTextureInput(input = {}) {
  const prompt = cleanPrompt(input.prompt);
  const parsed = parsePrompt(prompt);
  const explicitMaterial = String(input.materialId || input.material || '').trim();
  const materialId = VALID_MATERIALS.has(explicitMaterial)
    ? explicitMaterial
    : parsed.materialId || 'stone';
  const material = getMaterial(materialId);
  const explicitModifiers = Array.isArray(input.modifiers) || typeof input.modifiers === 'string';
  const modifiers = explicitModifiers ? normalizeModifiers(input.modifiers) : parsed.modifiers;
  const size = clampInt(input.size, 1, MAX_SIZE, 16);
  const seed = clampInt(input.seed, 1, 999999999, randomSeed());
  const finish = VALID_FINISHES.has(input.finish) ? input.finish : 'balanced';
  const grain = clampInt(input.grain, 0, 100, 58);
  const contrast = clampInt(input.contrast, 0, 100, 55);
  const hue = clampInt(input.hue, -180, 180, 0);

  let accent = normalizeHex(input.accent);
  let promptColor = null;
  if (input.tint) promptColor = hexToHsl(normalizeHex(input.tint));
  if (parsed.color) {
    if (parsed.colorAsAccent) accent ||= parsed.color.hex;
    else if (!promptColor) {
      promptColor = {
        name: parsed.color.name,
        hue: parsed.color.hue,
        sat: parsed.color.sat,
        light: parsed.color.light || 0,
      };
    }
  }
  if (!accent) {
    const special = modifiers.find((id) => DEFAULT_ACCENTS[id]);
    accent = special ? DEFAULT_ACCENTS[special] : null;
  }

  const face = ['side', 'top', 'bottom'].includes(input.face) ? input.face : 'all';
  return {
    prompt,
    parsed,
    materialId,
    material,
    seed,
    size,
    finish,
    grain,
    contrast,
    hue,
    modifiers,
    accent,
    promptColor,
    face,
    title: String(input.title || textureTitle(materialId, modifiers)).slice(0, 80),
  };
}

export function renderTextureSet(input = {}) {
  const normalized = normalizeTextureInput(input);
  const faces = {};
  for (const face of FACES) {
    const texture = renderTextureBuffer({
      materialId: normalized.materialId,
      seed: normalized.seed,
      size: normalized.size,
      finish: normalized.finish,
      grain: normalized.grain,
      contrast: normalized.contrast,
      hue: normalized.hue,
      modifiers: normalized.modifiers,
      promptColor: normalized.promptColor,
      overlayAccent: normalized.accent,
      face,
    });
    const png = encodePng(texture.size, texture.size, texture.buffer);
    faces[face] = {
      png,
      dataUrl: `data:image/png;base64,${png.toString('base64')}`,
      swatches: texture.swatches,
      accentSwatches: texture.overlayAccentSwatches,
    };
  }
  const palette = [...new Set([
    ...faces.side.swatches,
    ...faces.side.accentSwatches.slice(0, 2),
  ])].slice(0, 8);
  const metadata = {
    generator: 'Blockloom Local Bridge',
    apiVersion: BRIDGE_API_VERSION,
    generatedAt: new Date().toISOString(),
    title: normalized.title,
    prompt: normalized.prompt,
    material: { id: normalized.material.id, name: normalized.material.name, group: normalized.material.group },
    seed: normalized.seed,
    size: normalized.size,
    finish: normalized.finish,
    grain: normalized.grain,
    contrast: normalized.contrast,
    hue: normalized.hue,
    modifiers: normalized.modifiers,
    accent: normalized.accent,
    promptColor: normalized.promptColor,
    palette,
    faces: FACES,
  };
  return {
    ...metadata,
    filename: `blockloom_${slugify(normalized.title)}_${normalized.seed}_${normalized.size}px`,
    normalized,
    faces,
  };
}

export function serializeTextureSet(result) {
  return {
    ...result,
    normalized: undefined,
    faces: Object.fromEntries(FACES.map((face) => [face, {
      dataUrl: result.faces[face].dataUrl,
      swatches: result.faces[face].swatches,
      accentSwatches: result.faces[face].accentSwatches,
    }])),
  };
}

export function texturePng(result, face = 'side') {
  return result.faces[face]?.png || result.faces.side.png;
}

export async function textureResultZip(result) {
  const files = FACES.map((face) => ({ name: `${face}.png`, data: result.faces[face].png }));
  files.push({ name: 'texture.json', data: JSON.stringify(serializeTextureSet(result), null, 2) });
  files.push({
    name: 'README.txt',
    data: [
      'BLOCKLOOM TEXTURE SET',
      '=====================',
      '',
      `Title:       ${result.title}`,
      `Prompt:      ${result.prompt || '(none)'}`,
      `Material:    ${result.material.name}`,
      `Seed:        ${result.seed}`,
      `Resolution:  ${result.size} × ${result.size} px`,
      `Finish:      ${result.finish}`,
      `Modifiers:   ${result.modifiers.join(', ') || 'none'}`,
      `Palette:     ${result.palette.join(' ')}`,
      '',
      'Files: side.png, top.png, bottom.png, texture.json',
      'Generated locally by the Blockloom bridge. No AI provider was used.',
      '',
    ].join('\n'),
  });
  const blob = await createZip(files);
  const zip = Buffer.from(await blob.arrayBuffer());
  return { result, zip, filename: `${result.filename}.zip` };
}

export async function textureSetZip(input = {}) {
  return textureResultZip(renderTextureSet(input));
}

export async function batchZip(items = []) {
  if (!Array.isArray(items) || items.length === 0) {
    throw Object.assign(new Error('Batch requires a non-empty "items" array.'), { status: 400 });
  }
  if (items.length > MAX_BATCH_ITEMS) {
    throw Object.assign(new Error(`Batch is limited to ${MAX_BATCH_ITEMS} textures.`), { status: 400 });
  }
  const files = [];
  const manifest = {
    generator: 'Blockloom Local Bridge',
    apiVersion: BRIDGE_API_VERSION,
    generatedAt: new Date().toISOString(),
    count: items.length,
    textures: [],
  };
  const usedIds = new Set();
  for (let index = 0; index < items.length; index++) {
    const item = items[index] || {};
    const result = renderTextureSet(item);
    let id = slugify(item.id || result.title || `texture-${index + 1}`, `texture-${index + 1}`);
    if (usedIds.has(id)) id = `${id}-${index + 1}`;
    usedIds.add(id);
    for (const face of FACES) {
      files.push({ name: `textures/${id}/${face}.png`, data: result.faces[face].png });
    }
    files.push({ name: `textures/${id}/texture.json`, data: JSON.stringify(serializeTextureSet(result), null, 2) });
    manifest.textures.push({
      id,
      title: result.title,
      prompt: result.prompt,
      material: result.material.id,
      seed: result.seed,
      size: result.size,
      finish: result.finish,
      modifiers: result.modifiers,
      path: `textures/${id}`,
    });
  }
  files.unshift({ name: 'manifest.json', data: JSON.stringify(manifest, null, 2) });
  const blob = await createZip(files);
  return {
    zip: Buffer.from(await blob.arrayBuffer()),
    filename: `blockloom_batch_${new Date().toISOString().slice(0, 10)}.zip`,
    manifest,
  };
}

export function capabilities() {
  return {
    bridge: {
      name: 'Blockloom Local Texture Bridge',
      apiVersion: BRIDGE_API_VERSION,
      aiRequired: false,
      maxBatchItems: MAX_BATCH_ITEMS,
      sizes: '1–512 px; 16 / 32 / 64 recommended',
    },
    materials: MATERIALS.map((material) => ({
      id: material.id,
      name: material.name,
      group: material.group,
      type: material.type,
      accent: material.accent,
    })),
    finishes: FINISHES.map(({ id, label, note }) => ({ id, label, note })),
    modifiers: MODIFIERS.map(({ id, label }) => ({ id, label })),
    faces: FACES,
    formats: ['png', 'json', 'zip'],
  };
}

export const API_DOCS = {
  name: 'Blockloom Local Texture Bridge',
  apiVersion: BRIDGE_API_VERSION,
  description: 'Generate deterministic Minecraft block textures from a prompt or explicit recipe. No AI provider is required.',
  auth: 'Set BRIDGE_TOKEN and send Authorization: Bearer <token> or X-Blockloom-Token.',
  endpoints: {
    'GET /api/health': 'Service status and auth mode.',
    'GET /api/materials': 'Materials, finishes, modifiers, formats, and limits.',
    'GET /api/generate?prompt=...': 'One PNG (side face) by default. Add format=json or format=zip, face=top/bottom.',
    'POST /api/generate': 'JSON body with prompt/material/seed/size/finish/modifiers/accent/face/format.',
    'POST /api/batch': 'JSON body { items: [...] } -> ZIP of texture sets and manifest.json.',
    'GET /api/openapi.json': 'OpenAPI 3.0 description.',
  },
  examples: {
    png: 'http://127.0.0.1:4173/api/generate?prompt=mossy%20cobblestone&seed=123&size=16',
    json: 'http://127.0.0.1:4173/api/generate?prompt=...&format=json',
    batch: 'POST /api/batch {"items":[{"id":"mossy","prompt":"mossy cobblestone"}]}',
  },
};

export const OPENAPI = {
  openapi: '3.0.3',
  info: {
    title: 'Blockloom Local Texture Bridge',
    version: BRIDGE_API_VERSION,
    description: API_DOCS.description,
  },
  servers: [{ url: 'http://127.0.0.1:4173' }],
  paths: {
    '/api/health': { get: { summary: 'Health and auth mode', responses: { '200': { description: 'OK' } } } },
    '/api/materials': { get: { summary: 'Materials and modifiers', responses: { '200': { description: 'OK' } } } },
    '/api/generate': {
      get: {
        summary: 'Generate one texture face or set',
        parameters: [
          { name: 'prompt', in: 'query', schema: { type: 'string' } },
          { name: 'material', in: 'query', schema: { type: 'string' } },
          { name: 'seed', in: 'query', schema: { type: 'integer', minimum: 1 } },
          { name: 'size', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 512 } },
          { name: 'finish', in: 'query', schema: { type: 'string', enum: FINISHES.map((finish) => finish.id) } },
          { name: 'face', in: 'query', schema: { type: 'string', enum: ['side', 'top', 'bottom', 'all'] } },
          { name: 'format', in: 'query', schema: { type: 'string', enum: ['png', 'json', 'zip'] } },
        ],
        responses: { '200': { description: 'PNG, JSON, or ZIP' } },
      },
      post: { summary: 'Generate from a JSON recipe', responses: { '200': { description: 'PNG, JSON, or ZIP' } } },
    },
    '/api/batch': { post: { summary: 'Generate many textures as one ZIP', responses: { '200': { description: 'ZIP' } } } },
  },
};

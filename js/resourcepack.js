/* Minecraft resource-pack builder with target selection, multi-block packs, and format profiles. */

import { createZip } from './zip.js';
import { drawIsoCube } from './engine.js';

const TARGETS = {
  stone: { label: 'Stone', files: [{ path: 'stone', face: 'side' }] },
  cobblestone: { label: 'Cobblestone', files: [{ path: 'cobblestone', face: 'side' }] },
  deepslate: { label: 'Deepslate', files: [{ path: 'deepslate', face: 'side' }] },
  gravel: { label: 'Gravel', files: [{ path: 'gravel', face: 'side' }] },
  bricks: { label: 'Bricks', files: [{ path: 'bricks', face: 'side' }] },
  obsidian: { label: 'Obsidian', files: [{ path: 'obsidian', face: 'side' }] },
  dirt: { label: 'Dirt', files: [{ path: 'dirt', face: 'side' }] },
  grass_block: {
    label: 'Grass Block',
    note: 'The top texture and overlay still inherit Minecraft’s biome tint. The overlay is transparent so the authored side is not double-tinted.',
    files: [
      { path: 'grass_block_top', face: 'top' },
      { path: 'grass_block_side', face: 'side' },
      { path: 'grass_block_side_overlay', transparent: true },
    ],
  },
  sand: { label: 'Sand', files: [{ path: 'sand', face: 'side' }] },
  snow: { label: 'Snow Block', files: [{ path: 'snow', face: 'side' }] },
  ice: { label: 'Ice', files: [{ path: 'ice', face: 'side' }] },
  moss_block: { label: 'Moss Block', files: [{ path: 'moss_block', face: 'side' }] },
  oak_planks: { label: 'Oak Planks', files: [{ path: 'oak_planks', face: 'side' }] },
  oak_log: {
    label: 'Oak Log',
    files: [
      { path: 'oak_log', face: 'side' },
      { path: 'oak_log_top', face: 'top' },
    ],
  },
  leaves: {
    label: 'Oak Leaves',
    note: 'Leaves are biome-tinted in Minecraft, so the final in-game colour may differ from the studio preview.',
    files: [{ path: 'oak_leaves', face: 'side' }],
  },
  netherrack: { label: 'Netherrack', files: [{ path: 'netherrack', face: 'side' }] },
  end_stone: { label: 'End Stone', files: [{ path: 'end_stone', face: 'side' }] },
  prismarine: { label: 'Prismarine', files: [{ path: 'prismarine', face: 'side' }] },
  terracotta: { label: 'Terracotta', files: [{ path: 'terracotta', face: 'side' }] },
  wool: { label: 'White Wool', files: [{ path: 'white_wool', face: 'side' }] },
  gold_ore: { label: 'Gold Ore', files: [{ path: 'gold_ore', face: 'side' }] },
  diamond_ore: { label: 'Diamond Ore', files: [{ path: 'diamond_ore', face: 'side' }] },
  redstone_ore: { label: 'Redstone Ore', files: [{ path: 'redstone_ore', face: 'side' }] },
  emerald_ore: { label: 'Emerald Ore', files: [{ path: 'emerald_ore', face: 'side' }] },
  copper_ore: { label: 'Copper Ore', files: [{ path: 'copper_ore', face: 'side' }] },
  lapis_ore: { label: 'Lapis Ore', files: [{ path: 'lapis_ore', face: 'side' }] },
};

export const PACK_TARGETS = Object.entries(TARGETS).map(([id, target]) => ({ id, ...target }));

export const GRASS_TINT_FREE_MODEL_PATH = 'assets/minecraft/models/block/grass_block.json';

// A copy of the vanilla grass block model with every "tintindex" removed.
// Scope: the 1.21+ format profiles only. The top face then renders the authored
// texture without Minecraft's biome colour multiplying it.
export const GRASS_TINT_FREE_MODEL = {
  parent: 'block/block',
  textures: {
    particle: 'block/dirt',
    bottom: 'block/dirt',
    top: 'block/grass_block_top',
    side: 'block/grass_block_side',
    overlay: 'block/grass_block_side_overlay',
  },
  elements: [
    {
      from: [0, 0, 0],
      to: [16, 16, 16],
      faces: {
        down: { uv: [0, 0, 16, 16], texture: '#bottom', cullface: 'down' },
        up: { uv: [0, 0, 16, 16], texture: '#top', cullface: 'up' },
        north: { uv: [0, 0, 16, 16], texture: '#side', cullface: 'north' },
        south: { uv: [0, 0, 16, 16], texture: '#side', cullface: 'south' },
        west: { uv: [0, 0, 16, 16], texture: '#side', cullface: 'west' },
        east: { uv: [0, 0, 16, 16], texture: '#side', cullface: 'east' },
      },
    },
    {
      from: [0, 0, 0],
      to: [16, 16, 16],
      faces: {
        north: { uv: [0, 0, 16, 16], texture: '#overlay', cullface: 'north' },
        south: { uv: [0, 0, 16, 16], texture: '#overlay', cullface: 'south' },
        west: { uv: [0, 0, 16, 16], texture: '#overlay', cullface: 'west' },
        east: { uv: [0, 0, 16, 16], texture: '#overlay', cullface: 'east' },
      },
    },
  ],
};

export const PACK_FORMATS = [
  {
    id: 'broad',
    label: '1.20+',
    detail: 'Broad compatibility',
    packFormat: 15,
    supportedFormats: [15, 99],
    minFormat: 15,
    maxFormat: 99,
    note: 'Texture-only override pack. Works from 1.20.1 through current releases using supported format ranges.',
  },
  {
    id: 'modern',
    label: '1.21+',
    detail: 'Modern baseline',
    packFormat: 34,
    supportedFormats: [34, 99],
    minFormat: 34,
    maxFormat: 99,
    note: 'Recommended for 1.21.1 and later. Uses the modern pack metadata fields.',
  },
  {
    id: 'current',
    label: '1.21.9+',
    detail: 'Current metadata',
    packFormat: 69,
    supportedFormats: [69, 99],
    minFormat: 69,
    maxFormat: 99,
    note: 'Uses min_format / max_format for 1.21.9+ while retaining legacy fields for older readers.',
  },
];

export function getPackTarget(targetId) {
  return TARGETS[targetId] ? { id: targetId, ...TARGETS[targetId] } : null;
}

export function packTargetFor(materialId) {
  return getPackTarget(materialId) || getPackTarget('stone');
}

export function isPackSupported(materialId) {
  return Boolean(TARGETS[materialId]);
}

export function getPackFormat(formatId) {
  return PACK_FORMATS.find((format) => format.id === formatId) || PACK_FORMATS[1];
}

function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('PNG encoding failed'))), 'image/png');
  });
}

function transparentCanvas(size) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  return canvas;
}

function packIcon(textures) {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  drawIsoCube(canvas, { side: textures.side.canvas, top: textures.top.canvas }, { background: '#0b0d08', shadow: true, pad: 0.02 });
  return canvas;
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function normalizeEntry(entry) {
  if (!entry?.textures?.side?.canvas) return null;
  const target = getPackTarget(entry.targetId) || packTargetFor(entry.materialId);
  if (!target) return null;
  return {
    ...entry,
    target,
    targetId: target.id,
    targetLabel: target.label,
    size: entry.size || entry.textures.side.canvas.width,
    seed: entry.seed || 0,
    title: entry.title || entry.materialName || target.label,
    origin: entry.origin || 'procedural',
  };
}

export async function buildResourcePack(entries, options = {}) {
  // Backwards-compatible single-texture call.
  const rawEntries = Array.isArray(entries)
    ? entries
    : [{ textures: entries, targetId: options.targetId || packTargetFor(options.materialId).id, ...options }];

  const list = rawEntries.map(normalizeEntry).filter(Boolean);
  if (!list.length) throw new Error('Add at least one block to the pack.');

  const usedTargets = new Set();
  const included = [];
  let skipped = 0;
  for (const entry of list) {
    if (usedTargets.has(entry.targetId)) {
      skipped += 1;
      continue;
    }
    usedTargets.add(entry.targetId);
    included.push(entry);
  }
  if (!included.length) throw new Error('Every entry points at the same block target.');

  const format = getPackFormat(options.formatId);
  const tintFreeGrass = Boolean(options.grassTintFree)
    && format.id !== 'broad'
    && included.some((entry) => entry.targetId === 'grass_block');
  const files = [];
  const texturePaths = [];
  const packedEntries = [];

  for (const entry of included) {
    for (const file of entry.target.files) {
      const canvas = file.transparent ? transparentCanvas(entry.size) : entry.textures[file.face].canvas;
      const path = `assets/minecraft/textures/block/${file.path}.png`;
      files.push({ name: path, data: await canvasToBlob(canvas) });
      texturePaths.push(path);
    }
    packedEntries.push({
      target: entry.targetLabel,
      targetId: entry.targetId,
      source: entry.title,
      material: entry.materialName || entry.title,
      seed: entry.seed,
      size: entry.size,
      origin: entry.origin,
      files: entry.target.files.map((file) => `assets/minecraft/textures/block/${file.path}.png`),
      note: entry.target.note || null,
    });
  }

  const packDescription =
    included.length === 1
      ? `Blockloom · ${included[0].targetLabel} · seed ${included[0].seed}`
      : `Blockloom · ${included.length} block overrides`;

  const packMcmeta = {
    pack: {
      description: packDescription,
      pack_format: format.packFormat,
      supported_formats: format.supportedFormats,
      min_format: format.minFormat,
      max_format: format.maxFormat,
    },
  };

  if (tintFreeGrass) {
    files.push({ name: GRASS_TINT_FREE_MODEL_PATH, data: JSON.stringify(GRASS_TINT_FREE_MODEL, null, 2) });
  }

  files.push({ name: 'pack.mcmeta', data: JSON.stringify(packMcmeta, null, 2) });
  files.push({ name: 'pack.png', data: await canvasToBlob(packIcon(included[0].textures)) });

  const targetLines = packedEntries.map(
    (entry) => `  - ${entry.target.padEnd(16)} ← ${entry.source} (seed ${entry.seed}, ${entry.size}px)`,
  );
  const notes = [...new Set(packedEntries.map((entry) => {
    if (entry.targetId === 'grass_block' && tintFreeGrass) {
      return 'Grass top is rendered through the untinted 1.21+ model override; the side overlay stays transparent.';
    }
    return entry.note;
  }).filter(Boolean))];
  const readme = [
    'BLOCKLOOM RESOURCE PACK',
    '=======================',
    '',
    `Targets:     ${included.length}`,
    `Pack format: ${format.packFormat} (${format.label})`,
    `Exported:    ${new Date().toISOString().slice(0, 10)}`,
    '',
    'Targets',
    '-------',
    ...targetLines,
    '',
    'Install',
    '-------',
    '1. Drop this zip in .minecraft/resourcepacks/ (or your world resourcepacks folder).',
    '2. Open Options → Resource Packs and enable “Blockloom”.',
    '3. The target vanilla blocks now use these textures.',
    '',
    'Notes',
    '-----',
    format.note,
    'This is a texture override pack, not a new block. Custom blocks require a mod or datapack.',
    ...(tintFreeGrass
      ? ['Tint override: grass block top is rendered untinted through a 1.21+ model override.']
      : []),
    ...(notes.length ? ['', 'Tint notes:', ...notes.map((note) => `  - ${note}`)] : []),
    '',
  ].join('\n');

  files.push({ name: 'README.txt', data: readme });
  files.push({
    name: 'blockloom-pack.json',
    data: JSON.stringify({
      generator: 'Blockloom resource pack builder',
      schema: 2,
      format: {
        id: format.id,
        label: format.label,
        packFormat: format.packFormat,
        supportedFormats: format.supportedFormats,
        minFormat: format.minFormat,
        maxFormat: format.maxFormat,
      },
      entries: packedEntries,
      tintFreeGrass,
      skippedDuplicates: skipped,
    }, null, 2),
  });

  const zip = await createZip(files);
  const filename = included.length === 1
    ? `blockloom_resourcepack_${slugify(included[0].targetLabel)}_${included[0].seed}_${included[0].size}px.zip`
    : `blockloom_resourcepack_${included.length}blocks_${new Date().toISOString().slice(0, 10)}.zip`;

  return {
    blob: zip,
    filename,
    included,
    targets: packedEntries,
    skipped,
    fileCount: files.length,
    format,
    tintFreeGrass,
    description: packDescription,
  };
}

/* Drop-in Minecraft resource-pack export for one vanilla block target. */

import { createZip } from './zip.js';
import { drawIsoCube } from './engine.js';

const PACK_FORMAT = 34;
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
    note: 'The top texture and overlay inherit Minecraft’s biome tint. The overlay is intentionally transparent so the authored side texture is not double-tinted.',
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

export function packTargetFor(materialId) {
  return TARGETS[materialId] || TARGETS.stone;
}

export function isPackSupported(materialId) {
  return Boolean(TARGETS[materialId]);
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

export async function buildResourcePack(textures, meta) {
  const target = packTargetFor(meta.materialId);
  const files = [];
  const description = `Blockloom · ${target.label} · seed ${meta.seed}`;

  const packMcmeta = {
    pack: {
      pack_format: PACK_FORMAT,
      supported_formats: [PACK_FORMAT, 99],
      description,
    },
  };

  files.push({ name: 'pack.mcmeta', data: JSON.stringify(packMcmeta, null, 2) });
  files.push({ name: 'pack.png', data: await canvasToBlob(packIcon(textures)) });

  const textureEntries = [];
  for (const file of target.files) {
    const canvas = file.transparent ? transparentCanvas(meta.size) : textures[file.face].canvas;
    files.push({
      name: `assets/minecraft/textures/block/${file.path}.png`,
      data: await canvasToBlob(canvas),
    });
    textureEntries.push(file.transparent ? `${file.path}.png (transparent overlay)` : `${file.path}.png`);
  }

  const notes = [
    'BLOCKLOOM RESOURCE PACK',
    '=======================',
    '',
    `Target block: ${target.label}`,
    `Material:    ${meta.materialName}`,
    `Seed:        ${meta.seed}`,
    `Resolution:  ${meta.size} × ${meta.size} px`,
    `Generated:   ${meta.origin === 'ai' ? 'AI concept, post-processed in browser' : 'Procedural studio'}`,
    '',
    'Install',
    '-------',
    '1. Drop this zip in .minecraft/resourcepacks/ (or your world resourcepacks folder).',
    '2. Open Options → Resource Packs and enable “Blockloom”.',
    '3. The target vanilla block now uses this texture.',
    '',
    'Texture files',
    '-------------',
    ...textureEntries.map((entry) => `  - ${entry}`),
    '',
    `Pack format: ${PACK_FORMAT} (Minecraft 1.21+)`,
    'This is a texture override pack, not a new block. It replaces the listed',
    'vanilla block textures. Custom blocks require a mod or datapack.',
    '',
  ];
  if (target.note) notes.push(`Tint note: ${target.note}`, '');
  files.push({ name: 'README.txt', data: notes.join('\n') });

  files.push({
    name: 'blockloom-pack.json',
    data: JSON.stringify({
      generator: 'Blockloom resource pack exporter',
      target: target.label,
      targetId: meta.materialId,
      material: meta.materialName,
      seed: meta.seed,
      resolution: meta.size,
      origin: meta.origin || 'procedural',
      prompt: meta.prompt || null,
      packFormat: PACK_FORMAT,
      files: target.files.map((file) => `assets/minecraft/textures/block/${file.path}.png`),
      tileable: true,
    }, null, 2),
  });

  const zip = await createZip(files);
  return {
    blob: zip,
    target,
    filename: `blockloom_resourcepack_${slugify(target.label)}_${meta.seed}_${meta.size}px.zip`,
    description,
    fileCount: files.length,
  };
}

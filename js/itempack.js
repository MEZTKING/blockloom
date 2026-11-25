/* Item/weapon resource-pack export. Browser-only because the source is a canvas. */
import { createZip } from './zip.js';
import { getPackFormat } from './resourcepack.js';

function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('PNG encoding failed'))), 'image/png');
  });
}

function iconCanvas(itemCanvas, size = 128) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = '#0b0d08';
  ctx.fillRect(0, 0, size, size);
  const inner = size - 20;
  ctx.globalAlpha = 0.08;
  ctx.fillStyle = '#b9ee6a';
  for (let i = 0; i < inner; i += 12) ctx.fillRect(10 + i, 10, 1, inner);
  for (let i = 0; i < inner; i += 12) ctx.fillRect(10, 10 + i, inner, 1);
  ctx.globalAlpha = 1;
  ctx.drawImage(itemCanvas, 10, 10, inner, inner);
  return canvas;
}

function slug(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'item';
}

export async function buildItemResourcePack({
  canvas,
  itemId,
  title,
  seed,
  size,
  material,
  type,
  formatId = 'modern',
}) {
  const format = getPackFormat(formatId);
  const slugId = slug(itemId);
  const itemBlob = await canvasToBlob(canvas);
  const iconBlob = await canvasToBlob(iconCanvas(canvas));
  const packMcmeta = {
    pack: {
      description: `Blockloom · ${title}`,
      pack_format: format.packFormat,
      supported_formats: format.supportedFormats,
      min_format: format.minFormat,
      max_format: format.maxFormat,
    },
  };
  const metadata = {
    generator: 'Blockloom item pack builder',
    schema: 1,
    format: {
      id: format.id,
      label: format.label,
      packFormat: format.packFormat,
      supportedFormats: format.supportedFormats,
      minFormat: format.minFormat,
      maxFormat: format.maxFormat,
    },
    item: {
      target: itemId,
      path: `assets/minecraft/textures/item/${itemId}.png`,
      type,
      material,
      seed,
      size,
    },
  };
  const readme = [
    'BLOCKLOOM ITEM RESOURCE PACK',
    '============================',
    '',
    `Item:       ${itemId}`,
    `Title:      ${title}`,
    `Seed:       ${seed}`,
    `Resolution: ${size} × ${size} px`,
    `Format:     ${format.packFormat} (${format.label})`,
    '',
    'Install',
    '-------',
    '1. Drop this zip into .minecraft/resourcepacks/.',
    '2. Enable “Blockloom” in Options → Resource Packs.',
    '',
    'This overrides the item texture path only. It does not add a new item.',
    '',
  ].join('\n');
  const blob = await createZip([
    { name: `assets/minecraft/textures/item/${itemId}.png`, data: itemBlob },
    { name: 'pack.mcmeta', data: JSON.stringify(packMcmeta, null, 2) },
    { name: 'pack.png', data: iconBlob },
    { name: 'README.txt', data: readme },
    { name: 'blockloom-item-pack.json', data: JSON.stringify(metadata, null, 2) },
  ]);
  return {
    blob,
    filename: `blockloom_itempack_${slugId}_${seed}_${size}px.zip`,
    format,
    itemId,
  };
}

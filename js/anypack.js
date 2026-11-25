/* Universal texture-only resource pack: package any PNG or .png.mcmeta at any assets/.../textures/... path. */
import { createZip } from './zip.js';
import { getPackFormat } from './resourcepack.js';

function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('PNG encoding failed'))), 'image/png');
  });
}

function slug(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'custom-pack';
}

async function decodeImage(file) {
  if (typeof createImageBitmap === 'function') {
    try { return await createImageBitmap(file); } catch { /* fall through */ }
  }
  const url = URL.createObjectURL(file);
  try {
    return await new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Could not decode pack image.'));
      image.src = url;
    });
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }
}

async function packIcon(entries) {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#0b0d08';
  ctx.fillRect(0, 0, 128, 128);
  ctx.strokeStyle = 'rgba(185,238,106,.22)';
  ctx.lineWidth = 1;
  for (let i = 16; i < 128; i += 16) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 128); ctx.moveTo(0, i); ctx.lineTo(128, i); ctx.stroke(); }
  const first = entries.find((entry) => entry.file.type === 'image/png');
  if (first) {
    const image = await decodeImage(first.file);
    const inner = 104;
    const w = image.width || inner;
    const h = image.height || inner;
    const scale = Math.min(inner / w, inner / h);
    const dw = Math.max(1, Math.round(w * scale));
    const dh = Math.max(1, Math.round(h * scale));
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(image, (128 - dw) / 2, (128 - dh) / 2, dw, dh);
  } else {
    ctx.fillStyle = '#b9ee6a';
    ctx.font = 'bold 38px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('B', 64, 64);
  }
  return canvas;
}

export async function buildAnyResourcePack(entries, { formatId = 'modern', packName = 'Blockloom Custom Pack' } = {}) {
  if (!Array.isArray(entries) || entries.length === 0) throw new Error('Add at least one texture file.');
  const format = getPackFormat(formatId);
  const files = [];
  const manifest = {
    generator: 'Blockloom universal texture pack',
    schema: 1,
    format: { id: format.id, label: format.label, packFormat: format.packFormat, supportedFormats: format.supportedFormats, minFormat: format.minFormat, maxFormat: format.maxFormat },
    entries: [],
  };
  for (const entry of entries) {
    if (!/^assets\/[a-z0-9_.-]+\/textures\/[a-z0-9_./-]+\.(png|png\.mcmeta)$/i.test(entry.path) || entry.path.includes('..')) {
      throw new Error(`Invalid texture path: ${entry.path}`);
    }
    files.push({ name: entry.path, data: await entry.file.arrayBuffer() });
    manifest.entries.push({ path: entry.path, bytes: entry.file.size, name: entry.file.name, width: entry.width || null, height: entry.height || null, alphaPct: entry.alphaPct ?? null, colors: entry.colors ?? null });
  }
  const packMcmeta = {
    pack: {
      description: packName,
      pack_format: format.packFormat,
      supported_formats: format.supportedFormats,
      min_format: format.minFormat,
      max_format: format.maxFormat,
    },
  };
  const iconBlob = await canvasToBlob(await packIcon(entries));
  const readme = [
    'BLOCKLOOM UNIVERSAL TEXTURE PACK',
    '================================',
    '',
    `Files:  ${entries.length}`,
    `Format: ${format.packFormat} (${format.label})`,
    '',
    'This pack contains texture files only. It does not add models, item definitions, sounds, language files, or new blocks/items.',
    '',
    ...entries.map((entry) => `  - ${entry.path}`),
    '',
  ].join('\n');
  files.push({ name: 'pack.mcmeta', data: JSON.stringify(packMcmeta, null, 2) });
  files.push({ name: 'pack.png', data: iconBlob });
  files.push({ name: 'README.txt', data: readme });
  files.push({ name: 'blockloom-custom-pack.json', data: JSON.stringify(manifest, null, 2) });
  const blob = await createZip(files);
  return {
    blob,
    filename: `blockloom_universal_${slug(packName)}_${new Date().toISOString().slice(0, 10)}.zip`,
    format,
    count: entries.length,
  };
}

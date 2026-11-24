/* Optional AI concept layer: provider request, pixel reduction, palette snap, seam repair. */

import { getMaterial } from '../core/index.js';
import { renderTexture } from './engine.js';

const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];
const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
const lerp = (a, b, t) => a + (b - a) * t;

export async function fetchAiStatus() {
  const response = await fetch('/api/ai/status', { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error('AI backend is unavailable. Run the included Node server.');
  return response.json();
}

export async function generateAiConcept(prompt, seed) {
  const response = await fetch('/api/ai/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ prompt, seed }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || 'The AI provider did not answer.');
  if (!payload.image) throw new Error('The AI provider returned no image.');
  return payload;
}

function loadImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('The concept image could not be decoded.'));
    image.src = source;
  });
}

function canvasOf(size) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  return canvas;
}

function hex(rgb) {
  return `#${rgb.map((v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join('')}`;
}

function cropSquare(image, size, smoothing = true) {
  const canvas = canvasOf(size);
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = smoothing;
  ctx.imageSmoothingQuality = 'high';
  const sourceWidth = image.naturalWidth || image.width;
  const sourceHeight = image.naturalHeight || image.height;
  const side = Math.min(sourceWidth, sourceHeight);
  const sx = (sourceWidth - side) / 2;
  const sy = (sourceHeight - side) / 2;
  ctx.drawImage(image, sx, sy, side, side, 0, 0, size, size);
  return canvas;
}

function repairSeams(data, size, strength = 1) {
  const band = Math.max(1, Math.round(size / 16));
  for (let y = 0; y < size; y++) {
    for (let d = 0; d < band; d++) {
      const a = (y * size + d) * 4;
      const b = (y * size + size - 1 - d) * 4;
      const t = strength * (1 - d / band);
      for (let c = 0; c < 3; c++) {
        const avg = (data[a + c] + data[b + c]) / 2;
        data[a + c] = lerp(data[a + c], avg, t);
        data[b + c] = lerp(data[b + c], avg, t);
      }
    }
  }
  for (let x = 0; x < size; x++) {
    for (let d = 0; d < band; d++) {
      const a = (d * size + x) * 4;
      const b = ((size - 1 - d) * size + x) * 4;
      const t = strength * (1 - d / band);
      for (let c = 0; c < 3; c++) {
        const avg = (data[a + c] + data[b + c]) / 2;
        data[a + c] = lerp(data[a + c], avg, t);
        data[b + c] = lerp(data[b + c], avg, t);
      }
    }
  }
}

function normalizePixels(data, saturation = 1.28) {
  const lums = [];
  for (let i = 0; i < data.length; i += 4) {
    lums.push((data[i] * 0.2126 + data[i + 1] * 0.7152 + data[i + 2] * 0.0722) / 255);
  }
  lums.sort((a, b) => a - b);
  const lo = lums[Math.floor(lums.length * 0.02)] ?? 0;
  const hi = lums[Math.floor(lums.length * 0.98)] ?? 1;
  const span = Math.max(0.08, hi - lo);
  const targetLo = 0.085;
  const targetHi = 0.91;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i] / 255;
    const g = data[i + 1] / 255;
    const b = data[i + 2] / 255;
    const l = r * 0.2126 + g * 0.7152 + b * 0.0722;
    const nl = clamp(targetLo + ((l - lo) / span) * (targetHi - targetLo), 0, 1);
    const scale = l > 0.0001 ? nl / l : 0;
    let nr = clamp(nl + (r * scale - nl) * saturation, 0, 1);
    let ng = clamp(nl + (g * scale - nl) * saturation, 0, 1);
    let nb = clamp(nl + (b * scale - nl) * saturation, 0, 1);
    data[i] = nr * 255;
    data[i + 1] = ng * 255;
    data[i + 2] = nb * 255;
  }
}

function medianCut(pixels, maxColors) {
  let boxes = [pixels];
  while (boxes.length < maxColors) {
    let bestIndex = -1;
    let bestScore = 0;
    let bestChannel = 0;
    for (let i = 0; i < boxes.length; i++) {
      const box = boxes[i];
      if (box.length < 2) continue;
      const min = [255, 255, 255];
      const max = [0, 0, 0];
      for (const p of box) {
        for (let c = 0; c < 3; c++) {
          if (p[c] < min[c]) min[c] = p[c];
          if (p[c] > max[c]) max[c] = p[c];
        }
      }
      const ranges = [max[0] - min[0], max[1] - min[1], max[2] - min[2]];
      const channel = ranges.indexOf(Math.max(...ranges));
      const score = ranges[channel] * Math.sqrt(box.length);
      if (score > bestScore) {
        bestScore = score;
        bestIndex = i;
        bestChannel = channel;
      }
    }
    if (bestIndex === -1 || bestScore < 3) break;
    const box = boxes[bestIndex].slice().sort((a, b) => a[bestChannel] - b[bestChannel]);
    const mid = Math.floor(box.length / 2);
    boxes.splice(bestIndex, 1, box.slice(0, mid), box.slice(mid));
  }
  return boxes.map((box) => {
    const sum = [0, 0, 0];
    for (const p of box) for (let c = 0; c < 3; c++) sum[c] += p[c];
    return sum.map((v) => Math.round(v / box.length));
  }).filter((p) => p.some((v) => Number.isFinite(v)));
}

function extractPalette(data, maxColors = 8) {
  const pixels = [];
  for (let i = 0; i < data.length; i += 4) pixels.push([data[i], data[i + 1], data[i + 2]]);
  let palette = medianCut(pixels, maxColors);
  // Fold near-identical swatches together so tiny 16 px ramps stay readable.
  const unique = [];
  for (const color of palette) {
    if (!unique.some((other) => Math.hypot(other[0] - color[0], other[1] - color[1], other[2] - color[2]) < 10)) {
      unique.push(color);
    }
  }
  palette = unique;
  if (!palette.length) {
    const base = [120, 120, 120];
    palette = [28, 58, 90, 125, 160, 200].map((v) => base.map((c) => clamp(c + v - 110, 0, 255)));
  }
  palette.sort((a, b) => (a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722) - (b[0] * 0.2126 + b[1] * 0.7152 + b[2] * 0.0722));
  const lum = (c) => (c[0] * 0.2126 + c[1] * 0.7152 + c[2] * 0.0722) / 255;
  if (palette.length < 5) {
    const avg = palette.reduce((sum, c) => [sum[0] + c[0], sum[1] + c[1], sum[2] + c[2]], [0, 0, 0]).map((v) => v / palette.length);
    const low = avg.map((v) => clamp(v * 0.48, 0, 255));
    const high = avg.map((v) => clamp(v + (255 - v) * 0.38, 0, 255));
    palette = [low, ...palette, high].filter((c, i, arr) => arr.findIndex((o) => Math.hypot(o[0] - c[0], o[1] - c[1], o[2] - c[2]) < 8) === i);
    palette.sort((a, b) => (a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722) - (b[0] * 0.2126 + b[1] * 0.7152 + b[2] * 0.0722));
  }
  if (lum(palette[palette.length - 1]) < 0.68) {
    const top = palette[palette.length - 1];
    palette[palette.length - 1] = top.map((v) => clamp(v + (255 - v) * 0.28, 0, 255));
  }
  if (lum(palette[0]) > 0.22) {
    const low = palette[0];
    palette[0] = low.map((v) => clamp(v * 0.7, 0, 255));
  }
  return palette;
}

function quantize(data, palette, size) {
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const dither = (BAYER[y & 3][x & 3] / 16 - 0.46875) * 14;
      const r = data[i] + dither;
      const g = data[i + 1] + dither;
      const b = data[i + 2] + dither;
      let best = 0;
      let bestDistance = Infinity;
      for (let p = 0; p < palette.length; p++) {
        const color = palette[p];
        const dr = r - color[0];
        const dg = g - color[1];
        const db = b - color[2];
        const distance = dr * dr * 0.3 + dg * dg * 0.59 + db * db * 0.11;
        if (distance < bestDistance) {
          bestDistance = distance;
          best = p;
        }
      }
      const color = palette[best];
      data[i] = color[0];
      data[i + 1] = color[1];
      data[i + 2] = color[2];
      data[i + 3] = 255;
    }
  }
}

function seamScore(data, size) {
  let edge = 0;
  let edgeCount = 0;
  let inner = 0;
  let innerCount = 0;
  const diff = (a, b) => (Math.abs(data[a] - data[b]) + Math.abs(data[a + 1] - data[b + 1]) + Math.abs(data[a + 2] - data[b + 2])) / 3;
  for (let y = 0; y < size; y++) {
    edge += diff((y * size) * 4, (y * size + size - 1) * 4);
    edgeCount++;
    for (let x = 1; x < size; x++) {
      inner += diff((y * size + x - 1) * 4, (y * size + x) * 4);
      innerCount++;
    }
  }
  for (let x = 0; x < size; x++) {
    edge += diff(x * 4, ((size - 1) * size + x) * 4);
    edgeCount++;
    for (let y = 1; y < size; y++) {
      inner += diff(((y - 1) * size + x) * 4, (y * size + x) * 4);
      innerCount++;
    }
  }
  return {
    edge: edge / Math.max(1, edgeCount),
    inner: inner / Math.max(1, innerCount),
  };
}

function rotateCanvas(source, turns) {
  const size = source.width;
  const canvas = canvasOf(size);
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.translate(size / 2, size / 2);
  ctx.rotate((turns * Math.PI) / 2);
  ctx.drawImage(source, -size / 2, -size / 2);
  return canvas;
}

function quantizeCanvasToPalette(source, palette) {
  const size = source.width;
  const canvas = canvasOf(size);
  const ctx = canvas.getContext('2d');
  const data = ctx.createImageData(size, size);
  const sourceData = source.getContext('2d').getImageData(0, 0, size, size).data;
  data.data.set(sourceData);
  quantize(data.data, palette, size);
  ctx.putImageData(data, 0, 0);
  return canvas;
}

function makeFace(canvas, face, size, material, palette, swatches) {
  return {
    canvas,
    size,
    face,
    material,
    palette: palette.map((rgb) => rgb.slice()),
    swatches: swatches.slice(),
    accentSwatches: [],
    overlayAccentSwatches: [],
  };
}

function makeSet(side, top, bottom, size, material, palette, swatches) {
  return {
    side: makeFace(side, 'side', size, material, palette, swatches),
    top: makeFace(top, 'top', size, material, palette, swatches),
    bottom: makeFace(bottom, 'bottom', size, material, palette, swatches),
    material,
    palette: swatches.slice(),
    swatches: swatches.slice(),
    accentSwatches: [],
    overlayAccentSwatches: [],
    size,
    ai: true,
  };
}

function shiftedRotatedCanvas(source, turn, hue, offset) {
  const size = source.width;
  const canvas = canvasOf(size);
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.filter = `hue-rotate(${hue}deg) saturate(1.04)`;
  ctx.translate(size / 2, size / 2);
  ctx.rotate((turn * Math.PI) / 2);
  ctx.translate(offset, -offset);
  for (let ox = -1; ox <= 1; ox++) {
    for (let oy = -1; oy <= 1; oy++) {
      ctx.drawImage(source, -size / 2 + ox * size, -size / 2 + oy * size);
    }
  }
  ctx.filter = 'none';
  return canvas;
}

function deriveSeeds(baseSeed) {
  const offsets = [137, 409, 757, 1181, 1657, 2131];
  return offsets.map((offset) => ((baseSeed * 23 + offset * 41) % 900000) + 1000);
}

export function createAiVariations(baseSet, count = 6) {
  const material = baseSet.material;
  const size = baseSet.size;
  const palette = baseSet.side.palette;
  const swatches = baseSet.swatches;
  const seeds = deriveSeeds(baseSet.aiSeed || 1);
  const variations = [];
  const rotations = [0, 1, 2, 3, 1, 2];
  const hues = [0, 8, -10, 14, -6, 18];
  const offsets = [0, 2, 5, 1, 7, 3];
  for (let i = 0; i < Math.min(count, seeds.length); i++) {
    let side;
    if (i === 0) {
      side = baseSet.side.canvas;
    } else {
      side = shiftedRotatedCanvas(baseSet.side.canvas, rotations[i], hues[i], offsets[i]);
      side = quantizeCanvasToPalette(side, palette);
    }
    const top = rotateCanvas(side, 1);
    const bottom = rotateCanvas(side, 2);
    const set = makeSet(side, top, bottom, size, material, palette, swatches);
    set.ai = true;
    set.aiSeed = seeds[i];
    variations.push({ seed: seeds[i], textures: set, accent: swatches[swatches.length - 1] });
  }
  return variations;
}

export async function processAiConcept({
  image,
  prompt,
  provider,
  model,
  seed,
  size,
  materialId,
  strength = 0.55,
  modifiers = [],
  overlayAccent = null,
  finish = 'balanced',
}) {
  const material = getMaterial(materialId);
  const blend = clamp(Number(strength), 0, 1);
  const loaded = await loadImage(image);

  // Reduce to a rich intermediate first so the texture keeps structure instead of
  // becoming a single averaged blur.
  const intermediate = cropSquare(loaded, Math.max(48, size * 3), true);
  const small = cropSquare(intermediate, size, true);
  const ctx = small.getContext('2d');
  const imageData = ctx.getImageData(0, 0, size, size);
  const data = imageData.data;

  normalizePixels(data, 1.28);
  repairSeams(data, size, 1);

  // Blend the concept with a procedural pass from the same recipe. This is the
  // important trick: AI supplies colour and mood, the recipe supplies readable
  // block structure at 16 px. A strength of 100% keeps the raw concept surface.
  const procedural = renderTexture({
    materialId,
    seed: seed + 73,
    size,
    finish,
    grain: 58,
    contrast: 58,
    hue: 0,
    modifiers,
    overlayAccent,
    face: 'side',
  });
  const procData = procedural.canvas.getContext('2d').getImageData(0, 0, size, size).data;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = lerp(procData[i], data[i], blend);
    data[i + 1] = lerp(procData[i + 1], data[i + 1], blend);
    data[i + 2] = lerp(procData[i + 2], data[i + 2], blend);
    data[i + 3] = 255;
  }

  const palette = extractPalette(data, size <= 16 ? 8 : size <= 32 ? 10 : 12);
  quantize(data, palette, size);
  ctx.putImageData(imageData, 0, 0);

  const swatches = palette.map(hex);
  const top = rotateCanvas(small, 1);
  const bottom = rotateCanvas(small, 2);
  const set = makeSet(small, top, bottom, size, material, palette, swatches);
  set.ai = true;
  set.aiSeed = seed;
  set.aiPrompt = prompt;
  set.aiProvider = provider;
  set.aiModel = model;
  set.aiSource = image;
  set.aiStrength = blend;
  set.seam = seamScore(data, size);

  const finalData = small.getContext('2d').getImageData(0, 0, size, size).data;
  set.aiSeam = seamScore(finalData, size);
  set.aiVariations = createAiVariations(set);
  return set;
}

/* Blockloom texture engine — deterministic, tileable, pixel-first. */

const TAU = Math.PI * 2;
const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
const lerp = (a, b, t) => a + (b - a) * t;
const mod = (n, m) => ((n % m) + m) % m;

function hash2(x, y, seed = 0) {
  let h = Math.imul((x | 0) + 0x9e3779b9, 0x85ebca6b);
  h ^= Math.imul((y | 0) + 0x7f4a7c15, 0xc2b2ae35);
  h ^= Math.imul((seed | 0) + 0x27d4eb2f, 0x165667b1);
  h = Math.imul(h ^ (h >>> 15), 0x2c1b3c6d);
  h = Math.imul(h ^ (h >>> 12), 0x297a2d39);
  h ^= h >>> 15;
  return (h >>> 0) / 4294967295;
}

function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const smooth = (t) => t * t * (3 - 2 * t);

/* Periodic value noise. Lattice wraps, so the finished texture tiles. */
function vnoise(x, y, cx, cy, seed) {
  const X = x * cx;
  const Y = y * cy;
  const xi = Math.floor(X);
  const yi = Math.floor(Y);
  const tx = smooth(X - xi);
  const ty = smooth(Y - yi);
  const x0 = mod(xi, cx);
  const y0 = mod(yi, cy);
  const x1 = mod(xi + 1, cx);
  const y1 = mod(yi + 1, cy);
  const a = hash2(x0, y0, seed);
  const b = hash2(x1, y0, seed);
  const c = hash2(x0, y1, seed);
  const d = hash2(x1, y1, seed);
  return lerp(lerp(a, b, tx), lerp(c, d, tx), ty);
}

function fbm(x, y, cx, cy, seed, octaves = 4, persistence = 0.5) {
  let total = 0;
  let amp = 1;
  let norm = 0;
  for (let i = 0; i < octaves; i++) {
    total += vnoise(x, y, cx * 2 ** i, cy * 2 ** i, seed + i * 101) * amp;
    norm += amp;
    amp *= persistence;
  }
  return total / norm;
}

function worley(x, y, cells, seed) {
  const X = x * cells;
  const Y = y * cells;
  const xi = Math.floor(X);
  const yi = Math.floor(Y);
  let d1 = 999;
  let d2 = 999;
  let id = 0;
  let cx0 = 0;
  let cy0 = 0;
  for (let oy = -1; oy <= 1; oy++) {
    for (let ox = -1; ox <= 1; ox++) {
      const cx = xi + ox;
      const cy = yi + oy;
      const wx = mod(cx, cells);
      const wy = mod(cy, cells);
      const px = cx + 0.18 + hash2(wx, wy, seed + 11) * 0.64;
      const py = cy + 0.18 + hash2(wx, wy, seed + 29) * 0.64;
      const dx = X - px;
      const dy = Y - py;
      const dist = dx * dx + dy * dy;
      if (dist < d1) {
        d2 = d1;
        d1 = dist;
        id = wx + wy * cells;
        cx0 = cx;
        cy0 = cy;
      } else if (dist < d2) {
        d2 = dist;
      }
    }
  }
  return {
    d1: Math.sqrt(d1) / cells,
    edge: (Math.sqrt(d2) - Math.sqrt(d1)) / cells,
    id,
    cellX: mod(cx0, cells),
    cellY: mod(cy0, cells),
  };
}

const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

function bayer(x, y) {
  return BAYER[y & 3][x & 3] / 16 - 0.46875;
}

/* Colour helpers */
function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function rgbToHsl([r, g, b]) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }
  return { h: h * 360, s, l };
}

function hslToRgb(h, s, l) {
  h = mod(h, 360) / 360;
  s = clamp(s);
  l = clamp(l);
  if (s === 0) {
    const v = Math.round(l * 255);
    return [v, v, v];
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hue = (t) => {
    t = mod(t, 1);
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return [
    Math.round(hue(h + 1 / 3) * 255),
    Math.round(hue(h) * 255),
    Math.round(hue(h - 1 / 3) * 255),
  ];
}

function hexToHsl(hex) {
  return rgbToHsl(hexToRgb(hex));
}

function buildPalette(baseHex, opts = {}) {
  const base = hexToHsl(baseHex);
  const {
    hue = 0,
    hueTarget = null,
    satTarget = null,
    light = 0,
    count = 8,
    spread = 0.38,
    satBoost = 0,
  } = opts;
  const H = hueTarget == null ? base.h + hue : hueTarget + hue;
  const S = clamp(Math.max(base.s, satTarget == null ? base.s : satTarget) + satBoost);
  const L = clamp(base.l + light);
  return Array.from({ length: count }, (_, i) => {
    const t = i / (count - 1);
    const shade = (t - 0.5) * spread;
    return hslToRgb(
      H + (t - 0.5) * 13,
      clamp(S + (t - 0.5) * 0.07),
      clamp(L + shade, 0.035, 0.97),
    );
  });
}

function shiftRgb([r, g, b], amount) {
  return [
    clamp(Math.round(r + amount), 0, 255),
    clamp(Math.round(g + amount), 0, 255),
    clamp(Math.round(b + amount), 0, 255),
  ];
}

function mixRgb(a, b, t) {
  return [
    Math.round(lerp(a[0], b[0], t)),
    Math.round(lerp(a[1], b[1], t)),
    Math.round(lerp(a[2], b[2], t)),
  ];
}

/* Material definitions */
export const MATERIALS = [
  { id: 'stone', name: 'Stone', group: 'Stone', base: '#858585', type: 'stone', keywords: ['stone', 'rock', 'boulder'] },
  { id: 'cobblestone', name: 'Cobblestone', group: 'Stone', base: '#81837d', type: 'cobble', keywords: ['cobblestone', 'cobble', 'rocky'] },
  { id: 'deepslate', name: 'Deepslate', group: 'Stone', base: '#4d4e55', type: 'deepslate', keywords: ['deepslate', 'slate', 'deep stone'] },
  { id: 'gravel', name: 'Gravel', group: 'Stone', base: '#898680', type: 'gravel', keywords: ['gravel', 'pebbles', 'pebble'] },
  { id: 'bricks', name: 'Bricks', group: 'Stone', base: '#9e6350', type: 'bricks', keywords: ['brick', 'bricks', 'masonry'] },
  { id: 'obsidian', name: 'Obsidian', group: 'Stone', base: '#292334', type: 'obsidian', keywords: ['obsidian', 'voidstone'] },
  { id: 'dirt', name: 'Dirt', group: 'Earth', base: '#7b5940', type: 'dirt', keywords: ['dirt', 'soil', 'earth', 'mud', 'loam'] },
  { id: 'grass_block', name: 'Grass Block', group: 'Earth', base: '#71994f', type: 'grass', dirt: '#79573d', keywords: ['grass', 'turf', 'lawn', 'grass block', 'grassblock'] },
  { id: 'sand', name: 'Sand', group: 'Earth', base: '#d5c28e', type: 'sand', keywords: ['sand', 'desert', 'dune'] },
  { id: 'snow', name: 'Snow', group: 'Earth', base: '#e6eeee', type: 'snow', keywords: ['snow', 'snowy', 'arctic'] },
  { id: 'ice', name: 'Ice', group: 'Earth', base: '#8ab8cc', type: 'ice', keywords: ['ice', 'frozen', 'glacier'] },
  { id: 'moss_block', name: 'Moss Block', group: 'Earth', base: '#6e8a3f', type: 'moss', keywords: ['moss block', 'mossblock', 'mossy block'] },
  { id: 'oak_planks', name: 'Oak Planks', group: 'Wood', base: '#a87b4d', type: 'planks', keywords: ['plank', 'planks', 'wooden', 'wood planks', 'floorboard', 'board'] },
  { id: 'oak_log', name: 'Oak Log', group: 'Wood', base: '#6f5037', type: 'log', keywords: ['log', 'bark', 'tree trunk', 'timber', 'wood log'] },
  { id: 'leaves', name: 'Leaves', group: 'Wood', base: '#588541', type: 'leaves', keywords: ['leaves', 'leaf', 'foliage', 'canopy'] },
  { id: 'netherrack', name: 'Netherrack', group: 'Other', base: '#763438', type: 'netherrack', keywords: ['netherrack', 'nether', 'hellstone', 'infernal'] },
  { id: 'end_stone', name: 'End Stone', group: 'Other', base: '#d9dda0', type: 'endstone', keywords: ['end stone', 'endstone', 'end'] },
  { id: 'prismarine', name: 'Prismarine', group: 'Other', base: '#589a8b', type: 'prismarine', keywords: ['prismarine', 'ocean', 'aquatic'] },
  { id: 'terracotta', name: 'Terracotta', group: 'Other', base: '#9b6048', type: 'terracotta', keywords: ['terracotta', 'clay', 'adobe'] },
  { id: 'wool', name: 'Wool', group: 'Other', base: '#e7e0d4', type: 'wool', keywords: ['wool', 'fabric', 'cloth', 'carpet'] },
  { id: 'gold_ore', name: 'Gold Ore', group: 'Ores', base: '#817d73', accent: '#f0c94f', type: 'ore', ore: 'gold', keywords: ['gold ore', 'gold', 'gilded ore'] },
  { id: 'diamond_ore', name: 'Diamond Ore', group: 'Ores', base: '#7d8583', accent: '#57ddd4', type: 'ore', ore: 'diamond', keywords: ['diamond ore', 'diamond', 'diamonds'] },
  { id: 'redstone_ore', name: 'Redstone Ore', group: 'Ores', base: '#7d6b6b', accent: '#d84a3e', type: 'ore', ore: 'redstone', keywords: ['redstone ore', 'redstone', 'ruby ore'] },
  { id: 'emerald_ore', name: 'Emerald Ore', group: 'Ores', base: '#7c8376', accent: '#39cc72', type: 'ore', ore: 'emerald', keywords: ['emerald ore', 'emerald', 'emeralds'] },
  { id: 'copper_ore', name: 'Copper Ore', group: 'Ores', base: '#837c70', accent: '#d08758', type: 'ore', ore: 'copper', keywords: ['copper ore', 'copper', 'verdigris'] },
  { id: 'lapis_ore', name: 'Lapis Ore', group: 'Ores', base: '#7d7d78', accent: '#3f6fd2', type: 'ore', ore: 'lapis', keywords: ['lapis ore', 'lapis', 'azure ore'] },
];

const MATERIAL_BY_ID = new Map(MATERIALS.map((m) => [m.id, m]));
export const getMaterial = (id) => MATERIAL_BY_ID.get(id) || MATERIALS[1];

/* Prompt vocabulary */
const MATERIAL_WORDS = [...MATERIALS]
  .flatMap((m) => m.keywords.map((word) => ({ id: m.id, word, priority: m.type === 'ore' ? 3 : 2 })))
  .sort((a, b) => b.word.length - a.word.length);

const MODIFIER_WORDS = [
  { id: 'mossy', label: 'Mossy', words: ['mossy', 'moss covered', 'moss-covered', 'overgrown', 'lichen'] },
  { id: 'cracked', label: 'Cracked', words: ['cracked', 'fractured', 'fissured', 'broken'] },
  { id: 'glowing', label: 'Glowing', words: ['glowing', 'glow', 'emissive', 'luminous', 'neon', 'magical'] },
  { id: 'frosted', label: 'Frosted', words: ['frosted', 'frozen over', 'icy', 'snowy', 'rime'] },
  { id: 'ancient', label: 'Ancient', words: ['ancient', 'weathered', 'eroded', 'old', 'ruined', 'antique'] },
  { id: 'burned', label: 'Charred', words: ['burned', 'burnt', 'charred', 'scorched', 'ashen'] },
  { id: 'gilded', label: 'Gilded', words: ['gilded', 'gold flecked', 'gold-flecked', 'brass', 'ornate'] },
  { id: 'flecked', label: 'Flecked', words: ['fleck', 'flecks', 'flake', 'flakes', 'speck', 'specks', 'vein', 'veins'] },
  { id: 'crystal', label: 'Crystals', words: ['crystal', 'crystals', 'crystalline', 'gem', 'gems', 'geode', 'shard', 'shards'] },
  { id: 'wet', label: 'Wet', words: ['wet', 'damp', 'rain soaked', 'rain-soaked', 'glossy'] },
  { id: 'flowery', label: 'Flowery', words: ['flowery', 'flowers', 'flower', 'blooming', 'blossom'] },
];

const COLOR_WORDS = [
  { name: 'Cyan', hex: '#54e0d8', hue: 178, sat: 0.62, words: ['cyan', 'turquoise', 'aqua'] },
  { name: 'Blue', hex: '#5688dd', hue: 219, sat: 0.62, words: ['blue', 'azure', 'cobalt'] },
  { name: 'Sapphire', hex: '#3f65c9', hue: 224, sat: 0.7, words: ['sapphire'] },
  { name: 'Teal', hex: '#3fbfa7', hue: 170, sat: 0.58, words: ['teal'] },
  { name: 'Green', hex: '#67c95f', hue: 116, sat: 0.58, words: ['green', 'verdant'] },
  { name: 'Emerald', hex: '#32c971', hue: 146, sat: 0.65, words: ['emerald'] },
  { name: 'Lime', hex: '#afe85c', hue: 84, sat: 0.68, words: ['lime'] },
  { name: 'Purple', hex: '#a578dd', hue: 274, sat: 0.56, words: ['purple', 'violet', 'amethyst'] },
  { name: 'Magenta', hex: '#d956b6', hue: 314, sat: 0.64, words: ['magenta', 'fuchsia'] },
  { name: 'Pink', hex: '#eb81ab', hue: 337, sat: 0.58, words: ['pink', 'rose', 'blush'] },
  { name: 'Red', hex: '#df4e49', hue: 2, sat: 0.7, words: ['red', 'crimson', 'ruby', 'scarlet'] },
  { name: 'Orange', hex: '#ec904c', hue: 26, sat: 0.7, words: ['orange', 'tangerine'] },
  { name: 'Amber', hex: '#e7b44e', hue: 41, sat: 0.72, words: ['amber', 'honey'] },
  { name: 'Gold', hex: '#eec94f', hue: 47, sat: 0.74, words: ['golden', 'gold flecked', 'gold-flecked'] },
  { name: 'Yellow', hex: '#eadf5b', hue: 56, sat: 0.7, words: ['yellow', 'sunny'] },
  { name: 'White', hex: '#edf1ed', hue: 120, sat: 0.03, words: ['white', 'pale', 'ivory', 'snow white'], light: 0.16 },
  { name: 'Black', hex: '#27272d', hue: 240, sat: 0.07, words: ['black', 'dark', 'onyx'], light: -0.14 },
  { name: 'Brown', hex: '#8a5e42', hue: 25, sat: 0.35, words: ['brown', 'chocolate', 'umber'] },
  { name: 'Silver', hex: '#c7ced0', hue: 200, sat: 0.07, words: ['silver', 'steel', 'chrome'] },
];

function wordInText(word, text) {
  return new RegExp(`(^|[^a-z])${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z]|$)`, 'i').test(text);
}

export function parsePrompt(raw) {
  const text = ` ${raw.toLowerCase().replace(/[_-]/g, ' ')} `;
  let best = null;
  for (const candidate of MATERIAL_WORDS) {
    if (wordInText(candidate.word, text)) {
      const score = candidate.word.length * 10 + candidate.priority;
      if (!best || score > best.score) best = { id: candidate.id, score };
    }
  }

  const mods = [];
  for (const mod of MODIFIER_WORDS) {
    if (mod.words.some((word) => wordInText(word, text))) mods.push(mod.id);
  }

  let color = null;
  let colorAsAccent = false;
  for (const c of COLOR_WORDS) {
    const hit = c.words.find((word) => wordInText(word, text));
    if (hit && (!color || hit.length > color.matched.length)) {
      color = { ...c, matched: hit };
      const at = text.indexOf(` ${hit}`);
      const before = text.slice(Math.max(0, at - 34), at);
      const after = text.slice(at + hit.length, at + hit.length + 34);
      const context = `${before} ${after}`;
      colorAsAccent = /(crystal|gem|ore|vein|shard|flake|fleck|glow|accent|tip|speck)/.test(context);
    }
  }

  return {
    materialId: best?.id || null,
    modifiers: mods,
    color: color ? { name: color.name, hex: color.hex, hue: color.hue, sat: color.sat, light: color.light || 0 } : null,
    colorAsAccent,
    matchedColor: color?.name || null,
  };
}

export const MODIFIERS = MODIFIER_WORDS;
export const FINISHES = [
  { id: 'rugged', label: 'Rugged', note: 'Gritty, high-contrast grain' },
  { id: 'balanced', label: 'Balanced', note: 'Classic Minecraft density' },
  { id: 'smooth', label: 'Smooth', note: 'Clean, low-noise surfaces' },
];

const FINISH_CONFIG = {
  rugged: { grain: 1.2, depth: 1.16, dither: 1.25, clutter: 1.25 },
  balanced: { grain: 1, depth: 1, dither: 1, clutter: 1 },
  smooth: { grain: 0.38, depth: 0.82, dither: 0.35, clutter: 0.7 },
};

const NATURAL_GREEN = '#68893e';
const NATURAL_DARK = '#4c6732';

function createCanvas(size) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  return canvas;
}

function put(buf, size, x, y, rgb, alpha = 255) {
  const i = (y * size + x) * 4;
  buf[i] = rgb[0];
  buf[i + 1] = rgb[1];
  buf[i + 2] = rgb[2];
  buf[i + 3] = alpha;
}

function getPx(buf, size, x, y) {
  const i = (y * size + x) * 4;
  return [buf[i], buf[i + 1], buf[i + 2], buf[i + 3]];
}

function tune(ctx, t) {
  return clamp(0.5 + (t - 0.5) * ctx.depth + (hash2(ctx.x, ctx.y, ctx.seed + 991) - 0.5) * ctx.grain * 0.13);
}

function pick(ctx, palette, value, dither = true) {
  let v = clamp(value);
  if (dither) v += bayer(ctx.x, ctx.y) * 0.065 * ctx.dither;
  const idx = clamp(Math.floor(v * palette.length), 0, palette.length - 1);
  return palette[idx];
}

function topBorder(y, size) {
  return y < Math.max(1, Math.round(size * 0.12));
}

/* Stone-family renderers */
function renderStone(ctx) {
  const broad = fbm(ctx.u, ctx.v, 2, 2, ctx.seed + 1, 3, 0.58);
  const medium = fbm(ctx.u, ctx.v, 4, 4, ctx.seed + 8, 4, 0.52);
  const fine = fbm(ctx.u, ctx.v, 8, 8, ctx.seed + 44, 2, 0.5);
  const grain = hash2(ctx.x, ctx.y, ctx.seed + 80) - 0.5;
  let t = 0.5 + (broad - 0.5) * 0.42 + (medium - 0.5) * 0.38 + (fine - 0.5) * 0.26;
  t += grain * 0.11 * ctx.grain;
  if (hash2(ctx.x, ctx.y, ctx.seed + 3) < 0.045 * ctx.clutter) t -= 0.17;
  else if (grain > 0.44) t += 0.055;
  return pick(ctx, ctx.palette, tune(ctx, t));
}

function renderCobble(ctx) {
  const cells = ctx.size <= 16 ? 3 : ctx.size <= 32 ? 4 : 5;
  const w = worley(ctx.u, ctx.v, cells, ctx.seed + 5);
  const stone = hash2(w.id, 17, ctx.seed) - 0.5;
  const grain = hash2(ctx.x, ctx.y, ctx.seed + 61) - 0.5;
  let t = 0.5 + stone * 0.42 + (fbm(ctx.u, ctx.v, cells * 2, cells * 2, ctx.seed + 33, 3) - 0.5) * 0.32;
  t += grain * 0.15 * ctx.grain;
  const rim = w.edge;
  if (rim < 0.065) {
    const base = ctx.palette[0];
    return shiftRgb(base, -36 + grain * 14);
  }
  if (rim < 0.12) t -= 0.1;
  t += (0.1 - w.d1 * 0.16);
  return pick(ctx, ctx.palette, tune(ctx, t));
}

function renderBricks(ctx) {
  const size = ctx.size;
  const rowH = Math.max(3, Math.round(size / 4));
  const brickW = rowH * 2;
  const row = Math.floor(ctx.y / rowH);
  const offset = (row & 1) * Math.floor(brickW / 2);
  const lx = mod(ctx.x + offset, brickW);
  const ly = ctx.y % rowH;
  const mortar = ly === 0 || lx === 0;
  const brickId = row * 31 + Math.floor((ctx.x + offset) / brickW);
  let t;
  if (mortar) {
    const n = 0.24 + (hash2(ctx.x, ctx.y, ctx.seed + 11) - 0.5) * 0.11;
    const v = Math.round(clamp(n) * 255);
    return [v, Math.round(v * 0.96), Math.round(v * 0.88)];
  }
  t = 0.53 + (hash2(brickId, row, ctx.seed + 4) - 0.5) * 0.31;
  t += (fbm(ctx.u, ctx.v, brickW, rowH, ctx.seed + 30, 3) - 0.5) * 0.3;
  t += (hash2(ctx.x, ctx.y, ctx.seed + 81) - 0.5) * 0.09 * ctx.grain;
  if (ly === rowH - 1) t -= 0.07;
  if (lx === brickW - 1) t -= 0.05;
  return pick(ctx, ctx.palette, tune(ctx, t));
}

function renderDeepslate(ctx) {
  const layers = fbm(ctx.u, ctx.v, 2, 8, ctx.seed + 6, 3, 0.56);
  const detail = fbm(ctx.u, ctx.v, 5, 5, ctx.seed + 17, 3, 0.5);
  let t = 0.43 + (layers - 0.5) * 0.7 + (detail - 0.5) * 0.3;
  if (hash2(ctx.x, ctx.y, ctx.seed + 42) < 0.035) t += 0.15;
  return pick(ctx, ctx.palette, tune(ctx, t));
}

function renderGravel(ctx) {
  const cells = ctx.size <= 16 ? 5 : 7;
  const w = worley(ctx.u, ctx.v, cells, ctx.seed + 22);
  const shade = hash2(w.id, 3, ctx.seed);
  let t = 0.42 + shade * 0.35;
  t += (fbm(ctx.u, ctx.v, cells * 2, cells * 2, ctx.seed + 72, 2) - 0.5) * 0.25;
  if (w.edge < 0.055) t -= 0.22;
  t -= w.d1 * 0.09;
  return pick(ctx, ctx.palette, tune(ctx, t));
}

function renderObsidian(ctx) {
  const n = fbm(ctx.u, ctx.v, 3, 4, ctx.seed + 2, 4, 0.55);
  const fleck = hash2(ctx.x, ctx.y, ctx.seed + 41);
  let t = 0.31 + (n - 0.5) * 0.7;
  if (fleck > 0.955) t = 0.72;
  if (fleck < 0.05) t = 0.08;
  return pick(ctx, ctx.palette, tune(ctx, t));
}

/* Earth-family renderers */
function renderDirt(ctx) {
  const n = fbm(ctx.u, ctx.v, 4, 4, ctx.seed + 13, 4, 0.55);
  const coarse = fbm(ctx.u, ctx.v, 2, 2, ctx.seed + 90, 2);
  let t = 0.46 + (n - 0.5) * 0.65 + (coarse - 0.5) * 0.27;
  const pebble = hash2(ctx.x, ctx.y, ctx.seed + 7);
  if (pebble > 0.94) t += 0.16;
  else if (pebble < 0.055) t -= 0.18;
  return pick(ctx, ctx.palette, tune(ctx, t));
}

function grassTop(ctx, palette = ctx.palette, origin = 0) {
  const n = fbm(ctx.u, ctx.v, 4, 5, ctx.seed + 15 + origin, 4, 0.55);
  let t = 0.48 + (n - 0.5) * 0.5;
  const blade = hash2(ctx.x, ctx.y, ctx.seed + 25 + origin);
  if (blade > 0.89) t += 0.13 * ctx.clutter;
  else if (blade < 0.08) t -= 0.14 * ctx.clutter;
  return pick(ctx, palette, tune(ctx, t));
}

function renderGrassSide(ctx) {
  const size = ctx.size;
  const edgeBase = Math.max(2, Math.round(size * 0.23));
  const step = Math.max(1, Math.round(size / 16));
  const edge = edgeBase + Math.floor(hash2(ctx.x, 0, ctx.seed + 71) * edgeBase);
  const fringe = hash2(ctx.x, 1, ctx.seed + 33) > 0.8 ? step : 0;
  const greenZone = ctx.y < edge + fringe;
  if (greenZone) {
    const t = grassTop(ctx, ctx.greenPalette, 3);
    return t;
  }
  if (ctx.y < edge + fringe + step) {
    return pick(ctx, ctx.dirtPalette, tune(ctx, 0.43 + (hash2(ctx.x, ctx.y, ctx.seed + 9) - 0.5) * 0.16));
  }
  const n = fbm(ctx.u, ctx.v, 4, 4, ctx.seed + 14, 4, 0.55);
  let t = 0.44 + (n - 0.5) * 0.62;
  if (hash2(ctx.x, ctx.y, ctx.seed + 4) < 0.05 * ctx.clutter) t -= 0.18;
  return pick(ctx, ctx.dirtPalette, tune(ctx, t));
}

function renderSand(ctx) {
  const fine = hash2(ctx.x, ctx.y, ctx.seed + 92);
  const waves = Math.sin((ctx.u * 3 + ctx.v * 1.7) * TAU + ctx.seed) * 0.035;
  const n = fbm(ctx.u, ctx.v, 4, 4, ctx.seed + 18, 3);
  let t = 0.56 + (n - 0.5) * 0.28 + waves + (fine - 0.5) * 0.12 * ctx.grain;
  if (fine > 0.9) t += 0.08;
  if (fine < 0.06) t -= 0.09;
  return pick(ctx, ctx.palette, tune(ctx, t));
}

function renderSnow(ctx) {
  const n = fbm(ctx.u, ctx.v, 3, 3, ctx.seed + 21, 4);
  let t = 0.67 + (n - 0.5) * 0.2;
  const sparkle = hash2(ctx.x, ctx.y, ctx.seed + 5);
  if (sparkle > 0.94) t = 0.98;
  if (sparkle < 0.025) t -= 0.12;
  return pick(ctx, ctx.palette, tune(ctx, t));
}

function renderIce(ctx) {
  const w = worley(ctx.u, ctx.v, 2, ctx.seed + 51);
  const n = fbm(ctx.u, ctx.v, 3, 4, ctx.seed + 14, 4);
  let t = 0.5 + (n - 0.5) * 0.42;
  if (w.edge < 0.035) t -= 0.22;
  if (hash2(ctx.x, ctx.y, ctx.seed + 81) > 0.965) t += 0.2;
  return pick(ctx, ctx.palette, tune(ctx, t));
}

function renderMoss(ctx) {
  const n = fbm(ctx.u, ctx.v, 5, 5, ctx.seed + 12, 4, 0.58);
  let t = 0.47 + (n - 0.5) * 0.6;
  const clump = hash2(ctx.x, ctx.y, ctx.seed + 32);
  if (clump > 0.9) t += 0.1;
  return pick(ctx, ctx.palette, tune(ctx, t));
}

/* Wood-family renderers */
function renderPlanks(ctx) {
  const size = ctx.size;
  const boardH = Math.max(3, Math.round(size / 4));
  const row = Math.floor(ctx.y / boardH);
  const ly = ctx.y % boardH;
  const boardTone = hash2(row, 3, ctx.seed + 18) - 0.5;
  const grain = fbm(ctx.u, ctx.v, 1, 9, ctx.seed + 8, 4, 0.6);
  const knot = hash2(Math.floor(ctx.x / Math.max(2, size / 8)), row, ctx.seed + 71);
  const joint = Math.floor(hash2(row, 11, ctx.seed + 33) * size);
  let t = 0.5 + boardTone * 0.24 + (grain - 0.5) * 0.62;
  t += (hash2(ctx.x, ctx.y, ctx.seed + 4) - 0.5) * 0.08 * ctx.grain;
  if (ly === 0) {
    const seam = ctx.palette[0];
    return shiftRgb(seam, -10);
  }
  if (ctx.x === joint && ly > 0) {
    const seam = ctx.palette[0];
    return shiftRgb(seam, -7);
  }
  if (ly === 1) t += 0.075;
  if (ly === boardH - 1) t -= 0.08;
  if (knot > 0.94 && ly > 0 && ly < boardH - 1) t -= 0.2;
  return pick(ctx, ctx.palette, tune(ctx, t));
}

function renderLogSide(ctx) {
  const grooves = 1 - Math.abs(fbm(ctx.u, ctx.v, 7, 2, ctx.seed + 2, 4, 0.58) * 2 - 1);
  const fine = fbm(ctx.u, ctx.v, 4, 8, ctx.seed + 44, 3);
  let t = 0.5 - grooves * 0.35 + (fine - 0.5) * 0.3;
  t += (hash2(ctx.x, ctx.y, ctx.seed + 3) - 0.5) * 0.1 * ctx.grain;
  if (hash2(ctx.x, 0, ctx.seed + 12) > 0.84) t -= 0.16;
  return pick(ctx, ctx.palette, tune(ctx, t));
}

function renderLogTop(ctx) {
  const size = ctx.size;
  const dx = (ctx.x + 0.5) / size - 0.5;
  const dy = (ctx.y + 0.5) / size - 0.5;
  const dist = Math.sqrt(dx * dx + dy * dy) * 2;
  const angle = Math.atan2(dy, dx) / TAU + 0.5;
  const wobble = fbm(ctx.u, ctx.v, 3, 3, ctx.seed + 5, 2) * 0.14;
  const rings = Math.sin((dist * 4.4 + wobble) * TAU) * 0.5 + 0.5;
  let t = 0.46 + rings * 0.23 - dist * 0.25;
  const border = Math.max(Math.abs(dx), Math.abs(dy));
  if (border > 0.39) t = 0.25 + rings * 0.06;
  if (dist < 0.08) t = 0.3;
  const crack = hash2(Math.floor(angle * 12), Math.floor(dist * 8), ctx.seed + 90) > 0.93 && dist > 0.12 && dist < 0.38;
  if (crack) t -= 0.19;
  return pick(ctx, ctx.palette, tune(ctx, t));
}

function renderLeaves(ctx) {
  const clump = fbm(ctx.u, ctx.v, 5, 5, ctx.seed + 9, 4, 0.55);
  const dark = fbm(ctx.u, ctx.v, 3, 3, ctx.seed + 51, 3);
  let t = 0.53 + (clump - 0.5) * 0.75 + (dark - 0.5) * 0.3;
  const cut = hash2(ctx.x, ctx.y, ctx.seed + 33);
  if (cut < 0.07 * ctx.clutter) t -= 0.3;
  if (cut > 0.95) t += 0.12;
  return pick(ctx, ctx.palette, tune(ctx, t));
}

/* Other-family renderers */
function renderNetherrack(ctx) {
  const strands = fbm(ctx.u, ctx.v, 6, 3, ctx.seed + 4, 4, 0.6);
  const n = fbm(ctx.u, ctx.v, 3, 3, ctx.seed + 21, 3);
  let t = 0.42 + (n - 0.5) * 0.45 + (strands - 0.5) * 0.55;
  if (hash2(ctx.x, ctx.y, ctx.seed + 66) > 0.93) t += 0.2;
  return pick(ctx, ctx.palette, tune(ctx, t));
}

function renderEndStone(ctx) {
  const w = worley(ctx.u, ctx.v, 4, ctx.seed + 77);
  const n = fbm(ctx.u, ctx.v, 3, 3, ctx.seed + 8, 3);
  let t = 0.58 + (n - 0.5) * 0.3 - w.d1 * 0.12;
  if (w.edge < 0.045) t -= 0.13;
  if (hash2(ctx.x, ctx.y, ctx.seed + 20) < 0.035) t += 0.15;
  return pick(ctx, ctx.palette, tune(ctx, t));
}

function renderPrismarine(ctx) {
  const tile = 4;
  const gx = Math.floor(ctx.x / tile);
  const gy = Math.floor(ctx.y / tile);
  const lx = ctx.x % tile;
  const ly = ctx.y % tile;
  const tone = hash2(gx, gy, ctx.seed + 31) - 0.5;
  const n = fbm(ctx.u, ctx.v, 4, 4, ctx.seed + 9, 3);
  let t = 0.5 + tone * 0.18 + (n - 0.5) * 0.35;
  if (lx === 0 || ly === 0) t -= 0.15;
  if (ly === 1) t += 0.07;
  return pick(ctx, ctx.palette, tune(ctx, t));
}

function renderTerracotta(ctx) {
  const n = fbm(ctx.u, ctx.v, 4, 4, ctx.seed + 6, 4);
  const fine = fbm(ctx.u, ctx.v, 2, 9, ctx.seed + 19, 2);
  let t = 0.52 + (n - 0.5) * 0.34 + (fine - 0.5) * 0.12;
  if (hash2(ctx.x, ctx.y, ctx.seed + 5) < 0.04) t -= 0.1;
  return pick(ctx, ctx.palette, tune(ctx, t));
}

function renderWool(ctx) {
  const weaveX = (ctx.x + Math.floor(ctx.y / 2)) % 2 === 0 ? 0.035 : -0.035;
  const weaveY = (ctx.y + Math.floor(ctx.x / 2)) % 2 === 0 ? 0.025 : -0.025;
  const n = fbm(ctx.u, ctx.v, 3, 4, ctx.seed + 11, 4);
  let t = 0.58 + (n - 0.5) * 0.2 + weaveX + weaveY;
  return pick(ctx, ctx.palette, tune(ctx, t));
}

/* Ore overlays */
const ORE_STYLE = {
  gold: { count: 4, radius: 0.108, shape: 'nugget', rim: true },
  diamond: { count: 4, radius: 0.105, shape: 'diamond', rim: true },
  redstone: { count: 7, radius: 0.058, shape: 'speck', rim: false },
  emerald: { count: 4, radius: 0.095, shape: 'shard', rim: true },
  copper: { count: 5, radius: 0.085, shape: 'nugget', rim: true },
  lapis: { count: 5, radius: 0.08, shape: 'cluster', rim: true },
};

function paintOre(buf, ctx, accent) {
  const size = ctx.size;
  const style = ORE_STYLE[ctx.material.ore] || ORE_STYLE.gold;
  const random = mulberry32(ctx.seed + 800);
  const blobs = [];
  for (let i = 0; i < style.count; i++) {
    const cx = Math.floor(random() * size);
    const cy = Math.floor(random() * size);
    const r = Math.max(1, Math.round(size * style.radius * (0.7 + random() * 0.6)));
    blobs.push({ cx, cy, r, seed: Math.floor(random() * 1e6) });
  }
  for (const blob of blobs) {
    const { cx, cy, r } = blob;
    for (let oy = -r; oy <= r; oy++) {
      for (let ox = -r; ox <= r; ox++) {
        const ax = Math.abs(ox);
        const ay = Math.abs(oy);
        let inside = false;
        if (style.shape === 'diamond') inside = ax + ay <= r + 0.4;
        else if (style.shape === 'shard') inside = ax + ay * 0.6 <= r + 0.6;
        else if (style.shape === 'speck') inside = ax <= 1 && ay <= 1 && ax + ay <= 1;
        else inside = ax * ax + ay * ay <= r * r + 0.4;
        if (!inside) continue;
        const x = mod(cx + ox, size);
        const y = mod(cy + oy, size);
        const edge = ax + ay >= r - 0.4 || Math.abs(ax - ay) >= r - 0.4;
        let color = edge ? accent[0] : accent[Math.min(accent.length - 1, 2 + ((ox + oy + 8) % 3))];
        if (ox <= -1 && oy <= -1) color = accent[accent.length - 1];
        put(buf, size, x, y, color);
      }
    }
    if (style.rim && r > 2) {
      const glintX = mod(cx - 1, size);
      const glintY = mod(cy - 1, size);
      put(buf, size, glintX, glintY, [255, 255, 244]);
    }
  }
}

/* Modifier overlays */
function drawCracks(buf, ctx, intensity = 1) {
  const size = ctx.size;
  const cells = size <= 16 ? 3 : 4;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = (x + 0.5) / size;
      const v = (y + 0.5) / size;
      const w = worley(u, v, cells, ctx.seed + 313);
      if (w.edge < 0.018 * intensity) {
        const p = getPx(buf, size, x, y);
        put(buf, size, x, y, shiftRgb(p, -46 * intensity));
      }
    }
  }
}

function mossOverlay(buf, ctx, intensity = 1, greenPalette, darkPalette) {
  const size = ctx.size;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = (x + 0.5) / size;
      const v = (y + 0.5) / size;
      const n = fbm(u, v, 4, 4, ctx.seed + 777, 4, 0.56);
      const sideBias = ctx.face === 'side' && y < size * 0.42 ? 0.06 : 0;
      if (n > 0.62 - intensity * 0.03 - sideBias) {
        const fine = hash2(x, y, ctx.seed + 41);
        const idx = clamp(Math.floor((n - 0.5) * 7 + fine * 0.8), 1, greenPalette.length - 1);
        const base = getPx(buf, size, x, y);
        const moss = greenPalette[idx];
        const alpha = 0.56 + fine * 0.34;
        put(buf, size, x, y, mixRgb(base, moss, alpha));
        if (fine < 0.13) {
          const yy = mod(y + 1, size);
          put(buf, size, x, yy, mixRgb(getPx(buf, size, x, yy), darkPalette[1], 0.35));
        }
      }
    }
  }
}

function fleckOverlay(buf, ctx, accent) {
  const size = ctx.size;
  const random = mulberry32(ctx.seed + 909);
  const count = Math.max(5, Math.round(size * 0.68));
  for (let i = 0; i < count; i++) {
    const x = Math.floor(random() * size);
    const y = Math.floor(random() * size);
    const color = accent[3 + Math.floor(random() * 3)];
    const base = getPx(buf, size, x, y);
    put(buf, size, x, y, mixRgb(base, color, 0.72));
    if (random() > 0.58) {
      const x2 = mod(x + (random() > 0.5 ? 1 : -1), size);
      const base2 = getPx(buf, size, x2, y);
      put(buf, size, x2, y, mixRgb(base2, color, 0.56));
    }
    if (random() > 0.8) {
      const y2 = mod(y + 1, size);
      const base3 = getPx(buf, size, x, y2);
      put(buf, size, x, y2, mixRgb(base3, accent[2], 0.4));
    }
  }
}

function glowOverlay(buf, ctx, accent) {
  const size = ctx.size;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const h = hash2(x, y, ctx.seed + 515);
      if (h > 0.965) {
        const base = getPx(buf, size, x, y);
        put(buf, size, x, y, mixRgb(base, accent[accent.length - 1], 0.82));
        if (h > 0.988) {
          put(buf, size, x, mod(y + 1, size), mixRgb(getPx(buf, size, x, mod(y + 1, size)), accent[2], 0.28));
        }
      }
    }
  }
}

function frostOverlay(buf, ctx) {
  const size = ctx.size;
  const frost = [208, 236, 242];
  const bright = [245, 253, 255];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const n = fbm((x + 0.5) / size, (y + 0.5) / size, 3, 4, ctx.seed + 606, 3);
      const h = hash2(x, y, ctx.seed + 87);
      if (n > 0.57) {
        const base = getPx(buf, size, x, y);
        put(buf, size, x, y, mixRgb(base, frost, 0.22 + (n - 0.57) * 0.9));
      }
      if (h > 0.976) put(buf, size, x, y, bright);
    }
  }
}

function ancientOverlay(buf, ctx) {
  const size = ctx.size;
  const patina = [95, 116, 83];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const base = getPx(buf, size, x, y);
      const l = (base[0] + base[1] + base[2]) / 3;
      const n = fbm((x + 0.5) / size, (y + 0.5) / size, 3, 3, ctx.seed + 404, 3);
      let next = mixRgb(base, [l, l, l], 0.2);
      if (n > 0.6) next = mixRgb(next, patina, 0.14);
      if (hash2(x, y, ctx.seed + 44) < 0.03) next = shiftRgb(next, -35);
      put(buf, size, x, y, next);
    }
  }
}

function burnedOverlay(buf, ctx) {
  const size = ctx.size;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const n = fbm((x + 0.5) / size, (y + 0.5) / size, 3, 4, ctx.seed + 121, 4);
      if (n > 0.53) {
        const base = getPx(buf, size, x, y);
        const amount = 0.2 + (n - 0.53) * 0.9;
        put(buf, size, x, y, mixRgb(base, [31, 27, 24], amount));
      }
      if (hash2(x, y, ctx.seed + 9) > 0.982) {
        put(buf, size, x, y, [223, 113, 50]);
      }
    }
  }
}

function gildedOverlay(buf, ctx, gold) {
  const size = ctx.size;
  const random = mulberry32(ctx.seed + 2024);
  const flecks = Math.max(4, Math.round(size * 0.45));
  for (let i = 0; i < flecks; i++) {
    const x = Math.floor(random() * size);
    const y = Math.floor(random() * size);
    const color = gold[Math.floor(random() * (gold.length - 2)) + 2];
    put(buf, size, x, y, color);
    if (random() > 0.5) put(buf, size, mod(x + 1, size), y, gold[gold.length - 1]);
    if (random() > 0.6) put(buf, size, x, mod(y + 1, size), gold[2]);
  }
}

function crystalOverlay(buf, ctx, accent) {
  const size = ctx.size;
  const random = mulberry32(ctx.seed + 6060);
  const count = Math.max(3, Math.round(size * 0.18));
  for (let i = 0; i < count; i++) {
    const cx = Math.floor(random() * size);
    const cy = Math.floor(random() * size);
    const r = ctx.size <= 16 ? 1 : 2;
    for (let oy = -r; oy <= r; oy++) {
      for (let ox = -r; ox <= r; ox++) {
        if (Math.abs(ox) + Math.abs(oy) > r + 0.5) continue;
        const x = mod(cx + ox, size);
        const y = mod(cy + oy, size);
        const isCore = ox === 0 && oy === 0;
        const color = isCore ? [240, 255, 251] : ox + oy < 0 ? accent[accent.length - 1] : accent[Math.max(1, accent.length - 3)];
        const base = getPx(buf, size, x, y);
        put(buf, size, x, y, mixRgb(base, color, isCore ? 0.9 : 0.76));
      }
    }
  }
}

function wetOverlay(buf, ctx) {
  const size = ctx.size;
  for (let y = 0; y < size; y++) {
    const depth = y / Math.max(1, size - 1);
    for (let x = 0; x < size; x++) {
      let base = getPx(buf, size, x, y);
      if (depth > 0.55 && hash2(x, y, ctx.seed + 70) > 0.5) {
        base = shiftRgb(base, -8 - depth * 12);
      }
      if (hash2(x, y, ctx.seed + 81) > 0.986) base = mixRgb(base, [220, 245, 239], 0.4);
      put(buf, size, x, y, base);
    }
  }
}

function flowerOverlay(buf, ctx) {
  const size = ctx.size;
  if (ctx.face === 'bottom') return;
  const random = mulberry32(ctx.seed + 505);
  const count = Math.max(2, Math.round(size / 8));
  const petals = [[242, 241, 218], [238, 213, 91], [220, 105, 128], [157, 194, 233]];
  for (let i = 0; i < count; i++) {
    const x = Math.floor(random() * size);
    const y = Math.floor(random() * (size * 0.55));
    const color = petals[Math.floor(random() * petals.length)];
    put(buf, size, x, y, color);
    if (random() > 0.45) put(buf, size, mod(x + 1, size), y, shiftRgb(color, -22));
    put(buf, size, x, mod(y + 1, size), [78, 127, 54]);
  }
}

/* Main generator */
export function renderTexture(params = {}) {
  const material = getMaterial(params.materialId);
  const size = params.size || 16;
  const seed = Number(params.seed) || 1;
  const finish = FINISH_CONFIG[params.finish] || FINISH_CONFIG.balanced;
  const face = params.face || 'side';
  const mods = new Set(params.modifiers || []);
  const promptColor = params.promptColor || null;
  const accentHex = params.accent || material.accent || '#b8e264';

  const hueTarget = promptColor ? promptColor.hue : null;
  const satTarget = promptColor ? Math.max(promptColor.sat, 0.24) : null;
  const lightShift = promptColor ? promptColor.light : 0;

  const palette = buildPalette(material.base, {
    hue: params.hue || 0,
    hueTarget,
    satTarget,
    light: lightShift,
    count: size <= 16 ? 8 : size <= 32 ? 10 : 12,
    spread: 0.4,
  });

  const accent = buildPalette(accentHex, {
    hue: params.accentHue || 0,
    count: 6,
    spread: 0.46,
    satBoost: 0.06,
  });

  const overlayBase = params.overlayAccent || (mods.has('gilded')
    ? '#e9c253'
    : mods.has('crystal')
      ? '#5ee8df'
      : mods.has('glowing')
        ? '#b9ee6a'
        : mods.has('flecked')
          ? '#e5bf58'
          : material.accent || '#b8e264');
  const overlayAccent = buildPalette(overlayBase, {
    hue: params.overlayAccentHue || params.accentHue || 0,
    count: 6,
    spread: 0.48,
    satBoost: 0.07,
  });

  const greenPalette = buildPalette(face === 'top' && material.type === 'grass' ? material.base : NATURAL_GREEN, {
    hue: params.hue || 0,
    count: 8,
    spread: 0.43,
    satBoost: 0.08,
  });
  const darkPalette = buildPalette(NATURAL_DARK, { hue: params.hue || 0, count: 5, spread: 0.34 });
  const dirtBase = material.dirt || '#79573d';
  const dirtPalette = buildPalette(dirtBase, {
    hue: params.hue || 0,
    hueTarget: promptColor ? promptColor.hue : null,
    satTarget: promptColor ? Math.max(promptColor.sat, 0.2) : null,
    count: 8,
    spread: 0.38,
  });

  const ctx = {
    size,
    seed,
    face,
    material,
    palette,
    accent,
    greenPalette,
    dirtPalette,
    depth: (0.55 + (params.contrast ?? 55) / 100 * 1.05) * finish.depth,
    grain: ((params.grain ?? 55) / 100) * finish.grain,
    dither: finish.dither,
    clutter: finish.clutter,
    x: 0,
    y: 0,
    u: 0,
    v: 0,
  };

  const buf = new Uint8ClampedArray(size * size * 4);
  let mode = material.type;
  if (material.type === 'grass') mode = face === 'top' ? 'grassTop' : face === 'bottom' ? 'dirt' : 'grassSide';
  if (material.type === 'log') mode = face === 'side' ? 'logSide' : 'logTop';

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      ctx.x = x;
      ctx.y = y;
      ctx.u = (x + 0.5) / size;
      ctx.v = (y + 0.5) / size;
      let rgb;
      switch (mode) {
        case 'stone': rgb = renderStone(ctx); break;
        case 'cobble': rgb = renderCobble(ctx); break;
        case 'bricks': rgb = renderBricks(ctx); break;
        case 'deepslate': rgb = renderDeepslate(ctx); break;
        case 'gravel': rgb = renderGravel(ctx); break;
        case 'obsidian': rgb = renderObsidian(ctx); break;
        case 'dirt': rgb = renderDirt(ctx); break;
        case 'grassTop': rgb = grassTop(ctx); break;
        case 'grassSide': rgb = renderGrassSide(ctx); break;
        case 'sand': rgb = renderSand(ctx); break;
        case 'snow': rgb = renderSnow(ctx); break;
        case 'ice': rgb = renderIce(ctx); break;
        case 'moss': rgb = renderMoss(ctx); break;
        case 'planks': rgb = renderPlanks(ctx); break;
        case 'logSide': rgb = renderLogSide(ctx); break;
        case 'logTop': rgb = renderLogTop(ctx); break;
        case 'leaves': rgb = renderLeaves(ctx); break;
        case 'netherrack': rgb = renderNetherrack(ctx); break;
        case 'endstone': rgb = renderEndStone(ctx); break;
        case 'prismarine': rgb = renderPrismarine(ctx); break;
        case 'terracotta': rgb = renderTerracotta(ctx); break;
        case 'wool': rgb = renderWool(ctx); break;
        case 'ore': {
          rgb = renderStone(ctx);
          break;
        }
        default: rgb = renderStone(ctx);
      }
      put(buf, size, x, y, rgb);
    }
  }

  if (mode === 'ore') paintOre(buf, ctx, accent);

  if (mods.has('mossy')) mossOverlay(buf, ctx, 1, greenPalette, darkPalette);
  if (mods.has('cracked')) drawCracks(buf, ctx, 1);
  if (mods.has('glowing')) glowOverlay(buf, ctx, overlayAccent);
  if (mods.has('frosted')) frostOverlay(buf, ctx);
  if (mods.has('ancient')) ancientOverlay(buf, ctx);
  if (mods.has('burned')) burnedOverlay(buf, ctx);
  if (mods.has('gilded')) gildedOverlay(buf, ctx, overlayAccent);
  if (mods.has('flecked')) fleckOverlay(buf, ctx, overlayAccent);
  if (mods.has('crystal')) crystalOverlay(buf, ctx, overlayAccent);
  if (mods.has('wet')) wetOverlay(buf, ctx);
  if (mods.has('flowery')) flowerOverlay(buf, ctx);

  const canvas = createCanvas(size);
  const context = canvas.getContext('2d');
  const imageData = context.createImageData(size, size);
  imageData.data.set(buf);
  context.putImageData(imageData, 0, 0);

  const colorSet = [...new Set(palette.slice(1, 7).map((rgb) => rgb.join(',')))]
    .map((s) => s.split(',').map(Number));

  return {
    canvas,
    size,
    face,
    material,
    palette,
    swatches: colorSet.map((rgb) => `#${rgb.map((v) => v.toString(16).padStart(2, '0')).join('')}`),
    accentSwatches: accent.slice(2, 5).map((rgb) => `#${rgb.map((v) => v.toString(16).padStart(2, '0')).join('')}`),
    overlayAccentSwatches: overlayAccent.slice(2, 5).map((rgb) => `#${rgb.map((v) => v.toString(16).padStart(2, '0')).join('')}`),
    modifiers: [...mods],
  };
}

export function renderTextureSet(params) {
  const side = renderTexture({ ...params, face: 'side' });
  const top = renderTexture({ ...params, face: 'top' });
  const bottom = renderTexture({ ...params, face: 'bottom' });
  return {
    side,
    top,
    bottom,
    material: side.material,
    palette: side.swatches,
    accentSwatches: side.accentSwatches,
    overlayAccentSwatches: side.overlayAccentSwatches,
    size: side.size,
  };
}

/* Name helpers */
const MODIFIER_LABELS = Object.fromEntries(MODIFIER_WORDS.map((m) => [m.id, m.label]));
const NAME_ORDER = ['ancient', 'burned', 'cracked', 'frosted', 'gilded', 'mossy', 'glowing', 'flecked', 'wet', 'flowery'];

export function textureTitle(materialId, modifiers = []) {
  const material = getMaterial(materialId);
  const pre = NAME_ORDER.filter((m) => modifiers.includes(m))
    .slice(0, 2)
    .map((m) => MODIFIER_LABELS[m]);
  return [...pre, material.name].join(' ');
}

export function modifierLabel(id) {
  return MODIFIER_LABELS[id] || id;
}

/* Isometric cube renderer for variation thumbnails and share previews. */
export function drawIsoCube(canvas, textures, options = {}) {
  const {
    background = null,
    shadow = true,
    pad = 0.08,
  } = options;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  if (background) {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, w, h);
  }
  const half = Math.min(w * 0.44, h * 0.4) * (1 - pad * 1.3);
  const topH = half * 0.52;
  const depth = half * 0.98;
  const cx = w / 2;
  const cy = (h - depth) / 2 + half * 0.03;
  const A = { x: cx, y: cy - topH };
  const B = { x: cx + half, y: cy };
  const C = { x: cx, y: cy + topH };
  const D = { x: cx - half, y: cy };
  const extend = (p) => ({ x: p.x, y: p.y + depth });

  ctx.imageSmoothingEnabled = false;

  if (shadow) {
    ctx.save();
    ctx.filter = 'blur(5px)';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.beginPath();
    ctx.ellipse(cx, C.y + depth + topH * 0.32, half * 0.82, topH * 0.38, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  function face(tex, origin, u, v, light, outline = true) {
    if (!tex) return;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(origin.x + u.x, origin.y + u.y);
    ctx.lineTo(origin.x + u.x + v.x, origin.y + u.y + v.y);
    ctx.lineTo(origin.x + v.x, origin.y + v.y);
    ctx.closePath();
    ctx.clip();
    const tw = tex.width;
    const th = tex.height;
    ctx.setTransform(u.x / tw, u.y / tw, v.x / th, v.y / th, origin.x, origin.y);
    ctx.drawImage(tex, 0, 0);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (light > 0) {
      ctx.fillStyle = `rgba(255, 244, 214, ${light})`;
      ctx.fill();
    } else if (light < 0) {
      ctx.fillStyle = `rgba(4, 7, 4, ${-light})`;
      ctx.fill();
    }
    if (outline) {
      ctx.strokeStyle = 'rgba(8, 10, 7, 0.32)';
      ctx.lineWidth = 1;
      ctx.strokeRect(0, 0, tw, th);
    }
    ctx.restore();
    ctx.strokeStyle = 'rgba(255,255,255,0.055)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(origin.x + u.x, origin.y + u.y);
    ctx.lineTo(origin.x + u.x + v.x, origin.y + u.y + v.y);
    ctx.lineTo(origin.x + v.x, origin.y + v.y);
    ctx.closePath();
    ctx.stroke();
  }

  const Cd = extend(C);
  const Dd = extend(D);
  const Bd = extend(B);

  // left face
  face(textures.side, D, { x: C.x - D.x, y: C.y - D.y }, { x: 0, y: depth }, -0.26);
  // right face
  face(textures.side, C, { x: B.x - C.x, y: B.y - C.y }, { x: 0, y: depth }, -0.12);
  // top face
  face(textures.top, A, { x: B.x - A.x, y: B.y - A.y }, { x: D.x - A.x, y: D.y - A.y }, 0.1);

  // crisp silhouette + contact shadow
  ctx.strokeStyle = 'rgba(5, 6, 4, 0.5)';
  ctx.lineWidth = Math.max(1, Math.min(w, h) / 160);
  ctx.beginPath();
  ctx.moveTo(A.x, A.y);
  ctx.lineTo(B.x, B.y);
  ctx.lineTo(Bd.x, Bd.y);
  ctx.lineTo(Cd.x, Cd.y);
  ctx.lineTo(Dd.x, Dd.y);
  ctx.lineTo(D.x, D.y);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(C.x, C.y);
  ctx.lineTo(Cd.x, Cd.y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(D.x, D.y);
  ctx.lineTo(C.x, C.y);
  ctx.lineTo(B.x, B.y);
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.stroke();
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
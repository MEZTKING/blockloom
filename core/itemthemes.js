/* Component-based item motif families. Hard-edged 16×16 pixel art, no DOM/network/randomness. */
export const ITEM_THEME_ENGINE_VERSION = '1.0.0';

export const ITEM_THEMES = [
  {
    id: 'royal_sword', name: 'Royal Sword',
    palette: { steel: ['#2b3140', '#8e97a8', '#eef3fb'], gold: ['#462601', '#c48609', '#fde045'], grip: ['#1d1826', '#4a3a52', '#8b7a93'], sapphire: ['#0a2f5e', '#1f7ad8', '#c6ecff'], outline: '#05070f' },
    motifs: [
      ['kingsword', 'Kingsword', { blade: 'straight', guard: 'cross', grip: 3, pommel: 'round', gem: 'sapphire', inlay: 'edge' }],
      ['throneblade', 'Throneblade', { blade: 'straight', guard: 'crown', grip: 3, pommel: 'crown', gem: 'sapphire', inlay: 'fuller' }],
      ['crownblade', 'Crownblade', { blade: 'taper', guard: 'crown', grip: 2, pommel: 'pointed', gem: 'gold', inlay: 'edge' }],
      ['dawnblade', 'Dawnblade', { blade: 'taper', guard: 'winged', grip: 3, pommel: 'round', gem: 'gold', inlay: 'rays' }],
      ['regent', 'Gilded Regent', { blade: 'straight', guard: 'wide', grip: 4, pommel: 'round', gem: 'sapphire', inlay: 'band' }],
      ['courtblade', 'Azure Courtblade', { blade: 'straight', guard: 'curved', grip: 3, pommel: 'round', gem: 'sapphire', inlay: 'fuller' }],
      ['herald', 'Sapphire Herald', { blade: 'leaf', guard: 'winged', grip: 2, pommel: 'pointed', gem: 'sapphire', inlay: 'edge' }],
      ['fleurblade', 'Sapphire Fleurblade', { blade: 'leaf', guard: 'fleur', grip: 3, pommel: 'round', gem: 'sapphire', inlay: 'band' }],
      ['lionheart', 'Cobalt Lionheart', { blade: 'straight', guard: 'cross', grip: 4, pommel: 'round', gem: 'gold', inlay: 'fuller' }],
      ['goldedge', 'Imperial Goldedge', { blade: 'taper', guard: 'cross', grip: 3, pommel: 'round', gem: 'gold', inlay: 'edge' }],
      ['sovereign', 'Azure Sovereign', { blade: 'leaf', guard: 'crown', grip: 4, pommel: 'crown', gem: 'sapphire', inlay: 'rays' }],
      ['noblesword', 'Cerulean Noblesword', { blade: 'straight', guard: 'fleur', grip: 2, pommel: 'pointed', gem: 'sapphire', inlay: 'band' }],
      ['crestblade', 'Sapphire Crestblade', { blade: 'taper', guard: 'winged', grip: 2, pommel: 'round', gem: 'gold', inlay: 'fuller' }],
      ['dawnregent', 'Royal Dawnregent', { blade: 'leaf', guard: 'wide', grip: 3, pommel: 'crown', gem: 'gold', inlay: 'rays' }],
      ['gildedsapphire', 'Gilded Sapphire', { blade: 'straight', guard: 'cross', grip: 3, pommel: 'pointed', gem: 'sapphire', inlay: 'band' }],
      ['royalblade', 'Crowned Royalblade', { blade: 'taper', guard: 'crown', grip: 3, pommel: 'round', gem: 'sapphire', inlay: 'fuller' }],
    ],
  },
  {
    id: 'runic_pickaxe', name: 'Runic Pickaxe',
    palette: { steel: ['#242a2e', '#8b949c', '#e2eaf1'], jade: ['#0f3b1f', '#43945c', '#b4f3bd'], silver: ['#333941', '#a9b2bd', '#f4f8fc'], haft: ['#261a10', '#6a4d31', '#a8865f'], rune: ['#12503a', '#4fd98a', '#e2fff0'], outline: '#070d09' },
    motifs: [
      ['emerald_rune', 'Emerald Rune', { head: 'wide', curve: 0, binding: 'wrap', rune: 'chevron', haft: 'straight', gem: 'emerald' }],
      ['silverbound_relic', 'Silverbound Relic', { head: 'wide', curve: 1, binding: 'band', rune: 'spiral', haft: 'straight', gem: 'silver' }],
      ['verdant_elder', 'Verdant Elder', { head: 'crest', curve: 1, binding: 'wrap', rune: 'dots', haft: 'bent', gem: 'jade' }],
      ['runestone_miner', 'Runestone Miner', { head: 'flat', curve: 0, binding: 'clasp', rune: 'runes', haft: 'straight', gem: 'stone' }],
      ['jade_glyph', 'Jade Glyph', { head: 'crest', curve: 0, binding: 'wrap', rune: 'glyph', haft: 'straight', gem: 'jade' }],
      ['ancient_vein', 'Ancient Vein', { head: 'narrow', curve: 1, binding: 'clasp', rune: 'vein', haft: 'bent', gem: 'stone' }],
      ['moonlit_rune', 'Moonlit Rune', { head: 'wide', curve: 1, binding: 'band', rune: 'crescent', haft: 'straight', gem: 'silver' }],
      ['obsidian_script', 'Obsidian Script', { head: 'flat', curve: 0, binding: 'clasp', rune: 'runes', haft: 'straight', gem: 'obsidian' }],
      ['emerald_temple', 'Emerald Temple', { head: 'crest', curve: 1, binding: 'band', rune: 'chevron', haft: 'straight', gem: 'emerald' }],
      ['silver_sigil', 'Silver Sigil', { head: 'narrow', curve: 0, binding: 'wrap', rune: 'sigil', haft: 'bent', gem: 'silver' }],
      ['warden_rune', 'Warden Rune', { head: 'wide', curve: 0, binding: 'wrap', rune: 'eye', haft: 'straight', gem: 'emerald' }],
      ['verdant_arc', 'Verdant Arc', { head: 'crest', curve: 2, binding: 'clasp', rune: 'arc', haft: 'straight', gem: 'jade' }],
      ['relic_carver', 'Relic Carver', { head: 'flat', curve: 1, binding: 'band', rune: 'sigil', haft: 'bent', gem: 'stone' }],
      ['runic_crown', 'Runic Crown', { head: 'crest', curve: 0, binding: 'clasp', rune: 'crown', haft: 'straight', gem: 'gold' }],
      ['elder_gem', 'Elder Gem', { head: 'wide', curve: 1, binding: 'wrap', rune: 'dots', haft: 'straight', gem: 'emerald' }],
      ['forgotten_glyph', 'Forgotten Glyph', { head: 'narrow', curve: 2, binding: 'clasp', rune: 'glyph', haft: 'bent', gem: 'obsidian' }],
    ],
  },
  {
    id: 'jade_axe', name: 'Jade Axe',
    palette: { jade: ['#0f3b1f', '#43945c', '#b4f3bd'], bronze: ['#3a2a10', '#956d2c', '#f0cb7a'], haft: ['#241a11', '#5f4632', '#a0805c'], amber: ['#4a2c06', '#e3a83f', '#ffeaa8'], outline: '#080d09' },
    motifs: [
      ['jade_sun', 'Jade Sun Axe', { head: 'crescent', lobe: 0, binding: 'band', inset: 'sun', haft: 'straight', gem: 'amber' }],
      ['bronze_bound', 'Bronze Bound Jade', { head: 'wedge', lobe: 0, binding: 'wrap', inset: 'dots', haft: 'straight', gem: 'bronze' }],
      ['emerald_ritual', 'Emerald Ritual Axe', { head: 'labrys', lobe: 1, binding: 'clasp', inset: 'ring', haft: 'straight', gem: 'emerald' }],
      ['moss_crescent', 'Moss Crescent Axe', { head: 'crescent', lobe: 1, binding: 'wrap', inset: 'moss', haft: 'bent', gem: 'moss' }],
      ['temple_hatchet', 'Temple Jade Hatchet', { head: 'wedge', lobe: 0, binding: 'clasp', inset: 'line', haft: 'straight', gem: 'amber' }],
      ['serpent_bind', 'Serpent Bind Axe', { head: 'crescent', lobe: 0, binding: 'serpent', inset: 'eye', haft: 'straight', gem: 'amber' }],
      ['carved_labrys', 'Carved Jade Labrys', { head: 'labrys', lobe: 0, binding: 'band', inset: 'carve', haft: 'straight', gem: 'bronze' }],
      ['royal_jade', 'Royal Jade Axe', { head: 'wedge', lobe: 1, binding: 'band', inset: 'crown', haft: 'straight', gem: 'gold' }],
      ['spiral_bronze', 'Spiral Bronze Axe', { head: 'crescent', lobe: 1, binding: 'serpent', inset: 'spiral', haft: 'straight', gem: 'bronze' }],
      ['lotus_jade', 'Lotus Jade Axe', { head: 'labrys', lobe: 1, binding: 'wrap', inset: 'lotus', haft: 'straight', gem: 'amber' }],
      ['obsidian_edge', 'Obsidian Edged Jade', { head: 'wedge', lobe: 0, binding: 'clasp', inset: 'diamond', haft: 'straight', gem: 'obsidian' }],
      ['feathered_jade', 'Feathered Jade Axe', { head: 'crescent', lobe: 0, binding: 'wrap', inset: 'feather', haft: 'bent', gem: 'amber' }],
      ['twin_curve', 'Twin Curve Ceremony', { head: 'labrys', lobe: 0, binding: 'band', inset: 'twin', haft: 'straight', gem: 'bronze' }],
      ['runed_jade', 'Runed Jade Axe', { head: 'wedge', lobe: 1, binding: 'clasp', inset: 'runes', haft: 'straight', gem: 'emerald' }],
      ['amber_inset', 'Amber Inset Jade', { head: 'crescent', lobe: 1, binding: 'band', inset: 'amber', haft: 'straight', gem: 'amber' }],
      ['moonlit_jade', 'Moonlit Jade Axe', { head: 'labrys', lobe: 1, binding: 'wrap', inset: 'moon', haft: 'bent', gem: 'silver' }],
    ],
  },
  {
    id: 'celestial_bow', name: 'Celestial Bow',
    palette: { silver: ['#252c3a', '#9aa4b4', '#f4f8fd'], blue: ['#071327', '#1f5f9e', '#a8d8ff'], string: ['#7b8393', '#d7dce5', '#ffffff'], gold: ['#462601', '#c48609', '#fde045'], grip: ['#1a1522', '#4a3a52', '#8b7a93'], outline: '#05070f' },
    motifs: [
      ['moonlit_filigree', 'Moonlit Filigree', { limb: 'recurve', string: 'taut', filigree: 'scroll', grip: 2, ornament: 'moon' }],
      ['starlance', 'Starlance Longbow', { limb: 'long', string: 'taut', filigree: 'rays', grip: 2, ornament: 'star' }],
      ['silver_comet', 'Silver Comet', { limb: 'recurve', string: 'taut', filigree: 'trail', grip: 1, ornament: 'comet' }],
      ['eclipse_thread', 'Eclipse Threadbow', { limb: 'short', string: 'taut', filigree: 'ring', grip: 2, ornament: 'eclipse' }],
      ['astral_crescent', 'Astral Crescent', { limb: 'recurve', string: 'loose', filigree: 'scroll', grip: 2, ornament: 'crescent' }],
      ['nebula_string', 'Nebula Stringbow', { limb: 'long', string: 'loose', filigree: 'dots', grip: 1, ornament: 'nebula' }],
      ['frostmoon', 'Frostmoon Longbow', { limb: 'long', string: 'taut', filigree: 'shard', grip: 2, ornament: 'moon' }],
      ['aurora_filigree', 'Aurora Filigree', { limb: 'recurve', string: 'loose', filigree: 'scroll', grip: 2, ornament: 'aurora' }],
      ['solar_arc', 'Solar Arc Longbow', { limb: 'long', string: 'taut', filigree: 'rays', grip: 2, ornament: 'sun' }],
      ['constellation', 'Constellation Bow', { limb: 'short', string: 'taut', filigree: 'dots', grip: 1, ornament: 'constellation' }],
      ['twilight_starbow', 'Twilight Starbow', { limb: 'recurve', string: 'taut', filigree: 'trail', grip: 2, ornament: 'star' }],
      ['lunar_halo', 'Lunar Halo Bow', { limb: 'short', string: 'loose', filigree: 'ring', grip: 2, ornament: 'halo' }],
      ['meteorstring', 'Meteorstring Longbow', { limb: 'long', string: 'taut', filigree: 'trail', grip: 1, ornament: 'meteor' }],
      ['sapphire_skybow', 'Sapphire Skybow', { limb: 'recurve', string: 'loose', filigree: 'shard', grip: 2, ornament: 'gem' }],
      ['radiant_silverbow', 'Radiant Silverbow', { limb: 'short', string: 'taut', filigree: 'rays', grip: 1, ornament: 'radiant' }],
      ['void_crescent', 'Void Crescent Bow', { limb: 'long', string: 'loose', filigree: 'ring', grip: 2, ornament: 'void' }],
    ],
  },
  {
    id: 'rune_shield', name: 'Rune Shield',
    palette: { body: ['#0a080c', '#3a3450', '#6f6889'], bronze: ['#33240d', '#a98548', '#f2ce80'], turquoise: ['#062e2c', '#2fc4b4', '#cbfdfb'], silver: ['#252c3a', '#a9b2bd', '#f4f8fc'], outline: '#04030a' },
    motifs: [
      ['crescent_glyph', 'Crescent Glyph Shield', { rim: 'round', frame: 'band', ward: 'crescent', glyph: 'none', boss: 'none' }],
      ['spiral_rune', 'Spiral Rune Shield', { rim: 'round', frame: 'double', ward: 'spiral', glyph: 'none', boss: 'ring' }],
      ['crowned_eye', 'Crowned Eye Shield', { rim: 'kite', frame: 'band', ward: 'eye', glyph: 'crown', boss: 'ring' }],
      ['tide_knot', 'Tide Knot Shield', { rim: 'round', frame: 'double', ward: 'knot', glyph: 'none', boss: 'none' }],
      ['four_point', 'Four Point Shield', { rim: 'hex', frame: 'band', ward: 'cross', glyph: 'none', boss: 'dot' }],
      ['serpent_glyph', 'Serpent Glyph Shield', { rim: 'round', frame: 'band', ward: 'serpent', glyph: 'none', boss: 'none' }],
      ['starburst_rune', 'Starburst Rune Shield', { rim: 'hex', frame: 'double', ward: 'star', glyph: 'none', boss: 'dot' }],
      ['turquoise_sun', 'Turquoise Sun Shield', { rim: 'round', frame: 'double', ward: 'sun', glyph: 'none', boss: 'ring' }],
      ['twin_wave', 'Twin Wave Shield', { rim: 'kite', frame: 'band', ward: 'waves', glyph: 'none', boss: 'none' }],
      ['obsidian_lotus', 'Obsidian Lotus Shield', { rim: 'round', frame: 'band', ward: 'lotus', glyph: 'none', boss: 'ring' }],
      ['crossed_rune', 'Crossed Rune Shield', { rim: 'kite', frame: 'double', ward: 'cross', glyph: 'runes', boss: 'none' }],
      ['angular_eye', 'Angular Eye Shield', { rim: 'hex', frame: 'band', ward: 'eye', glyph: 'none', boss: 'dot' }],
      ['moonlit_glyph', 'Moonlit Glyph Shield', { rim: 'round', frame: 'double', ward: 'crescent', glyph: 'moon', boss: 'none' }],
      ['triangular_ward', 'Triangular Ward Shield', { rim: 'kite', frame: 'band', ward: 'triangle', glyph: 'none', boss: 'dot' }],
      ['radiant_ring', 'Radiant Ring Shield', { rim: 'round', frame: 'double', ward: 'ring', glyph: 'rays', boss: 'ring' }],
      ['ancient_spiral', 'Ancient Spiral Shield', { rim: 'hex', frame: 'band', ward: 'spiral', glyph: 'runes', boss: 'none' }],
    ],
  },
];

const THEME_BY_ID = new Map(ITEM_THEMES.map((theme) => [theme.id, theme]));
const MOTIF_BY_KEY = new Map();
for (const theme of ITEM_THEMES) for (const [id, name, params] of theme.motifs) MOTIF_BY_KEY.set(`${theme.id}/${id}`, { id, name, params });

/* ---------- deterministic helpers ---------- */
function hash(x, y, seed, salt = 0) {
  let h = Math.imul((x | 0) + 0x9e3779b9, 0x85ebca6b);
  h ^= Math.imul((y | 0) + 0x7f4a7c15, 0xc2b2ae35);
  h ^= Math.imul((seed | 0) + 0x27d4eb2f + salt * 0x165667b1, 0x9e3779b1);
  h = Math.imul(h ^ (h >>> 15), 0x2c1b3c6d);
  h ^= h >>> 12;
  return (h >>> 0) / 4294967295;
}

/* ---------- style engine: multi-step ramps, directional light, internal outline ---------- */
function hexToRgb(hex) { return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)]; }
function rgbToHex(c) { return `#${c.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('')}`; }
function lerpRgb(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }

/* 11-step ramp through dark → mid → light, matching the continuous ramps in the reference set. */
function buildRamp(darkHex, midHex, lightHex, steps = 11) {
  const dark = hexToRgb(darkHex), mid = hexToRgb(midHex), light = hexToRgb(lightHex);
  const out = [];
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    out.push(t <= 0.5 ? lerpRgb(dark, mid, t * 2) : lerpRgb(mid, light, (t - 0.5) * 2));
  }
  return out;
}

const LIGHT_BANDS = 11;

function rampPick(ramp, l) {
  const t = Math.max(0, Math.min(1, l));
  return ramp[Math.min(ramp.length - 1, Math.round(t * (ramp.length - 1)))];
}

function shadeAt(ramp, l) {
  const c = rampPick(ramp, l);
  return [Math.round(c[0]), Math.round(c[1]), Math.round(c[2])];
}

/* A shape is a light-value field; colour is resolved after the geometry is known. */
function shapeField() {
  const cells = new Map();
  const set = (x, y, light, mat = 'base') => {
    if (x < 0 || y < 0 || x > 15 || y > 15) return;
    const key = y * 16 + x;
    const prev = cells.get(key);
    if (prev && prev.mat === mat) { prev.l = Math.max(prev.l, light); return; }
    if (prev && prev.l > light) return;
    cells.set(key, { x, y, l: light, mat });
  };
  const line = (x0, y0, x1, y1, light, mat = 'base', thickness = 1) => {
    let x = x0, y = y0;
    const dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1;
    const dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    for (;;) {
      for (let ox = 0; ox < thickness; ox++) for (let oy = 0; oy < thickness; oy++) set(x + ox, y + oy, light, mat);
      if (x === x1 && y === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x += sx; }
      if (e2 <= dx) { err += dx; y += sy; }
    }
  };
  const rect = (x0, y0, w, h, light, mat = 'base') => { for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) set(x0 + x, y0 + y, light, mat); };
  const has = (x, y) => cells.has(y * 16 + x);
  return { cells, set, line, rect, has };
}

/* Colourise a field: nearest-to-light edge gets a highlight, far edge gets the outline tone. */
function renderField(c, field, ramps, outlineRgb, opts = {}) {
  const { lightX = 1, lightY = 1, highlight = 0.34, darken = 0.3 } = opts;
  const norm = Math.hypot(lightX, lightY) || 1;
  const dx = lightX / norm, dy = lightY / norm;
  const sx = Math.round(dx), sy = Math.round(dy);
  for (const { x, y, l, mat } of field.cells.values()) {
    const ramp = ramps[mat] || ramps.base;
    const litNeighbour = field.has(x + sx, y + sy);
    const shadedNeighbour = field.has(x - sx, y - sy);
    let value = l;
    if (!litNeighbour) value = Math.min(1, value + highlight);
    if (!shadedNeighbour) value = Math.max(0, value - darken);
    const color = value <= 0.04 ? outlineRgb : shadeAt(ramp, value);
    const i = (y * 16 + x) * 4;
    c.buf[i] = color[0]; c.buf[i + 1] = color[1]; c.buf[i + 2] = color[2]; c.buf[i + 3] = 255;
  }
}

function canvas(seed) {
  const size = 16;
  const buf = new Uint8ClampedArray(size * size * 4);
  const paint = (x, y, color, alpha = 255) => {
    if (x < 0 || y < 0 || x >= size || y >= size) return;
    const i = (y * size + x) * 4;
    buf[i] = color[0]; buf[i + 1] = color[1]; buf[i + 2] = color[2]; buf[i + 3] = alpha;
  };
  const at = (x, y) => {
    if (x < 0 || y < 0 || x >= size || y >= size) return null;
    const i = (y * size + x) * 4;
    return buf[i + 3] ? [buf[i], buf[i + 1], buf[i + 2]] : null;
  };
  const line = (x0, y0, x1, y1, color, thickness = 1) => {
    let x = x0, y = y0;
    const dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1;
    const dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    for (;;) {
      for (let ox = 0; ox < thickness; ox++) for (let oy = 0; oy < thickness; oy++) paint(x + ox, y + oy, color);
      if (x === x1 && y === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x += sx; }
      if (e2 <= dx) { err += dx; y += sy; }
    }
  };
  const grain = (x, y, color, amount = 12) => {
    const n = hash(x, y, seed, 31) - 0.5;
    return shade(color, Math.round(n * amount * 2));
  };
  return { size, buf, paint, at, line, grain, seed };
}

const EXTRA_RAMPS = {
  emerald: buildRamp('#07301b', '#2fb56f', '#b6ffd2'),
  stone: buildRamp('#23262a', '#7c8288', '#cfd6dd'),
  obsidian: buildRamp('#0b0912', '#332b47', '#6d5f8f'),
  moss: buildRamp('#16300f', '#4f7a2e', '#bfe08a'),
  ruby: buildRamp('#3a0710', '#c62b3f', '#ffc2cc'),
};

function rampsFor(pal) {
  const out = { ...EXTRA_RAMPS };
  let base = null;
  for (const [key, value] of Object.entries(pal)) {
    if (Array.isArray(value) && value.length === 3) {
      out[key] = buildRamp(value[0], value[1], value[2]);
      if (!base) base = out[key];
    }
  }
  out.base = out.steel || out.jade || out.body || out.silver || base;
  return out;
}

/* ---------- sword ---------- */
function drawSword(c, p, pal) {
  const ramps = rampsFor(pal);
  const outline = hexToRgb(pal.outline);
  const f = shapeField();
  const bladeLen = p.blade === 'taper' ? 8 : 9;
  for (let i = 0; i < bladeLen; i++) {
    const x = 13 - i, y = i;
    const light = 0.42 + (i / bladeLen) * 0.34;
    f.set(x, y, light - 0.1, 'steel');
    f.set(x, y + 1, light, 'steel');
    f.set(x + 1, y + 1, light - 0.26, 'steel');
    if (p.blade === 'leaf' && i > 1 && i < bladeLen - 2) f.set(x + 1, y, light - 0.3, 'steel');
  }
  f.set(14, 1, 0.85, 'steel');
  // inlay
  if (p.inlay === 'edge') {
    for (let i = 1; i < bladeLen - 1; i++) f.set(13 - i, i, 0.72, 'gold');
  } else if (p.inlay === 'fuller') {
    for (let i = 1; i < bladeLen - 1; i++) f.set(13 - i, i + 1, 0.36, 'steel');
  } else if (p.inlay === 'rays') {
    for (let i = 2; i < bladeLen - 1; i += 2) { f.set(13 - i, i, 0.9, 'gold'); f.set(13 - i + 1, i + 1, 0.8, 'gold'); }
  } else if (p.inlay === 'band') {
    for (let y = 3; y < 7; y++) { f.set(14 - y, y, 0.78, 'gold'); f.set(14 - y, y + 1, 0.62, 'gold'); }
  }
  const gy = 9;
  if (p.guard === 'cross') {
    for (let x = 3; x <= 8; x++) f.set(x, gy, 0.62, 'gold');
    f.set(3, gy + 1, 0.4, 'gold'); f.set(8, gy + 1, 0.4, 'gold');
  } else if (p.guard === 'wide') {
    for (let x = 2; x <= 9; x++) f.set(x, gy, 0.64, 'gold');
    for (let x = 3; x <= 8; x++) f.set(x, gy + 1, 0.44, 'gold');
  } else if (p.guard === 'curved') {
    for (let x = 3; x <= 6; x++) f.set(x, gy, 0.6, 'gold');
    for (let x = 5; x <= 8; x++) f.set(x, gy + 1, 0.52, 'gold');
  } else if (p.guard === 'crown') {
    for (let x = 3; x <= 8; x++) f.set(x, gy, 0.6, 'gold');
    for (const x of [3, 5, 6, 8]) f.set(x, gy - 1, 0.8, 'gold');
    f.set(4, gy - 2, 0.55, 'steel'); f.set(7, gy - 2, 0.55, 'steel');
  } else if (p.guard === 'winged') {
    for (let x = 2; x <= 9; x++) f.set(x, gy, x % 2 ? 0.66 : 0.5, 'gold');
    f.set(2, gy - 1, 0.78, 'gold'); f.set(9, gy - 1, 0.78, 'gold');
    f.set(1, gy - 2, 0.6, 'gold'); f.set(10, gy - 2, 0.6, 'gold');
  } else {
    for (let x = 3; x <= 8; x++) f.set(x, gy, 0.6, 'gold');
    for (const x of [3, 5, 7]) f.set(x, gy - 1, 0.85, 'gold');
    f.set(4, gy - 2, 0.6, 'steel'); f.set(6, gy - 2, 0.6, 'steel');
  }
  // grip
  let gx = 4, gyy = gy + 1;
  const steps = Math.min(4, Math.max(2, p.grip));
  for (let i = 0; i < steps; i++) {
    f.set(gx, gyy, i % 2 ? 0.62 : 0.46, 'grip');
    f.set(gx, gyy + 1, 0.34, 'grip');
    gx -= 1; gyy += 1;
  }
  // pommel
  const px = gx + 1, py = gyy;
  if (p.pommel === 'round') {
    f.set(px - 1, py, 0.72, 'gold'); f.set(px, py, 0.52, 'gold'); f.set(px - 1, py + 1, 0.44, 'gold');
  } else if (p.pommel === 'pointed') {
    f.set(px - 1, py, 0.66, 'gold'); f.set(px - 1, py + 1, 0.4, 'gold');
  } else {
    f.set(px - 1, py, 0.7, 'gold'); f.set(px, py, 0.5, 'gold');
    f.set(px - 2, py, 0.8, 'gold'); f.set(px - 1, py - 1, 0.9, 'gold');
  }
  const gemMat = p.gem === 'none' ? 'gold' : p.gem;
  f.set(4, gy, 1, gemMat); f.set(7, gy, 0.86, gemMat);
  renderField(c, f, ramps, outline, { lightX: 1, lightY: 1, highlight: 0.3, darken: 0.34 });
  return c;
}

/* ---------- pickaxe ---------- */
function drawPickaxe(c, p, pal) {
  const ramps = rampsFor(pal);
  const outline = hexToRgb(pal.outline);
  const f = shapeField();
  const curve = p.curve || 0;
  const span = { flat: 11, narrow: 9, wide: 13, crest: 12 }[p.head] ?? 12;
  const x0 = Math.round((16 - span) / 2);
  const tip = Math.floor(span / 2);
  for (let i = 0; i < span; i++) {
    const x = x0 + i;
    const edgeFall = Math.abs(i - tip) / tip;
    const bend = Math.round(Math.sin((i / (span - 1)) * Math.PI) * curve);
    const y = 2 + bend + Math.round(edgeFall * 1.6);
    f.set(x, y, 0.88 - edgeFall * 0.18, 'steel');
    f.set(x, y + 1, 0.66 - edgeFall * 0.12, 'steel');
    f.set(x, y + 2, 0.4 - edgeFall * 0.08, 'steel');
    if (p.head === 'crest' && (i === 2 || i === span - 3)) {
      f.set(x, y - 1, 0.95, 'steel');
      f.set(x, y - 2, 0.72, 'steel');
    }
    if (p.head === 'wide' && i % 3 === 1) f.set(x, y, 0.98, 'steel');
  }
  f.set(x0 - 1, 3 + curve + 2, 0.55, 'steel');
  f.set(x0 + span, 3 + curve + 2, 0.55, 'steel');
  // binding
  const bx = 7, by = 5 + curve + 1;
  if (p.binding === 'band') {
    for (let x = bx - 1; x <= bx + 2; x++) { f.set(x, by, 0.66, 'gold'); f.set(x, by + 1, 0.46, 'gold'); }
  } else if (p.binding === 'wrap') {
    f.set(bx - 1, by, 0.7, 'gold'); f.set(bx + 2, by, 0.5, 'gold');
    f.set(bx - 1, by + 1, 0.54, 'gold'); f.set(bx + 2, by + 1, 0.38, 'gold');
    f.set(bx, by, 0.6, 'gold'); f.set(bx + 1, by, 0.6, 'gold');
  } else {
    f.set(bx - 1, by, 0.72, 'gold'); f.set(bx, by, 0.86, 'rune'); f.set(bx + 1, by, 0.62, 'gold');
    f.set(bx, by + 1, 0.44, 'gold'); f.set(bx + 1, by + 1, 0.4, 'gold');
  }
  // haft
  for (let y = by + 2; y <= 14; y++) {
    const drift = p.haft === 'bent' ? Math.round((y - by - 2) * 0.6) : 0;
    const x = 7 - drift;
    f.set(x, y, 0.62 - (y - by) * 0.015, 'haft');
    f.set(x + 1, y, 0.4, 'haft');
  }
  // rune script on the head
  const ry = 3 + curve;
  const runeShapes = {
    chevron: () => { for (let i = 0; i < 3; i++) { f.set(bx - 2 + i, ry + 1 - (i % 2), 0.95, 'rune'); f.set(bx + 2 - i, ry + 1 - (i % 2), 0.95, 'rune'); } },
    spiral: () => { f.set(bx, ry, 0.95, 'rune'); f.set(bx + 1, ry, 0.9, 'rune'); f.set(bx + 1, ry + 1, 0.85, 'rune'); f.set(bx - 1, ry + 1, 0.8, 'rune'); },
    dots: () => { f.set(bx - 3, ry, 0.95, 'rune'); f.set(bx + 3, ry, 0.95, 'rune'); },
    runes: () => { f.set(bx - 4, ry, 0.9, 'rune'); f.set(bx - 2, ry + 1, 0.95, 'gold'); f.set(bx + 2, ry + 1, 0.95, 'gold'); f.set(bx + 4, ry, 0.9, 'rune'); },
    glyph: () => { f.set(bx - 1, ry, 0.95, 'rune'); f.set(bx + 1, ry, 0.9, 'rune'); f.set(bx, ry + 1, 0.85, 'rune'); },
    vein: () => { for (let x = bx - 5; x <= bx + 5; x++) f.set(x, ry + 1, 0.7 + (x === bx ? 0.3 : 0), 'rune'); },
    crescent: () => { f.set(bx - 1, ry, 0.95, 'rune'); f.set(bx - 2, ry + 1, 0.95, 'rune'); f.set(bx - 1, ry + 2, 0.9, 'rune'); },
    sigil: () => { f.set(bx, ry, 0.95, 'rune'); f.set(bx - 1, ry + 1, 0.9, 'rune'); f.set(bx + 1, ry + 1, 0.9, 'rune'); },
    eye: () => { f.set(bx - 2, ry + 1, 0.9, 'rune'); f.set(bx - 1, ry + 1, 0.95, 'rune'); f.set(bx + 1, ry + 1, 0.95, 'rune'); f.set(bx + 2, ry + 1, 0.9, 'rune'); },
    arc: () => { for (let i = -3; i <= 3; i++) f.set(bx + i, ry + (3 - Math.abs(i)) % 2 + 1, 0.92, 'rune'); },
    crown: () => { f.set(bx - 1, ry, 0.95, 'rune'); f.set(bx + 1, ry, 0.95, 'rune'); f.set(bx, ry + 1, 1, 'gold'); },
  };
  (runeShapes[p.rune] || runeShapes.dots)();
  const gemMat = p.gem || 'emerald';
  f.set(bx, by + 1, 1, gemMat);
  renderField(c, f, ramps, outline, { lightX: 0, lightY: -1, highlight: 0.26, darken: 0.3 });
  return c;
}

/* ---------- axe ---------- */
function drawAxe(c, p, pal) {
  const ramps = rampsFor(pal);
  const outline = hexToRgb(pal.outline);
  const f = shapeField();
  const haftX = 8;
  const lobe = p.lobe ? 1 : 0;
  const lobeAt = (cx, cy, half) => {
    for (let y = cy - half; y <= cy + half; y++) {
      const dist = Math.abs(y - cy);
      const reach = Math.max(1, half - Math.floor(dist * 0.4));
      for (let x = cx - reach; x <= cx + 1; x++) {
        const fromEdge = (cx - reach) - x;
        const light = 0.68 - Math.abs(fromEdge) * 0.09 - dist * 0.02;
        f.set(x, y, Math.max(0.2, light), 'jade');
      }
      f.set(cx - reach, y, 0.92, 'bronze');
      if (reach > 2) f.set(cx - reach + 1, y, 0.62, 'jade');
    }
  };
  if (p.head === 'labrys') {
    lobeAt(4, 5, 2 + lobe);
    lobeAt(11, 5, 2 + lobe);
    f.set(haftX, 2 + lobe * 0, 0.5, 'haft');
  } else if (p.head === 'wedge') {
    for (let y = 2; y <= 8; y++) {
      const wide = (y < 5 ? y : 9 - y) + 1 + lobe;
      for (let x = haftX - wide; x < haftX; x++) {
        const light = 0.34 + (x - (haftX - wide)) / Math.max(1, wide) * 0.36;
        f.set(x, y, Math.min(0.9, light), 'jade');
      }
      f.set(haftX - wide, y, 0.94, 'bronze');
    }
  } else {
    lobeAt(5, 5, 3 + lobe);
    for (let y = 3; y <= 7; y++) f.set(2, y, 0.5, 'jade');
  }
  // binding
  for (let y = 9; y <= 10; y++) {
    if (p.binding === 'band') { for (let x = haftX - 1; x <= haftX + 1; x++) f.set(x, y, x === haftX ? 0.7 : 0.52, 'bronze'); }
    else if (p.binding === 'wrap') { f.set(haftX - 1, y, 0.62, 'bronze'); f.set(haftX + 1, y, 0.48, 'bronze'); f.set(haftX, y, 0.4, 'bronze'); }
    else if (p.binding === 'clasp') { f.set(haftX, y, 0.44, 'bronze'); f.set(haftX + 1, y, 0.66, 'bronze'); }
    else { f.set(haftX - 1, y, 0.6, 'bronze'); f.set(haftX, y, 0.42, 'bronze'); f.set(haftX + 1, y, 0.5, 'bronze'); }
  }
  // haft
  for (let y = 11; y <= 14; y++) {
    const x = p.haft === 'bent' ? haftX + Math.round((y - 11) * 0.5) : haftX;
    f.set(x, y, 0.6 - (y - 11) * 0.02, 'haft');
    f.set(x + 1, y, 0.38, 'haft');
  }
  // inset glyph
  const gx = p.head === 'labrys' ? 4 : 5, gy = 5;
  const insetShapes = {
    sun: () => { for (const [dx, dy] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]) f.set(gx + dx, gy + dy, 0.95, 'amber'); },
    dots: () => { f.set(gx - 1, gy - 1, 0.9, 'amber'); f.set(gx + 1, gy + 1, 0.9, 'amber'); },
    ring: () => { for (const [dx, dy] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) f.set(gx + dx, gy + dy, 0.92, 'amber'); },
    moss: () => { f.set(gx, gy, 0.8, 'moss'); f.set(gx + 1, gy + 1, 0.7, 'moss'); },
    line: () => { for (let y = gy - 1; y <= gy + 1; y++) f.set(gx, y, 0.92, 'amber'); },
    eye: () => { f.set(gx - 1, gy, 0.9, 'amber'); f.set(gx + 1, gy, 0.9, 'amber'); },
    carve: () => { f.set(gx - 1, gy, 0.3, 'jade'); f.set(gx + 1, gy, 0.3, 'jade'); f.set(gx, gy - 1, 0.95, 'amber'); },
    crown: () => { f.set(gx - 1, gy, 0.92, 'amber'); f.set(gx + 1, gy, 0.92, 'amber'); f.set(gx, gy - 1, 1, 'amber'); },
    spiral: () => { f.set(gx, gy, 0.92, 'amber'); f.set(gx + 1, gy, 0.86, 'amber'); f.set(gx + 1, gy + 1, 0.8, 'amber'); },
    lotus: () => { f.set(gx, gy, 0.95, 'amber'); f.set(gx - 1, gy + 1, 0.88, 'amber'); f.set(gx + 1, gy + 1, 0.88, 'amber'); },
    diamond: () => { f.set(gx, gy, 0.95, 'amber'); f.set(gx, gy - 1, 1, 'amber'); },
    feather: () => { for (let i = 0; i < 3; i++) f.set(gx + i - 1, gy - i + 1, 0.9, 'amber'); },
    twin: () => { f.set(gx, gy, 0.95, 'amber'); f.set(11 - gx, gy, 0.95, 'amber'); },
    runes: () => { f.set(gx - 1, gy, 0.92, 'amber'); f.set(gx + 1, gy - 1, 0.92, 'amber'); },
    amber: () => { for (const [dx, dy] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]) f.set(gx + dx, gy + dy, 0.98, 'amber'); },
    moon: () => { f.set(gx, gy, 0.95, 'silver'); f.set(gx - 1, gy, 0.8, 'silver'); },
  };
  (insetShapes[p.inset] || insetShapes.dots)();
  const gemMat = p.gem === 'gold' ? 'amber' : p.gem || 'amber';
  f.set(haftX, 10, 1, gemMat);
  renderField(c, f, ramps, outline, { lightX: -1, lightY: -0.45, highlight: 0.26, darken: 0.28 });
  return c;
}

/* ---------- bow ---------- */
function drawBow(c, p, pal) {
  const ramps = rampsFor(pal);
  const outline = hexToRgb(pal.outline);
  const f = shapeField();
  const span = { short: 9, recurve: 11, long: 13 }[p.limb] || 11;
  const top = Math.floor((16 - span) / 2);
  for (let i = 0; i < span; i++) {
    const t = i / (span - 1);
    const bulge = Math.round(Math.sin(t * Math.PI) * 6);
    const x = 3 + bulge;
    const y = top + i;
    f.set(x, y, 0.5, 'silver');
    f.set(x + 1, y, 0.72, 'silver');
    f.set(x + 2, y, 0.9, 'silver');
    if (p.limb === 'recurve' && (i === 1 || i === span - 2)) { f.set(x + 3, y, 0.8, 'blue'); }
  }
  f.set(2, top, 0.8, 'blue'); f.set(3, top, 0.66, 'silver');
  f.set(2, top + span - 1, 0.8, 'blue'); f.set(3, top + span - 1, 0.66, 'silver');
  for (let i = 0; i < span; i++) {
    const y = top + i;
    if (p.string === 'taut') f.set(1, y, i === 0 || i === span - 1 ? 0.9 : 0.6, 'string');
    else if (i % 2 === 0) f.set(1, y, 0.42, 'string');
  }
  const mid = top + Math.floor(span / 2);
  const bulge = 3 + Math.round(Math.sin(0.5 * Math.PI) * 6);
  for (let i = 0; i < Math.max(2, p.grip); i++) {
    f.set(bulge - 1, mid - i + 1, 0.42, 'grip');
    f.set(bulge, mid - i + 1, 0.62, 'grip');
    f.set(bulge + 1, mid - i + 1, 0.8, 'grip');
  }
  const fx = 5, fy = top + 2;
  const filigree = {
    scroll: () => { f.set(fx, fy, 0.95, 'gold'); f.set(fx + 1, fy + 1, 0.95, 'gold'); f.set(fx + 2, fy + 1, 0.9, 'gold'); f.set(fx + 3, fy, 0.9, 'gold'); },
    rays: () => { for (let i = 0; i < 3; i++) f.set(fx + i, fy + i, 0.95, 'gold'); },
    trail: () => { for (let i = 0; i < 3; i++) f.set(fx + 1, fy + i, 0.92, 'gold'); },
    ring: () => { for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) f.set(fx + dx, fy + dy, 0.92, 'gold'); },
    dots: () => { f.set(fx, fy, 0.95, 'gold'); f.set(fx + 2, fy + 2, 0.9, 'gold'); },
    shard: () => { f.set(fx, fy + 1, 0.9, 'blue'); f.set(fx + 1, fy + 2, 0.95, 'gold'); },
  };
  (filigree[p.filigree] || filigree.dots)();
  const ox = 3, oy = top - 1;
  const ornaments = {
    moon: () => { f.set(ox + 1, oy, 0.9, 'blue'); f.set(ox + 2, oy + 1, 0.9, 'blue'); f.set(ox + 1, oy + 2, 0.8, 'blue'); },
    star: () => { f.set(ox + 1, oy, 1, 'gold'); f.set(ox, oy + 1, 0.9, 'gold'); f.set(ox + 2, oy + 1, 0.9, 'gold'); f.set(ox + 1, oy + 2, 0.9, 'gold'); },
    comet: () => { f.set(ox + 1, oy, 1, 'gold'); f.set(ox + 2, oy + 1, 0.8, 'gold'); f.set(ox + 3, oy + 2, 0.6, 'gold'); },
    eclipse: () => { f.set(ox + 1, oy, 0.25, 'silver'); f.set(ox + 1, oy + 1, 0.95, 'gold'); },
    crescent: () => { f.set(ox + 1, oy, 0.9, 'silver'); f.set(ox + 2, oy + 1, 0.9, 'silver'); },
    nebula: () => { f.set(ox + 1, oy, 0.85, 'blue'); f.set(ox + 2, oy + 1, 0.7, 'blue'); },
    aurora: () => { f.set(ox + 1, oy, 0.9, 'silver'); f.set(ox, oy + 1, 0.95, 'blue'); f.set(ox + 3, oy, 0.85, 'blue'); },
    sun: () => { f.set(ox + 1, oy, 1, 'gold'); f.set(ox, oy, 0.85, 'gold'); f.set(ox + 2, oy, 0.85, 'gold'); },
    constellation: () => { f.set(ox, oy, 0.85, 'silver'); f.set(ox + 2, oy + 1, 0.85, 'silver'); f.set(ox + 1, oy + 2, 0.85, 'silver'); },
    halo: () => { f.set(ox, oy + 1, 0.92, 'gold'); f.set(ox + 2, oy + 1, 0.92, 'gold'); f.set(ox + 1, oy, 1, 'gold'); },
    meteor: () => { f.set(ox + 1, oy, 0.95, 'gold'); f.set(ox + 2, oy + 1, 0.7, 'gold'); },
    gem: () => { f.set(ox + 1, oy, 0.95, 'blue'); f.set(ox + 1, oy + 1, 1, 'blue'); },
    radiant: () => { f.set(ox + 1, oy, 1, 'gold'); f.set(ox + 1, oy + 2, 0.9, 'gold'); f.set(ox, oy + 1, 0.85, 'gold'); },
    void: () => { f.set(ox + 1, oy, 0.3, 'blue'); f.set(ox + 2, oy + 1, 0.5, 'blue'); },
  };
  (ornaments[p.ornament] || ornaments.star)();
  renderField(c, f, ramps, outline, { lightX: 1, lightY: -0.35, highlight: 0.26, darken: 0.3 });
  return c;
}

/* ---------- shield ---------- */
function drawShield(c, p, pal) {
  const ramps = rampsFor(pal);
  const outline = hexToRgb(pal.outline);
  const f = shapeField();
  const inRim = (x, y) => {
    const dx = Math.abs(x - 7.5), dy = Math.abs(y - 7.5);
    if (p.rim === 'hex') return dx + dy * 0.72 <= 6.2;
    if (p.rim === 'kite') return (dy <= 6 && dx <= 4.6 - (y - 2) * 0.1) || (y > 8 && dx <= 5.2 - (y - 8) * 0.8);
    return dx * dx + dy * dy <= 31;
  };
  const edge = (x, y) => inRim(x, y) && (!inRim(x + 1, y) || !inRim(x - 1, y) || !inRim(x, y + 1) || !inRim(x, y - 1));
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      if (!inRim(x, y)) continue;
      const dx = Math.abs(x - 7.5), dy = Math.abs(y - 7.5);
      const radial = 1 - Math.min(1, Math.hypot(dx, dy) / 7);
      if (edge(x, y)) {
        f.set(x, y, 0.58 + radial * 0.22, 'bronze');
      } else if (p.frame === 'double' && edge(x + 1, y) === false && (edge(x, y + 1) || edge(x + 1, y))) {
        f.set(x, y, 0.5, 'bronze');
      } else {
        f.set(x, y, 0.2 + radial * 0.44, 'body');
      }
    }
  }
  const ward = (x, y, light, mat) => { if (inRim(x, y)) f.set(x, y, light, mat); };
  const wards = {
    crescent: () => { for (let i = -2; i <= 2; i++) ward(7 + i, 5 + Math.abs(i), 0.92, 'silver'); },
    spiral: () => { ward(7, 7, 0.95, 'silver'); ward(8, 7, 0.9, 'silver'); ward(8, 8, 0.85, 'silver'); ward(7, 8, 0.8, 'silver'); ward(6, 8, 0.75, 'silver'); ward(6, 9, 0.7, 'silver'); },
    eye: () => { for (const [x, y] of [[5, 7], [6, 6], [7, 5], [8, 6], [9, 7], [8, 8], [7, 9], [6, 8]]) ward(x, y, 0.88, 'silver'); ward(7, 7, 1, 'turquoise'); },
    knot: () => { ward(7, 6, 0.9, 'silver'); ward(8, 7, 0.88, 'silver'); ward(6, 8, 0.86, 'silver'); ward(7, 9, 0.84, 'silver'); ward(9, 8, 0.82, 'silver'); },
    cross: () => { for (let i = 3; i <= 12; i++) { ward(i, 7, 0.86, 'silver'); ward(7, i, 0.86, 'silver'); } },
    serpent: () => { for (let i = 0; i < 6; i++) ward(4 + i, 5 + Math.round(Math.sin(i) * 2), 0.9, 'turquoise'); },
    star: () => { for (let i = 0; i < 4; i++) { ward(7 - i, 7 - i, 0.88, 'silver'); ward(7 + i, 7 - i, 0.88, 'silver'); ward(7 - i, 7 + i, 0.86, 'silver'); ward(7 + i, 7 + i, 0.86, 'silver'); } ward(7, 7, 1, 'silver'); },
    sun: () => { for (const [dx, dy] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]) ward(7 + dx, 7 + dy, 0.95, 'turquoise'); },
    waves: () => { for (let i = 0; i < 4; i++) { ward(5 + i, 6, 0.9, 'turquoise'); ward(8 - i, 9, 0.88, 'turquoise'); } },
    lotus: () => { ward(7, 6, 1, 'turquoise'); ward(6, 8, 0.9, 'turquoise'); ward(8, 8, 0.9, 'turquoise'); ward(5, 9, 0.85, 'silver'); ward(9, 9, 0.85, 'silver'); },
    triangle: () => { for (let i = 0; i < 4; i++) { ward(7 - i, 9 - i, 0.9, 'silver'); ward(7 + i, 9 - i, 0.9, 'silver'); } for (const x of [4, 5, 6, 9, 10, 11]) ward(x, 9, 0.85, 'silver'); },
    ring: () => { for (const [dx, dy] of [[0, -2], [1, -1], [2, 0], [1, 1], [0, 2], [-1, 1], [-2, 0], [-1, -1]]) ward(7 + dx, 7 + dy, 0.95, 'turquoise'); },
  };
  (wards[p.ward] || wards.ring)();
  if (p.boss === 'ring') { ward(7, 7, 1, 'turquoise'); ward(8, 8, 0.85, 'turquoise'); }
  if (p.boss === 'dot') { ward(7, 7, 1, 'silver'); ward(8, 8, 0.8, 'silver'); }
  const glyphs = {
    crown: () => { ward(6, 3, 0.9, 'bronze'); ward(8, 3, 0.9, 'bronze'); ward(7, 2, 1, 'bronze'); },
    moon: () => { ward(2, 3, 0.95, 'silver'); ward(3, 3, 0.85, 'silver'); ward(3, 4, 0.75, 'silver'); },
    rays: () => { for (let i = 0; i < 3; i++) { ward(3 + i, 3 + i, 0.9, 'silver'); ward(12 - i, 3 + i, 0.9, 'silver'); } },
    runes: () => { ward(3, 12, 0.85, 'silver'); ward(5, 12, 0.85, 'silver'); ward(10, 12, 0.85, 'silver'); ward(12, 12, 0.85, 'silver'); },
  };
  if (glyphs[p.glyph]) glyphs[p.glyph]();
  renderField(c, f, ramps, outline, { lightX: -0.6, lightY: -1, highlight: 0.22, darken: 0.26 });
  return c;
}

const RENDERERS = { royal_sword: drawSword, runic_pickaxe: drawPickaxe, jade_axe: drawAxe, celestial_bow: drawBow, rune_shield: drawShield };

export function generateItemMotif({ themeId, motifId, seed = 1, size = 16 } = {}) {
  const theme = THEME_BY_ID.get(themeId) || ITEM_THEMES[0];
  const motif = MOTIF_BY_KEY.get(`${theme.id}/${motifId}`) || MOTIF_BY_KEY.get(`${theme.id}/${theme.motifs[0][0]}`);
  const target = Math.max(16, Math.min(64, Math.round(Number(size) || 16)));
  const finalSize = target <= 16 ? 16 : target <= 32 ? 32 : 64;
  const c = canvas(seed);
  RENDERERS[theme.id](c, motif.params, theme.palette);
  let out = c.buf;
  if (finalSize !== 16) {
    const scale = finalSize / 16;
    const scaled = new Uint8ClampedArray(finalSize * finalSize * 4);
    for (let y = 0; y < finalSize; y++) for (let x = 0; x < finalSize; x++) {
      const s = (Math.floor(y / scale) * 16 + Math.floor(x / scale)) * 4;
      const d = (y * finalSize + x) * 4;
      scaled[d] = out[s]; scaled[d + 1] = out[s + 1]; scaled[d + 2] = out[s + 2]; scaled[d + 3] = out[s + 3];
    }
    out = scaled;
  }
  return {
    width: finalSize, height: finalSize, rgba: out,
    recipe: {
      theme: theme.id, themeName: theme.name, motif: motif.id, motifName: motif.name,
      size: finalSize, seed, engineVersion: ITEM_THEME_ENGINE_VERSION,
    },
    version: ITEM_THEME_ENGINE_VERSION,
  };
}

export function generateItemThemeSheet({ themeId, seed = 1, size = 16 } = {}) {
  const theme = THEME_BY_ID.get(themeId) || ITEM_THEMES[0];
  return {
    theme: { id: theme.id, name: theme.name, palette: { ...theme.palette } },
    motifs: theme.motifs.map(([id]) => generateItemMotif({ themeId: theme.id, motifId: id, seed, size })),
  };
}

export function listItemThemes() {
  return ITEM_THEMES.map((theme) => ({
    id: theme.id, name: theme.name, palette: { ...theme.palette },
    motifs: theme.motifs.map(([id, name]) => ({ id, name })),
  }));
}

export { ITEM_THEME_ENGINE_VERSION as version };

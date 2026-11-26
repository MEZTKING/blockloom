/* Component-based item motif families. Hard-edged 16×16 pixel art, no DOM/network/randomness. */
export const ITEM_THEME_ENGINE_VERSION = '1.0.0';

export const ITEM_THEMES = [
  {
    id: 'royal_sword', name: 'Royal Sword',
    palette: { metal: '#cfd6e2', metalDark: '#8e97a8', gold: '#e6c65a', goldDark: '#a8862f', grip: '#4a3a52', gem: '#4c8fe0', outline: '#1d2230' },
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
    palette: { metal: '#9aa4ad', metalDark: '#5f6870', jade: '#3f9d63', jadeDark: '#276b43', gold: '#c9a955', goldDark: '#8a7233', haft: '#5a4430', rune: '#6fe3a7', outline: '#1c241f' },
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
    palette: { jade: '#46a86b', jadeDark: '#2a7346', jadeLight: '#8ee0a8', bronze: '#b98a4a', bronzeDark: '#7e5a2c', haft: '#5f4632', amber: '#e3a83f', outline: '#1b241d' },
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
    palette: { silver: '#c3ccda', silverDark: '#8b95a6', blue: '#5f9de0', blueDark: '#3a6ea8', string: '#e6ecf5', gold: '#dcc06a', grip: '#4a3f52', outline: '#1b2130' },
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
    palette: { body: '#2b2537', bodyLight: '#413a52', bronze: '#a98548', bronzeDark: '#6d5529', turquoise: '#2fc4b4', silver: '#c2c9d6', outline: '#141019' },
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

function rgb(hex) { return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)]; }
function mix(a, b, t) { return [Math.round(a[0] + (b[0] - a[0]) * t), Math.round(a[1] + (b[1] - a[1]) * t), Math.round(a[2] + (b[2] - a[2]) * t)]; }
function shade(c, amount) { return c.map((v) => Math.max(0, Math.min(255, v + amount))); }

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

/* ---------- sword ---------- */
function drawSword(c, p, pal) {
  const metal = rgb(pal.metal), metalDark = rgb(pal.metalDark);
  const gold = rgb(pal.gold), goldDark = rgb(pal.goldDark);
  const grip = rgb(pal.grip), outline = rgb(pal.outline);
  const gem = { sapphire: rgb('#4c8fe0'), gold: rgb('#e6c65a'), ruby: rgb('#d8504c'), emerald: rgb('#3ad07a'), none: rgb(pal.gem) }[p.gem] || rgb(pal.gem);
  const edge = shade(metal, 34);
  const bladeLen = 9;
  const wide = p.blade === 'leaf' ? 1 : 0;
  // blade: diagonal from (13,0) to (5,8)
  for (let i = 0; i < bladeLen; i++) {
    const x = 13 - i, y = i;
    c.paint(x, y, c.grain(x, y, edge, 6));
    c.paint(x, y + 1, c.grain(x, y + 1, metal, 8));
    if (i < 5) c.paint(x + 1, y, c.grain(x + 1, y, shade(edge, 12), 6));
    if (wide && i > 0) c.paint(x + 1, y + 1, c.grain(x + 1, y + 1, metalDark, 8));
    if (i === bladeLen - 1) { c.paint(x, y + 2, metalDark); }
  }
  c.paint(14, 1, edge);
  // inlay
  if (p.inlay === 'fuller') {
    for (let i = 1; i < 8; i++) c.paint(13 - i, i + 1, shade(metalDark, -26));
  } else if (p.inlay === 'edge') {
    for (let i = 1; i < 8; i++) c.paint(13 - i, i, gold);
  } else if (p.inlay === 'rays') {
    for (let i = 1; i < 7; i += 2) { c.paint(13 - i, i, gold); c.paint(13 - i + 1, i + 1, gold); }
  } else if (p.inlay === 'band') {
    for (let y = 3; y < 7; y++) c.paint(13 - (y) + 1, y, gold);
    for (let y = 3; y < 7; y++) c.paint(13 - y, y + 1, gold);
  }
  // guard
  const gy = 9;
  if (p.guard === 'cross') {
    for (let x = 3; x <= 8; x++) c.paint(x, gy, gold);
    c.paint(3, gy + 1, goldDark); c.paint(8, gy + 1, goldDark);
    c.paint(4, gy - 1, gold); c.paint(7, gy - 1, gold);
  } else if (p.guard === 'wide') {
    for (let x = 2; x <= 9; x++) c.paint(x, gy, gold);
    for (let x = 3; x <= 8; x++) c.paint(x, gy + 1, goldDark);
    c.paint(2, gy - 1, gold); c.paint(9, gy - 1, gold);
  } else if (p.guard === 'curved') {
    c.paint(3, gy, gold); c.paint(4, gy, gold); c.paint(5, gy, gold);
    c.paint(6, gy + 1, gold); c.paint(7, gy + 1, gold); c.paint(8, gy + 1, gold);
    c.paint(2, gy - 1, goldDark); c.paint(9, gy, gold);
  } else if (p.guard === 'crown') {
    for (let x = 3; x <= 8; x++) c.paint(x, gy, gold);
    for (const x of [3, 5, 6, 8]) c.paint(x, gy - 1, gold);
    c.paint(4, gy - 2, edge); c.paint(7, gy - 2, edge);
    c.paint(3, gy + 1, goldDark); c.paint(8, gy + 1, goldDark);
  } else if (p.guard === 'winged') {
    for (let x = 2; x <= 9; x++) c.paint(x, gy, x % 2 ? gold : goldDark);
    c.paint(2, gy - 1, gold); c.paint(9, gy - 1, gold);
    c.paint(1, gy - 2, goldDark); c.paint(10, gy - 2, goldDark);
    c.paint(1, gy - 1, metal); c.paint(10, gy - 1, metal);
  } else {
    for (let x = 3; x <= 8; x++) c.paint(x, gy, gold);
    c.paint(3, gy - 1, metal); c.paint(5, gy - 1, metal); c.paint(7, gy - 1, gold);
    c.paint(4, gy - 2, metal); c.paint(6, gy - 2, metal);
  }
  if (p.guard !== 'curved') { for (let x = 3; x <= 8; x++) c.paint(x, gy + 1, x % 2 ? goldDark : gold); }
  // grip with wrapping bands (kept inside the canvas)
  let gx = 4, gyy = gy + 1;
  const steps = Math.min(4, Math.max(2, p.grip));
  for (let i = 0; i < steps; i++) {
    const color = i % 2 === 0 ? grip : shade(grip, 26);
    c.paint(gx, gyy, color);
    c.paint(gx, gyy + 1, shade(grip, -18));
    gx -= 1; gyy += 1;
  }
  // pommel
  const px = gx + 1, py = gyy;
  if (p.pommel === 'round') {
    c.paint(px - 1, py, gold); c.paint(px, py, goldDark);
    c.paint(px - 1, py + 1, gem); c.paint(px, py + 1, shade(gem, -24));
  } else if (p.pommel === 'pointed') {
    c.paint(px - 1, py, gold); c.paint(px - 1, py + 1, goldDark);
  } else {
    c.paint(px - 1, py, gold); c.paint(px, py, goldDark);
    c.paint(px - 2, py, gold); c.paint(px - 1, py - 1, edge);
    c.paint(px - 1, py + 1, gem);
  }
  // jewel in the guard
  if (p.gem !== 'none') { c.paint(4, gy, shade(gem, 26)); c.paint(7, gy, gem); }
  c.paint(0, 15, outline, 0);
  return c;
}

/* ---------- pickaxe ---------- */
function drawPickaxe(c, p, pal) {
  const metal = rgb(pal.metal), metalDark = rgb(pal.metalDark), edge = shade(metal, 30);
  const gold = rgb(pal.gold), goldDark = rgb(pal.goldDark);
  const haft = rgb(pal.haft), rune = rgb(pal.rune);
  const curve = p.curve || 0;
  const span = { flat: 11, narrow: 9, wide: 13, crest: 12 }[p.head] ?? 12;
  const x0 = Math.round((16 - span) / 2);
  // head: 3-row arc
  for (let i = 0; i < span; i++) {
    const x = x0 + i;
    const bend = Math.round(Math.sin((i / (span - 1)) * Math.PI) * curve);
    const y = 2 + bend;
    c.paint(x, y, c.grain(x, y, edge, 8));
    c.paint(x, y + 1, c.grain(x, y + 1, metal, 8));
    c.paint(x, y + 2, c.grain(x, y + 2, metalDark, 8));
    if (p.head === 'crest' && (i === 2 || i === span - 3)) {
      c.paint(x, y - 1, gold);
      c.paint(x, y - 2, shade(gold, 20));
    }
    if (p.head === 'wide' && i % 3 === 0) c.paint(x, y + 1, metalDark);
  }
  // pointed tips
  c.paint(x0 - 1, 3 + curve, metal);
  c.paint(x0 + span, 3 + curve, metal);
  c.paint(x0 - 1, 4 + curve, metalDark);
  c.paint(x0 + span, 4 + curve, metalDark);
  // binding
  const bx = 7, by = 5 + curve;
  if (p.binding === 'wrap') {
    for (let x = bx - 1; x <= bx + 2; x++) { c.paint(x, by, gold); c.paint(x, by + 1, goldDark); }
  } else if (p.binding === 'band') {
    for (let x = bx - 1; x <= bx + 2; x++) c.paint(x, by, gold);
    for (let x = bx - 1; x <= bx + 2; x++) c.paint(x, by + 1, shade(gold, -26));
  } else {
    c.paint(bx - 1, by, gold); c.paint(bx, by, rune); c.paint(bx + 1, by, gold);
    c.paint(bx, by + 1, goldDark);
  }
  // haft (2 px wide, with a bend option)
  for (let y = by + 2; y <= 14; y++) {
    const drift = p.haft === 'bent' ? Math.round((y - by - 2) * 0.6) : 0;
    const x = 7 - drift;
    c.paint(x, y, c.grain(x, y, haft, 12));
    c.paint(x + 1, y, shade(c.grain(x + 1, y, haft, 12), -22));
  }
  // rune script on the head
  const runeY = 3 + curve;
  const runeShapes = {
    chevron: () => { for (let i = 0; i < 3; i++) { c.paint(bx - 2 + i, runeY + 1 - (i % 2), rune); c.paint(bx + 2 - i, runeY + 1 - (i % 2), rune); } },
    spiral: () => { c.paint(bx, runeY, rune); c.paint(bx + 1, runeY, rune); c.paint(bx + 1, runeY + 1, rune); c.paint(bx, runeY + 1, rune); c.paint(bx - 1, runeY + 1, rune); },
    dots: () => { c.paint(bx - 3, runeY, rune); c.paint(bx + 3, runeY, rune); c.paint(bx, runeY, shade(rune, -30)); },
    runes: () => { c.paint(bx - 4, runeY, rune); c.paint(bx - 2, runeY + 1, rune); c.paint(bx + 2, runeY + 1, rune); c.paint(bx + 4, runeY, rune); },
    glyph: () => { c.paint(bx - 1, runeY, rune); c.paint(bx + 1, runeY, rune); c.paint(bx, runeY + 1, rune); c.paint(bx - 1, runeY + 2, rune); },
    vein: () => { for (let x = bx - 5; x <= bx + 5; x++) c.paint(x, runeY + 1, rune); },
    crescent: () => { c.paint(bx - 1, runeY, rune); c.paint(bx - 2, runeY + 1, rune); c.paint(bx - 1, runeY + 2, rune); c.paint(bx, runeY + 1, shade(rune, -40)); },
    sigil: () => { c.paint(bx, runeY, rune); c.paint(bx - 1, runeY + 1, rune); c.paint(bx + 1, runeY + 1, rune); c.paint(bx, runeY + 2, rune); },
    eye: () => { c.paint(bx - 2, runeY + 1, rune); c.paint(bx - 1, runeY + 1, rune); c.paint(bx, runeY + 1, shade(rune, -50)); c.paint(bx + 1, runeY + 1, rune); c.paint(bx + 2, runeY + 1, rune); },
    arc: () => { for (let i = -3; i <= 3; i++) c.paint(bx + i, runeY + (3 - Math.abs(i)) % 2 + 1, rune); },
    crown: () => { c.paint(bx - 1, runeY, rune); c.paint(bx + 1, runeY, rune); c.paint(bx, runeY + 1, gold); c.paint(bx - 2, runeY + 2, rune); c.paint(bx + 2, runeY + 2, rune); },
  };
  (runeShapes[p.rune] || runeShapes.dots)();
  const gemColor = { emerald: rgb('#3ad07a'), jade: rgb('#5fd394'), silver: rgb('#dfe6f0'), stone: rgb('#8d9299'), obsidian: rgb('#3a3346'), gold }[p.gem] || gold;
  c.paint(bx, by + 1, gemColor);
  return c;
}

/* ---------- axe ---------- */
function drawAxe(c, p, pal) {
  const jade = rgb(pal.jade), jadeDark = rgb(pal.jadeDark), jadeLight = rgb(pal.jadeLight);
  const bronze = rgb(pal.bronze), bronzeDark = rgb(pal.bronzeDark);
  const haft = rgb(pal.haft), amber = rgb(pal.amber);
  const haftX = p.head === 'labrys' ? 8 : 8;
  // head on the left of the haft, plus a second lobe for labrys
  const drawLobe = (cx, cy, half, edgeDir) => {
    for (let y = cy - half; y <= cy + half; y++) {
      const dist = Math.abs(y - cy);
      const reach = half - Math.floor(dist * 0.45);
      for (let x = cx - reach; x <= cx + (edgeDir ? reach : 1); x++) {
        let color = jade;
        if (x <= cx - reach + 1) color = jadeLight;
        else if (x >= cx + reach - 1) color = jadeDark;
        c.paint(x, y, c.grain(x, y, color, 8));
      }
    }
    // bronze cutting edge
    for (let y = cy - half; y <= cy + half; y++) {
      const dist = Math.abs(y - cy);
      const reach = half - Math.floor(dist * 0.45);
      c.paint(cx + edgeDir * reach, y, bronze);
      if (edgeDir < 0) c.paint(cx - reach + 1, y, bronzeDark);
    }
  };
  if (p.head === 'labrys') {
    drawLobe(4, 5, p.lobe ? 3 : 2, -1);
    drawLobe(11, 5, p.lobe ? 3 : 2, 1);
  } else if (p.head === 'wedge') {
    for (let y = 2; y <= 8; y++) {
      const wide = y < 5 ? y - 1 + (p.lobe ? 1 : 0) : 9 - y + (p.lobe ? 1 : 0);
      for (let x = haftX - 1 - wide; x < haftX; x++) {
        c.paint(x, y, c.grain(x, y, x < haftX - wide + 2 ? jadeLight : jade, 8));
      }
      c.paint(haftX - 1 - wide, y, bronze);
    }
  } else {
    drawLobe(5, 5, 3 + (p.lobe ? 1 : 0), -1);
  }
  // binding
  for (let y = 9; y <= 10; y++) {
    if (p.binding === 'wrap') { c.paint(haftX - 1, y, bronze); c.paint(haftX + 1, y, bronze); }
    else if (p.binding === 'band') { for (let x = haftX - 1; x <= haftX + 1; x++) c.paint(x, y, bronze); }
    else if (p.binding === 'clasp') { c.paint(haftX, y, bronzeDark); c.paint(haftX + 1, y, bronze); }
    else { c.paint(haftX - 1, y, bronze); c.paint(haftX, y, bronzeDark); c.paint(haftX + 1, y, bronzeDark); }
  }
  // haft
  for (let y = 11; y <= 14; y++) {
    const x = p.haft === 'bent' ? haftX + Math.round((y - 11) * 0.5) : haftX;
    c.paint(x, y, c.grain(x, y, haft, 12));
    c.paint(x + 1, y, shade(c.grain(x + 1, y, haft, 12), -22));
  }
  // inset glyph
  const gx = p.head === 'labrys' ? 4 : 5, gy = 5;
  const insetShapes = {
    sun: () => { for (const [dx, dy] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]) c.paint(gx + dx, gy + dy, amber); },
    dots: () => { c.paint(gx - 1, gy - 1, amber); c.paint(gx + 1, gy + 1, amber); },
    ring: () => { for (const [dx, dy] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) c.paint(gx + dx, gy + dy, amber); },
    moss: () => { c.paint(gx, gy, shade(jade, -30)); c.paint(gx + 1, gy + 1, shade(jade, -40)); },
    line: () => { for (let y = gy - 1; y <= gy + 1; y++) c.paint(gx, y, amber); },
    eye: () => { c.paint(gx - 1, gy, amber); c.paint(gx, gy, jadeDark); c.paint(gx + 1, gy, amber); },
    carve: () => { c.paint(gx - 1, gy, jadeDark); c.paint(gx + 1, gy, jadeDark); c.paint(gx, gy + 1, jadeDark); c.paint(gx, gy - 1, amber); },
    crown: () => { c.paint(gx - 1, gy, amber); c.paint(gx + 1, gy, amber); c.paint(gx, gy - 1, shade(amber, 26)); },
    spiral: () => { c.paint(gx, gy, amber); c.paint(gx + 1, gy, amber); c.paint(gx + 1, gy + 1, amber); c.paint(gx, gy + 1, shade(amber, -30)); },
    lotus: () => { c.paint(gx, gy, amber); c.paint(gx - 1, gy + 1, amber); c.paint(gx + 1, gy + 1, amber); },
    diamond: () => { c.paint(gx, gy, amber); c.paint(gx, gy - 1, shade(amber, 22)); },
    feather: () => { for (let i = 0; i < 3; i++) c.paint(gx + i - 1, gy - i + 1, amber); },
    twin: () => { c.paint(gx, gy, amber); c.paint(11 - gx, gy, amber); },
    runes: () => { c.paint(gx - 1, gy, amber); c.paint(gx + 1, gy - 1, amber); c.paint(gx, gy + 1, amber); },
    amber: () => { for (const [dx, dy] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1], [0, 2]]) c.paint(gx + dx, gy + dy, amber); },
    moon: () => { c.paint(gx, gy, rgb('#dfe6f0')); c.paint(gx - 1, gy, rgb('#b9c6da')); c.paint(gx, gy + 1, rgb('#dfe6f0')); },
  };
  (insetShapes[p.inset] || insetShapes.dots)();
  const gemColor = { amber, bronze: bronzeDark, emerald: rgb('#3ad07a'), moss: shade(jade, -30), gold: rgb('#e6c65a'), obsidian: rgb('#3a3346'), silver: rgb('#dfe6f0') }[p.gem] || amber;
  c.paint(haftX, 10, gemColor);
  return c;
}

/* ---------- bow ---------- */
function drawBow(c, p, pal) {
  const silver = rgb(pal.silver), silverDark = rgb(pal.silverDark);
  const blue = rgb(pal.blue), blueDark = rgb(pal.blueDark);
  const stringCol = rgb(pal.string), gold = rgb(pal.gold), grip = rgb(pal.grip);
  const span = { short: 9, recurve: 11, long: 13 }[p.limb] || 11;
  const top = Math.floor((16 - span) / 2);
  // limb: arc opening right, 2 px thick
  for (let i = 0; i < span; i++) {
    const t = i / (span - 1);
    const bulge = Math.round(Math.sin(t * Math.PI) * 7);
    const x = 3 + bulge;
    const y = top + i;
    c.paint(x, y, c.grain(x, y, silver, 8));
    c.paint(x + 1, y, c.grain(x + 1, y, silverDark, 8));
    if (bulge > 1) c.paint(x + 2, y, c.grain(x + 2, y, shade(silverDark, -16), 8));
    if (p.limb === 'recurve' && (i === 1 || i === span - 2)) {
      c.paint(x + 2, y, blue);
      c.paint(x + 3, y, blueDark);
    }
  }
  // tips
  c.paint(2, top, blue); c.paint(3, top, shade(stringCol, -10)); c.paint(4, top, silverDark);
  c.paint(2, top + span - 1, blue); c.paint(3, top + span - 1, shade(stringCol, -10)); c.paint(4, top + span - 1, silverDark);
  // string between the tips
  for (let i = 1; i < span - 1; i++) {
    const y = top + i;
    if (p.string === 'taut') c.paint(1, y, stringCol);
    else if (i % 2 === 0) c.paint(1, y, shade(stringCol, -30));
  }
  // grip at the middle of the limb
  const mid = top + Math.floor(span / 2);
  const gripLen = Math.max(2, p.grip);
  const bulge = 3 + Math.round(Math.sin(0.5 * Math.PI) * 7);
  for (let i = 0; i < gripLen; i++) {
    c.paint(bulge - 1, mid - i + 1, grip);
    c.paint(bulge, mid - i + 1, shade(grip, 22));
  }
  // filigree along the upper limb
  const fx = 5, fy = top + 2;
  const filigree = {
    scroll: () => { c.paint(fx, fy, gold); c.paint(fx + 1, fy + 1, gold); c.paint(fx + 2, fy + 1, gold); c.paint(fx + 3, fy, gold); },
    rays: () => { for (let i = 0; i < 3; i++) c.paint(fx + i, fy + i, gold); },
    trail: () => { for (let i = 0; i < 3; i++) c.paint(fx + 1, fy + i, gold); },
    ring: () => { for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) c.paint(fx + dx, fy + dy, gold); },
    dots: () => { c.paint(fx, fy, gold); c.paint(fx + 2, fy + 2, gold); },
    shard: () => { c.paint(fx, fy + 1, blue); c.paint(fx + 1, fy + 2, gold); c.paint(fx + 2, fy + 1, blueDark); },
  };
  (filigree[p.filigree] || filigree.dots)();
  // ornament at the upper tip
  const ox = 3, oy = top - 1;
  const ornaments = {
    moon: () => { c.paint(ox + 1, oy, blue); c.paint(ox + 2, oy + 1, blue); c.paint(ox + 1, oy + 2, blue); },
    star: () => { c.paint(ox + 1, oy, gold); c.paint(ox, oy + 1, gold); c.paint(ox + 2, oy + 1, gold); c.paint(ox + 1, oy + 2, gold); },
    comet: () => { c.paint(ox + 1, oy, gold); c.paint(ox + 2, oy + 1, shade(gold, -20)); c.paint(ox + 3, oy + 2, shade(gold, -34)); },
    eclipse: () => { c.paint(ox + 1, oy, rgb('#2a2436')); c.paint(ox + 1, oy + 1, gold); },
    crescent: () => { c.paint(ox + 1, oy, silver); c.paint(ox + 2, oy + 1, silver); },
    nebula: () => { c.paint(ox + 1, oy, rgb('#8f6fd8')); c.paint(ox + 2, oy + 1, rgb('#5f6fd8')); },
    aurora: () => { c.paint(ox + 1, oy, rgb('#63e0c3')); c.paint(ox + 2, oy + 1, rgb('#8f6fd8')); },
    sun: () => { c.paint(ox + 1, oy, gold); c.paint(ox, oy, shade(gold, 22)); c.paint(ox + 2, oy, shade(gold, 22)); },
    constellation: () => { c.paint(ox, oy, silver); c.paint(ox + 2, oy + 1, silver); c.paint(ox + 1, oy + 2, silver); },
    halo: () => { c.paint(ox, oy + 1, gold); c.paint(ox + 2, oy + 1, gold); c.paint(ox + 1, oy, gold); },
    meteor: () => { c.paint(ox + 1, oy, rgb('#e07a4a')); c.paint(ox + 2, oy + 1, rgb('#8a4a2a')); },
    gem: () => { c.paint(ox + 1, oy, rgb('#4c8fe0')); c.paint(ox + 1, oy + 1, rgb('#8fb8ee')); },
    radiant: () => { c.paint(ox + 1, oy, gold); c.paint(ox + 1, oy + 2, gold); c.paint(ox, oy + 1, shade(gold, 20)); },
    void: () => { c.paint(ox + 1, oy, rgb('#2a2436')); c.paint(ox + 2, oy + 1, rgb('#5a3a76')); },
  };
  (ornaments[p.ornament] || ornaments.star)();
  return c;
}

/* ---------- shield ---------- */
function drawShield(c, p, pal) {
  const body = rgb(pal.body), bodyLight = rgb(pal.bodyLight);
  const bronze = rgb(pal.bronze), bronzeDark = rgb(pal.bronzeDark);
  const turquoise = rgb(pal.turquoise), silver = rgb(pal.silver);
  const inRim = (x, y) => {
    const cx = 7.5, cy = 7.5;
    const dx = Math.abs(x - cx), dy = Math.abs(y - cy);
    if (p.rim === 'round') return dx * dx + dy * dy <= 30;
    if (p.rim === 'hex') return dx + dy * 0.72 <= 6.1;
    if (p.rim === 'kite') return (dx <= 4.6 - (y - 2) * 0.11 && y >= 1 && y <= 14) || (y > 8 && dx <= 5 - (y - 8) * 0.75);
    return dx * dx + dy * dy <= 26;
  };
  const edgeOf = (x, y) => inRim(x, y) && (!inRim(x + 1, y) || !inRim(x - 1, y) || !inRim(x, y + 1) || !inRim(x, y - 1));
  for (let y = 1; y <= 14; y++) {
    for (let x = 1; x <= 14; x++) {
      if (!inRim(x, y)) continue;
      let color = y < 8 ? bodyLight : body;
      if (edgeOf(x, y)) color = bronze;
      if (p.frame === 'double' && edgeOf(x, y)) color = bronzeDark;
      if (p.frame === 'double' && inRim(x, y) && !edgeOf(x, y) && (edgeOf(x + 1, y) || edgeOf(x, y + 1))) color = bronze;
      c.paint(x, y, c.grain(x, y, color, 7));
    }
  }
  const ward = (x, y, color) => { if (inRim(x, y)) c.paint(x, y, color); };
  const wards = {
    crescent: () => { for (let i = -2; i <= 2; i++) ward(7 + i, 5 + Math.abs(i), silver); },
    spiral: () => { ward(7, 7, silver); ward(8, 7, silver); ward(8, 8, silver); ward(7, 8, silver); ward(6, 8, silver); ward(6, 9, silver); },
    eye: () => { ward(5, 7, silver); ward(6, 6, silver); ward(7, 5, silver); ward(8, 6, silver); ward(9, 7, silver); ward(8, 8, silver); ward(7, 9, silver); ward(6, 8, silver); ward(7, 7, turquoise); },
    knot: () => { ward(7, 6, silver); ward(8, 7, silver); ward(6, 8, silver); ward(7, 9, silver); ward(9, 8, silver); },
    cross: () => { for (let i = 3; i <= 12; i++) { ward(i, 7, silver); ward(7, i, silver); } },
    serpent: () => { for (let i = 0; i < 6; i++) ward(4 + i, 5 + Math.round(Math.sin(i) * 2), turquoise); },
    star: () => { for (let i = 0; i < 4; i++) { ward(7 - i, 7 - i, silver); ward(7 + i, 7 - i, silver); ward(7 - i, 7 + i, silver); ward(7 + i, 7 + i, silver); } ward(7, 7, silver); },
    sun: () => { for (const [dx, dy] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]) ward(7 + dx, 7 + dy, turquoise); },
    waves: () => { for (let i = 0; i < 4; i++) { ward(5 + i, 6, turquoise); ward(8 - i, 9, turquoise); } },
    lotus: () => { ward(7, 6, turquoise); ward(6, 8, turquoise); ward(8, 8, turquoise); ward(5, 9, silver); ward(9, 9, silver); },
    triangle: () => { for (let i = 0; i < 4; i++) { ward(7 - i, 9 - i, silver); ward(7 + i, 9 - i, silver); } ward(4, 9, silver); ward(3, 9, silver); ward(11, 9, silver); ward(12, 9, silver); },
    ring: () => { for (const [dx, dy] of [[0, -2], [1, -1], [2, 0], [1, 1], [0, 2], [-1, 1], [-2, 0], [-1, -1]]) ward(7 + dx, 7 + dy, turquoise); },
  };
  (wards[p.ward] || wards.ring)();
  const boss = { ring: turquoise, dot: silver }[p.boss];
  if (boss) { c.paint(7, 7, boss); c.paint(8, 8, shade(boss, -18)); }
  const glyphs = {
    crown: () => { ward(6, 3, bronze); ward(8, 3, bronze); ward(7, 2, bronze); },
    moon: () => { ward(2, 3, silver); ward(3, 3, silver); ward(3, 4, silver); },
    rays: () => { for (let i = 0; i < 3; i++) { ward(3 + i, 3 + i, silver); ward(12 - i, 3 + i, silver); } },
    runes: () => { ward(3, 12, silver); ward(5, 12, silver); ward(10, 12, silver); ward(12, 12, silver); },
  };
  if (glyphs[p.glyph]) glyphs[p.glyph]();
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

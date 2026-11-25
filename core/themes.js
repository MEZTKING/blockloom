/* Deterministic 16-motif theme sheets. No DOM, canvas, network, or AI. */
export const THEME_ENGINE_VERSION = '1.0.0';

export const THEMES = [
  {
    id: 'brass_checker', name: 'Brass Checker', prompt: 'black and white checkerboard tiles with brass trim',
    palette: { dark: '#292a2d', light: '#d6cfc4', accent: '#a37b35', shadow: '#777066' },
    motifs: [
      ['classic_brass_checker', 'Classic Brass Checker', 'checker'], ['wide_brass_border', 'Wide Brass Border', 'border'],
      ['fine_brass_grid', 'Fine Brass Grid', 'grid'], ['beveled_chess_tiles', 'Beveled Chess Tiles', 'checker'],
      ['aged_brass_checker', 'Aged Brass Checker', 'checker'], ['double_brass_trim', 'Double Brass Trim', 'border'],
      ['diamond_checker_tiles', 'Diamond Checker Tiles', 'diamond'], ['inset_brass_squares', 'Inset Brass Squares', 'tile'],
      ['polished_brass_checker', 'Polished Brass Checker', 'checker'], ['shadowed_tile_grid', 'Shadowed Tile Grid', 'grid'],
      ['ivory_black_mosaic', 'Ivory / Black Mosaic', 'mosaic'], ['crossband_checkerboard', 'Crossband Checkerboard', 'bands'],
      ['corner_rivet_tiles', 'Corner Rivet Tiles', 'rivet'], ['octagonal_checker_tiles', 'Octagonal Checker Tiles', 'octagon'],
      ['patina_brass_checker', 'Patina Brass Checker', 'checker'], ['grand_hall_checker', 'Grand Hall Checker', 'checker'],
    ],
  },
  {
    id: 'gold_marble', name: 'Gold Marble', prompt: 'white marble with gold inlay',
    palette: { dark: '#b9b4ae', light: '#e5e0d9', accent: '#b38633', shadow: '#d1ccc6' },
    motifs: [
      ['veined_marble', 'Veined Marble', 'vein'], ['gold_cross_marble', 'Gold Cross Marble', 'cross'],
      ['sunburst_marble', 'Sunburst Marble', 'starburst'], ['geometric_marble', 'Geometric Marble', 'medallion'],
      ['diagonal_gold_marble', 'Diagonal Gold Marble', 'diamond'], ['bordered_marble', 'Bordered Marble', 'border'],
      ['marble_medallion', 'Marble Medallion', 'medallion'], ['gold_diamond_marble', 'Gold Diamond Marble', 'diamond'],
      ['crowned_marble', 'Crowned Marble', 'crown'], ['greek_key_marble', 'Greek Key Marble', 'greek'],
      ['marble_starburst', 'Marble Starburst', 'starburst'], ['gold_grid_marble', 'Gold Grid Marble', 'grid'],
      ['floral_marble', 'Floral Marble', 'floral'], ['marble_chevron', 'Marble Chevron', 'chevron'],
      ['gold_rosette_marble', 'Gold Rosette Marble', 'rosette'], ['cracked_gold_marble', 'Cracked Gold Marble', 'vein'],
    ],
  },
  {
    id: 'aztec_temple', name: 'Aztec Temple', prompt: 'sunken aztec temple with turquoise mosaics and gold glyphs',
    palette: { dark: '#5a432c', light: '#cda558', accent: '#057d76', gold: '#c88c3a', shadow: '#8d6f45' },
    motifs: [
      ['weathered_temple_sandstone', 'Weathered Temple Sandstone', 'stone'], ['turquoise_mosaic_tile', 'Turquoise Mosaic Tile', 'mosaic'],
      ['gold_glyph_sandstone', 'Gold Glyph Sandstone', 'glyph'], ['carved_sun_stone', 'Carved Sun Stone', 'starburst'],
      ['jaguar_relief_block', 'Jaguar Relief Block', 'relief'], ['feathered_serpent_tile', 'Feathered Serpent Tile', 'serpent'],
      ['sacrificial_altar_stone', 'Sacrificial Altar Stone', 'altar'], ['temple_stair_block', 'Temple Stair Block', 'stair'],
      ['flooded_stone_brick', 'Flooded Stone Brick', 'bricks'], ['mossy_sandstone_brick', 'Mossy Sandstone Brick', 'bricks'],
      ['obsidian_waterline_block', 'Obsidian Waterline Block', 'waterline'], ['turquoise_border_tile', 'Turquoise Border Tile', 'border'],
      ['gold_inlay_floor', 'Gold Inlay Floor', 'inlay'], ['cracked_glyph_stone', 'Cracked Glyph Stone', 'glyph'],
      ['pillar_carving_block', 'Pillar Carving Block', 'pillar'], ['ceremonial_pattern_tile', 'Ceremonial Pattern Tile', 'ceremony'],
    ],
  },
  {
    id: 'celestial', name: 'Celestial', prompt: 'sky blue and white, city of heaven above the clouds',
    palette: { dark: '#9eaebf', light: '#f4f2ee', accent: '#78b4e9', gold: '#e5c775', shadow: '#c6d2df' },
    motifs: [
      ['cloud_marble', 'Cloud Marble', 'stone'], ['azure_bricks', 'Azure Bricks', 'bricks'],
      ['pearl_tiles', 'Pearl Tiles', 'tile'], ['halo_mosaic', 'Halo Mosaic', 'mosaic'],
      ['skyline_panels', 'Skyline Panels', 'tile'], ['winged_carving', 'Winged Carving', 'wing'],
      ['starburst_stone', 'Starburst Stone', 'starburst'], ['heavenly_pillars', 'Heavenly Pillars', 'pillar'],
      ['nimbus_bands', 'Nimbus Bands', 'bands'], ['celestial_cobble', 'Celestial Cobble', 'cobble'],
      ['blue_goldstone', 'Blue Goldstone', 'goldstone'], ['cloudstep_stairs', 'Cloudstep Stairs', 'stair'],
      ['radiant_trim', 'Radiant Trim', 'border'], ['choir_wall', 'Choir Wall', 'tile'],
      ['sunlit_pavement', 'Sunlit Pavement', 'stone'], ['angelic_gate', 'Angelic Gate', 'gate'],
    ],
  },
];

const THEME_BY_ID = new Map(THEMES.map((theme) => [theme.id, theme]));
const MOTIF_BY_KEY = new Map();
for (const theme of THEMES) for (const [id, name, kind] of theme.motifs) MOTIF_BY_KEY.set(`${theme.id}/${id}`, { id, name, kind });

function hash(x, y, seed, salt = 0) {
  let h = Math.imul((x | 0) + 0x9e3779b9, 0x85ebca6b);
  h ^= Math.imul((y | 0) + 0x7f4a7c15, 0xc2b2ae35);
  h ^= Math.imul((seed | 0) + 0x27d4eb2f + salt * 0x165667b1, 0x9e3779b1);
  h = Math.imul(h ^ (h >>> 15), 0x2c1b3c6d);
  h ^= h >>> 12;
  return (h >>> 0) / 4294967295;
}

function rgb(hex) {
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
}

function mix(a, b, t) {
  return [Math.round(a[0] + (b[0] - a[0]) * t), Math.round(a[1] + (b[1] - a[1]) * t), Math.round(a[2] + (b[2] - a[2]) * t)];
}

function shade(c, amount) {
  return c.map((value) => Math.max(0, Math.min(255, value + amount)));
}

function paletteOf(theme) {
  const p = theme.palette;
  return { dark: rgb(p.dark), light: rgb(p.light), accent: rgb(p.accent), shadow: rgb(p.shadow || p.dark), gold: rgb(p.gold || p.accent) };
}

function fillBase(ctx, lightBias = 0.36) {
  for (let y = 0; y < ctx.size; y++) {
    for (let x = 0; x < ctx.size; x++) {
      const n = hash(x, y, ctx.seed, 1);
      const v = lightBias + (n - 0.5) * 0.32;
      ctx.put(x, y, mix(ctx.p.dark, ctx.p.light, Math.max(0, Math.min(1, v))));
    }
  }
}

function motifChecker(ctx) {
  fillBase(ctx, 0.5);
  const block = ctx.size / 2;
  for (let y = 0; y < ctx.size; y++) for (let x = 0; x < ctx.size; x++) {
    const on = (x < block) !== (y < block);
    let c = on ? ctx.p.light : ctx.p.dark;
    if ((x % block === 0) || (y % block === 0)) c = ctx.p.accent;
    if (hash(x, y, ctx.seed, 7) > 0.84) c = shade(c, on ? -8 : 10);
    ctx.put(x, y, c);
  }
}

function motifBorder(ctx) {
  fillBase(ctx, 0.55);
  const w = 2;
  for (let y = 0; y < ctx.size; y++) for (let x = 0; x < ctx.size; x++) {
    if (x < w || y < w || x >= ctx.size - w || y >= ctx.size - w) ctx.put(x, y, ctx.p.accent);
    else if (x === w || y === w || x === ctx.size - w - 1 || y === ctx.size - w - 1) ctx.put(x, y, ctx.p.dark);
  }
  for (let i = 3; i < ctx.size - 3; i += 5) { ctx.put(i, 2, ctx.p.gold); ctx.put(i, ctx.size - 3, ctx.p.gold); }
}

function motifGrid(ctx) {
  fillBase(ctx, 0.58);
  for (let y = 0; y < ctx.size; y++) for (let x = 0; x < ctx.size; x++) {
    if (x % 4 === 0 || y % 4 === 0) ctx.put(x, y, ctx.p.accent);
    if ((x % 4 === 0 || y % 4 === 0) && hash(x, y, ctx.seed, 8) > 0.92) ctx.put(x, y, ctx.p.gold);
  }
}

function motifDiamond(ctx) {
  fillBase(ctx, 0.5);
  const s = ctx.size;
  for (let y = 0; y < s; y++) for (let x = 0; x < s; x++) {
    const d = (x + y) % 8;
    const e = (x - y + s) % 8;
    if (d === 0 || e === 0) ctx.put(x, y, ctx.p.accent);
    else if (d < 3 && e < 3) ctx.put(x, y, ctx.p.light);
    else ctx.put(x, y, ctx.p.dark);
  }
}

function motifOctagon(ctx) {
  fillBase(ctx, 0.5);
  const s = ctx.size;
  for (let y = 0; y < s; y++) for (let x = 0; x < s; x++) {
    const tx = x % 8, ty = y % 8;
    if (tx === 0 || ty === 0) ctx.put(x, y, ctx.p.accent);
    else if ((tx === 1 || tx === 7 || ty === 1 || ty === 7) && (tx + ty > 1 && tx + ty < 15)) ctx.put(x, y, ctx.p.dark);
    else if (tx < 3 || ty < 3 || tx > 5 || ty > 5) ctx.put(x, y, ctx.p.dark);
    else ctx.put(x, y, ctx.p.light);
  }
}

function motifMosaic(ctx) {
  const tile = 4;
  for (let y = 0; y < ctx.size; y++) for (let x = 0; x < ctx.size; x++) {
    const tx = Math.floor(x / tile), ty = Math.floor(y / tile);
    const t = hash(tx, ty, ctx.seed, 4);
    let c = t > 0.64 ? ctx.p.accent : t > 0.32 ? ctx.p.light : ctx.p.dark;
    if (x % tile === 0 || y % tile === 0) c = shade(ctx.p.gold, 6);
    if (hash(x, y, ctx.seed, 5) > 0.9) c = shade(c, 8);
    ctx.put(x, y, c);
  }
}

function motifVein(ctx) {
  fillBase(ctx, 0.72);
  for (let y = 0; y < ctx.size; y++) for (let x = 0; x < ctx.size; x++) {
    const v = Math.abs(Math.sin((x + y * 1.7 + ctx.seed * 0.03) * 0.9));
    const w = Math.abs(Math.sin((x * 1.3 - y + ctx.seed * 0.02) * 0.7));
    if (v > 0.94 || w > 0.965) ctx.put(x, y, ctx.p.accent);
    else if (v > 0.86 || w > 0.9) ctx.put(x, y, ctx.p.shadow);
  }
}

function motifCross(ctx) {
  fillBase(ctx, 0.7);
  const s = ctx.size, c = (s - 1) / 2;
  for (let y = 0; y < s; y++) for (let x = 0; x < s; x++) {
    const dx = Math.abs(x - c), dy = Math.abs(y - c);
    if (dx < 1.2 || dy < 1.2) ctx.put(x, y, ctx.p.accent);
    else if (dx + dy > 6.2 && dx + dy < 7.2) ctx.put(x, y, ctx.p.gold);
  }
  for (const [x, y] of [[0, 0], [s - 1, 0], [0, s - 1], [s - 1, s - 1]]) ctx.put(x, y, ctx.p.accent);
}

function motifStarburst(ctx) {
  fillBase(ctx, 0.68);
  const s = ctx.size, c = (s - 1) / 2;
  for (let y = 0; y < s; y++) for (let x = 0; x < s; x++) {
    const dx = x - c, dy = y - c;
    const r = Math.sqrt(dx * dx + dy * dy);
    const a = Math.atan2(dy, dx);
    const ray = Math.abs(Math.sin(a * 4)) > 0.86;
    if (ray && r < 8) ctx.put(x, y, ctx.p.accent);
    else if (r < 2.4) ctx.put(x, y, ctx.p.gold);
    else if (r > 6.6 && r < 7.4) ctx.put(x, y, ctx.p.gold);
  }
}

function motifMedallion(ctx) {
  fillBase(ctx, 0.66);
  const s = ctx.size, c = (s - 1) / 2;
  for (let y = 0; y < s; y++) for (let x = 0; x < s; x++) {
    const dx = Math.abs(x - c), dy = Math.abs(y - c);
    if (dx + dy < 2.4) ctx.put(x, y, ctx.p.gold);
    else if (dx + dy > 4 && dx + dy < 5) ctx.put(x, y, ctx.p.accent);
    else if (dx + dy > 6 && dx + dy < 6.8) ctx.put(x, y, ctx.p.accent);
  }
}

function motifChevron(ctx) {
  fillBase(ctx, 0.58);
  for (let y = 0; y < ctx.size; y++) for (let x = 0; x < ctx.size; x++) {
    const k = (x + Math.abs((y % 8) - 4) * 2) % 8;
    if (k < 2) ctx.put(x, y, ctx.p.accent);
    else if (k === 4) ctx.put(x, y, ctx.p.dark);
  }
}

function motifGreek(ctx) {
  fillBase(ctx, 0.64);
  for (let y = 0; y < ctx.size; y++) for (let x = 0; x < ctx.size; x++) {
    const tx = x % 8, ty = y % 8;
    const key = (tx === 1 && ty > 1 && ty < 6) || (ty === 5 && tx > 1 && tx < 6) || (tx === 5 && ty > 5) || (ty === 1 && tx > 5);
    if (key) ctx.put(x, y, ctx.p.accent);
    if ((x === 0 || y === 0) && (x + y) % 4 === 0) ctx.put(x, y, ctx.p.gold);
  }
}

function motifFloral(ctx) {
  fillBase(ctx, 0.7);
  const s = ctx.size;
  for (let y = 0; y < s; y++) for (let x = 0; x < s; x++) {
    const cx = (x + 2) % 8, cy = (y + 2) % 8;
    const dx = cx - 4, dy = cy - 4;
    const r = dx * dx + dy * dy;
    if (r < 1.5) ctx.put(x, y, ctx.p.gold);
    else if (r > 3 && r < 5 && ((x + y) % 2 === 0)) ctx.put(x, y, ctx.p.accent);
  }
}

function motifGlyph(ctx) {
  fillBase(ctx, 0.62);
  for (let y = 3; y < ctx.size - 3; y++) for (let x = 3; x < ctx.size - 3; x++) {
    const tx = (x + y) % 6, ty = (x - y + 16) % 6;
    if (tx < 2 || ty < 2 || (x % 4 === 0 && y % 4 === 0)) ctx.put(x, y, ctx.p.accent);
    if (x === 7 || y === 7) ctx.put(x, y, ctx.p.gold);
  }
}

function motifRelief(ctx) {
  fillBase(ctx, 0.45);
  const s = ctx.size;
  for (let y = 0; y < s; y++) for (let x = 0; x < s; x++) {
    const mx = Math.min(x, s - 1 - x), my = Math.min(y, s - 1 - y);
    if (mx === 0 || my === 0 || mx === 1) ctx.put(x, y, ctx.p.accent);
    if ((mx === 2 && my > 2) || (my === 2 && mx > 2)) ctx.put(x, y, ctx.p.gold);
    if (y > 4 && y < 11 && x > 3 && x < 12 && (x % 3 === 0 || y === 7)) ctx.put(x, y, ctx.p.dark);
  }
}

function motifSerpent(ctx) {
  fillBase(ctx, 0.35);
  for (let y = 0; y < ctx.size; y++) for (let x = 0; x < ctx.size; x++) {
    const wy = Math.round(7 + Math.sin((x + ctx.seed * 0.01) * 0.8) * 4);
    if (Math.abs(y - wy) <= 1) ctx.put(x, y, ctx.p.accent);
    if (Math.abs(y - wy) === 2) ctx.put(x, y, ctx.p.gold);
  }
}

function motifAltar(ctx) {
  fillBase(ctx, 0.4);
  const s = ctx.size;
  for (let y = 0; y < s; y++) for (let x = 0; x < s; x++) {
    const step = Math.min(x, s - 1 - x, y, s - 1 - y);
    if (step === 0) ctx.put(x, y, ctx.p.gold);
    if (step === 1) ctx.put(x, y, ctx.p.accent);
    if (step > 2 && step < 5) ctx.put(x, y, ctx.p.dark);
    if (x > 5 && x < 10 && y > 5 && y < 10) ctx.put(x, y, ctx.p.light);
  }
}

function motifStair(ctx) {
  fillBase(ctx, 0.45);
  for (let y = 0; y < ctx.size; y++) for (let x = 0; x < ctx.size; x++) {
    const band = Math.floor(y / 4);
    const shift = band * 4;
    if ((x + shift) % 8 < 2) ctx.put(x, y, ctx.p.light);
    else if (y % 4 === 0) ctx.put(x, y, ctx.p.accent);
    else ctx.put(x, y, ctx.p.dark);
  }
}

function motifBricks(ctx) {
  fillBase(ctx, 0.42);
  const rowH = 4, brickW = 8;
  for (let y = 0; y < ctx.size; y++) for (let x = 0; x < ctx.size; x++) {
    const row = Math.floor(y / rowH), off = (row % 2) * 4;
    if (y % rowH === 0 || (x + off) % brickW === 0) ctx.put(x, y, ctx.p.shadow);
    else ctx.put(x, y, mix(ctx.p.dark, ctx.p.light, 0.35 + hash(Math.floor((x + off) / brickW), row, ctx.seed, 2) * 0.3));
  }
}

function motifTile(ctx) {
  fillBase(ctx, 0.55);
  for (let y = 0; y < ctx.size; y++) for (let x = 0; x < ctx.size; x++) {
    if (x % 8 === 0 || y % 8 === 0) ctx.put(x, y, ctx.p.accent);
    else if (x % 8 === 1 || y % 8 === 1) ctx.put(x, y, ctx.p.dark);
  }
}

function motifStone(ctx) {
  fillBase(ctx, 0.45);
  for (let y = 0; y < ctx.size; y++) for (let x = 0; x < ctx.size; x++) {
    if (hash(x, y, ctx.seed, 11) > 0.9) ctx.put(x, y, ctx.p.accent);
    else if (hash(x, y, ctx.seed, 12) > 0.82) ctx.put(x, y, ctx.p.shadow);
  }
}

function motifCobble(ctx) {
  fillBase(ctx, 0.35);
  for (let y = 0; y < ctx.size; y++) for (let x = 0; x < ctx.size; x++) {
    const cell = hash(Math.floor(x / 4) + 9, Math.floor(y / 4) + 3, ctx.seed, 13);
    let c = mix(ctx.p.dark, ctx.p.light, 0.25 + cell * 0.45);
    if (x % 4 === 0 || y % 4 === 0) c = ctx.p.shadow;
    ctx.put(x, y, c);
  }
}

function motifBands(ctx) {
  fillBase(ctx, 0.55);
  for (let y = 0; y < ctx.size; y++) for (let x = 0; x < ctx.size; x++) {
    if (y % 8 === 0 || y % 8 === 1) ctx.put(x, y, ctx.p.accent);
    else if (y % 8 === 2) ctx.put(x, y, ctx.p.gold);
    else if ((x + y) % 16 === 0) ctx.put(x, y, ctx.p.dark);
  }
}

function motifWing(ctx) {
  fillBase(ctx, 0.55);
  const s = ctx.size;
  for (let y = 0; y < s; y++) for (let x = 0; x < s; x++) {
    const mx = Math.min(x, s - 1 - x);
    if (mx + 2 < y && y < 12 && mx < 6) ctx.put(x, y, ctx.p.accent);
    if (mx + 3 === y) ctx.put(x, y, ctx.p.gold);
    if (mx === 4 && y > 4 && y < 11) ctx.put(x, y, ctx.p.dark);
  }
}

function motifPavement(ctx) {
  fillBase(ctx, 0.62);
  for (let y = 0; y < ctx.size; y++) for (let x = 0; x < ctx.size; x++) {
    const checker = (Math.floor(x / 4) + Math.floor(y / 4)) % 2;
    if (x % 4 === 0 || y % 4 === 0) ctx.put(x, y, ctx.p.shadow);
    else if (checker) ctx.put(x, y, ctx.p.light);
  }
}

function motifGate(ctx) {
  fillBase(ctx, 0.4);
  for (let y = 0; y < ctx.size; y++) for (let x = 0; x < ctx.size; x++) {
    const mx = Math.min(x, ctx.size - 1 - x);
    if (mx < 2) ctx.put(x, y, ctx.p.accent);
    if (y < 3 || y > 12) ctx.put(x, y, ctx.p.gold);
    if (x === 7 || x === 8) ctx.put(x, y, ctx.p.gold);
    if (y > 9 && mx > 2 && mx < 6) ctx.put(x, y, ctx.p.dark);
  }
}

function motifInlay(ctx) {
  fillBase(ctx, 0.45);
  for (let y = 0; y < ctx.size; y++) for (let x = 0; x < ctx.size; x++) {
    if (x % 4 === 0 || y % 4 === 0) ctx.put(x, y, ctx.p.gold);
    else if ((x + y) % 8 === 0) ctx.put(x, y, ctx.p.accent);
    else if (x > 5 && x < 10 && y > 5 && y < 10) ctx.put(x, y, ctx.p.dark);
  }
}

function motifPillar(ctx) {
  fillBase(ctx, 0.42);
  for (let y = 0; y < ctx.size; y++) for (let x = 0; x < ctx.size; x++) {
    if (x < 2 || x > 13) ctx.put(x, y, ctx.p.dark);
    if (x === 4 || x === 11) ctx.put(x, y, ctx.p.accent);
    if (x > 5 && x < 10 && y % 8 === 0) ctx.put(x, y, ctx.p.gold);
  }
}

function motifWaterline(ctx) {
  fillBase(ctx, 0.4);
  for (let y = 0; y < ctx.size; y++) for (let x = 0; x < ctx.size; x++) {
    const wy = Math.round(8 + Math.sin(x * 0.65 + ctx.seed * 0.01) * 3);
    if (y === wy) ctx.put(x, y, ctx.p.accent);
    else if (y === wy + 1) ctx.put(x, y, ctx.p.gold);
    else if (y > wy) ctx.put(x, y, mix(ctx.p.dark, ctx.p.accent, 0.18));
  }
}

function motifRosette(ctx) {
  fillBase(ctx, 0.7);
  const s = ctx.size, c = (s - 1) / 2;
  for (let y = 0; y < s; y++) for (let x = 0; x < s; x++) {
    const dx = x - c, dy = y - c;
    const r = Math.sqrt(dx * dx + dy * dy);
    const a = Math.atan2(dy, dx);
    const petal = Math.abs(Math.sin(a * 4)) > 0.82;
    if (petal && r > 2 && r < 6.5) ctx.put(x, y, ctx.p.accent);
    if (r < 1.7) ctx.put(x, y, ctx.p.gold);
    if (r > 6.8 && r < 7.4) ctx.put(x, y, ctx.p.gold);
  }
}

function motifCrown(ctx) {
  fillBase(ctx, 0.62);
  const s = ctx.size;
  for (let y = 0; y < s; y++) for (let x = 0; x < s; x++) {
    if (y === 4 && (x < 3 || x > 12)) ctx.put(x, y, ctx.p.gold);
    if (y > 4 && y < 8 && Math.abs(x - 7.5) < y - 3) ctx.put(x, y, ctx.p.accent);
    if (y === 8) ctx.put(x, y, ctx.p.gold);
    if (y > 8 && y < 12 && (x === 4 || x === 11)) ctx.put(x, y, ctx.p.accent);
  }
}

function motifCeremony(ctx) {
  fillBase(ctx, 0.4);
  for (let y = 0; y < ctx.size; y++) for (let x = 0; x < ctx.size; x++) {
    const ring = Math.max(Math.abs(x - 7.5), Math.abs(y - 7.5));
    if (ring > 3 && ring < 4) ctx.put(x, y, ctx.p.accent);
    if (ring > 6) ctx.put(x, y, ctx.p.gold);
    if ((x === 0 || y === 0) && (x + y) % 4 === 0) ctx.put(x, y, ctx.p.gold);
    if (x > 6 && x < 9 && y > 2 && y < 6) ctx.put(x, y, ctx.p.dark);
  }
}

function motifGoldstone(ctx) {
  motifStone(ctx);
  for (let y = 0; y < ctx.size; y++) for (let x = 0; x < ctx.size; x++) if (hash(x, y, ctx.seed, 22) > 0.88) ctx.put(x, y, ctx.p.gold);
}

const RENDERERS = {
  checker: motifChecker, border: motifBorder, grid: motifGrid, diamond: motifDiamond, octagon: motifOctagon,
  mosaic: motifMosaic, vein: motifVein, cross: motifCross, starburst: motifStarburst, medallion: motifMedallion,
  chevron: motifChevron, greek: motifGreek, floral: motifFloral, glyph: motifGlyph, relief: motifRelief,
  serpent: motifSerpent, altar: motifAltar, stair: motifStair, bricks: motifBricks, tile: motifTile,
  stone: motifStone, cobble: motifCobble, bands: motifBands, wing: motifWing, pavement: motifPavement,
  gate: motifGate, inlay: motifInlay, pillar: motifPillar, waterline: motifWaterline, crown: motifCrown,
  ceremony: motifCeremony, goldstone: motifGoldstone, rivet: motifChecker, shadow: motifGrid, rosette: motifRosette,
};

export function listThemes() {
  return THEMES.map((theme) => ({ id: theme.id, name: theme.name, prompt: theme.prompt, palette: { ...theme.palette }, motifs: theme.motifs.map(([id, name]) => ({ id, name })) }));
}

export function detectTheme(prompt) {
  const text = ` ${String(prompt || '').toLowerCase()} `;
  if (/heaven|celestial|sky city|above the clouds|angelic|nimbus|halo|cloud city/.test(text)) return 'celestial';
  if (/aztec|temple|turquoise|jaguar|serpent|glyph/.test(text)) return 'aztec_temple';
  if (/brass|checker|checkerboard|chess/.test(text)) return 'brass_checker';
  if (/marble|gold inlay|gold leaf/.test(text)) return 'gold_marble';
  return null;
}

export function generateThemeMotif({ themeId, motifId, seed = 1, size = 16 } = {}) {
  const theme = THEME_BY_ID.get(themeId) || THEMES[0];
  const motif = MOTIF_BY_KEY.get(`${theme.id}/${motifId}`) || MOTIF_BY_KEY.get(`${theme.id}/${theme.motifs[0][0]}`);
  const target = Math.max(16, Math.min(64, Math.round(Number(size) || 16)));
  const finalSize = target <= 16 ? 16 : target <= 32 ? 32 : 64;
  const buffer = new Uint8ClampedArray(finalSize * finalSize * 4);
  const p = paletteOf(theme);
  const put = (x, y, color, alpha = 255) => {
    if (x < 0 || y < 0 || x >= 16 || y >= 16) return;
    const i = (y * 16 + x) * 4;
    buffer[i] = color[0]; buffer[i + 1] = color[1]; buffer[i + 2] = color[2]; buffer[i + 3] = alpha;
  };
  const variantSeed = (seed + [...motif.id].reduce((acc, ch) => acc + ch.charCodeAt(0), 0) * 37) >>> 0;
  RENDERERS[motif.kind]?.({ size: 16, seed: variantSeed, p, put });
  if (finalSize !== 16) {
    const scaled = new Uint8ClampedArray(finalSize * finalSize * 4);
    const scale = finalSize / 16;
    for (let y = 0; y < finalSize; y++) for (let x = 0; x < finalSize; x++) {
      const s = (Math.floor(y / scale) * 16 + Math.floor(x / scale)) * 4;
      const d = (y * finalSize + x) * 4;
      scaled[d] = buffer[s]; scaled[d + 1] = buffer[s + 1]; scaled[d + 2] = buffer[s + 2]; scaled[d + 3] = buffer[s + 3];
    }
    return { width: finalSize, height: finalSize, rgba: scaled, recipe: { theme: theme.id, themeName: theme.name, motif: motif.id, motifName: motif.name, seed, size: finalSize, engineVersion: THEME_ENGINE_VERSION }, version: THEME_ENGINE_VERSION };
  }
  return { width: finalSize, height: finalSize, rgba: buffer, recipe: { theme: theme.id, themeName: theme.name, motif: motif.id, motifName: motif.name, seed, size: finalSize, engineVersion: THEME_ENGINE_VERSION }, version: THEME_ENGINE_VERSION };
}

export function generateThemeSheet({ themeId, prompt, seed = 1, size = 16 } = {}) {
  const id = themeId || detectTheme(prompt) || THEMES[0].id;
  const theme = THEME_BY_ID.get(id) || THEMES[0];
  return { theme: { id: theme.id, name: theme.name, palette: { ...theme.palette } }, motifs: theme.motifs.map(([motifId]) => generateThemeMotif({ themeId: theme.id, motifId, seed, size })) };
}

export { THEME_ENGINE_VERSION as version };

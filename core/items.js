/* Deterministic Minecraft item/weapon sprites. No DOM, canvas, network, or AI. */
export const ITEM_ENGINE_VERSION = '1.0.0';

const TEMPLATES = {
  sword: [
    '.............oo.',
    '............obBo',
    '...........obbo.',
    '..........obbo..',
    '.........obbo...',
    '........obbo....',
    '.......obbo.....',
    '......obbo......',
    '.....obbo.......',
    '....ooggoo......',
    '...ohhho........',
    '...ohho.........',
    '..ohho..........',
    '..oHpo..........',
    '...oo...........',
    '................',
  ],
  axe: [
    '................',
    '....oooooo......',
    '...obbbbbbo.....',
    '..obbbbbbbbo....',
    '..obbbbbbbbo....',
    '...obbbbbbo.....',
    '....ooggoo......',
    '......ohho......',
    '......ohho......',
    '......ohho......',
    '......ohho......',
    '......ohho......',
    '......ohho......',
    '......oHpo......',
    '.......oo.......',
    '................',
  ],
  pickaxe: [
    '....oooooooo....',
    '...obbbbbbbbo...',
    '..obbbo.obbbo...',
    '..obbo...obbo...',
    '...oo..oo..oo...',
    '......ohho......',
    '......ohho......',
    '......ohho......',
    '......ohho......',
    '......ohho......',
    '......ohho......',
    '......ohho......',
    '......oHpo......',
    '.......oo.......',
    '................',
    '................',
  ],
  shovel: [
    '.....oooo.......',
    '....obbbbo......',
    '...obbbbbbo.....',
    '...obbbbbbo.....',
    '....obbbbo......',
    '.....oggo.......',
    '......ohho......',
    '......ohho......',
    '......ohho......',
    '......ohho......',
    '......ohho......',
    '......ohho......',
    '......oHpo......',
    '.......oo.......',
    '................',
    '................',
  ],
  bow: [
    '..oooo..........',
    '.obbbbo.........',
    '.ob..obo........',
    'ob....obo.......',
    'ob.....obo......',
    'ob......obo.....',
    'ob.......obo....',
    'ob........ob....',
    'ob.......obo....',
    'ob......obo.....',
    'ob.....obo......',
    'ob....obo.......',
    '.ob..obo........',
    '.obbbo..........',
    '..oo............',
    '................',
  ],
  shield: [
    '..oooooooooo....',
    '.obbbbbbbbbbo...',
    'obbbbbbbbbbbbo..',
    'obbbbbbbbbbbbo..',
    'obbbooobbbbbbo..',
    'obbbbbbbbbbbbo..',
    'obbbooobbbbbbo..',
    'obbbbbbbbbbbbo..',
    'obbbooobbbbbbo..',
    'obbbbbbbbbbbbo..',
    '.obbbbbbbbbbo...',
    '..oooooooooo....',
    '................',
    '................',
    '................',
    '................',
  ],
};

export const ITEM_TYPES = [
  { id: 'sword', name: 'Sword', keywords: ['sword', 'blade'], suffix: 'sword' },
  { id: 'axe', name: 'Axe', keywords: ['axe', 'hatchet'], suffix: 'axe' },
  { id: 'pickaxe', name: 'Pickaxe', keywords: ['pickaxe', 'pick'], suffix: 'pickaxe' },
  { id: 'shovel', name: 'Shovel', keywords: ['shovel', 'spade'], suffix: 'shovel' },
  { id: 'bow', name: 'Bow', keywords: ['bow', 'longbow'], suffix: 'bow', fixedTarget: 'bow' },
  { id: 'shield', name: 'Shield', keywords: ['shield', 'buckler'], suffix: 'shield', fixedTarget: 'shield' },
];

export const ITEM_MATERIALS = [
  { id: 'wood', name: 'Wooden', prefix: 'wooden', base: '#9c713f', light: '#c18e52', dark: '#6d4d2b', handle: '#6b4a2a', handleDark: '#4f351e', outline: '#24170f', guard: '#777777', guardLight: '#a5a5a5', accent: '#8fca43' },
  { id: 'stone', name: 'Stone', prefix: 'stone', base: '#858585', light: '#aaaaaa', dark: '#5e5e5e', handle: '#6b4a2a', handleDark: '#4f351e', outline: '#252525', guard: '#8d8d8d', guardLight: '#bdbdbd', accent: '#b9ee6a' },
  { id: 'iron', name: 'Iron', prefix: 'iron', base: '#d3d3d3', light: '#f1f1f1', dark: '#9a9a9a', handle: '#6b4a2a', handleDark: '#4f351e', outline: '#2a2a2a', guard: '#b9b9b9', guardLight: '#f4f4f4', accent: '#b9ee6a' },
  { id: 'gold', name: 'Golden', prefix: 'golden', base: '#f0c94f', light: '#ffe88a', dark: '#b78b25', handle: '#6b4a2a', handleDark: '#4f351e', outline: '#3b2a0d', guard: '#e9b83b', guardLight: '#fff2a6', accent: '#f7d96a' },
  { id: 'diamond', name: 'Diamond', prefix: 'diamond', base: '#57ddd4', light: '#b8fff8', dark: '#2b9b93', handle: '#6b4a2a', handleDark: '#4f351e', outline: '#103b3b', guard: '#4cc7c1', guardLight: '#c8fffb', accent: '#b9fffb' },
  { id: 'netherite', name: 'Netherite', prefix: 'netherite', base: '#4a3f45', light: '#77666f', dark: '#2c252a', handle: '#3d2b20', handleDark: '#251a12', outline: '#140f12', guard: '#5b4b54', guardLight: '#8e7b86', accent: '#b06dff' },
  { id: 'copper', name: 'Copper', prefix: 'copper', base: '#c06a45', light: '#f2a06b', dark: '#8c4628', handle: '#6b4a2a', handleDark: '#4f351e', outline: '#351b10', guard: '#b56a45', guardLight: '#ffc29b', accent: '#8ed0b5' },
  { id: 'emerald', name: 'Emerald', prefix: 'emerald', base: '#34c86f', light: '#a5ffc9', dark: '#1f7e45', handle: '#6b4a2a', handleDark: '#4f351e', outline: '#102f1d', guard: '#2cb562', guardLight: '#b1ffd2', accent: '#c8ffdf' },
];

const TYPE_BY_ID = new Map(ITEM_TYPES.map((type) => [type.id, type]));
const MATERIAL_BY_ID = new Map(ITEM_MATERIALS.map((material) => [material.id, material]));

function hash(x, y, seed) {
  let h = Math.imul((x | 0) + 0x9e3779b9, 0x85ebca6b);
  h ^= Math.imul((y | 0) + 0x7f4a7c15, 0xc2b2ae35);
  h ^= Math.imul((seed | 0) + 0x27d4eb2f, 0x165667b1);
  h = Math.imul(h ^ (h >>> 15), 0x2c1b3c6d);
  h = Math.imul(h ^ (h >>> 12), 0x297a2d39);
  h ^= h >>> 15;
  return (h >>> 0) / 4294967295;
}

function rgb(hex) {
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
}

function shade(rgbValue, amount) {
  return [
    Math.max(0, Math.min(255, rgbValue[0] + amount)),
    Math.max(0, Math.min(255, rgbValue[1] + amount)),
    Math.max(0, Math.min(255, rgbValue[2] + amount)),
  ];
}

function materialPalette(material, accent) {
  return {
    o: rgb(material.outline),
    b: rgb(material.base),
    B: rgb(material.light),
    d: rgb(material.dark),
    g: rgb(material.guard),
    G: rgb(material.guardLight),
    h: rgb(material.handle),
    H: rgb(material.handleDark),
    p: rgb(accent || material.accent),
    s: [225, 230, 215],
  };
}

export function listItemTypes() {
  return ITEM_TYPES.map(({ id, name, keywords, suffix, fixedTarget }) => ({ id, name, keywords: [...keywords], suffix, fixedTarget: fixedTarget || null }));
}

export function listItemMaterials() {
  return ITEM_MATERIALS.map((material) => ({ ...material }));
}

export function itemTargetId(typeId, materialId) {
  const type = TYPE_BY_ID.get(typeId) || ITEM_TYPES[0];
  if (type.fixedTarget) return type.fixedTarget;
  const material = MATERIAL_BY_ID.get(materialId) || ITEM_MATERIALS[2];
  return `${material.prefix}_${type.suffix}`;
}

/**
 * Generate a deterministic item/weapon sprite.
 * @param {object} [options]
 * @param {'sword'|'axe'|'pickaxe'|'shovel'|'bow'|'shield'} [options.type='sword']
 * @param {string} [options.material='iron']
 * @param {number} [options.seed=1]
 * @param {number} [options.size=16]
 * @param {string} [options.accent]
 * @returns {{width:number,height:number,rgba:Uint8ClampedArray,recipe:object,version:string}}
 */
export function generateItem(options = {}) {
  const type = TYPE_BY_ID.get(options.type) || ITEM_TYPES[0];
  const material = MATERIAL_BY_ID.get(options.material) || ITEM_MATERIALS[2];
  const seed = Math.max(1, Math.min(999999999, Math.round(Number(options.seed) || 1)));
  const requestedSize = Math.max(16, Math.min(64, Math.round(Number(options.size) || 16)));
  const size = requestedSize <= 16 ? 16 : requestedSize <= 32 ? 32 : 64;
  const palette = materialPalette(material, options.accent);
  const source = TEMPLATES[type.id];
  const buffer = new Uint8ClampedArray(size * size * 4);
  const scale = size / 16;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const sx = Math.floor(x / scale);
      const sy = Math.floor(y / scale);
      const char = source[sy]?.[sx] || '.';
      if (char === '.') continue;
      let color = palette[char] || palette.b;
      if (char === 'b' || char === 'B' || char === 'd') {
        const wear = hash(sx, sy, seed);
        if (wear > 0.9) color = shade(color, 16);
        else if (wear < 0.08) color = shade(color, -14);
      }
      const i = (y * size + x) * 4;
      buffer[i] = color[0];
      buffer[i + 1] = color[1];
      buffer[i + 2] = color[2];
      buffer[i + 3] = 255;
    }
  }
  return {
    width: size,
    height: size,
    rgba: buffer,
    recipe: {
      type: type.id,
      typeName: type.name,
      material: material.id,
      materialName: material.name,
      itemId: itemTargetId(type.id, material.id),
      seed,
      size,
      accent: options.accent || material.accent,
      engineVersion: ITEM_ENGINE_VERSION,
    },
    version: ITEM_ENGINE_VERSION,
  };
}

# @blockloom/core v1.2.0

Deterministic Minecraft texture generation with **no DOM, canvas, network, or AI dependency**.

It is the same engine used by the Blockloom app, local bridge, and CLI. Same inputs + same engine version = the same RGBA output.

## Install / import

The package lives in [`core/`](../core) and is published with the `core-v1.5.0` tag. Install the release tarball:

```bash
npm install https://github.com/MEZTKING/blockloom/releases/download/core-v1.5.0/blockloom-core-1.5.0.tgz
```

Or copy `core/` into your project. It is plain ESM with no dependencies.

## API

`generate()` returns one face; `generateSet()` returns the same resolved recipe and all three faces from one seed.

```js
import {
  ENGINE_VERSION,
  generate,
  parsePrompt,
  listMaterials,
  listModifiers,
  MATERIALS,
  MATERIAL_GROUPS,
  FINISHES,
} from '@blockloom/core';
```

### `generate(options)`

```js
const {
  width,
  height,
  rgba,      // Uint8ClampedArray, RGBA, row-major
  recipe,    // resolved recipe including material, seed, finish, version
  version,   // ENGINE_VERSION
} = generate({
  prompt: 'mossy cobblestone with cyan crystals', // or recipe
  seed: 42,
  size: 16,
  face: 'side',        // side | top | bottom
  finish: 'balanced',  // rugged | balanced | smooth
  grain: 58,
  contrast: 55,
  hue: 0,
});
```

`recipe` may be a material id, a material object from `listMaterials()`, or an explicit object:

```js
generate({
  recipe: {
    materialId: 'stained_glass_blue',
    modifiers: ['glowing'],
    accent: '#61d7ff',
    tint: '#4b8fe8',
  },
  seed: 7,
  size: 32,
});
```

`prompt` and `recipe` can be combined; explicit recipe fields win.

### Weapons and items

```js
import { generateItem, listItemTypes, listItemMaterials } from '@blockloom/core';

const item = generateItem({
  type: 'sword',       // sword | axe | pickaxe | shovel | bow | shield
  material: 'diamond', // wood | stone | iron | gold | diamond | netherite | copper | emerald
  seed: 42,
  size: 16,
});
item.rgba;             // transparent RGBA
item.recipe.itemId;    // 'diamond_sword'
item.version;          // ITEM_ENGINE_VERSION
```

Item sprites are deterministic 16×16 templates scaled to 16/32/64. `core/item-golden.json` pins 12 item hashes. `ITEM_ENGINE_VERSION` is separate from the block `ENGINE_VERSION`.

## Item motif sheets

```js
import { listItemThemes, generateItemThemeSheet, generateItemMotif } from '@blockloom/core';

listItemThemes().forEach((t) => console.log(t.id, t.motifs.length));
const sheet = generateItemThemeSheet({ themeId: 'royal_sword', seed: 42, size: 16 });
sheet.motifs.length; // 16
generateItemMotif({ themeId: 'rune_shield', motifId: 'crescent_glyph', size: 16 }).recipe.motifName;
```

Five component-built families, 16 motifs each:

- `royal_sword` — blade, guard, grip, pommel, gem, inlay
- `runic_pickaxe` — head arc, binding, rune script, haft, gem
- `jade_axe` — lobe/wedge head, bronze edge, binding, inset, haft
- `celestial_bow` — limb arc, string, grip, filigree, tip ornament
- `rune_shield` — rim, frame, ward, glyph, boss

All sprites are transparent 16×16 cut-outs. `ITEM_THEME_ENGINE_VERSION = 1.0.0`; `core/itemtheme-golden.json` pins 80 hashes. Sizes 32/64 are whole-pixel scales, not native detail.

## Theme sheets

```js
import { THEMES, detectTheme, generateThemeSheet, generateThemeMotif } from '@blockloom/core';

detectTheme('black and white checkerboard tiles with brass trim'); // 'brass_checker'
const sheet = generateThemeSheet({ themeId: 'brass_checker', seed: 42, size: 16 });
sheet.motifs.length; // 16
sheet.motifs[0].recipe.motifName;
```

Four families, each with 16 distinct motif slots:

- `brass_checker`
- `gold_marble`
- `aztec_temple`
- `celestial`

`THEME_ENGINE_VERSION = 1.0.0`; `core/theme-golden.json` pins 16 hashes.

## Prompt themes

The parser recognises a small semantic theme layer:

- `celestial` — words such as `heaven`, `city of heaven`, `celestial`, `sky city`, `above the clouds`, `angelic`, `nimbus`, `halo`.
- If no material is named, it resolves to **Marble** (`#bfbcb8` base) and adds a sky-blue accent plus a restrained blue-white vein overlay.
- The resolved `recipe.theme` is recorded in JSON and cache metadata.

This is the first theme-specific path. It is not yet a full 16-motif architectural generator.

## Other exports

```js
parsePrompt('oxidized copper block');
// { materialId: 'oxidized_copper', modifiers: [], color: null, ... }

listMaterials(); // 90 recipes: stone, glass, stained glass, wool, concrete, metals, copper stages, leaves…
listModifiers(); // effect vocabulary
listItemTypes();
listItemMaterials();
ENGINE_VERSION;  // '1.0.0'
```

## Browser worker

The core uses no DOM, so it runs directly in a worker:

```js
// texture.worker.js
import { generate } from '/core/index.js';

self.onmessage = (event) => {
  const texture = generate(event.data);
  self.postMessage({
    width: texture.width,
    height: texture.height,
    rgba: texture.rgba,
    recipe: texture.recipe,
    version: texture.version,
  }, [texture.rgba.buffer]);
};
```

```js
const worker = new Worker('/texture.worker.js', { type: 'module' });
worker.onmessage = ({ data }) => {
  const image = new ImageData(new Uint8ClampedArray(data.rgba), data.width, data.height);
  ctx.putImageData(image, 0, 0);
};
worker.postMessage({ prompt: 'frosted oak planks', seed: 9, size: 32, face: 'side' });
```

## Node

```js
import { generate } from '@blockloom/core';
import { writeFile } from 'node:fs/promises';
import { PNG } from 'pngjs';

const texture = generate({ prompt: 'red concrete', seed: 12, size: 16, face: 'side' });
const png = new PNG({ width: texture.width, height: texture.height });
png.data = Buffer.from(texture.rgba);
await writeFile('red_concrete.png', PNG.sync.write(png));
```

No `pngjs` is included in core; any PNG encoder works. The Blockloom bridge includes a dependency-free one in `server/png.mjs`.

## Golden hashes

`core/golden.json` is the machine-readable source of truth used by the golden tests. MSM can read it for its own seed tests:

```js
import golden from '@blockloom/core/golden.json' with { type: 'json' };
// { engineVersion, seed, hash: 'sha256', cases: [{ prompt, face, size, hash }] }
```

## Determinism and versioning

- Same `recipe`, `seed`, `size`, `face`, `finish`, `grain`, `contrast`, `hue`, and `ENGINE_VERSION` → identical bytes.
- `ENGINE_VERSION` increases whenever renderer output changes.
- `tests/golden.test.mjs` pins SHA-256 hashes for 20 representative prompts.
- Do not compare hashes across engine versions without regenerating goldens.

## Recipes as data

[`core/data.js`](../core/data.js) contains the recipe vocabulary:

- 90 materials
- 9 UI families
- 11 effects
- 19 colour words
- 3 finishes

Another app can read `MATERIALS`, `MATERIAL_GROUPS`, `FINISHES`, and `MODIFIERS` directly to build its own picker.

New families include bricks, glass and 16 stained glass colours, 16 wool colours, 16 concrete colours, metal blocks, four copper ageing stages, and transparent cut-out leaves.

## Tiling

Every side texture is generated for 16×16 seamless tiling by default. Tests cover:

- a global seam-sanity ratio,
- one seam test per material family,
- alpha/transparency behavior for glass and cut-out leaves.

## Licence and credit

MIT. Credit: **Blockloom / Lelouch**. The MIT licence in the repository root applies.

## Release

Tag: `core-v1.5.0`

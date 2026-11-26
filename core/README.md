# @blockloom/core

DOM-free deterministic Minecraft texture generation for Blockloom and other apps.

```js
import { generate, listMaterials } from '@blockloom/core';

const texture = generate({
  prompt: 'mossy cobblestone with cyan crystals',
  seed: 42,
  size: 16,
  face: 'side',
});
console.log(texture.width, texture.rgba, texture.version);
```

See [../docs/CORE.md](../docs/CORE.md) for Node, worker, recipe, versioning, and golden-test details.

`generateSet()` returns side, top, and bottom RGBA faces from one recipe/seed. `generateItem()` returns deterministic sword/axe/tool/bow/shield sprites. `generateThemeSheet()` returns 16 distinct motifs for each of four themed palettes. `generateItemThemeSheet()` returns 16 component-built item sprites for each of five families.

MIT licensed. Credit: Blockloom / Lelouch.

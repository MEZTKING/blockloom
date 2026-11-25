# Blockloom Local Texture Bridge

The bridge generates deterministic Minecraft block textures **without AI**. It runs in the existing Node development server, so other local applications can call it over HTTP or invoke the CLI.

## Start

```bash
npm run bridge      # local bridge + studio, AI disabled
# or
npm run dev:noai    # same, from the normal no-AI script
```

Default endpoint: `http://127.0.0.1:4173/api`

The server binds to **127.0.0.1** by default. For LAN access, set `HOST=0.0.0.0` **and** a token.

## Authentication

```bash
BRIDGE_TOKEN=my-secret npm run bridge
```

Send either:

```http
Authorization: Bearer my-secret
```

or:

```http
X-Blockloom-Token: my-secret
```

Without `BRIDGE_TOKEN`, only loopback clients can use the bridge. The token is never included in URLs or logs.

### CORS

- No token: `http://localhost:*`, `http://127.0.0.1:*`, GitHub Pages (`https://meztking.github.io`), and `Origin: null` are allowed.
- With a token: any origin is allowed to preflight, but the actual request must carry the token.
- Restrict exact origins with `BRIDGE_ALLOWED_ORIGINS=https://one.example,https://two.example`.

## Endpoints

| Endpoint | Purpose |
| --- | --- |
| `GET /api` | Human/API reference |
| `GET /api/health` | Status, auth mode, capabilities |
| `GET /api/materials` | Materials, finishes, modifiers, limits |
| `GET /api/generate?...` | One PNG by default, or `format=json` / `format=zip` |
| `POST /api/generate` | JSON recipe |
| `POST /api/batch` | Many textures → one ZIP |
| `GET/POST /api/item` | Deterministic weapon/item sprite PNG or JSON |
| `GET /api/themes` | List four 16-motif theme families |
| `GET/POST /api/theme` | One themed motif PNG or JSON |
| `GET/POST /api/theme-sheet` | ZIP of all 16 motifs for a theme |
| `GET /api/openapi.json` | OpenAPI 3.0 document |

### One PNG

```bash
curl "http://127.0.0.1:4173/api/generate?prompt=mossy%20cobblestone%20with%20cyan%20crystals&seed=42&size=16" -o texture.png
```

Options:

| Parameter | Values |
| --- | --- |
| `prompt` | Natural-language description |
| `material` | `stone`, `cobblestone`, `deepslate`, `oak_planks`, `gold_ore`, … |
| `seed` | Integer; same seed = same texture |
| `size` | 1–512 px; 16/32/64 recommended |
| `finish` | `rugged`, `balanced`, `smooth` |
| `modifiers` | `mossy,cracked,glowing,crystal,...` |
| `accent` | `#rrggbb` overlay accent |
| `tint` | `#rrggbb` base recolour |
| `grain`, `contrast`, `hue` | Tuning values |
| `face` | `side`, `top`, `bottom`, `all` |
| `format` | `png`, `json`, `zip` |
| `download=1` | `Content-Disposition: attachment` |

If `face=all` and no format is supplied, the bridge returns a ZIP.

### JSON recipe

```bash
curl -X POST http://127.0.0.1:4173/api/generate \
  -H 'Authorization: Bearer my-secret' \
  -H 'Content-Type: application/json' \
  -d '{"prompt":"cracked deepslate with glowing amber veins","seed":123,"size":16,"format":"json"}'
```

```json
{
  "ok": true,
  "title": "Cracked Glowing Amber Deepslate",
  "material": { "id": "deepslate", "name": "Deepslate" },
  "seed": 123,
  "size": 16,
  "faces": {
    "side": { "dataUrl": "data:image/png;base64,..." },
    "top": { "dataUrl": "data:image/png;base64,..." },
    "bottom": { "dataUrl": "data:image/png;base64,..." }
  },
  "palette": ["#..."]
}
```

### Texture-set ZIP

```bash
curl "http://127.0.0.1:4173/api/generate?prompt=frosted%20oak%20planks&size=32&format=zip" -o set.zip
```

Contains `side.png`, `top.png`, `bottom.png`, `texture.json`, and `README.txt`.

### Item / weapon sprite

```bash
curl "http://127.0.0.1:4173/api/item?type=sword&material=diamond&seed=42&size=16" -o sword.png
curl "http://127.0.0.1:4173/api/item?type=axe&material=iron&format=json"
```

Types: `sword`, `axe`, `pickaxe`, `shovel`, `bow`, `shield`.
Materials: `wood`, `stone`, `iron`, `gold`, `diamond`, `netherite`, `copper`, `emerald`.

Output is a transparent PNG. The JSON form includes the resolved item id, recipe, and `ITEM_ENGINE_VERSION`. No ZIP is produced for a single item.

### Theme sheets

```bash
curl http://127.0.0.1:4173/api/themes
curl "http://127.0.0.1:4173/api/theme?theme=aztec_temple&motif=jaguar_relief_block" -o jaguar.png
curl "http://127.0.0.1:4173/api/theme-sheet?theme=brass_checker" -o brass.zip
```

Themes: `brass_checker`, `gold_marble`, `aztec_temple`, `celestial`. Each has 16 motif ids. The ZIP writes `assets/minecraft/textures/block/<motif>.png` plus `blockloom-theme.json`.

### Batch

```json
{
  "items": [
    { "id": "mossy", "prompt": "mossy cobblestone", "size": 16 },
    { "id": "amber", "prompt": "cracked deepslate with glowing amber veins", "size": 32 }
  ]
}
```

```bash
curl -X POST http://127.0.0.1:4173/api/batch \
  -H 'Authorization: Bearer my-secret' \
  -H 'Content-Type: application/json' \
  --data-binary @batch.json \
  -o textures.zip
```

The ZIP contains `manifest.json` plus `textures/<id>/side.png`, `top.png`, `bottom.png`, and `texture.json`. Maximum 64 items.

## CLI

```bash
node bin/blockloom.mjs generate --prompt "mossy cobblestone" --size 16 --out texture.png
node bin/blockloom.mjs set --prompt "frosted oak planks" --size 32 --out set.zip
node bin/blockloom.mjs batch --in batch.json --out textures.zip
node bin/blockloom.mjs materials
```

Use `npm run blockloom -- ...` if preferred. The CLI imports the same renderer directly, so no server is needed.

## MCSuperMods / TypeScript integration

A ready-to-copy helper lives at [`examples/mcsupermods-client.ts`](../examples/mcsupermods-client.ts). It uses `fetch` and returns a PNG `Uint8Array` or a full ZIP.

```ts
import { generateBlockTexture } from './mcsupermods-client';

const png = await generateBlockTexture({
  prompt: 'mossy cobblestone with cyan crystals',
  seed: 42,
  size: 16,
});
await fs.writeFile('mossy_cobblestone.png', png);
```

MCSuperMods is TypeScript/Electron. Calling the bridge from its **main process** avoids CORS entirely; calling from the renderer works with the CORS defaults above. Set `BRIDGE_TOKEN` for a shared or remote bridge.

## Recommendation for MCSuperMods

Use the **HTTP bridge** for a running app and the **CLI** for build/CI pipelines:

- Electron main process: call `generateBlockTexture()` from the sample; no CORS involved.
- Electron renderer: same fetch, with the local CORS defaults and optionally `BRIDGE_TOKEN`.
- Mod build scripts: run `node bin/blockloom.mjs batch --in batch.json --out textures.zip` and unpack into `src/main/resources/assets/<modid>/textures/block/`.

The bridge never edits your project directly; it returns PNG/ZIP bytes or writes the CLI output path. That keeps your app in control of asset paths and undo.

## Notes

- No AI provider, account, cloud service, or external request is involved.
- Generated output is deterministic for a given recipe and seed.
- The API is implemented by `server/bridge.mjs`; the CLI uses the same module.
- The Windows/Android Tauri apps do **not** start this HTTP server. Run the Node bridge separately when another application needs the API.

#!/usr/bin/env node
/* Blockloom local texture generator CLI. No server or AI required. */
import { readFile, writeFile } from 'node:fs/promises';
import { parseArgs } from 'node:util';
import {
  batchZip,
  capabilities,
  renderTextureSet,
  serializeTextureSet,
  texturePng,
  textureResultZip,
} from '../server/bridge.mjs';

const HELP = `Blockloom local texture bridge CLI

Usage:
  blockloom generate --prompt "mossy cobblestone" --out texture.png
  blockloom generate --prompt "frosted oak planks" --out set.zip --format zip
  blockloom set --prompt "cracked deepslate" --out texture-set.zip
  blockloom batch --in batch.json --out textures.zip
  blockloom materials

Generate options:
  --prompt <text>       Natural-language prompt
  --material <id>       Explicit material id (stone, cobblestone, deepslate, oak_planks, …)
  --seed <number>       Deterministic seed
  --size <number>       1–512 px (16 / 32 / 64 recommended)
  --finish <id>         rugged | balanced | smooth
  --modifiers <list>    Comma-separated: mossy,cracked,glowing,crystal,…
  --accent <#rrggbb>    Overlay accent
  --tint <#rrggbb>      Base recolour
  --face <face>         side | top | bottom | all
  --format <format>     png | json | zip (inferred from --out extension)
  --out <path>          Output path; stdout when omitted
  --title <text>        Custom title

Batch JSON:
  { "items": [{ "id": "mossy", "prompt": "mossy cobblestone" }, …] }

Server alternative:
  npm run dev       # full studio
  npm run dev:noai  # studio + bridge without AI
  GET http://127.0.0.1:4173/api
`;

function fail(message) {
  console.error(`error: ${message}`);
  process.exitCode = 1;
}

async function writeOutput(buffer, out, binary = true) {
  if (out) {
    await writeFile(out, buffer);
    console.error(`Wrote ${out}`);
  } else if (binary) {
    process.stdout.write(buffer);
  } else {
    process.stdout.write(String(buffer));
  }
}

async function generate(values) {
  const result = renderTextureSet({
    prompt: values.prompt,
    materialId: values.material,
    seed: values.seed,
    size: values.size,
    finish: values.finish,
    grain: values.grain,
    contrast: values.contrast,
    hue: values.hue,
    modifiers: values.modifiers,
    accent: values.accent,
    tint: values.tint,
    face: values.face || 'side',
    title: values.title,
  });
  let format = values.format;
  if (!format) {
    if (values.out?.endsWith('.zip')) format = 'zip';
    else if (values.out?.endsWith('.json')) format = 'json';
    else format = values.face === 'all' ? 'zip' : 'png';
  }
  if (format === 'json') {
    await writeOutput(JSON.stringify(serializeTextureSet(result), null, 2), values.out, false);
    return;
  }
  if (format === 'zip') {
    const { zip, filename } = await textureResultZip(result);
    await writeOutput(zip, values.out, true);
    if (!values.out) console.error(filename);
    return;
  }
  if (format !== 'png') throw new Error('format must be png, json, or zip');
  if (values.face === 'all') throw new Error('format png needs --face side|top|bottom; use --format zip for all faces');
  const face = ['side', 'top', 'bottom'].includes(values.face) ? values.face : 'side';
  await writeOutput(texturePng(result, face), values.out, true);
  if (!values.out) console.error(`${result.filename}_${face}.png`);
}

async function set(values) {
  const result = renderTextureSet({
    prompt: values.prompt,
    materialId: values.material,
    seed: values.seed,
    size: values.size,
    finish: values.finish,
    modifiers: values.modifiers,
    accent: values.accent,
    tint: values.tint,
    title: values.title,
  });
  const out = values.out || 'blockloom_texture_set.zip';
  const { zip } = await textureResultZip(result);
  await writeOutput(zip, out, true);
}

async function batch(values) {
  if (!values.in) throw new Error('batch requires --in <batch.json>');
  const payload = JSON.parse(await readFile(values.in, 'utf8'));
  const items = Array.isArray(payload) ? payload : payload.items;
  const { zip } = await batchZip(items);
  await writeOutput(zip, values.out || 'blockloom_batch.zip', true);
}

async function main() {
  const { values, positionals } = parseArgs({
    args: process.argv.slice(2),
    allowPositionals: true,
    options: {
      prompt: { type: 'string' },
      material: { type: 'string' },
      seed: { type: 'string' },
      size: { type: 'string' },
      finish: { type: 'string' },
      modifiers: { type: 'string' },
      accent: { type: 'string' },
      tint: { type: 'string' },
      grain: { type: 'string' },
      contrast: { type: 'string' },
      hue: { type: 'string' },
      face: { type: 'string' },
      format: { type: 'string' },
      title: { type: 'string' },
      out: { type: 'string' },
      in: { type: 'string' },
      help: { type: 'boolean', short: 'h' },
    },
  });
  const command = positionals[0] || (values.in ? 'batch' : 'generate');
  if (values.help || command === 'help') {
    process.stdout.write(HELP);
    return;
  }
  if (command === 'materials') {
    process.stdout.write(JSON.stringify(capabilities(), null, 2));
    return;
  }
  if (command === 'generate' && !values.prompt && !values.material) {
    throw new Error('generate needs --prompt or --material');
  }
  if (command === 'generate') return generate(values);
  if (command === 'set') {
    if (!values.prompt && !values.material) throw new Error('set needs --prompt or --material');
    return set(values);
  }
  if (command === 'batch') return batch(values);
  throw new Error(`Unknown command “${command}”. Run blockloom help.`);
}

main().catch((error) => fail(error.message || String(error)));

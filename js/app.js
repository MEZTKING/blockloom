import {
  MATERIALS,
  MODIFIERS,
  FINISHES,
  getMaterial,
  parsePrompt,
  renderTexture,
  renderTextureSet,
  textureTitle,
  modifierLabel,
  drawIsoCube,
  downloadBlob,
} from './engine.js';
import { createZip } from './zip.js';
import { fetchAiStatus, generateAiConcept, processAiConcept } from './ai.js';
import { buildResourcePack, packTargetFor } from './resourcepack.js';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

const els = {
  promptForm: $('#promptForm'),
  promptInput: $('#promptInput'),
  charCount: $('#charCount'),
  parsedTags: $('#parsedTags'),
  materialTrigger: $('#materialTrigger'),
  materialName: $('#materialName'),
  materialGroup: $('#materialGroup'),
  materialThumb: $('#materialThumb'),
  materialPopover: $('#materialPopover'),
  materialGrid: $('#materialGrid'),
  closeMaterialPopover: $('#closeMaterialPopover'),
  materialCount: $('#materialCount'),
  popoverCount: $('#popoverCount'),
  finishGroup: $('#finishGroup'),
  finishNote: $('#finishNote'),
  grainRange: $('#grainRange'),
  grainValue: $('#grainValue'),
  contrastRange: $('#contrastRange'),
  contrastValue: $('#contrastValue'),
  hueRange: $('#hueRange'),
  hueValue: $('#hueValue'),
  resetTuning: $('#resetTuning'),
  forgeBtn: $('#forgeBtn'),
  aiBtn: $('#aiBtn'),
  aiBadge: $('#aiBadge'),
  textureTitle: $('#textureTitle'),
  stageViewport: $('#stageViewport'),
  cube: $('#cube'),
  tileCanvas: $('#tileCanvas'),
  seedInput: $('#seedInput'),
  diceBtn: $('#diceBtn'),
  resolutionGroup: $('#resolutionGroup'),
  paletteSwatches: $('#paletteSwatches'),
  downloadPngBtn: $('#downloadPngBtn'),
  downloadSetBtn: $('#downloadSetBtn'),
  downloadPackBtn: $('#downloadPackBtn'),
  copyPngBtn: $('#copyPngBtn'),
  topExportBtn: $('#topExportBtn'),
  variationGrid: $('#variationGrid'),
  rerollBtn: $('#rerollBtn'),
  dnaMaterial: $('#dnaMaterial'),
  dnaFinish: $('#dnaFinish'),
  dnaFinishLabel: $('#dnaFinishLabel'),
  dnaPalette: $('#dnaPalette'),
  variationsSub: $('#variationsSub'),
  modeLabel: $('#modeLabel'),
  resetViewBtn: $('#resetViewBtn'),
  dragHint: $('#dragHint'),
  footerClock: $('#footerClock'),
  howBtn: $('#howBtn'),
  howDialog: $('#howDialog'),
  closeHowBtn: $('#closeHowBtn'),
  dialogCta: $('#dialogCta'),
  toastRegion: $('#toastRegion'),
  aiDialog: $('#aiDialog'),
  closeAiBtn: $('#closeAiBtn'),
  aiForm: $('#aiForm'),
  aiPromptInput: $('#aiPromptInput'),
  aiPromptCount: $('#aiPromptCount'),
  aiProviderName: $('#aiProviderName'),
  aiProviderModel: $('#aiProviderModel'),
  aiProviderState: $('#aiProviderState'),
  aiStatus: $('#aiStatus'),
  aiGenerateBtn: $('#aiGenerateBtn'),
  aiStrength: $('#aiStrength'),
  aiStrengthValue: $('#aiStrengthValue'),
  aiPrivacy: $('#aiPrivacy'),
  aiUnavailable: $('#aiUnavailable'),
  aiSetupMessage: $('#aiSetupMessage'),
};

const FACE_NAMES = ['front', 'back', 'left', 'right', 'top', 'bottom'];
const FINISH_NOTES = {
  rugged: 'Gritty, high-contrast grain',
  balanced: 'Classic pixel density',
  smooth: 'Clean, low-noise surfaces',
};
const USES_ACCENT = ['crystal', 'glowing', 'gilded', 'flecked'];
const MOD_ORDER = ['ancient', 'burned', 'cracked', 'frosted', 'gilded', 'mossy', 'glowing', 'wet', 'flowery'];
const MOD_WORD = {
  ancient: 'ancient',
  burned: 'charred',
  cracked: 'cracked',
  frosted: 'frosted',
  gilded: 'gilded',
  mossy: 'mossy',
  glowing: 'glowing',
  flecked: 'flecked',
  wet: 'wet',
  flowery: 'flowery',
};
const MATERIAL_GROUPS = ['Stone', 'Earth', 'Wood', 'Ores', 'Other'];
const DEFAULT_ACCENT = { name: 'Cyan', hex: '#54e0d8' };

const state = {
  materialId: 'cobblestone',
  seed: 482910,
  size: 16,
  finish: 'balanced',
  grain: 58,
  contrast: 55,
  hue: 0,
  modifiers: ['mossy', 'crystal'],
  accent: { ...DEFAULT_ACCENT },
  promptColor: null,
  textures: null,
  variations: [],
  view: '3d',
  camera: { x: -24, y: -37 },
  packing: false,
  activeDrag: null,
  frameRequest: 0,
  ai: null,
  aiBusy: false,
  aiStatus: null,
  aiStrength: 48,
};

/* ---------- Prompt state ---------- */
function applyParsedPrompt(parsed) {
  if (parsed.materialId) state.materialId = parsed.materialId;
  state.modifiers = [...parsed.modifiers];
  state.promptColor = parsed.color && !parsed.colorAsAccent
    ? { name: parsed.color.name, hue: parsed.color.hue, sat: parsed.color.sat, light: parsed.color.light || 0 }
    : null;

  if (parsed.colorAsAccent && parsed.color) {
    state.accent = { name: parsed.color.name, hex: parsed.color.hex };
  } else if (state.modifiers.includes('crystal')) {
    state.accent = { ...DEFAULT_ACCENT };
  } else if (state.modifiers.includes('flecked')) {
    state.accent = { name: 'Gold', hex: '#e5bf58' };
  } else if (state.modifiers.includes('glowing')) {
    state.accent = { name: 'Lime', hex: '#b9ee6a' };
  } else if (state.modifiers.includes('gilded')) {
    state.accent = { name: 'Gold', hex: '#e9c253' };
  } else {
    state.accent = null;
  }
}

function applyPrompt({ newSeed = true } = {}) {
  clearAiMode({ rerender: false, silent: true });
  const parsed = parsePrompt(els.promptInput.value);
  applyParsedPrompt(parsed);
  if (newSeed) state.seed = randomSeed();
  syncControls();
  updateParsedTags(parsed);
  renderAll({ variations: true, pulse: true });
  if (!parsed.materialId) {
    toast('No material word found — kept ' + getMaterial(state.materialId).name);
  }
}

function composePrompt() {
  const material = getMaterial(state.materialId);
  const adjectives = MOD_ORDER.filter((m) => state.modifiers.includes(m)).map((m) => MOD_WORD[m]);
  const colorPrefix = state.promptColor ? state.promptColor.name.toLowerCase() : '';
  const base = [...adjectives, colorPrefix, material.name.toLowerCase()].filter(Boolean).join(' ');
  let suffix = '';
  if (state.accent) {
    let noun = 'accents';
    if (state.modifiers.includes('crystal')) noun = 'crystals';
    else if (state.modifiers.includes('flecked')) noun = 'flecks';
    else if (state.modifiers.includes('glowing')) noun = 'glow';
    suffix = ` with ${state.accent.name.toLowerCase()} ${noun}`;
  }
  return (base + suffix).slice(0, 90);
}

function updateCharCount() {
  els.charCount.textContent = `${els.promptInput.value.length} / 90`;
}

function chip(text, className, color) {
  const span = document.createElement('span');
  span.className = `parsed-tag ${className}`;
  span.textContent = text;
  if (color) span.style.setProperty('--tag-color', color);
  return span;
}

function updateParsedTags(parsed) {
  els.parsedTags.replaceChildren();
  if (state.ai) {
    els.parsedTags.append(chip('AI concept', 'ai'));
  }
  if (parsed.materialId) {
    els.parsedTags.append(chip(getMaterial(parsed.materialId).name, 'material'));
  }
  for (const id of parsed.modifiers) {
    els.parsedTags.append(chip(modifierLabel(id), 'effect'));
  }
  if (parsed.color) {
    els.parsedTags.append(chip(
      `${parsed.color.name} ${parsed.colorAsAccent ? 'accent' : 'tint'}`,
      'accent',
      parsed.color.hex,
    ));
  }
  if (!parsed.materialId) {
    els.parsedTags.append(chip('No material match', 'muted'));
  }
  if (!parsed.materialId && parsed.modifiers.length === 0 && !parsed.color) {
    els.parsedTags.append(chip('Freeform · current material', 'muted'));
  }
}

function syncControls() {
  const material = getMaterial(state.materialId);
  els.materialName.textContent = material.name;
  els.materialGroup.textContent = `${material.group} family`;

  $$('#finishGroup button').forEach((button) => {
    button.classList.toggle('active', button.dataset.finish === state.finish);
  });
  els.finishNote.textContent = FINISH_NOTES[state.finish];
  $$('#resolutionGroup button').forEach((button) => {
    button.classList.toggle('active', Number(button.dataset.size) === state.size);
  });

  els.grainRange.value = state.grain;
  els.contrastRange.value = state.contrast;
  els.hueRange.value = state.hue;
  els.grainValue.textContent = state.grain;
  els.contrastValue.textContent = state.contrast;
  els.hueValue.textContent = `${state.hue}°`;
  updateRangeFill(els.grainRange);
  updateRangeFill(els.contrastRange);
  updateRangeFill(els.hueRange);

  if (document.activeElement !== els.seedInput) els.seedInput.value = state.seed;
  els.charCount.textContent = `${els.promptInput.value.length} / 90`;
  updateMaterialSelection();
}

function updateRangeFill(range) {
  const min = Number(range.min);
  const max = Number(range.max);
  const value = Number(range.value);
  range.style.setProperty('--val', `${((value - min) / (max - min)) * 100}%`);
}

/* ---------- Rendering ---------- */
function buildParams(seed = state.seed) {
  return {
    materialId: state.materialId,
    seed,
    size: state.size,
    finish: state.finish,
    grain: state.grain,
    contrast: state.contrast,
    hue: state.hue,
    modifiers: [...state.modifiers],
    promptColor: state.promptColor,
    overlayAccent: state.accent?.hex || null,
  };
}

function displayPalette(textures) {
  if (state.ai) return textures.palette.slice(0, 6);
  const used = state.modifiers.some((m) => USES_ACCENT.includes(m));
  const colors = textures.palette.slice(0, used ? 5 : 6);
  if (used && textures.overlayAccentSwatches?.length) colors.push(textures.overlayAccentSwatches[1]);
  return colors.slice(0, 6);
}

function paintScene(textures) {
  const side = textures.side.canvas.toDataURL('image/png');
  const top = textures.top.canvas.toDataURL('image/png');
  const bottom = textures.bottom.canvas.toDataURL('image/png');
  const sources = { front: side, back: side, left: side, right: side, top, bottom };
  for (const name of FACE_NAMES) {
    const face = $(`.face-${name}`, els.cube);
    face.style.backgroundImage = `url("${sources[name]}")`;
  }
}

function drawTilePreview() {
  if (!state.textures) return;
  const canvas = els.tileCanvas;
  const ctx = canvas.getContext('2d');
  const src = state.textures.side.canvas;
  const tileSize = canvas.width / 2;
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let y = 0; y < 2; y++) {
    for (let x = 0; x < 2; x++) {
      ctx.drawImage(src, x * tileSize, y * tileSize, tileSize, tileSize);
    }
  }
}

function paintMaterialThumb() {
  if (!state.textures) return;
  const canvas = els.materialThumb;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(state.textures.side.canvas, 0, 0, canvas.width, canvas.height);
}

function setPalette(target, colors) {
  target.replaceChildren();
  colors.forEach((color) => {
    const swatch = document.createElement('span');
    swatch.style.backgroundColor = color;
    swatch.title = color.toUpperCase();
    target.append(swatch);
  });
}

function updateStageDetails(textures) {
  const aiActive = Boolean(state.ai);
  const title = textureTitle(state.materialId, state.modifiers);
  els.textureTitle.textContent = title;
  document.title = `${title}${aiActive ? ' (AI)' : ''} — Blockloom`;
  els.dnaMaterial.textContent = textures.material.name;
  els.dnaFinishLabel.textContent = aiActive ? 'Origin' : 'Finish';
  els.dnaFinish.textContent = aiActive
    ? 'AI concept'
    : FINISHES.find((f) => f.id === state.finish)?.label || 'Balanced';
  els.aiBadge.hidden = !aiActive;
  els.variationsSub.textContent = aiActive
    ? 'AI cuts · local colour and orientation studies.'
    : 'Six sibling seeds. Same recipe, different surface.';
  if (document.activeElement !== els.seedInput) els.seedInput.value = state.seed;

  const palette = displayPalette(textures);
  setPalette(els.paletteSwatches, palette);
  setPalette(els.dnaPalette, palette);

  paintScene(textures);
  drawTilePreview();
  paintMaterialThumb();
}

function renderCurrentOnly({ pulse = false } = {}) {
  if (state.ai) {
    state.textures = state.ai.textures;
    updateStageDetails(state.textures);
    updateActiveVariation();
    if (pulse) pulseStage();
    return;
  }
  state.textures = renderTextureSet(buildParams());
  updateStageDetails(state.textures);
  updateActiveVariation();
  if (pulse) pulseStage();
}

function renderAll({ variations = true, pulse = false } = {}) {
  if (state.ai) {
    state.textures = state.ai.textures;
    updateStageDetails(state.textures);
    if (variations) renderVariationCards(state.ai.variations);
    else updateActiveVariation();
    if (pulse) pulseStage();
    syncControls();
    return;
  }
  state.textures = renderTextureSet(buildParams());
  updateStageDetails(state.textures);
  if (variations) renderVariations();
  else updateActiveVariation();
  if (pulse) pulseStage();
  syncControls();
}

function pulseStage() {
  els.stageViewport.classList.remove('is-pulsing');
  els.forgeBtn.classList.remove('is-forging');
  void els.stageViewport.offsetWidth;
  els.stageViewport.classList.add('is-pulsing');
  els.forgeBtn.classList.add('is-forging');
  setTimeout(() => {
    els.stageViewport.classList.remove('is-pulsing');
    els.forgeBtn.classList.remove('is-forging');
  }, 620);
}

function scheduleQuickRender() {
  if (state.frameRequest) cancelAnimationFrame(state.frameRequest);
  state.frameRequest = requestAnimationFrame(() => {
    state.frameRequest = 0;
    renderCurrentOnly();
  });
}

/* ---------- Variations ---------- */
function derivedSeeds() {
  const offsets = [211, 487, 881, 1327, 1879, 2473];
  const seeds = offsets.map((offset) => ((state.seed * 17 + offset * 37) % 900000) + 1000);
  return seeds.map((seed, index) => {
    if (seed === state.seed) return seed + index + 1;
    return seed;
  });
}

function renderVariationCards(variations) {
  const fragment = document.createDocumentFragment();
  state.variations = [];

  variations.forEach((variation, index) => {
    const { seed, textures } = variation;
    const accent = variation.accent || textures.side.overlayAccentSwatches?.[1] || textures.side.palette[3];
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'variation-card' + (seed === state.seed ? ' is-current' : '');
    card.dataset.seed = String(seed);
    card.style.setProperty('--i', String(index));
    card.style.setProperty('--accent', accent);
    card.setAttribute('aria-label', `Load variation with seed ${seed}`);
    card.innerHTML = `
      <canvas width="240" height="205" aria-hidden="true"></canvas>
      <span class="variation-meta">
        <span class="variation-seed">#${seed}</span>
        <span class="variation-load">load
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8h9m0 0L9 5m3 3-3 3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </span>
      </span>`;
    const canvas = $('canvas', card);
    drawIsoCube(canvas, { side: textures.side.canvas, top: textures.top.canvas }, { shadow: true, pad: 0.02 });
    fragment.append(card);
    state.variations.push({ seed, textures, accent });
  });

  els.variationGrid.replaceChildren(fragment);
}

function renderVariations() {
  const variations = derivedSeeds().map((seed) => {
    const textures = renderTextureSet(buildParams(seed));
    return {
      seed,
      textures,
      accent: textures.side.overlayAccentSwatches?.[1] || textures.side.palette[3],
    };
  });
  renderVariationCards(variations);
}

function updateActiveVariation() {
  $$('.variation-card', els.variationGrid).forEach((card) => {
    card.classList.toggle('is-current', Number(card.dataset.seed) === state.seed);
  });
}

/* ---------- Material picker ---------- */
function renderMaterialPicker() {
  const fragment = document.createDocumentFragment();
  MATERIAL_GROUPS.forEach((group) => {
    const items = MATERIALS.filter((material) => material.group === group);
    if (!items.length) return;
    const section = document.createElement('div');
    section.className = 'material-group';
    const heading = document.createElement('div');
    heading.className = 'material-group-title';
    heading.textContent = group;
    const grid = document.createElement('div');
    grid.className = 'material-options';

    items.forEach((material, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'material-option' + (material.id === state.materialId ? ' is-selected' : '');
      button.dataset.material = material.id;
      button.setAttribute('aria-label', `Use ${material.name}`);
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      const icon = renderTexture({
        materialId: material.id,
        seed: 320 + index * 71 + MATERIAL_GROUPS.indexOf(group) * 13,
        size: 16,
        finish: 'balanced',
        grain: 52,
        contrast: 55,
        hue: 0,
        modifiers: [],
      });
      ctx.drawImage(icon.canvas, 0, 0, 64, 64);
      const label = document.createElement('span');
      label.textContent = material.name;
      button.append(canvas, label);
      grid.append(button);
    });

    section.append(heading, grid);
    fragment.append(section);
  });
  els.materialGrid.replaceChildren(fragment);
  updateMaterialSelection();
}

function updateMaterialSelection() {
  $$('.material-option', els.materialGrid).forEach((option) => {
    option.classList.toggle('is-selected', option.dataset.material === state.materialId);
  });
}

function positionMaterialPopover() {
  if (!els.materialPopover.matches(':popover-open')) return;
  const trigger = els.materialTrigger.getBoundingClientRect();
  const width = Math.min(568, window.innerWidth - 24);
  const maxHeight = Math.min(640, window.innerHeight - 24);
  els.materialPopover.style.width = `${width}px`;
  const height = Math.min(els.materialPopover.scrollHeight || 540, maxHeight);
  let top = trigger.bottom + 8;
  if (top + height > window.innerHeight - 12) top = Math.max(12, trigger.top - height - 8);
  top = clamp(top, 12, window.innerHeight - 12 - height);
  const left = clamp(trigger.left, 12, window.innerWidth - width - 12);
  els.materialPopover.style.top = `${top}px`;
  els.materialPopover.style.left = `${left}px`;
}

function openMaterialPicker() {
  if (els.materialPopover.matches(':popover-open')) {
    els.materialPopover.hidePopover();
    return;
  }
  els.materialPopover.style.width = `${Math.min(568, window.innerWidth - 24)}px`;
  els.materialPopover.showPopover();
  requestAnimationFrame(positionMaterialPopover);
}

function closeMaterialPicker() {
  if (els.materialPopover.matches(':popover-open')) els.materialPopover.hidePopover();
}

function chooseMaterial(materialId) {
  if (!MATERIALS.some((material) => material.id === materialId)) return;
  clearAiMode({ rerender: false, silent: true });
  state.materialId = materialId;
  els.promptInput.value = composePrompt();
  updateCharCount();
  updateParsedTags(parsePrompt(els.promptInput.value));
  updateMaterialSelection();
  syncControls();
  renderAll({ variations: true, pulse: true });
  closeMaterialPicker();
}

/* ---------- AI concept layer ---------- */
function setAiProviderBadge(kind, text) {
  const dot = document.createElement('span');
  els.aiProviderState.className = `ai-provider-state ${kind}`;
  els.aiProviderState.replaceChildren(dot, document.createTextNode(text));
}

function setAiStatus(message, kind = '') {
  els.aiStatus.textContent = message;
  els.aiStatus.className = `ai-status${kind ? ` is-${kind}` : ''}`;
}

function setAiBusy(busy) {
  state.aiBusy = busy;
  els.aiGenerateBtn.disabled = busy || !(state.aiStatus?.configured);
  els.aiGenerateBtn.classList.toggle('is-loading', busy);
  const label = els.aiGenerateBtn.querySelector('span');
  if (label) label.textContent = busy ? 'Generating…' : 'Generate concept';
  els.aiPromptInput.disabled = busy;
}

function updateAiPromptCount() {
  els.aiPromptCount.textContent = `${els.aiPromptInput.value.length} / 360`;
}

function paintAiStatus(status) {
  els.aiProviderName.textContent = status.provider || 'None';
  els.aiProviderModel.textContent = status.model || '—';
  els.aiPrivacy.textContent = `${status.privacy} The generated image is downscaled, quantized, and seam-repaired locally in your browser.`;
  els.aiForm.hidden = !status.configured;
  els.aiUnavailable.hidden = Boolean(status.configured);
  if (status.configured) {
    setAiProviderBadge(status.free ? 'free' : 'ready', status.free ? 'FREE' : 'READY');
    setAiStatus(status.rateLimit ? `Ready · ${status.rateLimit}` : 'Ready when you are.');
    els.aiGenerateBtn.disabled = false;
  } else {
    setAiProviderBadge('offline', 'OFFLINE');
    setAiStatus(status.setup || 'AI provider is not configured.', 'error');
    els.aiSetupMessage.textContent = status.setup || 'Configure a provider and restart the server.';
    els.aiGenerateBtn.disabled = true;
  }
}

async function openAiDialog() {
  if (state.aiBusy) {
    toast('An AI concept is already generating.');
    return;
  }
  els.aiPromptInput.value = state.ai?.prompt || els.promptInput.value;
  els.aiStrength.value = state.aiStrength;
  els.aiStrengthValue.textContent = `${state.aiStrength}%`;
  updateRangeFill(els.aiStrength);
  updateAiPromptCount();
  setAiBusy(false);
  setAiStatus('Checking provider…', 'working');
  setAiProviderBadge('checking', 'CHECKING');
  els.aiProviderName.textContent = 'Checking…';
  els.aiProviderModel.textContent = '—';
  els.aiForm.hidden = false;
  els.aiUnavailable.hidden = true;
  if (!els.aiDialog.open) {
    document.body.classList.add('dialog-open');
    els.aiDialog.showModal();
  }
  try {
    const status = await fetchAiStatus();
    state.aiStatus = status;
    paintAiStatus(status);
    requestAnimationFrame(() => els.aiPromptInput.focus());
  } catch (error) {
    state.aiStatus = null;
    setAiProviderBadge('offline', 'OFFLINE');
    els.aiProviderName.textContent = 'Unavailable';
    els.aiProviderModel.textContent = '—';
    setAiStatus(error.message || 'AI backend is unavailable.', 'error');
    els.aiForm.hidden = true;
    els.aiUnavailable.hidden = false;
    els.aiSetupMessage.textContent = 'Start the included Node server with npm run dev, then reopen this panel.';
  }
}

function closeAiDialog() {
  if (els.aiDialog.open) els.aiDialog.close();
}

function clearAiMode({ rerender = true, silent = false } = {}) {
  if (!state.ai) return false;
  state.ai = null;
  state.variations = [];
  els.aiBadge.hidden = true;
  els.dnaFinishLabel.textContent = 'Finish';
  els.variationsSub.textContent = 'Six sibling seeds. Same recipe, different surface.';
  updateParsedTags(parsePrompt(els.promptInput.value));
  if (rerender) renderAll({ variations: true, pulse: true });
  if (!silent) toast('Back to procedural mode');
  return true;
}

async function submitAiConcept(event) {
  event.preventDefault();
  if (state.aiBusy || !state.aiStatus?.configured) return;
  const prompt = els.aiPromptInput.value.replace(/\s+/g, ' ').trim();
  if (prompt.length < 3) {
    setAiStatus('Add a few words to aim the concept.', 'error');
    els.aiPromptInput.focus();
    return;
  }
  const seed = randomSeed();
  const strength = clamp(Number(els.aiStrength.value) / 100, 0, 1);
  state.aiStrength = Math.round(strength * 100);
  setAiBusy(true);
  setAiStatus(`Sending prompt to ${state.aiStatus.provider}…`, 'working');
  const timers = [
    setTimeout(() => setAiStatus('The provider is painting. This can take up to a minute…', 'working'), 7000),
    setTimeout(() => setAiStatus('Still painting — keeping the pixels warm…', 'working'), 22000),
  ];
  try {
    const payload = await generateAiConcept(prompt, seed);
    setAiStatus(`Reducing the concept to ${state.size} × ${state.size} and repairing seams…`, 'working');
    const textureSet = await processAiConcept({
      image: payload.image,
      prompt,
      provider: payload.provider,
      model: payload.model,
      seed: payload.seed,
      size: state.size,
      materialId: state.materialId,
      strength,
      modifiers: [...state.modifiers],
      overlayAccent: state.accent?.hex || null,
      finish: state.finish,
    });

    els.promptInput.value = payload.prompt || prompt;
    updateCharCount();
    const parsed = parsePrompt(els.promptInput.value);
    applyParsedPrompt(parsed);
    state.seed = payload.seed;
    state.textures = textureSet;
    state.ai = {
      ...textureSet,
      provider: payload.provider,
      model: payload.model,
      prompt: payload.prompt || prompt,
      variations: textureSet.aiVariations,
    };
    renderVariationCards(state.ai.variations);
    updateStageDetails(state.textures);
    updateParsedTags(parsed);
    syncControls();
    updateActiveVariation();
    pulseStage();
    setAiStatus(`Concept ready · ${state.ai.provider} / ${state.ai.model}`, 'success');
    closeAiDialog();
    toast(`AI concept forged · ${state.size} × ${state.size}`);
  } catch (error) {
    console.error(error);
    setAiStatus(error.message || 'The AI concept could not be processed.', 'error');
    toast('AI concept failed. The procedural studio is unchanged.', true);
  } finally {
    timers.forEach((timer) => clearTimeout(timer));
    setAiBusy(false);
  }
}

/* ---------- Seeds & camera ---------- */
function randomSeed() {
  const values = new Uint32Array(1);
  if (window.crypto?.getRandomValues) {
    window.crypto.getRandomValues(values);
    return 100000 + (values[0] % 900000);
  }
  return 100000 + Math.floor(Math.random() * 900000);
}

function setSeed(seed, { full = true } = {}) {
  clearAiMode({ rerender: false, silent: true });
  state.seed = clamp(Math.floor(Number(seed) || 1), 1, 999999999);
  els.seedInput.value = state.seed;
  if (full) renderAll({ variations: true, pulse: true });
  else renderCurrentOnly({ pulse: true });
}

function reroll() {
  clearAiMode({ rerender: false, silent: true });
  state.seed = randomSeed();
  els.seedInput.value = state.seed;
  renderAll({ variations: true, pulse: true });
}

function applyCamera() {
  els.cube.style.transform = `rotateX(${state.camera.x}deg) rotateY(${state.camera.y}deg)`;
}

function resetCamera() {
  state.camera = { x: -24, y: -37 };
  els.cube.classList.remove('is-dragging');
  applyCamera();
}

function bindCamera() {
  const cube = els.cube;
  cube.addEventListener('pointerdown', (event) => {
    if (event.button !== undefined && event.button !== 0) return;
    state.activeDrag = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      baseX: state.camera.x,
      baseY: state.camera.y,
    };
    cube.setPointerCapture?.(event.pointerId);
    cube.classList.add('is-dragging');
    els.dragHint.classList.add('is-hidden');
  });
  cube.addEventListener('pointermove', (event) => {
    const drag = state.activeDrag;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    state.camera.y = drag.baseY + dx * 0.48;
    state.camera.x = clamp(drag.baseX - dy * 0.35, -82, 82);
    applyCamera();
  });
  const endDrag = (event) => {
    const drag = state.activeDrag;
    if (!drag || drag.pointerId !== event.pointerId) return;
    state.activeDrag = null;
    cube.classList.remove('is-dragging');
    cube.releasePointerCapture?.(event.pointerId);
  };
  cube.addEventListener('pointerup', endDrag);
  cube.addEventListener('pointercancel', endDrag);
  cube.addEventListener('lostpointercapture', () => {
    state.activeDrag = null;
    cube.classList.remove('is-dragging');
  });
}

/* ---------- View & export ---------- */
function setView(view) {
  state.view = view;
  $$('.view-switch button').forEach((button) => {
    button.classList.toggle('active', button.dataset.view === view);
  });
  els.stageViewport.classList.toggle('is-tile', view === 'tile');
  els.modeLabel.textContent = view === 'tile' ? '2 × 2 TILE CHECK' : 'ORBIT VIEW';
  if (view === 'tile') drawTilePreview();
}

function dataUrlToBlob(dataUrl) {
  const [meta, encoded] = dataUrl.split(',');
  const type = meta.match(/data:([^;]+)/)?.[1] || 'image/jpeg';
  const binary = atob(encoded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type });
}

function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('PNG encoding failed'))), 'image/png');
  });
}

function textureFilename(extension = 'png') {
  const slug = getMaterial(state.materialId).name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `blockloom_${slug}${state.ai ? '_ai' : ''}_${state.seed}_${state.size}px.${extension}`;
}

async function downloadPng() {
  if (!state.textures) return;
  try {
    const blob = await canvasToBlob(state.textures.side.canvas);
    downloadBlob(blob, textureFilename());
    toast('PNG exported · ' + textureFilename());
  } catch (error) {
    toast('Could not export PNG', true);
  }
}

async function copyPng() {
  if (!state.textures) return;
  if (!navigator.clipboard?.write || !window.ClipboardItem) {
    toast('Clipboard image copy is not supported here — use Download.', true);
    return;
  }
  try {
    const blob = await canvasToBlob(state.textures.side.canvas);
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    toast('PNG copied to clipboard');
  } catch (error) {
    toast('Clipboard blocked by the browser — use Download.', true);
  }
}

function makePreviewCanvas() {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 640;
  drawIsoCube(canvas, { side: state.textures.side.canvas, top: state.textures.top.canvas }, { background: '#0b0d08', shadow: true, pad: 0.035 });
  return canvas;
}

function makeTileCanvas() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  const src = state.textures.side.canvas;
  ctx.imageSmoothingEnabled = false;
  for (let y = 0; y < 2; y++) {
    for (let x = 0; x < 2; x++) ctx.drawImage(src, x * 256, y * 256, 256, 256);
  }
  return canvas;
}

function setZipBusy(busy) {
  state.packing = busy;
  els.downloadSetBtn.disabled = busy;
  els.downloadPackBtn.disabled = busy;
  els.downloadSetBtn.setAttribute('aria-busy', String(busy));
  if (busy) {
    els.downloadSetBtn.dataset.label = els.downloadSetBtn.querySelector('span').textContent;
    els.downloadSetBtn.querySelector('span').textContent = 'Packing…';
  } else {
    els.downloadSetBtn.querySelector('span').textContent = els.downloadSetBtn.dataset.label || 'Texture set';
  }
}

async function downloadTextureSet() {
  if (!state.textures || state.packing) return;
  setZipBusy(true);
  try {
    if (state.ai) {
      state.variations = state.ai.variations;
    } else {
      renderVariations();
    }
    const origin = state.ai ? 'AI concept (post-processed in browser)' : 'Procedural studio';
    const readme = [
      'BLOCKLOOM TEXTURE SET',
      '=====================',
      '',
      `Recipe:     ${getMaterial(state.materialId).name}`,
      `Origin:     ${origin}`,
      `Prompt:     ${els.promptInput.value}`,
      `Seed:       ${state.seed}`,
      `Resolution: ${state.size} × ${state.size} px`,
      `Finish:     ${state.ai ? 'AI concept' : state.finish}`,
      `Modifiers:  ${state.modifiers.join(', ') || 'none'}`,
      `Palette:    ${displayPalette(state.textures).join(' ')}`,
      state.ai ? `Provider:   ${state.ai.provider || 'unknown'} / ${state.ai.model || 'unknown'}` : '',
      '',
      'Files',
      '-----',
      'side.png ........ side face texture',
      'top.png ......... top face texture',
      'bottom.png ...... bottom face texture',
      'preview.png ..... isometric block preview',
      'tile-2x2.png .... seamless tiling check',
      'variations/ ..... six alternate seed cuts',
      'texture.json .... recipe metadata',
      ...(state.ai ? ['ai-source.* ..... the raw provider concept', 'ai-concept.json . provider/prompt/strength provenance'] : []),
      '',
      'Surface edges are wrapped, so the tile is four-way seamless.',
      'Use them in personal or commercial projects. No attribution needed.',
      state.ai ? 'AI concepts are generated remotely and then reduced, quantized, and seam-repaired locally.' : '',
      '',
    ].filter((line) => line !== null).join('\n');
    const metadata = {
      generator: 'Blockloom 1.1',
      origin: state.ai ? 'ai' : 'procedural',
      provider: state.ai?.provider || null,
      model: state.ai?.model || null,
      material: getMaterial(state.materialId).name,
      prompt: els.promptInput.value,
      seed: state.seed,
      resolution: state.size,
      finish: state.ai ? 'ai-concept' : state.finish,
      modifiers: state.modifiers,
      accent: state.accent?.hex || null,
      aiStrength: state.ai ? Math.round((state.ai.aiStrength || 0) * 100) : null,
      palette: displayPalette(state.textures),
      variations: state.variations.map((v) => v.seed),
      tileable: true,
    };

    const files = [
      { name: 'README.txt', data: readme },
      { name: 'texture.json', data: JSON.stringify(metadata, null, 2) },
      { name: 'side.png', data: await canvasToBlob(state.textures.side.canvas) },
      { name: 'top.png', data: await canvasToBlob(state.textures.top.canvas) },
      { name: 'bottom.png', data: await canvasToBlob(state.textures.bottom.canvas) },
      { name: 'preview.png', data: await canvasToBlob(makePreviewCanvas()) },
      { name: 'tile-2x2.png', data: await canvasToBlob(makeTileCanvas()) },
    ];

    if (state.ai?.aiSource) {
      const mime = state.ai.aiSource.slice(5, state.ai.aiSource.indexOf(';')) || 'image/jpeg';
      const ext = mime.includes('png') ? 'png' : 'jpg';
      files.push({ name: `ai-source.${ext}`, data: dataUrlToBlob(state.ai.aiSource) });
      files.push({
        name: 'ai-concept.json',
        data: JSON.stringify({
          provider: state.ai.provider,
          model: state.ai.model,
          prompt: state.ai.aiPrompt || els.promptInput.value,
          seed: state.ai.aiSeed || state.seed,
          strength: state.ai.aiStrength ?? null,
          note: 'Remote concept before local downscale, palette snap, recipe blend, and seam repair.',
        }, null, 2),
      });
    }

    for (let i = 0; i < state.variations.length; i++) {
      files.push({
        name: `variations/variation-${i + 1}-${state.variations[i].seed}.png`,
        data: await canvasToBlob(state.variations[i].textures.side.canvas),
      });
    }

    const zip = await createZip(files);
    downloadBlob(zip, textureFilename('zip'));
    toast('Texture set packed · ' + files.length + ' files');
  } catch (error) {
    console.error(error);
    toast('Could not build the texture set', true);
  } finally {
    setZipBusy(false);
  }
}

async function downloadResourcePack() {
  if (!state.textures || state.packing) return;
  state.packing = true;
  els.downloadPackBtn.disabled = true;
  els.downloadSetBtn.disabled = true;
  els.downloadPackBtn.setAttribute('aria-busy', 'true');
  try {
    const target = packTargetFor(state.materialId);
    const pack = await buildResourcePack(state.textures, {
      materialId: state.materialId,
      materialName: getMaterial(state.materialId).name,
      seed: state.seed,
      size: state.size,
      origin: state.ai ? 'ai' : 'procedural',
      prompt: els.promptInput.value,
    });
    downloadBlob(pack.blob, pack.filename);
    toast(`Resource pack ready · overrides ${target.label}`);
  } catch (error) {
    console.error(error);
    toast('Could not build the resource pack', true);
  } finally {
    state.packing = false;
    els.downloadPackBtn.disabled = false;
    els.downloadSetBtn.disabled = false;
    els.downloadPackBtn.removeAttribute('aria-busy');
  }
}

/* ---------- Toast ---------- */
function toast(message, error = false) {
  const node = document.createElement('div');
  node.className = `toast${error ? ' is-error' : ''}`;
  node.textContent = message;
  els.toastRegion.append(node);
  setTimeout(() => {
    node.classList.add('is-leaving');
    setTimeout(() => node.remove(), 260);
  }, error ? 3600 : 2400);
}

/* ---------- Events ---------- */
function bindEvents() {
  els.promptForm.addEventListener('submit', (event) => {
    event.preventDefault();
    applyPrompt({ newSeed: true });
  });

  els.promptInput.addEventListener('input', () => {
    updateCharCount();
    updateParsedTags(parsePrompt(els.promptInput.value));
  });

  $$('.prompt-examples button').forEach((button) => {
    button.addEventListener('click', () => {
      els.promptInput.value = button.dataset.prompt;
      updateCharCount();
      applyPrompt({ newSeed: true });
      els.promptInput.focus();
    });
  });

  els.forgeBtn.addEventListener('click', () => applyPrompt({ newSeed: true }));

  els.materialTrigger.addEventListener('click', openMaterialPicker);
  els.closeMaterialPopover.addEventListener('click', closeMaterialPicker);
  els.materialPopover.addEventListener('toggle', (event) => {
    els.materialTrigger.setAttribute('aria-expanded', String(event.newState === 'open'));
    if (event.newState === 'open') requestAnimationFrame(positionMaterialPopover);
  });
  els.materialGrid.addEventListener('click', (event) => {
    const option = event.target.closest('.material-option');
    if (option) chooseMaterial(option.dataset.material);
  });
  window.addEventListener('resize', positionMaterialPopover);
  window.addEventListener('scroll', positionMaterialPopover, true);

  $$('#finishGroup button').forEach((button) => {
    button.addEventListener('click', () => {
      clearAiMode({ rerender: false, silent: true });
      state.finish = button.dataset.finish;
      syncControls();
      renderAll({ variations: true, pulse: true });
    });
  });

  const bindRange = (range, output, key, formatter = (value) => value) => {
    range.addEventListener('input', () => {
      clearAiMode({ rerender: false, silent: true });
      state[key] = Number(range.value);
      output.textContent = formatter(Number(range.value));
      updateRangeFill(range);
      scheduleQuickRender();
    });
    range.addEventListener('change', () => {
      clearAiMode({ rerender: false, silent: true });
      state[key] = Number(range.value);
      syncControls();
      renderAll({ variations: true });
    });
  };
  bindRange(els.grainRange, els.grainValue, 'grain');
  bindRange(els.contrastRange, els.contrastValue, 'contrast');
  bindRange(els.hueRange, els.hueValue, 'hue', (value) => `${value}°`);

  els.resetTuning.addEventListener('click', () => {
    clearAiMode({ rerender: false, silent: true });
    state.grain = 58;
    state.contrast = 55;
    state.hue = 0;
    syncControls();
    renderAll({ variations: true, pulse: true });
  });

  els.seedInput.addEventListener('change', () => {
    const parsed = Number(els.seedInput.value);
    if (!Number.isFinite(parsed) || parsed < 1) {
      els.seedInput.value = state.seed;
      return;
    }
    setSeed(parsed, { full: true });
  });
  els.seedInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') els.seedInput.blur();
  });
  els.diceBtn.addEventListener('click', reroll);
  els.rerollBtn.addEventListener('click', reroll);

  els.resolutionGroup.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-size]');
    if (!button) return;
    clearAiMode({ rerender: false, silent: true });
    state.size = Number(button.dataset.size);
    syncControls();
    renderAll({ variations: true, pulse: true });
  });

  $$('.view-switch button').forEach((button) => {
    button.addEventListener('click', () => setView(button.dataset.view));
  });
  els.resetViewBtn.addEventListener('click', resetCamera);

  els.downloadPngBtn.addEventListener('click', downloadPng);
  els.topExportBtn.addEventListener('click', downloadPng);
  els.copyPngBtn.addEventListener('click', copyPng);
  els.downloadSetBtn.addEventListener('click', downloadTextureSet);
  els.downloadPackBtn.addEventListener('click', downloadResourcePack);

  els.aiBtn.addEventListener('click', openAiDialog);
  els.aiBadge.addEventListener('click', () => {
    clearAiMode({ rerender: true });
  });
  els.closeAiBtn.addEventListener('click', closeAiDialog);
  els.aiForm.addEventListener('submit', submitAiConcept);
  els.aiPromptInput.addEventListener('input', updateAiPromptCount);
  els.aiStrength.addEventListener('input', () => {
    state.aiStrength = Number(els.aiStrength.value);
    els.aiStrengthValue.textContent = `${state.aiStrength}%`;
    updateRangeFill(els.aiStrength);
  });
  $$('.ai-chip-row button').forEach((button) => {
    button.addEventListener('click', () => {
      els.aiPromptInput.value = button.dataset.aiPrompt;
      updateAiPromptCount();
      els.aiPromptInput.focus();
    });
  });
  els.aiDialog.addEventListener('click', (event) => {
    if (event.target === els.aiDialog) closeAiDialog();
  });
  els.aiDialog.addEventListener('close', () => {
    document.body.classList.remove('dialog-open');
  });

  els.variationGrid.addEventListener('click', (event) => {
    const card = event.target.closest('.variation-card');
    if (!card) return;
    const seed = Number(card.dataset.seed);
    if (!seed) return;
    if (state.ai) {
      const variant = state.ai.variations.find((item) => item.seed === seed);
      if (!variant) return;
      state.seed = seed;
      state.ai.seed = seed;
      state.ai.textures = variant.textures;
      state.textures = variant.textures;
      els.seedInput.value = seed;
      updateStageDetails(state.textures);
      updateActiveVariation();
      pulseStage();
      toast('Loaded AI cut #' + seed);
      return;
    }
    setSeed(seed, { full: false });
    toast('Loaded seed #' + seed);
  });

  els.howBtn.addEventListener('click', () => {
    if (!els.howDialog.open) {
      document.body.classList.add('dialog-open');
      els.howDialog.showModal();
    }
  });
  const closeHow = () => {
    if (els.howDialog.open) els.howDialog.close();
  };
  els.closeHowBtn.addEventListener('click', closeHow);
  els.dialogCta.addEventListener('click', closeHow);
  els.howDialog.addEventListener('click', (event) => {
    if (event.target === els.howDialog) closeHow();
  });
  els.howDialog.addEventListener('close', () => {
    document.body.classList.remove('dialog-open');
  });
  document.addEventListener('keydown', (event) => {
    if (els.howDialog.open || els.aiDialog.open) return;
    const tag = event.target.tagName;
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag) || event.target.isContentEditable) return;
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    if (event.key === 'g' || event.key === 'G') {
      event.preventDefault();
      applyPrompt({ newSeed: true });
    } else if (event.key === 'r' || event.key === 'R') {
      event.preventDefault();
      reroll();
    } else if (event.key === 'a' || event.key === 'A') {
      event.preventDefault();
      openAiDialog();
    } else if (event.key === 'e' || event.key === 'E') {
      event.preventDefault();
      downloadPng();
    } else if (event.key === '?') {
      event.preventDefault();
      if (!els.howDialog.open) {
        document.body.classList.add('dialog-open');
        els.howDialog.showModal();
      }
    }
  });

  bindCamera();
}

function updateClock() {
  const time = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date());
  els.footerClock.textContent = `LOCAL · ${time}`;
}

function init() {
  els.materialCount.textContent = `${MATERIALS.length} recipes`;
  els.popoverCount.textContent = `${MATERIALS.length} materials`;
  const initial = parsePrompt(els.promptInput.value);
  applyParsedPrompt(initial);
  updateCharCount();
  updateParsedTags(initial);
  renderMaterialPicker();
  bindEvents();
  syncControls();
  applyCamera();
  renderAll({ variations: true });
  updateClock();
  setInterval(updateClock, 60000);
}

init();
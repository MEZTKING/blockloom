import {
  MATERIALS,
  MATERIAL_GROUPS,
  MODIFIERS,
  FINISHES,
  getMaterial,
  parsePrompt,
  textureTitle,
  modifierLabel,
} from '../core/index.js';
import { renderTexture, renderTextureSet, drawIsoCube, downloadBlob } from './engine.js';
import { createZip } from './zip.js';
import { createAiVariations, fetchAiStatus, generateAiConcept, processAiConcept } from './ai.js';
import { makeShareUrl, readShareHash } from './share.js';
import { importSummary, importTitle, planTextureImport } from './importer.js';
import { releaseInfo } from './update.js';
import { APP_VERSION } from './version.js';
import { buildResourcePack, getPackFormat, getPackTarget, packTargetFor, PACK_FORMATS, PACK_TARGETS } from './resourcepack.js';
import { THEMES, detectTheme, generateThemeSheet } from '../core/index.js';
import { buildItemResourcePack } from './itempack.js';
import { buildAnyResourcePack } from './anypack.js';
import { TEMPLATE_PRESETS, createTemplateCanvas, getTemplatePreset, templateMeta } from './templates.js';
import { TextureFinisher } from './finisher.js';
import {
  countWorks,
  deleteWork,
  findByFingerprint,
  fingerprintFaces,
  getWork,
  listWorks,
  newWorkId,
  putWork,
  setFavorite,
  storageEstimate,
} from './library.js';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const PARAMS = new URLSearchParams(location.search);
const IS_TAURI = Boolean(window.__TAURI_INTERNALS__);
const IS_STATIC_DEMO = location.hostname.endsWith('.github.io') || PARAMS.has('static');
const PROCEDURAL_ONLY = IS_TAURI || IS_STATIC_DEMO || PARAMS.has('noai') || PARAMS.has('procedural') || !navigator.onLine;

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
  materialSearch: $('#materialSearch'),
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
  aiBadgeLabel: $('#aiBadgeLabel'),
  finishBtn: $('#finishBtn'),
  shareBtn: $('#shareBtn'),
  importBtn: $('#importBtn'),
  fontScaleBtn: $('#fontScaleBtn'),
  itemStudioBtn: $('#itemStudioBtn'),
  itemDialog: $('#itemDialog'),
  closeItemBtn: $('#closeItemBtn'),
  itemFormat: $('#itemFormat'),
  itemPreview: $('#itemPreview'),
  itemTitle: $('#itemTitle'),
  itemTarget: $('#itemTarget'),
  itemPalette: $('#itemPalette'),
  itemDownloadBtn: $('#itemDownloadBtn'),
  itemCopyBtn: $('#itemCopyBtn'),
  itemPackBtn: $('#itemPackBtn'),
  itemImportBtn: $('#itemImportBtn'),
  itemImportInput: $('#itemImportInput'),
  itemTargetInput: $('#itemTargetInput'),
  variantSheetBtn: $('#variantSheetBtn'),
  anyPackBtn: $('#anyPackBtn'),
  themeStudioBtn: $('#themeStudioBtn'),
  themeDialog: $('#themeDialog'),
  closeThemeBtn: $('#closeThemeBtn'),
  themeTabs: $('#themeTabs'),
  themePreview: $('#themePreview'),
  themeTitle: $('#themeTitle'),
  themeTarget: $('#themeTarget'),
  themePalette: $('#themePalette'),
  themeGrid: $('#themeGrid'),
  themeSeed: $('#themeSeed'),
  themeDice: $('#themeDice'),
  themeFormat: $('#themeFormat'),
  themeDownloadBtn: $('#themeDownloadBtn'),
  themeCopyBtn: $('#themeCopyBtn'),
  themePackBtn: $('#themePackBtn'),
  anyPackDialog: $('#anyPackDialog'),
  closeAnyPackBtn: $('#closeAnyPackBtn'),
  anyPackName: $('#anyPackName'),
  anyPackNamespace: $('#anyPackNamespace'),
  anyPackCategory: $('#anyPackCategory'),
  anyPackFormat: $('#anyPackFormat'),
  anyPackAddBtn: $('#anyPackAddBtn'),
  anyPackInput: $('#anyPackInput'),
  anyPackOrigNote: $('#anyPackOrigNote'),
  anyPackList: $('#anyPackList'),
  anyPackEmpty: $('#anyPackEmpty'),
  anyPackCount: $('#anyPackCount'),
  anyPackExportBtn: $('#anyPackExportBtn'),
  anyPackTemplate: $('#anyPackTemplate'),
  anyPackTemplateNote: $('#anyPackTemplateNote'),
  anyPackTemplateBlankBtn: $('#anyPackTemplateBlankBtn'),
  anyPackTemplateGuideBtn: $('#anyPackTemplateGuideBtn'),
  anyPackTemplateMetaBtn: $('#anyPackTemplateMetaBtn'),
  variantSheetDialog: $('#variantSheetDialog'),
  variantSheetGrid: $('#variantSheetGrid'),
  closeVariantSheetBtn: $('#closeVariantSheetBtn'),
  importInput: $('#importInput'),
  dropOverlay: $('#dropOverlay'),
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
  updateBtn: $('#updateBtn'),
  footerApi: $('#footerApi'),
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
  aiConceptCountGroup: $('#aiConceptCountGroup'),
  aiConceptHint: $('#aiConceptHint'),
  aiCandidates: $('#aiCandidates'),
  aiCandidateGrid: $('#aiCandidateGrid'),
  aiCandidateCount: $('#aiCandidateCount'),
  aiAddCandidate: $('#aiAddCandidate'),
  aiUseCandidate: $('#aiUseCandidate'),
  aiCandidateHint: $('#aiCandidateHint'),
  aiPrivacy: $('#aiPrivacy'),
  aiUnavailable: $('#aiUnavailable'),
  aiSetupMessage: $('#aiSetupMessage'),
  libraryBtn: $('#libraryBtn'),
  libraryCount: $('#libraryCount'),
  libraryDialog: $('#libraryDialog'),
  closeLibraryBtn: $('#closeLibraryBtn'),
  librarySearch: $('#librarySearch'),
  libraryFilters: $('#libraryFilters'),
  libraryGrid: $('#libraryGrid'),
  libraryEmpty: $('#libraryEmpty'),
  libraryResultCount: $('#libraryResultCount'),
  libraryBackupBtn: $('#libraryBackupBtn'),
  libraryImportBtn: $('#libraryImportBtn'),
  libraryImportInput: $('#libraryImportInput'),
  librarySub: $('#librarySub'),
  libraryStorage: $('#libraryStorage'),
  finisherDialog: $('#finisherDialog'),
  packDialog: $('#packDialog'),
  closePackBtn: $('#closePackBtn'),
  packEntries: $('#packEntries'),
  packEntryCount: $('#packEntryCount'),
  packLibrarySelect: $('#packLibrarySelect'),
  packLibraryCount: $('#packLibraryCount'),
  packAddBtn: $('#packAddBtn'),
  packFormats: $('#packFormats'),
  packFormatCode: $('#packFormatCode'),
  packFormatNote: $('#packFormatNote'),
  packFormatLabel: $('#packFormatLabel'),
  packTargetCount: $('#packTargetCount'),
  packFileCount: $('#packFileCount'),
  packExportBtn: $('#packExportBtn'),
  packTintToggle: $('#packTintToggle'),
  packTintFree: $('#packTintFree'),
  packTintStatus: $('#packTintStatus'),
  versionDialog: $('#versionDialog'),
  versionTitle: $('#versionTitle'),
  versionSub: $('#versionSub'),
  versionGrid: $('#versionGrid'),
  versionBackBtn: $('#versionBackBtn'),
  closeVersionBtn: $('#closeVersionBtn'),
};

let finisher = null;

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
  aiConceptCount: 1,
  aiCandidates: [],
  aiSelectedCandidate: -1,
  loadedWork: null,
  currentWorkId: null,
  libraryReady: false,
  libraryWorks: [],
  libraryFilter: 'all',
  libraryQuery: '',
  materialQuery: '',
  editorOpen: false,
  userHasActed: false,
  archiveTimer: 0,
  archiving: false,
  packEntries: [],
  packFormatId: 'modern',
  packBuilding: false,
  packGrassTintFree: false,
  versionWorkId: null,
  importing: false,
  itemSize: 16,
  itemFormat: 'modern',
  itemCurrent: null,
  itemTarget: 'iron_sword',
  itemImported: false,
  anyPackEntries: [],
  anyPackNamespace: 'minecraft',
  anyPackCategory: 'block',
  anyPackFormat: 'modern',
  anyPackName: 'Blockloom Custom Pack',
  themeId: 'brass_checker',
  themeSeed: 20261124,
  themeFormat: 'modern',
  themeSelected: null,
  themeSheet: null,
  dragDepth: 0,
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
  state.userHasActed = true;
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
  } else if (state.loadedWork) {
    els.parsedTags.append(chip(
      state.loadedWork.imported
        ? 'Imported texture'
        : state.loadedWork.shared
          ? 'Shared texture'
          : state.loadedWork.edited
            ? 'Edited copy'
            : 'Saved work',
      'library',
    ));
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

function currentCustomTextures() {
  return state.ai?.textures || state.loadedWork?.textures || (state.ai ? state.textures : null);
}

function currentCustomVariations() {
  return state.ai?.variations || state.loadedWork?.variations || null;
}

function hasCustomTexture() {
  return Boolean(currentCustomTextures());
}

function syncDialogBody() {
  const dialogs = [els.howDialog, els.aiDialog, els.libraryDialog, els.finisherDialog, els.packDialog, els.versionDialog, els.itemDialog, els.variantSheetDialog, els.anyPackDialog, els.themeDialog];
  document.body.classList.toggle('dialog-open', dialogs.some((dialog) => dialog?.open));
}

function displayPalette(textures) {
  if (hasCustomTexture()) return textures.palette.slice(0, 6);
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
  const savedActive = Boolean(state.loadedWork);
  const custom = hasCustomTexture();
  const title = state.ai
    ? textureTitle(state.materialId, state.modifiers)
    : state.loadedWork?.work?.title || textureTitle(state.materialId, state.modifiers);
  const suffix = aiActive ? ' (AI)' : state.loadedWork?.imported ? ' (Imported)' : state.loadedWork?.shared ? ' (Shared)' : savedActive ? ' (Saved)' : '';
  els.textureTitle.textContent = title;
  document.title = `${title}${suffix} — Blockloom`;
  els.dnaMaterial.textContent = textures.material.name;
  els.dnaFinishLabel.textContent = custom ? 'Origin' : 'Finish';
  els.dnaFinish.textContent = custom
    ? aiActive
      ? 'AI concept'
      : state.loadedWork?.shared
        ? 'Shared texture'
        : state.loadedWork?.imported
          ? 'Imported texture'
          : state.loadedWork?.edited
            ? 'Edited copy'
            : 'Saved work'
    : FINISHES.find((f) => f.id === state.finish)?.label || 'Balanced';
  els.variantSheetBtn.disabled = custom;
  els.variantSheetBtn.title = custom ? 'Procedural recipes have 16 variations' : 'Open a 16-variant contact sheet';
  els.aiBadge.hidden = !custom;
  els.aiBadge.classList.toggle('is-saved', savedActive);
  if (els.aiBadgeLabel) {
    els.aiBadgeLabel.textContent = aiActive
      ? 'AI MODE'
      : state.loadedWork?.shared
        ? 'SHARED WORK'
        : state.loadedWork?.imported
          ? 'IMPORTED'
          : state.loadedWork?.edited
            ? 'EDITED COPY'
            : 'SAVED WORK';
  }
  els.aiBadge.title = aiActive
    ? 'AI concept is active. Click to return to the procedural texture.'
    : state.loadedWork?.imported
      ? 'Imported texture is active. Click to return to the procedural texture.'
      : 'Saved library texture is active. Click to return to the procedural texture.';
  els.variationsSub.textContent = aiActive
    ? 'AI cuts · local colour and orientation studies.'
    : state.loadedWork?.shared
      ? 'Local cuts · regenerated from shared pixels.'
      : state.loadedWork?.imported
        ? 'Original pixels · no generated sibling cuts.'
        : savedActive
          ? 'Saved cuts · restored with this library piece.'
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
  const custom = currentCustomTextures();
  if (custom) {
    state.textures = custom;
    updateStageDetails(state.textures);
    updateActiveVariation();
    if (pulse) pulseStage();
    return;
  }
  state.textures = renderTextureSet(buildParams());
  updateStageDetails(state.textures);
  updateActiveVariation();
  if (pulse) pulseStage();
  queueArchive();
}

function renderAll({ variations = true, pulse = false } = {}) {
  const custom = currentCustomTextures();
  if (custom) {
    state.textures = custom;
    updateStageDetails(state.textures);
    if (variations) renderVariationCards(currentCustomVariations() || []);
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
  queueArchive();
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

  if (!variations.length) {
    const empty = document.createElement('div');
    empty.className = 'variation-empty';
    empty.innerHTML = '<span>NO SIBLING CUTS</span><p>This texture keeps its original pixels. Edit all three faces in the finisher.</p>';
    els.variationGrid.replaceChildren(empty);
    return;
  }
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
  const query = state.materialQuery.trim().toLowerCase();
  let shown = 0;
  MATERIAL_GROUPS.forEach((group) => {
    const items = MATERIALS.filter((material) => {
      if (material.group !== group) return false;
      if (!query) return true;
      return [material.name, material.id, material.group, material.type, ...(material.keywords || [])]
        .some((value) => String(value).toLowerCase().includes(query));
    });
    if (!items.length) return;
    shown += items.length;
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
  els.popoverCount.textContent = query ? `${shown} of ${MATERIALS.length} materials` : `${MATERIALS.length} materials`;
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
  state.materialQuery = '';
  els.materialSearch.value = '';
  renderMaterialPicker();
  els.materialPopover.style.width = `${Math.min(568, window.innerWidth - 24)}px`;
  els.materialPopover.showPopover();
  requestAnimationFrame(() => els.materialSearch.focus());
  requestAnimationFrame(positionMaterialPopover);
}

function closeMaterialPicker() {
  if (els.materialPopover.matches(':popover-open')) els.materialPopover.hidePopover();
}

function chooseMaterial(materialId) {
  if (!MATERIALS.some((material) => material.id === materialId)) return;
  state.userHasActed = true;
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

function updateAiCandidateControls() {
  const count = state.aiCandidates.length;
  const hasCandidates = count > 0;
  els.aiCandidates.hidden = !hasCandidates;
  els.aiCandidateCount.textContent = `${count} ready`;
  els.aiAddCandidate.disabled = state.aiBusy || !state.aiStatus?.configured || count >= 4;
  els.aiUseCandidate.disabled = state.aiBusy || state.aiSelectedCandidate < 0;
  els.aiConceptCountGroup.querySelectorAll('button').forEach((button) => {
    button.disabled = state.aiBusy;
  });
  if (hasCandidates) {
    els.aiCandidateHint.textContent = state.aiSelectedCandidate >= 0
      ? 'Use the selected concept, or add another to compare.'
      : 'Select a concept, then add it to the studio.';
  }
}

function setAiBusy(busy) {
  state.aiBusy = busy;
  els.aiGenerateBtn.disabled = busy || !(state.aiStatus?.configured);
  els.aiGenerateBtn.classList.toggle('is-loading', busy);
  const label = els.aiGenerateBtn.querySelector('span');
  if (label) label.textContent = busy ? 'Generating…' : 'Generate concepts';
  els.aiPromptInput.disabled = busy;
  updateAiCandidateControls();
}

function setAiConceptCountUI() {
  els.aiConceptCountGroup.querySelectorAll('button').forEach((button) => {
    button.classList.toggle('active', Number(button.dataset.concepts) === state.aiConceptCount);
  });
}

function renderAiCandidates() {
  els.aiCandidateGrid.replaceChildren();
  const fragment = document.createDocumentFragment();
  state.aiCandidates.forEach((candidate, index) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = `ai-candidate${index === state.aiSelectedCandidate ? ' is-selected' : ''}`;
    card.dataset.candidate = String(index);
    card.style.setProperty('--i', String(index));
    card.setAttribute('aria-label', `Select concept ${index + 1}, seed ${candidate.seed}`);
    const canvas = document.createElement('canvas');
    canvas.width = 240;
    canvas.height = 205;
    canvas.setAttribute('aria-hidden', 'true');
    card.append(canvas);
    const meta = document.createElement('span');
    meta.className = 'ai-candidate-meta';
    meta.innerHTML = `<strong>Concept ${index + 1}</strong><span>#${candidate.seed}</span>`;
    card.append(meta);
    drawIsoCube(canvas, { side: candidate.textures.side.canvas, top: candidate.textures.top.canvas }, { shadow: true, pad: 0.02 });
    fragment.append(card);
  });
  els.aiCandidateGrid.append(fragment);
  updateAiCandidateControls();
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
    els.aiConceptHint.textContent = status.free ? 'Free tier may stop after one' : 'Generate up to three per run';
    els.aiGenerateBtn.disabled = false;
  } else {
    setAiProviderBadge('offline', 'OFFLINE');
    setAiStatus(status.setup || 'AI provider is not configured.', 'error');
    els.aiSetupMessage.textContent = status.setup || 'Configure a provider and restart the server.';
    els.aiGenerateBtn.disabled = true;
  }
  updateAiCandidateControls();
}

async function openAiDialog() {
  if (state.aiBusy) {
    toast('An AI concept is already generating.');
    return;
  }
  state.aiCandidates = [];
  state.aiSelectedCandidate = -1;
  renderAiCandidates();
  setAiConceptCountUI();
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
  if (PROCEDURAL_ONLY) {
    setAiProviderBadge('offline', IS_TAURI ? 'DESKTOP' : IS_STATIC_DEMO ? 'STATIC' : 'PROCEDURAL');
    els.aiProviderName.textContent = IS_TAURI ? 'Desktop build' : IS_STATIC_DEMO ? 'GitHub Pages demo' : 'Procedural mode';
    els.aiProviderModel.textContent = 'AI disabled';
    setAiStatus('AI is unavailable in this offline / procedural session. Everything else still works.', 'error');
    els.aiForm.hidden = true;
    els.aiUnavailable.hidden = false;
    els.aiSetupMessage.textContent = IS_TAURI
      ? 'The Windows app ships without the AI proxy. Import, procedural generation, the finisher, library, share links, and packs all work offline.'
      : IS_STATIC_DEMO
        ? 'The Pages build is the procedural studio only. The full AI provider proxy lives in server.mjs and runs locally or on your own host.'
        : 'Remove ?noai / ?procedural or go online, then reload to enable the optional AI layer.';
    return;
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
  if (!state.ai && !state.loadedWork) return false;
  const oversized = !FINISHES.some((finish) => finish.id === state.finish);
  if (oversized) state.finish = 'balanced';
  if (![16, 32, 64].includes(state.size)) state.size = 64;
  state.ai = null;
  state.loadedWork = null;
  state.currentWorkId = null;
  state.variations = [];
  els.aiBadge.hidden = true;
  els.dnaFinishLabel.textContent = 'Finish';
  els.variationsSub.textContent = 'Six sibling seeds. Same recipe, different surface.';
  updateParsedTags(parsePrompt(els.promptInput.value));
  if (rerender) renderAll({ variations: true, pulse: true });
  if (!silent) toast('Back to procedural mode');
  return true;
}

async function runAiBatch({ append = false } = {}) {
  if (state.aiBusy || !state.aiStatus?.configured) return;
  if (append && state.aiCandidates.length >= 4) {
    toast('You can compare up to four concepts at once.', true);
    return;
  }
  const prompt = els.aiPromptInput.value.replace(/\s+/g, ' ').trim();
  if (prompt.length < 3) {
    setAiStatus('Add a few words to aim the concept.', 'error');
    els.aiPromptInput.focus();
    return;
  }
  const strength = clamp(Number(els.aiStrength.value) / 100, 0, 1);
  state.aiStrength = Math.round(strength * 100);
  const count = append ? 1 : state.aiConceptCount;
  if (!append) {
    state.aiCandidates = [];
    state.aiSelectedCandidate = -1;
    renderAiCandidates();
  }
  setAiBusy(true);
  let lastError = null;
  for (let index = 0; index < count; index++) {
    const label = append ? 'another concept' : `concept ${index + 1} of ${count}`;
    setAiStatus(`Sending prompt for ${label} to ${state.aiStatus.provider}…`, 'working');
    const timer = setTimeout(() => {
      if (state.aiBusy) setAiStatus('The provider is painting. This can take up to a minute…', 'working');
    }, 8000);
    try {
      const payload = await generateAiConcept(prompt, randomSeed());
      setAiStatus(`Reducing ${label} to ${state.size} × ${state.size} and repairing seams…`, 'working');
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
      state.aiCandidates.push({
        seed: payload.seed,
        prompt: payload.prompt || prompt,
        provider: payload.provider,
        model: payload.model,
        strength,
        textures: textureSet,
      });
      state.aiSelectedCandidate = state.aiCandidates.length - 1;
      renderAiCandidates();
      setAiStatus(
        `${state.aiCandidates.length} concept${state.aiCandidates.length === 1 ? '' : 's'} ready${index + 1 < count ? ' · generating next…' : ' · choose one to use'}`,
        'success',
      );
    } catch (error) {
      lastError = error;
      if (!state.aiCandidates.length) {
        setAiStatus(error.message || 'The AI provider did not return a usable concept.', 'error');
        toast('AI concept failed. The procedural studio is unchanged.', true);
        break;
      }
      setAiStatus(
        `${state.aiCandidates.length} concept${state.aiCandidates.length === 1 ? '' : 's'} ready. ${error.message || 'The provider stopped early.'}`,
        'error',
      );
      break;
    } finally {
      clearTimeout(timer);
    }
  }
  setAiBusy(false);
  if (!lastError && state.aiCandidates.length) {
    setAiStatus(
      `${state.aiCandidates.length} concept${state.aiCandidates.length === 1 ? '' : 's'} ready. Choose one to use.`,
      'success',
    );
  }
  updateAiCandidateControls();
  if (state.aiCandidates.length) {
    setTimeout(() => els.aiCandidates.scrollIntoView({ block: 'nearest', behavior: 'smooth' }), 80);
  }
}

async function submitAiConcept(event) {
  event.preventDefault();
  await runAiBatch({ append: false });
}

async function addAiConcept() {
  await runAiBatch({ append: true });
}

function selectAiCandidate(index) {
  if (!state.aiCandidates[index]) return;
  state.aiSelectedCandidate = index;
  renderAiCandidates();
}

async function useSelectedAiCandidate() {
  const candidate = state.aiCandidates[state.aiSelectedCandidate];
  if (!candidate || state.aiBusy) return;
  const textureSet = candidate.textures;
  els.promptInput.value = candidate.prompt;
  updateCharCount();
  const parsed = parsePrompt(els.promptInput.value);
  applyParsedPrompt(parsed);
  state.userHasActed = true;
  state.seed = candidate.seed;
  state.textures = textureSet;
  state.loadedWork = null;
  state.currentWorkId = null;
  state.ai = {
    ...textureSet,
    textures: textureSet,
    provider: candidate.provider,
    model: candidate.model,
    prompt: candidate.prompt,
    aiPrompt: candidate.prompt,
    aiSeed: candidate.seed,
    aiStrength: candidate.strength,
    aiSource: textureSet.aiSource,
    aiSeam: textureSet.aiSeam,
    variations: textureSet.aiVariations,
  };
  renderVariationCards(state.ai.variations);
  updateStageDetails(state.textures);
  updateParsedTags(parsed);
  syncControls();
  updateActiveVariation();
  pulseStage();
  queueArchive(500);
  setAiStatus(`Applied concept ${state.aiSelectedCandidate + 1} · ${candidate.provider} / ${candidate.model}`, 'success');
  closeAiDialog();
  toast(`AI concept added · ${state.size} × ${state.size}`);
}

/* ---------- Local library ---------- */

let archiveInFlight = null;

function updateRangeFillForStrength(range) {
  const min = Number(range.min);
  const max = Number(range.max);
  const value = Number(range.value);
  range.style.setProperty('--val', `${((value - min) / (max - min)) * 100}%`);
}

function updateLibraryCount(count) {
  const value = Number(count) || 0;
  els.libraryCount.textContent = value > 99 ? '99+' : String(value);
  els.libraryCount.classList.toggle('is-empty', value === 0);
  els.librarySub.textContent = value
    ? `${value} work${value === 1 ? '' : 's'} archived locally. Everything you make lands here automatically.`
    : 'Every distinct texture you make is stored in this browser.';
}

async function refreshLibraryCount() {
  if (!state.libraryReady) return 0;
  const count = await countWorks();
  updateLibraryCount(count);
  updateStorageEstimate();
  return count;
}

async function initLibrary() {
  try {
    const persistRequest = navigator.storage?.persist?.();
    persistRequest?.catch(() => {});
    await countWorks();
    state.libraryReady = true;
    await refreshLibraryCount();
  } catch (error) {
    console.error(error);
    state.libraryReady = false;
    els.libraryBtn.disabled = true;
    els.libraryBtn.title = 'Local library unavailable in this browser';
    toast('Local library is unavailable. Texture generation still works.', true);
  }
}

function queueArchive(delay = 800) {
  if (!state.libraryReady || state.editorOpen || !state.userHasActed) return;
  if (state.archiveTimer) clearTimeout(state.archiveTimer);
  state.archiveTimer = window.setTimeout(() => {
    state.archiveTimer = 0;
    archiveCurrent().catch((error) => console.error('Archive failed', error));
  }, delay);
}

async function archiveCurrent() {
  if (!state.libraryReady || state.editorOpen || !state.userHasActed || !state.textures) return null;
  if (archiveInFlight) return archiveInFlight;
  archiveInFlight = (async () => {
    const faces = faceUrlsFromSet(state.textures);
    const fingerprint = fingerprintFaces(faces);
    const existing = await findByFingerprint(fingerprint);
    if (existing) {
      state.currentWorkId = existing.id;
      return existing;
    }
    const work = await buildWorkFromCurrent(faces, fingerprint);
    await putWork(work);
    state.currentWorkId = work.id;
    await refreshLibraryCount();
    if (els.libraryDialog.open) refreshLibraryWorks();
    return work;
  })();
  try {
    return await archiveInFlight;
  } finally {
    archiveInFlight = null;
  }
}

async function flushArchive() {
  if (state.archiveTimer) {
    clearTimeout(state.archiveTimer);
    state.archiveTimer = 0;
  }
  return archiveCurrent();
}

function faceUrlsFromSet(textures) {
  return {
    side: textures.side.canvas.toDataURL('image/png'),
    top: textures.top.canvas.toDataURL('image/png'),
    bottom: textures.bottom.canvas.toDataURL('image/png'),
  };
}

function workThumb(textures) {
  const canvas = document.createElement('canvas');
  canvas.width = 260;
  canvas.height = 205;
  drawIsoCube(canvas, { side: textures.side.canvas, top: textures.top.canvas }, { background: '#090b07', shadow: true, pad: 0.02 });
  return canvas.toDataURL('image/png');
}

async function serializeVariation(variation) {
  return {
    seed: variation.seed,
    accent: variation.accent || null,
    faces: faceUrlsFromSet(variation.textures),
  };
}

async function buildWorkFromCurrent(faces, fingerprint) {
  const material = getMaterial(state.materialId);
  const variations = [];
  const sourceVariations = currentCustomVariations() || state.variations;
  for (const variation of sourceVariations) {
    variations.push(await serializeVariation(variation));
  }
  const now = new Date().toISOString();
  const aiMeta = state.ai
    ? {
        provider: state.ai.provider || 'unknown',
        model: state.ai.model || 'unknown',
        prompt: state.ai.aiPrompt || els.promptInput.value,
        strength: state.ai.aiStrength ?? null,
        source: state.ai.aiSource || null,
        seam: state.ai.aiSeam || null,
      }
    : null;
  return {
    id: newWorkId(),
    fingerprint,
    createdAt: now,
    updatedAt: now,
    title: textureTitle(state.materialId, state.modifiers),
    prompt: els.promptInput.value,
    materialId: state.materialId,
    materialName: material.name,
    seed: state.seed,
    size: state.size,
    finish: state.finish,
    grain: state.grain,
    contrast: state.contrast,
    hue: state.hue,
    modifiers: [...state.modifiers],
    accent: state.accent ? { ...state.accent } : null,
    promptColor: state.promptColor ? { ...state.promptColor } : null,
    palette: displayPalette(state.textures),
    kind: state.ai ? 'ai' : 'procedural',
    edited: false,
    favorite: false,
    faces,
    variations,
    versions: [],
    thumb: workThumb(state.textures),
    ai: aiMeta,
  };
}

function wrapFace(canvas, face, material, palette) {
  return {
    canvas,
    size: canvas.width,
    face,
    material,
    palette: [],
    swatches: [...palette],
    accentSwatches: [],
    overlayAccentSwatches: [],
  };
}

function buildTextureSetFromFaces(faceCanvases, size, material, palette) {
  return {
    side: wrapFace(faceCanvases.side, 'side', material, palette),
    top: wrapFace(faceCanvases.top, 'top', material, palette),
    bottom: wrapFace(faceCanvases.bottom, 'bottom', material, palette),
    material,
    palette: [...palette],
    swatches: [...palette],
    accentSwatches: [],
    overlayAccentSwatches: [],
    size,
  };
}

function loadDataUrlCanvas(url, size, label) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      canvas.getContext('2d').drawImage(image, 0, 0, size, size);
      resolve(canvas);
    };
    image.onerror = () => reject(new Error(`Could not decode ${label || 'library image'}.`));
    image.src = url;
  });
}

async function buildSetFromWork(work) {
  const material = getMaterial(work.materialId || 'cobblestone');
  const palette = Array.isArray(work.palette) ? work.palette : [];
  const [side, top, bottom] = await Promise.all([
    loadDataUrlCanvas(work.faces.side, work.size, 'side face'),
    loadDataUrlCanvas(work.faces.top, work.size, 'top face'),
    loadDataUrlCanvas(work.faces.bottom, work.size, 'bottom face'),
  ]);
  const set = buildTextureSetFromFaces({ side, top, bottom }, work.size, material, palette);
  set.ai = work.kind === 'ai';
  return set;
}

async function buildVariationsFromWork(work) {
  if (!Array.isArray(work.variations)) return [];
  const list = [];
  for (const variation of work.variations) {
    const faces = {};
    for (const face of ['side', 'top', 'bottom']) {
      faces[face] = await loadDataUrlCanvas(variation.faces[face], work.size, `${face} variation`);
    }
    const material = getMaterial(work.materialId || 'cobblestone');
    const set = buildTextureSetFromFaces(faces, work.size, material, work.palette || []);
    set.ai = work.kind === 'ai';
    set.aiSeed = variation.seed;
    list.push({ seed: variation.seed, textures: set, accent: variation.accent || work.palette?.[work.palette.length - 1] });
  }
  return list;
}

function workOriginLabel(work) {
  if (work.imported) return work.edited ? 'IMPORTED · EDIT' : 'IMPORTED';
  if (work.kind === 'ai') return work.edited ? 'AI · EDIT' : 'AI';
  if (work.edited) return 'EDITED';
  return 'PROCEDURAL';
}

function workOriginClass(work) {
  return work.imported || work.edited ? 'is-saved' : work.kind === 'ai' ? 'is-ai' : '';
}

function formatWorkDate(value) {
  try {
    return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short' }).format(new Date(value));
  } catch {
    return '—';
  }
}

function libraryFilteredWorks() {
  const query = state.libraryQuery.trim().toLowerCase();
  return state.libraryWorks.filter((work) => {
    if (state.libraryFilter === 'favorite' && !work.favorite) return false;
    if (state.libraryFilter === 'procedural' && work.kind !== 'procedural') return false;
    if (state.libraryFilter === 'ai' && work.kind !== 'ai') return false;
    if (state.libraryFilter === 'saved' && !work.edited && !work.imported) return false;
    if (!query) return true;
    return [work.title, work.prompt, String(work.seed), work.materialName].some((value) => String(value || '').toLowerCase().includes(query));
  });
}

function renderLibrary() {
  const works = libraryFilteredWorks();
  els.libraryGrid.replaceChildren();
  const fragment = document.createDocumentFragment();
  works.forEach((work, index) => {
    const card = document.createElement('article');
    card.className = 'library-card';
    card.dataset.id = work.id;
    card.style.setProperty('--i', String(index));
    const thumb = work.thumb || work.faces?.side;
    const originLabel = workOriginLabel(work);
    const originClass = workOriginClass(work);
    card.innerHTML = `
      <button class="library-open" type="button" data-action="open" aria-label="Open ${escapeHtml(work.title || 'texture')}">
        <img class="library-thumb" src="${thumb}" alt="" loading="lazy" />
        <span class="library-origin ${originClass}">${originLabel}</span>
      </button>
      <div class="library-card-actions">
        ${work.versions?.length ? `<button type="button" data-action="history" title="${work.versions.length} versions" aria-label="Version history for ${escapeHtml(work.title || 'texture')}"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="8" cy="7" r="1.4" fill="currentColor"/><circle cx="16" cy="12" r="1.4" fill="currentColor"/><circle cx="9" cy="17" r="1.4" fill="currentColor"/></svg></button>` : ''}
        <button type="button" class="${work.favorite ? 'is-favorite' : ''}" data-action="favorite" title="${work.favorite ? 'Remove from favorites' : 'Add to favorites'}" aria-label="${work.favorite ? 'Remove from favorites' : 'Add to favorites'}">
          <svg viewBox="0 0 24 24" fill="${work.favorite ? 'currentColor' : 'none'}" aria-hidden="true"><path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.4l6.1-.9L12 3Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>
        </button>
        <button type="button" data-action="delete" title="Delete from library" aria-label="Delete ${escapeHtml(work.title || 'texture')}">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 7h14M9 7V5h6v2m-8 0 .7 12h8.6L17 7M10 10.5v5.5m4-5.5v5.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </div>
      <div class="library-body">
        <div class="library-name">${escapeHtml(work.title || 'Untitled texture')}</div>
        <div class="library-prompt">${escapeHtml(work.prompt || 'No prompt saved')}</div>
        <div class="library-meta-row">
          <span>${work.size} px · #${work.seed}${work.versions?.length ? ` · ${work.versions.length}v` : ''}</span>
          <span>${formatWorkDate(work.updatedAt || work.createdAt)}</span>
        </div>
      </div>`;
    fragment.append(card);
  });
  els.libraryGrid.append(fragment);
  els.libraryResultCount.textContent = `${works.length} work${works.length === 1 ? '' : 's'}`;
  els.libraryEmpty.hidden = works.length > 0;
  const allEmpty = state.libraryWorks.length === 0;
  if (allEmpty) {
    const emptyTitle = els.libraryEmpty.querySelector('h3');
    const emptyCopy = els.libraryEmpty.querySelector('p');
    if (emptyTitle) emptyTitle.textContent = 'No textures here yet';
    if (emptyCopy) emptyCopy.textContent = 'Forge a texture, generate an AI concept, or paint something in the finisher. It will appear here automatically.';
  } else {
    const emptyTitle = els.libraryEmpty.querySelector('h3');
    const emptyCopy = els.libraryEmpty.querySelector('p');
    if (emptyTitle) emptyTitle.textContent = 'Nothing matches';
    if (emptyCopy) emptyCopy.textContent = 'Try another search or filter.';
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

async function refreshLibraryWorks() {
  if (!state.libraryReady) return;
  try {
    state.libraryWorks = await listWorks();
    renderLibrary();
    updateLibraryCount(state.libraryWorks.length);
    updateStorageEstimate();
  } catch (error) {
    console.error(error);
    toast('Could not read the local library.', true);
  }
}

async function openLibraryDialog() {
  if (!state.libraryReady) {
    toast('The local library is still opening. Try again in a moment.', true);
    return;
  }
  if (!els.libraryDialog.open) {
    document.body.classList.add('dialog-open');
    els.libraryDialog.showModal();
  }
  try {
    await flushArchive();
  } catch (error) {
    console.error('Library flush failed', error);
  }
  await refreshLibraryWorks();
  els.librarySearch.value = state.libraryQuery;
  requestAnimationFrame(() => els.librarySearch.focus());
}

function closeLibraryDialog() {
  if (els.libraryDialog.open) els.libraryDialog.close();
}

async function openLibraryWork(workId) {
  try {
    state.userHasActed = true;
    const work = await getWork(workId);
    if (!work) {
      toast('That library piece could not be found.', true);
      return;
    }
    const set = await buildSetFromWork(work);
    const variations = await buildVariationsFromWork(work);
    const material = getMaterial(work.materialId || 'cobblestone');
    state.materialId = material.id;
    state.seed = work.seed;
    state.size = work.size;
    state.finish = FINISHES.some((finish) => finish.id === work.finish) ? work.finish : 'balanced';
    state.grain = work.grain ?? 58;
    state.contrast = work.contrast ?? 55;
    state.hue = work.hue ?? 0;
    state.modifiers = [...(work.modifiers || [])];
    state.accent = work.accent || null;
    state.promptColor = work.promptColor || null;
    state.textures = set;
    state.variations = variations;
    state.currentWorkId = work.id;
    state.ai = null;
    state.loadedWork = null;
    if (work.kind === 'ai') {
      state.ai = {
        kind: 'ai',
        provider: work.ai?.provider || 'unknown',
        model: work.ai?.model || 'unknown',
        prompt: work.prompt,
        aiPrompt: work.ai?.prompt || work.prompt,
        aiSeed: work.seed,
        aiStrength: work.ai?.strength ?? null,
        aiSource: work.ai?.source || null,
        aiSeam: work.ai?.seam || null,
        textures: set,
        variations,
      };
    } else {
      state.loadedWork = {
        work,
        textures: set,
        variations,
        edited: Boolean(work.edited),
        imported: Boolean(work.imported),
        importNote: work.importNote || null,
      };
    }
    els.promptInput.value = work.prompt || '';
    updateCharCount();
    renderVariationCards(variations);
    updateStageDetails(set);
    const parsed = parsePrompt(els.promptInput.value);
    updateParsedTags(parsed);
    syncControls();
    updateActiveVariation();
    pulseStage();
    closeLibraryDialog();
    toast(`Opened ${work.title || 'saved texture'}`);
  } catch (error) {
    console.error(error);
    toast('Could not open that library piece.', true);
  }
}

async function deleteLibraryItem(workId) {
  const work = state.libraryWorks.find((item) => item.id === workId);
  if (!window.confirm(`Delete “${work?.title || 'this texture'}” from your local library? This cannot be undone.`)) return;
  try {
    await deleteWork(workId);
    if (state.currentWorkId === workId) state.currentWorkId = null;
    state.libraryWorks = state.libraryWorks.filter((item) => item.id !== workId);
    renderLibrary();
    updateLibraryCount(state.libraryWorks.length);
    toast('Removed from library');
  } catch (error) {
    console.error(error);
    toast('Could not delete that library piece.', true);
  }
}

async function toggleLibraryFavorite(workId) {
  const work = state.libraryWorks.find((item) => item.id === workId);
  if (!work) return;
  try {
    await setFavorite(workId, !work.favorite);
    work.favorite = !work.favorite;
    renderLibrary();
  } catch (error) {
    console.error(error);
    toast('Could not update favorite.', true);
  }
}

async function importLibrary(file) {
  if (!state.libraryReady) return;
  try {
    const text = await file.text();
    const payload = JSON.parse(text);
    const works = Array.isArray(payload) ? payload : payload?.works;
    if (!Array.isArray(works)) throw new Error('This is not a Blockloom library backup.');
    let imported = 0;
    let skipped = 0;
    for (const work of works) {
      if (!work?.faces?.side || !work?.faces?.top || !work?.faces?.bottom || !work?.size) {
        skipped += 1;
        continue;
      }
      const fingerprint = work.fingerprint || fingerprintFaces(work.faces);
      const existing = await findByFingerprint(fingerprint);
      if (existing) {
        skipped += 1;
        continue;
      }
      let id = work.id;
      if (!id || await getWork(id)) id = newWorkId();
      const now = new Date().toISOString();
      await putWork({
        ...work,
        id,
        fingerprint,
        favorite: Boolean(work.favorite),
        createdAt: work.createdAt || now,
        updatedAt: work.updatedAt || now,
        kind: work.kind === 'ai' ? 'ai' : 'procedural',
        edited: Boolean(work.edited),
        variations: Array.isArray(work.variations) ? work.variations : [],
        versions: Array.isArray(work.versions) ? work.versions : [],
        palette: Array.isArray(work.palette) ? work.palette : [],
      });
      imported += 1;
    }
    await refreshLibraryWorks();
    await refreshLibraryCount();
    toast(`Library restored · ${imported} added${skipped ? `, ${skipped} skipped` : ''}`);
  } catch (error) {
    console.error(error);
    toast(error.message || 'Could not restore that library backup.', true);
  }
}

async function backupLibrary() {
  if (!state.libraryReady) return;
  try {
    const works = await listWorks();
    const payload = {
      app: 'Blockloom',
      schema: 1,
      exportedAt: new Date().toISOString(),
      works,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const date = new Date().toISOString().slice(0, 10);
    downloadBlob(blob, `blockloom-library-backup-${date}.json`);
    toast(`Backup exported · ${works.length} work${works.length === 1 ? '' : 's'}`);
  } catch (error) {
    console.error(error);
    toast('Could not export the library backup.', true);
  }
}

async function updateStorageEstimate() {
  const estimate = await storageEstimate();
  if (!estimate?.usage) {
    els.libraryStorage.textContent = 'local storage';
    return;
  }
  const mb = estimate.usage / (1024 * 1024);
  els.libraryStorage.textContent = `${mb < 0.1 ? '<0.1' : mb.toFixed(1)} MB used`;
}

function paletteFromFaces(faces, size) {
  const counts = new Map();
  for (const face of ['side', 'top', 'bottom']) {
    const data = faces[face].getContext('2d').getImageData(0, 0, size, size).data;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] < 24) continue;
      const key = `${data[i]},${data[i + 1]},${data[i + 2]}`;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
  }
  const colors = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 9)
    .map(([key]) => key.split(',').map(Number));
  colors.sort((a, b) => (a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722) - (b[0] * 0.2126 + b[1] * 0.7152 + b[2] * 0.0722));
  const unique = [];
  for (const color of colors) {
    if (!unique.some((other) => Math.hypot(other[0] - color[0], other[1] - color[1], other[2] - color[2]) < 6)) unique.push(color);
  }
  return unique.slice(0, 8).map((rgb) => `#${rgb.map((v) => v.toString(16).padStart(2, '0')).join('')}`);
}

async function saveFinishedTexture({ faces, copy, size }) {
  state.userHasActed = true;
  const material = getMaterial(state.materialId);
  const faceCanvases = { ...faces };
  const palette = paletteFromFaces(faceCanvases, size);
  const set = buildTextureSetFromFaces(faceCanvases, size, material, palette);
  set.ai = Boolean(state.ai);
  const faceUrls = faceUrlsFromSet(set);
  const fingerprint = fingerprintFaces(faceUrls);
  const now = new Date().toISOString();
  let sourceWork = state.currentWorkId ? await getWork(state.currentWorkId) : null;
  const shouldCopy = copy || !sourceWork;
  const previousSnapshot = sourceWork ? createWorkSnapshot(sourceWork, now) : null;
  const previousVersions = sourceWork
    ? [...(sourceWork.versions || []), previousSnapshot].slice(-30)
    : [];
  let variations = sourceWork?.variations || [];
  if (!variations.length) {
    variations = [];
    for (const variation of (currentCustomVariations() || state.variations)) {
      variations.push(await serializeVariation(variation));
    }
  }
  if (shouldCopy) {
    sourceWork = {
      ...(sourceWork || {}),
      id: newWorkId(),
      fingerprint,
      title: sourceWork?.title || textureTitle(state.materialId, state.modifiers),
      prompt: els.promptInput.value,
      materialId: state.materialId,
      materialName: material.name,
      seed: state.seed,
      size: state.size,
      finish: state.ai ? 'ai-concept' : sourceWork?.imported ? 'imported' : state.finish,
      grain: state.grain,
      contrast: state.contrast,
      hue: state.hue,
      modifiers: [...state.modifiers],
      accent: state.accent ? { ...state.accent } : null,
      promptColor: state.promptColor ? { ...state.promptColor } : null,
      palette,
      kind: state.ai ? 'ai' : 'procedural',
      edited: true,
      favorite: false,
      faces: faceUrls,
      variations,
      versions: [],
      thumb: workThumb(set),
      ai: state.ai
        ? {
            provider: state.ai.provider || 'unknown',
            model: state.ai.model || 'unknown',
            prompt: state.ai.aiPrompt || els.promptInput.value,
            strength: state.ai.aiStrength ?? null,
            source: state.ai.aiSource || null,
            seam: state.ai.aiSeam || null,
          }
        : sourceWork?.ai || null,
      createdAt: now,
      updatedAt: now,
    };
  } else {
    sourceWork = {
      ...sourceWork,
      fingerprint,
      title: sourceWork.title || textureTitle(state.materialId, state.modifiers),
      prompt: els.promptInput.value,
      materialId: state.materialId,
      materialName: material.name,
      seed: state.seed,
      size: state.size,
      finish: state.ai ? 'ai-concept' : state.finish,
      grain: state.grain,
      contrast: state.contrast,
      hue: state.hue,
      modifiers: [...state.modifiers],
      accent: state.accent ? { ...state.accent } : null,
      promptColor: state.promptColor ? { ...state.promptColor } : null,
      palette,
      kind: state.ai ? 'ai' : sourceWork.kind || 'procedural',
      edited: true,
      faces: faceUrls,
      variations,
      versions: previousVersions,
      thumb: workThumb(set),
      ai: sourceWork.ai || (state.ai
        ? {
            provider: state.ai.provider || 'unknown',
            model: state.ai.model || 'unknown',
            prompt: state.ai.aiPrompt || els.promptInput.value,
            strength: state.ai.aiStrength ?? null,
            source: state.ai.aiSource || null,
            seam: state.ai.aiSeam || null,
          }
        : null),
      updatedAt: now,
    };
  }
  await putWork(sourceWork);
  state.currentWorkId = sourceWork.id;
  state.textures = set;
  if (sourceWork.kind === 'ai') {
    state.ai = {
      ...(state.ai || {}),
      kind: 'ai',
      provider: sourceWork.ai?.provider,
      model: sourceWork.ai?.model,
      aiPrompt: sourceWork.ai?.prompt,
      aiStrength: sourceWork.ai?.strength,
      aiSource: sourceWork.ai?.source,
      aiSeam: sourceWork.ai?.seam,
      seed: state.seed,
      aiSeed: state.seed,
      textures: set,
      variations: currentCustomVariations() || state.variations,
    };
    state.loadedWork = null;
  } else {
    state.ai = null;
    state.loadedWork = {
      work: sourceWork,
      textures: set,
      variations: currentCustomVariations() || state.variations,
      edited: true,
      imported: Boolean(sourceWork.imported),
      importNote: state.loadedWork?.importNote || sourceWork.importNote || null,
    };
  }
  updateStageDetails(state.textures);
  syncControls();
  updateParsedTags(parsePrompt(els.promptInput.value));
  updateActiveVariation();
  pulseStage();
  await refreshLibraryCount();
  if (els.libraryDialog.open) await refreshLibraryWorks();
  toast(copy ? 'Saved as a new library copy' : 'Pixels saved to library');
}

async function openFinisher() {
  if (!state.textures || state.editorOpen) return;
  state.userHasActed = true;
  if (state.archiveTimer) {
    clearTimeout(state.archiveTimer);
    state.archiveTimer = 0;
  }
  await archiveCurrent().catch((error) => console.error('Archive before edit failed', error));
  state.editorOpen = true;
  finisher.open({
    textures: state.textures,
    palette: displayPalette(state.textures),
    title: els.textureTitle.textContent,
    meta: `${state.size} × ${state.size} px · ${state.loadedWork?.imported ? `imported${state.loadedWork.importNote ? ` · ${state.loadedWork.importNote}` : ''}` : hasCustomTexture() ? 'saved copy' : 'procedural'}${state.ai ? ' · AI mode' : ''}`,
  });
}

/* ---------- Resource-pack builder ---------- */
function packTargetDefault(materialId) {
  return packTargetFor(materialId)?.id || 'stone';
}

function packEntryFromCurrent() {
  const target = packTargetDefault(state.materialId);
  return {
    key: `current-${Date.now()}`,
    source: 'current',
    workId: null,
    textures: state.textures,
    title: els.textureTitle.textContent || textureTitle(state.materialId, state.modifiers),
    materialName: getMaterial(state.materialId).name,
    seed: state.seed,
    size: state.size,
    origin: state.ai ? 'ai' : state.loadedWork?.imported ? 'imported' : state.loadedWork ? 'saved' : 'procedural',
    targetId: target,
    thumb: workThumb(state.textures),
  };
}

function packOriginLabel(origin) {
  if (origin === 'ai') return 'AI';
  if (origin === 'imported') return 'IMPORTED';
  if (origin === 'saved') return 'SAVED';
  return 'PROCEDURAL';
}

function packTargetCount(entries) {
  return new Set(entries.map((entry) => entry.targetId)).size;
}

function pickFreeTarget(desired) {
  const used = new Set(state.packEntries.map((entry) => entry.targetId));
  if (!used.has(desired)) return desired;
  return PACK_TARGETS.find((target) => !used.has(target.id))?.id || desired;
}

async function refreshPackLibrarySelect() {
  if (state.libraryReady) {
    try {
      state.libraryWorks = await listWorks();
    } catch (error) {
      console.error(error);
    }
  }
  const usedWorkIds = new Set(state.packEntries.filter((entry) => entry.workId).map((entry) => entry.workId));
  const available = state.libraryWorks.filter((work) => !usedWorkIds.has(work.id) && work.id !== state.currentWorkId);
  els.packLibrarySelect.replaceChildren();
  if (!available.length) {
    const option = document.createElement('option');
    option.textContent = state.libraryReady ? 'Every other library work is already in the pack' : 'Library is still opening';
    option.value = '';
    els.packLibrarySelect.append(option);
    els.packLibrarySelect.disabled = true;
    els.packAddBtn.disabled = true;
  } else {
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = 'Choose a library work…';
    els.packLibrarySelect.append(placeholder);
    available.forEach((work) => {
      const option = document.createElement('option');
      option.value = work.id;
      option.textContent = `${work.title || work.materialName || 'Untitled'} · #${work.seed} · ${work.size}px`;
      els.packLibrarySelect.append(option);
    });
    els.packLibrarySelect.disabled = false;
    els.packAddBtn.disabled = false;
  }
  els.packLibraryCount.textContent = `${available.length} available`;
}

function renderPackFormats() {
  els.packFormats.replaceChildren();
  const fragment = document.createDocumentFragment();
  PACK_FORMATS.forEach((format) => {
    const label = document.createElement('label');
    label.className = 'pack-format-card';
    label.innerHTML = `<input type="radio" name="pack-format" value="${format.id}" ${format.id === state.packFormatId ? 'checked' : ''} /><span><strong>${format.label}</strong><small>${format.detail} · F${format.packFormat}</small></span>`;
    fragment.append(label);
  });
  els.packFormats.append(fragment);
  updatePackFormatSummary();
}

function updatePackFormatSummary() {
  const format = getPackFormat(state.packFormatId);
  els.packFormatCode.textContent = String(format.packFormat);
  els.packFormatLabel.textContent = format.label;
  els.packFormatNote.textContent = format.note;
  updatePackTintControl();
}

function updatePackTintControl() {
  const hasGrass = state.packEntries.some((entry) => entry.targetId === 'grass_block');
  const supported = state.packFormatId !== 'broad';
  const allowed = hasGrass && supported;
  els.packTintFree.disabled = !allowed;
  els.packTintToggle.classList.toggle('is-disabled', !allowed);
  if (!allowed) {
    state.packGrassTintFree = false;
    els.packTintFree.checked = false;
  }
  els.packTintStatus.classList.toggle('is-warning', hasGrass && !supported);
  els.packTintStatus.classList.toggle('is-on', allowed && state.packGrassTintFree);
  if (!hasGrass) {
    els.packTintStatus.textContent = 'Add a Grass Block target to enable the tint-free model override.';
  } else if (!supported) {
    els.packTintStatus.textContent = 'Tint-free grass needs the 1.21+ or 1.21.9+ pack profile.';
  } else if (state.packGrassTintFree) {
    els.packTintStatus.textContent = 'Grass top renders untinted through a model override. Oak leaves still use biome tint.';
  } else {
    els.packTintStatus.textContent = 'Biome tint remains on grass tops and leaves.';
  }
}

function renderPackEntries() {
  els.packEntries.replaceChildren();
  if (!state.packEntries.length) {
    const empty = document.createElement('div');
    empty.className = 'pack-empty';
    empty.textContent = 'Add at least one texture block.';
    els.packEntries.append(empty);
    updatePackSummary();
    return;
  }
  const fragment = document.createDocumentFragment();
  state.packEntries.forEach((entry, index) => {
    const target = getPackTarget(entry.targetId) || getPackTarget('stone');
    const card = document.createElement('article');
    card.className = 'pack-entry';
    card.dataset.key = entry.key;
    const groups = new Map();
    for (const group of MATERIAL_GROUPS) groups.set(group, []);
    for (const item of PACK_TARGETS) {
      if (!groups.has(item.group)) groups.set(item.group, []);
      groups.get(item.group).push(item);
    }
    const options = [...groups.entries()]
      .filter(([, items]) => items.length)
      .map(([group, items]) => `<optgroup label="${escapeHtml(group)}">${items.map((item) => {
        const usedByOther = state.packEntries.some((other) => other.key !== entry.key && other.targetId === item.id);
        return `<option value="${item.id}" ${item.id === entry.targetId ? 'selected' : ''} ${usedByOther ? 'disabled' : ''}>${escapeHtml(item.label)}</option>`;
      }).join('')}</optgroup>`)
      .join('');
    card.innerHTML = `
      <div class="pack-entry-thumb"><img src="${entry.thumb || entry.textures.side.canvas.toDataURL('image/png')}" alt="" /></div>
      <div class="pack-entry-main">
        <div class="pack-entry-top">
          <strong title="${escapeHtml(entry.title)}">${escapeHtml(entry.title)}</strong>
          <div class="pack-entry-controls">
            <button type="button" data-move="-1" ${index === 0 ? 'disabled' : ''} aria-label="Move ${escapeHtml(entry.title)} up" title="Move up">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m7 14 5-5 5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <button type="button" data-move="1" ${index === state.packEntries.length - 1 ? 'disabled' : ''} aria-label="Move ${escapeHtml(entry.title)} down" title="Move down">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m7 10 5 5 5-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <button class="pack-entry-remove" type="button" data-remove="${entry.key}" aria-label="Remove ${escapeHtml(entry.title)}" title="Remove">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m7 7 10 10M17 7 7 17" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>
            </button>
          </div>
        </div>
        <div class="pack-entry-meta">${entry.size}px · seed ${entry.seed} · ${packOriginLabel(entry.origin)}${entry.source === 'current' ? ' · CURRENT' : ''}${index === 0 ? ' · PACK ICON' : ''}</div>
        <label>Override <select data-target="${entry.key}" aria-label="Vanilla target for ${escapeHtml(entry.title)}">${options}</select></label>
      </div>`;
    fragment.append(card);
  });
  els.packEntries.append(fragment);
  updatePackSummary();
}

function updatePackSummary() {
  const count = state.packEntries.length;
  els.packEntryCount.textContent = String(count);
  els.packTargetCount.textContent = String(packTargetCount(state.packEntries));
  const fileCount = state.packEntries.reduce((total, entry) => total + (getPackTarget(entry.targetId)?.files.length || 0), 0);
  els.packFileCount.textContent = String(fileCount + (state.packGrassTintFree && state.packEntries.some((entry) => entry.targetId === 'grass_block') && state.packFormatId !== 'broad' ? 1 : 0));
  els.packExportBtn.disabled = count === 0 || state.packBuilding;
  updatePackFormatSummary();
}

async function openPackBuilder() {
  state.packEntries = [packEntryFromCurrent()];
  state.packFormatId = 'modern';
  state.packBuilding = false;
  state.packGrassTintFree = false;
  els.packTintFree.checked = false;
  renderPackFormats();
  renderPackEntries();
  if (!els.packDialog.open) {
    document.body.classList.add('dialog-open');
    els.packDialog.showModal();
  }
  await refreshPackLibrarySelect();
  updatePackSummary();
}

function closePackBuilder() {
  if (els.packDialog.open) els.packDialog.close();
}

async function addPackLibraryEntry() {
  const id = els.packLibrarySelect.value;
  if (!id || state.packBuilding) return;
  const work = state.libraryWorks.find((item) => item.id === id);
  if (!work) return;
  try {
    const set = await buildSetFromWork(work);
    const target = pickFreeTarget(packTargetDefault(work.materialId));
    state.packEntries.push({
      key: `work-${work.id}`,
      source: 'library',
      workId: work.id,
      textures: set,
      title: work.title || work.materialName || 'Untitled texture',
      materialName: work.materialName || getMaterial(work.materialId).name,
      seed: work.seed,
      size: work.size,
      origin: work.imported ? 'imported' : work.kind,
      targetId: target,
      thumb: work.thumb || work.faces?.side,
    });
    renderPackEntries();
    await refreshPackLibrarySelect();
  } catch (error) {
    console.error(error);
    toast('Could not add that library work to the pack.', true);
  }
}

function removePackEntry(key) {
  state.packEntries = state.packEntries.filter((entry) => entry.key !== key);
  renderPackEntries();
  refreshPackLibrarySelect();
}

function movePackEntry(key, delta) {
  const index = state.packEntries.findIndex((entry) => entry.key === key);
  const target = index + Number(delta);
  if (index < 0 || target < 0 || target >= state.packEntries.length) return;
  const [entry] = state.packEntries.splice(index, 1);
  state.packEntries.splice(target, 0, entry);
  renderPackEntries();
}

function changePackTarget(key, targetId) {
  const entry = state.packEntries.find((item) => item.key === key);
  if (!entry || !getPackTarget(targetId)) return;
  const collision = state.packEntries.some((item) => item.key !== key && item.targetId === targetId);
  if (collision) {
    toast('That vanilla target is already used in this pack.', true);
    renderPackEntries();
    return;
  }
  entry.targetId = targetId;
  renderPackEntries();
}

async function buildPackFromState() {
  if (!state.packEntries.length || state.packBuilding) return;
  state.packBuilding = true;
  const previous = els.packExportBtn.querySelector('span')?.textContent || 'Build resource pack';
  els.packExportBtn.disabled = true;
  els.packExportBtn.classList.add('is-loading');
  if (els.packExportBtn.querySelector('span')) els.packExportBtn.querySelector('span').textContent = 'Packing…';
  try {
    const entries = state.packEntries.map((entry) => ({
      textures: entry.textures,
      targetId: entry.targetId,
      title: entry.title,
      materialName: entry.materialName,
      seed: entry.seed,
      size: entry.size,
      origin: entry.origin,
    }));
    const result = await buildResourcePack(entries, { formatId: state.packFormatId, grassTintFree: state.packGrassTintFree });
    downloadBlob(result.blob, result.filename);
    toast(`${result.included.length} target${result.included.length === 1 ? '' : 's'} packed · ${result.filename}`);
    closePackBuilder();
  } catch (error) {
    console.error(error);
    toast(error.message || 'Could not build the resource pack.', true);
  } finally {
    state.packBuilding = false;
    els.packExportBtn.disabled = state.packEntries.length === 0;
    els.packExportBtn.classList.remove('is-loading');
    const label = els.packExportBtn.querySelector('span');
    if (label) label.textContent = previous;
  }
}

/* ---------- Version history ---------- */
function createWorkSnapshot(work, createdAt = new Date().toISOString()) {
  return {
    id: newWorkId(),
    createdAt: work.updatedAt || createdAt,
    faces: work.faces,
    thumb: work.thumb || work.faces?.side || null,
    palette: Array.isArray(work.palette) ? work.palette : [],
    size: work.size,
    edited: Boolean(work.edited),
    label: work.edited ? 'Edited state' : 'Original',
  };
}

function formatVersionDate(value) {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(new Date(value));
  } catch {
    return '—';
  }
}

function versionCard({ title, thumb, date, current, versionId }) {
  return `<article class="version-card${current ? ' is-current' : ''}">
    <img src="${thumb}" alt="" loading="lazy" />
    <div class="version-card-copy"><strong>${escapeHtml(title)}</strong><span>${escapeHtml(date)}</span></div>
    <div class="version-card-actions">
      ${current ? '' : `<button type="button" data-version-action="restore" data-version-id="${versionId}">Restore</button>`}
      <button type="button" data-version-action="download" data-version-id="${versionId || ''}">PNG</button>
    </div>
  </article>`;
}

function renderVersionHistory(work) {
  const versions = Array.isArray(work.versions) ? work.versions : [];
  els.versionTitle.textContent = work.title || 'Texture history';
  els.versionSub.textContent = `${versions.length} earlier save${versions.length === 1 ? '' : 's'} · every finisher save adds a snapshot.`;
  const cards = [
    versionCard({
      title: 'Current',
      thumb: work.thumb || work.faces.side,
      date: formatVersionDate(work.updatedAt || work.createdAt),
      current: true,
      versionId: null,
    }),
  ];
  versions.slice().reverse().forEach((version, index) => {
    cards.push(versionCard({
      title: `Snapshot ${versions.length - index}`,
      thumb: version.thumb || version.faces?.side,
      date: formatVersionDate(version.createdAt),
      current: false,
      versionId: version.id,
    }));
  });
  els.versionGrid.innerHTML = cards.join('') + (versions.length
    ? ''
    : '<div class="version-empty">No earlier saves yet. Edit this work in the finisher and save to create a snapshot.</div>');
}

async function openVersionHistory(workId) {
  try {
    const work = await getWork(workId);
    if (!work) {
      toast('That library piece could not be found.', true);
      return;
    }
    closeLibraryDialog();
    state.versionWorkId = workId;
    renderVersionHistory(work);
    if (!els.versionDialog.open) {
      document.body.classList.add('dialog-open');
      els.versionDialog.showModal();
    }
  } catch (error) {
    console.error(error);
    toast('Could not load version history.', true);
  }
}

function closeVersionHistory() {
  if (els.versionDialog.open) els.versionDialog.close();
}

async function restoreLibraryVersion(versionId) {
  if (!state.versionWorkId) return;
  try {
    const work = await getWork(state.versionWorkId);
    const version = work?.versions?.find((item) => item.id === versionId);
    if (!work || !version) {
      toast('That snapshot could not be found.', true);
      return;
    }
    const now = new Date().toISOString();
    const currentSnapshot = createWorkSnapshot(work, now);
    work.versions = [...(work.versions || []), currentSnapshot].slice(-30);
    work.faces = version.faces;
    work.thumb = version.thumb || work.thumb;
    work.palette = Array.isArray(version.palette) ? version.palette : work.palette;
    work.size = version.size || work.size;
    work.edited = true;
    work.fingerprint = fingerprintFaces(work.faces);
    work.updatedAt = now;
    await putWork(work);
    closeVersionHistory();
    await openLibraryWork(work.id);
    toast('Version restored · current state was snapshotted first');
  } catch (error) {
    console.error(error);
    toast('Could not restore that version.', true);
  }
}

async function downloadVersionFace(versionId) {
  if (!state.versionWorkId) return;
  try {
    const work = await getWork(state.versionWorkId);
    if (!work) return;
    const version = versionId ? work.versions?.find((item) => item.id === versionId) : null;
    const faces = version?.faces || work.faces;
    const slug = String(work.title || 'texture').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const stamp = (version?.createdAt || work.updatedAt || new Date().toISOString()).slice(0, 19).replace(/[:T]/g, '-');
    downloadBlob(dataUrlToBlob(faces.side), `blockloom_${slug}_${stamp}.png`);
    toast('Version PNG exported');
  } catch (error) {
    console.error(error);
    toast('Could not export that version.', true);
  }
}


/* ---------- Shareable links ---------- */
function shareRgb(hex) {
  const value = String(hex || '').replace('#', '');
  if (!/^[0-9a-f]{6}$/i.test(value)) return [128, 128, 128];
  return [parseInt(value.slice(0, 2), 16), parseInt(value.slice(2, 4), 16), parseInt(value.slice(4, 6), 16)];
}

function sharePayload() {
  return {
    v: 1,
    app: 'Blockloom',
    title: els.textureTitle.textContent || textureTitle(state.materialId, state.modifiers),
    prompt: els.promptInput.value,
    materialId: state.materialId,
    seed: state.seed,
    size: state.size,
    finish: state.finish,
    grain: state.grain,
    contrast: state.contrast,
    hue: state.hue,
    modifiers: [...state.modifiers],
    accent: state.accent ? { ...state.accent } : null,
    promptColor: state.promptColor ? { ...state.promptColor } : null,
    palette: displayPalette(state.textures),
    faces: faceUrlsFromSet(state.textures),
    kind: state.ai ? 'ai' : state.loadedWork?.work?.kind || 'procedural',
    edited: Boolean(state.loadedWork?.edited),
    createdAt: new Date().toISOString(),
  };
}

async function copyShareLink() {
  if (!state.textures || els.shareBtn.disabled) return;
  els.shareBtn.disabled = true;
  try {
    const url = await makeShareUrl(
      sharePayload(),
      IS_TAURI
        ? { origin: 'https://meztking.github.io', pathname: '/blockloom/', maxLength: 32000 }
        : { maxLength: 32000 },
    );
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable');
      await navigator.clipboard.writeText(url);
      toast('Share link copied · the current texture travels in the URL');
    } catch {
      window.prompt('Copy this Blockloom share link:', url);
      toast('Share link ready to copy');
    }
  } catch (error) {
    console.error(error);
    toast(error.message || 'Could not build a share link.', true);
  } finally {
    els.shareBtn.disabled = false;
  }
}

async function loadSharedFromHash() {
  try {
    const payload = await readShareHash(location.hash);
    if (!payload) return false;
    if (!payload.faces?.side || !payload.faces?.top || !payload.faces?.bottom || !payload.size) {
      throw new Error('The share link is missing texture faces.');
    }
    const work = {
      ...payload,
      id: 'shared',
      title: payload.title || 'Shared texture',
      prompt: payload.prompt || '',
      materialId: payload.materialId || 'cobblestone',
      seed: Number(payload.seed) || 1,
      size: Math.min(128, Math.max(1, Number(payload.size) || 16)),
      palette: Array.isArray(payload.palette) ? payload.palette : [],
      kind: payload.kind === 'ai' ? 'ai' : 'procedural',
      edited: Boolean(payload.edited),
      versions: [],
    };
    const set = await buildSetFromWork(work);
    const palette = work.palette.length ? work.palette : ['#8a8a8a', '#5f5f5f', '#b0b0b0'];
    const rgb = palette.map(shareRgb);
    for (const face of ['side', 'top', 'bottom']) {
      set[face].palette = rgb;
      set[face].swatches = palette;
    }
    set.palette = palette;
    set.swatches = palette;
    set.aiSeed = work.seed;
    const variations = createAiVariations(set);
    state.materialId = work.materialId;
    state.seed = work.seed;
    state.size = work.size;
    state.finish = work.finish || 'balanced';
    state.grain = work.grain ?? 58;
    state.contrast = work.contrast ?? 55;
    state.hue = work.hue ?? 0;
    state.modifiers = [...(work.modifiers || [])];
    state.accent = work.accent || null;
    state.promptColor = work.promptColor || null;
    state.textures = set;
    state.variations = variations;
    state.ai = null;
    state.loadedWork = { work, textures: set, variations, edited: Boolean(work.edited), shared: true };
    state.currentWorkId = null;
    state.userHasActed = false;
    els.promptInput.value = work.prompt;
    updateCharCount();
    renderVariationCards(variations);
    updateStageDetails(set);
    updateParsedTags(parsePrompt(work.prompt));
    syncControls();
    updateActiveVariation();
    pulseStage();
    toast('Shared texture loaded');
    return true;
  } catch (error) {
    console.error(error);
    toast(error.message || 'Could not read that share link.', true);
    return false;
  }
}


/* ---------- Import existing textures ---------- */
function readTextureFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file selected.'));
      return;
    }
    const imageLike = file.type.startsWith('image/') || /\.(png|jpe?g|webp)$/i.test(file.name || '');
    if (!imageLike) {
      reject(new Error('Choose a PNG or other image file.'));
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      reject(new Error('That image is over 25 MB. Minecraft textures are normally tiny.'));
      return;
    }
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('That image could not be decoded.'));
    };
    image.src = url;
  });
}

function importedCanvas(image, plan) {
  const canvas = document.createElement('canvas');
  canvas.width = plan.targetSize;
  canvas.height = plan.targetSize;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(
    image,
    0,
    0,
    plan.sourceWidth,
    plan.cropHeight,
    0,
    0,
    plan.targetSize,
    plan.targetSize,
  );
  return canvas;
}

function setImportBusy(busy) {
  state.importing = busy;
  els.importBtn.disabled = busy;
  els.importBtn.classList.toggle('is-loading', busy);
  const small = els.importBtn.querySelector('small');
  if (small) small.textContent = busy ? 'Reading texture…' : 'PNG · square 1–512 px';
}

async function importTextureFile(file) {
  if (!file || state.importing) return;
  setImportBusy(true);
  try {
    const image = await readTextureFile(file);
    const plan = planTextureImport(image.naturalWidth || image.width, image.naturalHeight || image.height);
    if (!plan.ok) {
      toast(plan.reason, true);
      return;
    }
    const canvas = importedCanvas(image, plan);
    const palette = paletteFromFaces({ side: canvas, top: canvas, bottom: canvas }, plan.targetSize);
    const material = getMaterial(state.materialId);
    const set = buildTextureSetFromFaces({ side: canvas, top: canvas, bottom: canvas }, plan.targetSize, material, palette);
    set.ai = false;
    const faceUrls = faceUrlsFromSet(set);
    const fingerprint = fingerprintFaces(faceUrls);
    const title = importTitle(file.name);
    const importNote = [
      plan.animated ? `frame 1 of ${plan.frames}` : '',
      plan.scaled ? `scaled to ${plan.targetSize} px` : '',
    ].filter(Boolean).join(' · ') || 'original pixels';
    const prompt = `Imported from ${file.name}`.slice(0, 90);
    state.userHasActed = true;
    state.size = plan.targetSize;
    state.seed = randomSeed();
    state.modifiers = [];
    state.accent = null;
    state.promptColor = null;
    state.finish = 'balanced';
    state.textures = set;
    state.variations = [];
    state.ai = null;
    state.loadedWork = null;
    state.currentWorkId = null;
    els.promptInput.value = prompt;
    updateCharCount();

    let work = null;
    if (state.libraryReady) {
      work = await findByFingerprint(fingerprint);
    }
    if (!work) {
      work = await buildWorkFromCurrent(faceUrls, fingerprint);
      work.title = title;
      work.prompt = prompt;
      work.imported = true;
      work.finish = 'imported';
      work.edited = false;
      work.variations = [];
      work.palette = palette;
      work.thumb = workThumb(set);
      work.importNote = importNote;
      if (state.libraryReady) await putWork(work);
    }
    state.currentWorkId = work?.id || null;
    state.loadedWork = {
      work: work || {
        title,
        prompt,
        imported: true,
        size: plan.targetSize,
        kind: 'procedural',
      },
      textures: set,
      variations: [],
      edited: Boolean(work?.edited),
      imported: true,
      importNote,
    };
    state.variations = [];
    renderVariationCards([]);
    updateStageDetails(set);
    updateParsedTags(parsePrompt(prompt));
    syncControls();
    updateActiveVariation();
    pulseStage();
    if (state.libraryReady) await refreshLibraryCount();
    toast(`Imported ${title} · ${importSummary(plan)}`);
    await openFinisher();
  } catch (error) {
    console.error(error);
    toast(error.message || 'Could not import that texture.', true);
  } finally {
    setImportBusy(false);
    els.importInput.value = '';
  }
}

function showDropOverlay(show) {
  els.dropOverlay.hidden = !show;
  document.body.classList.toggle('is-dragging-file', show);
}

function bindTextureDrop() {
  window.addEventListener('dragenter', (event) => {
    if (!event.dataTransfer?.types?.includes('Files')) return;
    event.preventDefault();
    state.dragDepth += 1;
    showDropOverlay(true);
  });
  window.addEventListener('dragover', (event) => {
    if (!event.dataTransfer?.types?.includes('Files')) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  });
  window.addEventListener('dragleave', (event) => {
    if (!event.dataTransfer?.types?.includes('Files')) return;
    state.dragDepth = Math.max(0, state.dragDepth - 1);
    if (!state.dragDepth) showDropOverlay(false);
  });
  window.addEventListener('drop', (event) => {
    const file = [...(event.dataTransfer?.files || [])].find((item) => item.type.startsWith('image/') || /\.(png|jpe?g|webp)$/i.test(item.name));
    if (!file) return;
    event.preventDefault();
    state.dragDepth = 0;
    showDropOverlay(false);
    if (els.aiDialog.open || els.libraryDialog.open || els.finisherDialog.open || els.packDialog.open || els.versionDialog.open || els.itemDialog.open || els.variantSheetDialog.open || els.anyPackDialog.open || els.themeDialog.open) return;
    importTextureFile(file);
  });
}


/* ---------- Item pack studio (import only) ---------- */
function itemFilename(extension = 'png') {
  return `blockloom_${state.itemTarget.replace(/[^a-z0-9_-]+/gi, '-')}_${state.itemSize}px.${extension}`;
}

function drawItemPreviewCanvas() {
  const canvas = els.itemPreview;
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
  if (!state.itemCanvas) return;
  context.imageSmoothingEnabled = false;
  context.drawImage(state.itemCanvas, 0, 0, canvas.width, canvas.height);
}

function sampleCanvasPalette(canvas) {
  const data = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
  const counts = new Map();
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 24) continue;
    const key = `${data[i]},${data[i + 1]},${data[i + 2]}`;
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7)
    .map(([key]) => `#${key.split(',').map((value) => Number(value).toString(16).padStart(2, '0')).join('')}`);
}

function setItemButtons(enabled) {
  els.itemDownloadBtn.disabled = !enabled;
  els.itemCopyBtn.disabled = !enabled;
  els.itemPackBtn.disabled = !enabled;
}

function renderItemEmptyState() {
  state.itemCanvas = null;
  state.itemTarget = '';
  state.itemSize = 16;
  drawItemPreviewCanvas();
  els.itemTitle.textContent = 'No item selected';
  els.itemTarget.textContent = 'Import a PNG to begin';
  els.itemTargetInput.value = '';
  els.itemPalette.replaceChildren();
  setItemButtons(false);
}

async function importItemTexture(file) {
  if (!file) return;
  try {
    const image = await readTextureFile(file);
    const plan = planTextureImport(image.naturalWidth || image.width, image.naturalHeight || image.height, 512);
    if (!plan.ok) throw new Error(plan.reason);
    const targetSize = Math.min(64, plan.targetSize);
    const canvas = document.createElement('canvas');
    canvas.width = targetSize;
    canvas.height = targetSize;
    const context = canvas.getContext('2d');
    context.imageSmoothingEnabled = false;
    context.clearRect(0, 0, targetSize, targetSize);
    context.drawImage(image, 0, 0, plan.sourceWidth, plan.cropHeight, 0, 0, targetSize, targetSize);
    state.itemImported = true;
    state.itemCanvas = canvas;
    state.itemSize = targetSize;
    state.itemTarget = importTitle(file.name).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || 'imported_item';
    els.itemTitle.textContent = importTitle(file.name);
    els.itemTarget.textContent = state.itemTarget;
    els.itemTargetInput.value = state.itemTarget;
    drawItemPreviewCanvas();
    const palette = sampleCanvasPalette(canvas);
    els.itemPalette.replaceChildren();
    for (const color of palette) {
      const swatch = document.createElement('span');
      swatch.style.backgroundColor = color;
      swatch.title = color.toUpperCase();
      els.itemPalette.append(swatch);
    }
    setItemButtons(true);
    toast('Imported item texture · set the target id if needed');
  } catch (error) {
    console.error(error);
    toast(error.message || 'Could not import that item texture.', true);
  } finally {
    els.itemImportInput.value = '';
  }
}

function openItemStudio() {
  els.itemFormat.replaceChildren();
  for (const format of PACK_FORMATS) {
    const option = document.createElement('option');
    option.value = format.id;
    option.textContent = `${format.label} · F${format.packFormat}`;
    els.itemFormat.append(option);
  }
  els.itemFormat.value = state.itemFormat;
  if (state.itemCanvas) {
    els.itemTargetInput.value = state.itemTarget;
    drawItemPreviewCanvas();
    setItemButtons(true);
  } else {
    renderItemEmptyState();
  }
  if (!els.itemDialog.open) {
    document.body.classList.add('dialog-open');
    els.itemDialog.showModal();
  }
}

function closeItemStudio() {
  if (els.itemDialog.open) els.itemDialog.close();
}

async function downloadItemPng() {
  if (!state.itemCanvas) return;
  try {
    const blob = await new Promise((resolve, reject) => state.itemCanvas.toBlob((value) => (value ? resolve(value) : reject(new Error('PNG encoding failed'))), 'image/png'));
    downloadBlob(blob, itemFilename());
    toast('Item PNG exported · ' + itemFilename());
  } catch (error) {
    toast('Could not export the item PNG', true);
  }
}

async function copyItemPng() {
  if (!state.itemCanvas) return;
  if (!navigator.clipboard?.write || !window.ClipboardItem) {
    toast('Clipboard image copy is not supported here — use Download.', true);
    return;
  }
  try {
    const blob = await new Promise((resolve, reject) => state.itemCanvas.toBlob((value) => (value ? resolve(value) : reject(new Error('PNG encoding failed'))), 'image/png'));
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    toast('Item PNG copied');
  } catch {
    toast('Clipboard blocked — use Download.', true);
  }
}

async function exportItemPack() {
  if (!state.itemCanvas || els.itemPackBtn.disabled) return;
  els.itemPackBtn.disabled = true;
  const label = els.itemPackBtn.textContent;
  els.itemPackBtn.textContent = 'Packing…';
  try {
    const { blob, filename } = await buildItemResourcePack({
      canvas: state.itemCanvas,
      itemId: state.itemTarget,
      title: els.itemTitle.textContent,
      seed: 0,
      size: state.itemSize,
      material: 'imported',
      type: 'item',
      formatId: state.itemFormat,
    });
    downloadBlob(blob, filename);
    toast('Item pack exported · ' + state.itemTarget);
  } catch (error) {
    console.error(error);
    toast('Could not build the item pack', true);
  } finally {
    els.itemPackBtn.disabled = false;
    els.itemPackBtn.textContent = label;
  }
}

/* ---------- 16-variant block contact sheet ---------- */
const SHEET_OFFSETS = [
  211, 487, 881, 1327, 1879, 2473, 3191, 3943,
  4733, 5557, 6421, 7319, 8243, 9203, 10193, 11213,
];

function variantSheetSeeds() {
  return SHEET_OFFSETS.map((offset, index) => {
    const seed = ((state.seed * 17 + offset * 37) % 900000) + 1000;
    return seed === state.seed ? seed + index + 1 : seed;
  });
}

function renderVariantSheet() {
  const seeds = variantSheetSeeds();
  const fragment = document.createDocumentFragment();
  for (const seed of seeds) {
    const textures = renderTextureSet(buildParams(seed));
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `variant-sheet-card${seed === state.seed ? ' is-current' : ''}`;
    button.dataset.seed = String(seed);
    button.setAttribute('aria-label', `Load variation ${seed}`);
    const canvas = document.createElement('canvas');
    canvas.width = 240;
    canvas.height = 200;
    drawIsoCube(canvas, { side: textures.side.canvas, top: textures.top.canvas }, { shadow: true, pad: 0.02 });
    const label = document.createElement('span');
    label.textContent = `#${seed}`;
    button.append(canvas, label);
    fragment.append(button);
  }
  els.variantSheetGrid.replaceChildren(fragment);
}

function openVariantSheet() {
  if (hasCustomTexture()) {
    toast('Variations are available for procedural recipes.', true);
    return;
  }
  renderVariantSheet();
  if (!els.variantSheetDialog.open) {
    document.body.classList.add('dialog-open');
    els.variantSheetDialog.showModal();
  }
}

function closeVariantSheet() {
  if (els.variantSheetDialog.open) els.variantSheetDialog.close();
}


/* ---------- Universal texture packer ---------- */
function anyPackSafeName(name) {
  return String(name).replace(/[^a-zA-Z0-9_.-]+/g, '_').replace(/^_+|_+$/g, '') || 'texture.png';
}

function anyPackAutoPath(file) {
  const namespace = state.anyPackNamespace.replace(/[^a-z0-9_.-]/gi, '_') || 'minecraft';
  const category = state.anyPackCategory || 'block';
  return `assets/${namespace}/textures/${category}/${anyPackSafeName(file.name)}`;
}

function anyPackUniquePath(path, ignoreId = null) {
  const used = new Set(state.anyPackEntries.filter((entry) => entry.id !== ignoreId).map((entry) => entry.path));
  if (!used.has(path)) return path;
  const match = path.match(/^(.*?)(\.png(?:\.mcmeta)?)$/);
  if (!match) return path;
  let index = 2;
  let candidate = `${match[1]}_${index}${match[2]}`;
  while (used.has(candidate)) {
    index += 1;
    candidate = `${match[1]}_${index}${match[2]}`;
  }
  return candidate;
}

function renderAnyPackEntries() {
  const fragment = document.createDocumentFragment();
  for (const entry of state.anyPackEntries) {
    const row = document.createElement('div');
    row.className = 'any-entry';
    row.dataset.id = entry.id;
    const thumb = document.createElement('div');
    thumb.className = 'any-entry-thumb';
    if (entry.url) {
      const image = document.createElement('img');
      image.src = entry.url;
      image.alt = '';
      thumb.append(image);
    } else {
      const label = document.createElement('span');
      label.textContent = 'MC';
      thumb.append(label);
    }
    const main = document.createElement('div');
    main.className = 'any-entry-main';
    const path = document.createElement('input');
    path.type = 'text';
    path.value = entry.path;
    path.spellcheck = false;
    path.setAttribute('aria-label', `Path for ${entry.file.name}`);
    path.addEventListener('input', () => {
      entry.path = path.value.trim();
    });
    const detail = document.createElement('small');
    detail.textContent = `${entry.width ? `${entry.width}×${entry.height} · ` : ''}${(entry.file.size / 1024).toFixed(1)} KB · ${entry.file.name}`;
    main.append(path, detail);
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'any-entry-remove';
    remove.textContent = '×';
    remove.title = 'Remove file';
    remove.setAttribute('aria-label', `Remove ${entry.file.name}`);
    remove.addEventListener('click', () => {
      if (entry.url) URL.revokeObjectURL(entry.url);
      state.anyPackEntries = state.anyPackEntries.filter((item) => item.id !== entry.id);
      renderAnyPackEntries();
    });
    row.append(thumb, main, remove);
    fragment.append(row);
  }
  els.anyPackList.replaceChildren(fragment);
  els.anyPackEmpty.hidden = state.anyPackEntries.length > 0;
  els.anyPackCount.textContent = `${state.anyPackEntries.length} file${state.anyPackEntries.length === 1 ? '' : 's'}`;
  els.anyPackExportBtn.disabled = state.anyPackEntries.length === 0;
}

async function addAnyPackFiles(files) {
  for (const file of files) {
    const isMeta = file.name.toLowerCase().endsWith('.png.mcmeta');
    const isPng = file.type === 'image/png' && file.name.toLowerCase().endsWith('.png');
    if (!isMeta && !isPng) {
      toast(`${file.name} is not a PNG or .png.mcmeta file.`, true);
      continue;
    }
    let width = 0;
    let height = 0;
    if (isPng) {
      try {
        const bitmap = await createImageBitmap(file);
        width = bitmap.width;
        height = bitmap.height;
        bitmap.close?.();
      } catch {
        toast(`${file.name} could not be decoded.`, true);
        continue;
      }
      const expected = { 'entity/equipment/humanoid': [64, 32], 'entity/equipment/humanoid_leggings': [64, 32], 'gui/container': [256, 256], particle: [8, 8] }[state.anyPackCategory];
      if (expected && (width !== expected[0] || height !== expected[1])) toast(`${file.name} is ${width}×${height}; expected ${expected[0]}×${expected[1]} for this folder.`, true);
    }
    const entry = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      file,
      path: anyPackUniquePath(anyPackAutoPath(file)),
      width,
      height,
      url: isPng ? URL.createObjectURL(file) : null,
    };
    state.anyPackEntries.push(entry);
  }
  renderAnyPackEntries();
}

const ANY_PACK_HINTS = {
  block: 'Block textures: 16×16, opaque; cut-outs need alpha.',
  item: 'Item icons: 16×16 with transparency.',
  entity: 'Entity skins are usually 64×64 or 64×32.',
  'entity/equipment/humanoid': 'Modern armor layer: 64×32, one image for helmet/chest/boots.',
  'entity/equipment/humanoid_leggings': 'Modern leggings layer: 64×32.',
  'gui/container': 'Container GUI sheets are usually 256×256.',
  'gui/sprites': 'GUI sprites can be any size; .mcmeta controls nine-slice/tile scaling.',
  particle: 'Particles are usually 8×8.',
  painting: 'Painting sizes vary; match the target canvas.',
  environment: 'Environment textures are fixed-size vanilla assets.',
  misc: 'Any texture path under assets/<namespace>/textures/.',
};

function syncAnyPackSettings() {
  els.anyPackOrigNote.textContent = ANY_PACK_HINTS[els.anyPackCategory.value] || 'Paths are editable after import.';
  state.anyPackName = els.anyPackName.value.trim() || 'Blockloom Custom Pack';
  state.anyPackNamespace = els.anyPackNamespace.value.trim() || 'minecraft';
  state.anyPackCategory = els.anyPackCategory.value;
  state.anyPackFormat = els.anyPackFormat.value;
}

function renderAnyPackTemplates() {
  els.anyPackTemplate.replaceChildren();
  const none = document.createElement('option');
  none.value = '';
  none.textContent = 'No template';
  els.anyPackTemplate.append(none);
  for (const preset of TEMPLATE_PRESETS) {
    const option = document.createElement('option');
    option.value = preset.id;
    option.textContent = preset.name;
    els.anyPackTemplate.append(option);
  }
  els.anyPackTemplate.value = '';
  syncAnyPackTemplate();
}

function syncAnyPackTemplate() {
  const id = els.anyPackTemplate.value;
  if (!id) {
    els.anyPackTemplateNote.textContent = 'Optional: pick a format template';
    els.anyPackTemplateMetaBtn.hidden = true;
    els.anyPackTemplateBlankBtn.disabled = true;
    els.anyPackTemplateGuideBtn.disabled = true;
    return;
  }
  const preset = getTemplatePreset(id);
  els.anyPackTemplateNote.textContent = `${preset.width}×${preset.height}${preset.path ? ' · ' + preset.path : ' · download only'}`;
  els.anyPackTemplateNote.title = preset.note;
  els.anyPackTemplateMetaBtn.hidden = !preset.meta;
  els.anyPackTemplateBlankBtn.disabled = false;
  els.anyPackTemplateGuideBtn.disabled = false;
}

async function downloadTemplate(guide) {
  const preset = getTemplatePreset(els.anyPackTemplate.value);
  const canvas = createTemplateCanvas(preset, { guide });
  const blob = await new Promise((resolve, reject) => canvas.toBlob((value) => (value ? resolve(value) : reject(new Error('PNG encoding failed'))), 'image/png'));
  const mode = guide ? 'guide' : 'blank';
  downloadBlob(blob, `blockloom_${preset.id}_${mode}_${preset.width}x${preset.height}.png`);
  toast(`${preset.name} · ${mode} template`);
}

function downloadTemplateMeta() {
  const preset = getTemplatePreset(els.anyPackTemplate.value);
  const meta = templateMeta(preset);
  if (!meta) return;
  downloadBlob(new Blob([meta], { type: 'application/json' }), 'template.png.mcmeta');
  toast('Animation .mcmeta template');
}

function openAnyPack(templateId = null) {
  els.anyPackName.value = state.anyPackName;
  els.anyPackNamespace.value = state.anyPackNamespace;
  els.anyPackCategory.value = state.anyPackCategory;
  els.anyPackFormat.replaceChildren();
  for (const format of PACK_FORMATS) {
    const option = document.createElement('option');
    option.value = format.id;
    option.textContent = `${format.label} · F${format.packFormat}`;
    els.anyPackFormat.append(option);
  }
  els.anyPackFormat.value = state.anyPackFormat;
  renderAnyPackTemplates();
  els.anyPackTemplate.value = templateId || '';
  syncAnyPackTemplate();
  renderAnyPackEntries();
  if (!els.anyPackDialog.open) {
    document.body.classList.add('dialog-open');
    els.anyPackDialog.showModal();
  }
}

function closeAnyPack() {
  if (els.anyPackDialog.open) els.anyPackDialog.close();
}

async function exportAnyPack() {
  if (!state.anyPackEntries.length || els.anyPackExportBtn.disabled) return;
  const paths = new Set();
  for (const entry of state.anyPackEntries) {
    if (!entry.path || paths.has(entry.path)) {
      toast(`Duplicate or empty path: ${entry.path || entry.file.name}`, true);
      return;
    }
    paths.add(entry.path);
  }
  els.anyPackExportBtn.disabled = true;
  const label = els.anyPackExportBtn.textContent;
  els.anyPackExportBtn.textContent = 'Packing…';
  try {
    const { blob, filename } = await buildAnyResourcePack(state.anyPackEntries, {
      formatId: state.anyPackFormat,
      packName: state.anyPackName,
    });
    downloadBlob(blob, filename);
    toast(`Universal pack exported · ${state.anyPackEntries.length} files`);
  } catch (error) {
    console.error(error);
    toast(error.message || 'Could not build the universal pack.', true);
  } finally {
    els.anyPackExportBtn.disabled = state.anyPackEntries.length === 0;
    els.anyPackExportBtn.textContent = label;
  }
}


/* ---------- Theme motif sheets ---------- */
function activeTheme() {
  return THEMES.find((theme) => theme.id === state.themeId) || THEMES[0];
}

function themeFilename() {
  const motif = state.themeSelected?.recipe?.motif || 'theme';
  return `blockloom_${motif}_${state.themeSeed}_16px.png`;
}

function renderThemeTabs() {
  const fragment = document.createDocumentFragment();
  for (const theme of THEMES) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `theme-tab${theme.id === state.themeId ? ' active' : ''}`;
    button.dataset.theme = theme.id;
    button.textContent = theme.name;
    fragment.append(button);
  }
  els.themeTabs.replaceChildren(fragment);
}

function renderThemeSheet() {
  state.themeSheet = generateThemeSheet({ themeId: state.themeId, seed: state.themeSeed, size: 16 });
  if (!state.themeSelected || state.themeSelected.recipe.theme !== state.themeId) {
    state.themeSelected = state.themeSheet.motifs[0];
  }
  const fragment = document.createDocumentFragment();
  for (const motif of state.themeSheet.motifs) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `theme-card${motif.recipe.motif === state.themeSelected.recipe.motif ? ' is-current' : ''}`;
    button.dataset.motif = motif.recipe.motif;
    button.title = motif.recipe.motifName;
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    drawRgba(canvas, motif);
    button.append(canvas);
    fragment.append(button);
  }
  els.themeGrid.replaceChildren(fragment);
  els.themeSeed.value = state.themeSeed;
}

function drawRgba(canvas, result) {
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  const src = document.createElement('canvas');
  src.width = result.width;
  src.height = result.height;
  const srcCtx = src.getContext('2d');
  const image = srcCtx.createImageData(result.width, result.height);
  image.data.set(result.rgba);
  srcCtx.putImageData(image, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(src, 0, 0, canvas.width, canvas.height);
  return src;
}

function drawThemePreview() {
  if (!state.themeSelected) return;
  state.themeCanvas = drawRgba(els.themePreview, state.themeSelected);
  els.themeTitle.textContent = state.themeSelected.recipe.motifName;
  els.themeTarget.textContent = `${state.themeSelected.recipe.theme} / ${state.themeSelected.recipe.motif}`;
  const theme = activeTheme();
  els.themePalette.replaceChildren();
  for (const color of [theme.palette.dark, theme.palette.light, theme.palette.accent, theme.palette.gold || theme.palette.accent]) {
    const swatch = document.createElement('span');
    swatch.style.backgroundColor = color;
    swatch.title = color;
    els.themePalette.append(swatch);
  }
}

function renderThemeStudio() {
  renderThemeTabs();
  renderThemeSheet();
  drawThemePreview();
}

function openThemeStudio() {
  const detected = detectTheme(els.promptInput.value);
  if (detected) {
    state.themeId = detected;
    state.themeSelected = null;
  }
  els.themeFormat.replaceChildren();
  for (const format of PACK_FORMATS) {
    const option = document.createElement('option');
    option.value = format.id;
    option.textContent = `${format.label} · F${format.packFormat}`;
    els.themeFormat.append(option);
  }
  els.themeFormat.value = state.themeFormat;
  renderThemeStudio();
  if (!els.themeDialog.open) {
    document.body.classList.add('dialog-open');
    els.themeDialog.showModal();
  }
}

function closeThemeStudio() {
  if (els.themeDialog.open) els.themeDialog.close();
}

async function themePngBlob(result) {
  const canvas = document.createElement('canvas');
  canvas.width = result.width;
  canvas.height = result.height;
  drawRgba(canvas, result);
  return await new Promise((resolve, reject) => canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('PNG encoding failed'))), 'image/png'));
}

async function downloadThemePng() {
  if (!state.themeSelected) return;
  try {
    const blob = await themePngBlob(state.themeSelected);
    downloadBlob(blob, themeFilename());
    toast('Theme motif PNG exported');
  } catch (error) {
    toast('Could not export the theme PNG', true);
  }
}

async function copyThemePng() {
  if (!state.themeSelected) return;
  if (!navigator.clipboard?.write || !window.ClipboardItem) {
    toast('Clipboard image copy is not supported here — use Download.', true);
    return;
  }
  try {
    const blob = await themePngBlob(state.themeSelected);
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    toast('Theme motif copied');
  } catch {
    toast('Clipboard blocked — use Download.', true);
  }
}

async function exportThemePack() {
  if (!state.themeSheet || els.themePackBtn.disabled) return;
  els.themePackBtn.disabled = true;
  const label = els.themePackBtn.textContent;
  els.themePackBtn.textContent = 'Packing…';
  try {
    const theme = activeTheme();
    const entries = [];
    for (const motif of state.themeSheet.motifs) {
      const blob = await themePngBlob(motif);
      entries.push({
        id: motif.recipe.motif,
        file: new File([blob], `${motif.recipe.motif}.png`, { type: 'image/png' }),
        path: `assets/minecraft/textures/block/${motif.recipe.motif}.png`,
        width: motif.width,
        height: motif.height,
        url: null,
      });
    }
    const { blob, filename } = await buildAnyResourcePack(entries, {
      formatId: state.themeFormat,
      packName: `${theme.name} · 16 motif set`,
    });
    downloadBlob(blob, filename);
    toast(`${theme.name} 16-pack exported`);
  } catch (error) {
    console.error(error);
    toast(error.message || 'Could not build the theme pack.', true);
  } finally {
    els.themePackBtn.disabled = false;
    els.themePackBtn.textContent = label;
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
  state.userHasActed = true;
  clearAiMode({ rerender: false, silent: true });
  state.seed = clamp(Math.floor(Number(seed) || 1), 1, 999999999);
  els.seedInput.value = state.seed;
  if (full) renderAll({ variations: true, pulse: true });
  else renderCurrentOnly({ pulse: true });
}

function reroll() {
  state.userHasActed = true;
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
  const base = state.loadedWork?.work?.title || getMaterial(state.materialId).name;
  const slug = base.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'texture';
  const suffix = state.ai ? '_ai' : state.loadedWork?.imported ? '_imported' : state.loadedWork ? '_saved' : '';
  return `blockloom_${slug}${suffix}_${state.seed}_${state.size}px.${extension}`;
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
    if (hasCustomTexture()) {
      state.variations = currentCustomVariations() || [];
    } else {
      renderVariations();
    }
    const origin = state.ai
      ? 'AI concept (post-processed in browser)'
      : state.loadedWork?.imported
        ? 'Imported Minecraft texture'
        : state.loadedWork
          ? 'Saved library work'
          : 'Procedural studio';
    const readme = [
      'BLOCKLOOM TEXTURE SET',
      '=====================',
      '',
      `Source:     ${state.loadedWork?.imported ? state.loadedWork.work.title : getMaterial(state.materialId).name}`,
      `Origin:     ${origin}`,
      `Prompt:     ${els.promptInput.value}`,
      `Seed:       ${state.seed}`,
      `Resolution: ${state.size} × ${state.size} px`,
      `Finish:     ${state.ai ? 'AI concept' : state.loadedWork?.imported ? 'Original imported pixels' : state.loadedWork ? 'Saved / edited' : state.finish}`,
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
      origin: state.ai ? 'ai' : state.loadedWork ? 'saved' : 'procedural',
      provider: state.ai?.provider || null,
      model: state.ai?.model || null,
      material: getMaterial(state.materialId).name,
      prompt: els.promptInput.value,
      seed: state.seed,
      resolution: state.size,
      finish: state.ai ? 'ai-concept' : state.loadedWork ? 'saved' : state.finish,
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
  els.materialSearch.addEventListener('input', () => {
    state.materialQuery = els.materialSearch.value;
    renderMaterialPicker();
  });
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
      state.userHasActed = true;
      clearAiMode({ rerender: false, silent: true });
      state.finish = button.dataset.finish;
      syncControls();
      renderAll({ variations: true, pulse: true });
    });
  });

  const bindRange = (range, output, key, formatter = (value) => value) => {
    range.addEventListener('input', () => {
      state.userHasActed = true;
      clearAiMode({ rerender: false, silent: true });
      state[key] = Number(range.value);
      output.textContent = formatter(Number(range.value));
      updateRangeFill(range);
      scheduleQuickRender();
    });
    range.addEventListener('change', () => {
      state.userHasActed = true;
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
    state.userHasActed = true;
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
    state.userHasActed = true;
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
  els.downloadPackBtn.addEventListener('click', openPackBuilder);
  els.closePackBtn.addEventListener('click', closePackBuilder);
  els.packDialog.addEventListener('click', (event) => {
    if (event.target === els.packDialog) closePackBuilder();
  });
  els.packDialog.addEventListener('close', () => {
    syncDialogBody();
  });
  els.packAddBtn.addEventListener('click', addPackLibraryEntry);
  els.packExportBtn.addEventListener('click', buildPackFromState);
  els.packEntries.addEventListener('click', (event) => {
    const remove = event.target.closest('[data-remove]');
    if (remove) {
      removePackEntry(remove.dataset.remove);
      return;
    }
    const move = event.target.closest('[data-move]');
    const card = event.target.closest('[data-key]');
    if (move && card) movePackEntry(card.dataset.key, Number(move.dataset.move));
  });
  els.packEntries.addEventListener('change', (event) => {
    const select = event.target.closest('[data-target]');
    if (select) changePackTarget(select.dataset.target, select.value);
  });
  els.packTintFree.addEventListener('change', () => {
    state.packGrassTintFree = els.packTintFree.checked && !els.packTintFree.disabled;
    updatePackTintControl();
    updatePackSummary();
  });
  els.packFormats.addEventListener('change', (event) => {
    const input = event.target.closest('input[name="pack-format"]');
    if (!input) return;
    state.packFormatId = input.value;
    updatePackFormatSummary();
    updatePackSummary();
  });

  els.libraryBtn.addEventListener('click', openLibraryDialog);
  els.closeLibraryBtn.addEventListener('click', closeLibraryDialog);
  els.libraryBackupBtn.addEventListener('click', backupLibrary);
  els.libraryImportBtn.addEventListener('click', () => els.libraryImportInput.click());
  els.libraryImportInput.addEventListener('change', () => {
    const file = els.libraryImportInput.files?.[0];
    if (file) importLibrary(file).finally(() => { els.libraryImportInput.value = ''; });
  });
  els.libraryDialog.addEventListener('click', (event) => {
    if (event.target === els.libraryDialog) closeLibraryDialog();
  });
  els.libraryDialog.addEventListener('close', () => {
    syncDialogBody();
  });
  els.closeVersionBtn.addEventListener('click', closeVersionHistory);
  els.versionBackBtn.addEventListener('click', () => {
    closeVersionHistory();
    openLibraryDialog();
  });
  els.versionDialog.addEventListener('click', (event) => {
    if (event.target === els.versionDialog) closeVersionHistory();
  });
  els.versionDialog.addEventListener('close', () => {
    syncDialogBody();
  });
  els.versionGrid.addEventListener('click', (event) => {
    const action = event.target.closest('[data-version-action]')?.dataset.versionAction;
    if (!action) return;
    const id = event.target.closest('[data-version-id]')?.dataset.versionId || null;
    if (action === 'restore' && id) restoreLibraryVersion(id);
    if (action === 'download') downloadVersionFace(id);
  });
  els.librarySearch.addEventListener('input', () => {
    state.libraryQuery = els.librarySearch.value;
    renderLibrary();
  });
  els.libraryFilters.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-filter]');
    if (!button) return;
    state.libraryFilter = button.dataset.filter;
    $$('button[data-filter]', els.libraryFilters).forEach((item) => item.classList.toggle('active', item === button));
    renderLibrary();
  });
  els.libraryGrid.addEventListener('click', (event) => {
    const action = event.target.closest('[data-action]')?.dataset.action;
    const card = event.target.closest('.library-card');
    if (!action || !card) return;
    if (action === 'open') openLibraryWork(card.dataset.id);
    else if (action === 'delete') deleteLibraryItem(card.dataset.id);
    else if (action === 'favorite') toggleLibraryFavorite(card.dataset.id);
    else if (action === 'history') openVersionHistory(card.dataset.id);
  });
  els.importBtn.addEventListener('click', () => {
    if (!state.importing) els.importInput.click();
  });
  els.importInput.addEventListener('change', () => {
    const file = els.importInput.files?.[0];
    if (file) importTextureFile(file);
  });
  bindTextureDrop();
  els.itemStudioBtn.addEventListener('click', openItemStudio);
  els.closeItemBtn.addEventListener('click', closeItemStudio);
  els.itemDialog.addEventListener('click', (event) => {
    if (event.target === els.itemDialog) closeItemStudio();
  });
  els.itemDialog.addEventListener('close', () => syncDialogBody());
  els.itemDownloadBtn.addEventListener('click', downloadItemPng);
  els.itemCopyBtn.addEventListener('click', copyItemPng);
  els.itemFormat.addEventListener('change', () => { state.itemFormat = els.itemFormat.value; });
  els.itemPackBtn.addEventListener('click', exportItemPack);
  els.variantSheetBtn.addEventListener('click', openVariantSheet);
  els.closeVariantSheetBtn.addEventListener('click', closeVariantSheet);
  els.variantSheetDialog.addEventListener('click', (event) => {
    if (event.target === els.variantSheetDialog) closeVariantSheet();
  });
  els.variantSheetDialog.addEventListener('close', () => syncDialogBody());
  els.anyPackBtn.addEventListener('click', openAnyPack);
  els.closeAnyPackBtn.addEventListener('click', closeAnyPack);
  els.anyPackDialog.addEventListener('click', (event) => {
    if (event.target === els.anyPackDialog) closeAnyPack();
  });
  els.anyPackDialog.addEventListener('close', () => syncDialogBody());
  els.anyPackAddBtn.addEventListener('click', () => els.anyPackInput.click());
  els.anyPackInput.addEventListener('change', () => {
    const files = [...(els.anyPackInput.files || [])];
    els.anyPackInput.value = '';
    if (files.length) addAnyPackFiles(files);
  });
  for (const input of [els.anyPackName, els.anyPackNamespace]) input.addEventListener('input', syncAnyPackSettings);
  els.anyPackCategory.addEventListener('change', syncAnyPackSettings);
  els.anyPackFormat.addEventListener('change', syncAnyPackSettings);
  els.anyPackExportBtn.addEventListener('click', exportAnyPack);
  els.anyPackTemplate.addEventListener('change', syncAnyPackTemplate);
  els.anyPackTemplateBlankBtn.addEventListener('click', () => downloadTemplate(false));
  els.anyPackTemplateGuideBtn.addEventListener('click', () => downloadTemplate(true));
  els.anyPackTemplateMetaBtn.addEventListener('click', downloadTemplateMeta);
  els.themeStudioBtn.addEventListener('click', openThemeStudio);
  els.closeThemeBtn.addEventListener('click', closeThemeStudio);
  els.themeDialog.addEventListener('click', (event) => { if (event.target === els.themeDialog) closeThemeStudio(); });
  els.themeDialog.addEventListener('close', () => syncDialogBody());
  els.themeTabs.addEventListener('click', (event) => {
    const button = event.target.closest('[data-theme]');
    if (!button) return;
    state.themeId = button.dataset.theme;
    state.themeSelected = null;
    renderThemeStudio();
  });
  els.themeGrid.addEventListener('click', (event) => {
    const button = event.target.closest('[data-motif]');
    if (!button) return;
    state.themeSelected = state.themeSheet.motifs.find((motif) => motif.recipe.motif === button.dataset.motif) || state.themeSelected;
    for (const card of $$('.theme-card', els.themeGrid)) card.classList.toggle('is-current', card === button);
    drawThemePreview();
  });
  els.themeSeed.addEventListener('input', () => {
    const value = Number(els.themeSeed.value);
    if (Number.isFinite(value) && value >= 1) { state.themeSeed = Math.min(999999999, Math.round(value)); state.themeSelected = null; renderThemeSheet(); drawThemePreview(); }
  });
  els.themeDice.addEventListener('click', () => { state.themeSeed = randomSeed(); state.themeSelected = null; renderThemeSheet(); drawThemePreview(); });
  els.themeFormat.addEventListener('change', () => { state.themeFormat = els.themeFormat.value; });
  els.themeDownloadBtn.addEventListener('click', downloadThemePng);
  els.themeCopyBtn.addEventListener('click', copyThemePng);
  els.themePackBtn.addEventListener('click', exportThemePack);
  els.variantSheetGrid.addEventListener('click', (event) => {
    const card = event.target.closest('[data-seed]');
    if (!card) return;
    const seed = Number(card.dataset.seed);
    closeVariantSheet();
    setSeed(seed, { full: true });
    toast('Loaded variation #' + seed);
  });
  els.itemImportBtn.addEventListener('click', () => els.itemImportInput.click());
  els.itemImportInput.addEventListener('change', () => {
    const file = els.itemImportInput.files?.[0];
    if (file) importItemTexture(file);
  });
  els.itemTargetInput.addEventListener('input', () => {
    const value = els.itemTargetInput.value.toLowerCase().replace(/[^a-z0-9_-]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 64);
    state.itemTarget = value || (state.itemCurrent?.recipe?.itemId || 'imported_item');
    els.itemTarget.textContent = state.itemTarget;
  });
  els.finishBtn.addEventListener('click', openFinisher);
  els.shareBtn.addEventListener('click', copyShareLink);
  els.finisherDialog.addEventListener('close', () => {
    state.editorOpen = false;
    syncDialogBody();
  });

  els.aiBtn.addEventListener('click', openAiDialog);
  els.aiBadge.addEventListener('click', () => {
    clearAiMode({ rerender: true });
  });
  els.closeAiBtn.addEventListener('click', closeAiDialog);
  els.aiForm.addEventListener('submit', submitAiConcept);
  els.aiPromptInput.addEventListener('input', updateAiPromptCount);
  els.aiConceptCountGroup.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-concepts]');
    if (!button || state.aiBusy) return;
    state.aiConceptCount = Number(button.dataset.concepts);
    setAiConceptCountUI();
  });
  els.aiAddCandidate.addEventListener('click', addAiConcept);
  els.aiUseCandidate.addEventListener('click', useSelectedAiCandidate);
  els.aiCandidateGrid.addEventListener('click', (event) => {
    const card = event.target.closest('[data-candidate]');
    if (card) selectAiCandidate(Number(card.dataset.candidate));
  });
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
    syncDialogBody();
  });

  els.variationGrid.addEventListener('click', (event) => {
    const card = event.target.closest('.variation-card');
    if (!card) return;
    const seed = Number(card.dataset.seed);
    if (!seed) return;
    state.userHasActed = true;
    const customVariations = currentCustomVariations();
    if (state.ai || state.loadedWork) {
      const variant = customVariations?.find((item) => item.seed === seed);
      if (!variant) return;
      state.seed = seed;
      if (state.ai) {
        state.ai.seed = seed;
        state.ai.textures = variant.textures;
      } else {
        state.loadedWork.textures = variant.textures;
        state.loadedWork.seed = seed;
      }
      state.textures = variant.textures;
      els.seedInput.value = seed;
      updateStageDetails(state.textures);
      updateActiveVariation();
      pulseStage();
      toast('Loaded saved cut #' + seed);
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
    syncDialogBody();
  });
  document.addEventListener('keydown', (event) => {
    if (els.howDialog.open || els.aiDialog.open || els.libraryDialog.open || els.finisherDialog.open || els.packDialog.open || els.versionDialog.open) return;
    if (event.repeat) return;
    const command = event.metaKey || event.ctrlKey;
    if (command && !event.altKey) {
      if (event.key === 'Enter') {
        event.preventDefault();
        applyPrompt({ newSeed: true });
        return;
      }
      if (event.key.toLowerCase() === 'k') {
        event.preventDefault();
        openLibraryDialog();
        return;
      }
    }
    const tag = event.target.tagName;
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag) || event.target.isContentEditable) return;
    if (command || event.altKey) return;
    const key = event.key.toLowerCase();
    if (key === 'g') {
      event.preventDefault();
      applyPrompt({ newSeed: true });
    } else if (key === 'r') {
      event.preventDefault();
      reroll();
    } else if (key === 'l') {
      event.preventDefault();
      openLibraryDialog();
    } else if (key === 'f') {
      event.preventDefault();
      openFinisher();
    } else if (key === 'a') {
      event.preventDefault();
      openAiDialog();
    } else if (key === 'i') {
      event.preventDefault();
      if (!state.importing) els.importInput.click();
    } else if (key === 'p') {
      event.preventDefault();
      openPackBuilder();
    } else if (key === 'w') {
      event.preventDefault();
      openItemStudio();
    } else if (key === 'u') {
      event.preventDefault();
      openAnyPack();
    } else if (key === 't') {
      event.preventDefault();
      openThemeStudio();
    } else if (key === 's') {
      event.preventDefault();
      copyShareLink();
    } else if (key === 'e') {
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

async function checkForUpdates() {
  if (!IS_TAURI || els.updateBtn.disabled) return;
  els.updateBtn.disabled = true;
  const previous = els.updateBtn.textContent;
  els.updateBtn.textContent = 'Checking…';
  try {
    const response = await fetch('https://api.github.com/repos/MEZTKING/blockloom/releases/latest', {
      headers: { Accept: 'application/vnd.github+json' },
    });
    if (!response.ok) throw new Error(`GitHub returned ${response.status}`);
    const info = releaseInfo(await response.json(), APP_VERSION);
    if (!info.newer) {
      toast(`Blockloom is up to date · v${APP_VERSION}`);
      els.updateBtn.textContent = 'Check updates';
      return;
    }
    els.updateBtn.textContent = `Update v${info.latest}`;
    if (window.confirm(`Blockloom v${info.latest} is available. Open the release page?`)) {
      await window.__TAURI_INTERNALS__.invoke('open_external', { url: info.url });
    }
  } catch (error) {
    console.error(error);
    toast('Could not check for updates. Open the GitHub releases page manually.', true);
    els.updateBtn.textContent = 'Releases';
  } finally {
    els.updateBtn.disabled = false;
    if (els.updateBtn.textContent === 'Checking…') els.updateBtn.textContent = previous;
  }
}

function updateClock() {
  const time = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date());
  els.footerClock.textContent = `${navigator.onLine ? 'LOCAL' : 'OFFLINE'} · ${time}`;
}

async function registerOfflineWorker() {
  if (IS_TAURI || !('serviceWorker' in navigator) || !/^https?:$/.test(location.protocol)) return;
  try {
    await navigator.serviceWorker.register(new URL('../sw.js', import.meta.url));
  } catch (error) {
    console.warn('Offline worker registration failed', error);
  }
}

function initUiZoom() {
  const key = 'blockloom-ui-zoom';
  const steps = [1, 1.1, 1.2];
  let value = 1.1;
  try {
    const stored = Number(localStorage.getItem(key));
    if (steps.includes(stored)) value = stored;
  } catch { /* private mode */ }
  const apply = () => {
    document.documentElement.style.setProperty('--ui-zoom', String(value));
    if (els.fontScaleBtn) els.fontScaleBtn.textContent = `Text ${Math.round(value * 100)}%`;
  };
  apply();
  els.fontScaleBtn?.addEventListener('click', () => {
    value = steps[(steps.indexOf(value) + 1) % steps.length];
    try { localStorage.setItem(key, String(value)); } catch { /* private mode */ }
    apply();
    toast(`UI text ${Math.round(value * 100)}%`);
  });
}

function init() {
  initUiZoom();
  document.querySelector('.make-grid')?.addEventListener('click', (event) => {
    const card = event.target.closest('[data-make]');
    if (!card) return;
    const make = card.dataset.make;
    if (make === 'blocks') {
      els.promptInput.focus();
      els.promptInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else if (make === 'themes') openThemeStudio();
    else if (make === 'items') openItemStudio();
    else if (make === 'entities') openAnyPack('entity_skin');
    else if (make === 'players') openAnyPack('player_skin');
    else if (make === 'armor') openAnyPack('armor_layer');
    else if (make === 'gui') openAnyPack('gui_container');
    else if (make === 'animation') openAnyPack('animation');
    else if (make === 'particles') openAnyPack('particle');
    else if (make === 'paintings') openAnyPack('painting');
    else if (make === 'environment') openAnyPack('sun');
    else openAnyPack();
  });
  if (PROCEDURAL_ONLY) {
    const mode = $('#engineMode');
    if (mode) mode.textContent = IS_TAURI ? 'DESKTOP' : IS_STATIC_DEMO ? 'STATIC DEMO' : 'PROCEDURAL';
    els.aiBtn?.setAttribute('title', IS_TAURI ? 'Windows build — AI is not bundled' : 'Procedural-only session — AI is off');
  }
  els.materialCount.textContent = `${MATERIALS.length} recipes`;
  els.popoverCount.textContent = `${MATERIALS.length} materials`;
  const initial = parsePrompt(els.promptInput.value);
  applyParsedPrompt(initial);
  updateCharCount();
  updateParsedTags(initial);
  renderMaterialPicker();
  finisher = new TextureFinisher(els.finisherDialog, {
    onSave: async (payload) => {
      try {
        await saveFinishedTexture(payload);
      } catch (error) {
        console.error(error);
        toast('Could not save those pixels to the library.', true);
        throw error;
      }
    },
  });
  bindEvents();
  syncControls();
  applyCamera();
  renderAll({ variations: true });
  initLibrary();
  loadSharedFromHash().catch((error) => console.error('Share load failed', error));
  if (IS_TAURI) {
    els.updateBtn.hidden = false;
    els.updateBtn.addEventListener('click', checkForUpdates);
  }
  if (!IS_TAURI && !IS_STATIC_DEMO) els.footerApi.hidden = false;
  updateClock();
  setInterval(updateClock, 60000);
  window.addEventListener('online', () => {
    updateClock();
    toast('Back online · reload to re-enable AI; the studio itself is unchanged');
  });
  window.addEventListener('offline', () => {
    updateClock();
    toast('Offline · procedural studio, finisher, library, versions, share links, and packs still work');
  });
  registerOfflineWorker();
}

init();
/* Item motif studio: 5 families × 16 component motifs, PNG and item-pack export. */
import { ITEM_THEMES, generateItemThemeSheet, generateItemMotif, listItemThemes } from '../core/index.js';
import { buildAnyResourcePack } from './anypack.js';
import { PACK_FORMATS } from './resourcepack.js';

function rgbaCanvas(result) {
  const canvas = document.createElement('canvas');
  canvas.width = result.width;
  canvas.height = result.height;
  const ctx = canvas.getContext('2d');
  const image = ctx.createImageData(result.width, result.height);
  image.data.set(result.rgba);
  ctx.putImageData(image, 0, 0);
  return canvas;
}

function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((value) => (value ? resolve(value) : reject(new Error('PNG encoding failed'))), 'image/png');
  });
}

function pickPalette(result) {
  const counts = new Map();
  for (let i = 0; i < result.rgba.length; i += 4) {
    if (result.rgba[i + 3] < 24) continue;
    const key = `${result.rgba[i]},${result.rgba[i + 1]},${result.rgba[i + 2]}`;
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 7)
    .map(([key]) => `#${key.split(',').map((v) => Number(v).toString(16).padStart(2, '0')).join('')}`);
}

export class ItemMotifStudio {
  constructor() {
    this.dialog = document.querySelector('#itemMotifDialog');
    this.tabs = document.querySelector('#itemMotifTabs');
    this.grid = document.querySelector('#itemMotifGrid');
    this.preview = document.querySelector('#itemMotifPreview');
    this.title = document.querySelector('#itemMotifTitle');
    this.path = document.querySelector('#itemMotifPath');
    this.palette = document.querySelector('#itemMotifPalette');
    this.seedInput = document.querySelector('#itemMotifSeed');
    this.dice = document.querySelector('#itemMotifDice');
    this.sizeSelect = document.querySelector('#itemMotifSize');
    this.formatSelect = document.querySelector('#itemMotifFormat');
    this.downloadBtn = document.querySelector('#itemMotifDownloadBtn');
    this.copyBtn = document.querySelector('#itemMotifCopyBtn');
    this.packBtn = document.querySelector('#itemMotifPackBtn');
    this.closeBtn = document.querySelector('#closeItemMotifBtn');
    this.themeId = ITEM_THEMES[0].id;
    this.motifId = ITEM_THEMES[0].motifs[0][0];
    this.seed = 20261124;
    this.size = 16;
    this.sheet = null;
    this.bind();
  }

  bind() {
    this.tabs.addEventListener('click', (event) => {
      const button = event.target.closest('[data-theme]');
      if (!button) return;
      this.themeId = button.dataset.theme;
      this.motifId = ITEM_THEMES.find((theme) => theme.id === this.themeId).motifs[0][0];
      this.render();
    });
    this.grid.addEventListener('click', (event) => {
      const button = event.target.closest('[data-motif]');
      if (!button) return;
      this.motifId = button.dataset.motif;
      this.renderPreview();
      for (const card of this.grid.querySelectorAll('[data-motif]')) card.classList.toggle('is-current', card === button);
    });
    this.seedInput.addEventListener('input', () => {
      const value = Number(this.seedInput.value);
      if (Number.isFinite(value) && value >= 1) {
        this.seed = Math.min(999999999, Math.round(value));
        this.render();
      }
    });
    this.dice.addEventListener('click', () => {
      this.seed = 1 + Math.floor(Math.random() * 999999999);
      this.render();
    });
    this.sizeSelect.addEventListener('change', () => { this.size = Number(this.sizeSelect.value) || 16; this.render(); });
    this.closeBtn.addEventListener('click', () => this.close());
    this.dialog.addEventListener('click', (event) => { if (event.target === this.dialog) this.close(); });
    this.downloadBtn.addEventListener('click', () => this.download());
    this.copyBtn.addEventListener('click', () => this.copy());
    this.packBtn.addEventListener('click', () => this.exportPack());
  }

  current() {
    return this.sheet.motifs.find((motif) => motif.recipe.motif === this.motifId) || this.sheet.motifs[0];
  }

  open() {
    this.formatSelect.replaceChildren();
    for (const format of PACK_FORMATS) {
      const option = document.createElement('option');
      option.value = format.id;
      option.textContent = `${format.label} · F${format.packFormat}`;
      this.formatSelect.append(option);
    }
    this.render();
    if (!this.dialog.open) {
      document.body.classList.add('dialog-open');
      this.dialog.showModal();
    }
  }

  close() { if (this.dialog.open) this.dialog.close(); }

  render() {
    this.sheet = generateItemThemeSheet({ themeId: this.themeId, seed: this.seed, size: this.size });
    const theme = ITEM_THEMES.find((item) => item.id === this.themeId);
    this.tabs.replaceChildren();
    for (const item of ITEM_THEMES) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `theme-tab${item.id === this.themeId ? ' active' : ''}`;
      button.dataset.theme = item.id;
      button.textContent = item.name;
      this.tabs.append(button);
    }
    this.grid.replaceChildren();
    for (const motif of this.sheet.motifs) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `item-card${motif.recipe.motif === this.motifId ? ' is-current' : ''}`;
      button.dataset.motif = motif.recipe.motif;
      button.title = motif.recipe.motifName;
      const canvas = rgbaCanvas(motif);
      canvas.style.width = '100%';
      canvas.style.height = 'auto';
      canvas.style.imageRendering = 'pixelated';
      const wrap = document.createElement('div');
      wrap.className = 'item-card-canvas';
      wrap.append(canvas);
      button.append(wrap);
      this.grid.append(button);
    }
    this.seedInput.value = this.seed;
    this.sizeSelect.value = String(this.size);
    this.title.textContent = theme.name;
    this.renderPreview();
  }

  renderPreview() {
    const motif = this.current();
    const canvas = rgbaCanvas(motif);
    const ctx = this.preview.getContext('2d');
    this.preview.width = 384;
    this.preview.height = 384;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, 384, 384);
    ctx.drawImage(canvas, 0, 0, 384, 384);
    this.title.textContent = motif.recipe.motifName;
    this.path.textContent = `${motif.recipe.theme} / ${motif.recipe.motif} · ${motif.width}px`;
    this.palette.replaceChildren();
    for (const color of pickPalette(motif)) {
      const swatch = document.createElement('span');
      swatch.style.backgroundColor = color;
      swatch.title = color;
      this.palette.append(swatch);
    }
  }

  async download() {
    const motif = this.current();
    const blob = await canvasToBlob(rgbaCanvas(motif));
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `blockloom_${motif.recipe.motif}_${this.seed}_${motif.width}px.png`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 2500);
  }

  async copy() {
    const motif = this.current();
    if (!navigator.clipboard?.write || !window.ClipboardItem) return;
    try {
      const blob = await canvasToBlob(rgbaCanvas(motif));
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    } catch { /* clipboard blocked */ }
  }

  async exportPack() {
    const entries = [];
    for (const motif of this.sheet.motifs) {
      const blob = await canvasToBlob(rgbaCanvas(motif));
      entries.push({
        id: motif.recipe.motif,
        file: new File([blob], `${motif.recipe.motif}.png`, { type: 'image/png' }),
        path: `assets/minecraft/textures/item/${motif.recipe.motif}.png`,
        width: motif.width,
        height: motif.height,
        alphaPct: 0,
        colors: 0,
        url: null,
      });
    }
    const theme = ITEM_THEMES.find((item) => item.id === this.themeId);
    const { blob, filename } = await buildAnyResourcePack(entries, {
      formatId: this.formatSelect.value,
      packName: `${theme.name} · 16 item motifs`,
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 2500);
  }
}

export { listItemThemes, generateItemMotif };

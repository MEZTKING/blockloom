/* Pixel-level finisher for a three-face texture set. */

import { drawIsoCube } from './engine.js';

const DISPLAY = 512;
const MAX_HISTORY = 36;
const TOOLS = ['pencil', 'eraser', 'picker', 'fill'];

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const smooth = (t) => t * t * (3 - 2 * t);

function hexToRgb(hex) {
  const value = hex.replace('#', '');
  return [parseInt(value.slice(0, 2), 16), parseInt(value.slice(2, 4), 16), parseInt(value.slice(4, 6), 16)];
}

function cloneImageData(source) {
  return new Uint8ClampedArray(source.data);
}

export class TextureFinisher {
  constructor(root, { onSave } = {}) {
    this.root = root;
    this.onSave = onSave;
    this.refs = {
      title: $('#finisherTitle', root),
      meta: $('#finisherMeta', root),
      canvas: $('#finisherCanvas', root),
      coord: $('#finisherCoord', root),
      cursor: $('#finisherCursor', root),
      close: $('#finisherClose', root),
      faces: $$('.finisher-face', root),
      tools: $$('.finisher-tool', root),
      brushButtons: $$('.finisher-brush', root),
      mirror: $('#finisherMirror', root),
      grid: $('#finisherGrid', root),
      palette: $('#finisherPalette', root),
      color: $('#finisherColor', root),
      colorHex: $('#finisherColorHex', root),
      undo: $('#finisherUndo', root),
      redo: $('#finisherRedo', root),
      reset: $('#finisherResetFace', root),
      preview: $('#finisherPreview', root),
      save: $('#finisherSave', root),
      saveCopy: $('#finisherSaveCopy', root),
      sizeLabel: $('#finisherBrushLabel', root),
      dims: $('#finisherDims', root),
    };
    this.ctx = this.refs.canvas.getContext('2d');
    this.previewCtx = this.refs.preview.getContext('2d');
    this.size = 16;
    this.activeFace = 'side';
    this.tool = 'pencil';
    this.brush = 1;
    this.mirror = false;
    this.grid = true;
    this.color = '#6a6a6a';
    this.palette = [];
    this.faces = {};
    this.imageData = {};
    this.buffers = {};
    this.initial = {};
    this.history = [];
    this.historyIndex = -1;
    this.dirty = false;
    this.painting = false;
    this.lastPoint = null;
    this.busy = false;
    this.renderFrame = 0;
    this.bind();
  }

  bind() {
    const root = this.root;
    this.refs.close.addEventListener('click', () => this.requestClose());
    root.addEventListener('cancel', (event) => {
      event.preventDefault();
      this.requestClose();
    });
    root.addEventListener('close', () => {
      document.body.classList.remove('dialog-open');
      this.busy = false;
    });
    this.refs.save.addEventListener('click', () => this.save(false));
    this.refs.saveCopy.addEventListener('click', () => this.save(true));
    this.refs.undo.addEventListener('click', () => this.undo());
    this.refs.redo.addEventListener('click', () => this.redo());
    this.refs.reset.addEventListener('click', () => this.resetFace());
    this.refs.faces.forEach((button) => {
      button.addEventListener('click', () => this.setFace(button.dataset.face));
    });
    this.refs.tools.forEach((button) => {
      button.addEventListener('click', () => this.setTool(button.dataset.tool));
    });
    this.refs.brushButtons.forEach((button) => {
      button.addEventListener('click', () => this.setBrush(Number(button.dataset.brush)));
    });
    this.refs.mirror.addEventListener('click', () => {
      this.mirror = !this.mirror;
      this.refs.mirror.setAttribute('aria-pressed', String(this.mirror));
      this.refs.mirror.classList.toggle('is-on', this.mirror);
    });
    this.refs.grid.addEventListener('click', () => {
      this.grid = !this.grid;
      this.refs.grid.setAttribute('aria-pressed', String(this.grid));
      this.refs.grid.classList.toggle('is-on', this.grid);
      this.schedulePaint();
    });
    this.refs.color.addEventListener('input', () => {
      this.setColor(this.refs.color.value);
    });
    this.refs.canvas.addEventListener('pointerdown', (event) => this.pointerDown(event));
    this.refs.canvas.addEventListener('pointermove', (event) => this.pointerMove(event));
    this.refs.canvas.addEventListener('pointerup', (event) => this.pointerUp(event));
    this.refs.canvas.addEventListener('pointercancel', (event) => this.pointerUp(event));
    this.refs.canvas.addEventListener('pointerleave', () => {
      this.refs.cursor.hidden = true;
    });
    this.refs.canvas.addEventListener('contextmenu', (event) => event.preventDefault());
    root.addEventListener('keydown', (event) => this.keydown(event));
  }

  open({ textures, palette, title, meta }) {
    this.textures = textures;
    this.size = textures.side.canvas.width;
    this.title = title;
    this.palette = [...new Set((palette || []).map((color) => color.toLowerCase()))];
    this.color = this.palette[Math.min(3, this.palette.length - 1)] || '#6a6a6a';
    this.faces = { side: 'side', top: 'top', bottom: 'bottom' };
    this.imageData = {};
    this.buffers = {};
    this.initial = {};
    this.dirty = false;
    this.busy = false;
    this.activeFace = 'side';
    this.tool = 'pencil';
    this.brush = 1;
    this.mirror = false;
    this.grid = true;
    this.refs.mirror.classList.remove('is-on');
    this.refs.mirror.setAttribute('aria-pressed', 'false');
    this.refs.grid.classList.add('is-on');
    this.refs.grid.setAttribute('aria-pressed', 'true');
    this.setTool('pencil');
    this.setBrush(1);

    for (const face of ['side', 'top', 'bottom']) {
      const source = textures[face].canvas;
      const sourceData = source.getContext('2d').getImageData(0, 0, this.size, this.size);
      this.imageData[face] = new ImageData(cloneImageData(sourceData), this.size, this.size);
      this.initial[face] = cloneImageData(this.imageData[face]);
      const buffer = document.createElement('canvas');
      buffer.width = this.size;
      buffer.height = this.size;
      buffer.getContext('2d').putImageData(this.imageData[face], 0, 0);
      this.buffers[face] = buffer;
    }

    this.history = [this.snapshot()];
    this.historyIndex = 0;
    this.updateMeta();
    this.updateHistoryButtons();
    this.updateFaceTabs();
    this.buildPalette();
    this.setColor(this.color);
    this.refs.dims.textContent = `${this.size} × ${this.size}`;
    this.refs.title.textContent = title;
    this.refs.meta.textContent = meta || `${this.size} × ${this.size} px · side / top / bottom`;
    this.refs.cursor.hidden = true;
    this.paint();
    if (!this.root.open) {
      document.body.classList.add('dialog-open');
      this.root.showModal();
    }
    requestAnimationFrame(() => this.refs.canvas.focus?.());
  }

  close() {
    if (this.root.open) this.root.close();
  }

  requestClose() {
    if (this.busy) return;
    if (this.dirty && !window.confirm('Discard the pixels you just painted?')) return;
    this.close();
  }

  snapshot() {
    return {
      side: cloneImageData(this.imageData.side),
      top: cloneImageData(this.imageData.top),
      bottom: cloneImageData(this.imageData.bottom),
    };
  }

  restore(snapshot) {
    for (const face of ['side', 'top', 'bottom']) {
      this.imageData[face] = new ImageData(new Uint8ClampedArray(snapshot[face]), this.size, this.size);
    }
    this.syncBuffers();
    this.dirty = true;
    this.schedulePaint();
    this.updateHistoryButtons();
    this.updateMeta();
  }

  pushHistory() {
    const snap = this.snapshot();
    this.history = this.history.slice(0, this.historyIndex + 1);
    this.history.push(snap);
    if (this.history.length > MAX_HISTORY) this.history.shift();
    this.historyIndex = this.history.length - 1;
    this.updateHistoryButtons();
  }

  undo() {
    if (this.historyIndex <= 0 || this.busy) return;
    this.historyIndex -= 1;
    this.restore(this.history[this.historyIndex]);
  }

  redo() {
    if (this.historyIndex >= this.history.length - 1 || this.busy) return;
    this.historyIndex += 1;
    this.restore(this.history[this.historyIndex]);
  }

  updateHistoryButtons() {
    this.refs.undo.disabled = this.historyIndex <= 0;
    this.refs.redo.disabled = this.historyIndex >= this.history.length - 1;
  }

  syncBuffers() {
    for (const face of ['side', 'top', 'bottom']) {
      this.buffers[face].getContext('2d').putImageData(this.imageData[face], 0, 0);
    }
  }

  setFace(face) {
    if (!this.imageData[face] || this.activeFace === face) return;
    this.activeFace = face;
    this.updateFaceTabs();
    this.paint();
    this.updateMeta();
  }

  updateFaceTabs() {
    this.refs.faces.forEach((button) => {
      const active = button.dataset.face === this.activeFace;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
    });
  }

  setTool(tool) {
    if (!TOOLS.includes(tool)) return;
    this.tool = tool;
    this.refs.tools.forEach((button) => button.classList.toggle('active', button.dataset.tool === tool));
    this.refs.canvas.classList.toggle('is-picker', tool === 'picker');
    this.refs.canvas.classList.toggle('is-eraser', tool === 'eraser');
  }

  setBrush(size) {
    this.brush = clamp(Math.round(size), 1, 3);
    this.refs.brushButtons.forEach((button) => button.classList.toggle('active', Number(button.dataset.brush) === this.brush));
    this.refs.sizeLabel.textContent = `${this.brush} px`;
  }

  setColor(hex) {
    const value = /^#[0-9a-f]{6}$/i.test(hex) ? hex.toLowerCase() : '#6a6a6a';
    this.color = value;
    this.refs.color.value = value;
    this.refs.colorHex.textContent = value.toUpperCase();
    this.refs.palette.querySelectorAll('button').forEach((button) => {
      button.classList.toggle('active', button.dataset.color === value);
    });
  }

  buildPalette() {
    this.refs.palette.replaceChildren();
    const colors = [...new Set([...this.palette, '#ffffff', '#17170f'])].slice(0, 8);
    colors.forEach((color) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.color = color.toLowerCase();
      button.className = 'finisher-swatch';
      button.style.backgroundColor = color;
      button.title = color.toUpperCase();
      button.setAttribute('aria-label', `Paint with ${color.toUpperCase()}`);
      button.addEventListener('click', () => this.setColor(color));
      this.refs.palette.append(button);
    });
    this.setColor(this.color);
  }

  updateMeta() {
    const edits = Math.max(0, this.history.length - 1);
    if (this.refs.meta) {
      this.refs.meta.textContent = `${this.size} × ${this.size} px · ${this.activeFace} face${edits ? ` · ${edits} edit${edits === 1 ? '' : 's'}` : ''}`;
    }
  }

  schedulePaint() {
    if (this.renderFrame) return;
    this.renderFrame = requestAnimationFrame(() => {
      this.renderFrame = 0;
      this.paint();
    });
  }

  paint() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, DISPLAY, DISPLAY);
    ctx.imageSmoothingEnabled = false;
    const source = this.buffers[this.activeFace];
    if (!source) return;
    ctx.drawImage(source, 0, 0, DISPLAY, DISPLAY);
    if (this.grid) {
      const cell = DISPLAY / this.size;
      ctx.strokeStyle = 'rgba(8, 11, 6, 0.28)';
      ctx.lineWidth = Math.max(1, cell >= 16 ? 1 : 0.75);
      ctx.beginPath();
      for (let i = 1; i < this.size; i++) {
        const p = Math.round(i * cell) + 0.5;
        ctx.moveTo(p, 0);
        ctx.lineTo(p, DISPLAY);
        ctx.moveTo(0, p);
        ctx.lineTo(DISPLAY, p);
      }
      ctx.stroke();
    }
    this.paintPreview();
  }

  paintPreview() {
    drawIsoCube(this.refs.preview, { side: this.buffers.side, top: this.buffers.top }, { shadow: false, pad: 0.02 });
  }

  pointerPoint(event) {
    const rect = this.refs.canvas.getBoundingClientRect();
    const x = clamp(Math.floor(((event.clientX - rect.left) / rect.width) * this.size), 0, this.size - 1);
    const y = clamp(Math.floor(((event.clientY - rect.top) / rect.height) * this.size), 0, this.size - 1);
    return { x, y, rect };
  }

  updateCursor(point) {
    const { x, y, rect } = point;
    const cell = rect.width / this.size;
    this.refs.cursor.hidden = false;
    this.refs.cursor.style.width = `${cell}px`;
    this.refs.cursor.style.height = `${cell}px`;
    this.refs.cursor.style.transform = `translate(${Math.round(x * cell)}px, ${Math.round(y * cell)}px)`;
    this.refs.coord.textContent = `${x}, ${y}`;
  }

  pointerDown(event) {
    if (event.button !== undefined && event.button !== 0) return;
    this.refs.canvas.setPointerCapture?.(event.pointerId);
    const point = this.pointerPoint(event);
    this.updateCursor(point);
    if (this.tool === 'picker') {
      const [r, g, b] = this.pixelAt(point.x, point.y, this.activeFace);
      this.setColor(`#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`);
      this.setTool('pencil');
      return;
    }
    this.painting = true;
    this.lastPoint = point;
    if (this.tool === 'fill') {
      this.floodFill(point.x, point.y);
      this.painting = false;
      this.pushHistory();
      this.dirty = true;
      this.syncBuffers();
      this.schedulePaint();
      this.updateMeta();
      return;
    }
    this.applyBrush(point.x, point.y);
    this.dirty = true;
    this.syncBuffers();
    this.schedulePaint();
    this.updateMeta();
  }

  pointerMove(event) {
    const point = this.pointerPoint(event);
    this.updateCursor(point);
    if (!this.painting || !this.lastPoint) return;
    const last = this.lastPoint;
    const dx = point.x - last.x;
    const dy = point.y - last.y;
    const steps = Math.max(Math.abs(dx), Math.abs(dy));
    if (steps === 0) return;
    for (let i = 1; i <= steps; i++) {
      this.applyBrush(last.x + Math.round((dx * i) / steps), last.y + Math.round((dy * i) / steps));
    }
    this.lastPoint = point;
    this.syncBuffers();
    this.schedulePaint();
    this.updateMeta();
  }

  pointerUp(event) {
    if (this.painting) this.pushHistory();
    this.painting = false;
    this.lastPoint = null;
    this.refs.canvas.releasePointerCapture?.(event.pointerId);
  }

  applyBrush(x, y) {
    if (this.tool === 'picker') return;
    const targets = this.mirror ? [[x, y], [this.size - 1 - x, y]] : [[x, y]];
    const offset = this.brush === 2 ? -1 : this.brush === 3 ? -1 : 0;
    for (const [bx, by] of targets) {
      for (let ox = 0; ox < this.brush; ox++) {
        for (let oy = 0; oy < this.brush; oy++) {
          const px = bx + ox + (this.brush === 3 ? offset : 0);
          const py = by + oy + (this.brush === 3 ? offset : 0);
          if (px < 0 || py < 0 || px >= this.size || py >= this.size) continue;
          this.setPixel(px, py, this.tool === 'eraser' ? [0, 0, 0, 0] : [...hexToRgb(this.color), 255]);
        }
      }
    }
  }

  pixelAt(x, y, face) {
    const data = this.imageData[face].data;
    const i = (y * this.size + x) * 4;
    return [data[i], data[i + 1], data[i + 2], data[i + 3]];
  }

  setPixel(x, y, color) {
    const data = this.imageData[this.activeFace].data;
    const i = (y * this.size + x) * 4;
    data[i] = color[0];
    data[i + 1] = color[1];
    data[i + 2] = color[2];
    data[i + 3] = color[3];
  }

  floodFill(x, y) {
    const data = this.imageData[this.activeFace].data;
    const start = (y * this.size + x) * 4;
    const target = [data[start], data[start + 1], data[start + 2], data[start + 3]];
    const replacement = this.tool === 'eraser' ? [0, 0, 0, 0] : [...hexToRgb(this.color), 255];
    if (target.every((v, i) => v === replacement[i])) return;
    const stack = [[x, y]];
    const visited = new Uint8Array(this.size * this.size);
    while (stack.length) {
      const [cx, cy] = stack.pop();
      if (cx < 0 || cy < 0 || cx >= this.size || cy >= this.size) continue;
      const index = cy * this.size + cx;
      if (visited[index]) continue;
      visited[index] = 1;
      const offset = index * 4;
      if (
        data[offset] !== target[0] ||
        data[offset + 1] !== target[1] ||
        data[offset + 2] !== target[2] ||
        data[offset + 3] !== target[3]
      ) continue;
      data[offset] = replacement[0];
      data[offset + 1] = replacement[1];
      data[offset + 2] = replacement[2];
      data[offset + 3] = replacement[3];
      stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
    }
    this.syncBuffers();
    this.schedulePaint();
    this.dirty = true;
    this.updateMeta();
  }

  resetFace() {
    if (this.busy) return;
    this.imageData[this.activeFace] = new ImageData(new Uint8ClampedArray(this.initial[this.activeFace]), this.size, this.size);
    this.syncBuffers();
    this.pushHistory();
    this.dirty = true;
    this.schedulePaint();
    this.updateMeta();
  }

  keydown(event) {
    if (!this.root.open) return;
    const tag = event.target.tagName;
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return;
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'z') {
      event.preventDefault();
      if (event.shiftKey) this.redo();
      else this.undo();
      return;
    }
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    if (event.key === 'b') this.setTool('pencil');
    else if (event.key === 'e') this.setTool('eraser');
    else if (event.key === 'i') this.setTool('picker');
    else if (event.key === 'g') this.setTool('fill');
  }

  async save(copy) {
    if (!this.busy) {
      this.busy = true;
      this.refs.save.disabled = true;
      this.refs.saveCopy.disabled = true;
      try {
        this.syncBuffers();
        const faces = {};
        for (const face of ['side', 'top', 'bottom']) {
          const canvas = document.createElement('canvas');
          canvas.width = this.size;
          canvas.height = this.size;
          canvas.getContext('2d').putImageData(this.imageData[face], 0, 0);
          faces[face] = canvas;
        }
        this.dirty = false;
        if (typeof this.onSave === 'function') {
          await this.onSave({ faces, copy: Boolean(copy), size: this.size });
        }
        this.close();
      } catch (error) {
        console.error(error);
        this.dirty = true;
      } finally {
        this.busy = false;
        this.refs.save.disabled = false;
        this.refs.saveCopy.disabled = false;
      }
    }
  }

  }

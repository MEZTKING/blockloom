/* Small dependency-free pixel editor for arbitrary Minecraft texture canvases. */
export class PixelEditor {
  constructor() {
    this.dialog = document.querySelector('#pixelDialog');
    this.canvas = document.querySelector('#pixelCanvas');
    this.title = document.querySelector('#pixelTitle');
    this.pathLabel = document.querySelector('#pixelPath');
    this.color = document.querySelector('#pixelColor');
    this.alpha = document.querySelector('#pixelAlpha');
    this.alphaValue = document.querySelector('#pixelAlphaValue');
    this.tools = document.querySelector('#pixelTools');
    this.palette = document.querySelector('#pixelPalette');
    this.timeline = document.querySelector('#pixelTimeline');
    this.frameList = document.querySelector('#pixelFrames');
    this.frameTime = document.querySelector('#pixelFrameTime');
    this.zoomLabel = document.querySelector('#pixelZoomLabel');
    this.status = document.querySelector('#pixelStatus');
    this.downloadBtn = document.querySelector('#pixelDownloadBtn');
    this.saveBtn = document.querySelector('#pixelSaveBtn');
    this.closeBtn = document.querySelector('#closePixelBtn');
    this.undoBtn = document.querySelector('#pixelUndoBtn');
    this.redoBtn = document.querySelector('#pixelRedoBtn');
    this.gridBtn = document.querySelector('#pixelGridBtn');
    this.addFrameBtn = document.querySelector('#pixelAddFrameBtn');
    this.removeFrameBtn = document.querySelector('#pixelRemoveFrameBtn');
    this.zoomInBtn = document.querySelector('#pixelZoomInBtn');
    this.zoomOutBtn = document.querySelector('#pixelZoomOutBtn');
    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;
    this.tool = 'pencil';
    this.zoom = 384;
    this.grid = true;
    this.frames = [];
    this.frameIndex = 0;
    this.undoStack = [];
    this.redoStack = [];
    this.drawing = false;
    this.last = null;
    this.onSave = null;
    this.animation = false;
    this.path = '';
    this.bind();
    this.setTool('pencil');
    this.setColor('#b9ee6a');
    this.applyColor();
  }

  bind() {
    this.dialog.addEventListener('close', () => { document.body.classList.remove('dialog-open'); });
    this.dialog.addEventListener('click', (event) => { if (event.target === this.dialog) this.close(); });
    this.closeBtn.addEventListener('click', () => this.close());
    this.tools.addEventListener('click', (event) => {
      const button = event.target.closest('[data-tool]');
      if (button) this.setTool(button.dataset.tool);
    });
    this.undoBtn.addEventListener('click', () => this.undo());
    this.redoBtn.addEventListener('click', () => this.redo());
    this.gridBtn.addEventListener('click', () => { this.grid = !this.grid; this.gridBtn.classList.toggle('active', this.grid); this.redraw(); });
    this.zoomInBtn.addEventListener('click', () => this.setZoom(this.zoom + 128));
    this.zoomOutBtn.addEventListener('click', () => this.setZoom(this.zoom - 128));
    this.color.addEventListener('input', () => this.applyColor());
    this.alpha.addEventListener('input', () => this.applyColor());
    this.addFrameBtn.addEventListener('click', () => this.addFrame());
    this.removeFrameBtn.addEventListener('click', () => this.removeFrame());
    this.downloadBtn.addEventListener('click', () => this.download());
    this.saveBtn.addEventListener('click', () => this.save());
    this.canvas.addEventListener('pointerdown', (event) => this.pointerDown(event));
    this.canvas.addEventListener('pointermove', (event) => this.pointerMove(event));
    this.canvas.addEventListener('pointerup', () => { this.drawing = false; this.last = null; });
    this.canvas.addEventListener('pointercancel', () => { this.drawing = false; this.last = null; });
    this.canvas.addEventListener('pointerleave', () => { if (!this.drawing) this.last = null; });
    this.frameList.addEventListener('click', (event) => {
      const button = event.target.closest('[data-frame]');
      if (button) this.selectFrame(Number(button.dataset.frame));
    });
  }

  setTool(tool) {
    this.tool = tool;
    for (const button of this.tools.querySelectorAll('[data-tool]')) button.classList.toggle('active', button.dataset.tool === tool);
  }

  setZoom(value) {
    this.zoom = Math.max(256, Math.min(768, value));
    this.canvas.width = this.zoom;
    this.canvas.height = this.zoom;
    this.zoomLabel.textContent = `${this.zoom}px`;
    this.canvas.style.width = `min(${this.zoom}px, 100%)`;
    this.redraw();
  }

  setColor(color) {
    this.color.value = color.slice(0, 7);
    this.applyColor();
  }

  applyColor() {
    this.alphaValue.textContent = `${this.alpha.value}%`;
    this.canvas.style.cursor = this.tool === 'picker' ? 'copy' : 'crosshair';
  }

  open({ canvas, title, path, animation = false, onSave = null }) {
    const source = document.createElement('canvas');
    source.width = canvas.width;
    source.height = canvas.height;
    source.getContext('2d').drawImage(canvas, 0, 0);
    if (animation && source.height % source.width === 0 && source.height > source.width) {
      this.animation = true;
      const frameSize = source.width;
      this.frames = [];
      for (let i = 0; i < source.height / frameSize; i++) {
        const frame = document.createElement('canvas');
        frame.width = frameSize;
        frame.height = frameSize;
        frame.getContext('2d').drawImage(source, 0, i * frameSize, frameSize, frameSize, 0, 0, frameSize, frameSize);
        this.frames.push(frame);
      }
    } else {
      this.animation = false;
      this.frames = [source];
    }
    this.frameIndex = 0;
    this.undoStack = [];
    this.redoStack = [];
    this.title.textContent = title;
    this.pathLabel.textContent = path || 'download only';
    this.saveBtn.textContent = path ? 'Save to pack' : 'Download template';
    this.path = path || '';
    this.onSave = onSave;
    this.timeline.hidden = !this.animation;
    this.zoom = 384;
    this.canvas.width = this.zoom;
    this.canvas.height = this.zoom;
    this.grid = true;
    this.gridBtn.classList.add('active');
    this.zoomLabel.textContent = `${this.zoom}px`;
    this.canvas.style.width = `min(${this.zoom}px, 100%)`;
    this.redrawFrames();
    this.redraw();
    if (!this.dialog.open) {
      document.body.classList.add('dialog-open');
      this.dialog.showModal();
    }
  }

  close() {
    if (this.dialog.open) this.dialog.close();
  }

  frame() {
    return this.frames[this.frameIndex];
  }

  redrawFrames() {
    if (!this.animation) { this.frameList.replaceChildren(); return; }
    const fragment = document.createDocumentFragment();
    this.frames.forEach((_, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.frame = String(index);
      button.className = index === this.frameIndex ? 'active' : '';
      button.textContent = String(index + 1);
      fragment.append(button);
    });
    this.frameList.replaceChildren(fragment);
    this.frameTime.value = this.frameTime.value || '2';
  }

  redraw() {
    const frame = this.frame();
    if (!frame) return;
    const w = this.canvas.width;
    const h = this.canvas.height;
    this.ctx.clearRect(0, 0, w, h);
    this.ctx.imageSmoothingEnabled = false;
    const scale = Math.min(w / frame.width, h / frame.height);
    const dw = Math.floor(frame.width * scale);
    const dh = Math.floor(frame.height * scale);
    const ox = Math.floor((w - dw) / 2);
    const oy = Math.floor((h - dh) / 2);
    this.ctx.drawImage(frame, ox, oy, dw, dh);
    if (this.grid) {
      this.ctx.save();
      this.ctx.strokeStyle = 'rgba(255,255,255,.12)';
      this.ctx.lineWidth = 1;
      for (let x = 1; x < frame.width; x++) {
        const px = ox + (x / frame.width) * dw;
        this.ctx.beginPath(); this.ctx.moveTo(px + .5, oy); this.ctx.lineTo(px + .5, oy + dh); this.ctx.stroke();
      }
      for (let y = 1; y < frame.height; y++) {
        const py = oy + (y / frame.height) * dh;
        this.ctx.beginPath(); this.ctx.moveTo(ox, py + .5); this.ctx.lineTo(ox + dw, py + .5); this.ctx.stroke();
      }
      this.ctx.strokeStyle = 'rgba(185,238,106,.35)';
      this.ctx.strokeRect(ox + .5, oy + .5, dw - 1, dh - 1);
      this.ctx.restore();
    }
    this.updatePalette();
    this.updateStatus();
  }

  updatePalette() {
    const frame = this.frame();
    if (!frame) return;
    const data = frame.getContext('2d').getImageData(0, 0, frame.width, frame.height).data;
    const counts = new Map();
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] < 24) continue;
      const key = `${data[i]},${data[i + 1]},${data[i + 2]}`;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    const colors = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([key]) => `#${key.split(',').map((v) => Number(v).toString(16).padStart(2, '0')).join('')}`);
    this.palette.replaceChildren();
    for (const color of colors) {
      const button = document.createElement('button');
      button.type = 'button';
      button.style.backgroundColor = color;
      button.title = color;
      button.addEventListener('click', () => this.setColor(color));
      this.palette.append(button);
    }
  }

  updateStatus() {
    const frame = this.frame();
    if (!frame) return;
    const total = this.animation ? `${this.frames.length} frames · ` : '';
    this.status.textContent = `${total}${frame.width}×${frame.height} · ${this.tool} · ${this.zoom}px`;
    this.undoBtn.disabled = this.undoStack.length === 0;
    this.redoBtn.disabled = this.redoStack.length === 0;
  }

  pointerPoint(event) {
    const frame = this.frame();
    const rect = this.canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * this.canvas.width;
    const y = ((event.clientY - rect.top) / rect.height) * this.canvas.height;
    const w = this.canvas.width, h = this.canvas.height;
    const scale = Math.min(w / frame.width, h / frame.height);
    const dw = Math.floor(frame.width * scale), dh = Math.floor(frame.height * scale);
    const ox = Math.floor((w - dw) / 2), oy = Math.floor((h - dh) / 2);
    return { x: Math.floor((x - ox) / scale), y: Math.floor((y - oy) / scale), inside: x >= ox && y >= oy && x < ox + dw && y < oy + dh };
  }

  snapshot() {
    const frame = this.frame();
    const data = frame.getContext('2d').getImageData(0, 0, frame.width, frame.height);
    this.undoStack.push({ index: this.frameIndex, data });
    if (this.undoStack.length > 40) this.undoStack.shift();
    this.redoStack = [];
  }

  pointerDown(event) {
    const point = this.pointerPoint(event);
    if (!point.inside) return;
    event.preventDefault();
    this.canvas.setPointerCapture?.(event.pointerId);
    if (this.tool === 'picker') {
      const pixel = this.frame().getContext('2d').getImageData(point.x, point.y, 1, 1).data;
      if (pixel[3]) this.setColor(`#${[pixel[0], pixel[1], pixel[2]].map((v) => v.toString(16).padStart(2, '0')).join('')}`);
      return;
    }
    this.snapshot();
    this.drawing = true;
    this.last = point;
    if (this.tool === 'fill') { this.fill(point); this.drawing = false; this.last = null; return; }
    this.plot(point);
  }

  pointerMove(event) {
    if (!this.drawing) return;
    const point = this.pointerPoint(event);
    if (!point.inside) return;
    event.preventDefault();
    if (this.tool === 'pencil' || this.tool === 'eraser') {
      this.line(this.last, point);
      this.last = point;
    }
  }

  colorValue() {
    const hex = this.color.value;
    const alpha = Math.round((Number(this.alpha.value) / 100) * 255);
    return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16), alpha];
  }

  plot(point) {
    const ctx = this.frame().getContext('2d');
    if (this.tool === 'eraser') ctx.clearRect(point.x, point.y, 1, 1);
    else {
      const [r, g, b, a] = this.colorValue();
      ctx.fillStyle = `rgba(${r},${g},${b},${a / 255})`;
      ctx.fillRect(point.x, point.y, 1, 1);
    }
    this.redraw();
  }

  line(from, to) {
    let x0 = from.x, y0 = from.y;
    const x1 = to.x, y1 = to.y;
    const dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1;
    const dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1;
    let error = dx + dy;
    for (;;) {
      this.plot({ x: x0, y: y0 });
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * error;
      if (e2 >= dy) { error += dy; x0 += sx; }
      if (e2 <= dx) { error += dx; y0 += sy; }
    }
  }

  fill(point) {
    const frame = this.frame();
    const ctx = frame.getContext('2d');
    const image = ctx.getImageData(0, 0, frame.width, frame.height);
    const data = image.data;
    const start = (point.y * frame.width + point.x) * 4;
    const target = [data[start], data[start + 1], data[start + 2], data[start + 3]];
    const [r, g, b, a] = this.colorValue();
    if (target[0] === r && target[1] === g && target[2] === b && target[3] === a) return;
    const stack = [[point.x, point.y]];
    const seen = new Set();
    while (stack.length) {
      const [x, y] = stack.pop();
      if (x < 0 || y < 0 || x >= frame.width || y >= frame.height) continue;
      const key = y * frame.width + x;
      if (seen.has(key)) continue;
      seen.add(key);
      const i = key * 4;
      if (data[i] !== target[0] || data[i + 1] !== target[1] || data[i + 2] !== target[2] || data[i + 3] !== target[3]) continue;
      data[i] = r; data[i + 1] = g; data[i + 2] = b; data[i + 3] = a;
      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
    ctx.putImageData(image, 0, 0);
    this.redraw();
  }

  undo() {
    const item = this.undoStack.pop();
    if (!item) return;
    const current = this.frames[item.index].getContext('2d').getImageData(0, 0, this.frames[item.index].width, this.frames[item.index].height);
    this.redoStack.push({ index: item.index, data: current });
    this.frames[item.index].getContext('2d').putImageData(item.data, 0, 0);
    this.frameIndex = item.index;
    this.redrawFrames();
    this.redraw();
  }

  redo() {
    const item = this.redoStack.pop();
    if (!item) return;
    const current = this.frames[item.index].getContext('2d').getImageData(0, 0, this.frames[item.index].width, this.frames[item.index].height);
    this.undoStack.push({ index: item.index, data: current });
    this.frames[item.index].getContext('2d').putImageData(item.data, 0, 0);
    this.frameIndex = item.index;
    this.redrawFrames();
    this.redraw();
  }

  addFrame() {
    if (!this.animation) return;
    const source = this.frames[this.frameIndex];
    const frame = document.createElement('canvas');
    frame.width = source.width;
    frame.height = source.height;
    frame.getContext('2d').drawImage(source, 0, 0);
    this.frames.splice(this.frameIndex + 1, 0, frame);
    this.frameIndex += 1;
    this.redrawFrames();
    this.redraw();
  }

  removeFrame() {
    if (!this.animation || this.frames.length <= 1) return;
    this.frames.splice(this.frameIndex, 1);
    this.frameIndex = Math.max(0, this.frameIndex - 1);
    this.redrawFrames();
    this.redraw();
  }

  selectFrame(index) {
    this.frameIndex = Math.max(0, Math.min(this.frames.length - 1, index));
    this.redrawFrames();
    this.redraw();
  }

  compose() {
    if (!this.animation) {
      const frame = this.frames[0];
      const canvas = document.createElement('canvas');
      canvas.width = frame.width;
      canvas.height = frame.height;
      canvas.getContext('2d').drawImage(frame, 0, 0);
      return canvas;
    }
    const width = this.frames[0].width;
    const height = this.frames[0].height;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height * this.frames.length;
    this.frames.forEach((frame, index) => canvas.getContext('2d').drawImage(frame, 0, index * height));
    return canvas;
  }

  meta() {
    if (!this.animation) return null;
    return JSON.stringify({ animation: { frametime: Math.max(1, Math.round(Number(this.frameTime.value) || 2)) } }, null, 2);
  }

  async blob() {
    return await new Promise((resolve, reject) => this.compose().toBlob((value) => (value ? resolve(value) : reject(new Error('PNG encoding failed'))), 'image/png'));
  }

  filename() {
    const base = (this.path || this.title.textContent || 'texture').split('/').pop().replace(/\.png$/i, '') || 'texture';
    return `${base}.png`;
  }

  async download() {
    try {
      downloadFile(await this.blob(), this.filename());
      if (this.meta()) downloadFile(new Blob([this.meta()], { type: 'application/json' }), `${this.filename()}.mcmeta`);
    } catch (error) {
      this.status.textContent = 'Export failed.';
    }
  }

  async save() {
    try {
      const canvas = this.compose();
      const meta = this.meta();
      if (this.onSave) await this.onSave({ canvas, meta, path: this.path, name: this.filename() });
    } catch (error) {
      this.status.textContent = 'Save failed.';
    } finally {
      this.close();
    }
  }
}

function downloadFile(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 2500);
}

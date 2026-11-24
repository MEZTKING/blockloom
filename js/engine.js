/* Browser canvas wrapper around @blockloom/core. Core generation stays DOM-free. */
import {
  FINISHES,
  MATERIALS,
  MATERIAL_GROUPS,
  MODIFIERS,
  getMaterial,
  modifierLabel,
  parsePrompt,
  renderTextureBuffer,
  textureTitle,
} from '../core/index.js';

const TAU = Math.PI * 2;

export {
  FINISHES,
  MATERIALS,
  MATERIAL_GROUPS,
  MODIFIERS,
  getMaterial,
  modifierLabel,
  parsePrompt,
  renderTextureBuffer,
  textureTitle,
};

function createCanvas(size) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  return canvas;
}

export function renderTexture(params = {}) {
  const { buffer, ...data } = renderTextureBuffer(params);
  const canvas = createCanvas(data.size);
  const context = canvas.getContext('2d');
  const imageData = context.createImageData(data.size, data.size);
  imageData.data.set(buffer);
  context.putImageData(imageData, 0, 0);
  return { ...data, canvas };
}

export function renderTextureSet(params) {
  const side = renderTexture({ ...params, face: 'side' });
  const top = renderTexture({ ...params, face: 'top' });
  const bottom = renderTexture({ ...params, face: 'bottom' });
  return {
    side,
    top,
    bottom,
    material: side.material,
    palette: side.swatches,
    accentSwatches: side.accentSwatches,
    overlayAccentSwatches: side.overlayAccentSwatches,
    size: side.size,
  };
}

/* Isometric cube renderer for variation thumbnails and share previews. */
export function drawIsoCube(canvas, textures, options = {}) {
  const {
    background = null,
    shadow = true,
    pad = 0.08,
  } = options;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  if (background) {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, w, h);
  }
  const half = Math.min(w * 0.44, h * 0.4) * (1 - pad * 1.3);
  const topH = half * 0.52;
  const depth = half * 0.98;
  const cx = w / 2;
  const cy = (h - depth) / 2 + half * 0.03;
  const A = { x: cx, y: cy - topH };
  const B = { x: cx + half, y: cy };
  const C = { x: cx, y: cy + topH };
  const D = { x: cx - half, y: cy };
  const extend = (p) => ({ x: p.x, y: p.y + depth });

  ctx.imageSmoothingEnabled = false;

  if (shadow) {
    ctx.save();
    ctx.filter = 'blur(5px)';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.beginPath();
    ctx.ellipse(cx, C.y + depth + topH * 0.32, half * 0.82, topH * 0.38, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  function face(tex, origin, u, v, light, outline = true) {
    if (!tex) return;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(origin.x + u.x, origin.y + u.y);
    ctx.lineTo(origin.x + u.x + v.x, origin.y + u.y + v.y);
    ctx.lineTo(origin.x + v.x, origin.y + v.y);
    ctx.closePath();
    ctx.clip();
    const tw = tex.width;
    const th = tex.height;
    ctx.setTransform(u.x / tw, u.y / tw, v.x / th, v.y / th, origin.x, origin.y);
    ctx.drawImage(tex, 0, 0);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (light > 0) {
      ctx.fillStyle = `rgba(255, 244, 214, ${light})`;
      ctx.fill();
    } else if (light < 0) {
      ctx.fillStyle = `rgba(4, 7, 4, ${-light})`;
      ctx.fill();
    }
    if (outline) {
      ctx.strokeStyle = 'rgba(8, 10, 7, 0.32)';
      ctx.lineWidth = 1;
      ctx.strokeRect(0, 0, tw, th);
    }
    ctx.restore();
    ctx.strokeStyle = 'rgba(255,255,255,0.055)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(origin.x + u.x, origin.y + u.y);
    ctx.lineTo(origin.x + u.x + v.x, origin.y + u.y + v.y);
    ctx.lineTo(origin.x + v.x, origin.y + v.y);
    ctx.closePath();
    ctx.stroke();
  }

  const Cd = extend(C);
  const Dd = extend(D);
  const Bd = extend(B);

  // left face
  face(textures.side, D, { x: C.x - D.x, y: C.y - D.y }, { x: 0, y: depth }, -0.26);
  // right face
  face(textures.side, C, { x: B.x - C.x, y: B.y - C.y }, { x: 0, y: depth }, -0.12);
  // top face
  face(textures.top, A, { x: B.x - A.x, y: B.y - A.y }, { x: D.x - A.x, y: D.y - A.y }, 0.1);

  // crisp silhouette + contact shadow
  ctx.strokeStyle = 'rgba(5, 6, 4, 0.5)';
  ctx.lineWidth = Math.max(1, Math.min(w, h) / 160);
  ctx.beginPath();
  ctx.moveTo(A.x, A.y);
  ctx.lineTo(B.x, B.y);
  ctx.lineTo(Bd.x, Bd.y);
  ctx.lineTo(Cd.x, Cd.y);
  ctx.lineTo(Dd.x, Dd.y);
  ctx.lineTo(D.x, D.y);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(C.x, C.y);
  ctx.lineTo(Cd.x, Cd.y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(D.x, D.y);
  ctx.lineTo(C.x, C.y);
  ctx.lineTo(B.x, B.y);
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.stroke();
}

export function downloadBlob(blob, filename) {
  const tauri = window.__TAURI_INTERNALS__;
  if (tauri?.invoke) {
    return blob.arrayBuffer()
      .then((buffer) => tauri.invoke('save_file', { name: filename, bytes: Array.from(new Uint8Array(buffer)) }))
      .catch((error) => {
        console.error('Native save failed', error);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 2000);
      });
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  return undefined;
}
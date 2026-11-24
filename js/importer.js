/* Pure planning helpers for importing an existing Minecraft texture. */

export const MAX_IMPORT_SIZE = 512;

export function importTitle(filename) {
  const base = String(filename || '')
    .replace(/\.[^.]+$/, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!base) return 'Imported texture';
  return base
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
    .slice(0, 60);
}

export function planTextureImport(width, height, maxSize = MAX_IMPORT_SIZE) {
  const w = Math.round(Number(width));
  const h = Math.round(Number(height));
  if (!Number.isFinite(w) || !Number.isFinite(h) || w < 1 || h < 1) {
    return { ok: false, reason: 'That image has no usable pixel dimensions.' };
  }
  const animated = h > w && h % w === 0;
  if (w !== h && !animated) {
    return {
      ok: false,
      reason: `This texture is ${w} × ${h}. Minecraft block and item textures must be square; vertical animation strips are supported by importing frame 1.`,
    };
  }
  const frameHeight = animated ? w : h;
  const frames = animated ? h / w : 1;
  const targetSize = Math.min(maxSize, w);
  return {
    ok: true,
    sourceWidth: w,
    sourceHeight: h,
    cropHeight: frameHeight,
    targetSize,
    frames,
    animated,
    scaled: w > maxSize,
  };
}

export function importSummary(plan) {
  if (!plan?.ok) return '';
  const bits = [`${plan.sourceWidth} × ${plan.sourceHeight}`];
  if (plan.animated) bits.push(`frame 1 of ${plan.frames}`);
  if (plan.scaled) bits.push(`scaled to ${plan.targetSize} px`);
  return bits.join(' · ');
}

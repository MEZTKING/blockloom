/* Blank/guided texture templates for Minecraft 26.3 Java formats. */
export const TEMPLATE_PRESETS = [
  { id: 'armor_layer', name: 'Armor layer · humanoid', width: 64, height: 32, path: 'assets/minecraft/textures/entity/equipment/humanoid/template.png', note: 'Modern 26.3 armor layer: helmet, chestplate, boots.' },
  { id: 'armor_leggings', name: 'Armor layer · leggings', width: 64, height: 32, path: 'assets/minecraft/textures/entity/equipment/humanoid_leggings/template.png', note: 'Modern 26.3 leggings layer.' },
  { id: 'player_skin', name: 'Player skin · 64×64', width: 64, height: 64, path: null, note: 'Player skins are uploaded separately, not placed in a resource pack.' },
  { id: 'entity_skin', name: 'Entity skin · 64×64', width: 64, height: 64, path: 'assets/minecraft/textures/entity/template.png', note: 'Generic entity canvas. UV layout follows the entity model.' },
  { id: 'gui_container', name: 'GUI container · 256×256', width: 256, height: 256, path: 'assets/minecraft/textures/gui/container/template.png', note: 'Container GUI atlas. Slot pitch is commonly 18 px.' },
  { id: 'particle', name: 'Particle · 8×8', width: 8, height: 8, path: 'assets/minecraft/textures/particle/template.png', note: 'Single particle sprite.' },
  { id: 'animation', name: 'Animation strip · 16×64', width: 16, height: 64, path: 'assets/minecraft/textures/block/template.png', note: 'Four 16×16 frames; add template.png.mcmeta.', meta: { animation: { frametime: 2 } } },
  { id: 'painting', name: 'Painting · 16×16', width: 16, height: 16, path: 'assets/minecraft/textures/painting/template.png', note: 'Painting sizes vary; this is a small 16×16 canvas.' },
  { id: 'sun', name: 'Sun · 32×32', width: 32, height: 32, path: 'assets/minecraft/textures/environment/celestial/sun.png', note: 'Environment sun texture.' },
];

const PLAYER_REGIONS = [
  [0, 0, 32, 16, 'head'],
  [32, 0, 64, 16, 'hat'],
  [16, 16, 40, 32, 'body'],
  [40, 16, 56, 32, 'right arm'],
  [0, 16, 16, 32, 'right leg'],
  [16, 32, 40, 48, 'jacket'],
  [40, 32, 56, 48, 'right sleeve'],
  [0, 32, 16, 48, 'right pants'],
  [32, 48, 48, 64, 'left arm'],
  [48, 48, 64, 64, 'left sleeve'],
  [16, 48, 32, 64, 'left leg'],
  [0, 48, 16, 64, 'left pants'],
];

export function getTemplatePreset(id) {
  return TEMPLATE_PRESETS.find((preset) => preset.id === id) || TEMPLATE_PRESETS[0];
}

export function createTemplateCanvas(presetOrId, { guide = true } = {}) {
  const preset = typeof presetOrId === 'string' ? getTemplatePreset(presetOrId) : presetOrId;
  const canvas = document.createElement('canvas');
  canvas.width = preset.width;
  canvas.height = preset.height;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!guide) return canvas;
  const grid = preset.width >= 128 ? 16 : 8;
  ctx.save();
  ctx.strokeStyle = 'rgba(185,238,106,0.42)';
  ctx.lineWidth = 1;
  for (let x = grid; x < canvas.width; x += grid) {
    ctx.beginPath(); ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, canvas.height); ctx.stroke();
  }
  for (let y = grid; y < canvas.height; y += grid) {
    ctx.beginPath(); ctx.moveTo(0, y + 0.5); ctx.lineTo(canvas.width, y + 0.5); ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.strokeRect(0.5, 0.5, canvas.width - 1, canvas.height - 1);
  ctx.fillStyle = 'rgba(245,249,238,0.9)';
  ctx.font = '5px monospace';
  ctx.textBaseline = 'top';
  if (preset.id === 'player_skin') {
    ctx.strokeStyle = 'rgba(120,180,233,0.9)';
    ctx.fillStyle = 'rgba(120,180,233,0.16)';
    for (const [x1, y1, x2, y2, label] of PLAYER_REGIONS) {
      ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
      ctx.strokeRect(x1 + 0.5, y1 + 0.5, x2 - x1 - 1, y2 - y1 - 1);
      ctx.fillStyle = 'rgba(245,249,238,0.9)';
      ctx.fillText(label, x1 + 1, y1 + 1);
      ctx.fillStyle = 'rgba(120,180,233,0.16)';
    }
  } else if (preset.id === 'armor_layer' || preset.id === 'armor_leggings') {
    ctx.fillStyle = 'rgba(231,183,92,0.12)';
    ctx.fillRect(0, 0, 32, 16);
    ctx.fillRect(0, 16, 56, 16);
    ctx.fillStyle = 'rgba(245,249,238,0.9)';
    ctx.fillText('64×32 layer', 2, 2);
    ctx.fillText('head', 2, 18);
    ctx.fillText('body / arms / boots', 34, 18);
  } else if (preset.id === 'gui_container') {
    ctx.strokeStyle = 'rgba(120,180,233,0.35)';
    for (let x = 18; x < canvas.width; x += 18) {
      ctx.beginPath(); ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, canvas.height); ctx.stroke();
    }
    for (let y = 18; y < canvas.height; y += 18) {
      ctx.beginPath(); ctx.moveTo(0, y + 0.5); ctx.lineTo(canvas.width, y + 0.5); ctx.stroke();
    }
    ctx.fillStyle = 'rgba(245,249,238,0.9)';
    ctx.fillText('256×256 · 18px slot pitch', 3, 3);
  } else if (preset.id === 'animation') {
    for (let y = 16; y < canvas.height; y += 16) {
      ctx.strokeStyle = 'rgba(231,183,92,0.8)';
      ctx.beginPath(); ctx.moveTo(0, y + 0.5); ctx.lineTo(canvas.width, y + 0.5); ctx.stroke();
      ctx.fillStyle = 'rgba(245,249,238,0.9)';
      ctx.fillText('frame ' + (y / 16), 1, y + 1);
    }
  } else {
    ctx.fillStyle = 'rgba(245,249,238,0.9)';
    ctx.fillText(`${preset.width}×${preset.height}`, 1, 1);
  }
  ctx.restore();
  return canvas;
}

export function templateMeta(presetOrId) {
  const preset = typeof presetOrId === 'string' ? getTemplatePreset(presetOrId) : presetOrId;
  return preset.meta ? JSON.stringify(preset.meta, null, 2) : null;
}

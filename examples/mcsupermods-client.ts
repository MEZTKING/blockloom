/**
 * Drop-in Blockloom bridge client for MCSuperMods or any TypeScript/Electron app.
 * Start Blockloom with: npm run bridge
 */
export interface BlockloomTextureRequest {
  prompt?: string;
  material?: string;
  seed?: number;
  size?: number;
  finish?: 'rugged' | 'balanced' | 'smooth';
  modifiers?: string[];
  accent?: string;
  tint?: string;
  face?: 'side' | 'top' | 'bottom';
}

const BRIDGE_URL = process.env.BLOCKLOOM_BRIDGE_URL ?? 'http://127.0.0.1:4173';
const BRIDGE_TOKEN = process.env.BLOCKLOOM_BRIDGE_TOKEN ?? '';

function headers(): HeadersInit {
  const result: HeadersInit = { 'Content-Type': 'application/json' };
  if (BRIDGE_TOKEN) result.Authorization = `Bearer ${BRIDGE_TOKEN}`;
  return result;
}

async function checked(response: Response): Promise<Response> {
  if (!response.ok) {
    let detail = '';
    try { detail = JSON.stringify(await response.json()); } catch { /* ignore */ }
    throw new Error(`Blockloom bridge ${response.status}: ${detail || response.statusText}`);
  }
  return response;
}

/** Generate one face as raw PNG bytes. */
export async function generateBlockTexture(request: BlockloomTextureRequest): Promise<Uint8Array> {
  const response = await checked(await fetch(`${BRIDGE_URL}/api/generate`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ ...request, format: 'png' }),
  }));
  return new Uint8Array(await response.arrayBuffer());
}

/** Generate side/top/bottom + texture.json as a ZIP. */
export async function generateBlockTextureSet(request: BlockloomTextureRequest): Promise<Uint8Array> {
  const response = await checked(await fetch(`${BRIDGE_URL}/api/generate`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ ...request, format: 'zip' }),
  }));
  return new Uint8Array(await response.arrayBuffer());
}

/** Generate many named texture sets in one ZIP. */
export async function generateBatch(
  items: Array<BlockloomTextureRequest & { id: string }>,
): Promise<Uint8Array> {
  const response = await checked(await fetch(`${BRIDGE_URL}/api/batch`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ items }),
  }));
  return new Uint8Array(await response.arrayBuffer());
}

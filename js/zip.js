/* Tiny dependency-free ZIP writer (stored entries) for texture packs. */

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes) {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function dosDateTime(date = new Date()) {
  const year = Math.max(1980, date.getFullYear());
  const dosTime =
    (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  const dosDate = ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  return { dosTime, dosDate };
}

function writeU16(view, offset, value) {
  view.setUint16(offset, value, true);
}

function writeU32(view, offset, value) {
  view.setUint32(offset, value >>> 0, true);
}

async function toBytes(data) {
  if (data instanceof Uint8Array) return data;
  if (data instanceof Blob) return new Uint8Array(await data.arrayBuffer());
  if (typeof data === 'string') return new TextEncoder().encode(data);
  return new Uint8Array(data);
}

export async function createZip(files) {
  const entries = [];
  let offset = 0;
  const { dosTime, dosDate } = dosDateTime(new Date('2026-01-01T12:00:00Z'));
  const encoder = new TextEncoder();

  for (const file of files) {
    const name = encoder.encode(file.name);
    const data = await toBytes(file.data);
    const crc = crc32(data);
    entries.push({ name, data, crc, offset });
    offset += 30 + name.length + data.length;
  }

  const centralSize = entries.reduce((sum, e) => sum + 46 + e.name.length, 0);
  const total = offset + centralSize + 22;
  const out = new Uint8Array(total);
  const view = new DataView(out.buffer);
  let pos = 0;

  for (const entry of entries) {
    writeU32(view, pos, 0x04034b50);
    writeU16(view, pos + 4, 20);
    writeU16(view, pos + 6, 0x0800);
    writeU16(view, pos + 8, 0);
    writeU16(view, pos + 10, dosTime);
    writeU16(view, pos + 12, dosDate);
    writeU32(view, pos + 14, entry.crc);
    writeU32(view, pos + 18, entry.data.length);
    writeU32(view, pos + 22, entry.data.length);
    writeU16(view, pos + 26, entry.name.length);
    writeU16(view, pos + 28, 0);
    out.set(entry.name, pos + 30);
    out.set(entry.data, pos + 30 + entry.name.length);
    pos += 30 + entry.name.length + entry.data.length;
  }

  const centralStart = pos;
  for (const entry of entries) {
    writeU32(view, pos, 0x02014b50);
    writeU16(view, pos + 4, 20);
    writeU16(view, pos + 6, 20);
    writeU16(view, pos + 8, 0x0800);
    writeU16(view, pos + 10, 0);
    writeU16(view, pos + 12, dosTime);
    writeU16(view, pos + 14, dosDate);
    writeU32(view, pos + 16, entry.crc);
    writeU32(view, pos + 20, entry.data.length);
    writeU32(view, pos + 24, entry.data.length);
    writeU16(view, pos + 28, entry.name.length);
    writeU16(view, pos + 30, 0);
    writeU16(view, pos + 32, 0);
    writeU16(view, pos + 34, 0);
    writeU16(view, pos + 36, 0);
    writeU32(view, pos + 38, 0);
    writeU32(view, pos + 42, entry.offset);
    out.set(entry.name, pos + 46);
    pos += 46 + entry.name.length;
  }

  writeU32(view, pos, 0x06054b50);
  writeU16(view, pos + 4, 0);
  writeU16(view, pos + 6, 0);
  writeU16(view, pos + 8, entries.length);
  writeU16(view, pos + 10, entries.length);
  writeU32(view, pos + 12, centralSize);
  writeU32(view, pos + 16, centralStart);
  writeU16(view, pos + 20, 0);

  return new Blob([out], { type: 'application/zip' });
}
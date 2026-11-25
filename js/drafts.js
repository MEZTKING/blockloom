/* One persistent Universal Packer draft. Files are stored as Blobs in IndexedDB. */
const DB_NAME = 'blockloom-drafts';
const STORE = 'anypack';
const KEY = 'current';

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveAnyPackDraft(entries, settings = {}) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    const record = {
      id: KEY,
      savedAt: Date.now(),
      settings,
      entries: entries.map((entry) => ({
        path: entry.path,
        width: entry.width,
        height: entry.height,
        alphaPct: entry.alphaPct,
        colors: entry.colors,
        file: entry.file,
      })),
    };
    tx.objectStore(STORE).put(record, KEY);
    tx.oncomplete = () => { db.close(); resolve(record); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

export async function loadAnyPackDraft() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const request = tx.objectStore(STORE).get(KEY);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
  });
}

export async function clearAnyPackDraft() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(KEY);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

/* Local-first texture archive backed by IndexedDB. */

const DB_NAME = 'blockloom';
const DB_VERSION = 1;
const STORE = 'works';
let dbPromise = null;

function openDb() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB is not available in this browser.'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: 'id' });
        store.createIndex('fingerprint', 'fingerprint', { unique: false });
        store.createIndex('updatedAt', 'updatedAt', { unique: false });
        store.createIndex('kind', 'kind', { unique: false });
        store.createIndex('favorite', 'favorite', { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Could not open the local library.'));
  });
  return dbPromise;
}

function tx(mode, callback) {
  return openDb().then((db) => new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE, mode);
    const store = transaction.objectStore(STORE);
    let result;
    try {
      result = callback(store);
    } catch (error) {
      reject(error);
      return;
    }
    transaction.oncomplete = () => resolve(result);
    transaction.onerror = () => reject(transaction.error || new Error('Library transaction failed.'));
    transaction.onabort = () => reject(transaction.error || new Error('Library transaction aborted.'));
  }));
}

export function fingerprintFaces(faces) {
  // FNV-1a over the exact PNG faces plus the face names. Stable across sessions.
  let hash = 0x811c9dc5;
  for (const name of ['side', 'top', 'bottom']) {
    const value = faces[name] || '';
    for (let i = 0; i < value.length; i++) {
      hash ^= value.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193);
    }
    hash ^= 0xff;
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

export function newWorkId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `work-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function putWork(work) {
  await tx('readwrite', (store) => store.put(work));
  return work;
}

export async function getWork(id) {
  return tx('readonly', (store) => {
    let value = null;
    const request = store.get(id);
    request.onsuccess = () => { value = request.result || null; };
    return () => value;
  }).then((get) => get());
}

export async function findByFingerprint(fingerprint) {
  return tx('readonly', (store) => {
    let value = null;
    const request = store.index('fingerprint').get(fingerprint);
    request.onsuccess = () => { value = request.result || null; };
    return () => value;
  }).then((get) => get());
}

export async function listWorks() {
  return tx('readonly', (store) => {
    let value = [];
    const request = store.getAll();
    request.onsuccess = () => { value = request.result || []; };
    return () => value;
  }).then((get) => get().sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt))));
}

export async function deleteWork(id) {
  await tx('readwrite', (store) => store.delete(id));
}

export async function updateWork(id, patch) {
  return tx('readwrite', (store) => {
    const request = store.get(id);
    request.onsuccess = () => {
      if (!request.result) return;
      store.put({ ...request.result, ...patch, id, updatedAt: new Date().toISOString() });
    };
  });
}

export async function setFavorite(id, favorite) {
  return updateWork(id, { favorite });
}

export async function countWorks() {
  return tx('readonly', (store) => {
    let value = 0;
    const request = store.count();
    request.onsuccess = () => { value = request.result || 0; };
    return () => value;
  }).then((get) => get());
}

export async function storageEstimate() {
  if (!navigator.storage?.estimate) return null;
  try {
    return await navigator.storage.estimate();
  } catch {
    return null;
  }
}

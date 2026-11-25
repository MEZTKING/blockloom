/* One persistent Universal Packer draft. Files are stored as Blobs in IndexedDB. */
const DB_NAME = 'blockloom-drafts';
const STORE = 'anypack';
const KEY = 'current';

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 2);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
      if (!db.objectStoreNames.contains(VERSION_STORE)) db.createObjectStore(VERSION_STORE, { keyPath: 'id', autoIncrement: true });
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

const VERSION_STORE = 'packVersions';
const MAX_VERSIONS = 16;

function openVersionDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 2);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
      if (!db.objectStoreNames.contains(VERSION_STORE)) db.createObjectStore(VERSION_STORE, { keyPath: 'id', autoIncrement: true });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function savePackSnapshot(entries, settings = {}, label = 'Snapshot') {
  const db = await openVersionDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(VERSION_STORE, 'readwrite');
    const store = tx.objectStore(VERSION_STORE);
    const record = {
      label,
      savedAt: Date.now(),
      count: entries.length,
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
    store.add(record);
    const all = store.getAll();
    all.onsuccess = () => {
      const records = all.result;
      if (records.length > MAX_VERSIONS) {
        for (const old of records.slice(0, records.length - MAX_VERSIONS)) store.delete(old.id);
      }
      resolve(record);
    };
    all.onerror = () => reject(all.error);
    tx.oncomplete = () => db.close();
    tx.onerror = () => db.close();
  });
}

export async function listPackSnapshots() {
  const db = await openVersionDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(VERSION_STORE, 'readonly');
    const request = tx.objectStore(VERSION_STORE).getAll();
    request.onsuccess = () => {
      const records = request.result || [];
      resolve(records
        .map((record) => ({ id: record.id, label: record.label, savedAt: record.savedAt, count: record.count, settings: record.settings }))
        .sort((a, b) => b.savedAt - a.savedAt));
    };
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
  });
}

export async function getPackSnapshot(id) {
  const db = await openVersionDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(VERSION_STORE, 'readonly');
    const request = tx.objectStore(VERSION_STORE).get(id);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
  });
}

export async function deletePackSnapshot(id) {
  const db = await openVersionDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(VERSION_STORE, 'readwrite');
    tx.objectStore(VERSION_STORE).delete(id);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

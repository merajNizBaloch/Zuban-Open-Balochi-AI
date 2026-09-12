"use client";

const DB_NAME = "zuban-docx";
const DB_VERSION = 1;
const STORE = "state";
const LIBRARY_KEY = "library";

type StoredLibrary<T> = {
  version: 1;
  documents: T[];
  activeId: string;
  savedAt: number;
};

function openDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE)) {
        database.createObjectStore(STORE);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Could not open local document storage."));
  });
}

function requestValue<T>(request: IDBRequest<T>) {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Local document storage failed."));
  });
}

export async function loadDocxLibrary<T>() {
  const database = await openDatabase();

  try {
    const transaction = database.transaction(STORE, "readonly");
    const store = transaction.objectStore(STORE);
    const result = await requestValue(
      store.get(LIBRARY_KEY) as IDBRequest<StoredLibrary<T> | undefined>,
    );

    return result ?? null;
  } finally {
    database.close();
  }
}

export async function saveDocxLibrary<T>(
  documents: T[],
  activeId: string,
) {
  const database = await openDatabase();

  try {
    const transaction = database.transaction(STORE, "readwrite");
    const store = transaction.objectStore(STORE);
    const payload: StoredLibrary<T> = {
      version: 1,
      documents,
      activeId,
      savedAt: Date.now(),
    };

    await requestValue(store.put(payload, LIBRARY_KEY));
  } finally {
    database.close();
  }
}

export async function migrateDocxFromLocalStorage<T>(
  storageKey: string,
  activeKey: string,
) {
  let documents: T[] = [];
  let activeId = "";

  try {
    const raw = window.localStorage.getItem(storageKey);
    const parsed = raw ? (JSON.parse(raw) as T[]) : [];
    if (Array.isArray(parsed)) documents = parsed;
    activeId = window.localStorage.getItem(activeKey) ?? "";
  } catch {
    return null;
  }

  if (!documents.length) return null;

  await saveDocxLibrary(documents, activeId);

  try {
    window.localStorage.removeItem(storageKey);
    window.localStorage.removeItem(activeKey);
  } catch {
    // Migration already succeeded. Removing the old copy is best-effort only.
  }

  return {
    version: 1 as const,
    documents,
    activeId,
    savedAt: Date.now(),
  };
}

export async function getDocxStorageEstimate() {
  if (!navigator.storage?.estimate) {
    return null;
  }

  const estimate = await navigator.storage.estimate();
  return {
    usage: estimate.usage ?? 0,
    quota: estimate.quota ?? 0,
  };
}

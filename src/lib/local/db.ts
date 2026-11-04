/**
 * Minimal IndexedDB wrapper for the local-first guest store.
 * No dependencies; browser only. Every call rejects when IndexedDB is unavailable (SSR, private modes).
 */

const DB_NAME = "pagewise-local";
const DB_VERSION = 1;

export type StoreName = "bookmarks" | "progress" | "attempts";

let dbPromise: Promise<IDBDatabase> | null = null;

function open(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") return Promise.reject(new Error("IndexedDB is not available"));
  dbPromise ??= new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("bookmarks")) db.createObjectStore("bookmarks", { keyPath: "question_id" });
      if (!db.objectStoreNames.contains("progress")) db.createObjectStore("progress", { keyPath: "chapter_id" });
      if (!db.objectStoreNames.contains("attempts")) db.createObjectStore("attempts", { keyPath: "id", autoIncrement: true });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => {
      dbPromise = null;
      reject(req.error ?? new Error("Could not open the local database"));
    };
  });
  return dbPromise;
}

function run<T>(store: StoreName, mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest): Promise<T> {
  return open().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(store, mode);
        const req = fn(tx.objectStore(store));
        req.onsuccess = () => resolve(req.result as T);
        req.onerror = () => reject(req.error ?? new Error("Local database request failed"));
      }),
  );
}

export const readAll = <T>(store: StoreName) => run<T[]>(store, "readonly", (s) => s.getAll());
export const readOne = <T>(store: StoreName, key: string) => run<T | undefined>(store, "readonly", (s) => s.get(key));
export const putOne = <T>(store: StoreName, value: T) => run<IDBValidKey>(store, "readwrite", (s) => s.put(value));
export const deleteOne = (store: StoreName, key: string) => run<undefined>(store, "readwrite", (s) => s.delete(key));

export function clearAll(): Promise<void> {
  return open().then(
    (db) =>
      new Promise<void>((resolve, reject) => {
        const tx = db.transaction(["bookmarks", "progress", "attempts"], "readwrite");
        tx.objectStore("bookmarks").clear();
        tx.objectStore("progress").clear();
        tx.objectStore("attempts").clear();
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error ?? new Error("Could not clear the local database"));
      }),
  );
}

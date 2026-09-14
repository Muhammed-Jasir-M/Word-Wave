import { SavedSession } from "@/types";

const DB_NAME = "WordWaveDB";
const DB_VERSION = 1;
const STORE_NAME = "sessions";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB is not supported in this environment"));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveSessionDB(session: SavedSession): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);

    // Prepare object for IndexedDB storage
    const recordToSave = {
      id: session.id,
      timestamp: session.timestamp,
      fileName: session.fileName,
      result: session.result,
      audioBlob: session.audioBlob || null,
    };

    store.put(recordToSave);

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error("Failed to save session to IndexedDB:", err);
  }
}

export async function getSessionsDB(): Promise<SavedSession[]> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const rawSessions = request.result || [];
        // Convert stored records into SavedSession objects
        const sessions: SavedSession[] = rawSessions.map((rec) => {
          let audioUrl: string | undefined = undefined;
          if (rec.audioBlob instanceof Blob) {
            audioUrl = URL.createObjectURL(rec.audioBlob);
          }
          return {
            id: rec.id,
            timestamp: rec.timestamp,
            fileName: rec.fileName,
            result: rec.result,
            audioBlob: rec.audioBlob || undefined,
            audioUrl,
          };
        });

        // Sort latest first
        sessions.sort((a, b) => Number(b.id) - Number(a.id));
        resolve(sessions);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error("Failed to load sessions from IndexedDB:", err);
    return [];
  }
}

export async function deleteSessionDB(id: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.delete(id);

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error("Failed to delete session from IndexedDB:", err);
  }
}

export async function clearSessionsDB(): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.clear();

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error("Failed to clear sessions from IndexedDB:", err);
  }
}

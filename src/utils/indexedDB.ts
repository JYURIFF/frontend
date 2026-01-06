import { FormData } from '../types/form';

const DB_NAME = 'resumeGeneratorDB';
const DB_VERSION = 1;
const STORE_NAME = 'formData';

interface IDBOperations {
  saveFormData: (data: FormData) => Promise<void>;
  loadFormData: () => Promise<FormData | null>;
  clearFormData: () => Promise<void>;
}

// Initialize IndexedDB
async function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

// Helper to handle transactions
async function withTransaction<T>(
  mode: IDBTransactionMode,
  callback: (store: IDBObjectStore) => Promise<T>
): Promise<T> {
  const db = await initDB();
  const transaction = db.transaction(STORE_NAME, mode);
  const store = transaction.objectStore(STORE_NAME);

  try {
    const result = await callback(store);
    await new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve(undefined);
      transaction.onerror = () => reject(transaction.error);
    });
    return result;
  } finally {
    db.close();
  }
}

// Save form data to IndexedDB
async function saveFormData(data: FormData): Promise<void> {
  const dataToSave = { ...data };
  return withTransaction('readwrite', async (store) => {
    return new Promise((resolve, reject) => {
      const request = store.put(dataToSave, 'currentForm');
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  });
}

// Load form data from IndexedDB
async function loadFormData(): Promise<FormData | null> {
  return withTransaction('readonly', async (store) => {
    return new Promise((resolve, reject) => {
      const request = store.get('currentForm');
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  });
}

// Clear form data from IndexedDB
async function clearFormData(): Promise<void> {
  return withTransaction('readwrite', async (store) => {
    return new Promise((resolve, reject) => {
      const request = store.delete('currentForm');
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  });
}

// Create debounced save function
function debounce<Args extends unknown[]>(
  func: (...args: Args) => Promise<void>,
  wait: number
): (...args: Args) => void {
  let timeout: NodeJS.Timeout;

  return (...args: Args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...args).catch(console.error);
    }, wait);
  };
}

// Export the debounced save function
export const debouncedSaveFormData = debounce(saveFormData, 1000);

// Export all database operations
export const db: IDBOperations = {
  saveFormData,
  loadFormData,
  clearFormData,
};
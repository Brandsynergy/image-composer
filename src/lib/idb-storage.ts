import { get, set, del, createStore } from 'idb-keyval';
import type { StateStorage } from 'zustand/middleware';

// Dedicated IndexedDB database + object store for the app
const idbStore = createStore('image-composer-db', 'app-state');

const STORAGE_KEY = 'image-composer-storage';

/**
 * Zustand-compatible async storage backed by IndexedDB.
 *
 * On first read, if IndexedDB is empty but localStorage still has data
 * (from before the migration), we transparently migrate it over and
 * clear the old localStorage entry.
 */
export const idbStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    const value = await get<string>(name, idbStore);

    if (value !== undefined) return value;

    // One-time migration: pull data from localStorage if it exists
    if (typeof window !== 'undefined') {
      const legacy = localStorage.getItem(STORAGE_KEY);
      if (legacy) {
        await set(name, legacy, idbStore);
        localStorage.removeItem(STORAGE_KEY);
        return legacy;
      }
    }

    return null;
  },

  setItem: async (name: string, value: string): Promise<void> => {
    await set(name, value, idbStore);
  },

  removeItem: async (name: string): Promise<void> => {
    await del(name, idbStore);
  },
};

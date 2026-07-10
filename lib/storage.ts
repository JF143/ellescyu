export const STORAGE_KEYS = {
  sections: "kiosk_sections",
  products: "kiosk_products",
  variants: "kiosk_variants",
  cart: "kiosk_cart",
  initialized: "kiosk_initialized",
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

export interface StorageAdapter {
  getItem<T>(key: StorageKey, fallback: T): T;
  setItem<T>(key: StorageKey, value: T): void;
  removeItem(key: StorageKey): void;
}

function createLocalStorageAdapter(): StorageAdapter {
  return {
    getItem<T>(key: StorageKey, fallback: T): T {
      if (typeof window === "undefined") return fallback;
      try {
        const raw = localStorage.getItem(key);
        return raw ? (JSON.parse(raw) as T) : fallback;
      } catch {
        return fallback;
      }
    },
    setItem<T>(key: StorageKey, value: T): void {
      if (typeof window === "undefined") return;
      localStorage.setItem(key, JSON.stringify(value));
    },
    removeItem(key: StorageKey): void {
      if (typeof window === "undefined") return;
      localStorage.removeItem(key);
    },
  };
}

let adapter: StorageAdapter = createLocalStorageAdapter();

export function setStorageAdapter(nextAdapter: StorageAdapter): void {
  adapter = nextAdapter;
}

export function getStorageAdapter(): StorageAdapter {
  return adapter;
}

export function storageGet<T>(key: StorageKey, fallback: T): T {
  return adapter.getItem(key, fallback);
}

export function storageSet<T>(key: StorageKey, value: T): void {
  adapter.setItem(key, value);
}

export function storageRemove(key: StorageKey): void {
  adapter.removeItem(key);
}

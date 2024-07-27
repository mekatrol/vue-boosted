import { vi } from 'vitest';

export class LocalStorageMock {
  store: Record<string, string | null>;

  constructor() {
    this.store = {};
  }

  clear(): void {
    this.store = {};
  }

  getItem(key: string): string | null {
    if (this.store[key] === undefined) {
      return null;
    }

    return this.store[key];
  }

  setItem(key: string, value: string): void {
    this.store[key] = value;
  }

  removeItem(key: string): void {
    delete this.store[key];
  }
}

export const useLocalStorageMock = (): LocalStorageMock => {
  // Create instance of mock local storage
  const mockLocalStorage = new LocalStorageMock();

  // Mock browser local storage
  vi.stubGlobal('localStorage', mockLocalStorage);

  return mockLocalStorage;
};

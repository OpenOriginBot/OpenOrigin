const STORAGE_PREFIX = 'openzeno_';

export function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(STORAGE_PREFIX + key);
    if (stored) {
      return JSON.parse(stored) as T;
    }
  } catch (e) {
    console.warn(`Failed to load ${key} from localStorage:`, e);
  }
  return defaultValue;
}

export function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Failed to save ${key} to localStorage:`, e);
  }
}

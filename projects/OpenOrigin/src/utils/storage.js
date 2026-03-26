// 轻量级本地存储封装，支持 JSON 持久化 + 内存缓存

const cache = {};

function load(key, defaultValue = null) {
  if (cache[key] !== undefined) return cache[key];
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : defaultValue;
    cache[key] = parsed;
    return parsed;
  } catch (e) {
    console.error(`[Storage] Failed to load ${key}:`, e);
    return defaultValue;
  }
}

function save(key, value) {
  try {
    cache[key] = value;
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.error(`[Storage] Failed to save ${key}:`, e);
    return false;
  }
}

function remove(key) {
  try {
    delete cache[key];
    localStorage.removeItem(key);
    return true;
  } catch (e) {
    return false;
  }
}

export const storage = { load, save, remove };

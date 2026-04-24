export function safeGet(key: string): string | null {
  try {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function safeSet(key: string, value: string): void {
  try {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(key, value);
  } catch {
    // swallow: private browsing, quota, etc.
  }
}

export function safeRemove(key: string): void {
  try {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(key);
  } catch {
    // swallow
  }
}

export function saveJson(key: string, value: unknown): void {
  try {
    safeSet(key, JSON.stringify(value));
  } catch {
    // swallow
  }
}

export function loadJson<T>(key: string, fallback: T): T {
  const raw = safeGet(key);
  if (raw === null) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function resetAllWithPrefix(prefix: string): void {
  if (typeof window === 'undefined') return;
  try {
    const toRemove: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith(prefix)) toRemove.push(k);
    }
    for (const k of toRemove) safeRemove(k);
  } catch {
    // swallow
  }
}

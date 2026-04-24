import { describe, expect, it, beforeEach, vi } from 'vitest';
import { loadJson, safeGet, safeRemove, safeSet, saveJson } from '../persistence';

class MemoryStorage {
  private readonly map = new Map<string, string>();
  get length(): number {
    return this.map.size;
  }
  key(i: number): string | null {
    return Array.from(this.map.keys())[i] ?? null;
  }
  getItem(k: string): string | null {
    return this.map.get(k) ?? null;
  }
  setItem(k: string, v: string): void {
    this.map.set(k, v);
  }
  removeItem(k: string): void {
    this.map.delete(k);
  }
  clear(): void {
    this.map.clear();
  }
}

describe('persistence', () => {
  beforeEach(() => {
    vi.stubGlobal('window', { localStorage: new MemoryStorage() });
  });

  it('safeSet / safeGet round-trip strings', () => {
    safeSet('k', 'v');
    expect(safeGet('k')).toBe('v');
  });

  it('safeRemove deletes the key', () => {
    safeSet('k', 'v');
    safeRemove('k');
    expect(safeGet('k')).toBeNull();
  });

  it('saveJson / loadJson round-trip objects', () => {
    saveJson('k', { a: 1, b: 'x' });
    expect(loadJson<{ a: number; b: string }>('k', { a: 0, b: '' })).toEqual({ a: 1, b: 'x' });
  });

  it('loadJson returns fallback when key missing', () => {
    expect(loadJson('missing', { ok: true })).toEqual({ ok: true });
  });

  it('loadJson returns fallback when stored value is invalid JSON', () => {
    safeSet('k', 'not-json');
    expect(loadJson('k', { ok: true })).toEqual({ ok: true });
  });
});

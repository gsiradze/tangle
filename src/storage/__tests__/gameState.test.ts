import { beforeEach, describe, expect, it } from 'vitest';
import {
  applyCurrentLevel,
  applyIncrementSession,
  applyOnboardingComplete,
  applyResolve,
  initialGameState,
  isLevelUnlocked,
  loadGameState,
  resetGameState,
  saveGameState,
  type SavedGameState,
} from '../gameState';

function localStorageStub(): Storage {
  const data = new Map<string, string>();
  return {
    get length() {
      return data.size;
    },
    clear() {
      data.clear();
    },
    getItem(key) {
      return data.has(key) ? data.get(key)! : null;
    },
    setItem(key, value) {
      data.set(key, String(value));
    },
    removeItem(key) {
      data.delete(key);
    },
    key(index) {
      return Array.from(data.keys())[index] ?? null;
    },
  };
}

beforeEach(() => {
  const store = localStorageStub();
  Object.defineProperty(globalThis, 'window', {
    value: { localStorage: store, sessionStorage: localStorageStub() },
    writable: true,
    configurable: true,
  });
});

describe('applyResolve', () => {
  it('records stars and best moves for a new level', () => {
    const next = applyResolve(initialGameState, 3, 5, 4);
    expect(next.progress['3']).toEqual({ stars: 3, bestMoves: 5 });
  });

  it('keeps best stars and min moves across attempts', () => {
    const a = applyResolve(initialGameState, 2, 10, 4);
    const b = applyResolve(a, 2, 6, 4);
    expect(b.progress['2']).toEqual({ stars: 2, bestMoves: 6 });
  });

  it('never downgrades stars on a worse attempt', () => {
    const a = applyResolve(initialGameState, 1, 4, 4);
    const b = applyResolve(a, 1, 20, 4);
    expect(b.progress['1']?.stars).toBe(3);
  });
});

describe('applyCurrentLevel', () => {
  it('updates the current level', () => {
    const next = applyCurrentLevel(initialGameState, 7);
    expect(next.currentLevel).toBe(7);
  });

  it('returns the same reference when unchanged', () => {
    const next = applyCurrentLevel(initialGameState, initialGameState.currentLevel);
    expect(next).toBe(initialGameState);
  });
});

describe('applyOnboardingComplete', () => {
  it('sets the flag and returns a new state', () => {
    const next = applyOnboardingComplete(initialGameState);
    expect(next.onboardingCompleted).toBe(true);
  });

  it('is idempotent', () => {
    const once = applyOnboardingComplete(initialGameState);
    const twice = applyOnboardingComplete(once);
    expect(twice).toBe(once);
  });
});

describe('applyIncrementSession', () => {
  it('increments the session counter', () => {
    const a = applyIncrementSession(initialGameState);
    const b = applyIncrementSession(a);
    expect(a.sessionCount).toBe(1);
    expect(b.sessionCount).toBe(2);
  });
});

describe('isLevelUnlocked', () => {
  it('unlocks level 1 unconditionally', () => {
    expect(isLevelUnlocked(initialGameState, 1, 100)).toBe(true);
  });

  it('locks a later level without predecessor progress', () => {
    expect(isLevelUnlocked(initialGameState, 5, 100)).toBe(false);
  });

  it('unlocks a level once its predecessor has any stars', () => {
    const state = applyResolve(initialGameState, 4, 100, 4);
    expect(isLevelUnlocked(state, 5, 100)).toBe(true);
  });

  it('rejects out-of-range ids', () => {
    expect(isLevelUnlocked(initialGameState, 0, 100)).toBe(false);
    expect(isLevelUnlocked(initialGameState, 101, 100)).toBe(false);
  });
});

describe('load/save/reset round-trip', () => {
  it('persists and restores state', () => {
    const state: SavedGameState = applyResolve(initialGameState, 1, 4, 4);
    saveGameState(state);
    const loaded = loadGameState();
    expect(loaded.progress['1']).toEqual({ stars: 3, bestMoves: 4 });
  });

  it('returns initial state when nothing stored', () => {
    expect(loadGameState()).toEqual(initialGameState);
  });

  it('reset wipes all tangle-prefixed keys', () => {
    saveGameState(applyResolve(initialGameState, 1, 4, 4));
    resetGameState();
    expect(loadGameState()).toEqual(initialGameState);
  });
});

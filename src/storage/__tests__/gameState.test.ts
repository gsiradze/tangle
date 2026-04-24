import { beforeEach, describe, expect, it } from 'vitest';
import {
  applyCurrentLevel,
  applyDailySolve,
  applyIncrementSession,
  applyOnboardingComplete,
  applyResolve,
  applyStreakCheck,
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

describe('applyDailySolve', () => {
  it('records a daily and starts a streak when solved on the day', () => {
    const next = applyDailySolve(initialGameState, '2026-04-24', '2026-04-24', 1);
    expect(next.daily['2026-04-24']).toMatchObject({ stars: 3, bestMoves: 1, countedForStreak: true });
    expect(next.streak).toMatchObject({ current: 1, best: 1, lastCompletedDate: '2026-04-24' });
  });

  it('extends the streak when yesterday is the last completed date', () => {
    const day1 = applyDailySolve(initialGameState, '2026-04-23', '2026-04-23', 1);
    const day2 = applyDailySolve(day1, '2026-04-24', '2026-04-24', 2);
    expect(day2.streak.current).toBe(2);
    expect(day2.streak.best).toBe(2);
  });

  it('resets the streak when there is a gap', () => {
    const day1 = applyDailySolve(initialGameState, '2026-04-20', '2026-04-20', 1);
    const day2 = applyDailySolve(day1, '2026-04-24', '2026-04-24', 1);
    expect(day2.streak.current).toBe(1);
    expect(day2.streak.best).toBe(1);
  });

  it('does not count a catch-up solve toward the streak', () => {
    const state = applyDailySolve(initialGameState, '2026-04-20', '2026-04-24', 1);
    expect(state.streak.current).toBe(0);
    expect(state.daily['2026-04-20']).toMatchObject({ countedForStreak: false, stars: 3 });
  });

  it('upgrades stars and best moves on a better re-attempt', () => {
    const first = applyDailySolve(initialGameState, '2026-04-24', '2026-04-24', 4);
    const second = applyDailySolve(first, '2026-04-24', '2026-04-24', 1);
    expect(second.daily['2026-04-24']).toMatchObject({ stars: 3, bestMoves: 1 });
    expect(second.streak.current).toBe(1);
  });

  it('does not double-bump the streak on a same-day replay', () => {
    const first = applyDailySolve(initialGameState, '2026-04-24', '2026-04-24', 2);
    const second = applyDailySolve(first, '2026-04-24', '2026-04-24', 1);
    expect(first.streak.current).toBe(1);
    expect(second.streak.current).toBe(1);
  });
});

describe('applyStreakCheck', () => {
  it('zeroes the streak if last completed date is older than yesterday', () => {
    const withStreak = applyDailySolve(initialGameState, '2026-04-20', '2026-04-20', 1);
    const checked = applyStreakCheck(withStreak, '2026-04-24');
    expect(checked.streak.current).toBe(0);
    expect(checked.streak.best).toBe(1);
  });

  it('keeps the streak when checking on the same day', () => {
    const withStreak = applyDailySolve(initialGameState, '2026-04-24', '2026-04-24', 1);
    const checked = applyStreakCheck(withStreak, '2026-04-24');
    expect(checked.streak.current).toBe(1);
  });

  it('keeps the streak when today is the day after the last completed', () => {
    const withStreak = applyDailySolve(initialGameState, '2026-04-23', '2026-04-23', 1);
    const checked = applyStreakCheck(withStreak, '2026-04-24');
    expect(checked.streak.current).toBe(1);
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

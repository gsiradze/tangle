import { describe, expect, it } from 'vitest';
import { mulberry32, randInt, randRange, shuffleInPlace } from '../rng';

describe('mulberry32', () => {
  it('is deterministic for the same seed across 1000 draws', () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    for (let i = 0; i < 1000; i++) {
      expect(a()).toBe(b());
    }
  });

  it('diverges between different seeds', () => {
    const a = mulberry32(1);
    const b = mulberry32(2);
    let differs = false;
    for (let i = 0; i < 100; i++) {
      if (a() !== b()) {
        differs = true;
        break;
      }
    }
    expect(differs).toBe(true);
  });

  it('yields values in [0, 1)', () => {
    const rng = mulberry32(123);
    for (let i = 0; i < 10_000; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe('randRange', () => {
  it('stays within bounds', () => {
    const rng = mulberry32(7);
    for (let i = 0; i < 1000; i++) {
      const v = randRange(rng, -5, 5);
      expect(v).toBeGreaterThanOrEqual(-5);
      expect(v).toBeLessThan(5);
    }
  });
});

describe('randInt', () => {
  it('returns integers within [min, max)', () => {
    const rng = mulberry32(11);
    const seen = new Set<number>();
    for (let i = 0; i < 1000; i++) {
      const v = randInt(rng, 0, 5);
      expect(Number.isInteger(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(5);
      seen.add(v);
    }
    expect(seen.size).toBe(5);
  });
});

describe('shuffleInPlace', () => {
  it('produces a permutation of the original elements', () => {
    const rng = mulberry32(99);
    const input = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const shuffled = shuffleInPlace(rng, [...input]);
    expect([...shuffled].sort((a, b) => a - b)).toEqual(input);
  });

  it('mutates and returns the same array reference', () => {
    const rng = mulberry32(1);
    const arr = [1, 2, 3, 4];
    const result = shuffleInPlace(rng, arr);
    expect(result).toBe(arr);
  });

  it('is deterministic for the same seed', () => {
    const a = shuffleInPlace(mulberry32(5), [1, 2, 3, 4, 5, 6, 7, 8]);
    const b = shuffleInPlace(mulberry32(5), [1, 2, 3, 4, 5, 6, 7, 8]);
    expect(a).toEqual(b);
  });
});

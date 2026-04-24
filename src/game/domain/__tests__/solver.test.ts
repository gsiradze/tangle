import { describe, expect, it } from 'vitest';
import { estimateOptimalMoves } from '../solver';
import type { Vec2 } from '../types';

const p = (x: number, y: number): Vec2 => ({ x, y });

describe('estimateOptimalMoves', () => {
  it('returns 1 when every vertex is already in place', () => {
    const pts = [p(0, 0), p(1, 1), p(2, 2)];
    expect(estimateOptimalMoves(pts, pts)).toBe(1);
  });

  it('returns vertex count when nothing matches', () => {
    const solved = [p(0, 0), p(1, 0), p(2, 0)];
    const initial = [p(5, 5), p(6, 5), p(7, 5)];
    expect(estimateOptimalMoves(solved, initial)).toBe(3);
  });

  it('counts partial matches within tolerance', () => {
    const solved = [p(0, 0), p(1, 0), p(2, 0), p(3, 0)];
    const initial = [p(0, 0), p(1, 0), p(9, 9), p(9, 9)];
    expect(estimateOptimalMoves(solved, initial)).toBe(2);
  });

  it('respects a custom tolerance', () => {
    const solved = [p(0, 0), p(1, 0)];
    const initial = [p(0.04, 0), p(0.2, 0)];
    expect(estimateOptimalMoves(solved, initial, 0.05)).toBe(1);
    expect(estimateOptimalMoves(solved, initial, 0.5)).toBe(1);
  });

  it('throws on mismatched lengths', () => {
    expect(() => estimateOptimalMoves([p(0, 0)], [p(0, 0), p(1, 1)])).toThrow();
  });
});

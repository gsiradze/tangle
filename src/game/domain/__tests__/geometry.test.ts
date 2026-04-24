import { describe, expect, it } from 'vitest';
import { clamp, clampPoint, distanceSq, segmentsIntersect } from '../geometry';

describe('distanceSq', () => {
  it('returns 0 for identical points', () => {
    expect(distanceSq({ x: 3, y: 4 }, { x: 3, y: 4 })).toBe(0);
  });

  it('returns squared euclidean distance', () => {
    expect(distanceSq({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(25);
  });
});

describe('clamp', () => {
  it('passes values inside the range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it('clamps below min', () => {
    expect(clamp(-1, 0, 10)).toBe(0);
  });

  it('clamps above max', () => {
    expect(clamp(11, 0, 10)).toBe(10);
  });
});

describe('clampPoint', () => {
  it('clamps x and y independently', () => {
    expect(clampPoint({ x: -5, y: 20 }, 0, 0, 10, 10)).toEqual({ x: 0, y: 10 });
  });

  it('leaves interior points untouched', () => {
    expect(clampPoint({ x: 4, y: 7 }, 0, 0, 10, 10)).toEqual({ x: 4, y: 7 });
  });
});

describe('segmentsIntersect', () => {
  it('returns true for a proper X crossing', () => {
    const result = segmentsIntersect(
      { x: 0, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
      { x: 10, y: 0 },
    );
    expect(result).toBe(true);
  });

  it('returns false for parallel non-overlapping segments', () => {
    const result = segmentsIntersect(
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 0, y: 5 },
      { x: 10, y: 5 },
    );
    expect(result).toBe(false);
  });

  it('returns false for disjoint segments', () => {
    const result = segmentsIntersect(
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 5, y: 5 },
      { x: 6, y: 6 },
    );
    expect(result).toBe(false);
  });

  it('returns false when segments share an endpoint', () => {
    const result = segmentsIntersect(
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 10 },
    );
    expect(result).toBe(false);
  });

  it('returns false at a T-junction (endpoint on interior of other segment)', () => {
    const result = segmentsIntersect(
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 5, y: 0 },
      { x: 5, y: 10 },
    );
    expect(result).toBe(false);
  });

  it('returns false for collinear overlapping segments', () => {
    const result = segmentsIntersect(
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 5, y: 0 },
      { x: 15, y: 0 },
    );
    expect(result).toBe(false);
  });
});

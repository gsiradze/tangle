import { describe, expect, it } from 'vitest';
import { computeStars } from '../stars';

describe('computeStars', () => {
  it('awards 3 stars for moves within 1.25× optimal', () => {
    expect(computeStars(4, 4)).toBe(3);
    expect(computeStars(5, 4)).toBe(3);
  });

  it('awards 2 stars for moves within 2× optimal', () => {
    expect(computeStars(6, 4)).toBe(2);
    expect(computeStars(8, 4)).toBe(2);
  });

  it('awards 1 star for anything above 2× optimal', () => {
    expect(computeStars(9, 4)).toBe(1);
    expect(computeStars(100, 4)).toBe(1);
  });

  it('handles optimal of 1 correctly', () => {
    expect(computeStars(1, 1)).toBe(3);
    expect(computeStars(2, 1)).toBe(2);
    expect(computeStars(3, 1)).toBe(1);
  });
});

import { describe, expect, it } from 'vitest';
import { lerpColor } from '../color';

describe('lerpColor', () => {
  it('returns the from color at t=0', () => {
    expect(lerpColor(0x112233, 0xaabbcc, 0)).toBe(0x112233);
  });

  it('returns the to color at t=1', () => {
    expect(lerpColor(0x112233, 0xaabbcc, 1)).toBe(0xaabbcc);
  });

  it('interpolates each channel at t=0.5', () => {
    expect(lerpColor(0x000000, 0xffffff, 0.5)).toBe(0x808080);
  });

  it('clamps t below 0', () => {
    expect(lerpColor(0x112233, 0xaabbcc, -1)).toBe(0x112233);
  });

  it('clamps t above 1', () => {
    expect(lerpColor(0x112233, 0xaabbcc, 2)).toBe(0xaabbcc);
  });
});

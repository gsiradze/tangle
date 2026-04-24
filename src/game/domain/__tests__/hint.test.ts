import { describe, expect, it } from 'vitest';
import { pickHintVertex } from '../hint';
import type { Vec2, Vertex } from '../types';

const identity = (p: Vec2): Vec2 => p;

describe('pickHintVertex', () => {
  it('returns null when every vertex is within tolerance', () => {
    const solved: Vec2[] = [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
    ];
    const current: Vertex[] = [
      { id: 0, x: 0, y: 0 },
      { id: 1, x: 1.01, y: 1 },
    ];
    expect(pickHintVertex(solved, current, identity, 0.05)).toBeNull();
  });

  it('picks the vertex farthest from its solved position', () => {
    const solved: Vec2[] = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
    ];
    const current: Vertex[] = [
      { id: 0, x: 0.1, y: 0 },
      { id: 1, x: 5, y: 5 },
      { id: 2, x: 0, y: 1.2 },
    ];
    expect(pickHintVertex(solved, current, identity, 0.05)).toBe(1);
  });

  it('applies the provided coordinate transform', () => {
    const solved: Vec2[] = [{ x: 0.5, y: 0.5 }];
    const current: Vertex[] = [{ id: 0, x: 100, y: 100 }];
    const scale = (p: Vec2): Vec2 => ({ x: p.x * 200, y: p.y * 200 });
    expect(pickHintVertex(solved, current, scale, 5)).toBeNull();
    expect(pickHintVertex(solved, [{ id: 0, x: 50, y: 50 }], scale, 5)).toBe(0);
  });
});

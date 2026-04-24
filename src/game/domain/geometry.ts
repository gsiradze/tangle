import type { Vec2 } from './types';

export function distanceSq(a: Vec2, b: Vec2): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function clampPoint(
  p: Vec2,
  minX: number,
  minY: number,
  maxX: number,
  maxY: number,
): Vec2 {
  return { x: clamp(p.x, minX, maxX), y: clamp(p.y, minY, maxY) };
}

function orient(a: Vec2, b: Vec2, c: Vec2): number {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}

export function segmentsIntersect(a: Vec2, b: Vec2, c: Vec2, d: Vec2): boolean {
  // Proper-interior crossing only. Shared endpoints and any degeneracy
  // (collinear, T-junction) produce a zero orientation and return false —
  // appropriate for a planarity game where shared vertices never count.
  const o1 = orient(a, b, c);
  const o2 = orient(a, b, d);
  const o3 = orient(c, d, a);
  const o4 = orient(c, d, b);

  if (o1 === 0 || o2 === 0 || o3 === 0 || o4 === 0) return false;

  return (o1 > 0) !== (o2 > 0) && (o3 > 0) !== (o4 > 0);
}

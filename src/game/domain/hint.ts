import { distanceSq } from './geometry';
import type { Vec2, Vertex } from './types';

const SNAP_TOLERANCE = 0.05;

export function pickHintVertex(
  solved: readonly Vec2[],
  currentWorld: readonly Vertex[],
  worldFromNormalized: (p: Vec2) => Vec2,
  toleranceWorldUnits: number,
): number | null {
  const toleranceSq = toleranceWorldUnits * toleranceWorldUnits;
  let worstId: number | null = null;
  let worstDistSq = toleranceSq;
  for (let i = 0; i < solved.length; i++) {
    const target = worldFromNormalized(solved[i]!);
    const current = currentWorld[i]!;
    const d = distanceSq(current, target);
    if (d > worstDistSq) {
      worstDistSq = d;
      worstId = i;
    }
  }
  return worstId;
}

export { SNAP_TOLERANCE };

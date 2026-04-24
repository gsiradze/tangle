import { distanceSq } from './geometry';
import type { Vec2 } from './types';

const DEFAULT_TOLERANCE = 0.05;

export function estimateOptimalMoves(
  solved: readonly Vec2[],
  initial: readonly Vec2[],
  tolerance: number = DEFAULT_TOLERANCE,
): number {
  if (solved.length !== initial.length) {
    throw new Error('solved and initial must have equal length');
  }
  const toleranceSq = tolerance * tolerance;
  let inPlace = 0;
  for (let i = 0; i < solved.length; i++) {
    if (distanceSq(solved[i]!, initial[i]!) < toleranceSq) inPlace++;
  }
  return Math.max(1, solved.length - inPlace);
}

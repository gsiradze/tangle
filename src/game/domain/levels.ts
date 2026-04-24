import { LEVELS } from './levels.generated';
import type { Level } from './types';

export const LEVEL_COUNT = LEVELS.length;

export function getAllLevels(): readonly Level[] {
  return LEVELS;
}

export function getLevel(id: number): Level | undefined {
  return LEVELS.find((l) => l.id === id);
}

import { computeStars, type Stars } from '../game/domain/stars';
import { loadJson, resetAllWithPrefix, saveJson } from './persistence';

export interface StoredLevelProgress {
  readonly stars: Stars;
  readonly bestMoves: number;
}

export interface SavedGameState {
  readonly version: 1;
  readonly currentLevel: number;
  readonly progress: Readonly<Record<string, StoredLevelProgress>>;
  readonly sessionCount: number;
  readonly onboardingCompleted: boolean;
}

const KEY = 'tangle:state:v1';
const PREFIX = 'tangle:';
const SESSION_GUARD_KEY = 'tangle:session-guard';

export const initialGameState: SavedGameState = {
  version: 1,
  currentLevel: 1,
  progress: {},
  sessionCount: 0,
  onboardingCompleted: false,
};

export function loadGameState(): SavedGameState {
  const loaded = loadJson<SavedGameState>(KEY, initialGameState);
  if (loaded.version !== 1) return initialGameState;
  return { ...initialGameState, ...loaded };
}

export function saveGameState(state: SavedGameState): void {
  saveJson(KEY, state);
}

export function resetGameState(): SavedGameState {
  resetAllWithPrefix(PREFIX);
  return initialGameState;
}

export function applyResolve(
  state: SavedGameState,
  levelId: number,
  moves: number,
  optimalMoves: number,
): SavedGameState {
  const stars = computeStars(moves, optimalMoves);
  const key = String(levelId);
  const existing = state.progress[key];
  const nextProgress: StoredLevelProgress = existing
    ? {
        stars: (Math.max(existing.stars, stars) as Stars),
        bestMoves: Math.min(existing.bestMoves, moves),
      }
    : { stars, bestMoves: moves };
  return {
    ...state,
    progress: { ...state.progress, [key]: nextProgress },
  };
}

export function applyCurrentLevel(state: SavedGameState, levelId: number): SavedGameState {
  if (state.currentLevel === levelId) return state;
  return { ...state, currentLevel: levelId };
}

export function applyOnboardingComplete(state: SavedGameState): SavedGameState {
  if (state.onboardingCompleted) return state;
  return { ...state, onboardingCompleted: true };
}

export function applyIncrementSession(state: SavedGameState): SavedGameState {
  return { ...state, sessionCount: state.sessionCount + 1 };
}

export function shouldAdvanceSession(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    if (window.sessionStorage.getItem(SESSION_GUARD_KEY)) return false;
    window.sessionStorage.setItem(SESSION_GUARD_KEY, '1');
    return true;
  } catch {
    return false;
  }
}

export function isLevelUnlocked(state: SavedGameState, levelId: number, total: number): boolean {
  if (levelId < 1 || levelId > total) return false;
  if (levelId === 1) return true;
  return state.progress[String(levelId - 1)] !== undefined;
}

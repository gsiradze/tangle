import { dailyStarsFromMoves, previousDayKey } from '../game/domain/daily';
import { computeStars, type Stars } from '../game/domain/stars';
import { loadJson, resetAllWithPrefix, saveJson } from './persistence';

export interface StoredLevelProgress {
  readonly stars: Stars;
  readonly bestMoves: number;
}

export interface StoredDailyProgress {
  readonly stars: Stars;
  readonly bestMoves: number;
  readonly firstSolvedAt: number;
  readonly countedForStreak: boolean;
}

export interface DailyStreak {
  readonly current: number;
  readonly best: number;
  readonly lastCompletedDate: string | null;
}

export interface SavedGameState {
  readonly version: 1;
  readonly currentLevel: number;
  readonly progress: Readonly<Record<string, StoredLevelProgress>>;
  readonly sessionCount: number;
  readonly onboardingCompleted: boolean;
  readonly daily: Readonly<Record<string, StoredDailyProgress>>;
  readonly streak: DailyStreak;
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
  daily: {},
  streak: { current: 0, best: 0, lastCompletedDate: null },
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

export function applyDailySolve(
  state: SavedGameState,
  dayKey: string,
  todayKey: string,
  moves: number,
  solvedAt: number = Date.now(),
): SavedGameState {
  const isOnTime = dayKey === todayKey;
  const stars = dailyStarsFromMoves(moves);
  const existing = state.daily[dayKey];
  const nextProgress: StoredDailyProgress = existing
    ? {
        stars: Math.max(existing.stars, stars) as Stars,
        bestMoves: Math.min(existing.bestMoves, moves),
        firstSolvedAt: existing.firstSolvedAt,
        countedForStreak: existing.countedForStreak || isOnTime,
      }
    : {
        stars,
        bestMoves: moves,
        firstSolvedAt: solvedAt,
        countedForStreak: isOnTime,
      };

  let streak = state.streak;
  const isFirstOnTimeSolve = isOnTime && (!existing || !existing.countedForStreak);
  if (isFirstOnTimeSolve) {
    const continues = streak.lastCompletedDate === previousDayKey(dayKey);
    const nextCurrent = continues ? streak.current + 1 : 1;
    streak = {
      current: nextCurrent,
      best: Math.max(streak.best, nextCurrent),
      lastCompletedDate: dayKey,
    };
  }

  return {
    ...state,
    daily: { ...state.daily, [dayKey]: nextProgress },
    streak,
  };
}

export function applyStreakCheck(state: SavedGameState, todayKey: string): SavedGameState {
  if (state.streak.current === 0) return state;
  if (state.streak.lastCompletedDate === null) return state;
  if (state.streak.lastCompletedDate === todayKey) return state;
  if (state.streak.lastCompletedDate === previousDayKey(todayKey)) return state;
  // Gap ≥ 2 days: streak broken.
  return { ...state, streak: { ...state.streak, current: 0 } };
}

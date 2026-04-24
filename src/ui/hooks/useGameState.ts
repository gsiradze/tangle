import { useCallback, useEffect, useRef, useState } from 'react';
import {
  applyCurrentLevel,
  applyIncrementSession,
  applyOnboardingComplete,
  applyResolve,
  initialGameState,
  loadGameState,
  resetGameState,
  saveGameState,
  shouldAdvanceSession,
  type SavedGameState,
} from '../../storage/gameState';

export interface GameStateActions {
  recordSolve(levelId: number, moves: number, optimalMoves: number): void;
  setCurrentLevel(levelId: number): void;
  completeOnboarding(): void;
  reset(): void;
}

export interface GameStateHook {
  readonly state: SavedGameState;
  readonly actions: GameStateActions;
}

export function useGameState(): GameStateHook {
  const [state, setState] = useState<SavedGameState>(initialGameState);
  const stateRef = useRef(state);
  stateRef.current = state;
  const hydrated = useRef(false);

  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    let next = loadGameState();
    if (shouldAdvanceSession()) next = applyIncrementSession(next);
    saveGameState(next);
    setState(next);
  }, []);

  const update = useCallback((producer: (current: SavedGameState) => SavedGameState) => {
    setState((prev) => {
      const next = producer(prev);
      if (next !== prev) saveGameState(next);
      return next;
    });
  }, []);

  const recordSolve = useCallback(
    (levelId: number, moves: number, optimalMoves: number) => {
      update((s) => applyResolve(s, levelId, moves, optimalMoves));
    },
    [update],
  );

  const setCurrentLevel = useCallback(
    (levelId: number) => {
      update((s) => applyCurrentLevel(s, levelId));
    },
    [update],
  );

  const completeOnboarding = useCallback(() => {
    update((s) => applyOnboardingComplete(s));
  }, [update]);

  const reset = useCallback(() => {
    setState(resetGameState());
  }, []);

  return {
    state,
    actions: { recordSolve, setCurrentLevel, completeOnboarding, reset },
  };
}

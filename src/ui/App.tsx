import { useCallback, useEffect, useState } from 'react';
import { tierForLevel } from '../game/domain/tiers';
import { useGameState } from './hooks/useGameState';
import { MainMenu } from './screens/MainMenu';
import { LevelSelect } from './screens/LevelSelect';
import { PlayScreen } from './screens/PlayScreen';
import { Settings } from './screens/Settings';
import { TierAdvance } from './screens/TierAdvance';

type Screen = 'menu' | 'play' | 'levels' | 'settings';

interface PendingAdvance {
  readonly fromStop: number;
  readonly toStop: number;
}

export default function App() {
  const { state, actions } = useGameState();
  const [screen, setScreen] = useState<Screen>('menu');
  const [darkMode, setDarkMode] = useState(false);
  const [pendingAdvance, setPendingAdvance] = useState<PendingAdvance | null>(null);

  useEffect(() => {
    const el = document.documentElement;
    if (darkMode) el.classList.add('dark');
    else el.classList.remove('dark');
  }, [darkMode]);

  const handleResetProgress = useCallback(() => {
    actions.reset();
    setPendingAdvance(null);
    setScreen('menu');
  }, [actions]);

  const handleSolve = useCallback(
    (levelId: number, moves: number, optimalMoves: number) => {
      actions.recordSolve(levelId, moves, optimalMoves);
    },
    [actions],
  );

  const handleCurrentLevel = useCallback(
    (nextLevelId: number) => {
      const prevStop = tierForLevel(state.currentLevel).stop;
      const nextStop = tierForLevel(nextLevelId).stop;
      actions.setCurrentLevel(nextLevelId);
      if (nextStop > prevStop) {
        setPendingAdvance({ fromStop: prevStop, toStop: nextStop });
      }
    },
    [actions, state.currentLevel],
  );

  if (pendingAdvance) {
    return (
      <TierAdvance
        fromStop={pendingAdvance.fromStop}
        toStop={pendingAdvance.toStop}
        onContinue={() => {
          setPendingAdvance(null);
          setScreen('play');
        }}
        onSkip={() => {
          setPendingAdvance(null);
          setScreen('play');
        }}
      />
    );
  }

  if (screen === 'menu') {
    return (
      <MainMenu
        currentLevel={state.currentLevel}
        streakDays={state.sessionCount}
        onPlay={() => setScreen('play')}
        onLevels={() => setScreen('levels')}
        onSettings={() => setScreen('settings')}
      />
    );
  }

  if (screen === 'levels') {
    return (
      <LevelSelect
        state={state}
        onBack={() => setScreen('menu')}
        onPick={(id) => {
          actions.setCurrentLevel(id);
          setScreen('play');
        }}
      />
    );
  }

  if (screen === 'settings') {
    return (
      <Settings
        darkMode={darkMode}
        onToggleDark={setDarkMode}
        onBack={() => setScreen('menu')}
        onResetProgress={handleResetProgress}
      />
    );
  }

  return (
    <PlayScreen
      levelId={state.currentLevel}
      state={state}
      onBack={() => setScreen('menu')}
      onLevelSelect={() => setScreen('levels')}
      onSolved={handleSolve}
      onCurrentLevel={handleCurrentLevel}
      onOnboardingComplete={actions.completeOnboarding}
    />
  );
}

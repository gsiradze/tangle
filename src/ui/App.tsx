import { useCallback, useEffect, useState } from 'react';
import { todayKey } from '../game/domain/daily';
import { tierForLevel } from '../game/domain/tiers';
import { useGameState } from './hooks/useGameState';
import { DailyCalendar } from './screens/DailyCalendar';
import { DailyPlay } from './screens/DailyPlay';
import { LevelSelect } from './screens/LevelSelect';
import { MainMenu } from './screens/MainMenu';
import { PlayScreen } from './screens/PlayScreen';
import { Settings } from './screens/Settings';
import { TierAdvance } from './screens/TierAdvance';

type Screen =
  | { kind: 'menu' }
  | { kind: 'play' }
  | { kind: 'levels' }
  | { kind: 'settings' }
  | { kind: 'daily-calendar' }
  | { kind: 'daily-play'; dayKey: string };

interface PendingAdvance {
  readonly fromStop: number;
  readonly toStop: number;
}

export default function App() {
  const { state, actions } = useGameState();
  const [screen, setScreen] = useState<Screen>({ kind: 'menu' });
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
    setScreen({ kind: 'menu' });
  }, [actions]);

  const handleSolve = useCallback(
    (levelId: number, moves: number, optimalMoves: number) => {
      actions.recordSolve(levelId, moves, optimalMoves);
    },
    [actions],
  );

  const handleDailySolve = useCallback(
    (dayKey: string, moves: number) => {
      actions.recordDailySolve(dayKey, moves);
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
          setScreen({ kind: 'play' });
        }}
        onSkip={() => {
          setPendingAdvance(null);
          setScreen({ kind: 'play' });
        }}
      />
    );
  }

  if (screen.kind === 'menu') {
    const today = todayKey();
    const todayUnplayed = state.daily[today] === undefined;
    return (
      <MainMenu
        currentLevel={state.currentLevel}
        streakDays={state.streak.current}
        todayUnplayed={todayUnplayed}
        onPlay={() => setScreen({ kind: 'play' })}
        onDaily={() => setScreen({ kind: 'daily-calendar' })}
        onLevels={() => setScreen({ kind: 'levels' })}
        onSettings={() => setScreen({ kind: 'settings' })}
      />
    );
  }

  if (screen.kind === 'levels') {
    return (
      <LevelSelect
        state={state}
        onBack={() => setScreen({ kind: 'menu' })}
        onPick={(id) => {
          actions.setCurrentLevel(id);
          setScreen({ kind: 'play' });
        }}
      />
    );
  }

  if (screen.kind === 'settings') {
    return (
      <Settings
        darkMode={darkMode}
        onToggleDark={setDarkMode}
        onBack={() => setScreen({ kind: 'menu' })}
        onResetProgress={handleResetProgress}
      />
    );
  }

  if (screen.kind === 'daily-calendar') {
    return (
      <DailyCalendar
        state={state}
        onBack={() => setScreen({ kind: 'menu' })}
        onPlayDay={(dayKey) => setScreen({ kind: 'daily-play', dayKey })}
      />
    );
  }

  if (screen.kind === 'daily-play') {
    return (
      <DailyPlay
        dayKey={screen.dayKey}
        state={state}
        onBack={() => setScreen({ kind: 'daily-calendar' })}
        onDailySolved={handleDailySolve}
      />
    );
  }

  return (
    <PlayScreen
      levelId={state.currentLevel}
      state={state}
      onBack={() => setScreen({ kind: 'menu' })}
      onLevelSelect={() => setScreen({ kind: 'levels' })}
      onSolved={handleSolve}
      onCurrentLevel={handleCurrentLevel}
      onOnboardingComplete={actions.completeOnboarding}
    />
  );
}

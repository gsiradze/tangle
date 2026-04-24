import { useCallback, useEffect, useState } from 'react';
import { EventBus } from '../../game/EventBus';
import { LEVEL_COUNT, getLevel } from '../../game/domain/levels';
import { computeStars } from '../../game/domain/stars';
import { tierForLevel } from '../../game/domain/tiers';
import { adProvider } from '../../storage/ads';
import type { SavedGameState } from '../../storage/gameState';
import { trackEvent } from '../../telemetry/analytics';
import { BobrCameo } from '../components/BobrCameo';
import { Header, IconButton } from '../components/Header';
import { LevelCompleteModal } from '../components/LevelCompleteModal';
import { MonoLabel } from '../components/MonoLabel';
import { OnboardingOverlay } from '../components/OnboardingOverlay';
import { StarRow } from '../components/StarRow';
import { PhaserGame } from '../PhaserGame';

const MIN_SESSIONS_FOR_ADS = 2;

interface PlayScreenProps {
  readonly levelId: number;
  readonly state: SavedGameState;
  readonly onBack: () => void;
  readonly onLevelSelect: () => void;
  readonly onSolved: (levelId: number, moves: number, optimalMoves: number) => void;
  readonly onCurrentLevel: (levelId: number) => void;
  readonly onOnboardingComplete: () => void;
}

export function PlayScreen({
  levelId,
  state,
  onBack,
  onLevelSelect,
  onSolved,
  onCurrentLevel,
  onOnboardingComplete,
}: PlayScreenProps) {
  const [moves, setMoves] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [solvedMoves, setSolvedMoves] = useState(0);
  const [solved, setSolved] = useState(false);
  const [hintBusy, setHintBusy] = useState(false);
  const [hintNote, setHintNote] = useState<string | null>(null);

  const showOnboarding = levelId === 1 && !state.onboardingCompleted;
  const tier = tierForLevel(levelId);

  useEffect(() => {
    setMoves(0);
    setModalVisible(false);
    setSolvedMoves(0);
    setSolved(false);
    setHintNote(null);
  }, [levelId]);

  useEffect(() => {
    const onMove = (n: number): void => setMoves(n);
    const onSolvedEvent = (id: number, m: number): void => {
      setSolvedMoves(m);
      setSolved(true);
      const level = getLevel(id);
      if (level) onSolved(id, m, level.optimalMoves);
      trackEvent({ kind: 'level_solved', levelId: id, moves: m });
    };
    const onModalReady = (): void => setModalVisible(true);
    EventBus.on('level:move', onMove);
    EventBus.on('level:solved', onSolvedEvent);
    EventBus.on('level:modal-ready', onModalReady);
    return () => {
      EventBus.off('level:move', onMove);
      EventBus.off('level:solved', onSolvedEvent);
      EventBus.off('level:modal-ready', onModalReady);
    };
  }, [onSolved]);

  const handleReset = useCallback(() => {
    EventBus.emit('request:reset-level');
    setMoves(0);
    setModalVisible(false);
    setSolvedMoves(0);
    setSolved(false);
    setHintNote(null);
    trackEvent({ kind: 'level_reset', levelId });
  }, [levelId]);

  const handleHint = useCallback(async () => {
    if (hintBusy) return;
    if (state.sessionCount < MIN_SESSIONS_FOR_ADS) {
      setHintNote('Hints unlock after your first session.');
      return;
    }
    setHintBusy(true);
    setHintNote('Loading hint…');
    try {
      const outcome = await adProvider.showRewardedAd('hint');
      if (outcome === 'granted') {
        EventBus.emit('request:apply-hint');
        setHintNote(null);
      } else {
        setHintNote('No hint available right now.');
      }
    } finally {
      setHintBusy(false);
    }
  }, [hintBusy, state.sessionCount]);

  const handleNext = useCallback(() => {
    if (levelId >= LEVEL_COUNT) {
      onLevelSelect();
      return;
    }
    onCurrentLevel(levelId + 1);
  }, [levelId, onCurrentLevel, onLevelSelect]);

  const progress = state.progress[String(levelId)];
  const earnedStars = progress?.stars ?? 0;
  const flourish = tier.id === 'snarl' || tier.id === 'gordian';
  const currentStars = modalVisible
    ? computeStars(solvedMoves, getLevel(levelId)?.optimalMoves ?? 1)
    : 0;

  return (
    <main className="paper-dots relative h-screen flex flex-col pt-safe pb-safe">
      <Header
        left={
          <IconButton label="Back to menu" onClick={onBack}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </IconButton>
        }
        center={
          <div className="flex flex-col items-center leading-[1.1]">
            <span
              className="font-serif text-ink-900"
              style={{ fontWeight: 700, fontSize: 20, letterSpacing: '-0.01em' }}
            >
              Level {levelId}
            </span>
            <MonoLabel size={9}>
              {tier.label} · stop {tier.stop + 1}
            </MonoLabel>
          </div>
        }
        right={<StarRow earned={earnedStars} size={13} gap={2} />}
      />

      <div className="flex justify-between items-center px-5 py-2">
        <div className="flex items-baseline gap-1.5">
          <span
            className="font-mono font-semibold text-ink-900 tabular-nums"
            style={{ fontSize: 20 }}
          >
            {moves}
          </span>
          <MonoLabel size={9}>moves</MonoLabel>
        </div>
        {progress ? (
          <MonoLabel size={9} color="var(--ink-400)">
            best {progress.bestMoves}
          </MonoLabel>
        ) : null}
      </div>

      <section
        className="relative flex-1 min-h-0 overflow-hidden mx-3.5 mb-2.5 shadow-sh-1"
        style={{
          borderRadius: 16,
          backgroundColor: 'var(--paper-50)',
          border: '1.5px solid var(--rule-200)',
        }}
      >
        <PhaserGame levelId={levelId} />

        <div className="absolute" style={{ left: 6, bottom: 4 }}>
          <BobrCameo
            size={64}
            pose={solved ? 'cheer' : 'peek'}
            cheering={solved}
            lookAt={solved ? null : { x: 0.6, y: -0.2 }}
          />
        </div>

        {showOnboarding ? <OnboardingOverlay onDismiss={onOnboardingComplete} /> : null}
        {modalVisible ? (
          <LevelCompleteModal
            levelId={levelId}
            moves={solvedMoves}
            bestMoves={progress?.bestMoves ?? null}
            stars={currentStars}
            hasNext={levelId < LEVEL_COUNT}
            flourish={flourish}
            onNext={handleNext}
            onReplay={() => {
              setModalVisible(false);
              setMoves(0);
              setSolvedMoves(0);
              setSolved(false);
              EventBus.emit('request:reset-level');
            }}
            onLevels={onLevelSelect}
          />
        ) : null}
      </section>

      <footer className="flex gap-2.5 px-3.5 pb-4">
        <button
          type="button"
          onClick={handleReset}
          className="flex-1 flex items-center justify-center gap-2 bg-paper-50 text-ink-700 font-sans active:scale-[0.98] transition-transform"
          style={{
            height: 48,
            borderRadius: 14,
            border: '1.5px solid var(--rule-300)',
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
            <polyline points="3 3 3 8 8 8" />
          </svg>
          Reset
        </button>
        <button
          type="button"
          onClick={() => void handleHint()}
          disabled={hintBusy}
          className="flex-1 flex items-center justify-center gap-2 font-sans active:scale-[0.98] transition-transform disabled:opacity-60"
          style={{
            height: 48,
            borderRadius: 14,
            border: '1.5px solid var(--ochre-500)',
            backgroundColor: 'var(--ochre-100)',
            color: 'var(--ochre-700)',
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.7.6 1 1.5 1 2.3v1h6v-1c0-.8.3-1.7 1-2.3A7 7 0 0 0 12 2z" />
          </svg>
          {hintBusy ? 'Loading…' : 'Hint'}
        </button>
      </footer>

      {hintNote ? (
        <div className="absolute left-0 right-0 bottom-[72px] flex justify-center pointer-events-none">
          <div
            className="text-paper-50 font-sans rounded-full px-3 py-1"
            style={{ fontSize: 12, backgroundColor: 'rgba(31,42,58,0.92)' }}
          >
            {hintNote}
          </div>
        </div>
      ) : null}
    </main>
  );
}

import { useCallback, useEffect, useMemo, useState } from 'react';
import { EventBus } from '../../game/EventBus';
import {
  dailyStarsFromMoves,
  dateFromKey,
  generateDaily,
  todayKey,
} from '../../game/domain/daily';
import type { Level } from '../../game/domain/types';
import { adProvider } from '../../storage/ads';
import type { SavedGameState } from '../../storage/gameState';
import { trackEvent } from '../../telemetry/analytics';
import { BobrCameo } from '../components/BobrCameo';
import { Header, IconButton } from '../components/Header';
import { MonoLabel } from '../components/MonoLabel';
import { StarRow } from '../components/StarRow';
import { PhaserGame } from '../PhaserGame';

const MIN_SESSIONS_FOR_ADS = 2;

interface DailyPlayProps {
  readonly dayKey: string;
  readonly state: SavedGameState;
  readonly onBack: () => void;
  readonly onDailySolved: (dayKey: string, moves: number) => void;
}

export function DailyPlay({ dayKey, state, onBack, onDailySolved }: DailyPlayProps) {
  const level = useMemo<Level>(() => generateDaily(dayKey), [dayKey]);
  const isToday = dayKey === todayKey();
  const date = useMemo(() => dateFromKey(dayKey), [dayKey]);
  const dateLabel = useMemo(
    () => date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    [date],
  );
  const subLabel = useMemo(() => {
    const weekday = date.toLocaleDateString(undefined, { weekday: 'long' }).toLowerCase();
    return `${weekday} · daily`;
  }, [date]);

  const [moves, setMoves] = useState(0);
  const [solved, setSolved] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [solvedMoves, setSolvedMoves] = useState(0);
  const [hintBusy, setHintBusy] = useState(false);
  const [hintNote, setHintNote] = useState<string | null>(null);

  useEffect(() => {
    setMoves(0);
    setSolved(false);
    setModalVisible(false);
    setSolvedMoves(0);
    setHintNote(null);
  }, [dayKey]);

  useEffect(() => {
    const onMove = (n: number): void => setMoves(n);
    const onSolvedEvent = (_id: number, m: number): void => {
      setSolvedMoves(m);
      setSolved(true);
      onDailySolved(dayKey, m);
      trackEvent({ kind: 'daily_solved', dayKey, moves: m });
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
  }, [dayKey, onDailySolved]);

  const handleReset = useCallback(() => {
    EventBus.emit('request:reset-level');
    setMoves(0);
    setSolved(false);
    setModalVisible(false);
    setSolvedMoves(0);
    setHintNote(null);
    trackEvent({ kind: 'daily_reset', dayKey });
  }, [dayKey]);

  const handleHint = useCallback(async () => {
    if (hintBusy) return;
    if (state.sessionCount < MIN_SESSIONS_FOR_ADS) {
      setHintNote('Hints unlock after your first session.');
      return;
    }
    setHintBusy(true);
    setHintNote('Loading hint…');
    try {
      const outcome = await adProvider.showRewardedAd('daily-peek');
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

  const prev = state.daily[dayKey];
  const stars = modalVisible ? dailyStarsFromMoves(solvedMoves) : 0;

  return (
    <main className="paper-dots relative h-screen flex flex-col pt-safe pb-safe">
      <Header
        left={
          <IconButton label="Back to calendar" onClick={onBack}>
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
              {dateLabel}
            </span>
            <MonoLabel size={9}>{subLabel}</MonoLabel>
          </div>
        }
        right={<StarRow earned={prev?.stars ?? 0} size={13} gap={2} />}
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
        {prev ? (
          <MonoLabel size={9} color="var(--ink-400)">
            best {prev.bestMoves}
          </MonoLabel>
        ) : (
          <MonoLabel size={9} color="var(--ochre-600)">
            one move does it
          </MonoLabel>
        )}
      </div>

      <section
        className="relative flex-1 min-h-0 overflow-hidden mx-3.5 mb-2.5 shadow-sh-1"
        style={{
          borderRadius: 16,
          backgroundColor: 'var(--paper-50)',
          border: '1.5px solid var(--rule-200)',
        }}
      >
        <PhaserGame levelObject={level} />

        <div className="absolute" style={{ left: 6, bottom: 4 }}>
          <BobrCameo
            size={64}
            pose={solved ? 'cheer' : 'peek'}
            cheering={solved}
            lookAt={solved ? null : { x: 0.6, y: -0.2 }}
          />
        </div>

        {modalVisible ? (
          <DailySolveModal
            stars={stars}
            moves={solvedMoves}
            best={prev?.bestMoves ?? null}
            isToday={isToday}
            onReplay={handleReset}
            onDone={onBack}
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
          {hintBusy ? 'Loading…' : 'Peek'}
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

interface DailySolveModalProps {
  readonly stars: number;
  readonly moves: number;
  readonly best: number | null;
  readonly isToday: boolean;
  readonly onReplay: () => void;
  readonly onDone: () => void;
}

function DailySolveModal({ stars, moves, best, isToday, onReplay, onDone }: DailySolveModalProps) {
  const kicker = isToday ? 'daily · done' : 'caught up · sticker yours';
  const heading =
    stars === 3
      ? 'Perfect — one move.'
      : stars === 2
        ? 'Solid.'
        : 'You got there.';
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="absolute left-0 right-0 bottom-0 bg-paper-50"
      style={{
        borderTopLeftRadius: 22,
        borderTopRightRadius: 22,
        borderTop: '1.5px solid var(--rule-200)',
        boxShadow: 'var(--sh-3)',
        padding: '20px 22px 22px',
        animation: 'homeBeaverHop 340ms var(--ease-pop) both',
      }}
    >
      <div className="text-center">
        <MonoLabel size={10} color={isToday ? 'var(--sage-600)' : 'var(--ochre-600)'}>
          {kicker}
        </MonoLabel>
        <h2
          className="font-serif text-ink-900"
          style={{
            fontWeight: 700,
            fontSize: 26,
            margin: '4px 0 10px',
            fontVariationSettings: '"SOFT" 100, "WONK" 1',
            letterSpacing: '-0.02em',
          }}
        >
          {heading}
        </h2>
        <div className="inline-flex justify-center gap-1.5 mb-3">
          <StarRow earned={stars} size={28} gap={5} animate />
        </div>
        <div
          className="flex justify-center gap-7 border-t border-b border-rule-200"
          style={{ padding: '10px 0', margin: '4px 0 14px' }}
        >
          <div>
            <div
              className="font-mono font-semibold text-ink-900 tabular-nums"
              style={{ fontSize: 20 }}
            >
              {moves}
            </div>
            <MonoLabel size={9}>moves</MonoLabel>
          </div>
          <div className="w-px bg-rule-200" aria-hidden="true" />
          <div>
            <div
              className="font-mono font-semibold text-ink-400 tabular-nums"
              style={{ fontSize: 20 }}
            >
              {best ?? moves}
            </div>
            <MonoLabel size={9}>best</MonoLabel>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onReplay}
            className="flex-1 bg-paper-100 text-ink-700 font-sans active:scale-[0.98] transition-transform"
            style={{
              height: 48,
              borderRadius: 14,
              border: '1.5px solid var(--rule-300)',
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            Replay
          </button>
          <button
            type="button"
            onClick={onDone}
            className="font-serif bg-fill-900 text-paper-100 active:scale-[0.98] transition-transform"
            style={{
              flex: 2,
              height: 48,
              borderRadius: 24,
              border: 'none',
              fontSize: 17,
              fontWeight: 700,
              boxShadow: 'var(--sh-ink)',
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

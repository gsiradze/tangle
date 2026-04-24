import { useMemo, useState, type CSSProperties } from 'react';
import { dateFromKey, keyFromDate, todayKey } from '../../game/domain/daily';
import type { DailyStreak, SavedGameState, StoredDailyProgress } from '../../storage/gameState';
import { BobrCameo } from '../components/BobrCameo';
import { IconButton } from '../components/Header';
import { MonoLabel } from '../components/MonoLabel';
import { StarRow } from '../components/StarRow';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

interface DailyCalendarProps {
  readonly state: SavedGameState;
  readonly onBack: () => void;
  readonly onPlayDay: (dayKey: string) => void;
}

type CellState = 'blank' | 'today' | 'completed' | 'missed' | 'future';

interface Cell {
  readonly dayKey: string | null;
  readonly day: number;
  readonly state: CellState;
  readonly progress: StoredDailyProgress | null;
}

interface MonthRef {
  readonly year: number;
  readonly monthIdx: number;
}

function buildCells(ref: MonthRef, todayK: string, daily: SavedGameState['daily']): Cell[] {
  const first = new Date(ref.year, ref.monthIdx, 1);
  const firstDow = first.getDay();
  const total = new Date(ref.year, ref.monthIdx + 1, 0).getDate();
  const cells: Cell[] = [];
  for (let i = 0; i < firstDow; i++) {
    cells.push({ dayKey: null, day: 0, state: 'blank', progress: null });
  }
  for (let d = 1; d <= total; d++) {
    const k = keyFromDate(new Date(ref.year, ref.monthIdx, d));
    const progress = daily[k] ?? null;
    let state: CellState;
    if (k === todayK) state = 'today';
    else if (progress) state = 'completed';
    else if (k < todayK) state = 'missed';
    else state = 'future';
    cells.push({ dayKey: k, day: d, state, progress });
  }
  while (cells.length % 7 !== 0) {
    cells.push({ dayKey: null, day: 0, state: 'blank', progress: null });
  }
  return cells;
}

export function DailyCalendar({ state, onBack, onPlayDay }: DailyCalendarProps) {
  const today = useMemo(() => {
    const k = todayKey();
    const d = dateFromKey(k);
    return { key: k, year: d.getFullYear(), monthIdx: d.getMonth(), day: d.getDate() };
  }, []);

  const [viewing, setViewing] = useState<MonthRef>({
    year: today.year,
    monthIdx: today.monthIdx,
  });
  const [missedModal, setMissedModal] = useState<string | null>(null);
  const [showDone, setShowDone] = useState(false);
  const [futureToast, setFutureToast] = useState<string | null>(null);

  const cells = useMemo(
    () => buildCells(viewing, today.key, state.daily),
    [viewing, today.key, state.daily],
  );

  const monthStats = useMemo(() => {
    let stars = 0;
    let completed = 0;
    let possible = 0;
    const inMonth = cells.filter((c) => c.state !== 'blank' && c.state !== 'future');
    for (const c of inMonth) {
      possible += 3;
      if (c.progress) {
        stars += c.progress.stars;
        completed += 1;
      }
    }
    const totalDays = inMonth.length;
    return { stars, possible, completed, totalDays };
  }, [cells]);

  const todaysProgress = state.daily[today.key] ?? null;

  const shiftMonth = (delta: number): void => {
    setViewing((prev) => {
      const d = new Date(prev.year, prev.monthIdx + delta, 1);
      return { year: d.getFullYear(), monthIdx: d.getMonth() };
    });
  };

  const canGoForward =
    viewing.year < today.year ||
    (viewing.year === today.year && viewing.monthIdx < today.monthIdx);

  const handleTileTap = (cell: Cell): void => {
    if (cell.state === 'future') {
      const label = dateFromKey(cell.dayKey!).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });
      setFutureToast(`Unlocks on ${label}`);
      window.setTimeout(() => setFutureToast(null), 2200);
      return;
    }
    if (cell.state === 'missed') {
      setMissedModal(cell.dayKey!);
      return;
    }
    if (cell.state === 'today' && todaysProgress) {
      setShowDone(true);
      return;
    }
    if (cell.state === 'today' || cell.state === 'completed') {
      onPlayDay(cell.dayKey!);
    }
  };

  return (
    <main className="paper-dots h-screen flex flex-col relative overflow-hidden pt-safe pb-safe">
      <div className="flex items-center justify-between px-3.5 pt-3 pb-2">
        <IconButton label="Back" onClick={onBack} size={38}>
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
        <div className="text-center leading-[1.1]">
          <div
            className="font-serif text-ink-900"
            style={{
              fontWeight: 700,
              fontSize: 20,
              fontVariationSettings: '"SOFT" 100, "WONK" 1',
              letterSpacing: '-0.01em',
            }}
          >
            Daily puzzle
          </div>
          <MonoLabel size={9}>one a day · no time pressure</MonoLabel>
        </div>
        <div style={{ width: 38, height: 38 }} />
      </div>

      <div className="px-5 pt-1">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            aria-label="Previous month"
            className="bg-transparent border-0 p-1 cursor-pointer text-ink-400"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <h2
            className="font-serif text-ink-900 m-0"
            style={{
              fontWeight: 700,
              fontSize: 22,
              fontVariationSettings: '"SOFT" 100, "WONK" 1',
              letterSpacing: '-0.01em',
              lineHeight: 1,
            }}
          >
            {MONTHS[viewing.monthIdx]} {viewing.year}
          </h2>
          <button
            type="button"
            onClick={() => shiftMonth(1)}
            disabled={!canGoForward}
            aria-label="Next month"
            className="bg-transparent border-0 p-1 cursor-pointer disabled:opacity-40"
            style={{ color: canGoForward ? 'var(--ink-400)' : 'var(--ink-300)' }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
        <StreakStrip streak={state.streak} />
      </div>

      <div className="px-5 pt-1.5 pb-1 grid grid-cols-7 gap-1.5">
        {WEEKDAYS.map((w, i) => (
          <div key={i} className="text-center">
            <MonoLabel size={9} color={i === 0 || i === 6 ? 'var(--ink-400)' : 'var(--ink-500)'}>
              {w}
            </MonoLabel>
          </div>
        ))}
      </div>

      <div className="px-5 grid grid-cols-7 gap-1.5">
        {cells.map((c, i) => (
          <DayTile key={i} cell={c} onTap={() => handleTileTap(c)} />
        ))}
      </div>

      <div className="px-5 pt-3.5 flex justify-between items-center">
        <div className="flex items-center gap-1.5">
          <StarRow earned={3} size={11} gap={1} />
          <span
            className="font-mono font-semibold tabular-nums"
            style={{ fontSize: 12, color: 'var(--ink-700)' }}
          >
            {monthStats.stars}
            <span style={{ color: 'var(--ink-400)' }}> / {monthStats.possible}</span>
          </span>
        </div>
        <MonoLabel size={9} color="var(--ink-400)">
          {monthStats.completed} of {monthStats.totalDays} days
        </MonoLabel>
      </div>

      <div
        className="flex-1 relative px-4 pt-2 pb-4 flex items-end"
        style={{ minHeight: 120 }}
      >
        <div className="absolute" style={{ right: 18, bottom: 68 }}>
          <BobrCameo pose="peek" size={72} cheering={false} lookAt={{ x: -0.4, y: 0.3 }} />
        </div>
        <button
          type="button"
          onClick={() =>
            todaysProgress ? setShowDone(true) : onPlayDay(today.key)
          }
          className="w-full flex items-center justify-center gap-2.5 font-serif bg-fill-900 text-paper-100 active:scale-[0.98] transition-transform"
          style={{
            height: 58,
            borderRadius: 26,
            fontWeight: 700,
            fontSize: 20,
            border: 'none',
            boxShadow: 'var(--sh-2), var(--sh-ink)',
            animation: todaysProgress ? undefined : 'homePlayPulse 2.6s ease-in-out infinite',
          }}
        >
          {todaysProgress ? 'Today · done' : "Today's puzzle"}
          <span
            className="font-mono uppercase font-medium opacity-60"
            style={{ fontSize: 10, letterSpacing: '0.14em' }}
          >
            {MONTHS[today.monthIdx]!.slice(0, 3).toLowerCase()} {today.day}
          </span>
        </button>
      </div>

      {showDone ? (
        <DoneTodayModal
          onClose={() => setShowDone(false)}
          onReplay={() => {
            setShowDone(false);
            onPlayDay(today.key);
          }}
        />
      ) : null}

      {missedModal ? (
        <MissedDayModal
          dayKey={missedModal}
          onClose={() => setMissedModal(null)}
          onPlay={() => {
            const k = missedModal;
            setMissedModal(null);
            onPlayDay(k);
          }}
        />
      ) : null}

      {futureToast ? (
        <div
          role="status"
          aria-live="polite"
          className="absolute left-4 right-4 bottom-24 flex items-center justify-center pointer-events-none"
        >
          <div
            className="text-paper-100 font-sans rounded-full px-3 py-1"
            style={{
              fontSize: 12,
              background: 'var(--fill-900)',
              boxShadow: 'var(--sh-2)',
            }}
          >
            {futureToast}
          </div>
        </div>
      ) : null}
    </main>
  );
}

interface StreakStripProps {
  readonly streak: DailyStreak;
}

function StreakStrip({ streak }: StreakStripProps) {
  const visible = Math.min(14, streak.current + 1);
  return (
    <div className="flex items-center gap-1" style={{ padding: '8px 0 4px' }}>
      <svg width="14" height="16" viewBox="0 0 14 16" aria-hidden="true" style={{ marginRight: 4 }}>
        <path
          d="M7 1 C 9 4, 12 5, 12 9 C 12 13, 9.5 15, 7 15 C 4.5 15, 2 13, 2 9 C 2 7, 3 6, 4 5 C 4.5 6.5, 5.5 7, 6 6 C 6.5 4.5, 6 2.5, 7 1 Z"
          fill={streak.current > 0 ? 'var(--clay-500)' : 'var(--rule-300)'}
          stroke={streak.current > 0 ? 'var(--clay-700)' : 'var(--rule-300)'}
          strokeWidth="1.2"
        />
      </svg>
      {Array.from({ length: visible }).map((_, i) => {
        const isTail = i === visible - 1 && streak.current < 14;
        const unfilled = i >= streak.current;
        return (
          <div
            key={i}
            aria-hidden="true"
            style={{
              flex: '0 0 auto',
              width: 10,
              height: 10,
              borderRadius: 999,
              background: unfilled && !isTail ? 'var(--rule-300)' : isTail ? 'transparent' : 'var(--ochre-500)',
              border: isTail ? '1.5px dashed var(--ochre-500)' : 'none',
              animation: isTail ? 'homePlayPulse 2.6s ease-in-out infinite' : 'none',
              opacity: i < Math.max(0, visible - 10) ? 0.4 : 1,
            }}
          />
        );
      })}
      <div className="ml-auto flex items-baseline gap-1">
        <span
          className="font-serif text-ink-900"
          style={{
            fontWeight: 700,
            fontSize: 16,
            fontVariationSettings: '"SOFT" 100, "WONK" 1',
          }}
        >
          {streak.current}
        </span>
        <MonoLabel size={9}>day run</MonoLabel>
      </div>
    </div>
  );
}

interface DayTileProps {
  readonly cell: Cell;
  readonly onTap: () => void;
}

function DayTile({ cell, onTap }: DayTileProps) {
  if (cell.state === 'blank') {
    return <div aria-hidden="true" style={{ aspectRatio: '1' }} />;
  }
  const base: CSSProperties = {
    aspectRatio: '1',
    borderRadius: 10,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    fontFamily: 'Fraunces, serif',
    cursor: 'pointer',
    transition: 'transform var(--dur-nudge), box-shadow var(--dur-flip)',
  };

  if (cell.state === 'today') {
    return (
      <button
        type="button"
        onClick={onTap}
        aria-label={`Today, ${cell.day}`}
        style={{
          ...base,
          background: 'var(--paper-50)',
          border: '2px solid var(--ochre-500)',
          boxShadow: '0 0 0 4px rgba(195,154,62,0.18), var(--sh-1)',
          color: 'var(--ink-900)',
          animation: 'homePlayPulse 2.6s ease-in-out infinite',
        }}
      >
        <span
          style={{
            fontWeight: 700,
            fontSize: 17,
            lineHeight: 1,
            fontVariationSettings: '"SOFT" 100, "WONK" 1',
          }}
        >
          {cell.day}
        </span>
        <span
          className="font-mono uppercase"
          style={{
            fontSize: 7,
            letterSpacing: '0.14em',
            color: 'var(--ochre-700)',
            fontWeight: 600,
            marginTop: 1,
          }}
        >
          today
        </span>
      </button>
    );
  }

  if (cell.state === 'completed') {
    return (
      <button
        type="button"
        onClick={onTap}
        aria-label={`Day ${cell.day}, ${cell.progress?.stars ?? 0} stars`}
        className="active:scale-[0.96]"
        style={{
          ...base,
          background: 'var(--paper-50)',
          border: '1.5px solid var(--rule-300)',
          boxShadow: 'var(--sh-1)',
          color: 'var(--ink-900)',
        }}
      >
        <span
          style={{
            fontWeight: 700,
            fontSize: 15,
            lineHeight: 1,
            fontVariationSettings: '"SOFT" 100, "WONK" 1',
          }}
        >
          {cell.day}
        </span>
        <div style={{ marginTop: 2 }}>
          <StarRow earned={cell.progress?.stars ?? 0} size={7} gap={1} />
        </div>
      </button>
    );
  }

  if (cell.state === 'missed') {
    return (
      <button
        type="button"
        onClick={onTap}
        aria-label={`Missed day ${cell.day}`}
        className="active:scale-[0.96]"
        style={{
          ...base,
          background: 'var(--paper-200)',
          border: '1.5px dashed var(--rule-300)',
          color: 'var(--ink-400)',
        }}
      >
        <span
          style={{
            fontWeight: 600,
            fontSize: 14,
            lineHeight: 1,
            fontVariationSettings: '"SOFT" 100, "WONK" 1',
          }}
        >
          {cell.day}
        </span>
        <svg width="10" height="7" viewBox="0 0 16 11" style={{ marginTop: 2 }} aria-hidden="true">
          <rect
            x="1"
            y="1"
            width="14"
            height="8"
            rx="1.5"
            fill="none"
            stroke="var(--clay-500)"
            strokeWidth="1.2"
          />
          <path d="M6 4 L10 5.5 L6 7 Z" fill="var(--clay-500)" />
        </svg>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onTap}
      aria-label={`Future day ${cell.day}, locked`}
      style={{
        ...base,
        background: 'var(--paper-200)',
        border: '1px solid var(--rule-200)',
        color: 'var(--ink-300)',
      }}
    >
      <span
        style={{
          fontWeight: 500,
          fontSize: 14,
          lineHeight: 1,
          fontVariationSettings: '"SOFT" 100, "WONK" 1',
        }}
      >
        {cell.day}
      </span>
    </button>
  );
}

interface DoneTodayModalProps {
  readonly onClose: () => void;
  readonly onReplay: () => void;
}

function DoneTodayModal({ onClose, onReplay }: DoneTodayModalProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Today's puzzle done"
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
        <MonoLabel size={10} color="var(--sage-600)">
          done today
        </MonoLabel>
        <h2
          className="font-serif text-ink-900"
          style={{
            fontWeight: 700,
            fontSize: 26,
            margin: '4px 0 2px',
            fontVariationSettings: '"SOFT" 100, "WONK" 1',
            letterSpacing: '-0.02em',
          }}
        >
          Come back tomorrow.
        </h2>
        <div className="font-sans" style={{ fontSize: 13, color: 'var(--ink-500)' }}>
          Streak stays warm.
        </div>
        <div className="flex gap-2 mt-4">
          <button
            type="button"
            onClick={onReplay}
            className="flex-1 bg-paper-100 text-ink-700 font-sans active:scale-[0.98] transition-transform"
            style={{
              height: 46,
              borderRadius: 14,
              border: '1.5px solid var(--rule-300)',
              fontWeight: 500,
              fontSize: 13,
            }}
          >
            Replay today
          </button>
          <button
            type="button"
            onClick={onClose}
            className="font-serif bg-fill-900 text-paper-100 active:scale-[0.98] transition-transform"
            style={{
              flex: 2,
              height: 46,
              borderRadius: 24,
              border: 'none',
              fontWeight: 700,
              fontSize: 15,
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

interface MissedDayModalProps {
  readonly dayKey: string;
  readonly onClose: () => void;
  readonly onPlay: () => void;
}

function MissedDayModal({ dayKey, onClose, onPlay }: MissedDayModalProps) {
  const date = dateFromKey(dayKey);
  const label = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
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
        <MonoLabel size={10} color="var(--clay-600)">
          missed · {label}
        </MonoLabel>
        <h2
          className="font-serif text-ink-900"
          style={{
            fontWeight: 700,
            fontSize: 24,
            margin: '4px 0 4px',
            fontVariationSettings: '"SOFT" 100, "WONK" 1',
            letterSpacing: '-0.02em',
          }}
        >
          That one got away.
        </h2>
        <div
          className="font-sans"
          style={{ fontSize: 13, color: 'var(--ink-500)', lineHeight: 1.5, padding: '0 8px' }}
        >
          Missed days stay open. Solve it anytime — it won&rsquo;t count toward your current streak, but the sticker is still yours.
        </div>
        <div className="flex gap-2 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-paper-100 text-ink-700 font-sans active:scale-[0.98] transition-transform"
            style={{
              height: 46,
              borderRadius: 14,
              border: '1.5px solid var(--rule-300)',
              fontWeight: 500,
              fontSize: 13,
            }}
          >
            Not now
          </button>
          <button
            type="button"
            onClick={onPlay}
            className="font-serif bg-fill-900 text-paper-100 active:scale-[0.98] transition-transform"
            style={{
              flex: 2,
              height: 46,
              borderRadius: 24,
              border: 'none',
              fontWeight: 700,
              fontSize: 15,
            }}
          >
            Solve {label}
          </button>
        </div>
      </div>
    </div>
  );
}

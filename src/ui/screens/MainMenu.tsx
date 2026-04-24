import type { CSSProperties } from 'react';
import { tierForLevel } from '../../game/domain/tiers';
import { BobrCameo } from '../components/BobrCameo';
import { IconButton } from '../components/Header';
import { MonoLabel } from '../components/MonoLabel';
import { StreakBadge } from '../components/StreakBadge';
import { Wordmark } from '../components/Wordmark';

interface MainMenuProps {
  readonly currentLevel: number;
  readonly streakDays: number;
  readonly todayUnplayed: boolean;
  readonly onPlay: () => void;
  readonly onDaily: () => void;
  readonly onLevels: () => void;
  readonly onSettings: () => void;
}

const HOP_STYLE: CSSProperties = { animation: 'homeBeaverHop 900ms var(--ease-pop) both' };
const PULSE_STYLE: CSSProperties = { animation: 'homePlayPulse 2.6s ease-in-out infinite' };

export function MainMenu({
  currentLevel,
  streakDays,
  todayUnplayed,
  onPlay,
  onDaily,
  onLevels,
  onSettings,
}: MainMenuProps) {
  const tier = tierForLevel(currentLevel);
  const positionInTier = currentLevel - tier.firstLevel + 1;
  const tierSize = tier.lastLevel - tier.firstLevel + 1;

  return (
    <main className="paper-dots h-screen flex flex-col relative overflow-hidden pt-safe pb-safe">
      <div className="flex justify-between items-center px-5 pt-3">
        <MonoLabel>v0.1 · portrait</MonoLabel>
        {streakDays > 0 ? <StreakBadge days={streakDays} /> : <span />}
      </div>

      <div className="flex justify-center px-6 pt-7 pb-2">
        <Wordmark variant="knotg" size={84} />
      </div>
      <div className="text-center -mt-1">
        <MonoLabel color="var(--ink-500)">Untangle the lines</MonoLabel>
      </div>

      <div className="flex-1 flex items-center justify-center relative mt-1">
        <div
          aria-hidden="true"
          className="absolute left-8 right-8 bg-rule-200"
          style={{ top: '58%', height: 1 }}
        />
        <div style={HOP_STYLE}>
          <BobrCameo pose="hero" size={220} cheering={false} />
        </div>

        <div
          className="absolute left-1/2 -translate-x-1/2 bottom-3 inline-flex items-center gap-2 bg-paper-50 rounded-full shadow-sh-1"
          style={{ padding: '5px 11px 5px 9px', border: '1.5px solid var(--rule-200)' }}
          aria-label={`${tier.label} tier, level ${positionInTier} of ${tierSize}`}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: 'var(--ochre-500)' }}
            aria-hidden="true"
          />
          <MonoLabel color="var(--ink-700)" size={10}>
            {tier.label} · {positionInTier} of {tierSize}
          </MonoLabel>
        </div>
      </div>

      <div className="px-5 pb-5 pt-2">
        <button
          type="button"
          onClick={onPlay}
          className="w-full flex items-center justify-center gap-2.5 font-serif text-paper-100 bg-fill-900 shadow-sh-2 active:scale-[0.98] transition-transform"
          style={{
            height: 62,
            borderRadius: 26,
            fontWeight: 700,
            fontSize: 22,
            letterSpacing: '0.01em',
            boxShadow: 'var(--sh-2), var(--sh-ink)',
            ...PULSE_STYLE,
          }}
        >
          <span>{currentLevel > 1 ? 'Continue' : 'Play'}</span>
          <span
            className="font-mono uppercase font-medium opacity-60"
            style={{ fontSize: 10, letterSpacing: '0.14em' }}
          >
            lvl {currentLevel}
          </span>
        </button>

        <div className="flex gap-2.5 mt-2.5">
          <button
            type="button"
            onClick={onDaily}
            className="relative flex-1 bg-paper-50 text-ink-900 font-sans font-semibold shadow-sh-1 active:scale-[0.98] transition-transform"
            style={{ height: 48, borderRadius: 14, border: '1.5px solid var(--rule-300)', fontSize: 15 }}
            aria-label={todayUnplayed ? "Daily — today's puzzle waiting" : 'Daily'}
          >
            Daily
            {todayUnplayed ? (
              <span
                aria-hidden="true"
                className="absolute rounded-full"
                style={{
                  top: 9,
                  right: 12,
                  width: 8,
                  height: 8,
                  background: 'var(--clay-500)',
                  boxShadow: '0 0 0 2px var(--paper-50)',
                }}
              />
            ) : null}
          </button>
          <button
            type="button"
            onClick={onLevels}
            className="flex-1 bg-paper-50 text-ink-900 font-sans font-semibold shadow-sh-1 active:scale-[0.98] transition-transform"
            style={{ height: 48, borderRadius: 14, border: '1.5px solid var(--rule-300)', fontSize: 15 }}
          >
            Levels
          </button>
          <IconButton label="Settings" onClick={onSettings} size={48}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </IconButton>
        </div>
      </div>
    </main>
  );
}

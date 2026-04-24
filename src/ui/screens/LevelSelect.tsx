import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { LEVEL_COUNT } from '../../game/domain/levels';
import { TIERS, tierForLevel, type Tier } from '../../game/domain/tiers';
import type { SavedGameState, StoredLevelProgress } from '../../storage/gameState';
import { isLevelUnlocked } from '../../storage/gameState';
import { IconButton } from '../components/Header';
import { MonoLabel } from '../components/MonoLabel';
import { StarRow } from '../components/StarRow';

interface LevelSelectProps {
  readonly state: SavedGameState;
  readonly onBack: () => void;
  readonly onPick: (levelId: number) => void;
}

interface LevelCell {
  readonly n: number;
  readonly current: boolean;
  readonly locked: boolean;
  readonly progress: StoredLevelProgress | undefined;
}

export function LevelSelect({ state, onBack, onPick }: LevelSelectProps) {
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = (): void => setScrolled(el.scrollTop > 10);
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => () => {
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
  }, []);

  const showToast = useCallback((msg: string): void => {
    setToast(msg);
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2200);
  }, []);

  const currentTier = tierForLevel(state.currentLevel);

  return (
    <main className="paper-dots h-screen flex flex-col relative overflow-hidden">
      <div className="pt-safe">
        <div className="flex items-center justify-between px-3.5 pt-3 pb-2.5">
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
          <h1
            className="font-serif text-ink-900"
            style={{
              margin: 0,
              fontWeight: 700,
              fontSize: 22,
              fontVariationSettings: '"SOFT" 100, "WONK" 1',
              letterSpacing: '-0.02em',
            }}
          >
            Levels
          </h1>
          <div style={{ width: 38, height: 38 }} />
        </div>
      </div>

      <TierRibbon currentStop={currentTier.stop} compact={scrolled} />

      <div ref={scrollRef} className="flex-1 overflow-y-auto" style={{ padding: '0 16px 80px' }}>
        {TIERS.map((tier) => {
          const levels = buildTierLevels(tier, state);
          const tierLocked = tier.stop > currentTier.stop;
          return (
            <section key={tier.id}>
              <TierHeader tier={tier} levels={levels} locked={tierLocked} />
              {tierLocked ? (
                <LockedTierTease />
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {levels.map((l) => (
                    <LevelTile
                      key={l.n}
                      level={l}
                      onTap={() => onPick(l.n)}
                      onLockedTap={() =>
                        showToast(
                          `Finish Level ${state.currentLevel} to open ${
                            tierForLevel(l.n).label
                          }.`,
                        )
                      }
                    />
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>

      {toast ? (
        <div
          role="status"
          aria-live="polite"
          className="absolute left-4 right-4 bottom-6 flex items-center gap-2.5 text-paper-100 font-sans"
          style={{
            background: 'var(--fill-900)',
            padding: '12px 14px',
            borderRadius: 12,
            boxShadow: 'var(--sh-3)',
            fontSize: 13,
            fontWeight: 500,
            animation: 'homeBeaverHop 340ms var(--ease-pop) both',
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--ochre-300)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="4" y="11" width="16" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
          <span>{toast}</span>
        </div>
      ) : null}
    </main>
  );
}

function buildTierLevels(tier: Tier, state: SavedGameState): LevelCell[] {
  const cells: LevelCell[] = [];
  for (let n = tier.firstLevel; n <= tier.lastLevel; n++) {
    cells.push({
      n,
      current: n === state.currentLevel,
      locked: !isLevelUnlocked(state, n, LEVEL_COUNT),
      progress: state.progress[String(n)],
    });
  }
  return cells;
}

interface TierHeaderProps {
  readonly tier: Tier;
  readonly levels: readonly LevelCell[];
  readonly locked: boolean;
}

function TierHeader({ tier, levels, locked }: TierHeaderProps) {
  const completed = levels.filter((l) => l.progress !== undefined).length;
  const tierSize = tier.lastLevel - tier.firstLevel + 1;
  return (
    <div style={{ padding: '18px 0 10px' }}>
      <div className="flex items-baseline justify-between gap-2.5">
        <div>
          <h3
            className="font-serif m-0"
            style={{
              fontWeight: 700,
              fontSize: 24,
              color: locked ? 'var(--ink-400)' : 'var(--ink-900)',
              lineHeight: 1,
              fontVariationSettings: '"SOFT" 100, "WONK" 1',
              letterSpacing: '-0.02em',
            }}
          >
            {tier.label}
          </h3>
          <div style={{ marginTop: 4 }}>
            <MonoLabel size={10} color={locked ? 'var(--ink-300)' : 'var(--ink-500)'}>
              levels {tier.firstLevel}–{tier.lastLevel}
            </MonoLabel>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          {locked ? (
            <div
              className="inline-flex items-center gap-1.5"
              style={{
                padding: '4px 8px',
                borderRadius: 999,
                border: '1px solid var(--rule-200)',
                background: 'var(--paper-200)',
              }}
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--ink-400)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="4" y="11" width="16" height="10" rx="2" />
                <path d="M8 11V7a4 4 0 0 1 8 0v4" />
              </svg>
              <MonoLabel size={9} color="var(--ink-400)">
                unlocks at {tier.firstLevel}
              </MonoLabel>
            </div>
          ) : (
            <MonoLabel size={10} color="var(--ochre-600)">
              {completed}/{tierSize}
            </MonoLabel>
          )}
        </div>
      </div>

      {!locked ? (
        <div
          className="font-sans italic"
          style={{
            marginTop: 6,
            fontSize: 13,
            color: 'var(--ink-500)',
            lineHeight: 1.45,
          }}
        >
          {tier.flavor}
        </div>
      ) : null}

      {!locked ? (
        <div className="flex" style={{ gap: 3, marginTop: 10 }}>
          {levels.map((l) => (
            <div
              key={l.n}
              aria-hidden="true"
              style={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                background: l.current
                  ? 'var(--ochre-500)'
                  : l.progress
                    ? l.progress.stars === 3
                      ? 'var(--ochre-500)'
                      : 'var(--ochre-300)'
                    : 'var(--rule-200)',
                transition: 'background var(--dur-flip)',
              }}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function LockedTierTease() {
  return (
    <div className="grid grid-cols-4 gap-2" style={{ marginTop: 4, opacity: 0.4 }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          aria-hidden="true"
          style={{
            aspectRatio: '1',
            borderRadius: 12,
            background: 'var(--paper-200)',
            border: '1.5px dashed var(--rule-200)',
          }}
        />
      ))}
    </div>
  );
}

interface LevelTileProps {
  readonly level: LevelCell;
  readonly onTap: () => void;
  readonly onLockedTap: () => void;
}

function LevelTile({ level, onTap, onLockedTap }: LevelTileProps) {
  const base: CSSProperties = {
    position: 'relative',
    aspectRatio: '1',
    borderRadius: 12,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Fraunces, serif',
    cursor: 'pointer',
    transition: 'transform var(--dur-nudge), box-shadow var(--dur-flip)',
    userSelect: 'none',
  };

  if (level.locked) {
    return (
      <button
        type="button"
        onClick={onLockedTap}
        aria-label={`Level ${level.n} locked`}
        className="active:scale-[0.97]"
        style={{
          ...base,
          background: 'var(--paper-200)',
          border: '1.5px solid var(--rule-200)',
          color: 'var(--ink-300)',
          boxShadow: 'none',
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--ink-400)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="4" y="11" width="16" height="10" rx="2" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </svg>
      </button>
    );
  }

  if (level.current) {
    return (
      <button
        type="button"
        onClick={onTap}
        aria-label={`Play current level ${level.n}`}
        style={{
          ...base,
          background: 'var(--paper-50)',
          border: '2px solid var(--ochre-500)',
          boxShadow: 'var(--sh-2), 0 0 0 4px rgba(195,154,62,0.18)',
          color: 'var(--ink-900)',
          animation: 'homePlayPulse 2.6s ease-in-out infinite',
        }}
      >
        <span
          style={{
            fontWeight: 700,
            fontSize: 18,
            lineHeight: 1,
            fontVariationSettings: '"SOFT" 100, "WONK" 1',
          }}
        >
          {level.n}
        </span>
        <div style={{ marginTop: 4 }}>
          <MonoLabel size={8} color="var(--ochre-700)">
            here
          </MonoLabel>
        </div>
      </button>
    );
  }

  if (!level.progress) {
    return (
      <button
        type="button"
        onClick={onTap}
        aria-label={`Play level ${level.n}, unplayed`}
        className="active:scale-[0.97]"
        style={{
          ...base,
          background: 'var(--paper-50)',
          border: '1.5px dashed var(--ochre-500)',
          color: 'var(--ink-900)',
          boxShadow: 'var(--sh-1)',
        }}
      >
        <span
          style={{
            fontWeight: 700,
            fontSize: 18,
            lineHeight: 1,
            fontVariationSettings: '"SOFT" 100, "WONK" 1',
          }}
        >
          {level.n}
        </span>
        <div style={{ marginTop: 3 }}>
          <MonoLabel size={8} color="var(--ochre-600)">
            new
          </MonoLabel>
        </div>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onTap}
      aria-label={`Play level ${level.n}, ${level.progress.stars} stars`}
      className="active:scale-[0.97]"
      style={{
        ...base,
        background: 'var(--paper-50)',
        border: '1.5px solid var(--rule-300)',
        color: 'var(--ink-900)',
        boxShadow: 'var(--sh-1)',
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
        {level.n}
      </span>
      <div style={{ marginTop: 4 }}>
        <StarRow earned={level.progress.stars} size={9} gap={1.5} />
      </div>
    </button>
  );
}

interface TierRibbonProps {
  readonly currentStop: number;
  readonly compact: boolean;
}

function TierRibbon({ currentStop, compact }: TierRibbonProps) {
  const completedPath =
    currentStop === 1
      ? 'M 18 18 C 54 10, 60 22, 89 18'
      : currentStop === 2
        ? 'M 18 18 C 90 4, 80 32, 160 18'
        : currentStop === 3
          ? 'M 18 18 C 90 4, 80 32, 160 18 S 200 14, 231 18'
          : currentStop === 4
            ? 'M 18 18 C 90 4, 80 32, 160 18 S 230 4, 302 18'
            : null;

  return (
    <div
      className="paper-dots"
      style={{
        background: 'var(--paper-100)',
        borderBottom: '1px solid var(--rule-200)',
        padding: compact ? '8px 16px' : '12px 16px 14px',
        transition: 'padding var(--dur-flip)',
      }}
    >
      <svg
        viewBox="0 0 320 36"
        width="100%"
        height={compact ? 28 : 36}
        preserveAspectRatio="xMidYMid meet"
        style={{ display: 'block', overflow: 'visible' }}
        aria-hidden="true"
      >
        <path
          d="M 18 18 C 90 4, 80 32, 160 18 S 230 4, 302 18"
          stroke="var(--rule-300)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="4 5"
        />
        {completedPath ? (
          <path
            d={completedPath}
            stroke="var(--ochre-500)"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
        ) : null}
        {TIERS.map((t, i) => {
          const x = 18 + i * 71;
          const done = i < currentStop;
          const at = i === currentStop;
          return (
            <g key={t.id}>
              <circle
                cx={x}
                cy={18}
                r={at ? 8 : 5}
                fill={done ? 'var(--ochre-500)' : at ? 'var(--paper-50)' : 'var(--paper-200)'}
                stroke={done ? 'var(--ochre-700)' : at ? 'var(--ochre-500)' : 'var(--rule-300)'}
                strokeWidth={at ? 2.2 : 1.5}
              />
              {!compact ? (
                <text
                  x={x}
                  y={at ? 34 : 32}
                  textAnchor="middle"
                  fontFamily='"Geist Mono", monospace'
                  fontSize="8"
                  letterSpacing="1.2"
                  fill={done ? 'var(--ochre-700)' : at ? 'var(--ink-900)' : 'var(--ink-400)'}
                  style={{ textTransform: 'uppercase', fontWeight: at ? 600 : 500 }}
                >
                  {t.label.toUpperCase()}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

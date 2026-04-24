import { MonoLabel } from './MonoLabel';
import { StarRow } from './StarRow';

interface LevelCompleteModalProps {
  readonly levelId: number;
  readonly moves: number;
  readonly bestMoves: number | null;
  readonly stars: number;
  readonly hasNext: boolean;
  readonly flourish?: boolean;
  readonly onNext: () => void;
  readonly onReplay: () => void;
  readonly onLevels: () => void;
}

export function LevelCompleteModal({
  levelId,
  moves,
  bestMoves,
  stars,
  hasNext,
  flourish = false,
  onNext,
  onReplay,
  onLevels,
}: LevelCompleteModalProps) {
  const starSize = flourish ? 30 : 26;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Level ${levelId} complete`}
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
          level done
        </MonoLabel>
        <h2
          className="font-serif text-ink-900"
          style={{
            fontWeight: 700,
            fontSize: 28,
            margin: '4px 0 10px',
            fontVariationSettings: '"SOFT" 100, "WONK" 1',
            letterSpacing: '-0.02em',
          }}
        >
          Nice — level done.
        </h2>
        <div className="inline-flex gap-1.5 mb-3">
          <StarRow earned={stars} size={starSize} gap={6} animate />
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
              {bestMoves ?? moves}
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
            onClick={hasNext ? onNext : onLevels}
            className="font-serif bg-fill-900 text-paper-100 active:scale-[0.98] transition-transform"
            style={{
              flex: 2,
              height: 48,
              borderRadius: 24,
              fontSize: 17,
              fontWeight: 700,
              boxShadow: 'var(--sh-ink)',
            }}
          >
            {hasNext ? 'Next' : 'Back to levels'}
          </button>
        </div>
      </div>
    </div>
  );
}

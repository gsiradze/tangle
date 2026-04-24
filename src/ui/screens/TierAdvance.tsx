import { TIERS } from '../../game/domain/tiers';
import { Bobr } from '../components/Bobr';
import { MonoLabel } from '../components/MonoLabel';

interface TierAdvanceProps {
  readonly fromStop: number;
  readonly toStop: number;
  readonly onContinue: () => void;
  readonly onSkip: () => void;
}

const STOPS: readonly { x: number; y: number }[] = [
  { x: 60, y: 440 },
  { x: 190, y: 360 },
  { x: 110, y: 250 },
  { x: 230, y: 150 },
  { x: 130, y: 50 },
];

const PATHS_BY_TO: Record<number, string> = {
  1: 'M 60 440 C 140 430, 220 400, 190 360',
  2: 'M 60 440 C 140 430, 220 400, 190 360 S 60 300, 110 250',
  3: 'M 60 440 C 140 430, 220 400, 190 360 S 60 300, 110 250 S 260 210, 230 150',
  4: 'M 60 440 C 140 430, 220 400, 190 360 S 60 300, 110 250 S 260 210, 230 150 S 80 110, 130 50',
};

export function TierAdvance({ fromStop, toStop, onContinue, onSkip }: TierAdvanceProps) {
  const from = TIERS[fromStop] ?? TIERS[0]!;
  const to = TIERS[toStop] ?? TIERS[TIERS.length - 1]!;
  const bobrPos = STOPS[toStop] ?? STOPS[0]!;
  const fillPath = PATHS_BY_TO[toStop] ?? PATHS_BY_TO[1]!;

  return (
    <main
      className="paper-dots h-screen flex flex-col relative overflow-hidden pt-safe pb-safe"
      style={{ padding: '18px 18px 20px' }}
    >
      <div className="flex justify-between items-center">
        <MonoLabel color="var(--sage-600)">tier complete</MonoLabel>
        <button
          type="button"
          onClick={onSkip}
          aria-label="Skip tier celebration"
          style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px 8px' }}
        >
          <MonoLabel color="var(--ink-400)" size={10}>
            skip ×
          </MonoLabel>
        </button>
      </div>

      <div style={{ marginTop: 10 }}>
        <h2
          className="font-serif text-ink-900 m-0"
          style={{
            fontWeight: 700,
            fontSize: 30,
            lineHeight: 1.1,
            fontVariationSettings: '"SOFT" 100, "WONK" 1',
            letterSpacing: '-0.02em',
          }}
        >
          {from.label} done —
        </h2>
        <h2
          className="font-serif"
          style={{
            color: 'var(--ochre-700)',
            fontWeight: 700,
            fontSize: 30,
            margin: '-2px 0 0',
            lineHeight: 1.1,
            fontVariationSettings: '"SOFT" 100, "WONK" 1',
            letterSpacing: '-0.02em',
          }}
        >
          welcome to {to.label}.
        </h2>
        <div className="font-sans" style={{ marginTop: 6, fontSize: 14, color: 'var(--ink-500)' }}>
          {to.flavor}
        </div>
      </div>

      <div
        className="flex-1"
        style={{
          marginTop: 16,
          background: 'var(--paper-50)',
          border: '1.5px solid var(--rule-200)',
          borderRadius: 16,
          boxShadow: 'var(--sh-1)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <svg
          viewBox="0 0 300 500"
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        >
          <path
            d="M 60 440 C 140 430, 220 400, 190 360 S 60 300, 110 250 S 260 210, 230 150 S 80 110, 130 50"
            stroke="var(--rule-300)"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="4 6"
          />
          <path
            d={fillPath}
            stroke="var(--ochre-500)"
            strokeWidth="3.5"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="900"
            strokeDashoffset="900"
            style={{ animation: 'pathDraw 1.4s 400ms var(--ease-flip) forwards' }}
          />

          {STOPS.map((s, i) => {
            const done = i <= toStop;
            return (
              <g key={i}>
                <circle
                  cx={s.x}
                  cy={s.y}
                  r={i === toStop ? 14 : 10}
                  fill={done ? 'var(--ochre-500)' : 'var(--paper-200)'}
                  stroke={done ? 'var(--ochre-700)' : 'var(--rule-300)'}
                  strokeWidth={i === toStop ? 2.5 : 1.5}
                />
                <text
                  x={s.x + (i % 2 ? -20 : 20)}
                  y={s.y + 4}
                  textAnchor={i % 2 ? 'end' : 'start'}
                  fontFamily="Fraunces, serif"
                  fontWeight="700"
                  fontSize="13"
                  fill={done ? 'var(--ink-900)' : 'var(--ink-400)'}
                >
                  {TIERS[i]!.label}
                </text>
              </g>
            );
          })}

          <g
            transform={`translate(${bobrPos.x - 32}, ${bobrPos.y - 75})`}
            style={{ animation: 'homeBeaverHop 600ms 1.4s var(--ease-pop) both' }}
          >
            <foreignObject x="0" y="0" width="64" height="70">
              <div>
                <Bobr pose="cheer" size={64} cheering />
              </div>
            </foreignObject>
          </g>
        </svg>
      </div>

      <button
        type="button"
        onClick={onContinue}
        className="font-serif active:scale-[0.98] transition-transform"
        style={{
          marginTop: 14,
          height: 56,
          borderRadius: 26,
          background: 'var(--fill-900)',
          color: 'var(--paper-100)',
          border: 'none',
          cursor: 'pointer',
          fontWeight: 700,
          fontSize: 18,
          boxShadow: 'var(--sh-2), var(--sh-ink)',
        }}
      >
        Keep going
      </button>
    </main>
  );
}

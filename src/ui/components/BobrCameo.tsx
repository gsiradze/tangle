import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { Bobr, type BobrPose } from './Bobr';

type CssVars = CSSProperties & Record<`--${string}`, string | number>;

const EMOTES: readonly string[] = ['!', '✦', '♡', '★', '?', '!!'];
const EMOTE_COLORS: readonly string[] = [
  'var(--ochre-600)',
  'var(--clay-500)',
  'var(--sage-600)',
  'var(--ochre-700)',
];
const STREAK_WINDOW_MS = 2500;
const STREAK_THRESHOLD = 5;
const CHEER_MS = 1100;
const EMOTE_MS = 900;
const SETTLE_MS = 420;

interface EmoteSpawn {
  readonly id: number;
  readonly char: string;
  readonly tx: number;
  readonly color: string;
}

interface BobrCameoProps {
  readonly size: number;
  readonly pose: BobrPose;
  readonly cheering: boolean;
  readonly lookAt?: { x: number; y: number } | null;
}

export function BobrCameo({ size, pose, cheering, lookAt }: BobrCameoProps) {
  const [settleKey, setSettleKey] = useState(0);
  const [emotes, setEmotes] = useState<readonly EmoteSpawn[]>([]);
  const [forceCheer, setForceCheer] = useState(false);
  const streakCountRef = useRef(0);
  const lastTapRef = useRef(0);
  const tapCountRef = useRef(0);
  const cheerTimerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (cheerTimerRef.current !== null) window.clearTimeout(cheerTimerRef.current);
    },
    [],
  );

  const handleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current < STREAK_WINDOW_MS) {
      streakCountRef.current += 1;
    } else {
      streakCountRef.current = 1;
    }
    lastTapRef.current = now;
    tapCountRef.current += 1;

    setSettleKey((k) => k + 1);

    const emoteIndex = tapCountRef.current % EMOTES.length;
    const id = now + Math.random();
    const char = EMOTES[emoteIndex]!;
    const tx = (Math.random() - 0.5) * 36;
    const color = EMOTE_COLORS[tapCountRef.current % EMOTE_COLORS.length]!;
    setEmotes((list) => [...list, { id, char, tx, color }]);
    window.setTimeout(() => {
      setEmotes((list) => list.filter((e) => e.id !== id));
    }, EMOTE_MS);

    if (streakCountRef.current >= STREAK_THRESHOLD) {
      setForceCheer(true);
      if (cheerTimerRef.current !== null) window.clearTimeout(cheerTimerRef.current);
      cheerTimerRef.current = window.setTimeout(() => setForceCheer(false), CHEER_MS);
      streakCountRef.current = 0;
    }
  }, []);

  const effectiveCheering = cheering || forceCheer;
  const effectivePose: BobrPose = effectiveCheering ? 'cheer' : pose;

  return (
    <button
      type="button"
      aria-label="Poke Bobr"
      onClick={handleTap}
      className="relative appearance-none border-0 bg-transparent p-0 cursor-pointer select-none"
      style={{ lineHeight: 0, touchAction: 'manipulation' }}
    >
      <div
        key={settleKey}
        style={{
          display: 'inline-block',
          animation: `bvrSettle ${SETTLE_MS}ms var(--ease-pop)`,
        }}
      >
        <Bobr
          size={size}
          pose={effectivePose}
          cheering={effectiveCheering}
          lookAt={lookAt ?? null}
        />
      </div>
      {emotes.map((e) => (
        <span
          key={e.id}
          aria-hidden="true"
          className="absolute font-serif pointer-events-none"
          style={
            {
              top: size * 0.08,
              left: size / 2,
              fontSize: Math.max(18, size * 0.26),
              fontWeight: 800,
              color: e.color,
              animation: `bvrExcl ${EMOTE_MS}ms var(--ease-pop) forwards`,
              '--tx': `${e.tx}px`,
            } as CssVars
          }
        >
          {e.char}
        </span>
      ))}
    </button>
  );
}

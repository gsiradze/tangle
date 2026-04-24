interface StarRowProps {
  readonly earned: number;
  readonly total?: number;
  readonly size?: number;
  readonly gap?: number;
  readonly animate?: boolean;
}

export function StarRow({ earned, total = 3, size = 16, gap = 3, animate = false }: StarRowProps) {
  return (
    <div
      className="inline-flex items-center"
      style={{ gap }}
      aria-label={`${earned} of ${total} stars`}
    >
      {Array.from({ length: total }).map((_, i) => (
        <Star key={i} filled={i < earned} size={size} delay={animate && i < earned ? i * 80 : -1} />
      ))}
    </div>
  );
}

interface StarProps {
  readonly filled: boolean;
  readonly size: number;
  readonly delay: number;
}

function Star({ filled, size, delay }: StarProps) {
  const shouldAnimate = filled && delay >= 0;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      style={{
        display: 'inline-block',
        animation: shouldAnimate ? `starPop 480ms ${delay}ms var(--ease-pop) both` : 'none',
      }}
    >
      <path
        d="M12 2.5 L14.9 8.6 L21.6 9.5 L16.7 14.2 L18 20.8 L12 17.6 L6 20.8 L7.3 14.2 L2.4 9.5 L9.1 8.6 Z"
        fill={filled ? 'var(--ochre-500)' : 'transparent'}
        stroke={filled ? 'var(--ochre-700)' : 'var(--rule-300)'}
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export type WordmarkVariant = 'knotg' | 'continuous' | 'flourish';

interface WordmarkProps {
  readonly variant?: WordmarkVariant;
  readonly size?: number;
  readonly color?: string;
  readonly accent?: string;
}

export function Wordmark({
  variant = 'knotg',
  size = 140,
  color = 'var(--ink-900)',
  accent = 'var(--clay-500)',
}: WordmarkProps) {
  if (variant === 'knotg') {
    return (
      <svg
        viewBox="0 0 340 120"
        height={size}
        width={size * (340 / 120)}
        role="img"
        aria-label="Tangle"
        style={{ overflow: 'visible' }}
      >
        <text
          x="0"
          y="84"
          fontFamily="Fraunces, serif"
          fontWeight="800"
          fontSize="96"
          letterSpacing="-2"
          fill={color}
          style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1' }}
        >
          Tan
        </text>
        <text
          x="164"
          y="84"
          fontFamily="Fraunces, serif"
          fontWeight="800"
          fontSize="96"
          letterSpacing="-2"
          fill={color}
          style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1' }}
        >
          le
        </text>
        <g transform="translate(135, 0)">
          <ellipse
            cx="26"
            cy="70"
            rx="22"
            ry="18"
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M 46 68 C 48 86, 56 96, 48 108 C 40 118, 22 118, 18 106 C 14 94, 28 90, 36 96"
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M 40 100 C 36 98, 32 96, 30 94"
            fill="none"
            stroke={accent}
            strokeWidth="12"
            strokeLinecap="round"
          />
        </g>
      </svg>
    );
  }

  if (variant === 'continuous') {
    return (
      <svg
        viewBox="0 0 360 120"
        height={size}
        width={size * (360 / 120)}
        role="img"
        aria-label="Tangle"
        style={{ overflow: 'visible' }}
      >
        <path
          d="M 14 80 L 14 36 L 44 80 L 44 36
             M 60 80 C 60 58, 96 58, 96 80 C 96 58, 74 58, 74 80 Q 74 92, 96 90
             M 114 36 L 114 84
             M 130 58 L 160 58 M 145 58 L 145 88
             M 178 58 L 200 88 M 178 88 L 200 58
             M 218 36 L 218 84 M 218 58 L 238 58 L 238 84
             M 256 36 L 256 84
             M 274 58 C 274 88, 304 88, 304 58 C 304 36, 284 36, 278 58 L 278 96 C 280 110, 304 110, 306 96"
          stroke={color}
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="290" cy="98" r="5" fill={accent} />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 320 130"
      height={size}
      width={size * (320 / 130)}
      role="img"
      aria-label="Tangle"
      style={{ overflow: 'visible' }}
    >
      <text
        x="0"
        y="78"
        fontFamily="Fraunces, serif"
        fontWeight="800"
        fontSize="88"
        letterSpacing="-2"
        fill={color}
        style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1' }}
      >
        Tangle
      </text>
      <g>
        <path
          d="M 8 102 Q 80 118, 160 108 T 312 102"
          stroke={color}
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 68 108 C 110 98, 150 118, 190 106"
          stroke={accent}
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="128" cy="108" r="3" fill={color} />
      </g>
    </svg>
  );
}

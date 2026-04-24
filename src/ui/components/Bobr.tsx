import type { CSSProperties } from 'react';

export type BobrPose = 'hero' | 'peek' | 'cheer' | 'coach' | 'tier';

interface BobrProps {
  readonly pose?: BobrPose;
  readonly size?: number;
  readonly animated?: boolean;
  readonly lookAt?: { x: number; y: number } | null;
  readonly cheering?: boolean;
}

type CssVars = CSSProperties & Record<`--${string}`, string | number>;

export function Bobr({
  pose = 'hero',
  size = 220,
  animated = true,
  lookAt = null,
  cheering = false,
}: BobrProps) {
  const bobStyle: CSSProperties = animated
    ? { animation: 'bvrBob 3s ease-in-out infinite' }
    : {};
  const slapStyle: CSSProperties = cheering
    ? { animation: 'bvrSlap 0.8s var(--ease-pop) infinite', transformOrigin: '50% 80%' }
    : {};

  const dx = lookAt ? Math.max(-1.2, Math.min(1.2, lookAt.x * 1.2)) : 0;
  const dy = lookAt ? Math.max(-0.8, Math.min(0.8, lookAt.y * 0.8)) : 0;

  return (
    <div style={{ display: 'inline-block', width: size, height: size, ...bobStyle }}>
      <div style={slapStyle}>
        <svg viewBox="0 0 200 200" width={size} height={size} style={{ overflow: 'visible' }}>
          <defs>
            <radialGradient id="bobrBelly" cx="50%" cy="55%" r="55%">
              <stop offset="0%" stopColor="var(--bobr-belly)" />
              <stop offset="100%" stopColor="var(--bobr-body)" />
            </radialGradient>
          </defs>

          <ellipse cx="100" cy="188" rx="52" ry="5" fill="rgba(42,39,34,0.14)" />

          <g transform="translate(148, 140) rotate(18)">
            <ellipse
              cx="0"
              cy="0"
              rx="26"
              ry="14"
              fill="var(--bobr-tail)"
              stroke="var(--bobr-outline)"
              strokeWidth="2"
            />
            <path
              d="M -14 -6 L -6 -2 M -4 -8 L 4 -4 M 6 -6 L 14 -2 M -12 4 L -4 8 M 0 2 L 8 6"
              stroke="var(--bobr-outline)"
              strokeWidth="0.8"
              opacity="0.5"
              fill="none"
            />
          </g>

          <ellipse
            cx="100"
            cy="130"
            rx="52"
            ry="46"
            fill="var(--bobr-body)"
            stroke="var(--bobr-outline)"
            strokeWidth="2.4"
          />
          <ellipse cx="100" cy="138" rx="34" ry="30" fill="url(#bobrBelly)" />

          <ellipse
            cx="80"
            cy="172"
            rx="11"
            ry="6"
            fill="var(--bobr-depth)"
            stroke="var(--bobr-outline)"
            strokeWidth="2"
          />
          <ellipse
            cx="120"
            cy="172"
            rx="11"
            ry="6"
            fill="var(--bobr-depth)"
            stroke="var(--bobr-outline)"
            strokeWidth="2"
          />

          {pose === 'hero' ? (
            <>
              <g transform="translate(140, 110)">
                <path
                  d="M 0 0 Q 8 -18 14 -34"
                  stroke="var(--bobr-outline)"
                  strokeWidth="2.4"
                  fill="none"
                  strokeLinecap="round"
                />
                <path
                  d="M 0 0 Q 8 -18 14 -34"
                  stroke="var(--bobr-body)"
                  strokeWidth="10"
                  fill="none"
                  strokeLinecap="round"
                />
                <circle
                  cx="14"
                  cy="-34"
                  r="7"
                  fill="var(--bobr-body)"
                  stroke="var(--bobr-outline)"
                  strokeWidth="2"
                />
              </g>
              <g transform="translate(60, 118)">
                <path
                  d="M 0 0 Q -6 10 -10 18"
                  stroke="var(--bobr-outline)"
                  strokeWidth="2.4"
                  fill="none"
                  strokeLinecap="round"
                />
                <path
                  d="M 0 0 Q -6 10 -10 18"
                  stroke="var(--bobr-body)"
                  strokeWidth="10"
                  fill="none"
                  strokeLinecap="round"
                />
                <circle
                  cx="-10"
                  cy="18"
                  r="6.5"
                  fill="var(--bobr-body)"
                  stroke="var(--bobr-outline)"
                  strokeWidth="2"
                />
              </g>
            </>
          ) : null}
          {pose === 'peek' ? (
            <g transform="translate(60, 118)">
              <circle
                cx="-4"
                cy="6"
                r="7"
                fill="var(--bobr-body)"
                stroke="var(--bobr-outline)"
                strokeWidth="2"
              />
            </g>
          ) : null}
          {pose === 'cheer' ? (
            <>
              <g transform="translate(142, 112)">
                <path
                  d="M 0 0 Q 10 -20 4 -40"
                  stroke="var(--bobr-body)"
                  strokeWidth="11"
                  fill="none"
                  strokeLinecap="round"
                />
                <path
                  d="M 0 0 Q 10 -20 4 -40"
                  stroke="var(--bobr-outline)"
                  strokeWidth="2.4"
                  fill="none"
                  strokeLinecap="round"
                />
                <circle
                  cx="4"
                  cy="-40"
                  r="7.5"
                  fill="var(--bobr-body)"
                  stroke="var(--bobr-outline)"
                  strokeWidth="2"
                />
              </g>
              <g transform="translate(58, 112)">
                <path
                  d="M 0 0 Q -10 -20 -4 -40"
                  stroke="var(--bobr-body)"
                  strokeWidth="11"
                  fill="none"
                  strokeLinecap="round"
                />
                <path
                  d="M 0 0 Q -10 -20 -4 -40"
                  stroke="var(--bobr-outline)"
                  strokeWidth="2.4"
                  fill="none"
                  strokeLinecap="round"
                />
                <circle
                  cx="-4"
                  cy="-40"
                  r="7.5"
                  fill="var(--bobr-body)"
                  stroke="var(--bobr-outline)"
                  strokeWidth="2"
                />
              </g>
            </>
          ) : null}

          {pose === 'hero' ? (
            <g>
              <path
                d="M 72 96 Q 100 104 128 96 L 132 104 Q 100 114 68 104 Z"
                fill="var(--clay-500)"
                stroke="var(--bobr-outline)"
                strokeWidth="2"
              />
              <circle
                cx="70"
                cy="102"
                r="5"
                fill="var(--clay-600)"
                stroke="var(--bobr-outline)"
                strokeWidth="1.8"
              />
              <g
                style={{
                  animation: animated ? 'scarfWiggle 3.5s ease-in-out infinite' : 'none',
                  transformOrigin: '70px 102px',
                }}
              >
                <path
                  d="M 68 106 C 58 118, 46 122, 38 134 S 28 158, 44 162 C 58 165, 58 152, 48 152"
                  stroke="var(--clay-500)"
                  strokeWidth="2.2"
                  fill="none"
                  strokeLinecap="round"
                />
                <path
                  d="M 48 152 l -3 2 M 48 152 l 1 3 M 48 152 l -3 -1"
                  stroke="var(--clay-500)"
                  strokeWidth="1.4"
                  fill="none"
                  strokeLinecap="round"
                />
              </g>
              <path
                d="M 50 136 Q 100 150 154 78"
                stroke="var(--ochre-600)"
                strokeWidth="1.8"
                fill="none"
                strokeLinecap="round"
                opacity="0.9"
              />
            </g>
          ) : (
            <>
              <path
                d="M 72 96 Q 100 104 128 96 L 132 104 Q 100 114 68 104 Z"
                fill="var(--clay-500)"
                stroke="var(--bobr-outline)"
                strokeWidth="2"
              />
              <circle
                cx="70"
                cy="102"
                r="5"
                fill="var(--clay-600)"
                stroke="var(--bobr-outline)"
                strokeWidth="1.8"
              />
              <g
                style={{
                  animation: animated ? 'scarfWiggle 3.5s ease-in-out infinite' : 'none',
                  transformOrigin: '70px 102px',
                }}
              >
                <path
                  d="M 68 106 C 60 114, 54 120, 52 128"
                  stroke="var(--clay-500)"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                />
              </g>
            </>
          )}

          <g transform={pose === 'peek' ? 'translate(-6, 0) rotate(-6 100 78)' : ''}>
            <ellipse
              cx="72"
              cy="54"
              rx="8"
              ry="10"
              fill="var(--bobr-depth)"
              stroke="var(--bobr-outline)"
              strokeWidth="2"
            />
            <ellipse
              cx="128"
              cy="54"
              rx="8"
              ry="10"
              fill="var(--bobr-depth)"
              stroke="var(--bobr-outline)"
              strokeWidth="2"
            />
            <ellipse cx="72" cy="55" rx="3.5" ry="5" fill="var(--bobr-outline)" opacity="0.6" />
            <ellipse cx="128" cy="55" rx="3.5" ry="5" fill="var(--bobr-outline)" opacity="0.6" />

            <path
              d="M 60 80 C 58 56, 78 40, 100 40 C 122 40, 142 56, 140 80 C 140 98, 124 110, 100 110 C 76 110, 60 98, 60 80 Z"
              fill="var(--bobr-body)"
              stroke="var(--bobr-outline)"
              strokeWidth="2.4"
            />

            <circle cx="76" cy="86" r="6.5" fill="var(--bobr-cheek)" opacity="0.55" />
            <circle cx="124" cy="86" r="6.5" fill="var(--bobr-cheek)" opacity="0.55" />

            <g
              style={{
                transformOrigin: '86px 74px',
                animation: animated ? 'bvrBlink 6s infinite' : 'none',
              }}
            >
              <circle cx="86" cy="74" r="4" fill="var(--bobr-outline)" />
              <circle cx={86 + dx + 1.1} cy={74 + dy - 1} r="1.3" fill="#fff" />
            </g>
            <g
              style={{
                transformOrigin: '114px 74px',
                animation: animated ? 'bvrBlink 6s infinite' : 'none',
              }}
            >
              <circle cx="114" cy="74" r="4" fill="var(--bobr-outline)" />
              <circle cx={114 + dx + 1.1} cy={74 + dy - 1} r="1.3" fill="#fff" />
            </g>

            <ellipse
              cx="100"
              cy="92"
              rx="14"
              ry="9"
              fill="var(--paper-100)"
              stroke="var(--bobr-outline)"
              strokeWidth="1.8"
            />
            <ellipse cx="100" cy="86" rx="3.2" ry="2.4" fill="var(--bobr-outline)" />

            <rect
              x="96.5"
              y="96"
              width="3"
              height="5"
              fill="#fafaf2"
              stroke="var(--bobr-outline)"
              strokeWidth="0.7"
            />
            <rect
              x="100.5"
              y="96"
              width="3"
              height="5"
              fill="#fafaf2"
              stroke="var(--bobr-outline)"
              strokeWidth="0.7"
            />
            <line x1="100" y1="96" x2="100" y2="101" stroke="var(--bobr-outline)" strokeWidth="0.4" />

            {pose === 'cheer' ? (
              <path d="M 93 100 Q 100 108 107 100" fill="var(--bobr-outline)" opacity="0.9" />
            ) : (
              <path
                d="M 94 101 Q 100 104 106 101"
                fill="none"
                stroke="var(--bobr-outline)"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            )}
          </g>

          {cheering ? (
            <g>
              <text
                x="40"
                y="40"
                fontFamily="Fraunces, serif"
                fontWeight="800"
                fontSize="28"
                fill="var(--ochre-600)"
                style={
                  {
                    animation: 'bvrExcl 1.1s var(--ease-pop) infinite',
                    '--tx': '-12px',
                  } as CssVars
                }
              >
                !
              </text>
              <text
                x="156"
                y="36"
                fontFamily="Fraunces, serif"
                fontWeight="800"
                fontSize="24"
                fill="var(--clay-500)"
                style={
                  {
                    animation: 'bvrExcl 1.1s 0.15s var(--ease-pop) infinite',
                    '--tx': '12px',
                  } as CssVars
                }
              >
                !
              </text>
              <text
                x="172"
                y="72"
                fontFamily="Fraunces, serif"
                fontWeight="800"
                fontSize="20"
                fill="var(--sage-600)"
                style={
                  {
                    animation: 'bvrExcl 1.1s 0.3s var(--ease-pop) infinite',
                    '--tx': '18px',
                  } as CssVars
                }
              >
                !
              </text>
            </g>
          ) : null}
        </svg>
      </div>
    </div>
  );
}

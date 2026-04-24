export interface Tier {
  readonly id: TierId;
  readonly label: string;
  readonly flavor: string;
  readonly firstLevel: number;
  readonly lastLevel: number;
  readonly stop: number;
}

export type TierId = 'thread' | 'tangle' | 'knot' | 'snarl' | 'gordian';

export const TIERS: readonly Tier[] = [
  {
    id: 'thread',
    label: 'Thread',
    flavor: 'First pulls. Warm-up loops.',
    firstLevel: 1,
    lastLevel: 20,
    stop: 0,
  },
  {
    id: 'tangle',
    label: 'Tangle',
    flavor: 'Lines start to cross.',
    firstLevel: 21,
    lastLevel: 40,
    stop: 1,
  },
  {
    id: 'knot',
    label: 'Knot',
    flavor: 'Things hold together now.',
    firstLevel: 41,
    lastLevel: 60,
    stop: 2,
  },
  {
    id: 'snarl',
    label: 'Snarl',
    flavor: 'Properly stuck. Breathe.',
    firstLevel: 61,
    lastLevel: 80,
    stop: 3,
  },
  {
    id: 'gordian',
    label: 'Gordian',
    flavor: 'Endgame. No shortcuts.',
    firstLevel: 81,
    lastLevel: 100,
    stop: 4,
  },
];

export function tierForLevel(levelId: number): Tier {
  for (const tier of TIERS) {
    if (levelId >= tier.firstLevel && levelId <= tier.lastLevel) return tier;
  }
  return TIERS[TIERS.length - 1]!;
}

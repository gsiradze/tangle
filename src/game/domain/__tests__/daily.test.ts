import { describe, expect, it } from 'vitest';
import { countCrossings, findCrossingPairs, hasSingleVertexCover } from '../crossings';
import {
  dailyStarsFromMoves,
  dateFromKey,
  generateDaily,
  keyFromDate,
  nextDayKey,
  previousDayKey,
  seedFromKey,
  todayKey,
} from '../daily';

describe('date key helpers', () => {
  it('formats and parses YYYY-MM-DD', () => {
    const date = new Date(2026, 3, 24);
    const key = keyFromDate(date);
    expect(key).toBe('2026-04-24');
    expect(keyFromDate(dateFromKey(key))).toBe(key);
  });

  it('walks days forward and back', () => {
    expect(nextDayKey('2026-04-24')).toBe('2026-04-25');
    expect(previousDayKey('2026-04-01')).toBe('2026-03-31');
    expect(nextDayKey('2025-12-31')).toBe('2026-01-01');
  });

  it('todayKey returns today in local time', () => {
    expect(todayKey()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('seedFromKey', () => {
  it('is deterministic and bucket-distinct across near-by keys', () => {
    expect(seedFromKey('2026-04-24')).toBe(seedFromKey('2026-04-24'));
    expect(seedFromKey('2026-04-24')).not.toBe(seedFromKey('2026-04-25'));
  });
});

describe('generateDaily', () => {
  const KEYS: readonly string[] = [
    '2026-01-01',
    '2026-01-15',
    '2026-02-28',
    '2026-04-24',
    '2026-06-15',
    '2026-09-30',
    '2026-12-31',
  ];

  it('is deterministic for a given date', () => {
    for (const k of KEYS) {
      expect(generateDaily(k)).toEqual(generateDaily(k));
    }
  });

  it('produces a planar solved layout', () => {
    for (const k of KEYS) {
      const lvl = generateDaily(k);
      const graph = {
        vertices: lvl.solved.map((p, id) => ({ id, x: p.x, y: p.y })),
        edges: lvl.edges,
      };
      expect(countCrossings(graph)).toBe(0);
    }
  });

  it('initial layout is single-vertex solvable', () => {
    for (const k of KEYS) {
      const lvl = generateDaily(k);
      const graph = {
        vertices: lvl.initial.map((p, id) => ({ id, x: p.x, y: p.y })),
        edges: lvl.edges,
      };
      const pairs = findCrossingPairs(graph);
      expect(pairs.length).toBeGreaterThanOrEqual(1);
      expect(hasSingleVertexCover(graph, pairs)).toBe(true);
    }
  });

  it('vertex count is in 11–14', () => {
    for (const k of KEYS) {
      const lvl = generateDaily(k);
      expect(lvl.vertexCount).toBeGreaterThanOrEqual(11);
      expect(lvl.vertexCount).toBeLessThanOrEqual(14);
    }
  });

  it('the displaced culprit is embedded among multiple vertices', () => {
    for (const k of KEYS) {
      const lvl = generateDaily(k);
      // Find the culprit: the vertex whose initial != solved position.
      let culprit = -1;
      let maxDelta = 0;
      for (let i = 0; i < lvl.vertexCount; i++) {
        const dx = lvl.initial[i]!.x - lvl.solved[i]!.x;
        const dy = lvl.initial[i]!.y - lvl.solved[i]!.y;
        const d = Math.hypot(dx, dy);
        if (d > maxDelta) {
          maxDelta = d;
          culprit = i;
        }
      }
      expect(culprit).toBeGreaterThanOrEqual(0);

      // Count neighbors within 0.28 of the culprit's INITIAL position.
      let neighbors = 0;
      for (let i = 0; i < lvl.vertexCount; i++) {
        if (i === culprit) continue;
        const dx = lvl.initial[culprit]!.x - lvl.initial[i]!.x;
        const dy = lvl.initial[culprit]!.y - lvl.initial[i]!.y;
        if (Math.hypot(dx, dy) <= 0.28) neighbors += 1;
      }
      expect(neighbors).toBeGreaterThanOrEqual(3);
    }
  });

  it('generates at least the crossing floor', () => {
    for (const k of KEYS) {
      const lvl = generateDaily(k);
      const graph = {
        vertices: lvl.initial.map((p, id) => ({ id, x: p.x, y: p.y })),
        edges: lvl.edges,
      };
      const pairs = findCrossingPairs(graph);
      expect(pairs.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('optimalMoves is always 1', () => {
    for (const k of KEYS) {
      expect(generateDaily(k).optimalMoves).toBe(1);
    }
  });
});

describe('dailyStarsFromMoves', () => {
  it('awards 3 stars for a single move', () => {
    expect(dailyStarsFromMoves(1)).toBe(3);
  });
  it('awards 2 stars for 2–3 moves', () => {
    expect(dailyStarsFromMoves(2)).toBe(2);
    expect(dailyStarsFromMoves(3)).toBe(2);
  });
  it('awards 1 star for 4+ moves', () => {
    expect(dailyStarsFromMoves(4)).toBe(1);
    expect(dailyStarsFromMoves(20)).toBe(1);
  });
});

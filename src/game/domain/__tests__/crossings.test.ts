import { describe, expect, it } from 'vitest';
import {
  countCrossings,
  crossingEdgeIndices,
  crossingsInvolving,
  edgesIncidentTo,
} from '../crossings';
import type { Graph, Vertex } from '../types';

function makeGraph(points: readonly [number, number][], edges: readonly [number, number][]): Graph {
  const vertices: Vertex[] = points.map(([x, y], id) => ({ id, x, y }));
  return { vertices, edges: edges.map(([a, b]) => ({ a, b })) };
}

describe('countCrossings', () => {
  it('returns 0 for an empty graph', () => {
    expect(countCrossings({ vertices: [], edges: [] })).toBe(0);
  });

  it('returns 0 for a triangle', () => {
    const g = makeGraph(
      [
        [0, 0],
        [10, 0],
        [5, 10],
      ],
      [
        [0, 1],
        [1, 2],
        [2, 0],
      ],
    );
    expect(countCrossings(g)).toBe(0);
  });

  it('returns 1 for a simple X', () => {
    const g = makeGraph(
      [
        [0, 0],
        [10, 10],
        [0, 10],
        [10, 0],
      ],
      [
        [0, 1],
        [2, 3],
      ],
    );
    expect(countCrossings(g)).toBe(1);
  });

  it('returns 1 for a square with both diagonals (diagonals cross once)', () => {
    const g = makeGraph(
      [
        [0, 0],
        [10, 0],
        [10, 10],
        [0, 10],
      ],
      [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 0],
        [0, 2],
        [1, 3],
      ],
    );
    expect(countCrossings(g)).toBe(1);
  });

  it('returns 0 for two parallel non-adjacent edges', () => {
    const g = makeGraph(
      [
        [0, 0],
        [10, 0],
        [0, 5],
        [10, 5],
      ],
      [
        [0, 1],
        [2, 3],
      ],
    );
    expect(countCrossings(g)).toBe(0);
  });
});

describe('edgesIncidentTo', () => {
  it('returns only edges touching the given vertex', () => {
    const g = makeGraph(
      [
        [0, 0],
        [1, 0],
        [2, 0],
        [3, 0],
      ],
      [
        [0, 1],
        [1, 2],
        [2, 3],
      ],
    );
    const incident = edgesIncidentTo(1, g);
    expect(incident).toEqual([
      { a: 0, b: 1 },
      { a: 1, b: 2 },
    ]);
  });

  it('returns empty for an isolated vertex', () => {
    const g = makeGraph(
      [
        [0, 0],
        [1, 0],
        [2, 0],
      ],
      [[0, 1]],
    );
    expect(edgesIncidentTo(2, g)).toEqual([]);
  });
});

describe('crossingEdgeIndices', () => {
  it('returns an empty set for a planar graph', () => {
    const g = makeGraph(
      [
        [0, 0],
        [10, 0],
        [5, 10],
      ],
      [
        [0, 1],
        [1, 2],
        [2, 0],
      ],
    );
    expect(crossingEdgeIndices(g).size).toBe(0);
  });

  it('includes both edge indices for a single crossing', () => {
    const g = makeGraph(
      [
        [0, 0],
        [10, 10],
        [0, 10],
        [10, 0],
      ],
      [
        [0, 1],
        [2, 3],
      ],
    );
    expect(crossingEdgeIndices(g)).toEqual(new Set([0, 1]));
  });

  it('identifies the two crossing diagonals in a square', () => {
    const g = makeGraph(
      [
        [0, 0],
        [10, 0],
        [10, 10],
        [0, 10],
      ],
      [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 0],
        [0, 2],
        [1, 3],
      ],
    );
    expect(crossingEdgeIndices(g)).toEqual(new Set([4, 5]));
  });
});

describe('crossingsInvolving', () => {
  it('counts a crossing on an incident edge exactly once', () => {
    const g = makeGraph(
      [
        [0, 0],
        [10, 10],
        [0, 10],
        [10, 0],
      ],
      [
        [0, 1],
        [2, 3],
      ],
    );
    expect(crossingsInvolving(0, g)).toBe(1);
    expect(crossingsInvolving(1, g)).toBe(1);
    expect(crossingsInvolving(2, g)).toBe(1);
  });

  it('returns 0 when the vertex has no incident edges in crossings', () => {
    const g = makeGraph(
      [
        [0, 0],
        [10, 10],
        [0, 10],
        [10, 0],
        [50, 50],
      ],
      [
        [0, 1],
        [2, 3],
      ],
    );
    expect(crossingsInvolving(4, g)).toBe(0);
  });
});

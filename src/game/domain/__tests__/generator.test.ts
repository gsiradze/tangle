import { describe, expect, it } from 'vitest';
import { countCrossings, findCrossingPairs, hasSingleVertexCover } from '../crossings';
import { generateLevel, tierForLevel } from '../generator';

const BUNDLED = Array.from({ length: 100 }, (_, i) => generateLevel(i + 1));

describe('generateLevel determinism', () => {
  it('produces identical output for the same seed', () => {
    const a = generateLevel(7);
    const b = generateLevel(7);
    expect(a).toEqual(b);
  });

  it('produces different output for different seeds', () => {
    const a = generateLevel(1);
    const b = generateLevel(2);
    expect(a).not.toEqual(b);
  });
});

describe('bundled 100 levels', () => {
  it('all solved layouts are planar (0 crossings)', () => {
    for (const level of BUNDLED) {
      const graph = {
        vertices: level.solved.map((p, id) => ({ id, x: p.x, y: p.y })),
        edges: level.edges,
      };
      expect(countCrossings(graph)).toBe(0);
    }
  });

  it('all initial layouts meet their tier minimum crossings', () => {
    for (const level of BUNDLED) {
      const tier = tierForLevel(level.id);
      const graph = {
        vertices: level.initial.map((p, id) => ({ id, x: p.x, y: p.y })),
        edges: level.edges,
      };
      expect(countCrossings(graph)).toBeGreaterThanOrEqual(tier.minCrossings);
    }
  });

  it('no initial layout is solvable by moving a single vertex', () => {
    for (const level of BUNDLED) {
      const graph = {
        vertices: level.initial.map((p, id) => ({ id, x: p.x, y: p.y })),
        edges: level.edges,
      };
      const pairs = findCrossingPairs(graph);
      expect(hasSingleVertexCover(graph, pairs)).toBe(false);
    }
  });

  it('all vertex and edge counts fall within their tier range', () => {
    for (const level of BUNDLED) {
      const tier = tierForLevel(level.id);
      expect(level.vertexCount).toBeGreaterThanOrEqual(tier.minVertices);
      expect(level.vertexCount).toBeLessThanOrEqual(tier.maxVertices);
      expect(level.edges.length).toBeGreaterThanOrEqual(
        Math.min(tier.minEdges, level.edges.length),
      );
      expect(level.edges.length).toBeLessThanOrEqual(tier.maxEdges);
    }
  });

  it('initial and solved layouts have matching vertex counts', () => {
    for (const level of BUNDLED) {
      expect(level.initial.length).toBe(level.vertexCount);
      expect(level.solved.length).toBe(level.vertexCount);
    }
  });

  it('edge indices reference valid vertices', () => {
    for (const level of BUNDLED) {
      for (const edge of level.edges) {
        expect(edge.a).toBeGreaterThanOrEqual(0);
        expect(edge.a).toBeLessThan(level.vertexCount);
        expect(edge.b).toBeGreaterThanOrEqual(0);
        expect(edge.b).toBeLessThan(level.vertexCount);
        expect(edge.a).not.toBe(edge.b);
      }
    }
  });

  it('optimal moves is at least 1 for every level', () => {
    for (const level of BUNDLED) {
      expect(level.optimalMoves).toBeGreaterThanOrEqual(1);
    }
  });
});

describe('tierForLevel', () => {
  it('covers the five tiers at their boundaries', () => {
    expect(tierForLevel(1).minVertices).toBe(5);
    expect(tierForLevel(10).minVertices).toBe(5);
    expect(tierForLevel(11).minVertices).toBe(6);
    expect(tierForLevel(25).minVertices).toBe(6);
    expect(tierForLevel(26).minVertices).toBe(8);
    expect(tierForLevel(50).minVertices).toBe(8);
    expect(tierForLevel(51).minVertices).toBe(11);
    expect(tierForLevel(75).minVertices).toBe(11);
    expect(tierForLevel(76).minVertices).toBe(15);
    expect(tierForLevel(100).minVertices).toBe(15);
  });
});

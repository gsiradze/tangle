import { Delaunay } from 'd3-delaunay';
import { findCrossingPairs, hasSingleVertexCover } from './crossings';
import { mulberry32, randInt, randRange, shuffleInPlace, type Rng } from './rng';
import { estimateOptimalMoves } from './solver';
import type { Edge, Level, Vec2, Vertex } from './types';

interface Tier {
  readonly minVertices: number;
  readonly maxVertices: number;
  readonly minEdges: number;
  readonly maxEdges: number;
  readonly minCrossings: number;
}

export function tierForLevel(level: number): Tier {
  if (level <= 10)
    return { minVertices: 5, maxVertices: 6, minEdges: 6, maxEdges: 9, minCrossings: 3 };
  if (level <= 25)
    return { minVertices: 6, maxVertices: 7, minEdges: 8, maxEdges: 12, minCrossings: 3 };
  if (level <= 50)
    return { minVertices: 8, maxVertices: 10, minEdges: 13, maxEdges: 18, minCrossings: 5 };
  if (level <= 75)
    return { minVertices: 11, maxVertices: 14, minEdges: 18, maxEdges: 28, minCrossings: 8 };
  return { minVertices: 15, maxVertices: 20, minEdges: 25, maxEdges: 40, minCrossings: 12 };
}

const MARGIN = 0.1;
const MIN_DIST = 0.12;
const CIRCLE_RADIUS = 0.4;
const CIRCLE_CENTER: Vec2 = { x: 0.5, y: 0.5 };
const MAX_TANGLE_RETRIES = 100;

export function scatterPoints(n: number, rng: Rng): Vec2[] {
  const points: Vec2[] = [];
  const minDistSq = MIN_DIST * MIN_DIST;
  const maxAttempts = n * 200;
  let attempts = 0;
  while (points.length < n && attempts < maxAttempts) {
    attempts++;
    const p: Vec2 = {
      x: randRange(rng, MARGIN, 1 - MARGIN),
      y: randRange(rng, MARGIN, 1 - MARGIN),
    };
    let ok = true;
    for (const q of points) {
      const dx = p.x - q.x;
      const dy = p.y - q.y;
      if (dx * dx + dy * dy < minDistSq) {
        ok = false;
        break;
      }
    }
    if (ok) points.push(p);
  }
  while (points.length < n) {
    points.push({
      x: randRange(rng, MARGIN, 1 - MARGIN),
      y: randRange(rng, MARGIN, 1 - MARGIN),
    });
  }
  return points;
}

export function delaunayEdges(points: readonly Vec2[]): Edge[] {
  const delaunay = Delaunay.from(points.map((p): [number, number] => [p.x, p.y]));
  const triangles = delaunay.triangles;
  const seen = new Set<string>();
  const edges: Edge[] = [];
  for (let i = 0; i < triangles.length; i += 3) {
    const t0 = triangles[i]!;
    const t1 = triangles[i + 1]!;
    const t2 = triangles[i + 2]!;
    tryAddEdge(edges, seen, t0, t1);
    tryAddEdge(edges, seen, t1, t2);
    tryAddEdge(edges, seen, t2, t0);
  }
  return edges;
}

function tryAddEdge(edges: Edge[], seen: Set<string>, a: number, b: number): void {
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  const key = `${lo}-${hi}`;
  if (seen.has(key)) return;
  seen.add(key);
  edges.push({ a: lo, b: hi });
}

class UnionFind {
  private readonly parent: number[];

  constructor(n: number) {
    this.parent = Array.from({ length: n }, (_, i) => i);
  }

  find(x: number): number {
    let r = x;
    while (this.parent[r] !== r) r = this.parent[r]!;
    let cur = x;
    while (this.parent[cur] !== r) {
      const next = this.parent[cur]!;
      this.parent[cur] = r;
      cur = next;
    }
    return r;
  }

  union(a: number, b: number): void {
    const ra = this.find(a);
    const rb = this.find(b);
    if (ra !== rb) this.parent[ra] = rb;
  }
}

function isConnected(vertexCount: number, edges: readonly Edge[]): boolean {
  if (vertexCount <= 1) return true;
  const uf = new UnionFind(vertexCount);
  for (const e of edges) uf.union(e.a, e.b);
  const root = uf.find(0);
  for (let i = 1; i < vertexCount; i++) {
    if (uf.find(i) !== root) return false;
  }
  return true;
}

function trimEdges(
  vertexCount: number,
  edges: readonly Edge[],
  target: number,
  rng: Rng,
): Edge[] {
  if (edges.length <= target) return [...edges];
  const order = [...edges];
  shuffleInPlace(rng, order);
  let remaining = [...edges];
  for (const candidate of order) {
    if (remaining.length <= target) break;
    const without = remaining.filter((e) => e !== candidate);
    if (isConnected(vertexCount, without)) remaining = without;
  }
  return remaining;
}

function circleLayout(n: number): Vec2[] {
  const points: Vec2[] = [];
  for (let i = 0; i < n; i++) {
    const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
    points.push({
      x: CIRCLE_CENTER.x + CIRCLE_RADIUS * Math.cos(angle),
      y: CIRCLE_CENTER.y + CIRCLE_RADIUS * Math.sin(angle),
    });
  }
  return points;
}

function applyLayout(layout: readonly Vec2[]): Vertex[] {
  return layout.map((p, id) => ({ id, x: p.x, y: p.y }));
}

interface TangleGoal {
  readonly minCrossings: number;
  readonly requireNoSingleVertexCover: boolean;
}

function tangledLayout(
  n: number,
  edges: readonly Edge[],
  rng: Rng,
  goal: TangleGoal,
): Vec2[] {
  const circle = circleLayout(n);
  const perm = Array.from({ length: n }, (_, i) => i);
  let fallback: Vec2[] | null = null;
  let fallbackScore = -1;
  for (let attempt = 0; attempt < MAX_TANGLE_RETRIES; attempt++) {
    shuffleInPlace(rng, perm);
    const initial = perm.map((idx) => circle[idx]!);
    const graph = { vertices: applyLayout(initial), edges };
    const pairs = findCrossingPairs(graph);
    if (pairs.length >= goal.minCrossings) {
      if (!goal.requireNoSingleVertexCover || !hasSingleVertexCover(graph, pairs)) {
        return initial;
      }
    }
    if (pairs.length > fallbackScore) {
      fallbackScore = pairs.length;
      fallback = initial;
    }
  }
  if (fallback) return fallback;
  shuffleInPlace(rng, perm);
  return perm.map((idx) => circle[idx]!);
}

const MAX_GENERATE_ATTEMPTS = 20;

export function generateLevel(level: number): Level {
  const tier = tierForLevel(level);
  let best: Level | null = null;
  let bestScore = -1;
  for (let attempt = 0; attempt < MAX_GENERATE_ATTEMPTS; attempt++) {
    const rng = mulberry32(level * 1000 + attempt);
    const vertexCount = randInt(rng, tier.minVertices, tier.maxVertices + 1);
    const solved = scatterPoints(vertexCount, rng);
    const rawEdges = delaunayEdges(solved);
    const targetLo = Math.min(tier.minEdges, rawEdges.length);
    const targetHi = Math.min(tier.maxEdges, rawEdges.length);
    const target = randInt(rng, targetLo, targetHi + 1);
    const edges = trimEdges(vertexCount, rawEdges, target, rng);
    const initial = tangledLayout(vertexCount, edges, rng, {
      minCrossings: tier.minCrossings,
      requireNoSingleVertexCover: true,
    });
    const graph = { vertices: applyLayout(initial), edges };
    const pairs = findCrossingPairs(graph);
    const passesMin = pairs.length >= tier.minCrossings;
    const passesCover = !hasSingleVertexCover(graph, pairs);
    const candidate: Level = {
      id: level,
      seed: level,
      vertexCount,
      edges,
      solved,
      initial,
      optimalMoves: estimateOptimalMoves(solved, initial),
    };
    if (passesMin && passesCover) return candidate;
    const score = (passesMin ? 10_000 : 0) + (passesCover ? 1_000 : 0) + pairs.length;
    if (score > bestScore) {
      bestScore = score;
      best = candidate;
    }
  }
  return best!;
}

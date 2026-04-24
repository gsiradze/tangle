import { findCrossingPairs, hasSingleVertexCover } from './crossings';
import { delaunayEdges, scatterPoints } from './generator';
import { mulberry32, randInt, randRange } from './rng';
import type { Edge, Level, Vec2 } from './types';

const MIN_VERTICES = 11;
const MAX_VERTICES = 14;
const MIN_DAILY_CROSSINGS = 6;
const MIN_CULPRIT_DEGREE = 4;
const MIN_NEW_POS_DIST = 0.085;
const MIN_NEIGHBORS = 3;
const NEIGHBOR_RADIUS = 0.28;
const DISPLACEMENT_STEPS: readonly number[] = [0.09, 0.12, 0.15, 0.18, 0.22];
const ANGLE_RETRIES_PER_DIST = 14;
const CULPRIT_ATTEMPTS = 8;
const RESTART_ATTEMPTS = 6;
const DAILY_OPTIMAL_MOVES = 1;

export function todayKey(now: Date = new Date()): string {
  return keyFromDate(now);
}

export function keyFromDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function dateFromKey(key: string): Date {
  const [yStr, mStr, dStr] = key.split('-');
  return new Date(Number(yStr), Number(mStr) - 1, Number(dStr));
}

export function previousDayKey(key: string): string {
  const date = dateFromKey(key);
  date.setDate(date.getDate() - 1);
  return keyFromDate(date);
}

export function nextDayKey(key: string): string {
  const date = dateFromKey(key);
  date.setDate(date.getDate() + 1);
  return keyFromDate(date);
}

export function seedFromKey(key: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function computeDegrees(edges: readonly Edge[], n: number): number[] {
  const deg = new Array<number>(n).fill(0);
  for (const e of edges) {
    deg[e.a]! += 1;
    deg[e.b]! += 1;
  }
  return deg;
}

function minDistance(p: Vec2, points: readonly Vec2[], skip: number): number {
  let min = Infinity;
  for (let i = 0; i < points.length; i++) {
    if (i === skip) continue;
    const dx = p.x - points[i]!.x;
    const dy = p.y - points[i]!.y;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d < min) min = d;
  }
  return min;
}

function neighborCount(p: Vec2, points: readonly Vec2[], skip: number, radius: number): number {
  let count = 0;
  for (let i = 0; i < points.length; i++) {
    if (i === skip) continue;
    const dx = p.x - points[i]!.x;
    const dy = p.y - points[i]!.y;
    if (Math.sqrt(dx * dx + dy * dy) <= radius) count += 1;
  }
  return count;
}

function displace(origin: Vec2, angle: number, distance: number): Vec2 {
  return {
    x: Math.max(0.08, Math.min(0.92, origin.x + Math.cos(angle) * distance)),
    y: Math.max(0.08, Math.min(0.92, origin.y + Math.sin(angle) * distance)),
  };
}

interface Candidate {
  readonly n: number;
  readonly solved: Vec2[];
  readonly edges: Edge[];
  readonly initial: Vec2[];
  readonly score: number;
}

export function generateDaily(key: string): Level {
  const seed = seedFromKey(key);
  const rng = mulberry32(seed);
  let best: Candidate | null = null;

  for (let restart = 0; restart < RESTART_ATTEMPTS; restart++) {
    const n = randInt(rng, MIN_VERTICES, MAX_VERTICES + 1);
    const solved = scatterPoints(n, rng);
    const edges = delaunayEdges(solved);
    const degrees = computeDegrees(edges, n);

    const interior: number[] = [];
    for (let i = 0; i < n; i++) {
      if (degrees[i]! >= MIN_CULPRIT_DEGREE) interior.push(i);
    }
    const pool = interior.length > 0 ? interior : rankedByDegree(degrees);

    for (let ca = 0; ca < CULPRIT_ATTEMPTS; ca++) {
      const culprit = pool[randInt(rng, 0, pool.length)]!;
      for (const dist of DISPLACEMENT_STEPS) {
        for (let a = 0; a < ANGLE_RETRIES_PER_DIST; a++) {
          const angle = randRange(rng, 0, Math.PI * 2);
          const newPos = displace(solved[culprit]!, angle, dist);
          if (minDistance(newPos, solved, culprit) < MIN_NEW_POS_DIST) continue;
          if (neighborCount(newPos, solved, culprit, NEIGHBOR_RADIUS) < MIN_NEIGHBORS) continue;

          const initial = solved.map((p, id) =>
            id === culprit ? newPos : { x: p.x, y: p.y },
          );
          const graph = {
            vertices: initial.map((p, id) => ({ id, x: p.x, y: p.y })),
            edges,
          };
          const pairs = findCrossingPairs(graph);
          const cover = hasSingleVertexCover(graph, pairs);
          if (pairs.length >= MIN_DAILY_CROSSINGS && cover) {
            return buildLevel(seed, n, edges, solved, initial);
          }
          const score =
            (cover ? 10_000 : 0) + pairs.length * 10 - Math.floor(dist * 100);
          if (!best || score > best.score) {
            best = { n, solved, edges, initial, score };
          }
        }
      }
    }
  }

  if (best) return buildLevel(seed, best.n, best.edges, best.solved, best.initial);
  // Hard fallback — same as original structure, no puzzle.
  const rngFallback = mulberry32(seed);
  const n = randInt(rngFallback, MIN_VERTICES, MAX_VERTICES + 1);
  const solved = scatterPoints(n, rngFallback);
  const edges = delaunayEdges(solved);
  return buildLevel(seed, n, edges, solved, solved);
}

function rankedByDegree(degrees: readonly number[]): number[] {
  const indexed = degrees.map((d, i) => ({ d, i }));
  indexed.sort((a, b) => b.d - a.d);
  return indexed.slice(0, Math.max(1, Math.ceil(degrees.length / 2))).map((x) => x.i);
}

function buildLevel(
  seed: number,
  vertexCount: number,
  edges: readonly Edge[],
  solved: readonly Vec2[],
  initial: readonly Vec2[],
): Level {
  return {
    id: seed,
    seed,
    vertexCount,
    edges,
    solved,
    initial,
    optimalMoves: DAILY_OPTIMAL_MOVES,
  };
}

export function dailyStarsFromMoves(moves: number): 1 | 2 | 3 {
  if (moves <= 1) return 3;
  if (moves <= 3) return 2;
  return 1;
}

export type Rng = () => number;

export function mulberry32(seed: number): Rng {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function randRange(rng: Rng, min: number, max: number): number {
  return min + rng() * (max - min);
}

export function randInt(rng: Rng, minInclusive: number, maxExclusive: number): number {
  return Math.floor(randRange(rng, minInclusive, maxExclusive));
}

export function shuffleInPlace<T>(rng: Rng, arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randInt(rng, 0, i + 1);
    const tmp = arr[i]!;
    arr[i] = arr[j]!;
    arr[j] = tmp;
  }
  return arr;
}

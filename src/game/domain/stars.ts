export type Stars = 1 | 2 | 3;

export function computeStars(moves: number, optimalMoves: number): Stars {
  if (moves <= optimalMoves * 1.25) return 3;
  if (moves <= optimalMoves * 2) return 2;
  return 1;
}

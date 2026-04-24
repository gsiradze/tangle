export interface Vec2 {
  readonly x: number;
  readonly y: number;
}

export interface Vertex {
  readonly id: number;
  x: number;
  y: number;
}

export interface Edge {
  readonly a: number;
  readonly b: number;
}

export interface Graph {
  readonly vertices: Vertex[];
  readonly edges: readonly Edge[];
}

export interface Level {
  readonly id: number;
  readonly seed: number;
  readonly vertexCount: number;
  readonly edges: readonly Edge[];
  readonly solved: readonly Vec2[];
  readonly initial: readonly Vec2[];
  readonly optimalMoves: number;
}

export interface LevelProgress {
  readonly stars: number;
  readonly bestMoves: number;
}

export interface GameState {
  readonly currentLevel: number;
  readonly progress: Readonly<Record<number, LevelProgress>>;
  readonly sessionCount: number;
  readonly onboardingCompleted: boolean;
}

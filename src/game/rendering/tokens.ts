export const colors = {
  paper50: 0xfdfbf6,
  paper100: 0xfaf6f0,
  ink900: 0x2a2722,
  ink700: 0x4a453c,
  edgeDefault: 0x8e8675,
  edgeCrossing: 0xc46a47,
  edgeResolved: 0x5e7f59,
  vertex: 0x4a453c,
  vertexActive: 0xc39a3e,
} as const;

export const hex = {
  ink900: '#2a2722',
  ink700: '#4a453c',
} as const;

export const layout = {
  canvasWidth: 420,
  canvasHeight: 760,
  playAreaPadding: 40,
  vertexVisualRadius: 16,
  vertexHitRadius: 32,
  edgeStroke: 3.5,
} as const;

import { AUTO, Game, Scale } from 'phaser';
import type { Types } from 'phaser';
import { BootScene } from './scenes/BootScene';
import { LevelScene } from './scenes/LevelScene';
import { colors, layout } from './rendering/tokens';
import type { Level } from './domain/types';

const config: Types.Core.GameConfig = {
  type: AUTO,
  width: layout.canvasWidth,
  height: layout.canvasHeight,
  parent: 'game-container',
  backgroundColor: colors.paper100,
  scale: {
    mode: Scale.FIT,
    autoCenter: Scale.CENTER_BOTH,
  },
  render: {
    antialias: true,
    pixelArt: false,
  },
  scene: [BootScene, LevelScene],
};

export interface StartGameInitial {
  readonly levelId?: number;
  readonly levelObject?: Level;
}

export function startGame(parent: string, initial: StartGameInitial): Game {
  const game = new Game({ ...config, parent });
  if (initial.levelObject) {
    game.registry.set('currentLevelObject', initial.levelObject);
  } else {
    game.registry.set('currentLevel', initial.levelId ?? 1);
  }
  return game;
}

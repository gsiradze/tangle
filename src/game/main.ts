import { AUTO, Game, Scale } from 'phaser';
import type { Types } from 'phaser';
import { BootScene } from './scenes/BootScene';
import { LevelScene } from './scenes/LevelScene';
import { colors, layout } from './rendering/tokens';

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

export function startGame(parent: string, initialLevelId: number): Game {
  const game = new Game({ ...config, parent });
  game.registry.set('currentLevel', initialLevelId);
  return game;
}

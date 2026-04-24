import { Scene, Scenes } from 'phaser';
import { getLevel } from '../domain/levels';
import type { Level } from '../domain/types';

const FONT_READY_TIMEOUT_MS = 1500;

export class BootScene extends Scene {
  constructor() {
    super('Boot');
  }

  create(): void {
    let cancelled = false;
    this.events.once(Scenes.Events.SHUTDOWN, () => {
      cancelled = true;
    });
    this.events.once(Scenes.Events.DESTROY, () => {
      cancelled = true;
    });

    const start = (): void => {
      if (cancelled) return;
      if (!this.scene?.isActive('Boot')) return;
      const override = this.registry.get('currentLevelObject') as Level | undefined;
      let level: Level | undefined = override ?? undefined;
      if (!level) {
        const registryValue = this.registry.get('currentLevel');
        const id = typeof registryValue === 'number' ? registryValue : 1;
        level = getLevel(id) ?? getLevel(1);
      }
      if (!level) {
        this.add.text(20, 20, 'Level data missing', { color: '#c25c3f' });
        return;
      }
      this.scene.start('Level', { level });
    };
    const fonts = typeof document !== 'undefined' ? document.fonts : null;
    if (!fonts || typeof fonts.ready?.then !== 'function') {
      start();
      return;
    }
    const timeout = new Promise<void>((resolve) => setTimeout(resolve, FONT_READY_TIMEOUT_MS));
    Promise.race([fonts.ready.then(() => undefined), timeout]).then(start, start);
  }
}

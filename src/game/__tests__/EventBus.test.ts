import { describe, expect, it, vi } from 'vitest';
import { EventBus } from '../EventBus';

describe('EventBus', () => {
  it('delivers typed events to subscribers', () => {
    const handler = vi.fn();
    EventBus.on('scene-ready', handler);
    EventBus.emit('scene-ready', 'Game');
    expect(handler).toHaveBeenCalledWith('Game');
    EventBus.off('scene-ready', handler);
  });

  it('stops delivering after off()', () => {
    const handler = vi.fn();
    EventBus.on('scene-ready', handler);
    EventBus.off('scene-ready', handler);
    EventBus.emit('scene-ready', 'Game');
    expect(handler).not.toHaveBeenCalled();
  });
});

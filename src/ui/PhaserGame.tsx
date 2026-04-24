import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { Game } from 'phaser';
import { startGame } from '../game/main';
import { EventBus } from '../game/EventBus';

if (import.meta.env.DEV) {
  (globalThis as unknown as { __tangleBus?: typeof EventBus }).__tangleBus = EventBus;
}

interface PhaserGameProps {
  readonly levelId: number;
  readonly onReady?: (sceneKey: string) => void;
  readonly inputDisabled?: boolean;
}

export function PhaserGame({ levelId, onReady, inputDisabled }: PhaserGameProps) {
  const gameRef = useRef<Game | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [sceneReady, setSceneReady] = useState(false);
  const lastLevelRef = useRef<number>(levelId);

  useLayoutEffect(() => {
    if (gameRef.current !== null) return;
    if (!containerRef.current) return;
    containerRef.current.id = 'game-container';
    gameRef.current = startGame('game-container', lastLevelRef.current);
    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
      setSceneReady(false);
    };
  }, []);

  useEffect(() => {
    const handler = (name: string): void => {
      if (name === 'Level') setSceneReady(true);
      onReady?.(name);
    };
    EventBus.on('scene-ready', handler);
    return () => {
      EventBus.off('scene-ready', handler);
    };
  }, [onReady]);

  useEffect(() => {
    if (lastLevelRef.current === levelId) return;
    lastLevelRef.current = levelId;
    gameRef.current?.registry.set('currentLevel', levelId);
    if (sceneReady) EventBus.emit('request:load-level', levelId);
  }, [levelId, sceneReady]);

  useEffect(() => {
    const game = gameRef.current;
    if (!game || !sceneReady) return;
    game.input.enabled = !inputDisabled;
  }, [sceneReady, inputDisabled]);

  return <div ref={containerRef} className="w-full h-full touch-none select-none" />;
}

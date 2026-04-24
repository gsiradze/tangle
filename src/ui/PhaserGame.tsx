import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { Game } from 'phaser';
import { startGame } from '../game/main';
import { EventBus } from '../game/EventBus';
import type { Level } from '../game/domain/types';

if (import.meta.env.DEV) {
  (globalThis as unknown as { __tangleBus?: typeof EventBus }).__tangleBus = EventBus;
}

interface PhaserGameProps {
  readonly levelId?: number;
  readonly levelObject?: Level;
  readonly onReady?: (sceneKey: string) => void;
  readonly inputDisabled?: boolean;
}

export function PhaserGame({ levelId, levelObject, onReady, inputDisabled }: PhaserGameProps) {
  const gameRef = useRef<Game | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [sceneReady, setSceneReady] = useState(false);
  const lastLevelIdRef = useRef<number | undefined>(levelId);
  const lastLevelObjectRef = useRef<Level | undefined>(levelObject);

  useLayoutEffect(() => {
    if (gameRef.current !== null) return;
    if (!containerRef.current) return;
    containerRef.current.id = 'game-container';
    gameRef.current = startGame('game-container', {
      levelId: lastLevelIdRef.current,
      levelObject: lastLevelObjectRef.current,
    });
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
    if (levelObject !== undefined) {
      if (lastLevelObjectRef.current === levelObject) return;
      lastLevelObjectRef.current = levelObject;
      lastLevelIdRef.current = undefined;
      gameRef.current?.registry.set('currentLevelObject', levelObject);
      if (sceneReady) EventBus.emit('request:load-level-object', levelObject);
      return;
    }
    if (levelId === undefined) return;
    if (lastLevelIdRef.current === levelId) return;
    lastLevelIdRef.current = levelId;
    lastLevelObjectRef.current = undefined;
    gameRef.current?.registry.set('currentLevel', levelId);
    gameRef.current?.registry.set('currentLevelObject', null);
    if (sceneReady) EventBus.emit('request:load-level', levelId);
  }, [levelId, levelObject, sceneReady]);

  useEffect(() => {
    const game = gameRef.current;
    if (!game || !sceneReady) return;
    game.input.enabled = !inputDisabled;
  }, [sceneReady, inputDisabled]);

  return <div ref={containerRef} className="w-full h-full touch-none select-none" />;
}

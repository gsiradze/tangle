import type { Level } from './domain/types';

export interface EventMap {
  readonly 'scene-ready': [sceneKey: string];
  readonly 'level:start': [levelId: number];
  readonly 'level:move': [moves: number];
  readonly 'level:solved': [levelId: number, moves: number];
  readonly 'level:modal-ready': [levelId: number, moves: number];
  readonly 'request:reset-level': [];
  readonly 'request:load-level': [levelId: number];
  readonly 'request:load-level-object': [level: Level];
  readonly 'request:apply-hint': [];
  readonly 'hint:applied': [vertexId: number | null];
}

type EventName = keyof EventMap;
type Handler<K extends EventName> = (...args: EventMap[K]) => void;

interface Subscription {
  readonly handler: (...args: readonly unknown[]) => void;
  readonly context: unknown;
}

class TypedEventBus {
  private readonly subs = new Map<EventName, Subscription[]>();

  on<K extends EventName>(event: K, handler: Handler<K>, context?: unknown): void {
    const list = this.subs.get(event) ?? [];
    list.push({ handler: handler as (...args: readonly unknown[]) => void, context });
    this.subs.set(event, list);
  }

  off<K extends EventName>(event: K, handler: Handler<K>, context?: unknown): void {
    const list = this.subs.get(event);
    if (!list) return;
    const next = list.filter(
      s => s.handler !== (handler as (...args: readonly unknown[]) => void) || s.context !== context,
    );
    if (next.length === 0) this.subs.delete(event);
    else this.subs.set(event, next);
  }

  emit<K extends EventName>(event: K, ...args: EventMap[K]): void {
    const list = this.subs.get(event);
    if (!list) return;
    for (const sub of list.slice()) {
      sub.handler.call(sub.context, ...args);
    }
  }
}

export const EventBus = new TypedEventBus();

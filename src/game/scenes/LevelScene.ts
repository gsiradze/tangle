import { Scene, Scenes } from 'phaser';
import type { GameObjects, Input, Tweens } from 'phaser';
import { EventBus } from '../EventBus';
import { countCrossings, crossingEdgeIndices } from '../domain/crossings';
import { clampPoint } from '../domain/geometry';
import { pickHintVertex } from '../domain/hint';
import { getLevel } from '../domain/levels';
import type { Graph, Level, Vec2, Vertex } from '../domain/types';
import { lerpColor } from '../rendering/color';
import { colors, layout } from '../rendering/tokens';

interface LevelSceneData {
  readonly level: Level;
}

interface PlayArea {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

const WIN_EDGE_ANIM_MS = 400;
const WIN_VERTEX_PULSE_MS = 600;
const WIN_HOLD_MS = 2000;
const DRAG_VERTEX_SCALE = 1.12;

export class LevelScene extends Scene {
  private level!: Level;
  private vertices: Vertex[] = [];
  private edgesGfx!: GameObjects.Graphics;
  private vertexGfx!: GameObjects.Graphics;
  private playArea: PlayArea = { x: 0, y: 0, w: 0, h: 0 };
  private draggingId: number | null = null;
  private dragOffsetX = 0;
  private dragOffsetY = 0;
  private moveCount = 0;
  private solved = false;
  private winProgress = 0;
  private pulseScale = 1;
  private winTween: Tweens.Tween | null = null;
  private pulseTween: Tweens.Tween | null = null;
  private hitRadiusSq = layout.vertexHitRadius * layout.vertexHitRadius;

  constructor() {
    super('Level');
  }

  init(data: LevelSceneData): void {
    this.level = data.level;
    this.moveCount = 0;
    this.solved = false;
    this.winProgress = 0;
    this.pulseScale = 1;
    this.draggingId = null;
  }

  create(): void {
    this.cameras.main.setBackgroundColor(colors.paper100);
    this.computePlayArea();
    this.vertices = this.level.initial.map((p, id) => ({
      id,
      x: this.playArea.x + p.x * this.playArea.w,
      y: this.playArea.y + p.y * this.playArea.h,
    }));
    this.edgesGfx = this.add.graphics();
    this.vertexGfx = this.add.graphics();
    this.redraw();

    this.input.on('pointerdown', this.onPointerDown, this);
    this.input.on('pointermove', this.onPointerMove, this);
    this.input.on('pointerup', this.onPointerUp, this);
    this.input.on('pointerupoutside', this.onPointerUp, this);

    EventBus.on('request:reset-level', this.handleReset, this);
    EventBus.on('request:load-level', this.handleLoadLevel, this);
    EventBus.on('request:load-level-object', this.handleLoadLevelObject, this);
    EventBus.on('request:apply-hint', this.handleApplyHint, this);

    this.events.once(Scenes.Events.SHUTDOWN, this.onShutdown, this);

    EventBus.emit('level:start', this.level.id);
    EventBus.emit('scene-ready', 'Level');
  }

  private onShutdown(): void {
    this.input.off('pointerdown', this.onPointerDown, this);
    this.input.off('pointermove', this.onPointerMove, this);
    this.input.off('pointerup', this.onPointerUp, this);
    this.input.off('pointerupoutside', this.onPointerUp, this);
    EventBus.off('request:reset-level', this.handleReset, this);
    EventBus.off('request:load-level', this.handleLoadLevel, this);
    EventBus.off('request:load-level-object', this.handleLoadLevelObject, this);
    EventBus.off('request:apply-hint', this.handleApplyHint, this);
    this.winTween?.remove();
    this.pulseTween?.remove();
    this.winTween = null;
    this.pulseTween = null;
  }

  private applyLevel(level: Level): void {
    this.winTween?.remove();
    this.pulseTween?.remove();
    this.winTween = null;
    this.pulseTween = null;
    this.level = level;
    this.moveCount = 0;
    this.solved = false;
    this.winProgress = 0;
    this.pulseScale = 1;
    this.draggingId = null;
    this.vertices = level.initial.map((p, id) => ({
      id,
      x: this.playArea.x + p.x * this.playArea.w,
      y: this.playArea.y + p.y * this.playArea.h,
    }));
    this.redraw();
  }

  private handleReset(): void {
    this.applyLevel(this.level);
  }

  private handleLoadLevel(levelId: number): void {
    const next = getLevel(levelId);
    if (!next) return;
    this.registry.set('currentLevel', levelId);
    this.applyLevel(next);
    EventBus.emit('level:start', next.id);
  }

  private handleLoadLevelObject(level: Level): void {
    this.registry.set('currentLevelObject', level);
    this.applyLevel(level);
    EventBus.emit('level:start', level.id);
  }

  private worldFromNormalized = (p: Vec2): Vec2 => ({
    x: this.playArea.x + p.x * this.playArea.w,
    y: this.playArea.y + p.y * this.playArea.h,
  });

  private handleApplyHint(): void {
    if (this.solved) {
      EventBus.emit('hint:applied', null);
      return;
    }
    const id = pickHintVertex(
      this.level.solved,
      this.vertices,
      this.worldFromNormalized,
      layout.vertexHitRadius,
    );
    if (id === null) {
      EventBus.emit('hint:applied', null);
      return;
    }
    const target = this.worldFromNormalized(this.level.solved[id]!);
    const vertex = this.vertices[id]!;
    this.tweens.add({
      targets: vertex,
      x: target.x,
      y: target.y,
      duration: 350,
      ease: 'Sine.easeInOut',
      onUpdate: () => this.redraw(),
      onComplete: () => {
        this.redraw();
        this.moveCount++;
        EventBus.emit('level:move', this.moveCount);
        EventBus.emit('hint:applied', id);
        if (countCrossings(this.graph()) === 0 && !this.solved) this.enterWinState();
      },
    });
  }

  private computePlayArea(): void {
    const w = Number(this.game.config.width);
    const h = Number(this.game.config.height);
    const padding = layout.playAreaPadding;
    this.playArea = {
      x: padding,
      y: padding,
      w: w - padding * 2,
      h: h - padding * 2,
    };
  }

  private graph(): Graph {
    return { vertices: this.vertices, edges: this.level.edges };
  }

  private hitVertex(x: number, y: number): Vertex | null {
    let best: Vertex | null = null;
    let bestDistSq = this.hitRadiusSq;
    for (const v of this.vertices) {
      const dx = v.x - x;
      const dy = v.y - y;
      const d = dx * dx + dy * dy;
      if (d <= bestDistSq) {
        bestDistSq = d;
        best = v;
      }
    }
    return best;
  }

  private onPointerDown(pointer: Input.Pointer): void {
    if (this.solved) return;
    const v = this.hitVertex(pointer.x, pointer.y);
    if (!v) return;
    this.draggingId = v.id;
    this.dragOffsetX = v.x - pointer.x;
    this.dragOffsetY = v.y - pointer.y;
    this.redraw();
  }

  private onPointerMove(pointer: Input.Pointer): void {
    if (this.draggingId === null) return;
    const v = this.vertices[this.draggingId];
    if (!v) return;
    const clamped = clampPoint(
      { x: pointer.x + this.dragOffsetX, y: pointer.y + this.dragOffsetY },
      this.playArea.x,
      this.playArea.y,
      this.playArea.x + this.playArea.w,
      this.playArea.y + this.playArea.h,
    );
    v.x = clamped.x;
    v.y = clamped.y;
    this.redraw();
  }

  private onPointerUp(): void {
    if (this.draggingId === null) return;
    this.draggingId = null;
    this.moveCount++;
    EventBus.emit('level:move', this.moveCount);
    const crossings = countCrossings(this.graph());
    this.redraw();
    if (crossings === 0 && !this.solved) this.enterWinState();
  }

  private enterWinState(): void {
    this.solved = true;
    EventBus.emit('level:solved', this.level.id, this.moveCount);

    const edgeState = { t: 0 };
    this.winTween = this.tweens.add({
      targets: edgeState,
      t: 1,
      duration: WIN_EDGE_ANIM_MS,
      ease: 'Sine.easeInOut',
      onUpdate: () => {
        this.winProgress = edgeState.t;
        this.redraw();
      },
    });

    const pulseState = { s: 1 };
    this.pulseTween = this.tweens.add({
      targets: pulseState,
      s: 1.15,
      duration: WIN_VERTEX_PULSE_MS / 2,
      ease: 'Sine.easeOut',
      yoyo: true,
      onUpdate: () => {
        this.pulseScale = pulseState.s;
        this.redraw();
      },
      onComplete: () => {
        this.pulseScale = 1;
        this.redraw();
      },
    });

    this.time.delayedCall(WIN_HOLD_MS, () => {
      EventBus.emit('level:modal-ready', this.level.id, this.moveCount);
    });
  }

  private redraw(): void {
    this.edgesGfx.clear();
    const crossing = this.solved ? new Set<number>() : crossingEdgeIndices(this.graph());

    for (let i = 0; i < this.level.edges.length; i++) {
      const edge = this.level.edges[i]!;
      const a = this.vertices[edge.a]!;
      const b = this.vertices[edge.b]!;
      const color = this.colorForEdge(i, crossing);
      this.edgesGfx.lineStyle(layout.edgeStroke, color, 1);
      this.edgesGfx.beginPath();
      this.edgesGfx.moveTo(a.x, a.y);
      this.edgesGfx.lineTo(b.x, b.y);
      this.edgesGfx.strokePath();
    }

    this.vertexGfx.clear();
    for (const v of this.vertices) {
      const isDragging = v.id === this.draggingId;
      const scale = isDragging ? DRAG_VERTEX_SCALE : this.pulseScale;
      const color = isDragging ? colors.vertexActive : colors.vertex;
      this.vertexGfx.fillStyle(color, 1);
      this.vertexGfx.fillCircle(v.x, v.y, layout.vertexVisualRadius * scale);
    }
  }

  private colorForEdge(index: number, crossing: ReadonlySet<number>): number {
    if (this.solved) {
      return lerpColor(colors.edgeDefault, colors.edgeResolved, this.winProgress);
    }
    return crossing.has(index) ? colors.edgeCrossing : colors.edgeDefault;
  }
}

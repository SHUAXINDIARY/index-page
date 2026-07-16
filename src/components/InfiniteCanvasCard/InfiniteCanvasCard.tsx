import {
  useCallback,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent,
} from 'react';
import { LocateFixed, Minus, Plus } from 'lucide-react';
import { Card } from '../Card';
import './InfiniteCanvasCard.css';

type Viewport = { x: number; y: number; scale: number };

const MIN_SCALE = 0.45;
const MAX_SCALE = 2.2;
const SCALE_STEP = 0.15;
const INITIAL_VIEWPORT: Viewport = { x: 30, y: 18, scale: 0.88 };

const clampScale = (scale: number) =>
  Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));

export const InfiniteCanvasCard = () => {
  const [viewport, setViewport] = useState<Viewport>(INITIAL_VIEWPORT);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const zoomBy = useCallback((amount: number) => {
    setViewport((current) => ({
      ...current,
      scale: clampScale(current.scale + amount),
    }));
  }, []);

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    const bounds = event.currentTarget.getBoundingClientRect();
    const cursorX = event.clientX - bounds.left;
    const cursorY = event.clientY - bounds.top;

    setViewport((current) => {
      const nextScale = clampScale(
        current.scale * (event.deltaY > 0 ? 0.92 : 1.08),
      );
      const ratio = nextScale / current.scale;
      return {
        scale: nextScale,
        x: cursorX - (cursorX - current.x) * ratio,
        y: cursorY - (cursorY - current.y) * ratio,
      };
    });
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: viewport.x,
      originY: viewport.y,
    };
    setIsDragging(true);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    setViewport((current) => ({
      ...current,
      x: drag.originX + event.clientX - drag.startX,
      y: drag.originY + event.clientY - drag.startY,
    }));
  };

  const stopDragging = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    dragRef.current = null;
    setIsDragging(false);
  };

  return (
    <Card className="infinite-canvas-card">
      <header className="infinite-canvas-header">
        <div>
          <span className="infinite-canvas-kicker">Canvas</span>
          <h3>无限画布</h3>
        </div>
        <div className="infinite-canvas-controls" aria-label="画布缩放控制">
          <button
            onClick={() => zoomBy(-SCALE_STEP)}
            title="缩小"
            aria-label="缩小"
          >
            <Minus size={14} />
          </button>
          <output aria-label="当前缩放比例">
            {Math.round(viewport.scale * 100)}%
          </output>
          <button
            onClick={() => zoomBy(SCALE_STEP)}
            title="放大"
            aria-label="放大"
          >
            <Plus size={14} />
          </button>
          <button
            onClick={() => setViewport(INITIAL_VIEWPORT)}
            title="复位画布"
            aria-label="复位画布"
          >
            <LocateFixed size={14} />
          </button>
        </div>
      </header>

      <div
        className={`infinite-canvas-viewport${isDragging ? ' is-dragging' : ''}`}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopDragging}
        onPointerCancel={stopDragging}
        role="application"
        aria-label="无限画布，占位内容，可拖拽平移并使用滚轮缩放"
      >
        <div
          className="infinite-canvas-world"
          style={{
            transform: `translate3d(${viewport.x}px, ${viewport.y}px, 0) scale(${viewport.scale})`,
          }}
        >
          <div className="canvas-placeholder canvas-placeholder--primary">
            <span />
            <strong>内容占位</strong>
            <i />
            <i />
          </div>
          <div className="canvas-placeholder canvas-placeholder--note">
            <span />
            <i />
            <i />
          </div>
          <div className="canvas-placeholder canvas-placeholder--compact">
            <span />
            <i />
          </div>
          <svg
            className="canvas-connector"
            viewBox="0 0 260 110"
            aria-hidden="true"
          >
            <path d="M 5 55 C 75 55, 82 10, 140 10 S 190 92, 255 92" />
          </svg>
        </div>
        <div className="infinite-canvas-hint" aria-hidden="true">
          拖拽探索
        </div>
      </div>
    </Card>
  );
};

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import {
  BrowserAdapter,
  DOMAdapter,
} from '@infinite-canvas-tutorial/ecs';
import { LocateFixed, Minus, Plus } from 'lucide-react';
import './InfiniteCanvasView.css';

DOMAdapter.set(BrowserAdapter);

const MIN_ZOOM = 0.35;
const MAX_ZOOM = 2.2;
const ZOOM_STEP = 1.12;

const isInteractiveTarget = (target: EventTarget | null) =>
  target instanceof Element &&
  Boolean(
    target.closest('.infinite-canvas-item, .infinite-canvas-controls'),
  );

export interface InfiniteCanvasItem {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  content: ReactNode;
}

interface InfiniteCanvasViewProps {
  items: InfiniteCanvasItem[];
}

export const InfiniteCanvasView = ({ items }: InfiniteCanvasViewProps) => {
  const shellRef = useRef<HTMLDivElement>(null);
  const [camera, setCamera] = useState({ x: -80, y: -64, zoom: 0.9 });
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    cameraX: number;
    cameraY: number;
  } | null>(null);

  const getInitialCamera = () => ({
    x: -80,
    y: -64,
    zoom: window.innerWidth < 768 ? 0.72 : 0.9,
  });

  const zoomAtCenter = (factor: number) => {
    const shell = shellRef.current;
    if (!shell) return;
    const centerX = shell.clientWidth / 2;
    const centerY = shell.clientHeight / 2;
    setCamera((current) => {
      const zoom = Math.min(
        MAX_ZOOM,
        Math.max(MIN_ZOOM, current.zoom * factor),
      );
      const canvasX = centerX / current.zoom + current.x;
      const canvasY = centerY / current.zoom + current.y;
      return {
        x: canvasX - centerX / zoom,
        y: canvasY - centerY / zoom,
        zoom,
      };
    });
  };

  const handleWheel = useCallback((event: WheelEvent) => {
    if (isInteractiveTarget(event.target)) return;
    const shell = shellRef.current;
    if (!shell) return;
    event.preventDefault();
    const bounds = shell.getBoundingClientRect();
    const pointerX = event.clientX - bounds.left;
    const pointerY = event.clientY - bounds.top;
    setCamera((current) => {
      const zoom = Math.min(
        MAX_ZOOM,
        Math.max(
          MIN_ZOOM,
          current.zoom * (event.deltaY > 0 ? 0.92 : 1.08),
        ),
      );
      const canvasX = pointerX / current.zoom + current.x;
      const canvasY = pointerY / current.zoom + current.y;
      return {
        x: canvasX - pointerX / zoom,
        y: canvasY - pointerY / zoom,
        zoom,
      };
    });
  }, []);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || isInteractiveTarget(event.target)) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      cameraX: camera.x,
      cameraY: camera.y,
    };
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    setCamera((current) => ({
      ...current,
      x: drag.cameraX - (event.clientX - drag.startX) / current.zoom,
      y: drag.cameraY - (event.clientY - drag.startY) / current.zoom,
    }));
  };

  const handlePointerEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId === event.pointerId) dragRef.current = null;
  };

  useEffect(() => {
    const environment = DOMAdapter.get();
    const shell = shellRef.current;
    const frame = environment.requestAnimationFrame(() => {
      const initialZoom = environment.getWindow().innerWidth < 768 ? 0.72 : 0.9;
      setCamera({ x: -80, y: -64, zoom: initialZoom });
    });
    shell?.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      environment.cancelAnimationFrame(frame);
      shell?.removeEventListener('wheel', handleWheel);
    };
  }, [handleWheel]);

  return (
    <div
      ref={shellRef}
      className="infinite-canvas-shell"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
    >
      <div
        className="infinite-canvas-surface"
        role="application"
        aria-label="无限画布，可拖拽平移并使用滚轮缩放"
      />
      <div
        className="infinite-canvas-items"
        style={{
          transform: `scale(${camera.zoom}) translate(${-camera.x}px, ${-camera.y}px)`,
        }}
      >
        {items.map((item) => (
          <div
            className="infinite-canvas-item"
            key={item.id}
            style={{
              left: item.x,
              top: item.y,
              width: item.width,
              height: item.height,
            }}
          >
            {item.content}
          </div>
        ))}
      </div>
      <div className="infinite-canvas-help" aria-hidden="true">
        拖拽移动 · 滚轮缩放
      </div>
      <div className="infinite-canvas-controls" aria-label="画布缩放控制">
        <button
          type="button"
          onClick={() => zoomAtCenter(1 / ZOOM_STEP)}
          disabled={camera.zoom <= MIN_ZOOM}
          title="缩小画布"
          aria-label="缩小画布"
        >
          <Minus size={15} />
        </button>
        <button
          type="button"
          className="infinite-canvas-scale"
          disabled
          aria-label={`当前画布比例 ${Math.round(camera.zoom * 100)}%`}
        >
          {Math.round(camera.zoom * 100)}%
        </button>
        <button
          type="button"
          onClick={() => zoomAtCenter(ZOOM_STEP)}
          disabled={camera.zoom >= MAX_ZOOM}
          title="放大画布"
          aria-label="放大画布"
        >
          <Plus size={15} />
        </button>
        <button
          type="button"
          onClick={() => setCamera(getInitialCamera())}
          title="重置画布"
          aria-label="重置画布"
        >
          <LocateFixed size={15} />
        </button>
      </div>
    </div>
  );
};

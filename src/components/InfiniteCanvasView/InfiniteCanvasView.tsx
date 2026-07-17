import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  App,
  CheckboardStyle,
  DefaultPlugins,
  Pen,
} from '@infinite-canvas-tutorial/ecs';
import {
  Event,
  UIPlugin,
  type ExtendedAPI,
} from '@infinite-canvas-tutorial/webcomponents';
import '@infinite-canvas-tutorial/webcomponents/spectrum';
import { LocateFixed, Minus, Pencil, Plus } from 'lucide-react';
import './InfiniteCanvasView.css';

declare global {
  var __indexPageInfiniteCanvasApp__: Promise<App> | undefined;
}

const MIN_ZOOM = 0.35;
const MAX_ZOOM = 2.2;
const ZOOM_STEP = 1.12;

const startInfiniteCanvasApp = () => {
  globalThis.__indexPageInfiniteCanvasApp__ ??= new App()
    .addPlugins(...DefaultPlugins, UIPlugin)
    .run();
  return globalThis.__indexPageInfiniteCanvasApp__;
};

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

interface CameraState {
  x: number;
  y: number;
  zoom: number;
}

export const InfiniteCanvasView = ({ items }: InfiniteCanvasViewProps) => {
  const canvasRef = useRef<HTMLElementTagNameMap['ic-spectrum-canvas']>(null);
  const apiRef = useRef<ExtendedAPI | null>(null);
  const initialCamera = useMemo<CameraState>(
    () => ({ x: -80, y: -64, zoom: window.innerWidth < 768 ? 0.72 : 0.9 }),
    [],
  );
  const [camera, setCamera] = useState(initialCamera);
  const [selectedPen, setSelectedPen] = useState<Pen>(Pen.HAND);
  const [isReady, setIsReady] = useState(false);

  const initialAppState = useMemo(
    () =>
      JSON.stringify({
        cameraX: initialCamera.x,
        cameraY: initialCamera.y,
        cameraZoom: initialCamera.zoom,
        cameraZoomFactor: 0.08,
        checkboardStyle: CheckboardStyle.DOTS,
        contextBarVisible: false,
        contextMenuVisible: false,
        penbarVisible: false,
        penbarSelected: Pen.HAND,
        taskbarVisible: false,
        topbarVisible: false,
      }),
    [initialCamera],
  );

  const updateCamera = (next: CameraState) => {
    apiRef.current?.setAppState({
      cameraX: next.x,
      cameraY: next.y,
      cameraZoom: next.zoom,
    });
  };

  const zoomAtCenter = (factor: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const centerX = canvas.clientWidth / 2;
    const centerY = canvas.clientHeight / 2;
    const zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, camera.zoom * factor));
    const canvasX = centerX / camera.zoom + camera.x;
    const canvasY = centerY / camera.zoom + camera.y;
    updateCamera({
      x: canvasX - centerX / zoom,
      y: canvasY - centerY / zoom,
      zoom,
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleReady = (event: HTMLElementEventMap[typeof Event.READY]) => {
      apiRef.current = event.detail;
      setIsReady(true);
      setCamera({ ...initialCamera });
    };
    const handlePosition = (
      event: HTMLElementEventMap[typeof Event.CAMERA_POSITION_CHANGED],
    ) => setCamera((current) => ({ ...current, ...event.detail }));
    const handleZoom = (
      event: HTMLElementEventMap[typeof Event.CAMERA_ZOOM_CHANGED],
    ) => setCamera((current) => ({ ...current, zoom: event.detail.zoom }));
    const handlePencilDrawn = () => setSelectedPen(Pen.SELECT);

    canvas.addEventListener(Event.READY, handleReady);
    canvas.addEventListener(Event.CAMERA_POSITION_CHANGED, handlePosition);
    canvas.addEventListener(Event.CAMERA_ZOOM_CHANGED, handleZoom);
    canvas.addEventListener(Event.PENCIL_DRAWN, handlePencilDrawn);
    void startInfiniteCanvasApp().catch((error: unknown) => {
      console.error('Failed to start the WebGL infinite canvas.', error);
    });

    return () => {
      apiRef.current = null;
      setIsReady(false);
      canvas.removeEventListener(Event.READY, handleReady);
      canvas.removeEventListener(Event.CAMERA_POSITION_CHANGED, handlePosition);
      canvas.removeEventListener(Event.CAMERA_ZOOM_CHANGED, handleZoom);
      canvas.removeEventListener(Event.PENCIL_DRAWN, handlePencilDrawn);
    };
  }, [initialCamera]);

  const togglePencil = () => {
    const pen = selectedPen === Pen.PENCIL ? Pen.HAND : Pen.PENCIL;
    apiRef.current?.setAppState({ penbarSelected: pen });
    setSelectedPen(pen);
  };

  return (
    <div className="infinite-canvas-shell">
      <ic-spectrum-canvas
        ref={canvasRef}
        className="infinite-canvas-surface"
        renderer="webgl"
        app-state={initialAppState}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
        }}
        aria-label="WebGL 无限画布，可拖拽平移并使用滚轮缩放"
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
        {selectedPen === Pen.PENCIL ? '拖拽绘制 · 点击画笔退出' : '拖拽移动 · 滚轮缩放'}
      </div>
      <div className="infinite-canvas-controls" aria-label="画布控制">
        <button
          type="button"
          onClick={() => zoomAtCenter(1 / ZOOM_STEP)}
          disabled={!isReady || camera.zoom <= MIN_ZOOM}
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
          disabled={!isReady || camera.zoom >= MAX_ZOOM}
          title="放大画布"
          aria-label="放大画布"
        >
          <Plus size={15} />
        </button>
        <button
          type="button"
          onClick={() => updateCamera(initialCamera)}
          disabled={!isReady}
          title="重置画布"
          aria-label="重置画布"
        >
          <LocateFixed size={15} />
        </button>
        <button
          type="button"
          className={selectedPen === Pen.PENCIL ? 'is-active' : undefined}
          onClick={togglePencil}
          disabled={!isReady}
          title={selectedPen === Pen.PENCIL ? '退出画笔' : '画笔'}
          aria-label={selectedPen === Pen.PENCIL ? '退出画笔' : '画笔'}
          aria-pressed={selectedPen === Pen.PENCIL}
        >
          <Pencil size={15} />
        </button>
      </div>
    </div>
  );
};

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  App,
  CheckboardStyle,
  DefaultPlugins,
  Pen,
  ThemeMode as CanvasThemeMode,
} from '@infinite-canvas-tutorial/ecs';
import {
  Event,
  UIPlugin,
  type ExtendedAPI,
} from '@infinite-canvas-tutorial/webcomponents';
import '@infinite-canvas-tutorial/webcomponents/spectrum';
import {
  ArrowUpRight,
  Bold,
  Circle,
  CircleDashed,
  Eraser,
  Hand,
  Image,
  Italic,
  LocateFixed,
  Minus,
  MousePointer2,
  Pencil,
  Plus,
  Slash,
  Square,
  SquareDashed,
  Type,
  type LucideIcon,
} from 'lucide-react';
import { useTheme } from '../../hooks/themeContext';
import './InfiniteCanvasView.css';

declare global {
  var __indexPageInfiniteCanvasApp__: Promise<App> | undefined;
}

const MIN_ZOOM = 0.35;
const MAX_ZOOM = 2.2;
const ZOOM_STEP = 1.12;

const toColorInputValue = (value: unknown, fallback: string) => {
  if (typeof value !== 'string') return fallback;
  if (/^#[\da-f]{6}$/i.test(value)) return value;
  const shorthand = value.match(/^#([\da-f])([\da-f])([\da-f])$/i);
  return shorthand
    ? `#${shorthand[1]}${shorthand[1]}${shorthand[2]}${shorthand[2]}${shorthand[3]}${shorthand[3]}`
    : fallback;
};

interface TextPenSettings {
  fontFamily: string;
  fontSize: number;
  fontStyle: 'normal' | 'italic';
  fontWeight: number;
  fill: string;
}

interface PencilPenSettings {
  stroke: string;
  strokeWidth: number;
  strokeOpacity: number;
  freehand: boolean;
}

interface PenOption {
  pen: Pen;
  label: string;
  icon: LucideIcon;
}

const PEN_OPTIONS: PenOption[] = [
  { pen: Pen.HAND, label: '移动画布', icon: Hand },
  { pen: Pen.SELECT, label: '选择', icon: MousePointer2 },
  { pen: Pen.DRAW_RECT, label: '矩形', icon: Square },
  { pen: Pen.DRAW_ELLIPSE, label: '椭圆', icon: Circle },
  { pen: Pen.DRAW_LINE, label: '直线', icon: Slash },
  { pen: Pen.DRAW_ARROW, label: '箭头', icon: ArrowUpRight },
  { pen: Pen.DRAW_ROUGH_RECT, label: '手绘矩形', icon: SquareDashed },
  { pen: Pen.DRAW_ROUGH_ELLIPSE, label: '手绘椭圆', icon: CircleDashed },
  { pen: Pen.IMAGE, label: '图片', icon: Image },
  { pen: Pen.TEXT, label: '文本', icon: Type },
  { pen: Pen.PENCIL, label: '画笔', icon: Pencil },
  { pen: Pen.ERASER, label: '橡皮擦', icon: Eraser },
  // { pen: Pen.COMMENT, label: '评论', icon: MessageCircle },
];

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
  const { mode } = useTheme();
  const shellRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLElementTagNameMap['ic-spectrum-canvas']>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const apiRef = useRef<ExtendedAPI | null>(null);
  const initialCamera = useMemo<CameraState>(
    () => ({ x: -80, y: -64, zoom: window.innerWidth < 768 ? 0.72 : 0.9 }),
    [],
  );
  const [camera, setCamera] = useState(initialCamera);
  const [selectedPen, setSelectedPen] = useState<Pen>(Pen.HAND);
  const [isReady, setIsReady] = useState(false);
  const [textSettings, setTextSettings] = useState<TextPenSettings>({
    fontFamily: 'system-ui',
    fontSize: 16,
    fontStyle: 'normal',
    fontWeight: 400,
    fill: '#000000',
  });
  const [pencilSettings, setPencilSettings] = useState<PencilPenSettings>({
    stroke: '#000000',
    strokeWidth: 1,
    strokeOpacity: 1,
    freehand: false,
  });
  const canvasThemeMode =
    mode === 'dark' ? CanvasThemeMode.DARK : CanvasThemeMode.LIGHT;

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
        themeMode: canvasThemeMode,
        penbarVisible: false,
        penbarSelected: Pen.HAND,
        taskbarVisible: false,
        topbarVisible: false,
      }),
    [canvasThemeMode, initialCamera],
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
      const appState = event.detail.getAppState();
      setTextSettings((current) => ({
        fontFamily: appState.penbarText.fontFamily ?? current.fontFamily,
        fontSize: Number(appState.penbarText.fontSize ?? current.fontSize),
        fontStyle:
          appState.penbarText.fontStyle === 'italic' ? 'italic' : 'normal',
        fontWeight: Number(
          appState.penbarText.fontWeight ?? current.fontWeight,
        ),
        fill: toColorInputValue(appState.penbarText.fill, current.fill),
      }));
      setPencilSettings((current) => ({
        stroke: toColorInputValue(appState.penbarPencil.stroke, current.stroke),
        strokeWidth: Number(
          appState.penbarPencil.strokeWidth ?? current.strokeWidth,
        ),
        strokeOpacity: Number(
          appState.penbarPencil.strokeOpacity ?? current.strokeOpacity,
        ),
        freehand: appState.penbarPencil.freehand ?? current.freehand,
      }));
      setIsReady(true);
      setCamera({ ...initialCamera });
    };
    const handlePosition = (
      event: HTMLElementEventMap[typeof Event.CAMERA_POSITION_CHANGED],
    ) => setCamera((current) => ({ ...current, ...event.detail }));
    const handleZoom = (
      event: HTMLElementEventMap[typeof Event.CAMERA_ZOOM_CHANGED],
    ) => setCamera((current) => ({ ...current, zoom: event.detail.zoom }));
    const handleDrawingFinished = () => setSelectedPen(Pen.SELECT);

    canvas.addEventListener(Event.READY, handleReady);
    canvas.addEventListener(Event.CAMERA_POSITION_CHANGED, handlePosition);
    canvas.addEventListener(Event.CAMERA_ZOOM_CHANGED, handleZoom);
    canvas.addEventListener(Event.RECT_DRAWN, handleDrawingFinished);
    canvas.addEventListener(Event.PENCIL_DRAWN, handleDrawingFinished);
    canvas.addEventListener(Event.COMMENT_ADDED, handleDrawingFinished);
    void startInfiniteCanvasApp().catch((error: unknown) => {
      console.error('Failed to start the WebGL infinite canvas.', error);
    });

    return () => {
      apiRef.current = null;
      setIsReady(false);
      canvas.removeEventListener(Event.READY, handleReady);
      canvas.removeEventListener(Event.CAMERA_POSITION_CHANGED, handlePosition);
      canvas.removeEventListener(Event.CAMERA_ZOOM_CHANGED, handleZoom);
      canvas.removeEventListener(Event.RECT_DRAWN, handleDrawingFinished);
      canvas.removeEventListener(Event.PENCIL_DRAWN, handleDrawingFinished);
      canvas.removeEventListener(Event.COMMENT_ADDED, handleDrawingFinished);
    };
  }, [initialCamera]);

  useEffect(() => {
    const imageInput = imageInputRef.current;
    if (!imageInput) return;

    const handleCancel = () => {
      apiRef.current?.setAppState({ penbarSelected: Pen.SELECT });
      setSelectedPen(Pen.SELECT);
    };

    imageInput.addEventListener('cancel', handleCancel);
    return () => imageInput.removeEventListener('cancel', handleCancel);
  }, []);

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;

    const handleWheel = (event: WheelEvent) => {
      if (
        (event.target as Element).closest(
          '.infinite-canvas-toolbar, .infinite-canvas-style-controls',
        )
      )
        return;

      const api = apiRef.current;
      if (!api || event.deltaY === 0) return;

      event.preventDefault();
      event.stopPropagation();

      const rect = shell.getBoundingClientRect();
      const viewportX = event.clientX - rect.left;
      const viewportY = event.clientY - rect.top;
      const current = api.getAppState();
      const delta =
        event.deltaMode === WheelEvent.DOM_DELTA_LINE
          ? event.deltaY * 16
          : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
            ? event.deltaY * shell.clientHeight
            : event.deltaY;
      const zoom = Math.min(
        MAX_ZOOM,
        Math.max(MIN_ZOOM, current.cameraZoom * Math.exp(-delta * 0.0015)),
      );
      const canvasX = viewportX / current.cameraZoom + current.cameraX;
      const canvasY = viewportY / current.cameraZoom + current.cameraY;

      api.setAppState({
        cameraX: canvasX - viewportX / zoom,
        cameraY: canvasY - viewportY / zoom,
        cameraZoom: zoom,
      });
    };

    shell.addEventListener('wheel', handleWheel, {
      capture: true,
      passive: false,
    });
    return () => shell.removeEventListener('wheel', handleWheel, true);
  }, []);

  useEffect(() => {
    if (!isReady) return;
    apiRef.current?.setAppState({ themeMode: canvasThemeMode });
  }, [canvasThemeMode, isReady]);

  const selectPen = (pen: Pen) => {
    apiRef.current?.setAppState({ penbarSelected: pen });
    setSelectedPen(pen);

    if (pen === Pen.IMAGE) {
      imageInputRef.current?.click();
    }
  };

  const updateTextSettings = (patch: Partial<TextPenSettings>) => {
    setTextSettings((current) => ({ ...current, ...patch }));
    const api = apiRef.current;
    if (!api) return;
    api.setAppState({
      penbarText: { ...api.getAppState().penbarText, ...patch },
    });
  };

  const updatePencilSettings = (patch: Partial<PencilPenSettings>) => {
    setPencilSettings((current) => ({ ...current, ...patch }));
    const api = apiRef.current;
    if (!api) return;
    api.setAppState({
      penbarPencil: { ...api.getAppState().penbarPencil, ...patch },
    });
  };

  const insertImage = async (file: File) => {
    const api = apiRef.current;
    const canvas = canvasRef.current;
    if (!api || !canvas) return;

    const position = api.viewport2Canvas({
      x: canvas.clientWidth / 2,
      y: canvas.clientHeight / 2,
    });

    try {
      await api.createImageFromFile(file, { position });
      api.record();
    } catch (error: unknown) {
      console.error('Failed to add an image to the infinite canvas.', error);
    } finally {
      selectPen(Pen.SELECT);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  const selectedPenLabel =
    PEN_OPTIONS.find(({ pen }) => pen === selectedPen)?.label ?? '画布工具';

  return (
    <div ref={shellRef} className="infinite-canvas-shell">
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
      <input
        ref={imageInputRef}
        className="infinite-canvas-file-input"
        type="file"
        accept=".jpg,.jpeg,.png,.svg,.webp,image/jpeg,image/png,image/svg+xml,image/webp"
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          if (file) void insertImage(file);
        }}
        tabIndex={-1}
        aria-hidden="true"
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
        {selectedPen === Pen.HAND
          ? '拖拽移动 · 滚轮缩放'
          : `当前工具：${selectedPenLabel}`}
      </div>
      {selectedPen === Pen.TEXT && (
        <div className="infinite-canvas-style-controls" aria-label="文本样式">
          <label className="infinite-canvas-select-control">
            <span>字体</span>
            <select
              value={textSettings.fontFamily}
              onChange={(event) =>
                updateTextSettings({ fontFamily: event.target.value })
              }
              aria-label="字体"
            >
              <option value="system-ui">系统</option>
              <option value="serif">衬线</option>
              <option value="monospace">等宽</option>
            </select>
          </label>
          <label className="infinite-canvas-range-control">
            <span>字号</span>
            <input
              type="range"
              min="8"
              max="96"
              step="1"
              value={textSettings.fontSize}
              onChange={(event) =>
                updateTextSettings({ fontSize: Number(event.target.value) })
              }
            />
            <output>{textSettings.fontSize}</output>
          </label>
          <div className="infinite-canvas-style-toggles">
            <button
              type="button"
              className={
                textSettings.fontWeight >= 700 ? 'is-active' : undefined
              }
              onClick={() =>
                updateTextSettings({
                  fontWeight: textSettings.fontWeight >= 700 ? 400 : 700,
                })
              }
              title="粗体"
              aria-label="粗体"
              aria-pressed={textSettings.fontWeight >= 700}
            >
              <Bold size={14} />
            </button>
            <button
              type="button"
              className={
                textSettings.fontStyle === 'italic' ? 'is-active' : undefined
              }
              onClick={() =>
                updateTextSettings({
                  fontStyle:
                    textSettings.fontStyle === 'italic' ? 'normal' : 'italic',
                })
              }
              title="斜体"
              aria-label="斜体"
              aria-pressed={textSettings.fontStyle === 'italic'}
            >
              <Italic size={14} />
            </button>
          </div>
          <label className="infinite-canvas-color-control" title="文本颜色">
            <span>颜色</span>
            <input
              type="color"
              value={textSettings.fill}
              onChange={(event) =>
                updateTextSettings({ fill: event.target.value })
              }
              aria-label="文本颜色"
            />
          </label>
        </div>
      )}
      {selectedPen === Pen.PENCIL && (
        <div className="infinite-canvas-style-controls" aria-label="画笔样式">
          <label className="infinite-canvas-color-control" title="画笔颜色">
            <span>颜色</span>
            <input
              type="color"
              value={pencilSettings.stroke}
              onChange={(event) =>
                updatePencilSettings({ stroke: event.target.value })
              }
              aria-label="画笔颜色"
            />
          </label>
          <label className="infinite-canvas-range-control">
            <span>粗细</span>
            <input
              type="range"
              min="1"
              max="48"
              step="1"
              value={pencilSettings.strokeWidth}
              onChange={(event) =>
                updatePencilSettings({
                  strokeWidth: Number(event.target.value),
                })
              }
            />
            <output>{pencilSettings.strokeWidth}px</output>
          </label>
          <label className="infinite-canvas-range-control">
            <span>透明度</span>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={pencilSettings.strokeOpacity}
              onChange={(event) =>
                updatePencilSettings({
                  strokeOpacity: Number(event.target.value),
                })
              }
            />
            <output>{Math.round(pencilSettings.strokeOpacity * 100)}%</output>
          </label>
          <label className="infinite-canvas-switch-control">
            <input
              type="checkbox"
              checked={pencilSettings.freehand}
              onChange={(event) =>
                updatePencilSettings({ freehand: event.target.checked })
              }
            />
            <span>自由笔触</span>
          </label>
        </div>
      )}
      <div className="infinite-canvas-toolbar" aria-label="画布控制">
        <div className="infinite-canvas-view-controls" aria-label="视图控制">
          <button
            type="button"
            onClick={() => zoomAtCenter(1 / ZOOM_STEP)}
            disabled={!isReady || camera.zoom <= MIN_ZOOM}
            title="缩小画布"
            aria-label="缩小画布"
          >
            <Minus size={15} />
          </button>
          <output
            className="infinite-canvas-scale"
            aria-label={`当前画布比例 ${Math.round(camera.zoom * 100)}%`}
          >
            {Math.round(camera.zoom * 100)}%
          </output>
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
        </div>
        <div className="infinite-canvas-pen-controls" aria-label="绘图工具">
          {PEN_OPTIONS.map(({ pen, label, icon: Icon }) => (
            <button
              type="button"
              key={pen}
              className={selectedPen === pen ? 'is-active' : undefined}
              onClick={() => selectPen(pen)}
              disabled={!isReady}
              title={label}
              aria-label={label}
              aria-pressed={selectedPen === pen}
            >
              <Icon size={15} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

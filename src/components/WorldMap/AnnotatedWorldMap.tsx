import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties, KeyboardEvent, PointerEvent, ReactElement } from 'react';
import worldMapDarkImageUrl from './assets/map.svg';
import worldMapLightImageUrl from './assets/map-light.svg';
import {
  MAP_ZOOM_STEP,
  MAX_MAP_SCALE,
  MIN_MAP_SCALE,
  blitMapLayerCache,
  buildMapLayerCache,
  clampNumber,
  constrainViewportTransform,
  getMapCanvasInteractionMetrics,
  getMapCanvasRenderMetrics,
  hitTestMarkerAtScreen,
  mapCoordinateToScreen,
  paintAnnotatedWorldMap,
  paintMapMarkers,
  projectMapCoordinate,
  readMapCanvasPalette,
} from './canvasMap';
import type { MapCanvasPalette, MapCanvasRenderMetrics, ViewportTransform } from './canvasMap';
import type { AnnotatedWorldMapProps, CanvasWorldMapMarker } from './canvasTypes';
import './AnnotatedWorldMap.css';

/** 底图离屏缓存失效判断键 */
interface MapLayerCacheKey {
  cssWidth: number;
  cssHeight: number;
  scale: number;
  domesticRouteCount: number;
  internationalRouteCount: number;
}

/** 拖拽指针状态 */
interface MapDragState {
  pointerId: number;
  startClientX: number;
  startClientY: number;
  startViewportX: number;
  startViewportY: number;
}

/** 扩展 Props：支持受控视口与主题 */
export interface AnnotatedWorldMapCanvasProps extends AnnotatedWorldMapProps {
  /** 当前生效的主题模式，用于切换底图 SVG */
  themeMode: 'light' | 'dark';
  /** 受控视口状态 */
  viewportTransform?: ViewportTransform;
  /** 视口变化回调 */
  onViewportTransformChange?: (next: ViewportTransform) => void;
}

/**
 * 统计各范围航迹数量
 */
const countRoutesByScope = (
  routes: AnnotatedWorldMapProps['routes'],
): { domesticRouteCount: number; internationalRouteCount: number } => {
  let domesticRouteCount = 0;
  let internationalRouteCount = 0;

  routes?.forEach((route): void => {
    if (route.scope === 'domestic') {
      domesticRouteCount += 1;
      return;
    }
    internationalRouteCount += 1;
  });

  return { domesticRouteCount, internationalRouteCount };
};

/**
 * 按主题返回底图 SVG URL
 */
const resolveWorldMapImageUrl = (mode: 'light' | 'dark'): string => {
  return mode === 'light' ? worldMapLightImageUrl : worldMapDarkImageUrl;
};

/**
 * 加载 SVG 为 Canvas 可用位图
 */
const loadWorldMapImage = (imageUrl: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject): void => {
    const image = new Image();

    image.onload = (): void => {
      resolve(image);
    };
    image.onerror = (): void => {
      reject(new Error('世界地图 SVG 加载失败'));
    };
    image.src = imageUrl;
  });
};

export const AnnotatedWorldMap = ({
  markers,
  routes = [],
  ariaLabel,
  className,
  themeMode,
  viewportTransform: controlledViewport,
  onViewportTransformChange,
}: AnnotatedWorldMapCanvasProps): ReactElement => {
  const [hoveredMarker, setHoveredMarker] = useState<CanvasWorldMapMarker | null>(null);
  const [focusedMarkerIndex, setFocusedMarkerIndex] = useState<number | null>(null);
  const [internalViewport, setInternalViewport] = useState<ViewportTransform>({
    scale: MIN_MAP_SCALE,
    x: 0,
    y: 0,
  });
  const [isDraggingMap, setIsDraggingMap] = useState(false);
  const [containerSize, setContainerSize] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });
  const [isWorldMapImageReady, setIsWorldMapImageReady] = useState(false);

  const dragStateRef = useRef<MapDragState | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapCanvasRef = useRef<HTMLCanvasElement>(null);
  const worldMapImageRef = useRef<HTMLImageElement | null>(null);
  const viewportTransformRef = useRef<ViewportTransform>(internalViewport);
  const redrawMapCanvasRef = useRef<() => void>(() => undefined);
  const pendingRedrawFrameRef = useRef<number | null>(null);
  const mapLayerCacheRef = useRef<HTMLCanvasElement | null>(null);
  const mapLayerCacheKeyRef = useRef<MapLayerCacheKey | null>(null);
  const mapCanvasMetricsRef = useRef<MapCanvasRenderMetrics | null>(null);
  const mapCanvasPaletteRef = useRef<MapCanvasPalette | null>(null);
  const isMapPanInteractingRef = useRef(false);

  const viewportTransform = controlledViewport ?? internalViewport;
  const { domesticRouteCount, internationalRouteCount } = countRoutesByScope(routes);
  const isMapZoomed = viewportTransform.scale > MIN_MAP_SCALE;
  const focusedMarker = focusedMarkerIndex === null ? null : (markers[focusedMarkerIndex] ?? null);
  const tooltipMarker = hoveredMarker ?? focusedMarker;
  const activeMarker = tooltipMarker;
  const tooltipMarkerPosition =
    tooltipMarker === null ? null : projectMapCoordinate(tooltipMarker.coordinate);
  const tooltipScreenPosition =
    tooltipMarkerPosition === null || containerSize.width === 0
      ? null
      : mapCoordinateToScreen(
          tooltipMarkerPosition.left,
          tooltipMarkerPosition.top,
          viewportTransform,
          containerSize.width,
          containerSize.height,
        );
  const markerTooltipStyle: CSSProperties | undefined =
    tooltipScreenPosition === null
      ? undefined
      : {
          left: `${tooltipScreenPosition.left}px`,
          top: `${tooltipScreenPosition.top}px`,
        };
  const focusedMarkerId = focusedMarker?.id ?? null;
  const mapClassName = [
    'annotated-world-map',
    className,
    isMapZoomed ? 'annotated-world-map--zoomed' : '',
    isDraggingMap ? 'annotated-world-map--dragging' : '',
  ]
    .filter(Boolean)
    .join(' ');

  useEffect((): void => {
    viewportTransformRef.current = viewportTransform;
  }, [viewportTransform]);

  /** 更新视口（受控 / 非受控） */
  const updateViewport = useCallback(
    (updater: (current: ViewportTransform) => ViewportTransform): void => {
      const next = updater(viewportTransformRef.current);
      viewportTransformRef.current = next;
      if (onViewportTransformChange) {
        onViewportTransformChange(next);
      } else {
        setInternalViewport(next);
      }
    },
    [onViewportTransformChange],
  );

  useEffect((): (() => void) | undefined => {
    let isCancelled = false;

    worldMapImageRef.current = null;
    mapLayerCacheRef.current = null;
    mapLayerCacheKeyRef.current = null;

    const loadImage = async (): Promise<void> => {
      try {
        const image = await loadWorldMapImage(resolveWorldMapImageUrl(themeMode));

        if (isCancelled) {
          return;
        }

        if (typeof image.decode === 'function') {
          await image.decode();
        }

        if (isCancelled) {
          return;
        }

        worldMapImageRef.current = image;
        setIsWorldMapImageReady(true);
      } catch {
        if (!isCancelled) {
          worldMapImageRef.current = null;
          setIsWorldMapImageReady(false);
        }
      }
    };

    void loadImage();

    return (): void => {
      isCancelled = true;
    };
  }, [themeMode]);

  useEffect((): (() => void) | undefined => {
    const container = mapContainerRef.current;

    if (container === null) {
      return undefined;
    }

    const updateContainerSize = (): void => {
      const rect = container.getBoundingClientRect();
      setContainerSize({ width: rect.width, height: rect.height });
    };

    updateContainerSize();
    const resizeObserver = new ResizeObserver((): void => {
      updateContainerSize();
    });
    resizeObserver.observe(container);

    return (): void => {
      resizeObserver.disconnect();
    };
  }, []);

  const isMapLayerCacheFresh = useCallback((): boolean => {
    const cacheKey = mapLayerCacheKeyRef.current;

    if (cacheKey === null || mapLayerCacheRef.current === null) {
      return false;
    }

    return (
      cacheKey.cssWidth === containerSize.width &&
      cacheKey.cssHeight === containerSize.height &&
      cacheKey.scale === viewportTransformRef.current.scale &&
      cacheKey.domesticRouteCount === domesticRouteCount &&
      cacheKey.internationalRouteCount === internationalRouteCount
    );
  }, [containerSize.height, containerSize.width, domesticRouteCount, internationalRouteCount]);

  const ensureMapLayerCache = useCallback((): void => {
    const container = mapContainerRef.current;
    const worldMapImage = worldMapImageRef.current;
    const viewportScale = viewportTransformRef.current.scale;

    if (
      container === null ||
      worldMapImage === null ||
      !isWorldMapImageReady ||
      viewportScale <= MIN_MAP_SCALE ||
      containerSize.width <= 0 ||
      containerSize.height <= 0 ||
      isMapLayerCacheFresh()
    ) {
      return;
    }

    const palette = mapCanvasPaletteRef.current ?? readMapCanvasPalette(container);
    mapCanvasPaletteRef.current = palette;
    mapLayerCacheRef.current = buildMapLayerCache(
      worldMapImage,
      routes,
      palette,
      containerSize.width,
      containerSize.height,
      viewportScale,
    );
    mapLayerCacheKeyRef.current = {
      cssWidth: containerSize.width,
      cssHeight: containerSize.height,
      scale: viewportScale,
      domesticRouteCount,
      internationalRouteCount,
    };
  }, [
    containerSize.height,
    containerSize.width,
    domesticRouteCount,
    internationalRouteCount,
    isMapLayerCacheFresh,
    isWorldMapImageReady,
    routes,
  ]);

  const applyMapCanvasMetrics = (
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D,
    metrics: MapCanvasRenderMetrics,
  ): void => {
    const previousMetrics = mapCanvasMetricsRef.current;

    if (
      previousMetrics === null ||
      previousMetrics.pixelWidth !== metrics.pixelWidth ||
      previousMetrics.pixelHeight !== metrics.pixelHeight ||
      previousMetrics.cssWidth !== metrics.cssWidth ||
      previousMetrics.cssHeight !== metrics.cssHeight
    ) {
      canvas.width = metrics.pixelWidth;
      canvas.height = metrics.pixelHeight;
      canvas.style.width = `${metrics.cssWidth}px`;
      canvas.style.height = `${metrics.cssHeight}px`;
      mapCanvasMetricsRef.current = metrics;
    }

    context.setTransform(metrics.pixelRatio, 0, 0, metrics.pixelRatio, 0, 0);
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
  };

  const redrawMapCanvas = useCallback((): void => {
    const canvas = mapCanvasRef.current;
    const container = mapContainerRef.current;
    const worldMapImage = worldMapImageRef.current;

    if (
      canvas === null ||
      container === null ||
      !isWorldMapImageReady ||
      worldMapImage === null ||
      containerSize.width <= 0 ||
      containerSize.height <= 0
    ) {
      return;
    }

    const devicePixelRatio = window.devicePixelRatio || 1;
    const isPanInteracting = isMapPanInteractingRef.current;
    const metrics = isPanInteracting
      ? getMapCanvasInteractionMetrics(
          containerSize.width,
          containerSize.height,
          devicePixelRatio,
        )
      : getMapCanvasRenderMetrics(
          containerSize.width,
          containerSize.height,
          viewportTransformRef.current.scale,
          devicePixelRatio,
        );
    const context = canvas.getContext('2d');

    if (context === null) {
      return;
    }

    applyMapCanvasMetrics(canvas, context, metrics);

    const palette = mapCanvasPaletteRef.current ?? readMapCanvasPalette(container);
    mapCanvasPaletteRef.current = palette;

    const viewport = viewportTransformRef.current;
    const layerCache = mapLayerCacheRef.current;
    const canUseLayerCache =
      isPanInteracting &&
      viewport.scale > MIN_MAP_SCALE &&
      layerCache !== null &&
      isMapLayerCacheFresh();

    if (canUseLayerCache) {
      blitMapLayerCache(context, layerCache, viewport, metrics.cssWidth, metrics.cssHeight);
      paintMapMarkers(
        context,
        markers,
        palette,
        focusedMarkerId,
        metrics.cssWidth,
        metrics.cssHeight,
        viewport,
      );
      return;
    }

    paintAnnotatedWorldMap(
      context,
      worldMapImage,
      markers,
      routes,
      palette,
      focusedMarkerId,
      metrics.cssWidth,
      metrics.cssHeight,
      viewport,
    );

    if (viewport.scale > MIN_MAP_SCALE) {
      mapLayerCacheRef.current = buildMapLayerCache(
        worldMapImage,
        routes,
        palette,
        metrics.cssWidth,
        metrics.cssHeight,
        viewport.scale,
      );
      mapLayerCacheKeyRef.current = {
        cssWidth: metrics.cssWidth,
        cssHeight: metrics.cssHeight,
        scale: viewport.scale,
        domesticRouteCount,
        internationalRouteCount,
      };
      return;
    }

    mapLayerCacheRef.current = null;
    mapLayerCacheKeyRef.current = null;
  }, [
    containerSize.height,
    containerSize.width,
    domesticRouteCount,
    focusedMarkerId,
    internationalRouteCount,
    isMapLayerCacheFresh,
    isWorldMapImageReady,
    markers,
    routes,
  ]);

  useEffect((): void => {
    redrawMapCanvasRef.current = redrawMapCanvas;
  }, [redrawMapCanvas]);

  const scheduleMapRedraw = useCallback((): void => {
    if (pendingRedrawFrameRef.current !== null) {
      return;
    }

    pendingRedrawFrameRef.current = requestAnimationFrame((): void => {
      pendingRedrawFrameRef.current = null;
      redrawMapCanvasRef.current();
    });
  }, []);

  const cancelScheduledMapRedraw = useCallback((): void => {
    if (pendingRedrawFrameRef.current === null) {
      return;
    }

    cancelAnimationFrame(pendingRedrawFrameRef.current);
    pendingRedrawFrameRef.current = null;
  }, []);

  useEffect((): void => {
    redrawMapCanvas();
  }, [redrawMapCanvas, viewportTransform, isWorldMapImageReady]);

  useEffect((): (() => void) => {
    return (): void => {
      cancelScheduledMapRedraw();
    };
  }, [cancelScheduledMapRedraw]);

  const zoomMapFromWheel = useCallback(
    (event: WheelEvent): void => {
      event.preventDefault();
      event.stopPropagation();

      const container = event.currentTarget;

      if (!(container instanceof HTMLDivElement)) {
        return;
      }

      const containerRect = container.getBoundingClientRect();
      const localPointerX = event.clientX - containerRect.left;
      const localPointerY = event.clientY - containerRect.top;
      const scaleMultiplier = event.deltaY < 0 ? MAP_ZOOM_STEP : 1 / MAP_ZOOM_STEP;

      updateViewport((currentViewportTransform): ViewportTransform => {
        const nextScale = clampNumber(
          currentViewportTransform.scale * scaleMultiplier,
          MIN_MAP_SCALE,
          MAX_MAP_SCALE,
        );
        const mapPointX =
          (localPointerX - currentViewportTransform.x) / currentViewportTransform.scale;
        const mapPointY =
          (localPointerY - currentViewportTransform.y) / currentViewportTransform.scale;

        return constrainViewportTransform(
          {
            scale: nextScale,
            x: localPointerX - mapPointX * nextScale,
            y: localPointerY - mapPointY * nextScale,
          },
          containerRect.width,
          containerRect.height,
        );
      });
    },
    [updateViewport],
  );

  useEffect((): (() => void) | undefined => {
    const container = mapContainerRef.current;

    if (container === null) {
      return undefined;
    }

    container.addEventListener('wheel', zoomMapFromWheel, { passive: false });

    return (): void => {
      container.removeEventListener('wheel', zoomMapFromWheel);
    };
  }, [zoomMapFromWheel]);

  const startMapDrag = (event: PointerEvent): void => {
    if (event.button !== 0 || !isMapZoomed) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    dragStateRef.current = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startViewportX: viewportTransform.x,
      startViewportY: viewportTransform.y,
    };
    isMapPanInteractingRef.current = true;
    mapCanvasMetricsRef.current = null;
    ensureMapLayerCache();
    setIsDraggingMap(true);
    setHoveredMarker(null);
    scheduleMapRedraw();
  };

  const dragMap = (event: PointerEvent): void => {
    const dragState = dragStateRef.current;

    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    const nextViewportTransform = constrainViewportTransform(
      {
        scale: viewportTransformRef.current.scale,
        x: dragState.startViewportX + event.clientX - dragState.startClientX,
        y: dragState.startViewportY + event.clientY - dragState.startClientY,
      },
      containerSize.width,
      containerSize.height,
    );

    viewportTransformRef.current = nextViewportTransform;
    scheduleMapRedraw();
  };

  const stopMapDrag = (event: PointerEvent): void => {
    if (dragStateRef.current?.pointerId === event.pointerId) {
      dragStateRef.current = null;
      isMapPanInteractingRef.current = false;
      mapCanvasMetricsRef.current = null;
      setIsDraggingMap(false);
      event.currentTarget.releasePointerCapture(event.pointerId);
      cancelScheduledMapRedraw();
      updateViewport(() => ({ ...viewportTransformRef.current }));
      redrawMapCanvasRef.current();
    }
  };

  const updatePointerOverMap = (clientX: number, clientY: number): void => {
    const container = mapContainerRef.current;

    if (container === null || containerSize.width === 0) {
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const localX = clientX - containerRect.left;
    const localY = clientY - containerRect.top;
    const markerUnderPointer = hitTestMarkerAtScreen(
      markers,
      localX,
      localY,
      viewportTransformRef.current,
      containerSize.width,
      containerSize.height,
    );

    setHoveredMarker((previousMarker): CanvasWorldMapMarker | null => {
      const previousMarkerId = previousMarker?.id ?? null;
      const nextMarkerId = markerUnderPointer?.id ?? null;

      if (previousMarkerId === nextMarkerId) {
        return previousMarker;
      }

      return markerUnderPointer;
    });
  };

  const handleCanvasPointerMove = (event: PointerEvent): void => {
    if (dragStateRef.current !== null) {
      dragMap(event);
      return;
    }

    updatePointerOverMap(event.clientX, event.clientY);
  };

  const handleCanvasPointerLeave = (): void => {
    if (dragStateRef.current !== null) {
      return;
    }

    setHoveredMarker(null);
  };

  const handleCanvasKeyDown = (event: KeyboardEvent): void => {
    if (markers.length === 0) {
      return;
    }

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      setFocusedMarkerIndex((currentIndex): number => {
        return currentIndex === null ? 0 : (currentIndex + 1) % markers.length;
      });
      setHoveredMarker(null);
      return;
    }

    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      setFocusedMarkerIndex((currentIndex): number => {
        return currentIndex === null
          ? markers.length - 1
          : (currentIndex - 1 + markers.length) % markers.length;
      });
      setHoveredMarker(null);
    }
  };

  const mapCanvasLabel =
    activeMarker === null
      ? `${ariaLabel}。滚轮可缩放地图，放大后可拖拽查看局部；方向键可依次聚焦标记点。`
      : `${ariaLabel}。当前标记：${activeMarker.description ? `${activeMarker.name}，${activeMarker.description}` : activeMarker.name}`;

  return (
    <div
      ref={mapContainerRef}
      className={mapClassName}
      onPointerDown={startMapDrag}
      onPointerMove={handleCanvasPointerMove}
      onPointerUp={stopMapDrag}
      onPointerCancel={stopMapDrag}
      onPointerLeave={handleCanvasPointerLeave}
    >
      <canvas
        ref={mapCanvasRef}
        className="annotated-world-map__canvas"
        role="img"
        aria-label={mapCanvasLabel}
        tabIndex={0}
        onKeyDown={handleCanvasKeyDown}
        onBlur={(): void => {
          setFocusedMarkerIndex(null);
          setHoveredMarker(null);
        }}
      />
      {tooltipMarker && markerTooltipStyle ? (
        <div className="annotated-world-map__tooltip" style={markerTooltipStyle}>
          <strong className="annotated-world-map__tooltip-title">{tooltipMarker.name}</strong>
          {tooltipMarker.description ? (
            <p className="annotated-world-map__tooltip-desc">{tooltipMarker.description}</p>
          ) : null}
          {tooltipMarker.imgUrl ? (
            <a
              className="annotated-world-map__tooltip-link"
              href={tooltipMarker.imgUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              查看照片
            </a>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

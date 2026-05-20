import type { CanvasWorldMapMarker, MapMarkerType, WorldMapRoute } from './canvasTypes';

/** 地图内部坐标系宽度，与 map.svg viewBox 一致 */
export const WORLD_MAP_WIDTH = 1200;

/** 地图内部坐标系高度，与 map.svg viewBox 一致 */
export const WORLD_MAP_HEIGHT = 650;

/** 地图绘图区内边距（经度方向） */
export const WORLD_MAP_MARGIN_X = 42;

/** 地图绘图区内边距（纬度方向） */
export const WORLD_MAP_MARGIN_Y = 42;

/** 可绘制经度范围对应的像素宽度 */
export const WORLD_MAP_CONTENT_WIDTH = WORLD_MAP_WIDTH - WORLD_MAP_MARGIN_X * 2;

/** 可绘制纬度范围对应的像素高度 */
export const WORLD_MAP_CONTENT_HEIGHT = WORLD_MAP_HEIGHT - WORLD_MAP_MARGIN_Y * 2;

/** 视口最小缩放倍数 */
export const MIN_MAP_SCALE = 1;

/** 视口最大缩放倍数 */
export const MAX_MAP_SCALE = 5;

/** 滚轮缩放步进倍率 */
export const MAP_ZOOM_STEP = 1.18;

/** 标记点在屏幕下的绘制半径 */
export const MARKER_RADIUS = 5.6;

/** 指针命中检测半径 */
export const MARKER_HIT_RADIUS_PX = 14;

/** 基础超采样系数 */
export const BASE_SUPERSAMPLE_FACTOR = 1.25;

/** 随缩放叠加的超采样上限 */
export const MAX_ZOOM_SUPERSAMPLE_BOOST = 2;

/** 单帧画布像素面积上限 */
export const MAX_CANVAS_PIXEL_AREA = 6_000_000;

/** 拖拽期画布像素面积上限 */
export const MAX_INTERACTION_CANVAS_PIXEL_AREA = 1_800_000;

/** 拖拽期 DPR 上限 */
export const MAX_INTERACTION_DEVICE_PIXEL_RATIO = 1.5;

/** 经纬度投影结果 */
export interface MarkerPosition {
  /** 投影 X */
  left: number;
  /** 投影 Y */
  top: number;
}

/** 视口平移与缩放 */
export interface ViewportTransform {
  /** 缩放倍数 */
  scale: number;
  /** 平移 X */
  x: number;
  /** 平移 Y */
  y: number;
}

/** 从 CSS 变量解析的画布配色 */
export interface MapCanvasPalette {
  routeStrokeInternational: string;
  routeStrokeDomestic: string;
  markerTravelFill: string;
  markerTravelStroke: string;
  markerTravelFillActive: string;
  markerTravelStrokeActive: string;
  markerResidenceFill: string;
  markerResidenceStroke: string;
  markerResidenceFillActive: string;
  markerResidenceStrokeActive: string;
  markerWishFill: string;
  markerWishStroke: string;
  markerWishFillActive: string;
  markerWishStrokeActive: string;
  markerAirportFill: string;
  markerAirportStroke: string;
  markerAirportFillActive: string;
  markerAirportStrokeActive: string;
}

/** 画布尺寸与像素比 */
export interface MapCanvasRenderMetrics {
  cssWidth: number;
  cssHeight: number;
  pixelWidth: number;
  pixelHeight: number;
  pixelRatio: number;
}

/**
 * 将数值限制在闭区间内
 */
export const clampNumber = (value: number, minValue: number, maxValue: number): number => {
  return Math.min(Math.max(value, minValue), maxValue);
};

/**
 * 收束视口位移，避免放大后拖出可视区域
 */
export const constrainViewportTransform = (
  viewportTransform: ViewportTransform,
  containerWidth: number,
  containerHeight: number,
): ViewportTransform => {
  if (viewportTransform.scale <= MIN_MAP_SCALE) {
    return { scale: MIN_MAP_SCALE, x: 0, y: 0 };
  }

  return {
    scale: viewportTransform.scale,
    x: clampNumber(viewportTransform.x, containerWidth * (1 - viewportTransform.scale), 0),
    y: clampNumber(viewportTransform.y, containerHeight * (1 - viewportTransform.scale), 0),
  };
};

/**
 * 经纬度换算为地图内部坐标
 */
export const projectMapCoordinate = (coordinate: { lat: number; lng: number }): MarkerPosition => {
  return {
    left: WORLD_MAP_MARGIN_X + ((coordinate.lng + 180) / 360) * WORLD_MAP_CONTENT_WIDTH,
    top: WORLD_MAP_MARGIN_Y + ((90 - coordinate.lat) / 180) * WORLD_MAP_CONTENT_HEIGHT,
  };
};

/**
 * 计算画布超采样指标
 */
export const getMapCanvasRenderMetrics = (
  cssWidth: number,
  cssHeight: number,
  viewportScale: number,
  devicePixelRatio: number,
): MapCanvasRenderMetrics => {
  const zoomBoost = clampNumber(
    BASE_SUPERSAMPLE_FACTOR + (viewportScale - MIN_MAP_SCALE) * 0.35,
    BASE_SUPERSAMPLE_FACTOR,
    BASE_SUPERSAMPLE_FACTOR * MAX_ZOOM_SUPERSAMPLE_BOOST,
  );
  let pixelRatio = devicePixelRatio * zoomBoost;
  let pixelWidth = Math.max(1, Math.floor(cssWidth * pixelRatio));
  let pixelHeight = Math.max(1, Math.floor(cssHeight * pixelRatio));

  if (pixelWidth * pixelHeight > MAX_CANVAS_PIXEL_AREA) {
    const areaScale = Math.sqrt(MAX_CANVAS_PIXEL_AREA / (pixelWidth * pixelHeight));
    pixelWidth = Math.max(1, Math.floor(pixelWidth * areaScale));
    pixelHeight = Math.max(1, Math.floor(pixelHeight * areaScale));
    pixelRatio *= areaScale;
  }

  return { cssWidth, cssHeight, pixelWidth, pixelHeight, pixelRatio };
};

/**
 * 拖拽期的画布指标
 */
export const getMapCanvasInteractionMetrics = (
  cssWidth: number,
  cssHeight: number,
  devicePixelRatio: number,
): MapCanvasRenderMetrics => {
  let pixelRatio = Math.min(devicePixelRatio, MAX_INTERACTION_DEVICE_PIXEL_RATIO);
  let pixelWidth = Math.max(1, Math.floor(cssWidth * pixelRatio));
  let pixelHeight = Math.max(1, Math.floor(cssHeight * pixelRatio));

  if (pixelWidth * pixelHeight > MAX_INTERACTION_CANVAS_PIXEL_AREA) {
    const areaScale = Math.sqrt(
      MAX_INTERACTION_CANVAS_PIXEL_AREA / (pixelWidth * pixelHeight),
    );
    pixelWidth = Math.max(1, Math.floor(pixelWidth * areaScale));
    pixelHeight = Math.max(1, Math.floor(pixelHeight * areaScale));
    pixelRatio *= areaScale;
  }

  return { cssWidth, cssHeight, pixelWidth, pixelHeight, pixelRatio };
};

/**
 * 地图坐标转屏幕 CSS 像素
 */
export const mapCoordinateToScreen = (
  mapX: number,
  mapY: number,
  viewportTransform: ViewportTransform,
  cssWidth: number,
  cssHeight: number,
): MarkerPosition => {
  const scaleX = (cssWidth / WORLD_MAP_WIDTH) * viewportTransform.scale;
  const scaleY = (cssHeight / WORLD_MAP_HEIGHT) * viewportTransform.scale;

  return {
    left: mapX * scaleX + viewportTransform.x,
    top: mapY * scaleY + viewportTransform.y,
  };
};

/**
 * 屏幕坐标反投影到地图坐标系
 */
export const screenToMapCoordinate = (
  screenX: number,
  screenY: number,
  viewportTransform: ViewportTransform,
  cssWidth: number,
  cssHeight: number,
): MarkerPosition => {
  const scaleX = (cssWidth / WORLD_MAP_WIDTH) * viewportTransform.scale;
  const scaleY = (cssHeight / WORLD_MAP_HEIGHT) * viewportTransform.scale;

  return {
    left: (screenX - viewportTransform.x) / scaleX,
    top: (screenY - viewportTransform.y) / scaleY,
  };
};

/**
 * 命中检测：查找指针附近的标记点
 */
export const hitTestMarkerAtScreen = (
  markers: CanvasWorldMapMarker[],
  screenX: number,
  screenY: number,
  viewportTransform: ViewportTransform,
  cssWidth: number,
  cssHeight: number,
): CanvasWorldMapMarker | null => {
  let closestMarker: CanvasWorldMapMarker | null = null;
  let closestDistance = MARKER_HIT_RADIUS_PX;

  markers.forEach((marker): void => {
    const markerPosition = projectMapCoordinate(marker.coordinate);
    const screenPosition = mapCoordinateToScreen(
      markerPosition.left,
      markerPosition.top,
      viewportTransform,
      cssWidth,
      cssHeight,
    );
    const distance = Math.hypot(screenX - screenPosition.left, screenY - screenPosition.top);

    if (distance <= closestDistance) {
      closestDistance = distance;
      closestMarker = marker;
    }
  });

  return closestMarker;
};

/**
 * 从容器读取地图 CSS 变量配色
 */
export const readMapCanvasPalette = (container: HTMLElement): MapCanvasPalette => {
  const styles = getComputedStyle(container);

  const read = (name: string): string => styles.getPropertyValue(name).trim();

  return {
    routeStrokeInternational: read('--world-map-route-international'),
    routeStrokeDomestic: read('--world-map-route-domestic'),
    markerTravelFill: read('--world-map-marker-travel-fill'),
    markerTravelStroke: read('--world-map-marker-travel-stroke'),
    markerTravelFillActive: read('--world-map-marker-travel-fill-active'),
    markerTravelStrokeActive: read('--world-map-marker-travel-stroke-active'),
    markerResidenceFill: read('--world-map-marker-residence-fill'),
    markerResidenceStroke: read('--world-map-marker-residence-stroke'),
    markerResidenceFillActive: read('--world-map-marker-residence-fill-active'),
    markerResidenceStrokeActive: read('--world-map-marker-residence-stroke-active'),
    markerWishFill: read('--world-map-marker-wish-fill'),
    markerWishStroke: read('--world-map-marker-wish-stroke'),
    markerWishFillActive: read('--world-map-marker-wish-fill-active'),
    markerWishStrokeActive: read('--world-map-marker-wish-stroke-active'),
    markerAirportFill: read('--world-map-marker-airport-fill'),
    markerAirportStroke: read('--world-map-marker-airport-stroke'),
    markerAirportFillActive: read('--world-map-marker-airport-fill-active'),
    markerAirportStrokeActive: read('--world-map-marker-airport-stroke-active'),
  };
};

/**
 * 按标记类型解析绘制配色
 */
const resolveMarkerPaintStyles = (
  palette: MapCanvasPalette,
  type: MapMarkerType,
  isActive: boolean,
): { fillStyle: string; strokeStyle: string; lineWidth: number } => {
  const paletteByType: Record<
    MapMarkerType,
    { fill: string; stroke: string; fillActive: string; strokeActive: string; lineWidth: number; lineWidthActive: number }
  > = {
    travel: {
      fill: palette.markerTravelFill,
      stroke: palette.markerTravelStroke,
      fillActive: palette.markerTravelFillActive,
      strokeActive: palette.markerTravelStrokeActive,
      lineWidth: 2.2,
      lineWidthActive: 2.6,
    },
    residence: {
      fill: palette.markerResidenceFill,
      stroke: palette.markerResidenceStroke,
      fillActive: palette.markerResidenceFillActive,
      strokeActive: palette.markerResidenceStrokeActive,
      lineWidth: 2,
      lineWidthActive: 2.6,
    },
    wish: {
      fill: palette.markerWishFill,
      stroke: palette.markerWishStroke,
      fillActive: palette.markerWishFillActive,
      strokeActive: palette.markerWishStrokeActive,
      lineWidth: 2.2,
      lineWidthActive: 2.8,
    },
    airport: {
      fill: palette.markerAirportFill,
      stroke: palette.markerAirportStroke,
      fillActive: palette.markerAirportFillActive,
      strokeActive: palette.markerAirportStrokeActive,
      lineWidth: 2.4,
      lineWidthActive: 3,
    },
  };

  const entry = paletteByType[type];

  return {
    fillStyle: isActive ? entry.fillActive : entry.fill,
    strokeStyle: isActive ? entry.strokeActive : entry.stroke,
    lineWidth: isActive ? entry.lineWidthActive : entry.lineWidth,
  };
};

/**
 * 绘制单段航迹弧线
 */
const paintMapRouteArc = (
  context: CanvasRenderingContext2D,
  route: WorldMapRoute,
  palette: MapCanvasPalette,
  viewportScale: number,
): void => {
  const startPosition = projectMapCoordinate(route.start);
  const endPosition = projectMapCoordinate(route.end);
  const controlPointX = (startPosition.left + endPosition.left) / 2;
  const controlPointY = Math.min(startPosition.top, endPosition.top) - 52;
  const isDomesticRoute = route.scope === 'domestic';

  context.beginPath();
  context.moveTo(startPosition.left, startPosition.top);
  context.quadraticCurveTo(controlPointX, controlPointY, endPosition.left, endPosition.top);
  context.strokeStyle = isDomesticRoute
    ? palette.routeStrokeDomestic
    : palette.routeStrokeInternational;
  context.lineWidth = (isDomesticRoute ? 1.2 : 1.45) / viewportScale;
  context.lineCap = 'round';
  context.lineJoin = 'round';
  if (isDomesticRoute) {
    context.setLineDash([]);
  } else {
    context.setLineDash([7 / viewportScale, 9 / viewportScale]);
  }
  context.stroke();
  context.setLineDash([]);
};

/**
 * 绘制底图与航线
 */
export const paintMapBaseLayer = (
  context: CanvasRenderingContext2D,
  worldMapImage: CanvasImageSource,
  routes: WorldMapRoute[],
  palette: MapCanvasPalette,
  cssWidth: number,
  cssHeight: number,
  viewportTransform: ViewportTransform,
  options?: { omitViewportTranslate?: boolean },
): void => {
  const scaleX = cssWidth / WORLD_MAP_WIDTH;
  const scaleY = cssHeight / WORLD_MAP_HEIGHT;
  const clearWidth = options?.omitViewportTranslate
    ? cssWidth * viewportTransform.scale
    : cssWidth;
  const clearHeight = options?.omitViewportTranslate
    ? cssHeight * viewportTransform.scale
    : cssHeight;

  context.clearRect(0, 0, clearWidth, clearHeight);
  context.save();

  if (!options?.omitViewportTranslate) {
    context.translate(viewportTransform.x, viewportTransform.y);
  }

  context.scale(viewportTransform.scale * scaleX, viewportTransform.scale * scaleY);
  context.drawImage(worldMapImage, 0, 0, WORLD_MAP_WIDTH, WORLD_MAP_HEIGHT);

  const domesticRoutes = routes.filter((route): boolean => route.scope === 'domestic');
  const internationalRoutes = routes.filter(
    (route): boolean => route.scope === 'international',
  );

  domesticRoutes.forEach((route): void => {
    paintMapRouteArc(context, route, palette, viewportTransform.scale);
  });
  internationalRoutes.forEach((route): void => {
    paintMapRouteArc(context, route, palette, viewportTransform.scale);
  });

  context.restore();
};

/**
 * 在屏幕坐标下绘制标记点
 */
export const paintMapMarkers = (
  context: CanvasRenderingContext2D,
  markers: CanvasWorldMapMarker[],
  palette: MapCanvasPalette,
  activeMarkerId: string | null,
  cssWidth: number,
  cssHeight: number,
  viewportTransform: ViewportTransform,
): void => {
  markers.forEach((marker): void => {
    const markerPosition = projectMapCoordinate(marker.coordinate);
    const screenPosition = mapCoordinateToScreen(
      markerPosition.left,
      markerPosition.top,
      viewportTransform,
      cssWidth,
      cssHeight,
    );
    const isActive = marker.id === activeMarkerId;
    const radius = isActive ? MARKER_RADIUS * 1.12 : MARKER_RADIUS;
    const markerPaint = resolveMarkerPaintStyles(palette, marker.type, isActive);

    context.beginPath();
    context.arc(screenPosition.left, screenPosition.top, radius, 0, Math.PI * 2);
    context.fillStyle = markerPaint.fillStyle;
    context.fill();
    context.strokeStyle = markerPaint.strokeStyle;
    context.lineWidth = markerPaint.lineWidth;
    context.stroke();
  });
};

/**
 * 构建底图+航线离屏缓存
 */
export const buildMapLayerCache = (
  worldMapImage: CanvasImageSource,
  routes: WorldMapRoute[],
  palette: MapCanvasPalette,
  cssWidth: number,
  cssHeight: number,
  viewportScale: number,
): HTMLCanvasElement => {
  const cacheCanvas = document.createElement('canvas');
  const cacheCssWidth = Math.max(1, Math.ceil(cssWidth * viewportScale));
  const cacheCssHeight = Math.max(1, Math.ceil(cssHeight * viewportScale));

  cacheCanvas.width = cacheCssWidth;
  cacheCanvas.height = cacheCssHeight;

  const cacheContext = cacheCanvas.getContext('2d');

  if (cacheContext !== null) {
    cacheContext.imageSmoothingEnabled = true;
    cacheContext.imageSmoothingQuality = 'high';
    paintMapBaseLayer(
      cacheContext,
      worldMapImage,
      routes,
      palette,
      cssWidth,
      cssHeight,
      { scale: viewportScale, x: 0, y: 0 },
      { omitViewportTranslate: true },
    );
  }

  return cacheCanvas;
};

/**
 * 从离屏缓存 blit 当前视口
 */
export const blitMapLayerCache = (
  context: CanvasRenderingContext2D,
  layerCache: HTMLCanvasElement,
  viewportTransform: ViewportTransform,
  cssWidth: number,
  cssHeight: number,
): void => {
  context.clearRect(0, 0, cssWidth, cssHeight);
  context.drawImage(
    layerCache,
    -viewportTransform.x,
    -viewportTransform.y,
    cssWidth,
    cssHeight,
    0,
    0,
    cssWidth,
    cssHeight,
  );
};

/**
 * 组合绘制底图、航线与标记点
 */
export const paintAnnotatedWorldMap = (
  context: CanvasRenderingContext2D,
  worldMapImage: CanvasImageSource,
  markers: CanvasWorldMapMarker[],
  routes: WorldMapRoute[],
  palette: MapCanvasPalette,
  activeMarkerId: string | null,
  cssWidth: number,
  cssHeight: number,
  viewportTransform: ViewportTransform,
): void => {
  paintMapBaseLayer(
    context,
    worldMapImage,
    routes,
    palette,
    cssWidth,
    cssHeight,
    viewportTransform,
  );
  paintMapMarkers(
    context,
    markers,
    palette,
    activeMarkerId,
    cssWidth,
    cssHeight,
    viewportTransform,
  );
};

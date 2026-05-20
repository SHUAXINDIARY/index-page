import type { WorldMapMarker, WorldMapRouteConfig } from '../../config/content';
import type { CanvasWorldMapMarker, WorldMapRoute } from './canvasTypes';
import { MARKER_OFFSET_DISTANCE } from './constant';

/**
 * 计算标记点偏移，避免相同经纬度的标记重叠
 */
export const getMarkerOffset = (
  marker: WorldMapMarker,
  allMarkers: WorldMapMarker[] | undefined,
): { lat: number; lng: number } => {
  if (!allMarkers) {
    return { lat: marker.lat, lng: marker.lng };
  }

  const { lat, lng, type, name } = marker;
  const sameLocationMarkers = allMarkers.filter((m) => m.lat === lat && m.lng === lng);

  if (sameLocationMarkers.length <= 1) {
    return { lat, lng };
  }

  const index = sameLocationMarkers.findIndex((m) => m.type === type && m.name === name);
  const angle = (2 * Math.PI * index) / sameLocationMarkers.length;

  return {
    lat: lat + MARKER_OFFSET_DISTANCE * Math.sin(angle),
    lng: lng + MARKER_OFFSET_DISTANCE * Math.cos(angle),
  };
};

/**
 * 将 content 配置中的标记转换为 Canvas 地图标记
 */
export const toCanvasMarkers = (
  markers: WorldMapMarker[] | undefined,
): CanvasWorldMapMarker[] => {
  if (!markers) {
    return [];
  }

  return markers.map((marker) => {
    const position = getMarkerOffset(marker, markers);

    return {
      id: `${marker.type}-${marker.name}-${marker.lat}-${marker.lng}`,
      name: marker.name,
      coordinate: { lat: position.lat, lng: position.lng },
      type: marker.type,
      description: marker.description,
      imgUrl: marker.imgUrl,
    };
  });
};

/**
 * 将配置中的航迹转换为 Canvas 航迹
 */
export const toCanvasRoutes = (routes: WorldMapRouteConfig[] | undefined): WorldMapRoute[] => {
  if (!routes) {
    return [];
  }

  return routes.map((route) => ({
    name: route.name,
    start: { lat: route.startLat, lng: route.startLng },
    end: { lat: route.endLat, lng: route.endLng },
    scope: route.scope,
  }));
};

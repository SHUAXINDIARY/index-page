import type { MutableRefObject } from 'react';
import type maplibregl from 'maplibre-gl';
import type { WorldMapConfig } from '../../config/content';

// 从 WorldMapConfig 中派生的类型
export type WorldMapMarkers = WorldMapConfig['markers'];
export type WorldMapMarker = NonNullable<WorldMapMarkers>[number];

// 组件 Props 类型
export interface WorldMapProps {
  config: WorldMapConfig;
}

// 标记点创建函数参数类型
export interface CreateMarkerWithPopupParams {
  mapInstance: maplibregl.Map;
  marker: WorldMapMarker;
  targetMarkersMapRef: MutableRefObject<Map<string, maplibregl.Marker[]>>;
  markerStoreRef: MutableRefObject<maplibregl.Marker[]>;
}

// 标记点颜色映射类型
export type MarkerColorMap = Record<string, string>;

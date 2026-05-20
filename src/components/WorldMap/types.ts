import type { WorldMapConfig } from '../../config/content';

/** 组件 Props */
export interface WorldMapProps {
  /** 世界地图配置 */
  config: WorldMapConfig;
}

export type { CanvasWorldMapMarker, MapCoordinate, MapMarkerType, WorldMapRoute } from './canvasTypes';

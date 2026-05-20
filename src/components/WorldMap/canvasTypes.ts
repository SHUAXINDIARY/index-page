/** 地图标注使用的经纬度坐标 */
export interface MapCoordinate {
  /** 纬度，范围约 -90 至 90 */
  lat: number;
  /** 经度，范围约 -180 至 180 */
  lng: number;
}

/** 标记点类型：旅行 / 居住 / 愿望 / 机场 */
export type MapMarkerType = 'travel' | 'residence' | 'wish' | 'airport';

/** 航迹范围：国内实线、国际虚线 */
export type MapRouteScope = 'domestic' | 'international';

/** Canvas 地图上的标记点 */
export interface CanvasWorldMapMarker {
  /** 标记唯一标识 */
  id: string;
  /** 展示名称 */
  name: string;
  /** 经纬度位置 */
  coordinate: MapCoordinate;
  /** 标记类型，决定配色 */
  type: MapMarkerType;
  /** 可选补充说明 */
  description?: string;
  /** 可选照片链接 */
  imgUrl?: string;
}

/** 地图上示意航迹的弧线 */
export interface WorldMapRoute {
  /** 航线名称 */
  name: string;
  /** 弧线起点 */
  start: MapCoordinate;
  /** 弧线终点 */
  end: MapCoordinate;
  /** 航迹范围 */
  scope: MapRouteScope;
}

/** Canvas 地图组件入参 */
export interface AnnotatedWorldMapProps {
  /** 地图上的标记点 */
  markers: CanvasWorldMapMarker[];
  /** 可选航迹 */
  routes?: WorldMapRoute[];
  /** 无障碍区域名称 */
  ariaLabel: string;
  /** 根容器额外 class */
  className?: string;
}

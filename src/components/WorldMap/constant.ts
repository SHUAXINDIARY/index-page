/** URL 查询参数：全屏状态 */
export const FULLSCREEN_QUERY_KEY = 'map';

/** URL 查询参数值：全屏 */
export const FULLSCREEN_QUERY_VALUE = 'fullscreen';

/** 标记点偏移距离（经纬度），用于同坐标多点分散 */
export const MARKER_OFFSET_DISTANCE = 0.15;

/** 图例圆点 CSS 类（颜色来自 --world-map-marker-* token） */
export const MARKER_LEGEND_TOKEN_CLASS: Record<string, string> = {
  travel: 'world-map-legend-dot--travel',
  residence: 'world-map-legend-dot--residence',
  wish: 'world-map-legend-dot--wish',
  airport: 'world-map-legend-dot--airport',
};

/** 默认地图无障碍名称 */
export const DEFAULT_MAP_ARIA_LABEL = '旅行足迹世界地图';

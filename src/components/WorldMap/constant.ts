/** URL 查询参数：全屏状态 */
export const FULLSCREEN_QUERY_KEY = 'map';

/** URL 查询参数值：全屏 */
export const FULLSCREEN_QUERY_VALUE = 'fullscreen';

/** 标记点偏移距离（经纬度），用于同坐标多点分散 */
export const MARKER_OFFSET_DISTANCE = 0.15;

/** 图例圆点颜色（与画布 token 一致，供 DOM 图例使用） */
export const MARKER_COLOR_MAP: Record<string, string> = {
  travel: '#ff8c42',
  residence: '#4a90e2',
  wish: '#ff6b9d',
  airport: '#c8d600',
};

/** 默认地图无障碍名称 */
export const DEFAULT_MAP_ARIA_LABEL = '旅行足迹世界地图';

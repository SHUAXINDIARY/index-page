// URL 查询参数常量：用于全屏状态的持久化
export const FULLSCREEN_QUERY_KEY = 'map';
export const FULLSCREEN_QUERY_VALUE = 'fullscreen';

// 默认地图样式 URL
export const DEFAULT_MAP_STYLE = 'https://demotiles.maplibre.org/style.json';

// 默认地图中心点（中国附近）
export const DEFAULT_MAP_CENTER: [number, number] = [120, 30];

// 默认缩放级别
export const DEFAULT_MAP_ZOOM = 1.5;

// 标记点颜色映射
export const MARKER_COLOR_MAP: Record<string, string> = {
  travel: '#ff8c42',    // 橙色 - 旅行
  residence: '#4a90e2', // 蓝色 - 居住
  wish: '#ff6b9d',      // 粉色 - 愿望
  airport: '#DDFF00',   // 黄色 - 机场
};

// 默认标记点颜色（未匹配类型时使用）
export const DEFAULT_MARKER_COLOR = '#666666';

// 标记点偏移距离（经纬度单位，用于避免相同位置标记点重叠）
export const MARKER_OFFSET_DISTANCE = 0.15;

// 弹窗偏移量
export const POPUP_OFFSET = 25;

// 标记点样式配置
export const MARKER_DOT_STYLE = {
  width: '10px',
  height: '10px',
  borderRadius: '50%',
  border: '2px solid white',
  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.4)',
  cursor: 'pointer',
  transition: 'transform 0.2s ease',
} as const;

// 大气效果配置
export const SKY_CONFIG = {
  'sky-color': '#199EF3',
  'horizon-color': '#ffffff',
  'fog-color': '#BAD2EB',
  'fog-ground-blend': 0.5,
  'horizon-fog-blend': 0.5,
  'sky-horizon-blend': 0.5,
  'atmosphere-blend': [
    'interpolate',
    ['linear'],
    ['zoom'],
    0,
    1,
    10,
    1,
    12,
    0.8
  ] as ['interpolate', ['linear'], ['zoom'], number, number, number, number, number, number],
};

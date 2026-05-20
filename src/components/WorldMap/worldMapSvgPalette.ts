/** 世界地图 SVG 注入用配色（由 CSS token 解析为计算后的颜色字符串） */
export interface WorldMapSvgPalette {
  /** 海洋渐变起点 */
  oceanTop: string;
  /** 海洋渐变终点 */
  oceanBottom: string;
  /** 陆地投影颜色 */
  shadowFlood: string;
  /** 陆地投影不透明度 */
  shadowOpacity: number;
  /** 外框描边 */
  frameStroke: string;
  /** 经纬网格描边 */
  graticuleStroke: string;
  /** 国界描边 */
  countryStroke: string;
  /** 国界悬停填充 */
  countryHoverFill: string;
  /** 国界悬停描边 */
  countryHoverStroke: string;
  /** 北美填充 */
  landNorthAmerica: string;
  /** 南美填充 */
  landSouthAmerica: string;
  /** 欧洲填充 */
  landEurope: string;
  /** 非洲填充 */
  landAfrica: string;
  /** 亚洲填充 */
  landAsia: string;
  /** 大洋洲填充 */
  landOceania: string;
  /** 南极填充 */
  landAntarctica: string;
  /** 其他区域填充 */
  landOther: string;
  /** 大陆轮廓描边 */
  outlineStroke: string;
  /** 大洲标签填充 */
  labelFill: string;
  /** 大洲标签描边 */
  labelStroke: string;
  /** 图例说明文字填充 */
  captionFill: string;
}

/** 地图 SVG 配色 token 名称表 */
const WORLD_MAP_SVG_TOKEN_NAMES = {
  oceanTop: '--world-map-svg-ocean-top',
  oceanBottom: '--world-map-svg-ocean-bottom',
  shadowFlood: '--world-map-svg-shadow-flood',
  shadowOpacity: '--world-map-svg-shadow-opacity',
  frameStroke: '--world-map-svg-frame-stroke',
  graticuleStroke: '--world-map-svg-graticule-stroke',
  countryStroke: '--world-map-svg-country-stroke',
  countryHoverFill: '--world-map-svg-country-hover-fill',
  countryHoverStroke: '--world-map-svg-country-hover-stroke',
  landNorthAmerica: '--world-map-svg-land-na',
  landSouthAmerica: '--world-map-svg-land-sa',
  landEurope: '--world-map-svg-land-eu',
  landAfrica: '--world-map-svg-land-af',
  landAsia: '--world-map-svg-land-as',
  landOceania: '--world-map-svg-land-oc',
  landAntarctica: '--world-map-svg-land-an',
  landOther: '--world-map-svg-land-other',
  outlineStroke: '--world-map-svg-outline-stroke',
  labelFill: '--world-map-svg-label-fill',
  labelStroke: '--world-map-svg-label-stroke',
  captionFill: '--world-map-svg-caption-fill',
} as const;

let colorProbeElement: HTMLSpanElement | null = null;

/**
 * 解析 CSS 变量为浏览器计算后的颜色（rgb / rgba）
 */
const readResolvedCssColor = (tokenName: string): string => {
  if (typeof document === 'undefined') {
    return 'transparent';
  }

  if (colorProbeElement === null) {
    colorProbeElement = document.createElement('span');
    colorProbeElement.setAttribute('aria-hidden', 'true');
    colorProbeElement.style.position = 'absolute';
    colorProbeElement.style.visibility = 'hidden';
    colorProbeElement.style.pointerEvents = 'none';
    document.documentElement.appendChild(colorProbeElement);
  }

  colorProbeElement.style.backgroundColor = `var(${tokenName})`;
  return getComputedStyle(colorProbeElement).backgroundColor;
};

/**
 * 解析数值型 CSS 变量
 */
const readResolvedCssNumber = (tokenName: string, fallback: number): number => {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(tokenName).trim();
  const parsed = Number.parseFloat(raw);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return parsed;
};

/**
 * 从 document 上的世界地图 SVG token 读取当前主题配色
 */
export const readWorldMapSvgPalette = (): WorldMapSvgPalette => {
  return {
    oceanTop: readResolvedCssColor(WORLD_MAP_SVG_TOKEN_NAMES.oceanTop),
    oceanBottom: readResolvedCssColor(WORLD_MAP_SVG_TOKEN_NAMES.oceanBottom),
    shadowFlood: readResolvedCssColor(WORLD_MAP_SVG_TOKEN_NAMES.shadowFlood),
    shadowOpacity: readResolvedCssNumber(WORLD_MAP_SVG_TOKEN_NAMES.shadowOpacity, 0.12),
    frameStroke: readResolvedCssColor(WORLD_MAP_SVG_TOKEN_NAMES.frameStroke),
    graticuleStroke: readResolvedCssColor(WORLD_MAP_SVG_TOKEN_NAMES.graticuleStroke),
    countryStroke: readResolvedCssColor(WORLD_MAP_SVG_TOKEN_NAMES.countryStroke),
    countryHoverFill: readResolvedCssColor(WORLD_MAP_SVG_TOKEN_NAMES.countryHoverFill),
    countryHoverStroke: readResolvedCssColor(WORLD_MAP_SVG_TOKEN_NAMES.countryHoverStroke),
    landNorthAmerica: readResolvedCssColor(WORLD_MAP_SVG_TOKEN_NAMES.landNorthAmerica),
    landSouthAmerica: readResolvedCssColor(WORLD_MAP_SVG_TOKEN_NAMES.landSouthAmerica),
    landEurope: readResolvedCssColor(WORLD_MAP_SVG_TOKEN_NAMES.landEurope),
    landAfrica: readResolvedCssColor(WORLD_MAP_SVG_TOKEN_NAMES.landAfrica),
    landAsia: readResolvedCssColor(WORLD_MAP_SVG_TOKEN_NAMES.landAsia),
    landOceania: readResolvedCssColor(WORLD_MAP_SVG_TOKEN_NAMES.landOceania),
    landAntarctica: readResolvedCssColor(WORLD_MAP_SVG_TOKEN_NAMES.landAntarctica),
    landOther: readResolvedCssColor(WORLD_MAP_SVG_TOKEN_NAMES.landOther),
    outlineStroke: readResolvedCssColor(WORLD_MAP_SVG_TOKEN_NAMES.outlineStroke),
    labelFill: readResolvedCssColor(WORLD_MAP_SVG_TOKEN_NAMES.labelFill),
    labelStroke: readResolvedCssColor(WORLD_MAP_SVG_TOKEN_NAMES.labelStroke),
    captionFill: readResolvedCssColor(WORLD_MAP_SVG_TOKEN_NAMES.captionFill),
  };
};

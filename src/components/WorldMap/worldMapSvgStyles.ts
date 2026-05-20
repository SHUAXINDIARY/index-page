import type { WorldMapSvgPalette } from './worldMapSvgPalette';

/**
 * 生成带主题配色的 SVG defs 片段（海洋渐变、投影、样式表）
 */
export const buildThemedWorldMapDefs = (
  palette: WorldMapSvgPalette,
  mode: 'light' | 'dark',
): string => {
  const colorScheme = mode === 'light' ? 'light' : 'dark';

  return `
      <linearGradient id="ocean" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${palette.oceanTop}"/>
        <stop offset="1" stop-color="${palette.oceanBottom}"/>
      </linearGradient>
      <filter id="landShadow" x="-4%" y="-4%" width="108%" height="112%">
        <feDropShadow dx="0" dy="2.5" stdDeviation="2.6" flood-color="${palette.shadowFlood}" flood-opacity="${palette.shadowOpacity}"/>
      </filter>
      <style>
        :root {
          color-scheme: ${colorScheme};
        }
        .ocean {
          fill: url(#ocean);
        }
        .frame {
          fill: none;
          stroke: ${palette.frameStroke};
          stroke-width: 1.2;
          opacity: 1;
        }
        .graticule path {
          fill: none;
          stroke: ${palette.graticuleStroke};
          stroke-width: 0.75;
          opacity: 1;
        }
        .countries {
          filter: url(#landShadow);
        }
        .country {
          stroke: ${palette.countryStroke};
          stroke-width: 0.62;
          stroke-linejoin: round;
          stroke-linecap: round;
          vector-effect: non-scaling-stroke;
        }
        .country:hover {
          fill: ${palette.countryHoverFill};
          stroke: ${palette.countryHoverStroke};
          stroke-width: 1.2;
        }
        .north-america { fill: ${palette.landNorthAmerica}; }
        .south-america { fill: ${palette.landSouthAmerica}; }
        .europe { fill: ${palette.landEurope}; }
        .africa { fill: ${palette.landAfrica}; }
        .asia { fill: ${palette.landAsia}; }
        .oceania { fill: ${palette.landOceania}; }
        .antarctica { fill: ${palette.landAntarctica}; }
        .other { fill: ${palette.landOther}; }
        .outline {
          fill: none;
          stroke: ${palette.outlineStroke};
          stroke-width: 1.12;
          stroke-linejoin: round;
          stroke-linecap: round;
          opacity: 1;
          vector-effect: non-scaling-stroke;
        }
        .continent-label {
          font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          font-size: 16px;
          font-weight: 700;
          letter-spacing: 0.02em;
          fill: ${palette.labelFill};
          opacity: 1;
          paint-order: stroke;
          stroke: ${palette.labelStroke};
          stroke-width: 4px;
          stroke-linejoin: round;
        }
        .caption {
          font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.01em;
          fill: ${palette.captionFill};
          opacity: 1;
        }
      </style>`;
};

/**
 * 将主题 defs 注入 SVG 源文本
 */
export const injectWorldMapSvgTheme = (
  svgSource: string,
  palette: WorldMapSvgPalette,
  mode: 'light' | 'dark',
): string => {
  const themedDefs = buildThemedWorldMapDefs(palette, mode);

  return svgSource.replace(/<defs>[\s\S]*?<\/defs>/, `<defs>${themedDefs}</defs>`);
};

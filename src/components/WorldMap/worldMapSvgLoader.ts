import { injectWorldMapSvgTheme } from './worldMapSvgStyles';
import { readWorldMapSvgPalette } from './worldMapSvgPalette';

/** 主题化地图加载参数 */
export interface LoadThemedWorldMapImageOptions {
  /** 基础 SVG 资源 URL（仅几何与结构，配色由运行时注入） */
  svgAssetUrl: string;
  /** 当前明暗模式 */
  mode: 'light' | 'dark';
}

/**
 * 拉取 SVG 源文件并注入当前主题配色，再解码为 Canvas 可用位图
 */
export const loadThemedWorldMapImage = async ({
  svgAssetUrl,
  mode,
}: LoadThemedWorldMapImageOptions): Promise<HTMLImageElement> => {
  const response = await fetch(svgAssetUrl);

  if (!response.ok) {
    throw new Error('世界地图 SVG 资源加载失败');
  }

  const svgSource = await response.text();
  const palette = readWorldMapSvgPalette();
  const themedSvg = injectWorldMapSvgTheme(svgSource, palette, mode);
  const blob = new Blob([themedSvg], { type: 'image/svg+xml;charset=utf-8' });
  const objectUrl = URL.createObjectURL(blob);

  return new Promise((resolve, reject): void => {
    const image = new Image();

    image.onload = (): void => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = (): void => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('世界地图 SVG 解码失败'));
    };

    image.src = objectUrl;
  });
};

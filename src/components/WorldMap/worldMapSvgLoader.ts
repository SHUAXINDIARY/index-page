import { injectWorldMapSvgTheme } from './worldMapSvgStyles';
import { readWorldMapSvgPalette } from './worldMapSvgPalette';

/** 主题化地图加载参数 */
export interface LoadThemedWorldMapImageOptions {
  /** 基础 SVG 资源 URL（仅几何与结构，配色由运行时注入） */
  svgAssetUrl: string;
  /** 当前明暗模式 */
  mode: 'light' | 'dark';
  /** 主题切换、卸载或超时时取消旧资源的下载与图片加载 */
  signal?: AbortSignal;
}

/**
 * 拉取 SVG 源文件并注入当前主题配色，再解码为 Canvas 可用位图
 */
export const loadThemedWorldMapImage = async ({
  svgAssetUrl,
  mode,
  signal,
}: LoadThemedWorldMapImageOptions): Promise<HTMLImageElement> => {
  const response = await fetch(svgAssetUrl, { signal });

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
    const cleanup = (): void => {
      image.onload = null;
      image.onerror = null;
      signal?.removeEventListener('abort', handleAbort);
      URL.revokeObjectURL(objectUrl);
    };
    const handleAbort = (): void => {
      cleanup();
      image.src = '';
      reject(new DOMException('地图加载已取消', 'AbortError'));
    };

    image.onload = async (): Promise<void> => {
      try {
        // 解码完成前保留取消监听，使超时也能终止等待，而不只是终止下载。
        if (typeof image.decode === 'function') {
          await image.decode();
        }
        cleanup();
        resolve(image);
      } catch (error: unknown) {
        cleanup();
        reject(error);
      }
    };

    image.onerror = (): void => {
      cleanup();
      reject(new Error('世界地图 SVG 解码失败'));
    };

    if (signal?.aborted) {
      handleAbort();
      return;
    }
    signal?.addEventListener('abort', handleAbort, { once: true });
    image.src = objectUrl;
  });
};

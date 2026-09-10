import type { RsbuildPlugin } from '@rsbuild/core';
import { readdirSync, writeFileSync } from 'fs';
import { join, basename, extname } from 'path';

interface CardImageItem {
  imageUrl: string;
  alt: string;
}

interface CardImgListPluginOptions {
  /** 图片文件所在目录，相对于项目根目录，默认 'public/cardImg' */
  cardImgDir?: string;
  /** 输出的 JSON 文件路径，默认 'src/config/card-img-data.json' */
  outputPath?: string;
  /** 支持的图片文件扩展名 */
  extensions?: string[];
}

/**
 * 读取 public/cardImg 目录生成图片列表的 Rsbuild 插件
 * 在构建时自动扫描图片目录，生成 images 数据
 */
export const cardImgListPlugin = (
  options?: CardImgListPluginOptions,
): RsbuildPlugin => {
  const cardImgDir = options?.cardImgDir || 'public/cardImg';
  const outputPath =
    options?.outputPath || join(process.cwd(), 'src/config/card-img-data.json');
  const extensions = options?.extensions || [
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.webp',
    '.avif',
    '.svg',
  ];

  const scanCardImgFiles = (): CardImageItem[] => {
    try {
      const cardImgPath = join(process.cwd(), cardImgDir);
      console.log(`[CardImgListPlugin] 正在扫描 ${cardImgPath}...`);

      const files = readdirSync(cardImgPath).toSorted((a, b) =>
        a.localeCompare(b, 'zh-CN'),
      );
      const images: CardImageItem[] = [];

      for (const file of files) {
        const ext = extname(file).toLowerCase();
        if (extensions.includes(ext)) {
          const alt = basename(file, ext);
          const imageUrl = `/cardImg/${file}`;
          images.push({ imageUrl, alt });
        }
      }

      console.log(`[CardImgListPlugin] 找到 ${images.length} 个图片文件`);
      return images;
    } catch (error) {
      console.error('[CardImgListPlugin] 扫描 cardImg 目录失败:', error);
      return [];
    }
  };

  const writeCardImgData = () => {
    const images = scanCardImgFiles();
    const data = {
      images,
      generatedAt: new Date().toISOString(),
    };

    writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`[CardImgListPlugin] 数据已写入: ${outputPath}`);
  };

  return {
    name: 'card-img-list-plugin',
    setup(build) {
      build.onBeforeBuild(async () => {
        try {
          writeCardImgData();
        } catch (error) {
          console.error('[CardImgListPlugin] 插件执行失败:', error);
        }
      });

      // 开发服务器启动前也扫描一次，保证新增图片无需手动改 content.ts
      build.onBeforeStartDevServer(async () => {
        try {
          writeCardImgData();
        } catch (error) {
          console.error('[CardImgListPlugin] 开发启动扫描失败:', error);
        }
      });
    },
  };
};

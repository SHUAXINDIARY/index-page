import type { RsbuildPlugin } from '@rsbuild/core';
import { readdirSync, writeFileSync } from 'fs';
import { join, basename, extname } from 'path';

interface BgmTrack {
  name: string;
  url: string;
}

interface BgmListPluginOptions {
  /** bgm 文件所在目录，相对于项目根目录，默认 'public/bgm' */
  bgmDir?: string;
  /** 输出的 JSON 文件路径，默认 'src/config/bgm-data.json' */
  outputPath?: string;
  /** 支持的音频文件扩展名 */
  extensions?: string[];
}

/**
 * 读取 public/bgm 目录生成音乐列表的 Rsbuild 插件
 * 在构建时自动扫描 bgm 目录，生成 urlList 数据
 */
export const bgmListPlugin = (options?: BgmListPluginOptions): RsbuildPlugin => {
  const bgmDir = options?.bgmDir || 'public/bgm';
  const outputPath = options?.outputPath || join(process.cwd(), 'src/config/bgm-data.json');
  const extensions = options?.extensions || ['.wav', '.mp3', '.ogg', '.flac', '.m4a'];

  const scanBgmFiles = (): BgmTrack[] => {
    try {
      const bgmPath = join(process.cwd(), bgmDir);
      console.log(`[BgmListPlugin] 正在扫描 ${bgmPath}...`);

      const files = readdirSync(bgmPath);
      const tracks: BgmTrack[] = [];

      for (const file of files) {
        const ext = extname(file).toLowerCase();
        if (extensions.includes(ext)) {
          // 文件名去掉扩展名作为 name
          const name = basename(file, ext);
          // url 为相对于 public 目录的路径，部署后可直接访问
          const url = `/bgm/${file}`;

          tracks.push({ name, url });
        }
      }

      console.log(`[BgmListPlugin] 找到 ${tracks.length} 个音频文件`);
      return tracks;
    } catch (error) {
      console.error('[BgmListPlugin] 扫描 bgm 目录失败:', error);
      return [];
    }
  };

  return {
    name: 'bgm-list-plugin',
    setup(build) {
      // 在构建开始前执行
      build.onBeforeBuild(async () => {
        try {
          const tracks = scanBgmFiles();

          const data = {
            urlList: tracks,
            generatedAt: new Date().toISOString(),
          };

          // 写入 JSON 文件
          writeFileSync(
            outputPath,
            JSON.stringify(data, null, 2),
            'utf-8'
          );

          console.log(`[BgmListPlugin] 数据已写入: ${outputPath}`);
        } catch (error) {
          console.error('[BgmListPlugin] 插件执行失败:', error);
        }
      });
    },
  };
};

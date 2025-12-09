import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { contentConfig } from './src/config/content';
import { fetchBlogPlugin } from './plugins/fetch-blog-plugin';
import { bgmListPlugin } from './plugins/bgm-list-plugin';

// Docs: https://rsbuild.rs/config/
export default defineConfig({
  plugins: [
    pluginReact(),
    // 自定义插件：抓取博客最新文章
    fetchBlogPlugin({
      blogUrl: contentConfig.user.menuItems[0].url,
      outputPath: './src/config/blog-data.json',
    }),
    // 自定义插件：扫描 public/bgm 目录生成音乐列表
    bgmListPlugin({
      bgmDir: 'public/bgm',
      outputPath: './src/config/bgm-data.json',
    }),
  ],
  html: {
    template: './public/index.html',
  },
});

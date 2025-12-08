import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { contentConfig } from './src/config/content';
import { fetchBlogPlugin } from './plugins/fetch-blog-plugin';

// Docs: https://rsbuild.rs/config/
export default defineConfig({
  plugins: [
    pluginReact(),
    // 自定义插件：抓取博客最新文章
    fetchBlogPlugin({
      blogUrl: contentConfig.user.menuItems[0].url,
      outputPath: './src/config/blog-data.json',
    }),
  ],
  html: {
    template: './public/index.html',
  },
});

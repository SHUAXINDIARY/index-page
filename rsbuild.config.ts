import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { contentConfig } from './src/config/content';

// Docs: https://rsbuild.rs/config/
export default defineConfig({
  plugins: [pluginReact()],
  html: {
    title: '刷新 - index page',
    favicon: contentConfig.user.avatar,
    meta: [
      {
        name: 'description',
        content: '刷新 - index page',
      },
    ],
  }
});

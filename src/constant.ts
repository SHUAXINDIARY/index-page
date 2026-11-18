/** GitHub 仓库地址 */
export const GITHUB_REPO_URL = 'https://github.com/SHUAXINDIARY/index-page';

/** 背景图片退出后清理状态的延迟（毫秒） */
export const BACKGROUND_EXIT_DURATION_MS = 380;

/** 卡片尺寸配置 - PC 端 */
export const CARD_SIZES: Record<string, { width: number; height: number }> = {
  user: { width: 280, height: 314 },
  article: { width: 280, height: 165 },
  openSource: { width: 320, height: 190 },
  social: { width: 280, height: 136 },
  image: { width: 240, height: 180 },
  welcome: { width: 320, height: 329 },
  worldMap: { width: 320, height: 200 },
  location: { width: 120, height: 40 },
  clock: { width: 195, height: 72 },
  calendar: { width: 300, height: 330 },
  music: { width: 320, height: 86 },
};

/** 移动端/平板端布局 - 渲染顺序 */
export const COMPACT_CARD_ORDER = [
  'welcome',
  'user',
  'clock',
  'location',
  'image',
  'calendar',
  'article',
  'openSource',
  'music',
  'worldMap',
  'social',
] as const;

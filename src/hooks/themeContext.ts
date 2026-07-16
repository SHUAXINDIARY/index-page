import { createContext, useContext } from 'react';

/** 主题模式 */
export type ThemeMode = 'light' | 'dark' | 'system';

/** 主题配色 */
export type ThemeColor =
  | 'default'
  | 'ocean'
  | 'forest'
  | 'lavender'
  | 'sunset'
  | 'slate'
  | 'linear'
  | 'custom';

export type CustomThemeColors = {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  card: string;
  surface: string;
  border: string;
};

export type CustomThemePalettes = Record<'light' | 'dark', CustomThemeColors>;

/** useTheme 返回值类型 */
export interface UseThemeReturn {
  /** 当前主题模式（含 system） */
  mode: ThemeMode;
  /** 当前实际生效的模式（仅 light | dark） */
  resolvedMode: 'light' | 'dark';
  /** 当前主题配色 */
  color: ThemeColor;
  /** 设置主题模式 */
  setMode: (mode: ThemeMode) => void;
  /** 设置主题配色 */
  setColor: (color: ThemeColor) => void;
  customColors: CustomThemePalettes;
  setCustomColors: (mode: 'light' | 'dark', colors: CustomThemeColors) => void;
}

/** 主题 React 上下文 */
export const ThemeContext = createContext<UseThemeReturn | null>(null);

/** localStorage 存储的主题模式 key */
export const STORAGE_KEY_MODE = 'theme-mode';

/** localStorage 存储的主题配色 key */
export const STORAGE_KEY_COLOR = 'theme-color';
export const STORAGE_KEY_CUSTOM_COLORS = 'theme-custom-colors';

export const DEFAULT_CUSTOM_COLORS: CustomThemePalettes = {
  light: {
    primary: '#4e3f42',
    secondary: '#7b888e',
    accent: '#de4331',
    background: '#eeeeee',
    card: '#ffffff',
    surface: '#ffffff',
    border: '#ffffff',
  },
  dark: {
    primary: '#e8e0e0',
    secondary: '#9ca3af',
    accent: '#ef5a4a',
    background: '#1a1a2e',
    card: '#2a2a3d',
    surface: '#242438',
    border: '#3a3a4b',
  },
};

const isHexColor = (value: unknown): value is string =>
  typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value);

export const getSavedCustomColors = (): CustomThemePalettes => {
  if (typeof window === 'undefined') return DEFAULT_CUSTOM_COLORS;
  try {
    const parsed = JSON.parse(
      localStorage.getItem(STORAGE_KEY_CUSTOM_COLORS) ?? 'null',
    );
    const keys: (keyof CustomThemeColors)[] = [
      'primary',
      'secondary',
      'accent',
      'background',
      'card',
      'surface',
      'border',
    ];
    if (
      parsed &&
      ['light', 'dark'].every((mode) =>
        keys.every((key) => isHexColor(parsed[mode]?.[key])),
      )
    )
      return parsed as CustomThemePalettes;
  } catch {
    /* Ignore malformed storage and use defaults. */
  }
  return DEFAULT_CUSTOM_COLORS;
};

/** 系统暗色模式媒体查询 */
export const DARK_MEDIA_QUERY = '(prefers-color-scheme: dark)';

/**
 * 获取系统偏好的主题模式
 */
export const getSystemMode = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia(DARK_MEDIA_QUERY).matches ? 'dark' : 'light';
};

/**
 * 从 localStorage 读取保存的主题模式
 */
export const getSavedMode = (): ThemeMode => {
  if (typeof window === 'undefined') return 'system';
  const saved = localStorage.getItem(STORAGE_KEY_MODE);
  if (saved === 'light' || saved === 'dark' || saved === 'system') {
    return saved;
  }
  return 'system';
};

/**
 * 从 localStorage 读取保存的主题配色
 */
export const getSavedColor = (): ThemeColor => {
  if (typeof window === 'undefined') return 'default';
  const saved = localStorage.getItem(STORAGE_KEY_COLOR);
  if (
    saved === 'default' ||
    saved === 'ocean' ||
    saved === 'forest' ||
    saved === 'lavender' ||
    saved === 'sunset' ||
    saved === 'slate' ||
    saved === 'linear' ||
    saved === 'custom'
  ) {
    return saved;
  }
  return 'default';
};

/**
 * 解析实际生效的模式
 */
export const resolveMode = (mode: ThemeMode): 'light' | 'dark' => {
  if (mode === 'system') return getSystemMode();
  return mode;
};

/**
 * 将主题属性应用到 document.documentElement
 */
export const applyTheme = (
  resolved: 'light' | 'dark',
  color: ThemeColor,
  customColors?: CustomThemePalettes,
): void => {
  const root = document.documentElement;
  root.setAttribute('data-theme-mode', resolved);
  root.setAttribute('data-theme-color', color);
  const variables = [
    'primary',
    'secondary',
    'accent',
    'bg',
    'card',
    'card-solid',
    'border',
  ];
  variables.forEach((name) => root.style.removeProperty(`--color-${name}`));
  ['005', '008', '010', '020', '030', '040'].forEach((alpha) =>
    root.style.removeProperty(`--color-primary-alpha-${alpha}`),
  );
  ['008', '020'].forEach((alpha) =>
    root.style.removeProperty(`--color-accent-alpha-${alpha}`),
  );
  root.style.removeProperty('--color-card-hover');

  if (color === 'custom' && customColors) {
    const palette = customColors[resolved];
    root.style.setProperty('--color-primary', palette.primary);
    root.style.setProperty('--color-secondary', palette.secondary);
    root.style.setProperty('--color-accent', palette.accent);
    root.style.setProperty('--color-bg', palette.background);
    root.style.setProperty(
      '--color-card',
      `color-mix(in srgb, ${palette.card} 72%, transparent)`,
    );
    root.style.setProperty('--color-card-solid', palette.surface);
    root.style.setProperty('--color-border', palette.border);
    root.style.setProperty(
      '--color-card-hover',
      `color-mix(in srgb, ${palette.card} 90%, transparent)`,
    );
    const alphaValues = {
      '005': 5,
      '008': 8,
      '010': 10,
      '020': 20,
      '030': 30,
      '040': 40,
    };
    Object.entries(alphaValues).forEach(([name, amount]) =>
      root.style.setProperty(
        `--color-primary-alpha-${name}`,
        `color-mix(in srgb, ${palette.primary} ${amount}%, transparent)`,
      ),
    );
    root.style.setProperty(
      '--color-accent-alpha-008',
      `color-mix(in srgb, ${palette.accent} 8%, transparent)`,
    );
    root.style.setProperty(
      '--color-accent-alpha-020',
      `color-mix(in srgb, ${palette.accent} 20%, transparent)`,
    );
  }
};

/**
 * 主题管理 Hook
 * 须在 ThemeProvider 内使用，与 ThemeToggle 等组件共享状态
 */
export const useTheme = (): UseThemeReturn => {
  const context = useContext(ThemeContext);

  if (context === null) {
    throw new Error('useTheme 必须在 ThemeProvider 内使用');
  }

  return context;
};

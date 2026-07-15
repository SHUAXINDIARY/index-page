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
  | 'linear';

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
}

/** 主题 React 上下文 */
export const ThemeContext = createContext<UseThemeReturn | null>(null);

/** localStorage 存储的主题模式 key */
export const STORAGE_KEY_MODE = 'theme-mode';

/** localStorage 存储的主题配色 key */
export const STORAGE_KEY_COLOR = 'theme-color';

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
    saved === 'linear'
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
): void => {
  const root = document.documentElement;
  root.setAttribute('data-theme-mode', resolved);
  root.setAttribute('data-theme-color', color);
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

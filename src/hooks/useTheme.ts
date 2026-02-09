import { useState, useEffect, useCallback } from 'react';

/** 主题模式 */
type ThemeMode = 'light' | 'dark' | 'system';

/** 主题配色 */
type ThemeColor = 'default' | 'ocean' | 'forest' | 'lavender' | 'sunset';

/** useTheme 返回值类型 */
interface UseThemeReturn {
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

/** localStorage 存储的主题模式 key */
const STORAGE_KEY_MODE = 'theme-mode';

/** localStorage 存储的主题配色 key */
const STORAGE_KEY_COLOR = 'theme-color';

/** 系统暗色模式媒体查询 */
const DARK_MEDIA_QUERY = '(prefers-color-scheme: dark)';

/**
 * 获取系统偏好的主题模式
 */
const getSystemMode = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia(DARK_MEDIA_QUERY).matches ? 'dark' : 'light';
};

/**
 * 从 localStorage 读取保存的主题模式
 */
const getSavedMode = (): ThemeMode => {
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
const getSavedColor = (): ThemeColor => {
  if (typeof window === 'undefined') return 'default';
  const saved = localStorage.getItem(STORAGE_KEY_COLOR);
  if (
    saved === 'default' ||
    saved === 'ocean' ||
    saved === 'forest' ||
    saved === 'lavender' ||
    saved === 'sunset'
  ) {
    return saved;
  }
  return 'default';
};

/**
 * 解析实际生效的模式
 */
const resolveMode = (mode: ThemeMode): 'light' | 'dark' => {
  if (mode === 'system') return getSystemMode();
  return mode;
};

/**
 * 将主题属性应用到 document.documentElement
 */
const applyTheme = (resolved: 'light' | 'dark', color: ThemeColor) => {
  const root = document.documentElement;
  root.setAttribute('data-theme-mode', resolved);
  root.setAttribute('data-theme-color', color);
};

/**
 * 主题管理 Hook
 * 支持明暗模式切换、多配色切换、系统偏好跟随和 localStorage 持久化
 */
export const useTheme = (): UseThemeReturn => {
  const [mode, setModeState] = useState<ThemeMode>(getSavedMode);
  const [color, setColorState] = useState<ThemeColor>(getSavedColor);
  const [resolvedMode, setResolvedMode] = useState<'light' | 'dark'>(() =>
    resolveMode(getSavedMode()),
  );

  /** 设置主题模式 */
  const setMode = useCallback(
    (newMode: ThemeMode) => {
      setModeState(newMode);
      localStorage.setItem(STORAGE_KEY_MODE, newMode);
      const resolved = resolveMode(newMode);
      setResolvedMode(resolved);
      applyTheme(resolved, color);
    },
    [color],
  );

  /** 设置主题配色 */
  const setColor = useCallback(
    (newColor: ThemeColor) => {
      setColorState(newColor);
      localStorage.setItem(STORAGE_KEY_COLOR, newColor);
      applyTheme(resolvedMode, newColor);
    },
    [resolvedMode],
  );

  // 初始化时应用主题
  useEffect(() => {
    applyTheme(resolvedMode, color);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 监听系统主题偏好变化（仅在 system 模式下生效）
  useEffect(() => {
    if (mode !== 'system') return;

    const mediaQuery = window.matchMedia(DARK_MEDIA_QUERY);
    const handleChange = () => {
      const resolved = getSystemMode();
      setResolvedMode(resolved);
      applyTheme(resolved, color);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [mode, color]);

  return {
    mode,
    resolvedMode,
    color,
    setMode,
    setColor,
  };
};

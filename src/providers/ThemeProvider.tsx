import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  ThemeContext,
  DARK_MEDIA_QUERY,
  STORAGE_KEY_COLOR,
  STORAGE_KEY_MODE,
  applyTheme,
  getSavedColor,
  getSavedCustomColors,
  getSavedMode,
  getSystemMode,
  resolveMode,
  type ThemeColor,
  type ThemeMode,
  type UseThemeReturn,
  type CustomThemeColors,
  STORAGE_KEY_CUSTOM_COLORS,
} from '../hooks/themeContext';

/**
 * 全局主题 Provider，保证全站共享同一套主题状态
 */
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setModeState] = useState<ThemeMode>(getSavedMode);
  const [color, setColorState] = useState<ThemeColor>(getSavedColor);
  const [customColors, setCustomColorsState] = useState(getSavedCustomColors);
  const [resolvedMode, setResolvedMode] = useState<'light' | 'dark'>(() =>
    resolveMode(getSavedMode()),
  );

  /** 设置主题模式 */
  const setMode = useCallback((newMode: ThemeMode): void => {
    setModeState(newMode);
    localStorage.setItem(STORAGE_KEY_MODE, newMode);
    setResolvedMode(resolveMode(newMode));
  }, []);

  /** 设置主题配色 */
  const setColor = useCallback((newColor: ThemeColor): void => {
    setColorState(newColor);
    localStorage.setItem(STORAGE_KEY_COLOR, newColor);
  }, []);

  const setCustomColors = useCallback(
    (targetMode: 'light' | 'dark', colors: CustomThemeColors): void => {
      setCustomColorsState((current) => {
        const next = { ...current, [targetMode]: colors };
        localStorage.setItem(STORAGE_KEY_CUSTOM_COLORS, JSON.stringify(next));
        return next;
      });
    },
    [],
  );

  // 初始化时应用主题
  useEffect((): void => {
    applyTheme(resolvedMode, color, customColors);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 监听系统主题偏好变化（仅在 system 模式下生效）
  useEffect((): (() => void) | undefined => {
    if (mode !== 'system') return undefined;

    const mediaQuery = window.matchMedia(DARK_MEDIA_QUERY);
    const handleChange = (): void => {
      const resolved = getSystemMode();
      setResolvedMode(resolved);
      applyTheme(resolved, color, customColors);
    };

    mediaQuery.addEventListener('change', handleChange);
    return (): void => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [mode, color, customColors]);

  // mode / color 变化时同步 DOM
  useEffect((): void => {
    applyTheme(resolvedMode, color, customColors);
  }, [resolvedMode, color, customColors]);

  const value = useMemo(
    (): UseThemeReturn => ({
      mode,
      resolvedMode,
      color,
      setMode,
      setColor,
      customColors,
      setCustomColors,
    }),
    [
      mode,
      resolvedMode,
      color,
      setMode,
      setColor,
      customColors,
      setCustomColors,
    ],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

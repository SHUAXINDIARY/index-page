import { useContext } from 'react';
import { ThemeContext, type ThemeColor, type ThemeMode, type UseThemeReturn } from './themeContext';

export type { ThemeColor, ThemeMode, UseThemeReturn };

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

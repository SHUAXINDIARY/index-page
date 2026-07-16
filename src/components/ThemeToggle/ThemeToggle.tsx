import React, {
  useRef,
  useEffect,
  useCallback,
  useState,
  useMemo,
} from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Sun, Moon, Monitor, Image, Palette, RotateCcw } from 'lucide-react';
import {
  DEFAULT_CUSTOM_COLORS,
  useTheme,
  type CustomThemeColors,
} from '../../hooks/themeContext';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import './ThemeToggle.css';

/** 配色选项配置 */
const COLOR_OPTIONS = [
  { id: 'default' as const, label: '暖棕', color: '#4E3F42' },
  { id: 'ocean' as const, label: '海洋', color: '#2980B9' },
  { id: 'forest' as const, label: '森林', color: '#27AE60' },
  { id: 'lavender' as const, label: '薰衣草', color: '#8E44AD' },
  { id: 'sunset' as const, label: '日落', color: '#E67E22' },
  { id: 'slate' as const, label: '高级灰', color: '#2563EB' },
  { id: 'linear' as const, label: 'Linear', color: '#5E6AD2' },
] as const;

/** PC 端面板弹出动画配置 */
const PANEL_ANIMATION_PC = {
  initial: { opacity: 0, scale: 0.9, y: 10 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.9, y: 10 },
  transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] as const },
};

/** 移动端面板弹出动画配置 - 不使用 transform 避免覆盖 CSS 居中定位 */
const PANEL_ANIMATION_MOBILE = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] as const },
};

const hexToRgb = (hex: string): [number, number, number] => [
  Number.parseInt(hex.slice(1, 3), 16),
  Number.parseInt(hex.slice(3, 5), 16),
  Number.parseInt(hex.slice(5, 7), 16),
];

const relativeLuminance = (hex: string): number => {
  const channels = hexToRgb(hex).map((channel) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
};

const contrastRatio = (first: string, second: string): number => {
  const lighter = Math.max(relativeLuminance(first), relativeLuminance(second));
  const darker = Math.min(relativeLuminance(first), relativeLuminance(second));
  return (lighter + 0.05) / (darker + 0.05);
};

const getPanelColors = (
  surface: string,
  accent: string,
): React.CSSProperties => {
  // Near-black/white endpoints guarantee >= 4.5:1 after choosing the better contrast.
  const lightText = '#fefeff';
  const darkText = '#020203';
  const text =
    contrastRatio(surface, darkText) >= contrastRatio(surface, lightText)
      ? darkText
      : lightText;
  const accentText = contrastRatio(surface, accent) >= 4.5 ? accent : text;

  return {
    '--theme-panel-text': text,
    '--theme-panel-muted': text,
    '--theme-panel-border': `color-mix(in srgb, ${text} 18%, ${surface})`,
    '--theme-panel-hover': `color-mix(in srgb, ${text} 8%, ${surface})`,
    '--theme-panel-accent-text': accentText,
    '--theme-panel-accent-bg': `color-mix(in srgb, ${accent} 14%, ${surface})`,
    '--theme-panel-accent-border': `color-mix(in srgb, ${accentText} 42%, ${surface})`,
  } as React.CSSProperties;
};

/** ThemeToggle 组件属性 */
interface ThemeToggleProps {
  /** 样式变体：默认为圆形图标，badge 为徽章样式 */
  variant?: 'icon' | 'badge';
  /** 是否展示页面背景图 */
  backgroundImageEnabled?: boolean;
  /** 页面背景图开关回调 */
  onBackgroundImageChange?: (enabled: boolean) => void;
}

export const ThemeToggle = ({
  variant = 'icon',
  backgroundImageEnabled = false,
  onBackgroundImageChange,
}: ThemeToggleProps) => {
  const {
    mode,
    resolvedMode,
    color,
    setMode,
    setColor,
    customColors,
    setCustomColors,
  } = useTheme();
  const breakpoint = useBreakpoint();

  /** 是否为触控优先设备（移动端/平板端） */
  const isTouchFirst = breakpoint !== 'desktop';

  /** 面板是否打开 */
  const [isOpen, setIsOpen] = useState(false);
  const [customOpen, setCustomOpen] = useState(color === 'custom');

  const customFields: { key: keyof CustomThemeColors; label: string }[] = [
    { key: 'primary', label: '主文字' },
    { key: 'secondary', label: '次文字' },
    { key: 'accent', label: '强调色' },
    { key: 'background', label: '页面背景' },
    { key: 'card', label: '卡片背景' },
    { key: 'surface', label: '面板背景' },
    { key: 'border', label: '边框' },
  ];

  const openCustom = () => {
    setColor('custom');
    setCustomOpen(true);
  };

  const updateCustomColor = (key: keyof CustomThemeColors, value: string) => {
    setCustomColors(resolvedMode, {
      ...customColors[resolvedMode],
      [key]: value,
    });
  };

  /** 组件容器 ref，用于检测外部点击 */
  const containerRef = useRef<HTMLDivElement>(null);

  /** 根据设备选择动画配置 */
  const panelAnimation = isTouchFirst
    ? PANEL_ANIMATION_MOBILE
    : PANEL_ANIMATION_PC;

  const panelColors = useMemo(() => {
    if (color !== 'custom') return undefined;
    const palette = customColors[resolvedMode];
    return getPanelColors(palette.surface, palette.accent);
  }, [color, customColors, resolvedMode]);

  /** 切换面板开关 */
  const togglePanel = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  /** 点击外部关闭面板 */
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  /** 关闭面板 */
  const closePanel = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <div className="theme-toggle-container" ref={containerRef}>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* 触控设备蒙层 - 点击关闭 */}
            {isTouchFirst && (
              <motion.div
                className="theme-panel-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={closePanel}
              />
            )}
            <motion.div
              className="theme-panel"
              style={panelColors}
              {...panelAnimation}
            >
              {/* 模式切换 */}
              <div className="theme-panel-section">
                <div className="theme-mode-buttons">
                  <button
                    className={`theme-mode-btn ${mode === 'light' ? 'active' : ''}`}
                    onClick={() => setMode('light')}
                    title="浅色模式"
                  >
                    <Sun size={14} />
                    <span>浅色</span>
                  </button>
                  <button
                    className={`theme-mode-btn ${mode === 'dark' ? 'active' : ''}`}
                    onClick={() => setMode('dark')}
                    title="深色模式"
                  >
                    <Moon size={14} />
                    <span>深色</span>
                  </button>
                </div>
                <button
                  className={`theme-system-btn ${mode === 'system' ? 'active' : ''}`}
                  onClick={() => setMode('system')}
                  title="跟随系统"
                >
                  <Monitor size={14} />
                  <span>跟随系统</span>
                </button>
              </div>

              {/* 分割线 */}
              <div className="theme-panel-divider" />

              {/* 配色选择 */}
              <div className="theme-panel-section">
                <div className="theme-panel-label-row">
                  <div className="theme-panel-label">配色</div>
                  <label className="theme-background-toggle">
                    <input
                      type="checkbox"
                      checked={backgroundImageEnabled}
                      onChange={(event) =>
                        onBackgroundImageChange?.(event.target.checked)
                      }
                    />
                    <Image size={13} aria-hidden="true" />
                    <span>背景图</span>
                  </label>
                </div>
                <div className="theme-color-options">
                  {COLOR_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      className={`theme-color-dot ${color === option.id ? 'active' : ''}`}
                      style={
                        { '--dot-color': option.color } as React.CSSProperties
                      }
                      onClick={() => setColor(option.id)}
                      title={option.label}
                    />
                  ))}
                </div>
                <button
                  className={`theme-custom-trigger ${color === 'custom' ? 'active' : ''}`}
                  onClick={openCustom}
                  aria-expanded={customOpen}
                >
                  <Palette size={15} />
                  <span>自定义</span>
                  <span
                    className="theme-custom-preview"
                    style={{ background: customColors[resolvedMode].accent }}
                  />
                </button>
                {customOpen && color === 'custom' && (
                  <div className="theme-custom-editor">
                    <div className="theme-custom-header">
                      <span>
                        {resolvedMode === 'dark'
                          ? '深色模式配色'
                          : '浅色模式配色'}
                      </span>
                      <button
                        className="theme-custom-reset"
                        onClick={() =>
                          setCustomColors(
                            resolvedMode,
                            DEFAULT_CUSTOM_COLORS[resolvedMode],
                          )
                        }
                        title="恢复默认"
                      >
                        <RotateCcw size={13} />
                        <span>恢复</span>
                      </button>
                    </div>
                    <div className="theme-custom-grid">
                      {customFields.map((field) => (
                        <label className="theme-color-field" key={field.key}>
                          <input
                            type="color"
                            value={customColors[resolvedMode][field.key]}
                            onChange={(event) =>
                              updateCustomColor(field.key, event.target.value)
                            }
                            aria-label={field.label}
                          />
                          <span>{field.label}</span>
                          <code>
                            {customColors[resolvedMode][
                              field.key
                            ].toUpperCase()}
                          </code>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 切换按钮 */}
      {variant === 'badge' ? (
        <button
          className="toolbar-badge theme-toggle-badge"
          onClick={togglePanel}
          title="切换主题"
        >
          {resolvedMode === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
          <span>主题</span>
        </button>
      ) : (
        <button
          className="decorative-icon theme-toggle-btn"
          onClick={togglePanel}
          title="切换主题"
        >
          {resolvedMode === 'dark' ? '🌙' : '🎨'}
        </button>
      )}
    </div>
  );
};

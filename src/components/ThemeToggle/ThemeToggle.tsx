import React, { useRef, useEffect, useCallback, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import './ThemeToggle.css';

/** 配色选项配置 */
const COLOR_OPTIONS = [
  { id: 'default' as const, label: '暖棕', color: '#4E3F42' },
  { id: 'ocean' as const, label: '海洋', color: '#2980B9' },
  { id: 'forest' as const, label: '森林', color: '#27AE60' },
  { id: 'lavender' as const, label: '薰衣草', color: '#8E44AD' },
  { id: 'sunset' as const, label: '日落', color: '#E67E22' },
] as const;

/** 面板弹出动画配置 */
const PANEL_ANIMATION = {
  initial: { opacity: 0, scale: 0.9, y: 10 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.9, y: 10 },
  transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] as const },
};

/** ThemeToggle 组件属性 */
interface ThemeToggleProps {
  /** 样式变体：默认为圆形图标，badge 为徽章样式 */
  variant?: 'icon' | 'badge';
}

export const ThemeToggle = ({ variant = 'icon' }: ThemeToggleProps) => {
  const { mode, resolvedMode, color, setMode, setColor } = useTheme();

  /** 面板是否打开 */
  const [isOpen, setIsOpen] = useState(false);

  /** 组件容器 ref，用于检测外部点击 */
  const containerRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="theme-toggle-container" ref={containerRef}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="theme-panel"
            {...PANEL_ANIMATION}
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
              <div className="theme-panel-label">配色</div>
              <div className="theme-color-options">
                {COLOR_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    className={`theme-color-dot ${color === option.id ? 'active' : ''}`}
                    style={{ '--dot-color': option.color } as React.CSSProperties}
                    onClick={() => setColor(option.id)}
                    title={option.label}
                  />
                ))}
              </div>
            </div>
          </motion.div>
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

import type { CSSProperties, ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Github, Shuffle } from 'lucide-react';
import { ThemeToggle } from './components/ThemeToggle';
import { COMPACT_CARD_ORDER, GITHUB_REPO_URL } from './constant';
import type { Breakpoint } from './hooks/useBreakpoint';

/** 移动端和平板端布局所需的展示数据与交互回调。 */
interface H5Props {
  breakpoint: Exclude<Breakpoint, 'desktop'>;
  hasBackgroundImage: boolean;
  backgroundImageEnabled: boolean;
  containerStyle?: CSSProperties;
  backgroundLayer: ReactNode;
  renderCard: (cardId: string) => ReactNode;
  onBackgroundImageChange: (enabled: boolean) => void;
  onRefreshLayout: () => void;
}

/** 渲染移动端和平板端的紧凑卡片布局及底部工具栏。 */
const H5 = ({
  breakpoint,
  hasBackgroundImage,
  backgroundImageEnabled,
  containerStyle,
  backgroundLayer,
  renderCard,
  onBackgroundImageChange,
  onRefreshLayout,
}: H5Props) => {
  const prefersReducedMotion = useReducedMotion();
  /** 可见卡片索引计数器 */
  let visibleIndex = 0;

  return (
    <div
      className={`app-container app-container--compact${hasBackgroundImage ? ' app-container--with-background' : ''}${backgroundImageEnabled ? ' app-container--background-visible' : ''} ${breakpoint === 'tablet' ? 'app-container--tablet' : 'app-container--mobile'}`}
      style={containerStyle}
    >
      {backgroundLayer}
      <div className="compact-layout">
        {COMPACT_CARD_ORDER.map((cardId) => {
          const content = renderCard(cardId);
          if (!content) return null;
          const staggerIndex = visibleIndex++;
          return (
            <motion.div
              key={cardId}
              className={`compact-card compact-card--${cardId}`}
              // 保持首帧内容可见，避免淡入延迟首屏文字和头像的绘制。
              initial={prefersReducedMotion ? false : { y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: prefersReducedMotion ? 0 : 0.5,
                delay: prefersReducedMotion ? 0 : staggerIndex * 0.06,
                ease: [0.25, 1, 0.5, 1],
              }}
            >
              {content}
            </motion.div>
          );
        })}
      </div>

      {/* 底部固定工具栏 */}
      <motion.div
        className="fixed-toolbar"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6, ease: [0.25, 1, 0.5, 1] }}
      >
        <ThemeToggle
          variant="badge"
          backgroundImageEnabled={backgroundImageEnabled}
          onBackgroundImageChange={onBackgroundImageChange}
        />
        <button
          className="toolbar-badge shuffle-btn"
          onClick={onRefreshLayout}
          title="重新布局 (Cmd/Ctrl + R)"
        >
          <Shuffle size={14} />
          <span>重新布局</span>
        </button>
        <a
          href={GITHUB_REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="toolbar-badge"
        >
          <Github size={14} />
          <span>使用同款</span>
        </a>
      </motion.div>
    </div>
  );
};

export default H5;

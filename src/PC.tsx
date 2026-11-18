import type { CSSProperties, ReactNode } from 'react';
import { motion } from 'motion/react';
import { Github, Shuffle } from 'lucide-react';
import { ThemeToggle } from './components/ThemeToggle';
import { GITHUB_REPO_URL } from './constant';
import type { CardConfig, LayoutResult } from './hooks/useRandomLayout';

/** 桌面布局所需的卡片、布局数据与交互回调。 */
interface PCProps {
  cards: CardConfig[];
  layout: LayoutResult;
  hasBackgroundImage: boolean;
  backgroundImageEnabled: boolean;
  containerStyle?: CSSProperties;
  backgroundLayer: ReactNode;
  infiniteCanvasButton: ReactNode;
  renderCard: (cardId: string) => ReactNode;
  onBackgroundImageChange: (enabled: boolean) => void;
  onRefreshLayout: () => void;
}

/** 渲染桌面端的随机卡片布局及底部工具栏。 */
const PC = ({
  cards,
  layout,
  hasBackgroundImage,
  backgroundImageEnabled,
  containerStyle,
  backgroundLayer,
  infiniteCanvasButton,
  renderCard,
  onBackgroundImageChange,
  onRefreshLayout,
}: PCProps) => {
  /** 生成卡片位置目标值 - PC 端随机布局 */
  const getCardMotionProps = (cardId: string) => {
    const pos = layout.positions[cardId];
    if (!pos) return { style: {} as CSSProperties, animate: {} };
    return {
      style: {
        position: 'absolute' as const,
        width: pos.width,
        height: pos.height,
      },
      animate: {
        x: pos.x,
        y: pos.y,
      },
      transition: {
        type: 'spring' as const,
        stiffness: 200,
        damping: 28,
        mass: 0.8,
      },
    };
  };

  return (
    <div
      className={`app-container${hasBackgroundImage ? ' app-container--with-background' : ''}${backgroundImageEnabled ? ' app-container--background-visible' : ''}`}
      style={containerStyle}
    >
      {backgroundLayer}
      <div
        className="random-layout-container"
        style={{
          position: 'relative',
          width: layout.totalWidth,
          height: layout.totalHeight,
          transform: `scale(${layout.scale})`,
          transformOrigin: 'center center',
        }}
      >
        {cards.map(({ id }) => {
          const content = renderCard(id);
          if (!content) return null;
          return (
            <motion.div key={id} {...getCardMotionProps(id)}>
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
        {infiniteCanvasButton}
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

export default PC;

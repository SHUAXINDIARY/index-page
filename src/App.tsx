import './App.css';
import { UserCard } from './components/UserCard';
import { ImageCard } from './components/ImageCard';
import { WelcomeCard } from './components/WelcomeCard';
import { Clock } from './components/Clock';
import { ActionButton } from './components/ActionButton';
import { ArticleCard } from './components/ArticleCard';
import { OpenSourceCard } from './components/OpenSourceCard';
import { MusicPlayer } from './components/MusicPlayer';
import { SocialLinks } from './components/SocialLinks';
import { ThemeToggle } from './components/ThemeToggle';
import type { InfiniteCanvasItem } from './components/InfiniteCanvasView';
import { contentConfig } from './config/content';
import { Expand, Github, LocateFixed, Minimize2, Shuffle } from 'lucide-react';
import blogData from './config/blog-data.json';
import { useRandomLayout, type CardConfig } from './hooks/useRandomLayout';
import { useBreakpoint } from './hooks/useBreakpoint';
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import { motion, useReducedMotion } from 'motion/react';

/** GitHub 仓库地址 */
const GITHUB_REPO_URL = 'https://github.com/SHUAXINDIARY/index-page';
const BACKGROUND_EXIT_DURATION_MS = 380;

/** 卡片尺寸配置 - PC 端 */
const CARD_SIZES: Record<string, { width: number; height: number }> = {
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
const COMPACT_CARD_ORDER = [
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

/** 延迟加载日历组件，避免阻塞首屏渲染 */
const LazyCalendar = lazy(async () => {
  const module = await import('./components/Calendar');
  return { default: module.Calendar };
});

/** 延迟加载地图组件，避免 Canvas 地图占用首屏主线程 */
const LazyWorldMap = lazy(async () => {
  const module = await import('./components/WorldMap');
  return { default: module.WorldMap };
});

/** 仅在用户进入无限画布模式后加载画布运行时 */
const LazyInfiniteCanvasView = lazy(async () => {
  const module = await import('./components/InfiniteCanvasView');
  return { default: module.InfiniteCanvasView };
});

/** 延迟组件占位卡片 ID 类型 */
type DeferredCardId = 'calendar' | 'worldMap';

/** 延迟加载期间的轻量占位，保持布局稳定 */
const DeferredCardFallback = ({ cardId }: { cardId: DeferredCardId }) => {
  const cardSize = CARD_SIZES[cardId];
  return (
    <div
      aria-hidden="true"
      style={{
        width: '100%',
        height: '100%',
        minHeight: cardSize.height,
        borderRadius: 16,
        background: 'var(--card-bg-color, rgba(127, 127, 127, 0.12))',
      }}
    />
  );
};

const App = () => {
  const breakpoint = useBreakpoint();
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [backgroundImageEnabled, setBackgroundImageEnabled] = useState(false);
  const [infiniteCanvasEnabled, setInfiniteCanvasEnabled] = useState(false);
  const backgroundClearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const prefersReducedMotion = useReducedMotion();

  /** 是否使用紧凑布局（移动端 + 平板端） */
  const isCompact = breakpoint !== 'desktop';

  /** 卡片配置列表 */
  const cardConfigs: CardConfig[] = useMemo(
    () => [
      { id: 'user', size: CARD_SIZES.user },
      { id: 'article', size: CARD_SIZES.article },
      { id: 'openSource', size: CARD_SIZES.openSource },
      { id: 'social', size: CARD_SIZES.social },
      { id: 'image', size: CARD_SIZES.image },
      { id: 'welcome', size: CARD_SIZES.welcome },
      ...(contentConfig.worldMap
        ? [{ id: 'worldMap', size: CARD_SIZES.worldMap }]
        : []),
      { id: 'location', size: CARD_SIZES.location },
      { id: 'clock', size: CARD_SIZES.clock },
      { id: 'calendar', size: CARD_SIZES.calendar },
      { id: 'music', size: CARD_SIZES.music },
    ],
    [],
  );

  const { layout, refreshLayout } = useRandomLayout(cardConfigs);

  const handleBackgroundImageChange = useCallback(
    (enabled: boolean) => {
      if (backgroundClearTimerRef.current) {
        clearTimeout(backgroundClearTimerRef.current);
        backgroundClearTimerRef.current = null;
      }

      if (!enabled || contentConfig.images.length === 0) {
        setBackgroundImageEnabled(false);
        backgroundClearTimerRef.current = setTimeout(
          () => setBackgroundImage(null),
          prefersReducedMotion ? 0 : BACKGROUND_EXIT_DURATION_MS,
        );
        return;
      }

      const randomIndex = Math.floor(
        Math.random() * contentConfig.images.length,
      );
      setBackgroundImage(contentConfig.images[randomIndex].imageUrl);
      setBackgroundImageEnabled(true);
    },
    [prefersReducedMotion],
  );

  useEffect(
    () => () => {
      if (backgroundClearTimerRef.current) {
        clearTimeout(backgroundClearTimerRef.current);
      }
    },
    [],
  );

  const appBackgroundImage = backgroundImage
    ? `url("${backgroundImage}")`
    : undefined;
  const appContainerStyle = appBackgroundImage
    ? ({
        '--app-background-image': appBackgroundImage,
      } as CSSProperties)
    : undefined;

  const backgroundLayer = backgroundImage ? (
    <motion.div
      className="app-background-layer"
      aria-hidden="true"
      style={{ backgroundImage: appBackgroundImage }}
      initial={prefersReducedMotion ? false : { opacity: 0, scale: 1.025 }}
      animate={{
        opacity: backgroundImageEnabled ? 1 : 0,
        scale: backgroundImageEnabled ? 1 : 1.015,
        filter:
          backgroundImageEnabled || prefersReducedMotion
            ? 'blur(0px)'
            : 'blur(8px)',
      }}
      transition={{
        duration: prefersReducedMotion
          ? 0
          : backgroundImageEnabled
            ? 0.48
            : 0.36,
        ease: [0.22, 1, 0.36, 1],
      }}
    />
  ) : null;

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

  /** 渲染卡片内容 */
  const renderCard = (cardId: string) => {
    switch (cardId) {
      case 'user':
        return <UserCard config={contentConfig.user} />;
      case 'article':
        return (
          <ArticleCard
            config={{
              ...contentConfig.article,
              ...(blogData.latestPost || {}),
            }}
          />
        );
      case 'openSource':
        return <OpenSourceCard config={contentConfig.openSource} />;
      case 'social':
        return <SocialLinks links={contentConfig.socialLinks} />;
      case 'image':
        return <ImageCard images={contentConfig.images} />;
      case 'welcome':
        return <WelcomeCard config={contentConfig.welcome} />;
      case 'worldMap':
        return contentConfig.worldMap ? (
          <Suspense fallback={<DeferredCardFallback cardId="worldMap" />}>
            <LazyWorldMap config={contentConfig.worldMap} />
          </Suspense>
        ) : null;
      case 'location':
        return (
          <ActionButton icon={<LocateFixed size={16} />} label="中国 | 北京" />
        );
      case 'clock':
        return <Clock />;
      case 'calendar':
        return (
          <Suspense fallback={<DeferredCardFallback cardId="calendar" />}>
            <LazyCalendar />
          </Suspense>
        );
      case 'music':
        return <MusicPlayer config={contentConfig.music} />;
      default:
        return null;
    }
  };

  const infiniteCanvasItems: InfiniteCanvasItem[] = cardConfigs.flatMap(
    ({ id, size }) => {
      const position = layout.positions[id];
      const content = renderCard(id);
      if (!position || !content) return [];
      return [
        {
          id,
          x: position.x,
          y: position.y,
          width: size.width,
          height: size.height,
          content,
        },
      ];
    },
  );

  const infiniteCanvasButton = (
    <button
      className={`toolbar-badge canvas-mode-btn${infiniteCanvasEnabled ? ' is-active' : ''}`}
      onClick={() => setInfiniteCanvasEnabled((enabled) => !enabled)}
      title={infiniteCanvasEnabled ? '退出无限画布模式' : '进入无限画布模式'}
      aria-pressed={infiniteCanvasEnabled}
    >
      {infiniteCanvasEnabled ? <Minimize2 size={14} /> : <Expand size={14} />}
      <span>{infiniteCanvasEnabled ? '退出无限画布' : '无限画布模式'}</span>
    </button>
  );

  if (infiniteCanvasEnabled) {
    return (
      <div className="app-container app-container--infinite-canvas">
        <Suspense fallback={<div className="infinite-canvas-loading" />}>
          <LazyInfiniteCanvasView items={infiniteCanvasItems} />
        </Suspense>
        <motion.div
          className="fixed-toolbar"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {infiniteCanvasButton}
        </motion.div>
      </div>
    );
  }

  /** 移动端 & 平板端紧凑布局 */
  if (isCompact) {
    /** 可见卡片索引计数器 */
    let visibleIndex = 0;
    return (
      <div
        className={`app-container app-container--compact${backgroundImage ? ' app-container--with-background' : ''}${backgroundImageEnabled ? ' app-container--background-visible' : ''} ${breakpoint === 'tablet' ? 'app-container--tablet' : 'app-container--mobile'}`}
        style={appContainerStyle}
      >
        {backgroundLayer}
        <div className="compact-layout">
          {COMPACT_CARD_ORDER.map((cardId) => {
            if (cardId === 'worldMap' && !contentConfig.worldMap) return null;
            const content = renderCard(cardId);
            if (!content) return null;
            const staggerIndex = visibleIndex++;
            return (
              <motion.div
                key={cardId}
                className={`compact-card compact-card--${cardId}`}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: staggerIndex * 0.06,
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
            onBackgroundImageChange={handleBackgroundImageChange}
          />
          <button
            className="toolbar-badge shuffle-btn"
            onClick={refreshLayout}
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
  }

  /** PC 端随机布局 */
  return (
    <div
      className={`app-container${backgroundImage ? ' app-container--with-background' : ''}${backgroundImageEnabled ? ' app-container--background-visible' : ''}`}
      style={appContainerStyle}
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
        {/* User Card */}
        <motion.div {...getCardMotionProps('user')}>
          <UserCard config={contentConfig.user} />
        </motion.div>

        {/* Article Card */}
        <motion.div {...getCardMotionProps('article')}>
          <ArticleCard
            config={{
              ...contentConfig.article,
              ...(blogData.latestPost || {}),
            }}
          />
        </motion.div>

        {/* Open Source Projects */}
        <motion.div {...getCardMotionProps('openSource')}>
          <OpenSourceCard config={contentConfig.openSource} />
        </motion.div>

        {/* Social Links */}
        <motion.div {...getCardMotionProps('social')}>
          <SocialLinks links={contentConfig.socialLinks} />
        </motion.div>

        {/* Image Card */}
        <motion.div {...getCardMotionProps('image')}>
          <ImageCard images={contentConfig.images} />
        </motion.div>

        {/* Welcome Card */}
        <motion.div {...getCardMotionProps('welcome')}>
          <WelcomeCard config={contentConfig.welcome} />
        </motion.div>

        {/* World Map */}
        {contentConfig.worldMap && (
          <motion.div {...getCardMotionProps('worldMap')}>
            <Suspense fallback={<DeferredCardFallback cardId="worldMap" />}>
              <LazyWorldMap config={contentConfig.worldMap} />
            </Suspense>
          </motion.div>
        )}

        {/* Location Button */}
        <motion.div {...getCardMotionProps('location')}>
          <ActionButton icon={<LocateFixed size={16} />} label="中国 | 北京" />
        </motion.div>

        {/* Clock */}
        <motion.div {...getCardMotionProps('clock')}>
          <Clock />
        </motion.div>

        {/* Calendar */}
        <motion.div {...getCardMotionProps('calendar')}>
          <Suspense fallback={<DeferredCardFallback cardId="calendar" />}>
            <LazyCalendar />
          </Suspense>
        </motion.div>

        {/* Music Player */}
        <motion.div {...getCardMotionProps('music')}>
          <MusicPlayer config={contentConfig.music} />
        </motion.div>
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
          onBackgroundImageChange={handleBackgroundImageChange}
        />
        {infiniteCanvasButton}
        <button
          className="toolbar-badge shuffle-btn"
          onClick={refreshLayout}
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

export default App;

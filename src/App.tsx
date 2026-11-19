import './App.css';
import { UserCard } from './components/UserCard';
import { WelcomeCard } from './components/WelcomeCard';
import { Clock } from './components/Clock';
import { ActionButton } from './components/ActionButton';
import { DeferredCard } from './components/DeferredCard';
import { SocialLinks } from './components/SocialLinks';
import type { InfiniteCanvasItem } from './components/InfiniteCanvasView';
import { contentConfig, type MusicInfo } from './config/content';
import {
  Expand,
  LocateFixed,
  Minimize2,
} from 'lucide-react';
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
import {
  BACKGROUND_EXIT_DURATION_MS,
  CARD_SIZES,
} from './constant';

/** 按当前视口加载对应布局，避免两端布局同时进入首页初始包 */
const H5 = lazy(() => import('./H5'));
const PC = lazy(() => import('./PC'));

/** 次要卡片独立拆包，由可见性边界决定何时开始下载 */
const ImageCard = lazy(async () => {
  const module = await import('./components/ImageCard');
  return { default: module.ImageCard };
});
const ArticleCard = lazy(async () => {
  const module = await import('./components/ArticleCard');
  return { default: module.ArticleCard };
});
const OpenSourceCard = lazy(async () => {
  const module = await import('./components/OpenSourceCard');
  return { default: module.OpenSourceCard };
});
const MusicPlayer = lazy(async () => {
  // 组件与列表并行下载，Suspense 覆盖两者的下载和解析，避免先显示不可用的播放按钮。
  const [module, { default: musicData }] = await Promise.all([
    import('./components/MusicPlayer'),
    import('./config/bgm-data.json'),
  ]);
  /** 音乐卡片的基础配置 */
  interface LoadedMusicPlayerProps {
    /** 手动配置的列表优先于自动生成列表 */
    config: MusicInfo;
  }
  const LoadedMusicPlayer = ({ config }: LoadedMusicPlayerProps) => (
    <module.MusicPlayer
      config={{ ...config, urlList: config.urlList ?? musicData.urlList }}
    />
  );
  return { default: LoadedMusicPlayer };
});

/** 构建期文章数据保持稳定引用，避免背景等状态变化重复触发文章请求 */
const articleConfig = {
  ...contentConfig.article,
  ...(blogData.latestPost || {}),
};

/** 布局模块加载期间保留页面容器，并提供可访问的加载提示 */
const layoutFallback = (
  <div className="app-container" role="status">
    页面加载中…
  </div>
);

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
      // { id: 'image', size: CARD_SIZES.image },
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

  const { layout, refreshLayout } = useRandomLayout(
    cardConfigs,
    !isCompact || infiniteCanvasEnabled,
  );

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

  /** 渲染卡片内容 */
  const renderCard = (cardId: string) => {
    switch (cardId) {
      case 'user':
        return <UserCard config={contentConfig.user} />;
      case 'article':
        return (
          <DeferredCard cardId="article">
            <ArticleCard config={articleConfig} />
          </DeferredCard>
        );
      case 'openSource':
        return (
          <DeferredCard cardId="openSource">
            <OpenSourceCard config={contentConfig.openSource} />
          </DeferredCard>
        );
      case 'social':
        return <SocialLinks links={contentConfig.socialLinks} />;
      case 'image':
        return contentConfig.images.length > 0 ? (
          <DeferredCard
            cardId="image"
            loadMode={isCompact ? 'visible' : 'immediate'}
          >
            <ImageCard
              images={contentConfig.images}
              firstImagePriority={isCompact ? undefined : 'high'}
            />
          </DeferredCard>
        ) : null;
      case 'welcome':
        return <WelcomeCard config={contentConfig.welcome} />;
      case 'worldMap':
        return contentConfig.worldMap ? (
          <DeferredCard cardId="worldMap">
            <LazyWorldMap config={contentConfig.worldMap} />
          </DeferredCard>
        ) : null;
      case 'location':
        return (
          <ActionButton icon={<LocateFixed size={16} />} label="中国 | 北京" />
        );
      case 'clock':
        return <Clock />;
      case 'calendar':
        return (
          <DeferredCard cardId="calendar">
            <LazyCalendar />
          </DeferredCard>
        );
      case 'music':
        return (
          <DeferredCard cardId="music">
            <MusicPlayer config={contentConfig.music} />
          </DeferredCard>
        );
      default:
        return null;
    }
  };

  const infiniteCanvasItems: InfiniteCanvasItem[] = infiniteCanvasEnabled
    ? cardConfigs.flatMap(({ id, size }) => {
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
      })
    : [];

  const infiniteCanvasButton = (
    <button
      className={`toolbar-badge canvas-mode-btn${infiniteCanvasEnabled ? ' is-active' : ''}`}
      onClick={() => {
        setInfiniteCanvasEnabled((enabled) => !enabled);
      }}
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
    return (
      <Suspense fallback={layoutFallback}>
        <H5
          breakpoint={breakpoint}
          hasBackgroundImage={Boolean(backgroundImage)}
          backgroundImageEnabled={backgroundImageEnabled}
          containerStyle={appContainerStyle}
          backgroundLayer={backgroundLayer}
          renderCard={renderCard}
          onBackgroundImageChange={handleBackgroundImageChange}
          onRefreshLayout={refreshLayout}
        />
      </Suspense>
    );
  }

  /** PC 端随机布局 */
  return (
    <Suspense fallback={layoutFallback}>
      <PC
        cards={cardConfigs}
        layout={layout}
        hasBackgroundImage={Boolean(backgroundImage)}
        backgroundImageEnabled={backgroundImageEnabled}
        containerStyle={appContainerStyle}
        backgroundLayer={backgroundLayer}
        infiniteCanvasButton={infiniteCanvasButton}
        renderCard={renderCard}
        onBackgroundImageChange={handleBackgroundImageChange}
        onRefreshLayout={refreshLayout}
      />
    </Suspense>
  );
};

export default App;

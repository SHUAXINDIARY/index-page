import './App.css';
import { UserCard } from './components/UserCard';
import { ImageCard } from './components/ImageCard';
import { WelcomeCard } from './components/WelcomeCard';
import { Clock } from './components/Clock';
import { Calendar } from './components/Calendar';
import { ActionButton } from './components/ActionButton';
import { ArticleCard } from './components/ArticleCard';
import { MusicPlayer } from './components/MusicPlayer';
import { SocialLinks } from './components/SocialLinks';
import { WorldMap } from './components/WorldMap';
import { ThemeToggle } from './components/ThemeToggle';
import { contentConfig } from './config/content';
import { LocateFixed, Github, Shuffle } from 'lucide-react';
import blogData from './config/blog-data.json';
import { useRandomLayout, type CardConfig } from './hooks/useRandomLayout';
import { useIsMobile } from './hooks/useIsMobile';
import { useMemo, type CSSProperties } from 'react';

/** GitHub 仓库地址 */
const GITHUB_REPO_URL = 'https://github.com/SHUAXINDIARY/index-page';

/** 卡片尺寸配置 - PC 端 */
const CARD_SIZES: Record<string, { width: number; height: number }> = {
  user: { width: 280, height: 314 },
  article: { width: 280, height: 165 },
  social: { width: 280, height: 136 },
  image: { width: 240, height: 180 },
  welcome: { width: 320, height: 329 },
  worldMap: { width: 320, height: 200 },
  location: { width: 120, height: 40 },
  clock: { width: 195, height: 72 },
  calendar: { width: 300, height: 301 },
  music: { width: 320, height: 86 },
};

/** 移动端布局 - 渲染顺序 */
const MOBILE_CARD_ORDER = [
  'welcome',
  'user',
  'clock',
  'location',
  'image',
  'calendar',
  'article',
  'music',
  'worldMap',
  'social',
] as const;

const App = () => {
  const isMobile = useIsMobile();

  /** 卡片配置列表 */
  const cardConfigs: CardConfig[] = useMemo(
    () => [
      { id: 'user', size: CARD_SIZES.user },
      { id: 'article', size: CARD_SIZES.article },
      { id: 'social', size: CARD_SIZES.social },
      { id: 'image', size: CARD_SIZES.image },
      { id: 'welcome', size: CARD_SIZES.welcome },
      ...(contentConfig.worldMap ? [{ id: 'worldMap', size: CARD_SIZES.worldMap }] : []),
      { id: 'location', size: CARD_SIZES.location },
      { id: 'clock', size: CARD_SIZES.clock },
      { id: 'calendar', size: CARD_SIZES.calendar },
      { id: 'music', size: CARD_SIZES.music },
    ],
    []
  );

  const { layout, refreshLayout } = useRandomLayout(cardConfigs);

  /** 生成卡片样式 - PC 端随机布局 */
  const getCardStyle = (cardId: string): CSSProperties => {
    const pos = layout.positions[cardId];
    if (!pos) return {};
    return {
      position: 'absolute',
      left: pos.x,
      top: pos.y,
      width: pos.width,
      height: pos.height,
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
      case 'social':
        return <SocialLinks links={contentConfig.socialLinks} />;
      case 'image':
        return <ImageCard images={contentConfig.images} />;
      case 'welcome':
        return <WelcomeCard config={contentConfig.welcome} />;
      case 'worldMap':
        return contentConfig.worldMap ? <WorldMap config={contentConfig.worldMap} /> : null;
      case 'location':
        return <ActionButton icon={<LocateFixed size={16} />} label="中国 | 北京" />;
      case 'clock':
        return <Clock />;
      case 'calendar':
        return <Calendar />;
      case 'music':
        return <MusicPlayer config={contentConfig.music} />;
      default:
        return null;
    }
  };

  /** 移动端布局 */
  if (isMobile) {
    return (
      <div className="app-container app-container--mobile">
        <div className="mobile-layout">
          {MOBILE_CARD_ORDER.map((cardId) => {
            if (cardId === 'worldMap' && !contentConfig.worldMap) return null;
            const content = renderCard(cardId);
            if (!content) return null;
            return (
              <div key={cardId} className={`mobile-card mobile-card--${cardId}`}>
                {content}
              </div>
            );
          })}
        </div>

        {/* 底部固定工具栏 */}
        <div className="fixed-toolbar">
          <ThemeToggle variant="badge" />
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
        </div>
      </div>
    );
  }

  /** PC 端随机布局 */
  return (
    <div className="app-container">
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
        <div style={getCardStyle('user')}>
          <UserCard config={contentConfig.user} />
        </div>

        {/* Article Card */}
        <div style={getCardStyle('article')}>
          <ArticleCard
            config={{
              ...contentConfig.article,
              ...(blogData.latestPost || {}),
            }}
          />
        </div>

        {/* Social Links */}
        <div style={getCardStyle('social')}>
          <SocialLinks links={contentConfig.socialLinks} />
        </div>

        {/* Image Card */}
        <div style={getCardStyle('image')}>
          <ImageCard images={contentConfig.images} />
        </div>

        {/* Welcome Card */}
        <div style={getCardStyle('welcome')}>
          <WelcomeCard config={contentConfig.welcome} />
        </div>

        {/* World Map */}
        {contentConfig.worldMap && (
          <div style={getCardStyle('worldMap')}>
            <WorldMap config={contentConfig.worldMap} />
          </div>
        )}

        {/* Location Button */}
        <div style={getCardStyle('location')}>
          <ActionButton icon={<LocateFixed size={16} />} label="中国 | 北京" />
        </div>

        {/* Clock */}
        <div style={getCardStyle('clock')}>
          <Clock />
        </div>

        {/* Calendar */}
        <div style={getCardStyle('calendar')}>
          <Calendar />
        </div>

        {/* Music Player */}
        <div style={getCardStyle('music')}>
          <MusicPlayer config={contentConfig.music} />
        </div>
      </div>

      {/* 底部固定工具栏 */}
      <div className="fixed-toolbar">
        <ThemeToggle variant="badge" />
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
      </div>
    </div>
  );
};

export default App;

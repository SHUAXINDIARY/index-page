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
import { LocateFixed, Github } from 'lucide-react';
import blogData from './config/blog-data.json';

/** GitHub 仓库地址 */
const GITHUB_REPO_URL = 'https://github.com/SHUAXINDIARY/index-page';
const App = () => {
  return (
    <div className="app-container">
      <div className="content-grid">
        {/* Left Column */}
        <div className="left-column">
          <UserCard config={contentConfig.user} />
          <ArticleCard config={{
            ...contentConfig.article,
            ...(blogData.latestPost || {}),
          }} />
          <SocialLinks links={contentConfig.socialLinks} />
        </div>

        {/* Center Column */}
        <div className="center-column">
          <ImageCard images={contentConfig.images} />
          <WelcomeCard config={contentConfig.welcome} />
          {contentConfig.worldMap && (
            <WorldMap config={contentConfig.worldMap} />
          )}
          <div className="center-bottom">
            {/* <RecommendCard config={contentConfig.recommend} /> */}
          </div>
        </div>

        {/* Right Column */}
        <div className="right-column">
          <div className="right-top">
            <ActionButton icon={<LocateFixed size={16} />} label="中国 | 北京" />
            <Clock />
          </div>
          <Calendar />
          <MusicPlayer config={contentConfig.music} />
          <div className="decorative-items">
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* 右下角 GitHub 提示 */}
      <a
        href={GITHUB_REPO_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="github-badge"
      >
        <Github size={14} />
        <span>使用同款</span>
      </a>
    </div>
  );
};

export default App;

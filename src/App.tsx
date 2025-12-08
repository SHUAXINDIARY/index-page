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
import { contentConfig } from './config/content';
import { LocateFixed } from 'lucide-react';
import blogData from './config/blog-data.json';
import { RecommendCard } from './components/RecommendCard';
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
          <ImageCard
            imageUrl={contentConfig.images[0].imageUrl}
            alt={contentConfig.images[0].alt}
          />
          <WelcomeCard config={contentConfig.welcome} />
          <div className="center-bottom">
            <RecommendCard config={contentConfig.recommend} />
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
            {/* <div className="decorative-icon">🎵</div> */}
            <div className="decorative-icon">🎨</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;

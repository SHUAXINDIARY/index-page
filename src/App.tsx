import './App.css';
import { UserCard } from './components/UserCard';
import { ImageCard } from './components/ImageCard';
import { WelcomeCard } from './components/WelcomeCard';
import { Clock } from './components/Clock';
import { Calendar } from './components/Calendar';
import { ActionButton } from './components/ActionButton';
import { ArticleCard } from './components/ArticleCard';
import { RecommendCard } from './components/RecommendCard';
import { MusicPlayer } from './components/MusicPlayer';
import { SocialLinks } from './components/SocialLinks';

const App = () => {
  return (
    <div className="app-container">
      <div className="content-grid">
        {/* Left Column */}
        <div className="left-column">
          <UserCard />
          <ArticleCard />
        </div>

        {/* Center Column */}
        <div className="center-column">
          <ImageCard imageUrl="https://api.dicebear.com/7.x/fun-emoji/svg?seed=cat" alt="cute cat" />
          <WelcomeCard />
          <div className="center-bottom">
            <SocialLinks />
            <RecommendCard />
          </div>
        </div>

        {/* Right Column */}
        <div className="right-column">
          <div className="right-top">
            <ActionButton label="写文章" />
            <Clock />
          </div>
          <Calendar />
          <MusicPlayer />
          <div className="decorative-items">
            <div className="decorative-icon">🎵</div>
            <div className="decorative-icon">🎨</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;

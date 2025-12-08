import './App.css';
import { useState } from 'react';
import { UserCard } from './components/UserCard';
import { ImageCard } from './components/ImageCard';
import { WelcomeCard } from './components/WelcomeCard';
import { Clock } from './components/Clock';
import { Calendar } from './components/Calendar';
import { ActionButton } from './components/ActionButton';
import { ArticleCard } from './components/ArticleCard';
import { MusicPlayer } from './components/MusicPlayer';
import { SocialLinks } from './components/SocialLinks';
import { DraggableGrid } from './components/DraggableGrid';
import { contentConfig } from './config/content';
import { LocateFixed, RotateCcw } from 'lucide-react';
import blogData from './config/blog-data.json';

const App = () => {
  const [gridKey, setGridKey] = useState(0);

  // 重置布局
  const handleResetLayout = () => {
    localStorage.removeItem('index-page-layout');
    setGridKey(prev => prev + 1);
  };
  // 准备所有卡片组件
  const cards = [
    // Left Column
    <UserCard config={contentConfig.user} />,
    <ArticleCard config={{
      ...contentConfig.article,
      ...(blogData.latestPost || {}),
    }} />,
    
    // Center Column
    <ImageCard
      imageUrl={contentConfig.images[0].imageUrl}
      alt={contentConfig.images[0].alt}
    />,
    <WelcomeCard config={contentConfig.welcome} />,
    <SocialLinks links={contentConfig.socialLinks} />,
    
    // Right Column
    <ActionButton icon={<LocateFixed size={16} />} label="中国 | 北京" />,
    <Clock />,
    <Calendar />,
    <MusicPlayer config={contentConfig.music} />,
    <div className="decorative-icon">🎨</div>,
  ];

  return (
    <div className="app-container">
      {/* 重置布局按钮 */}
      <button className="reset-layout-button" onClick={handleResetLayout} title="重置布局">
        <RotateCcw size={18} />
        <span>重置布局</span>
      </button>
      
      <DraggableGrid key={gridKey} storageKey="index-page-layout">
        {cards}
      </DraggableGrid>
    </div>
  );
};

export default App;

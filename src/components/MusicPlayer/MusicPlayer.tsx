import { Play } from 'lucide-react';
import { Card } from '../Card';
import './MusicPlayer.css';

export const MusicPlayer = () => {
  return (
    <Card className="music-player">
      <div className="music-info">
        <span className="music-label">随机播放</span>
        <h4 className="music-title">橘凯音乐</h4>
        <div className="music-progress">
          <div className="music-progress-bar" style={{ width: '40%' }}></div>
        </div>
      </div>
      <button className="music-play-button">
        <Play size={24} fill="white" />
      </button>
    </Card>
  );
};


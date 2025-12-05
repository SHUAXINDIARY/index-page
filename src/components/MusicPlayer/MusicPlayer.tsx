import { Play } from 'lucide-react';
import { Card } from '../Card';
import './MusicPlayer.css';
import type { MusicInfo } from '../../config/content';

interface MusicPlayerProps {
  config: MusicInfo;
}

export const MusicPlayer = ({ config }: MusicPlayerProps) => {
  return (
    <Card className="music-player">
      <div className="music-info">
        <span className="music-label">{config.label}</span>
        <h4 className="music-title">{config.title}</h4>
        <div className="music-progress">
          <div className="music-progress-bar" style={{ width: `${config.progress}%` }}></div>
        </div>
      </div>
      <button className="music-play-button">
        <Play size={24} fill="white" />
      </button>
    </Card>
  );
};


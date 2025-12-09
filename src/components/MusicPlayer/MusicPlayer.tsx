import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward } from 'lucide-react';
import { Card } from '../Card';
import './MusicPlayer.css';
import type { MusicInfo, MusicTrack } from '../../config/content';

interface MusicPlayerProps {
  config: MusicInfo;
}

export const MusicPlayer = ({ config }: MusicPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 随机选择一首音乐
  const getRandomTrack = (): MusicTrack | null => {
    if (!config.urlList || config.urlList.length === 0) {
      return null;
    }
    const randomIndex = Math.floor(Math.random() * config.urlList.length);
    return config.urlList[randomIndex];
  };

  // 初始化音频元素并添加事件监听
  const initAudio = (track: MusicTrack) => {
    // 清理旧的音频
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }

    const audio = new Audio(track.url);
    audioRef.current = audio;
    setCurrentTrack(track);
    setProgress(0);

    // 监听播放进度
    audio.addEventListener('timeupdate', () => {
      const progress = (audio.currentTime / audio.duration) * 100;
      setProgress(progress);
    });

    // 监听播放结束
    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      setProgress(0);
    });

    // 监听错误
    audio.addEventListener('error', (e) => {
      console.error('音频加载失败:', e);
      setIsPlaying(false);
      setIsLoading(false);
    });

    return audio;
  };

  // 播放/暂停切换
  const togglePlay = () => {
    // 防止重复点击
    if (isLoading) return;

    if (!audioRef.current) {
      // 第一次点击，创建音频元素并随机选择一首歌
      const track = getRandomTrack();
      if (!track) {
        console.warn('没有可播放的音乐');
        return;
      }

      setIsLoading(true);
      const audio = initAudio(track);
      audio.play().then(() => {
        setIsPlaying(true);
        setIsLoading(false);
      }).catch(error => {
        console.error('播放失败:', error);
        setIsLoading(false);
      });
    } else {
      // 已有音频元素，切换播放/暂停
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(error => {
          console.error('播放失败:', error);
        });
      }
    }
  };

  // 切换到下一首
  const playNext = () => {
    // 防止重复点击
    if (isLoading) return;

    const track = getRandomTrack();
    if (!track) {
      console.warn('没有可播放的音乐');
      return;
    }

    setIsLoading(true);
    const audio = initAudio(track);
    audio.play().then(() => {
      setIsPlaying(true);
      setIsLoading(false);
    }).catch(error => {
      console.error('播放失败:', error);
      setIsPlaying(false);
      setIsLoading(false);
    });
  };

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return (
    <Card className="music-player">
      <div className="music-info">
        <span className="music-label">{config.label}</span>
        <h4 className="music-title">
          {currentTrack ? currentTrack.name : config.title}
        </h4>
        <div className="music-progress">
          <div 
            className="music-progress-bar" 
            style={{ width: `${isPlaying ? progress : config.progress}%` }}
          ></div>
        </div>
      </div>
      <div className="music-controls">
        <button className="music-play-button" onClick={togglePlay} disabled={isLoading}>
          {isPlaying ? (
            <Pause size={24} fill="white" />
          ) : (
            <Play size={24} fill="white" />
          )}
        </button>
        <button 
          className="music-next-button" 
          onClick={playNext}
          disabled={isLoading || !config.urlList || config.urlList.length === 0}
        >
          <SkipForward size={20} />
        </button>
      </div>
    </Card>
  );
};


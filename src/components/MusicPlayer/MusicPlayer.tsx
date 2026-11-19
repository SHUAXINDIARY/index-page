import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Play, Pause, SkipForward } from 'lucide-react';
import { Card } from '../Card';
import '../LoadingIndicator/LoadingIndicator.css';
import './MusicPlayer.css';
import type { MusicInfo, MusicTrack } from '../../config/content';

/** 已完成列表加载的播放器配置 */
interface MusicPlayerProps {
  /** 播放文案与可用曲目 */
  config: MusicInfo;
}

export const MusicPlayer = ({ config }: MusicPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasTracks = Boolean(config.urlList?.length);

  // 随机选择一首音乐
  const getRandomTrack = (): MusicTrack | null => {
    if (!config.urlList || config.urlList.length === 0) {
      return null;
    }
    const randomIndex = Math.floor(Math.random() * config.urlList.length);
    return config.urlList[randomIndex];
  };

  // 初始化音频元素并添加事件监听
  const initAudio = (track: MusicTrack): Promise<HTMLAudioElement> => {
    return new Promise((resolve, reject) => {
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

      // 监听音频可以播放时（资源加载完成）
      const handleCanPlay = () => {
        audio.removeEventListener('canplaythrough', handleCanPlay);
        audio.removeEventListener('error', handleError);
        resolve(audio);
      };

      // 监听错误
      const handleError = (e: Event) => {
        console.error('音频加载失败:', e);
        audio.removeEventListener('canplaythrough', handleCanPlay);
        audio.removeEventListener('error', handleError);
        setIsPlaying(false);
        setIsLoading(false);
        reject(e);
      };

      audio.addEventListener('canplaythrough', handleCanPlay);
      audio.addEventListener('error', handleError);

      // 监听播放进度
      audio.addEventListener('timeupdate', () => {
        if (audio.duration) {
          const progress = (audio.currentTime / audio.duration) * 100;
          setProgress(progress);
        }
      });

      // 监听播放结束
      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        setProgress(0);
      });
    });
  };

  // 播放/暂停切换
  const togglePlay = async () => {
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
      try {
        const audio = await initAudio(track);
        await audio.play();
        setIsPlaying(true);
        setIsLoading(false);
      } catch (error) {
        console.error('播放失败:', error);
        setIsLoading(false);
      }
    } else {
      // 已有音频元素，切换播放/暂停
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        try {
          await audioRef.current.play();
          setIsPlaying(true);
        } catch (error) {
          console.error('播放失败:', error);
        }
      }
    }
  };

  // 切换到下一首
  const playNext = async () => {
    // 防止重复点击
    if (isLoading) return;

    const track = getRandomTrack();
    if (!track) {
      console.warn('没有可播放的音乐');
      return;
    }

    setIsLoading(true);
    try {
      const audio = await initAudio(track);
      await audio.play();
      setIsPlaying(true);
      setIsLoading(false);
    } catch (error) {
      console.error('播放失败:', error);
      setIsPlaying(false);
      setIsLoading(false);
    }
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
        <h4 className="music-title" aria-level={2}>
          {isLoading
            ? '正在加载音乐…'
            : currentTrack
              ? currentTrack.name
              : hasTracks
                ? config.title
                : '暂无可播放的音乐'}
        </h4>
        <div
          className="music-progress"
          role="progressbar"
          aria-label="音乐播放进度"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={currentTrack ? Math.round(progress) : 0}
          aria-valuetext={currentTrack ? `${Math.round(progress)}%` : '尚未播放音乐'}
        >
          <div 
            className={`music-progress-bar${isPlaying ? ' music-progress-bar--playing' : ''}`}
            style={{ width: `${isPlaying ? progress : config.progress}%` }}
          />
        </div>
      </div>
      <div className="music-controls">
        <motion.button
          type="button"
          aria-label={isLoading ? '正在加载音乐' : isPlaying ? '暂停音乐' : '播放音乐'}
          aria-pressed={isPlaying}
          aria-busy={isLoading}
          className="music-play-button"
          onClick={togglePlay}
          disabled={isLoading || !hasTracks}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {isLoading ? (
              <motion.span
                key="loading"
                className="music-icon-wrapper"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <progress
                  className="loading-indicator__spinner"
                  aria-label="正在加载音乐"
                />
              </motion.span>
            ) : isPlaying ? (
              <motion.span
                key="pause"
                className="music-icon-wrapper"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Pause size={24} fill="white" />
              </motion.span>
            ) : (
              <motion.span
                key="play"
                className="music-icon-wrapper"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Play size={24} fill="white" />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
        <motion.button
          type="button"
          aria-label="下一首音乐"
          className="music-next-button"
          onClick={playNext}
          disabled={isLoading || !hasTracks}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
        >
          <SkipForward size={20} aria-hidden="true" />
        </motion.button>
      </div>
    </Card>
  );
};


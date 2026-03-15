import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Card } from '../Card';
import './Clock.css';
import dayjs from 'dayjs';

/** 数字翻转动画时长（秒） */
const FLIP_DURATION = 0.35;

/** 数字翻转 - 单个字符动画组件 */
const FlipDigit = ({ value, className }: { value: string; className?: string }) => (
  <span className={`clock-digit-slot ${className || ''}`}>
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={value}
        className="clock-digit"
        initial={{ y: '0.4em', opacity: 0, filter: 'blur(2px)' }}
        animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
        exit={{ y: '-0.4em', opacity: 0, filter: 'blur(2px)' }}
        transition={{ duration: FLIP_DURATION, ease: [0.25, 1, 0.5, 1] }}
      >
        {value}
      </motion.span>
    </AnimatePresence>
  </span>
);

export const Clock = () => {
  /** 当前时间 */
  const [time, setTime] = useState(dayjs());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(dayjs());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  /** 时:分 字符串 */
  const hm = time.format('HH:mm');
  /** 秒数字符串 */
  const ss = time.format('ss');

  return (
    <Card className="clock-card">
      <div className="clock-time">
        <span className="clock-hm">{hm}</span>
        <span className="clock-seconds">
          :
          <FlipDigit value={ss[0]} />
          <FlipDigit value={ss[1]} />
        </span>
      </div>
    </Card>
  );
};


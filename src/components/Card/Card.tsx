import type { CSSProperties, ReactNode } from 'react';
import { useState } from 'react';
import { motion } from 'motion/react';
import './Card.css';

/** 随机延迟范围（秒） */
const RANDOM_DELAY_MIN = 0;
const RANDOM_DELAY_MAX = 0.15;

/** 随机动画时长范围（秒） */
const RANDOM_DURATION_MIN = 0.35;
const RANDOM_DURATION_MAX = 0.5;

/** 随机 Y 轴偏移范围（像素） */
const RANDOM_Y_MIN = 15;
const RANDOM_Y_MAX = 30;

/** 生成指定范围内的随机数 */
const randomInRange = (min: number, max: number) => min + Math.random() * (max - min);

/** 生成随机动画参数 */
const createAnimationParams = () => ({
  randomDelay: randomInRange(RANDOM_DELAY_MIN, RANDOM_DELAY_MAX),
  duration: randomInRange(RANDOM_DURATION_MIN, RANDOM_DURATION_MAX),
  y: randomInRange(RANDOM_Y_MIN, RANDOM_Y_MAX),
});

/** Card 组件属性 */
interface CardProps {
  /** 子元素 */
  children: ReactNode;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: CSSProperties;
  /** 点击回调 */
  onClick?: () => void;
  /** 基础动画延迟时间（秒），会在此基础上叠加随机值 */
  delay?: number;
}

export const Card = ({ children, className = '', style, onClick, delay = 0 }: CardProps) => {
  /** 随机动画参数，使用惰性初始化确保只在首次渲染时生成 */
  const [animationParams] = useState(createAnimationParams);

  return (
    <motion.div
      className={`card ${className}`}
      style={style}
      onClick={onClick}
      initial={{ opacity: 0, y: animationParams.y, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: animationParams.duration,
        delay: delay + animationParams.randomDelay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      {children}
    </motion.div>
  );
};


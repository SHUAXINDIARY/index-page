import type { CSSProperties, PointerEvent, ReactNode } from 'react';
import { useId, useRef, useState } from 'react';
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from 'motion/react';
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

/** 3D 倾斜最大角度（度） */
const MAX_ROTATE_X = 11;
const MAX_ROTATE_Y = 14;

const TILT_SPRING = { stiffness: 190, damping: 21, mass: 0.72 };

/** 生成指定范围内的随机数 */
const randomInRange = (min: number, max: number) =>
  min + Math.random() * (max - min);

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

export const Card = ({
  children,
  className = '',
  style,
  onClick,
  delay = 0,
}: CardProps) => {
  /** 随机动画参数，使用惰性初始化确保只在首次渲染时生成 */
  const [animationParams] = useState(createAnimationParams);
  const cardRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const rotateX = useSpring(useMotionValue(0), TILT_SPRING);
  const rotateY = useSpring(useMotionValue(0), TILT_SPRING);
  const filterId = `liquid-glass-${useId().replace(/:/g, '')}`;
  const cardStyle = {
    ...style,
    '--liquid-glass-filter': `url(#${filterId})`,
  } as CSSProperties;

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || event.pointerType !== 'mouse') return;

    const card = cardRef.current;
    if (!card) return;

    const bounds = card.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width;
    const y = (event.clientY - bounds.top) / bounds.height;

    rotateX.set((0.5 - y) * MAX_ROTATE_X * 2);
    rotateY.set((x - 0.5) * MAX_ROTATE_Y * 2);
    card.style.setProperty('--card-glare-x', `${x * 100}%`);
    card.style.setProperty('--card-glare-y', `${y * 100}%`);
    card.style.setProperty('--card-glare-opacity', '1');
  };

  const resetTilt = () => {
    rotateX.set(0);
    rotateY.set(0);
    cardRef.current?.style.setProperty('--card-glare-opacity', '0');
  };

  return (
    <motion.div
      className="card-animation-wrapper"
      initial={{ opacity: 0, y: animationParams.y, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: animationParams.duration,
        delay: delay + animationParams.randomDelay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      <svg className="liquid-glass-filter" aria-hidden="true">
        <defs>
          <filter
            id={filterId}
            x="-12%"
            y="-12%"
            width="124%"
            height="124%"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="0.7"
              result="blurred"
            />
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.008 0.014"
              numOctaves="2"
              seed="7"
              result="displacementMap"
            />
            <feDisplacementMap
              in="blurred"
              in2="displacementMap"
              scale="22"
              xChannelSelector="R"
              yChannelSelector="G"
              result="refracted"
            />
            <feColorMatrix in="refracted" type="saturate" values="1.35" />
          </filter>
        </defs>
      </svg>
      <motion.div
        ref={cardRef}
        className={`card ${className}`}
        style={{ ...cardStyle, rotateX, rotateY }}
        whileHover={prefersReducedMotion ? undefined : { y: -10, scale: 1.035 }}
        whileTap={prefersReducedMotion ? undefined : { scale: 0.99 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        onPointerMove={handlePointerMove}
        onPointerLeave={resetTilt}
        onPointerCancel={resetTilt}
        onClick={onClick}
      >
        <span className="card-glare" aria-hidden="true" />
        {children}
      </motion.div>
    </motion.div>
  );
};

import type {
  CSSProperties,
  MouseEventHandler,
  PointerEventHandler,
  ReactNode,
  RefObject,
} from 'react';
import type { MotionValue } from 'motion/react';
import { motion } from 'motion/react';
import './HtmlInCanvasCard.css';

/** HTMLInCanvas 模式下的 Card 渲染属性。 */
interface HtmlInCanvasCardProps {
  children: ReactNode;
  cardRef: RefObject<HTMLDivElement>;
  className: string;
  style: CSSProperties & {
    rotateX: MotionValue<number>;
    rotateY: MotionValue<number>;
  };
  reduceMotion: boolean;
  onClick?: MouseEventHandler<HTMLDivElement>;
  onPointerMove: PointerEventHandler<HTMLDivElement>;
  onPointerLeave: PointerEventHandler<HTMLDivElement>;
  onPointerCancel: PointerEventHandler<HTMLDivElement>;
}

/** 渲染 HTMLInCanvas 模式中的高对比度卡片。 */
export const HtmlInCanvasCard = ({
  children,
  cardRef,
  className,
  style,
  reduceMotion,
  onClick,
  onPointerMove,
  onPointerLeave,
  onPointerCancel,
}: HtmlInCanvasCardProps) => (
  <motion.div
    ref={cardRef}
    className={`card html-in-canvas-card ${className}`}
    style={style}
    whileHover={reduceMotion ? undefined : { y: -10, scale: 1.035 }}
    whileTap={reduceMotion ? undefined : { scale: 0.99 }}
    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    onPointerMove={onPointerMove}
    onPointerLeave={onPointerLeave}
    onPointerCancel={onPointerCancel}
    onClick={onClick}
  >
    {children}
  </motion.div>
);

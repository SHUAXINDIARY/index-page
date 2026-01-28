import type { MouseEvent, PointerEvent, ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import './Carousel.css';

/** 轮播图子项数据 */
export interface CarouselItem {
  /** 唯一标识 */
  key: string;
  /** 渲染内容 */
  content: ReactNode;
  /** 全屏模式下的渲染内容（可选，默认使用 content） */
  fullscreenContent?: ReactNode;
}

/** 轮播图组件属性 */
export interface CarouselProps {
  /** 轮播项列表 */
  items: CarouselItem[];
  /** 轮播间隔（毫秒），默认 3000ms */
  interval?: number;
  /** 是否暂停自动轮播 */
  paused?: boolean;
  /** 轨道容器的 className */
  trackClassName?: string;
  /** 单个 slide 的 className */
  slideClassName?: string;
  /** 指示器容器的 className */
  indicatorClassName?: string;
  /** 是否显示指示器，默认 true */
  showIndicators?: boolean;
  /** 鼠标 hover 时是否暂停自动轮播，默认 true */
  pauseOnHover?: boolean;
  /** 是否启用点击全屏功能，默认 false */
  enableFullscreen?: boolean;
  /** 全屏模式下的 slide className */
  fullscreenSlideClassName?: string;
  /** 全屏模式下的指示器 className */
  fullscreenIndicatorClassName?: string;
  /** 当前索引变化回调 */
  onIndexChange?: (index: number) => void;
}

/** 拖拽移动阈值（像素） */
const DRAG_MOVE_THRESHOLD = 6;

export const Carousel = ({
  items,
  interval = 3000,
  paused = false,
  trackClassName = '',
  slideClassName = '',
  indicatorClassName = '',
  showIndicators = true,
  pauseOnHover = true,
  enableFullscreen = false,
  fullscreenSlideClassName = '',
  fullscreenIndicatorClassName = '',
  onIndexChange,
}: CarouselProps) => {
  /** 轮播项数量 */
  const itemCount = items.length;
  /** 是否启用循环轮播 */
  const hasLoop = itemCount > 1;

  /** 构建包含首尾克隆项的 slides 数组，用于无缝循环 */
  const slides = useMemo(
    () =>
      hasLoop
        ? [items[itemCount - 1], ...items, items[0]]
        : items,
    [items, hasLoop, itemCount],
  );

  /** 当前位置索引（包含克隆项） */
  const [position, setPosition] = useState(hasLoop ? 1 : 0);
  /** 拖拽偏移量 */
  const [dragOffset, setDragOffset] = useState(0);
  /** 是否正在拖拽 */
  const [isDragging, setIsDragging] = useState(false);
  /** 是否禁用过渡动画 */
  const [isTransitionDisabled, setIsTransitionDisabled] = useState(false);
  /** 鼠标是否 hover 在轮播区域 */
  const [isHovered, setIsHovered] = useState(false);
  /** 是否全屏显示 */
  const [isFullscreen, setIsFullscreen] = useState(false);

  /** 拖拽状态 ref */
  const dragState = useRef({
    startX: 0,
    hasMoved: false,
  });
  /** 当前捕获的 pointer ID */
  const pointerIdRef = useRef<number | null>(null);
  /** 过渡重置 RAF ID */
  const transitionResetRaf = useRef<number | null>(null);

  /** 轨道 transform 样式 */
  const trackTransform = useMemo(
    () => `translate3d(calc(-${position * 100}% + ${dragOffset}px), 0, 0)`,
    [position, dragOffset],
  );

  /** 轨道 transition 样式 */
  const trackTransition = useMemo(
    () => (isDragging || isTransitionDisabled ? 'none' : 'transform 320ms ease'),
    [isDragging, isTransitionDisabled],
  );

  /** slides 总数（包含克隆项） */
  const slidesLength = slides.length;

  /** 当前激活的真实索引 */
  const activeIndex = hasLoop
    ? (position - 1 + itemCount) % itemCount
    : position;

  /** 是否应该暂停自动轮播 */
  const shouldPause = paused || isDragging || isFullscreen || (pauseOnHover && isHovered);

  // 自动轮播
  useEffect(() => {
    if (!hasLoop || shouldPause) return;

    const timer = window.setInterval(() => {
      setPosition((prev) =>
        prev >= slidesLength - 1 ? slidesLength - 1 : prev + 1,
      );
    }, interval);

    return () => window.clearInterval(timer);
  }, [hasLoop, slidesLength, interval, shouldPause]);

  // 索引变化回调
  useEffect(() => {
    onIndexChange?.(activeIndex);
  }, [activeIndex, onIndexChange]);

  // 处理 ESC 键关闭全屏
  useEffect(() => {
    if (!enableFullscreen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    if (isFullscreen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [enableFullscreen, isFullscreen]);

  /** 处理轮播过渡结束，实现无缝循环 */
  const handleTransitionEnd = useCallback(() => {
    if (!hasLoop) return;
    
    // 只在到达克隆项位置时处理
    if (position === 0) {
      // 从克隆的最后一张跳转到真实的最后一张
      setIsTransitionDisabled(true);
      setPosition(itemCount);
      // 使用双重 RAF 确保浏览器已渲染新位置后再恢复过渡
      if (transitionResetRaf.current !== null) {
        cancelAnimationFrame(transitionResetRaf.current);
      }
      transitionResetRaf.current = requestAnimationFrame(() => {
        transitionResetRaf.current = requestAnimationFrame(() => {
          setIsTransitionDisabled(false);
        });
      });
    } else if (position === slidesLength - 1) {
      // 从克隆的第一张跳转到真实的第一张
      setIsTransitionDisabled(true);
      setPosition(1);
      // 使用双重 RAF 确保浏览器已渲染新位置后再恢复过渡
      if (transitionResetRaf.current !== null) {
        cancelAnimationFrame(transitionResetRaf.current);
      }
      transitionResetRaf.current = requestAnimationFrame(() => {
        transitionResetRaf.current = requestAnimationFrame(() => {
          setIsTransitionDisabled(false);
        });
      });
    }
  }, [hasLoop, position, itemCount, slidesLength]);

  /** 切换到下一张 */
  const moveNext = useCallback(() => {
    if (!hasLoop) return;
    setPosition((prev) =>
      prev >= slidesLength - 1 ? slidesLength - 1 : prev + 1,
    );
  }, [hasLoop, slidesLength]);

  /** 切换到上一张 */
  const movePrev = useCallback(() => {
    if (!hasLoop) return;
    setPosition((prev) => (prev <= 0 ? 0 : prev - 1));
  }, [hasLoop]);

  /** 处理指示器点击 */
  const handleIndicatorClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      const targetIndex = event.currentTarget.dataset.index;
      if (targetIndex === undefined) return;
      const index = Number(targetIndex);

      setIsTransitionDisabled(false);
      setDragOffset(0);

      if (hasLoop) {
        setPosition(index + 1);
      } else {
        setPosition(index);
      }
    },
    [hasLoop],
  );

  /** 渲染指示器组件 */
  const createIndicators = useCallback(
    (className: string) =>
      hasLoop && showIndicators ? (
        <div className={`carousel-indicators ${className}`}>
          {items.map((_, index) => (
            <button
              key={index}
              data-index={index}
              className={`carousel-indicator ${index === activeIndex ? 'active' : ''}`}
              onClick={handleIndicatorClick}
              aria-label={`显示第 ${index + 1} 项`}
              aria-pressed={index === activeIndex}
            />
          ))}
        </div>
      ) : null,
    [activeIndex, handleIndicatorClick, hasLoop, showIndicators, items],
  );

  /** 处理鼠标进入 */
  const handleMouseEnter = useCallback(() => {
    if (pauseOnHover) {
      setIsHovered(true);
    }
  }, [pauseOnHover]);

  /** 处理鼠标离开 */
  const handleMouseLeave = useCallback(() => {
    if (pauseOnHover) {
      setIsHovered(false);
    }
  }, [pauseOnHover]);

  /** 关闭全屏 */
  const handleCloseFullscreen = useCallback(() => {
    setIsFullscreen(false);
  }, []);

  // 清理 RAF
  useEffect(
    () => () => {
      if (transitionResetRaf.current !== null) {
        cancelAnimationFrame(transitionResetRaf.current);
      }
    },
    [],
  );

  // early return 必须在所有 hooks 之后
  if (itemCount === 0) {
    return null;
  }

  /** 处理指针按下事件 */
  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!hasLoop) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    dragState.current.startX = event.clientX;
    dragState.current.hasMoved = false;
    pointerIdRef.current = event.pointerId;
    setIsDragging(true);
    setIsTransitionDisabled(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  /** 处理指针移动事件 */
  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const deltaX = event.clientX - dragState.current.startX;

    if (Math.abs(deltaX) > DRAG_MOVE_THRESHOLD) {
      dragState.current.hasMoved = true;
    }

    setDragOffset(deltaX);
  };

  /** 处理指针释放事件 */
  const handlePointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const deltaX = event.clientX - dragState.current.startX;
    const width = event.currentTarget.getBoundingClientRect().width || 1;
    const dragThreshold = Math.max(40, width * 0.12);
    const absDeltaX = Math.abs(deltaX);

    setIsDragging(false);
    setIsTransitionDisabled(false);

    if (pointerIdRef.current !== null) {
      event.currentTarget.releasePointerCapture(pointerIdRef.current);
      pointerIdRef.current = null;
    }

    // 标记是否发生了有效的拖拽切换
    const didSwipe = absDeltaX >= dragThreshold;
    if (didSwipe) {
      dragState.current.hasMoved = true;
    }

    if (hasLoop && didSwipe) {
      if (deltaX > 0) {
        movePrev();
      } else {
        moveNext();
      }
    }

    setDragOffset(0);

    // 如果没有发生拖拽移动且启用了全屏功能，则进入全屏
    // 由于 setPointerCapture 可能阻止 click 事件，在这里处理点击逻辑
    if (!dragState.current.hasMoved && enableFullscreen) {
      setIsFullscreen(true);
    }
  };

  /** 处理指针取消事件 */
  const handlePointerCancel = (event: PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;

    setIsDragging(false);
    setIsTransitionDisabled(false);
    setDragOffset(0);
    dragState.current.hasMoved = false;

    if (pointerIdRef.current !== null) {
      event.currentTarget.releasePointerCapture(pointerIdRef.current);
      pointerIdRef.current = null;
    }
  };

  return (
    <>
      <div
        className="carousel"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className="carousel-slider"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerCancel}
        >
          <div
            className={`carousel-track ${trackClassName}`}
            onTransitionEnd={handleTransitionEnd}
            style={{ transform: trackTransform, transition: trackTransition }}
          >
            {slides.map((slide, index) => (
              <div
                className={`carousel-slide ${slideClassName} ${enableFullscreen ? 'carousel-slide--clickable' : ''}`}
                key={`${slide.key}-${index}`}
              >
                {slide.content}
              </div>
            ))}
          </div>
        </div>
        {createIndicators(indicatorClassName)}
      </div>

      {/* 全屏查看器 - 使用 Portal 渲染到 body，避免被父元素 transform 影响 */}
      {enableFullscreen && isFullscreen && createPortal(
        <div className="carousel-fullscreen">
          <button
            className="carousel-fullscreen-close"
            onClick={handleCloseFullscreen}
            aria-label="关闭全屏"
          >
            <X size={24} />
          </button>
          <div
            className="carousel-slider carousel-slider--fullscreen"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerEnd}
            onPointerCancel={handlePointerCancel}
          >
            <div
              className="carousel-track"
              onTransitionEnd={handleTransitionEnd}
              style={{ transform: trackTransform, transition: trackTransition }}
            >
              {slides.map((slide, index) => (
                <div
                  className={`carousel-slide carousel-slide--fullscreen ${fullscreenSlideClassName}`}
                  key={`fullscreen-${slide.key}-${index}`}
                >
                  {slide.fullscreenContent ?? slide.content}
                </div>
              ))}
            </div>
          </div>
          {createIndicators(`carousel-fullscreen-indicators ${fullscreenIndicatorClassName}`)}
        </div>,
        document.body
      )}
    </>
  );
};

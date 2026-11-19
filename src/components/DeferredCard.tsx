import { Component, Suspense, useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { CARD_SIZES } from '../constant';
import { LoadingIndicator } from './LoadingIndicator/LoadingIndicator';

/** 支持按可见性加载的次要卡片标识 */
type DeferredCardId =
  | 'image'
  | 'article'
  | 'openSource'
  | 'music'
  | 'calendar'
  | 'worldMap';

/** 延迟卡片所需的占位尺寸与内容 */
interface DeferredCardProps {
  /** 对应 CARD_SIZES 中的尺寸配置 */
  cardId: DeferredCardId;
  /** 首屏关键内容立即挂载，其余内容接近视口后挂载 */
  loadMode?: 'immediate' | 'visible';
  /** 尚未接近视口时不挂载，避免触发内部动态导入和请求 */
  children: ReactNode;
}

/** 延迟卡片的内联样式，显式声明用于占位的 CSS 自定义属性 */
interface DeferredCardStyle extends CSSProperties {
  /** 基础占位高度，由响应式 CSS 按需覆盖 */
  '--deferred-card-base-height': string;
}

/** 未挂载和 Suspense 加载期间共用静态占位，避免重复创建相同 JSX */
const cardPlaceholder = (
  <div className="deferred-card-placeholder" aria-hidden="true" />
);

/** 为有独立数据加载过程的卡片统一模块下载提示。 */
const CARD_LOADING_LABELS: Partial<Record<DeferredCardId, string>> = {
  worldMap: '正在加载地图…',
  music: '正在加载音乐列表…',
  article: '正在加载最新文章…',
  calendar: '正在加载日历…',
};

/** 卡片加载边界的输入 */
interface CardLoadBoundaryProps {
  /** 由 Suspense 管理加载状态的卡片内容 */
  children: ReactNode;
}

/** 卡片加载失败状态 */
interface CardLoadBoundaryState {
  /** 模块下载或渲染是否失败 */
  failed: boolean;
}

/** React 18 错误边界需要类组件，局部隔离模块加载失败，避免整个首页白屏 */
class CardLoadBoundary extends Component<
  CardLoadBoundaryProps,
  CardLoadBoundaryState
> {
  state: CardLoadBoundaryState = { failed: false };

  static getDerivedStateFromError(): CardLoadBoundaryState {
    return { failed: true };
  }

  render(): ReactNode {
    if (this.state.failed) {
      return (
        <div className="deferred-card-message" role="alert">
          <span>卡片加载失败</span>
          <button type="button" onClick={() => window.location.reload()}>
            刷新页面重试
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

/** 接近视口后才挂载次要卡片；加载完成后保留实例，避免滚动重建状态 */
export const DeferredCard = ({
  cardId,
  children,
  loadMode = 'visible',
}: DeferredCardProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  // 首屏关键内容和不支持可见性观察的环境直接挂载，避免 Effect 追加一次渲染。
  const [ready, setReady] = useState(
    () => loadMode === 'immediate' || typeof IntersectionObserver === 'undefined',
  );
  const shouldLoad = loadMode === 'immediate' || ready;
  const style: DeferredCardStyle = {
    '--deferred-card-base-height': `${CARD_SIZES[cardId].height}px`,
  };
  const loadingLabel = CARD_LOADING_LABELS[cardId];
  const loadingPlaceholder = loadingLabel ? (
    <div className="deferred-card-placeholder deferred-card-loading" aria-busy="true">
      <LoadingIndicator label={loadingLabel} />
    </div>
  ) : cardPlaceholder;

  useEffect(() => {
    const container = containerRef.current;
    if (shouldLoad || !container || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setReady(true);
          observer.disconnect();
        }
      },
      // 提前少量距离开始下载，兼顾滚动体验与首屏带宽。
      { rootMargin: '160px 0px' },
    );
    observer.observe(container);
    return () => observer.disconnect();
  }, [shouldLoad]);

  return (
    <div
      ref={containerRef}
      className={`deferred-card deferred-card--${cardId}`}
      style={style}
    >
      {shouldLoad ? (
        <CardLoadBoundary>
          <Suspense fallback={loadingPlaceholder}>{children}</Suspense>
        </CardLoadBoundary>
      ) : (
        cardPlaceholder
      )}
    </div>
  );
};

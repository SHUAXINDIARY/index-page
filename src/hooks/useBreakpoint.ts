import { useSyncExternalStore } from 'react';

/** 断点名称 */
type Breakpoint = 'mobile' | 'tablet' | 'desktop';

/** 移动端断点上限 */
const MOBILE_MAX = 767;

/** 平板端断点上限 */
const TABLET_MAX = 1024;

/** 缓存当前断点，避免重复计算 */
let cachedBreakpoint: Breakpoint = getBreakpointFromWidth(
  typeof window !== 'undefined' ? window.innerWidth : 1920,
);

/** 根据视口宽度判断断点 */
function getBreakpointFromWidth(width: number): Breakpoint {
  if (width <= MOBILE_MAX) return 'mobile';
  if (width <= TABLET_MAX) return 'tablet';
  return 'desktop';
}

/** 获取当前断点快照 */
const getSnapshot = () => cachedBreakpoint;

/** SSR 回退 */
const getServerSnapshot = (): Breakpoint => 'desktop';

/** 订阅 resize 事件 */
const subscribe = (callback: () => void) => {
  const handleResize = () => {
    const next = getBreakpointFromWidth(window.innerWidth);
    if (next !== cachedBreakpoint) {
      cachedBreakpoint = next;
      callback();
    }
  };
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
};

/**
 * 检测当前视口断点
 * @returns 'mobile' | 'tablet' | 'desktop'
 */
export const useBreakpoint = (): Breakpoint => {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
};

export type { Breakpoint };

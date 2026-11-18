import { useEffect } from 'react';
import type { RefObject } from 'react';

/** 弹层焦点管理的必要输入 */
interface ModalAccessibilityOptions {
  /** 弹层是否处于打开状态 */
  active: boolean;
  /** 保留现有 Portal 和动画结构的弹层容器 */
  containerRef: RefObject<HTMLElement>;
}

/** 嵌套弹层只允许最上层接管键盘焦点 */
const modalStack: HTMLElement[] = [];
const focusableSelector = 'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])';

/** 保留已有动画与点击关闭逻辑，为自定义弹层补充背景隔离和焦点恢复 */
export const useModalAccessibility = ({ active, containerRef }: ModalAccessibilityOptions): void => {
  useEffect(() => {
    const container = containerRef.current;
    if (!active || !container) return;
    const previousFocus = document.activeElement;
    const isolated: { element: HTMLElement; inert: boolean }[] = [];
    modalStack.push(container);

    // 沿 Portal 到 body 的祖先链隔离兄弟分支，不能把弹层本身设为 inert。
    let branch: HTMLElement = container;
    while (branch.parentElement) {
      for (const sibling of branch.parentElement.children) {
        if (sibling !== branch && sibling instanceof HTMLElement) {
          isolated.push({ element: sibling, inert: sibling.inert });
          sibling.inert = true;
        }
      }
      if (branch.parentElement === document.body) break;
      branch = branch.parentElement;
    }

    const getFocusable = (): HTMLElement[] =>
      Array.from(container.querySelectorAll<HTMLElement>(focusableSelector))
        .filter((element) => element.tabIndex >= 0 && !element.closest('[inert], [aria-hidden="true"]') && element.getClientRects().length > 0);
    const focusFirst = (): void => {
      (getFocusable()[0] ?? container).focus({ preventScroll: true });
    };
    focusFirst();

    const handleFocus = (event: FocusEvent): void => {
      if (modalStack.at(-1) !== container) return;
      if (event.target instanceof Node && !container.contains(event.target)) focusFirst();
    };
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== 'Tab' || modalStack.at(-1) !== container) return;
      const controls = getFocusable();
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (!first || !last) {
        event.preventDefault();
        container.focus({ preventScroll: true });
      } else if (event.shiftKey && (document.activeElement === first || document.activeElement === container)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('focusin', handleFocus);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('focusin', handleFocus);
      document.removeEventListener('keydown', handleKeyDown);
      const index = modalStack.lastIndexOf(container);
      if (index >= 0) modalStack.splice(index, 1);
      for (const { element, inert } of isolated) element.inert = inert;
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected && !previousFocus.closest('[inert]')) {
        previousFocus.focus({ preventScroll: true });
      }
    };
  }, [active, containerRef]);
};

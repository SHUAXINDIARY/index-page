import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './Tooltip.css';

export interface TooltipProps {
  /**
   * 触发元素
   */
  children: React.ReactElement;
  /**
   * 提示内容
   */
  content: string;
  /**
   * 延迟显示时间（毫秒），默认 300
   */
  delay?: number;
  /**
   * 是否禁用 tooltip
   */
  disabled?: boolean;
}

export const Tooltip = ({ children, content, delay = 300, disabled = false }: TooltipProps) => {
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
  }>({
    visible: false,
    x: 0,
    y: 0,
  });
  const tooltipTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 处理鼠标悬停
  const handleMouseEnter = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (disabled || !content) return;

    // 清除之前的定时器
    if (tooltipTimerRef.current) {
      clearTimeout(tooltipTimerRef.current);
    }

    const target = e.currentTarget;

    // 延迟显示 tooltip
    tooltipTimerRef.current = setTimeout(() => {
      // 检查元素是否仍然存在
      if (!target) return;

      const rect = target.getBoundingClientRect();
      setTooltip({
        visible: true,
        x: rect.left + rect.width / 2,
        y: rect.top - 10,
      });
    }, delay);
  }, [disabled, content, delay]);

  // 处理鼠标离开
  const handleMouseLeave = useCallback(() => {
    // 清除定时器
    if (tooltipTimerRef.current) {
      clearTimeout(tooltipTimerRef.current);
      tooltipTimerRef.current = null;
    }

    setTooltip(prev => ({ ...prev, visible: false }));
  }, []);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (tooltipTimerRef.current) {
        clearTimeout(tooltipTimerRef.current);
      }
    };
  }, []);

  return (
    <>
      <span
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ display: 'inline-block' }}
      >
        {children}
      </span>

      {/* 使用 Portal 将 Tooltip 渲染到 body */}
      {tooltip.visible && !disabled && content && createPortal(
        <div
          className="tooltip"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
          }}
        >
          <div className="tooltip-arrow" />
          <div className="tooltip-content">{content}</div>
        </div>,
        document.body
      )}
    </>
  );
};


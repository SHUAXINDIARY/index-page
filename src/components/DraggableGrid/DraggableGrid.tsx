import { useState, useEffect, useCallback } from 'react';
import type { ReactElement } from 'react';
import GridLayout from 'react-grid-layout';
import type { Layout } from 'react-grid-layout';
import { GripVertical } from 'lucide-react';
import 'react-grid-layout/css/styles.css';
import './DraggableGrid.css';

interface DraggableGridProps {
  children: ReactElement[];
  storageKey?: string;
}

// 默认布局配置 - 参照图片居中聚拢展示
const getDefaultLayout = (): Layout[] => [
  // 左列 (x: 1-4)
  { i: 'user-card', x: 1, y: 1, w: 3, h: 5 },     // 用户卡片稍往下，和图片对齐
  { i: 'article-card', x: 1, y: 6, w: 3, h: 2 },  // 文章卡片在用户卡片下方
  
  // 中列 (x: 4-7)
  { i: 'image-card', x: 4, y: 0, w: 3, h: 3 },    // 图片卡片在最顶部
  { i: 'welcome-card', x: 4, y: 3, w: 3, h: 2 },  // 欢迎卡片
  { i: 'social-links', x: 4, y: 5, w: 3, h: 1 },  // 社交链接
  
  // 右列 (x: 7-11)
  { i: 'action-button', x: 7, y: 0, w: 2, h: 1 }, // 写文章按钮（左上）
  { i: 'clock', x: 9, y: 0, w: 2, h: 1 },         // 时钟（右上）
  { i: 'calendar', x: 7, y: 1, w: 4, h: 4 },      // 日历（中间大块）
  { i: 'music-player', x: 7, y: 5, w: 4, h: 1 },  // 音乐播放器
  { i: 'decorative', x: 9, y: 6, w: 2, h: 1 },    // 装饰图标（右下角）
];

export const DraggableGrid = ({ children, storageKey = 'grid-layout' }: DraggableGridProps) => {
  const [layout, setLayout] = useState<Layout[]>(() => {
    // 从 localStorage 加载布局
    const savedLayout = localStorage.getItem(storageKey);
    if (savedLayout) {
      try {
        return JSON.parse(savedLayout);
      } catch {
        return getDefaultLayout();
      }
    }
    return getDefaultLayout();
  });

  // 布局变化时保存到 localStorage
  const handleLayoutChange = (newLayout: Layout[]) => {
    setLayout(newLayout);
    localStorage.setItem(storageKey, JSON.stringify(newLayout));
  };

  // 重置布局
  const resetLayout = useCallback(() => {
    const defaultLayout = getDefaultLayout();
    setLayout(defaultLayout);
    localStorage.setItem(storageKey, JSON.stringify(defaultLayout));
  }, [storageKey]);

  // 为子元素添加 key 和包装器（带拖拽手柄）
  const childrenWithKeys = children.map((child, index) => {
    const keys = [
      'user-card', 'article-card', 'image-card', 'welcome-card', 
      'social-links', 'action-button', 'clock', 'calendar', 
      'music-player', 'decorative'
    ];
    return (
      <div key={keys[index] || `item-${index}`} className="grid-item-wrapper">
        {/* 拖拽手柄 - 只有这个区域可以拖拽 */}
        <div className="drag-handle" title="拖动调整位置">
          <GripVertical size={14} />
        </div>
        {child}
      </div>
    );
  });

  // 添加重置按钮到 window 对象，方便调试
  useEffect(() => {
    (window as unknown as { resetGridLayout: () => void }).resetGridLayout = resetLayout;
    console.log('💡 提示: 在控制台输入 window.resetGridLayout() 可以重置布局');
  }, [resetLayout]);

  return (
    <div className="draggable-grid-container">
      <GridLayout
        className="draggable-grid"
        layout={layout}
        onLayoutChange={handleLayoutChange}
        cols={12}
        rowHeight={80}
        width={1200}
        isDraggable={true}
        isResizable={false}
        compactType={null}
        preventCollision={true}
        margin={[12, 12]}
        containerPadding={[0, 0]}
        draggableHandle=".drag-handle"
      >
        {childrenWithKeys}
      </GridLayout>
    </div>
  );
};


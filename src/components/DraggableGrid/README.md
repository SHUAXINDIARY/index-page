# DraggableGrid 组件

可拖拽的网格布局组件，支持自由排列卡片并保存位置到浏览器存储。

## 功能特性

### 核心功能

- 🎯 **自由拖拽** - 拖动任意卡片到新位置
- 💾 **自动保存** - 布局自动保存到 localStorage
- 🔄 **自动恢复** - 页面刷新后恢复上次的布局
- 🔒 **防碰撞** - 卡片不会重叠
- 📱 **响应式** - 支持不同屏幕尺寸

### 交互体验

- 悬停时显示"拖动以重新排列"提示
- 拖拽时卡片半透明
- 占位符显示预期位置
- 平滑的动画过渡

## 使用方法

### 基础用法

```tsx
import { DraggableGrid } from './components/DraggableGrid';

const App = () => {
  const cards = [
    <UserCard />,
    <ArticleCard />,
    <Calendar />,
    // ... 更多卡片
  ];

  return (
    <DraggableGrid storageKey="my-layout">
      {cards}
    </DraggableGrid>
  );
};
```

### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `children` | `ReactElement[]` | - | 卡片组件数组（必填） |
| `storageKey` | `string` | `'grid-layout'` | localStorage 键名 |

## 布局配置

### 默认布局

```typescript
const defaultLayout = [
  // 格式：{ i: 唯一ID, x: 列位置, y: 行位置, w: 宽度, h: 高度 }
  { i: 'user-card', x: 0, y: 0, w: 1, h: 3 },
  { i: 'article-card', x: 0, y: 3, w: 1, h: 2 },
  { i: 'calendar', x: 2, y: 0, w: 1, h: 3 },
  // ...
];
```

### 网格系统

- **列数 (cols)**：12
- **行高 (rowHeight)**：100px
- **间距 (margin)**：[16px, 16px]
- **总宽度 (width)**：1200px

### 卡片尺寸单位

- `w: 1` ≈ 宽度 100px
- `h: 1` ≈ 高度 100px
- 实际大小会根据内容自适应

## 重置布局

### 控制台重置

在浏览器控制台中执行：

```javascript
window.resetGridLayout()
```

### 编程重置

可以扩展组件添加重置按钮：

```tsx
const [key, setKey] = useState(0);

// 重置布局
const handleReset = () => {
  localStorage.removeItem('index-page-layout');
  setKey(prev => prev + 1); // 强制重新渲染
};

<button onClick={handleReset}>重置布局</button>
<DraggableGrid key={key} storageKey="index-page-layout">
  {cards}
</DraggableGrid>
```

## 自定义样式

### 主要 CSS 类

```css
.draggable-grid-container  /* 容器 */
.draggable-grid           /* 网格 */
.react-grid-item          /* 单个卡片 */
.react-grid-placeholder   /* 拖拽占位符 */
```

### 拖拽样式

```css
/* 拖拽中的卡片 */
.react-grid-item.react-draggable-dragging {
  opacity: 0.9;
  z-index: 100;
}

/* 占位符 */
.react-grid-item.react-grid-placeholder {
  background: rgba(255, 107, 107, 0.2);
  border-radius: 24px;
  border: 2px dashed rgba(255, 107, 107, 0.4);
}
```

## 技术细节

### 本地存储

布局数据保存格式：

```json
[
  {
    "i": "user-card",
    "x": 0,
    "y": 0,
    "w": 1,
    "h": 3
  },
  // ...
]
```

### 配置选项

```tsx
<GridLayout
  cols={12}              // 12列网格
  rowHeight={100}        // 行高100px
  isDraggable={true}     // 可拖拽
  isResizable={false}    // 不可调整大小
  compactType={null}     // 不自动紧凑
  preventCollision={true}// 防止碰撞
  margin={[16, 16]}      // 卡片间距
/>
```

## 注意事项

1. **卡片顺序**：children 数组的顺序必须与布局配置的 ID 对应
2. **唯一 ID**：每个卡片需要唯一的标识符
3. **存储限制**：localStorage 有大小限制（通常 5-10MB）
4. **浏览器兼容**：需要支持 localStorage 的现代浏览器

## 扩展功能

可以轻松添加的功能：

- 布局预设（多套布局方案）
- 导入/导出布局
- 拖拽锁定开关
- 可调整卡片大小
- 布局模板市场
- 多设备同步


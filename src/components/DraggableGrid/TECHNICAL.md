# DraggableGrid 技术文档

## 布局兼容性问题与解决方案

### 问题

`react-grid-layout` 默认会给网格项添加以下样式：

```css
.react-grid-item {
  position: absolute;
  width: XXpx;   /* 固定宽度 */
  height: XXpx;  /* 固定高度 */
}
```

这会导致：
- 卡片内部的 flex/grid 布局受影响
- 按钮组、菜单项等布局错位
- 文字溢出或被裁剪

### 解决方案

#### 1. 覆盖尺寸约束

```css
.react-grid-item {
  width: auto !important;   /* 让宽度自适应内容 */
  height: auto !important;  /* 让高度自适应内容 */
}
```

#### 2. 添加包装层

```tsx
<div key="card-id" className="grid-item-wrapper">
  <YourCard />  {/* 原始卡片组件 */}
</div>
```

包装器样式：
```css
.grid-item-wrapper {
  display: inline-block;  /* 自适应内容 */
  position: relative;     /* 建立定位上下文 */
}
```

#### 3. 保护内部元素

```css
.grid-item-wrapper > * {
  margin: 0;
  padding: inherit;  /* 继承原有 padding */
}

/* 确保内部布局属性不被覆盖 */
.grid-item-wrapper > [class*="-card"] {
  display: inherit;
  flex-direction: inherit;
  align-items: inherit;
  justify-content: inherit;
}
```

## 样式优先级

从高到低：
1. `.react-grid-item` - 网格项定位
2. `.grid-item-wrapper` - 尺寸适配
3. 原始卡片样式 - 保持不变

## 关键 CSS 技巧

### 1. 使用 `!important` 覆盖库样式

```css
.react-grid-item {
  width: auto !important;
  height: auto !important;
}
```

只在必要时使用，确保不影响拖拽功能。

### 2. 使用 `fit-content`

```css
.grid-item-wrapper {
  width: fit-content;
  height: fit-content;
}
```

让包装器适应内容大小。

### 3. 使用 `inherit`

```css
.grid-item-wrapper > * {
  display: inherit;
  flex-direction: inherit;
}
```

继承包装器的布局属性，保持原有行为。

## 布局计算

### 网格单位转换

```
cols = 12
rowHeight = 100px
margin = [16, 16]

单个网格单元 ≈ (1200 - 11*16) / 12 ≈ 85px
```

### 卡片尺寸

由于使用了 `auto` 尺寸：
- 宽度 = 卡片内容实际宽度
- 高度 = 卡片内容实际高度
- 布局中的 `w` 和 `h` 主要用于排列，不强制尺寸

## 测试清单

测试卡片内部布局是否正常：

- [ ] UserCard 的菜单项排列
- [ ] Calendar 的日期网格
- [ ] MusicPlayer 的按钮组
- [ ] SocialLinks 的链接排列
- [ ] 所有 flex 布局是否正常
- [ ] 所有 grid 布局是否正常
- [ ] 文字是否正常换行
- [ ] 图片是否保持比例

## 调试技巧

### 1. 查看实际应用的样式

```javascript
// 在控制台查看网格项样式
const item = document.querySelector('.react-grid-item');
console.log(window.getComputedStyle(item));
```

### 2. 临时禁用拖拽

```tsx
<GridLayout
  isDraggable={false}  // 暂时禁用
  // ...
>
```

### 3. 查看布局数据

```javascript
// 查看保存的布局
const layout = localStorage.getItem('index-page-layout');
console.log(JSON.parse(layout));
```

## 已知限制

1. **固定容器宽度**：当前设置为 1200px
2. **不可调整大小**：`isResizable={false}`
3. **不自动紧凑**：`compactType={null}`

## 未来改进

- [ ] 响应式列数（大屏12列，中屏6列，小屏2列）
- [ ] 可配置是否可调整大小
- [ ] 拖拽锁定开关
- [ ] 布局模板系统


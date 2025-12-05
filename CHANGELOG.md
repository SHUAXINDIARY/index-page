# 更新日志

## 2025-12-05

### 🐛 修复

#### 头像和图片防变形优化

修复了所有头像和图片在不同内容长度下可能被挤压变形的问题。

**修改的组件：**

1. **UserCard** (用户卡片)
   - 头像容器添加 `min-width`、`min-height` 和 `flex-shrink: 0`
   - 图片添加 `display: block` 避免内联元素默认行为
   - 用户信息区域添加文本溢出处理（省略号）
   - 用户标签添加最大宽度限制和文本截断

2. **WelcomeCard** (欢迎卡片)
   - 头像容器添加 `min-width`、`min-height` 和 `flex-shrink: 0`
   - 图片添加 `display: block`

3. **RecommendCard** (推荐卡片)
   - 头像容器添加 `min-width` 和 `min-height`
   - 图片添加 `display: block`

4. **ImageCard** (图片卡片)
   - 卡片容器添加 `min-width`、`min-height` 和 `flex-shrink: 0`
   - 图片添加 `display: block`

**技术细节：**

```css
/* 防止 flex 布局压缩 */
flex-shrink: 0;

/* 确保最小尺寸 */
min-width: 48px;
min-height: 48px;

/* 避免内联元素的默认底部间距 */
display: block;

/* 保持图片比例 */
object-fit: cover; /* 或 contain */
```

**效果：**
- ✅ 头像始终保持圆形，不会被挤压成椭圆
- ✅ 图片保持原始宽高比
- ✅ 长文本不会挤压其他元素
- ✅ 在不同屏幕尺寸下表现一致

---

## 2025-12-05 早期

### ✨ 新增功能

#### 配置化系统
- 创建 `src/config/content.ts` 统一管理所有卡片内容
- 实现数据与视图分离
- 提供 TypeScript 类型定义

#### 组件重构
- 将所有组件移至独立目录
- 每个组件包含 `.tsx`、`.css` 和 `index.ts`
- 添加组件说明文档

#### 视觉增强
- 实现 iOS 风格毛玻璃效果
- 增强圆角半径（24px）
- 优化阴影和动画效果


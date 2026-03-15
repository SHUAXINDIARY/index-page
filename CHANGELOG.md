# 更新日志

## 2026-03-15

### 🔧 响应式适配优化

全面提升跨设备体验，新增平板端布局，优化触控交互和文本溢出处理。

**平板端适配：**
- ✅ 新增 `useBreakpoint` Hook，替代原有 `useIsMobile`，支持 mobile / tablet / desktop 三档断点检测
- ✅ 平板端（768-1024px）采用两列网格布局，大卡片横跨两列
- ✅ ThemeToggle 面板在平板端同样使用居中蒙层模式

**触控目标优化（所有可交互元素 ≥ 44x44px）：**
- ✅ SocialLinks 图标从 36px 升至 40px（含 padding 达 64px）
- ✅ MusicPlayer 上一曲/下一曲按钮从 36px 升至 44px
- ✅ ThemeToggle 配色圆点从 28px 升至 32px + 隐形触控扩展区域
- ✅ Carousel / ImageCard 全屏关闭按钮移动端统一 44px
- ✅ Carousel 指示器添加隐形触控热区
- ✅ IframeModal 关闭和新标签按钮从 36px 升至 44px
- ✅ UserCard 菜单项添加 min-height: 44px
- ✅ ActionButton 添加 min-height: 44px
- ✅ 移动端工具栏按钮 min-height: 44px

**文本溢出处理：**
- ✅ ArticleCard 标题两行截断，分类单行省略
- ✅ MusicPlayer 标题单行省略，info 区域 min-width: 0 防溢出
- ✅ WelcomeCard 介绍文案四行截断
- ✅ RecommendCard 名称单行省略，描述三行截断

**卡片宽度自适应：**
- ✅ 所有卡片组件从固定 `width` 改为 `width: 100% + max-width`，在紧凑布局中自适应容器宽度

**移动端横屏：**
- ✅ 横屏模式自动切换为两列网格布局

**安全区域适配：**
- ✅ 底部工具栏和容器 padding 使用 `env(safe-area-inset-bottom)` 适配刘海屏/圆角屏
- ✅ 使用 `100dvh` 替代 `100vh` 避免移动端浏览器地址栏遮挡

**影响的文件：**
- 新增 `src/hooks/useBreakpoint.ts` - 三档断点检测 Hook
- `src/App.tsx` - 重构为 compact 布局统一移动端/平板端
- `src/App.css` - 紧凑布局、平板两列网格、横屏适配、安全区域
- `src/components/ThemeToggle/` - 使用 useBreakpoint 替代 useIsMobile
- 各组件 CSS - 触控目标、文本溢出、宽度自适应优化

---

## 2026-02-09

### ✨ 新增功能

#### 全站主题切换系统

新增完整的主题切换功能，支持明暗模式和多配色主题。

**主要特性：**
- ✅ 明暗模式切换：支持浅色（Light）、深色（Dark）和跟随系统（System）三种模式
- ✅ 5 套配色主题：暖棕（默认）、海洋蓝、森林绿、薰衣草紫、日落橘
- ✅ 弹出面板交互：点击右侧栏 🎨 图标弹出主题选择面板，使用 motion 动画
- ✅ localStorage 持久化：刷新页面保持选择的主题
- ✅ 系统偏好跟随：选择"跟随系统"时自动响应系统明暗模式切换
- ✅ 平滑过渡动画：主题切换时所有颜色平滑过渡
- ✅ 点击外部关闭：点击面板外区域自动收起

**技术实现：**
- 新增 `useTheme` Hook（`src/hooks/useTheme.ts`）管理主题状态
- 新增 `ThemeToggle` 组件（`src/components/ThemeToggle/`）提供交互界面
- 通过 `data-theme-mode` 和 `data-theme-color` HTML 属性 + CSS 变量选择器覆盖实现主题切换
- 将全站硬编码颜色迁移至 CSS 变量体系，确保所有组件响应主题变化

**影响的文件：**
- `src/App.css` - 扩展 CSS 变量体系，添加 dark 模式和配色覆盖
- `src/App.tsx` - 集成 ThemeToggle 组件
- 各组件 CSS 文件 - 硬编码颜色替换为 CSS 变量引用

---

## 2025-12-08

### ✨ 新增功能

#### 音乐播放器功能

为 MusicPlayer 组件添加了完整的播放功能：

**主要特性：**
- ✅ 随机播放：点击播放时从 urlList 中随机选择一首音乐
- ✅ 播放/暂停切换：图标在 Play ▶️ 和 Pause ⏸️ 之间切换
- ✅ 切换下一首：点击"下一首"按钮 ⏭️ 随机播放新歌曲
- ✅ 实时进度：播放时显示真实的播放进度
- ✅ 动态标题：播放时显示当前音乐名称
- ✅ 自动清理：组件卸载时自动停止播放
- ✅ 智能禁用：无音乐列表时"下一首"按钮自动禁用

**配置示例：**
```typescript
music: {
  label: '随机播放',
  title: '橘凯音乐',
  progress: 0,
  urlList: [
    {
      name: '未许之地OST',
      url: 'https://example.com/music.wav'
    }
  ]
}
```

#### 自定义 Rsbuild 插件

创建了 FetchBlogPlugin，用于在构建时抓取博客最新文章：

**功能：**
- ✅ 自动抓取博客首页的最新文章信息
- ✅ 提取标题、日期和链接
- ✅ 日期统一格式化为 `YYYY/MM/DD` 格式
- ✅ 保存到 JSON 文件供应用使用

**技术实现：**
- 使用 `cheerio` 解析 HTML
- 使用 `dayjs` 格式化日期
- 在构建前（`onBeforeBuild`）执行

---

## 2025-12-05

### ✨ 新增功能

#### Tooltip 组件

新增通用 Tooltip 提示组件，用于显示完整的文本内容。

**特性：**
- ✅ 鼠标悬停显示完整内容
- ✅ 平滑的淡入动画效果
- ✅ 毛玻璃背景样式
- ✅ 自动居中定位
- ✅ 可配置延迟时间
- ✅ 支持长文本自动换行

**应用位置：**
- UserCard 的用户标签 - hover 显示完整标签内容

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

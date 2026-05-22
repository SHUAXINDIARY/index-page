# 组件目录

本目录采用每个组件一个独立目录的结构，便于维护和管理。

## 📁 组件结构

每个组件目录包含：
- `ComponentName.tsx` - 组件逻辑
- `ComponentName.css` - 组件样式
- `index.ts` - 导出文件

## 📦 组件列表

### 基础组件
- **Card** - 通用卡片容器组件，所有其他卡片的基础
- **Tooltip** - 通用提示组件，支持鼠标悬停显示提示信息

### 功能组件
- **UserCard** - 用户信息卡片，包含头像、用户名和菜单导航
- **WelcomeCard** - 欢迎卡片，显示问候语和个性头像
- **ImageCard** - 可复用的图片展示卡片
- **Clock** - 实时数字时钟
- **Calendar** - 月历组件，支持 ICS 文件解析，显示节假日标记，鼠标悬停显示节日信息
- **WorldMap** - Canvas 世界地图（Natural Earth SVG 底图），支持旅行/居住/机场等标记
- **ActionButton** - 操作按钮组件
- **ArticleCard** - 文章信息展示卡片
- **RecommendCard** - 推荐内容卡片
- **MusicPlayer** - 音乐播放器控制卡片
- **SocialLinks** - 社交平台链接组

## 📝 使用方式

```tsx
// 从组件目录导入
import { Card } from './components/Card';
import { UserCard } from './components/UserCard';
import { Clock } from './components/Clock';
import { Calendar } from './components/Calendar';
import { WorldMap } from './components/WorldMap';
import { Tooltip } from './components/Tooltip';

// 在组件中使用
<UserCard config={contentConfig.user} />
<Clock />
<Calendar />
<WorldMap config={contentConfig.worldMap} />

// Tooltip 使用示例
<Tooltip content="提示信息">
  <button>悬停我</button>
</Tooltip>
```

## 🔍 组件详细说明

### Tooltip（提示组件）

**功能特性：**
- 💬 通用的提示组件，可在任何地方使用
- 🖱️ 鼠标悬停显示提示信息
- ⏱️ 可配置延迟显示时间（默认 300ms）
- 🎨 美观的浮窗样式（半透明背景 + 毛玻璃效果）
- 📍 自动定位在元素上方居中
- 🚀 使用 React Portal 渲染，避免被父容器限制

**使用方式：**
```tsx
import { Tooltip } from './components/Tooltip';

<Tooltip content="这是提示信息">
  <button>悬停我</button>
</Tooltip>

// 自定义延迟时间
<Tooltip content="提示信息" delay={500}>
  <span>悬停我</span>
</Tooltip>

// 禁用 tooltip
<Tooltip content="提示信息" disabled>
  <div>不会显示提示</div>
</Tooltip>
```

**Props：**
- `content: string` - 提示内容（必需）
- `delay?: number` - 延迟显示时间（毫秒），默认 300
- `disabled?: boolean` - 是否禁用 tooltip，默认 false
- `children: React.ReactElement` - 触发元素（必需）

**技术实现：**
- 使用 `useCallback` 优化事件处理函数
- 使用 React Portal 渲染到 `document.body`
- 自动计算位置并居中显示
- 平滑的淡入动画效果

### Calendar（日历组件）

**功能特性：**
- 📅 月历视图，显示当前月份的日期
- 🎯 高亮显示当天日期
- 📍 支持 ICS 文件解析，自动标记节假日和事件
- 🖱️ 鼠标悬停显示节日名称浮窗（使用 Tooltip 组件）
- 🎨 有事件的日期显示绿色背景和标记点

**配置：**
- 通过 `src/config/content.ts` 中的 `calendar.icsUrl` 配置 ICS 文件路径
- 支持本地路径（如 `/中国大陆节假日.ics`）或远程 URL

**依赖：**
- `dayjs` - 日期处理
- `ical.js` - ICS 文件解析
- `Tooltip` - 提示组件（用于显示节日信息）

### WorldMap（世界地图组件）

**功能特性：**
- 🗺️ Canvas 绘制底图（移植自 [plane-list/map](https://github.com/SHUAXINDIARY/plane-list/tree/main/src/components/map)）
- 📍 多种标记类型（旅行、居住、愿望、机场），图例可筛选
- 🔍 滚轮缩放、放大后拖拽、全屏查看
- 💬 悬停 tooltip（名称、描述、照片链接）
- 🎯 同坐标标记自动分散

**配置：**
- 通过 `src/config/content.ts` 中的 `worldMap` 配置
- 包含 `markers`（标记点）、`legend`（图例）、可选 `routes`（航迹）

**模块：**
- `AnnotatedWorldMap.tsx` / `canvasMap.ts` / `assets/map.svg`

### MusicPlayer（音乐播放器）

**功能特性：**
- 🎵 随机播放音乐
- ⏯️ 播放/暂停控制
- ⏭️ 下一首切换
- 📊 实时进度显示
- 🔄 播放结束后自动停止

**配置：**
- 通过 `src/config/content.ts` 中的 `music` 配置
- `urlList` 由 `BgmListPlugin` 自动生成

### Clock（时钟组件）

**功能特性：**
- ⏰ 实时数字时钟显示
- 📅 显示当前日期
- 🔄 每秒自动更新

**依赖：**
- `dayjs` - 日期时间处理

### UserCard（用户信息卡片）

**功能特性：**
- 👤 显示用户头像、名称和标签
- 📋 导航菜单列表
- 🎨 可自定义菜单项图标

**配置：**
- 通过 `src/config/content.ts` 中的 `user` 配置

### ArticleCard（文章卡片）

**功能特性：**
- 📝 显示最新文章信息
- 🔗 支持文章链接跳转
- 📅 显示发布日期和分类

**配置：**
- 通过 `src/config/content.ts` 中的 `article` 配置
- 数据可由 `FetchBlogPlugin` 自动生成

### WelcomeCard（欢迎卡片）

**功能特性：**
- 👋 个性化问候语
- 🎨 可自定义高亮颜色
- 🖼️ 显示头像

**配置：**
- 通过 `src/config/content.ts` 中的 `welcome` 配置

### ImageCard（图片卡片）

**功能特性：**
- 🖼️ 可复用的图片展示组件
- 📝 支持图片描述（alt 文本）
- 🎨 响应式图片显示

**配置：**
- 通过 `src/config/content.ts` 中的 `images` 配置

### RecommendCard（推荐卡片）

**功能特性：**
- 👤 显示推荐者信息
- 📝 展示推荐描述
- 🖼️ 显示推荐者头像

**配置：**
- 通过 `src/config/content.ts` 中的 `recommend` 配置

### SocialLinks（社交链接）

**功能特性：**
- 🔗 社交平台链接集合
- 🎨 支持多种图标
- 📱 响应式布局

**配置：**
- 通过 `src/config/content.ts` 中的 `socialLinks` 配置

### ActionButton（操作按钮）

**功能特性：**
- 🎯 通用操作按钮组件
- 🎨 可自定义样式和行为
- ⚡ 支持点击事件

## 🎨 样式特性

所有组件采用 iOS 风格设计：
- 毛玻璃效果（backdrop-filter）
- 圆润的圆角（24px）
- 柔和的阴影和高光
- 流畅的过渡动画
- 响应式交互效果

## 🛠️ 添加新组件

### 1. 创建组件目录结构

```bash
src/components/
└── YourComponent/
    ├── YourComponent.tsx    # 组件逻辑
    ├── YourComponent.css     # 组件样式
    └── index.ts             # 导出文件
```

### 2. 组件模板

**YourComponent.tsx:**
```tsx
import { Card } from '../Card';
import './YourComponent.css';

interface YourComponentProps {
  // 定义 props 类型
}

export const YourComponent = (props: YourComponentProps) => {
  return (
    <Card className="your-component-card">
      {/* 组件内容 */}
    </Card>
  );
};
```

**YourComponent.css:**
```css
.your-component-card {
  /* 使用 Card 组件的基础样式 */
  /* 添加自定义样式 */
}
```

**index.ts:**
```ts
export { YourComponent } from './YourComponent';
```

### 3. 样式规范

- 使用 `Card` 组件作为容器，获得统一的卡片样式
- 遵循 iOS 风格设计原则
- 使用 CSS 变量保持一致性
- 添加响应式设计支持

### 4. 在配置中添加

如果组件需要配置数据，在 `src/config/content.ts` 中：

1. 定义接口类型
2. 添加到 `ContentConfig` 接口
3. 在 `contentConfig` 对象中添加配置

### 5. 在 App.tsx 中使用

```tsx
import { YourComponent } from './components/YourComponent';
import { contentConfig } from './config/content';

<YourComponent config={contentConfig.yourComponent} />
```

## 📚 相关资源

- [React 文档](https://react.dev) - React 官方文档
- [TypeScript 文档](https://www.typescriptlang.org) - TypeScript 官方文档
- [Lucide React](https://lucide.dev) - 图标库文档


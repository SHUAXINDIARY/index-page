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

### 功能组件
- **UserCard** - 用户信息卡片，包含头像、用户名和菜单导航
- **WelcomeCard** - 欢迎卡片，显示问候语和个性头像
- **ImageCard** - 可复用的图片展示卡片
- **Clock** - 实时数字时钟
- **Calendar** - 月历组件，高亮显示当天
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

// 在组件中使用
<UserCard />
<Clock />
```

## 🎨 样式特性

所有组件采用 iOS 风格设计：
- 毛玻璃效果（backdrop-filter）
- 圆润的圆角（24px）
- 柔和的阴影和高光
- 流畅的过渡动画
- 响应式交互效果


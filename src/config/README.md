# 内容配置文件

这个目录包含所有页面内容的配置文件，实现了内容与展示的分离。

## 📄 配置文件说明

### `content.ts`

主配置文件，包含所有卡片的内容数据。

## 🎯 配置项说明

### 1. 用户信息 (`user`)

```typescript
user: {
  name: string;           // 用户名
  tag: string;            // 标签
  avatar: string;         // 头像 URL
  menuItems: Array<{
    icon: string;         // 图标名称（支持：FileText, FolderOpen, Info, Star, Globe）
    label: string;        // 菜单项标签
    onClick?: () => void; // 点击事件（可选）
  }>;
}
```

### 2. 欢迎信息 (`welcome`)

```typescript
welcome: {
  name: string;              // 显示的名字
  avatar: string;            // 头像 URL
  highlightColor?: string;   // 高亮颜色（可选，默认 #ff6b6b）
}
```

### 3. 文章信息 (`article`)

```typescript
article: {
  title: string;      // 文章标题
  category: string;   // 分类
  date: string;       // 日期
  icon: string;       // 图标 emoji
  tag: string;        // 标签文本
}
```

### 4. 推荐信息 (`recommend`)

```typescript
recommend: {
  name: string;        // 推荐者名称
  description: string; // 描述信息
  avatar: string;      // 头像 URL
}
```

### 5. 音乐播放器 (`music`)

```typescript
music: {
  label: string;  // 播放模式标签
  title: string;  // 音乐标题
  progress: number; // 播放进度 (0-100)
}
```

### 6. 社交链接 (`socialLinks`)

```typescript
socialLinks: Array<{
  icon: string;    // 图标名称（支持：Github, Juejin）
  label: string;   // 链接标签
  url?: string;    // 链接地址（可选）
}>
```

### 7. 图片卡片 (`images`)

```typescript
images: Array<{
  imageUrl: string; // 图片 URL
  alt: string;      // 图片描述
}>
```

## 📝 使用方式

### 修改内容

直接编辑 `content.ts` 文件中的配置对象：

```typescript
export const contentConfig: ContentConfig = {
  user: {
    name: '你的名字',
    tag: '你的标签',
    avatar: '你的头像URL',
    // ...
  },
  // ...其他配置
};
```

### 在组件中使用

配置会自动传递给各个组件，无需手动处理：

```tsx
// App.tsx
import { contentConfig } from './config/content';

<UserCard config={contentConfig.user} />
<ArticleCard config={contentConfig.article} />
<MusicPlayer config={contentConfig.music} />
```

## 🎨 自定义扩展

### 添加新的菜单项

在 `user.menuItems` 中添加新项，记得在组件中添加对应的图标映射：

```typescript
menuItems: [
  { icon: 'FileText', label: '新菜单' },
  // 如需新图标，需在 UserCard 组件的 iconMap 中添加
]
```

### 添加新的社交链接

在 `socialLinks` 中添加，如需新图标，需在 SocialLinks 组件的 `renderIcon` 中添加对应处理：

```typescript
socialLinks: [
  { icon: 'Github', label: 'Github', url: 'https://github.com' },
  { icon: 'Twitter', label: 'Twitter', url: 'https://twitter.com' },
  // 需要在 SocialLinks.tsx 的 renderIcon 函数中添加 Twitter 的渲染逻辑
]
```

## ✨ 优势

- 📦 **集中管理**：所有内容在一个文件中，易于维护
- 🔄 **易于修改**：修改内容不需要改动组件代码
- 🎯 **类型安全**：TypeScript 类型定义保证数据正确性
- 🚀 **可扩展**：轻松添加新的配置项和字段
- 🧪 **便于测试**：可以轻松创建不同的配置进行测试


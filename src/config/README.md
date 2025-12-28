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
  label: string;         // 播放模式标签
  title: string;         // 默认音乐标题（未播放时显示）
  progress: number;      // 初始进度 (0-100)
  urlList?: Array<{      // 音乐列表（可选）
    name: string;        // 音乐名称
    url: string;         // 音乐文件 URL
  }>;
}
```

**功能说明：**
- ▶️ 点击播放按钮会随机从 `urlList` 中选择一首音乐播放
- ⏸️ 播放时会显示当前音乐名称和实时进度
- 🔄 支持播放/暂停切换，图标会相应变化
- ⏭️ 点击"下一首"按钮随机切换到新的音乐
- 🎵 播放结束后自动停止

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

### 8. 世界地图 (`worldMap`)

```typescript
worldMap?: {
  style?: string;                    // 地图样式 URL（可选，默认为 MapLibre 默认样式）
  markers?: Array<{
    name: string;                     // 地点名称
    lat: number;                      // 纬度
    lng: number;                      // 经度
    type: 'travel' | 'residence' | 'wish' | 'airport'; // 标记类型
    description?: string;             // 描述信息（可选）
  }>;
  legend?: Array<{
    type: 'travel' | 'residence' | 'wish' | 'airport'; // 类型
    label: string;                    // 图例标签
  }>;
}
```

**标记类型说明：**
- `travel` - 旅行地点（橙色标记）
- `residence` - 居住地点（蓝色标记）
- `wish` - 愿望地点（粉色标记）
- `airport` - 机场（灰色标记）

**功能说明：**
- 🗺️ 基于 MapLibre GL 的交互式地图
- 📍 支持多种类型的标记点，自动处理重叠问题
- 🔍 支持缩放、拖拽、全屏查看
- 💬 点击标记点显示地点信息弹窗
- 🎨 可自定义地图样式（支持本地 JSON 文件或远程 URL）

**示例配置：**
```typescript
worldMap: {
  style: '/positron.json', // 本地样式文件路径
  markers: [
    {
      name: '北京',
      lat: 39.9042,
      lng: 116.4074,
      type: 'travel',
      description: '中国北京',
    },
    {
      name: '上海',
      lat: 31.2304,
      lng: 121.4737,
      type: 'residence',
      description: '中国上海',
    },
  ],
  legend: [
    { type: 'travel', label: '旅行' },
    { type: 'residence', label: '居住' },
  ],
}
```

### 9. 日历配置 (`calendar`)

```typescript
calendar?: {
  icsUrl?: string; // ICS 文件的 URL 或本地路径
}
```

**功能说明：**
- 📅 支持标准 ICS (iCalendar) 格式文件
- 🎯 自动解析并标记节假日和事件
- 🖱️ 鼠标悬停显示节日名称浮窗
- 📍 有事件的日期会显示绿色背景和标记点
- 🌐 支持本地路径（如 `/中国大陆节假日.ics`）或远程 URL

**示例配置：**
```typescript
calendar: {
  icsUrl: '/中国大陆节假日.ics', // 本地路径
  // 或使用远程 URL
  // icsUrl: 'https://example.com/calendar.ics',
}
```

**使用步骤：**
1. 将 ICS 文件放置在 `public/` 目录下
2. 在配置中设置 `icsUrl` 为文件路径（以 `/` 开头）
3. 日历组件会自动加载并解析文件
4. 有事件的日期会显示标记，鼠标悬停查看详情

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
<WorldMap config={contentConfig.worldMap} />
<Calendar /> // Calendar 组件会自动读取 contentConfig.calendar
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

### 添加地图标记点

在 `worldMap.markers` 中添加新的标记点：

```typescript
worldMap: {
  markers: [
    {
      name: '新地点',
      lat: 40.7128,  // 纬度
      lng: -74.0060, // 经度
      type: 'travel', // 或 'residence' | 'wish' | 'airport'
      description: '地点描述',
    },
  ],
}
```

**获取经纬度：**
- 可以使用 Google Maps、百度地图等工具查询地点的经纬度
- 纬度范围：-90 到 90（北纬为正，南纬为负）
- 经度范围：-180 到 180（东经为正，西经为负）

### 配置日历 ICS 文件

1. **获取 ICS 文件**：
   - 从日历应用（如 Google Calendar、Apple Calendar）导出
   - 或从在线日历服务下载
   - 或使用第三方节假日 ICS 文件

2. **放置文件**：
   - 将 `.ics` 文件放在 `public/` 目录下
   - 文件名可以自定义，如 `中国大陆节假日.ics`

3. **配置路径**：
   ```typescript
   calendar: {
     icsUrl: '/你的文件名.ics',
   }
   ```

## ✨ 优势

- 📦 **集中管理**：所有内容在一个文件中，易于维护
- 🔄 **易于修改**：修改内容不需要改动组件代码
- 🎯 **类型安全**：TypeScript 类型定义保证数据正确性
- 🚀 **可扩展**：轻松添加新的配置项和字段
- 🧪 **便于测试**：可以轻松创建不同的配置进行测试


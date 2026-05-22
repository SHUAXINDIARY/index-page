# Index Page

一个现代化的个人主页/导航页项目，采用 iOS 风格的毛玻璃设计，集成了用户信息、文章展示、音乐播放、时钟日历等多种功能模块。ui灵感来自于 [yysuni](https://www.yysuni.com/)

## ✨ 功能特性

- 🎨 **iOS 风格设计** - 毛玻璃效果、圆润圆角、柔和阴影
- 🌓 **主题切换系统** - 支持明暗模式切换 + 5 套配色主题（暖棕/海洋蓝/森林绿/薰衣草紫/日落橘），跟随系统偏好，localStorage 持久化
- 👤 **用户信息卡片** - 展示头像、标签和导航菜单
- 📝 **文章卡片** - 自动抓取并展示最新博客文章
- ✈️ **航司 Wiki 卡片** - 跳转 [Plane List 航司机型资料库](https://aircraftlog.shuaxinjs.cn/)
- 🎵 **音乐播放器** - 支持随机播放、进度显示
- ⏰ **实时时钟** - 数字时钟显示
- 📅 **日历组件** - 月历视图，高亮当天，支持 ICS 文件解析，鼠标悬停显示节日信息
- 🔗 **社交链接** - 快速访问各个社交平台
- 🖼️ **图片展示** - 可自定义的图片卡片
- 🗺️ **世界地图** - Canvas 绘制的 Natural Earth 风格底图，支持标记旅行/居住/机场等
- ⚙️ **自定义插件** - 构建时自动抓取博客文章、生成音乐列表
- 📱 **全面响应式** - 三档断点适配（移动端/平板端/桌面端），平板两列网格布局，横屏自适应，触控目标 ≥ 44px，安全区域适配

## 🛠️ 技术栈

- **框架**: React 18 + TypeScript
- **构建工具**: Rsbuild
- **样式**: CSS（毛玻璃效果）
- **图标**: Lucide React
- **日期处理**: Day.js
- **日历解析**: ical.js（ICS 文件解析）
- **地图渲染**: Canvas + SVG 底图（[plane-list/map](https://github.com/SHUAXINDIARY/plane-list/tree/main/src/components/map)）
- **HTML 解析**: Cheerio（构建时）

## 🚀 快速开始

### 安装依赖

```bash
pnpm install
```

### 开发模式

启动开发服务器，应用将在 [http://localhost:3000](http://localhost:3000) 可用：

```bash
pnpm run dev
```

或者不自动打开浏览器：

```bash
pnpm run dev:noopen
```

### 构建生产版本

```bash
pnpm run build
```

### 预览生产构建

```bash
pnpm run preview
```

## 📁 项目结构

```
index-page/
├── public/              # 静态资源
│   ├── bgm/           # 音乐文件目录
│   ├── *.ics          # ICS 日历文件（可选）
│   └── index.html      # HTML 模板
├── plugins/            # 自定义 Rsbuild 插件
│   ├── fetch-blog-plugin.ts    # 博客文章抓取插件
│   └── bgm-list-plugin.ts      # 音乐列表生成插件
├── src/
│   ├── components/     # React 组件
│   │   ├── UserCard/          # 用户信息卡片
│   │   ├── ArticleCard/       # 文章卡片
│   │   ├── MusicPlayer/       # 音乐播放器
│   │   ├── Clock/             # 时钟组件
│   │   ├── Calendar/          # 日历组件
│   │   ├── WorldMap/          # 世界地图组件
│   │   ├── SocialLinks/       # 社交链接
│   │   ├── ThemeToggle/          # 主题切换组件
│   │   └── ...                # 其他组件
│   ├── config/        # 配置文件
│   │   ├── content.ts         # 主配置文件
│   │   ├── blog-data.json     # 博客数据（自动生成）
│   │   └── bgm-data.json      # 音乐列表（自动生成）
│   ├── App.tsx        # 主应用组件
│   └── index.tsx      # 入口文件
└── rsbuild.config.ts   # Rsbuild 配置
```

## ⚙️ 配置说明

所有页面内容都在 `src/config/content.ts` 中集中管理，包括：

- **用户信息** (`user`) - 用户名、头像、标签、菜单项
- **欢迎信息** (`welcome`) - 问候语和头像
- **文章信息** (`article`) - 文章标题、日期、分类
- **音乐配置** (`music`) - 播放器标题和音乐列表
- **社交链接** (`socialLinks`) - 各平台链接
- **图片配置** (`images`) - 图片卡片数据
- **世界地图** (`worldMap`) - 标记点、可选航迹与图例配置
- **日历配置** (`calendar`) - ICS 文件路径（支持本地路径或远程 URL）

详细配置说明请查看 [config/README.md](./src/config/README.md)。

## 🔌 自定义插件

项目包含两个自定义 Rsbuild 插件：

1. **FetchBlogPlugin** - 构建时自动抓取博客最新文章
2. **BgmListPlugin** - 自动扫描 `public/bgm` 目录生成音乐列表

插件详情请查看 [plugins/README.md](./plugins/README.md)。

## 📝 开发指南

### 代码规范

- **ESLint**: 运行 `pnpm run lint` 检查代码规范
- **Prettier**: 运行 `pnpm run format` 格式化代码

### 添加新组件

1. 在 `src/components/` 下创建组件目录
2. 创建 `ComponentName.tsx`、`ComponentName.css` 和 `index.ts`
3. 参考现有组件的结构和样式

### 修改内容

直接编辑 `src/config/content.ts` 文件，修改对应的配置项即可。

### 日历 ICS 文件配置

日历组件支持通过 ICS 文件显示节假日和事件：

1. 将 ICS 文件放置在 `public/` 目录下（如 `public/中国大陆节假日.ics`）
2. 在 `src/config/content.ts` 中配置 `calendar.icsUrl`：
   ```typescript
   calendar: {
     icsUrl: '/中国大陆节假日.ics', // 本地路径
     // 或使用远程 URL
     // icsUrl: 'https://example.com/calendar.ics',
   }
   ```
3. 日历会自动解析 ICS 文件并在对应日期显示标记
4. 鼠标悬停在标记日期上会显示浮窗提示，展示节日名称

### 世界地图配置

世界地图组件支持标记旅行地点、居住地、愿望地点等：

1. 在 `src/config/content.ts` 中配置 `worldMap`：
   ```typescript
   worldMap: {
     markers: [
       {
         name: '北京',
         lat: 39.9042,
         lng: 116.4074,
         type: 'travel', // 'travel' | 'residence' | 'wish' | 'airport'
         description: '中国北京',
         imgUrl: 'https://example.com/photos', // 可选
       },
     ],
     legend: [
       { type: 'travel', label: '旅行' },
       { type: 'residence', label: '居住' },
       { type: 'airport', label: '机场' },
     ],
   }
   ```

2. **标记点类型**：
   - `travel` - 旅行地点（橙色）
   - `residence` - 居住地点（蓝色）
   - `wish` - 愿望地点（粉色）
   - `airport` - 机场（黄绿色）

3. **交互**：
   - 滚轮缩放；放大后可拖拽平移
   - 悬停显示名称与说明；可选「查看照片」链接
   - 双击或左上角按钮进入全屏；图例可点击筛选类型
   - 实现细节见 `src/components/WorldMap/`（移植自 [plane-list 地图文档](https://github.com/SHUAXINDIARY/plane-list/blob/main/docs/map.md)）

## 📚 相关资源

- [Rsbuild 文档](https://rsbuild.rs) - 探索 Rsbuild 的功能和 API
- [Rsbuild GitHub](https://github.com/web-infra-dev/rsbuild) - 欢迎反馈和贡献
- [React 文档](https://react.dev) - React 官方文档
- [TypeScript 文档](https://www.typescriptlang.org) - TypeScript 官方文档
- [ical.js 文档](https://kewisch.github.io/ical.js/api/) - iCalendar 解析库 API 文档
- [plane-list 地图组件](https://github.com/SHUAXINDIARY/plane-list/tree/main/src/components/map) - Canvas 世界地图参考实现

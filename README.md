# Index Page

一个现代化的个人主页/导航页项目，采用 iOS 风格的毛玻璃设计，集成了用户信息、文章展示、音乐播放、时钟日历等多种功能模块。UI 灵感来自于 [yysuni](https://www.yysuni.com/)

## ✨ 功能特性

- 🎨 **iOS 风格设计** - 毛玻璃效果、圆润圆角、柔和阴影
- 🌓 **主题切换系统** - 支持明暗模式、跟随系统、7 套预设配色及自定义颜色，localStorage 持久化
- 👤 **用户信息卡片** - 展示头像、用户名和导航菜单，自我介绍显示在欢迎卡片中
- 📝 **文章卡片** - 自动抓取并展示最新博客文章
- 📦 **开源项目卡片** - 展示重点项目，弹窗查看完整项目列表、维护状态、仓库和在线地址
- 🎵 **音乐播放器** - 支持随机播放、进度显示
- ⏰ **实时时钟** - 数字时钟显示
- 📅 **日历组件** - 月历视图，高亮当天，支持 ICS 文件解析，鼠标悬停显示节日信息
- 🔗 **社交链接** - 快速访问各个社交平台
- 🖼️ **图片展示** - 自动扫描本地图片，支持图片卡片和随机页面背景
- 🗺️ **世界地图** - Canvas 绘制的 Natural Earth 风格底图，支持标记旅行/居住/机场等
- ♾️ **无限画布** - 桌面工具栏可切换无限画布模式
- ⚙️ **自定义插件** - 构建时抓取博客文章、生成音乐和图片列表
- 📱 **全面响应式** - 三档断点适配（移动端/平板端/桌面端），平板两列网格布局，横屏自适应，触控目标 ≥ 44px，安全区域适配

## 🛠️ 技术栈

- **框架**: React 18 + TypeScript
- **构建工具**: Rsbuild
- **样式**: CSS（毛玻璃效果）
- **动画**: Motion
- **图标**: Lucide React
- **无限画布**: `@infinite-canvas-tutorial/ecs` + `@infinite-canvas-tutorial/webcomponents`
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

启动开发服务器并自动打开浏览器，访问地址以终端输出为准：

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

```text
index-page/
├── public/                    # 静态资源
│   ├── bgm/                   # 本地音频
│   ├── cardImg/               # 图片卡片和页面背景来源
│   ├── *.ics                  # 本地日历文件
│   └── index.html             # HTML 模板
├── plugins/                   # 自定义 Rsbuild 插件
│   ├── fetch-blog-plugin.ts   # 博客文章抓取
│   ├── bgm-list-plugin.ts     # 音乐列表生成
│   └── card-img-list-plugin.ts # 图片列表生成
├── src/
│   ├── components/            # 卡片、工具栏控件、地图、无限画布等组件
│   ├── config/
│   │   ├── content.ts         # 内容类型定义与主配置
│   │   ├── content.example.ts # 配置字段示例
│   │   ├── blog-data.json     # 博客数据（自动生成）
│   │   ├── bgm-data.json      # 音乐列表（自动生成）
│   │   └── card-img-data.json # 图片列表（自动生成）
│   ├── hooks/                 # 断点、随机布局和主题等逻辑
│   ├── providers/             # 主题 Provider
│   ├── App.tsx                # 状态管理、卡片内容渲染与模式切换
│   ├── H5.tsx                 # 移动端和平板端紧凑布局、工具栏
│   ├── PC.tsx                 # 桌面随机布局、卡片定位动画与工具栏
│   ├── constant.ts            # 页面静态常量
│   ├── App.css                # 全局样式、主题与响应式布局
│   └── index.tsx              # 应用入口
└── rsbuild.config.ts          # 构建配置与插件注册
```

## ⚙️ 配置说明

页面内容以 `src/config/content.ts` 中的 `contentConfig` 为入口，音乐和图片列表从生成的 JSON 文件导入，包括：

- **用户信息** (`user`) - 用户名、头像、标签、菜单项
- **欢迎信息** (`welcome`) - 欢迎卡片头像，问候语按本地时间生成
- **文章信息** (`article`) - 文章标题、日期、分类与链接；会合并抓取到的最新文章
- **开源项目** (`openSource`) - 卡片文案、项目列表、维护状态和链接
- **音乐配置** (`music`) - 播放器标题和音乐列表
- **社交链接** (`socialLinks`) - 各平台链接
- **图片配置** (`images`) - 从 `public/cardImg` 扫描生成的图片卡片数据
- **推荐信息** (`recommend`) - 保留的配置，当前主页未渲染推荐卡片
- **世界地图** (`worldMap`) - 标记点、可选航迹与图例配置
- **日历配置** (`calendar`) - ICS 文件路径（支持本地路径或远程 URL）

详细配置说明请查看 [config/README.md](./src/config/README.md)。

## 🔌 自定义插件

项目包含三个自定义 Rsbuild 插件，均在 `rsbuild.config.ts` 中注册：

| 插件 | 数据来源 | 输出文件 | 更新时机 |
| --- | --- | --- | --- |
| FetchBlogPlugin | `user.menuItems[0].url` 指向的博客首页 | `src/config/blog-data.json` | 构建前 |
| BgmListPlugin | `public/bgm` 音频文件 | `src/config/bgm-data.json` | 构建前 |
| CardImgListPlugin | `public/cardImg` 图片文件 | `src/config/card-img-data.json` | 构建前、开发服务器启动前 |

博客和音乐数据不会因启动开发服务器而重新生成；需要更新时执行 `pnpm build`。生成的 JSON 会被插件覆盖，持续性修改应调整源资源或插件配置。

插件详情请查看 [plugins/README.md](./plugins/README.md)。

## 📝 开发指南

### 代码规范

- **ESLint**: 运行 `pnpm run lint` 检查代码规范
- **Prettier**: 运行 `pnpm run format` 格式化代码

### 添加新组件

1. 在 `src/components/` 下创建组件目录
2. 创建 `ComponentName.tsx`、`ComponentName.css` 和 `index.ts`
3. 参考现有组件的结构和样式
4. 在 `App.tsx` 的 `renderCard` 和 `cardConfigs` 中接入卡片
5. 在 `src/constant.ts` 的 `CARD_SIZES` 中定义桌面尺寸，在 `COMPACT_CARD_ORDER` 中配置移动端和平板端顺序；按需补充紧凑布局样式

### 修改内容

手动内容编辑 `src/config/content.ts`；音乐和图片分别维护在 `public/bgm` 和 `public/cardImg`。具体数据来源与覆盖关系见 [配置文档](./src/config/README.md)。

### 页面布局与常量

- `App.tsx` 管理背景、随机布局和无限画布状态，并通过 `renderCard` 统一创建卡片内容。
- `H5.tsx` 负责移动端（≤ 767px）和平板端（768–1024px）的紧凑布局。
- `PC.tsx` 负责桌面端（≥ 1025px）的随机布局、定位动画和工具栏。
- 两种布局通过 props 接收数据及事件回调，背景和布局状态由 `App.tsx` 维护。
- `src/constant.ts` 集中维护 `GITHUB_REPO_URL`、`BACKGROUND_EXIT_DURATION_MS`、`CARD_SIZES` 和 `COMPACT_CARD_ORDER`。
- 断点定义位于 `src/hooks/useBreakpoint.ts`，布局与主题样式位于 `src/App.css`。

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
   - `travel` - 旅行地点
   - `residence` - 居住地点
   - `wish` - 愿望地点
   - `airport` - 机场

   标记颜色随主题变化，由 `src/App.css` 中的 `--world-map-marker-*` 变量控制。

3. **交互**：
   - 滚轮缩放；放大后可拖拽平移
   - 悬停显示名称与说明；可选「查看照片」链接
   - 双击或地图上的全屏按钮进入全屏；图例可点击筛选类型
   - 实现细节见 `src/components/WorldMap/`（移植自 [plane-list 地图文档](https://github.com/SHUAXINDIARY/plane-list/blob/main/docs/map.md)）

## 📚 相关资源

- [Rsbuild 文档](https://rsbuild.rs) - 探索 Rsbuild 的功能和 API
- [Rsbuild GitHub](https://github.com/web-infra-dev/rsbuild) - 欢迎反馈和贡献
- [React 文档](https://react.dev) - React 官方文档
- [TypeScript 文档](https://www.typescriptlang.org) - TypeScript 官方文档
- [ical.js 文档](https://kewisch.github.io/ical.js/api/) - iCalendar 解析库 API 文档
- [plane-list 地图组件](https://github.com/SHUAXINDIARY/plane-list/tree/main/src/components/map) - Canvas 世界地图参考实现

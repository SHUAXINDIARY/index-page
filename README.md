# Index Page

一个现代化的个人主页/导航页项目，采用 iOS 风格的毛玻璃设计，集成了用户信息、文章展示、音乐播放、时钟日历等多种功能模块。ui灵感来自于 [yysuni](https://www.yysuni.com/)

## ✨ 功能特性

- 🎨 **iOS 风格设计** - 毛玻璃效果、圆润圆角、柔和阴影
- 👤 **用户信息卡片** - 展示头像、标签和导航菜单
- 📝 **文章卡片** - 自动抓取并展示最新博客文章
- 🎵 **音乐播放器** - 支持随机播放、进度显示
- ⏰ **实时时钟** - 数字时钟显示
- 📅 **日历组件** - 月历视图，高亮当天
- 🔗 **社交链接** - 快速访问各个社交平台
- 🖼️ **图片展示** - 可自定义的图片卡片
- ⚙️ **自定义插件** - 构建时自动抓取博客文章、生成音乐列表

## 🛠️ 技术栈

- **框架**: React 18 + TypeScript
- **构建工具**: Rsbuild
- **样式**: CSS（毛玻璃效果）
- **图标**: Lucide React
- **日期处理**: Day.js
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
│   │   ├── SocialLinks/       # 社交链接
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

## 📚 相关资源

- [Rsbuild 文档](https://rsbuild.rs) - 探索 Rsbuild 的功能和 API
- [Rsbuild GitHub](https://github.com/web-infra-dev/rsbuild) - 欢迎反馈和贡献
- [React 文档](https://react.dev) - React 官方文档
- [TypeScript 文档](https://www.typescriptlang.org) - TypeScript 官方文档

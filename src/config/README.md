# 内容配置文件

`content.ts` 定义页面内容的 TypeScript 类型和 `contentConfig`。`App.tsx` 使用这些数据创建卡片，再交给 `H5.tsx`、`PC.tsx` 或无限画布展示。

## 文件与数据来源

| 文件 | 用途 | 维护方式 |
| --- | --- | --- |
| `content.ts` | 类型定义、手动内容、音乐和图片数据入口 | 编辑对应配置项 |
| `content.example.ts` | 配置字段示例 | 参考字段，合并到正式配置 |
| `blog-data.json` | 最新文章及抓取时间 | FetchBlogPlugin 在构建前生成 |
| `bgm-data.json` | 音乐列表及生成时间 | BgmListPlugin 在构建前扫描 `public/bgm` 生成 |
| `card-img-data.json` | 图片列表及生成时间 | CardImgListPlugin 在构建前、开发服务器启动前扫描 `public/cardImg` 生成 |

生成的 JSON 会在插件执行时覆盖，通常应修改源资源或插件配置。`content.example.ts` 从正式 `content.ts` 导入类型，不要直接用它覆盖正式文件；保留正式文件的类型定义、数据导入和导出结构。

## 配置项总览

| 配置项 | 类型 | 当前用途 |
| --- | --- | --- |
| `user` | `UserInfo` | 用户信息、菜单；`tag` 也用于欢迎卡片 |
| `welcome` | `WelcomeInfo` | 欢迎卡片配置 |
| `article` | `ArticleInfo` | 文章卡片的基础内容，合并抓取数据后展示 |
| `openSource` | `OpenSourceInfo` | 开源项目卡片和详情弹窗 |
| `recommend` | `RecommendInfo` | 保留字段；当前主页未渲染 RecommendCard |
| `music` | `MusicInfo` | 播放器文案、进度和音乐列表 |
| `socialLinks` | `SocialLink[]` | 社交平台入口 |
| `images` | `ImageCardInfo[]` | 图片卡片和随机页面背景 |
| `worldMap` | `WorldMapConfig`（可选） | 世界地图标记、航迹与图例 |
| `calendar` | `CalendarConfig`（可选） | 日历 ICS 数据来源 |

以下字段说明与 `content.ts` 中的类型对应。字段标记 `?` 表示可选，其余为必填。配置示例是 `contentConfig` 对象内的片段，应替换对应字段。

## 用户与欢迎卡片

### `user`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `name` | `string` | 用户名 |
| `tag` | `string` | 自我介绍，当前显示在欢迎卡片中 |
| `avatar` | `string` | 用户头像地址 |
| `menuItems` | 数组 | 菜单项，每项包含下列字段 |
| `menuItems[].icon` | `string` | 支持 `FileText`、`FolderOpen`、`Info`、`Star`、`Globe` |
| `menuItems[].label` | `string` | 菜单文案 |
| `menuItems[].url?` | `string` | 点击后在 iframe 弹窗中打开的地址 |
| `menuItems[].onClick?` | `() => void` | 自定义点击回调，优先于默认 URL 行为 |

```typescript
user: {
  name: '你的名字',
  tag: '前端开发 / 摄影 / 旅行',
  avatar: '/avatar.jpg',
  menuItems: [
    { icon: 'FileText', label: '技术博客', url: 'https://example.com/' },
    { icon: 'Info', label: '关于我', url: 'https://example.com/about/' },
  ],
},
```

`rsbuild.config.ts` 使用 `user.menuItems[0].url` 作为构建期博客抓取地址。调整菜单顺序时，应同步核对该配置。

### `welcome`

包含 `name: string`、`avatar: string`、`highlightColor?: string`。当前 WelcomeCard 使用 `avatar`，按本地时间显示问候语，并读取 `user.tag` 展示介绍；`name` 和 `highlightColor` 保留在配置类型中，当前未用于显示姓名或设置高亮色。

## 文章卡片：`article`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `title` | `string` | 文章标题 |
| `category?` | `string` | 分类文案 |
| `date` | `string` | 日期，建议使用 `YYYY/MM/DD` |
| `icon` | `string` | 图标文本，如 emoji |
| `link?` | `string` | 文章链接；未配置且未抓取到链接时点击不跳转 |
| `tag` | `string` | 卡片角标 |

数据覆盖顺序：

1. `App.tsx` 将 `blog-data.json` 的 `latestPost` 合并到 `contentConfig.article`，抓取结果覆盖标题、日期和链接。
2. ArticleCard 挂载后尝试读取 `/config/blog-data.json`、`/blog-data.json`，再尝试抓取博客首页；成功后以运行时数据覆盖对应字段。
3. 运行时请求失败、超时或无有效数据时，保留传入的卡片配置。

构建期抓取失败时，插件会写入“暂无文章”等默认数据。只修改 `article.title` 不一定改变最终显示的标题；需要固定显示静态文章时，也要调整抓取与合并逻辑。更换博客时，除菜单首项 URL 外，还要同步核对 `src/components/ArticleCard/ArticleCard.tsx` 中的 `BLOG_URL`。

## 开源项目：`openSource`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `tag` | `string` | 卡片角标 |
| `title` | `string` | 卡片和详情弹窗标题 |
| `description` | `string` | 简介 |
| `ctaLabel` | `string` | 行动按钮文案 |
| `projects` | `OpenSourceProject[]` | 完整项目列表 |

每个项目包含：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `name` | `string` | 项目名称 |
| `description` | `string` | 一句话说明 |
| `repoUrl` | `string` | 代码仓库地址 |
| `homepageUrl?` | `string` | 在线访问地址 |
| `language` | `string` | 技术栈或语言 |
| `tags` | `string[]` | 项目标签 |
| `status` | `'active' \| 'maintained' \| 'archived'` | 活跃开发、持续维护或归档 |
| `role` | `string` | 你在项目中的职责 |
| `featured?` | `boolean` | 是否优先用于卡片预览 |

```typescript
openSource: {
  tag: 'Open Source',
  title: '开源项目',
  description: '正在维护的项目与工具。',
  ctaLabel: '查看全部',
  projects: [
    {
      name: 'example-project',
      description: '项目简介',
      repoUrl: 'https://github.com/yourname/example-project',
      homepageUrl: 'https://example.com/',
      language: 'TypeScript',
      tags: ['React', 'Tool'],
      status: 'active',
      role: '作者与维护者',
      featured: true,
    },
  ],
},
```

卡片预览最多展示两个项目，详情弹窗展示完整列表。

## 推荐信息：`recommend`

包含 `name: string`、`description: string` 和 `avatar: string`。该字段仍是 `ContentConfig` 的必填项，但当前 `App.tsx` 未接入 RecommendCard，因此修改它不会改变主页展示。

## 音乐播放器：`music`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `label` | `string` | 播放器标签文案 |
| `title` | `string` | 尚未选曲时的标题 |
| `progress` | `number` | 未播放时使用的进度值，范围 0–100 |
| `urlList?` | `MusicTrack[]` | 每项包含 `name: string` 和 `url: string` |

正式配置通过 `urlList: bgmData.urlList` 读取生成列表。添加本地音乐：

1. 将音频放入 `public/bgm`，支持 `.wav`、`.mp3`、`.ogg`、`.flac`、`.m4a`。
2. 执行 `pnpm build` 重新生成 `bgm-data.json`。仅启动开发服务器不会重新扫描音乐。
3. 文件名去掉扩展名后作为曲名，资源地址为 `/bgm/文件名`。

也可以在 `content.ts` 中手动提供 `urlList`，填写本地或远程音频地址。首次播放和“下一首”会随机选曲，支持暂停、继续与实时进度；播放结束后停止。`label` 是显示文案，不控制播放模式。

## 社交链接：`socialLinks`

数组每项包含 `icon: string`、`label: string` 和 `url?: string`。当前支持的图标标识有 `Github`、`Juejin`、`Photography`、`music`、`X` 和 `Red Note`，其他标识显示为文本。

```typescript
socialLinks: [
  { icon: 'Github', label: 'GitHub', url: 'https://github.com/yourname' },
  { icon: 'X', label: 'X', url: 'https://x.com/yourname' },
],
```

添加新图标时，同步修改 `src/components/SocialLinks/SocialLinks.tsx` 的 `renderIcon`；用户菜单图标则维护在 UserCard 的 `iconMap` 中。

## 图片卡片与页面背景：`images`

每项包含 `imageUrl: string` 和 `alt: string`。正式配置通过 `images: cardImgData.images` 读取生成列表。

1. 将图片放入 `public/cardImg`，支持 `.jpg`、`.jpeg`、`.png`、`.gif`、`.webp`、`.avif`、`.svg`。
2. 重新启动开发服务器或执行 `pnpm build`，更新 `card-img-data.json`。
3. 文件名去掉扩展名后作为 `alt`，资源地址为 `/cardImg/文件名`。

主题面板中的图片背景开关也从该列表随机选图。列表为空时，不启用图片背景。需要自定义图片描述或远程图片时，可以在 `content.ts` 中改为手动提供 `images` 数组。

## 世界地图：`worldMap`（可选）

不配置 `worldMap` 时，页面和布局配置中均不显示地图卡片。配置对象支持：

- `markers?`：标记数组，每项必填 `name`、`lat`、`lng`、`type`，可选 `description` 和照片链接 `imgUrl`。
- `routes?`：航迹数组，每项必填 `name`、`startLat`、`startLng`、`endLat`、`endLng`、`scope`；`scope` 为 `domestic`（实线）或 `international`（虚线）。
- `legend?`：图例数组，每项包含 `type` 和 `label`。

标记类型为 `travel`（旅行）、`residence`（居住）、`wish`（愿望）或 `airport`（机场）；纬度范围 −90 到 90，经度范围 −180 到 180。标记颜色由 `src/App.css` 中的 `--world-map-marker-*` 主题变量控制。

```typescript
worldMap: {
  markers: [
    {
      name: '北京',
      lat: 39.9042,
      lng: 116.4074,
      type: 'travel',
      description: '中国北京',
      imgUrl: 'https://example.com/photos',
    },
  ],
  routes: [
    {
      name: '北京 → 上海',
      startLat: 39.9042,
      startLng: 116.4074,
      endLat: 31.2304,
      endLng: 121.4737,
      scope: 'domestic',
    },
  ],
  legend: [{ type: 'travel', label: '旅行' }],
},
```

地图使用 Canvas + SVG 底图，随主题切换深浅色；支持缩放、放大后拖拽、标记提示、键盘方向键聚焦、图例筛选，以及双击或点击按钮进入全屏。

## 日历：`calendar`（可选）

支持 `icsUrl?: string`，可以是 `public/` 下的本地路径或远程 URL：

```typescript
calendar: {
  icsUrl: '/中国大陆节假日.ics',
  // 远程示例：icsUrl: 'https://example.com/calendar.ics',
},
```

将文件放在 `public/` 下时，URL 以 `/` 开头，不包含 `public`。远程文件需允许浏览器跨域读取。日历组件直接读取 `contentConfig.calendar`，加载并解析事件、标记日期、显示提示；未配置 ICS 地址时仍显示基础月历。

## 布局与页面常量

内容和布局分别维护：

| 修改目标 | 位置 |
| --- | --- |
| 页面数据与类型 | `src/config/content.ts` |
| 工具栏仓库链接 | `src/constant.ts` 的 `GITHUB_REPO_URL` |
| 桌面卡片尺寸 | `src/constant.ts` 的 `CARD_SIZES` |
| 移动端和平板端卡片顺序 | `src/constant.ts` 的 `COMPACT_CARD_ORDER` |
| 图片背景退出清理延迟 | `src/constant.ts` 的 `BACKGROUND_EXIT_DURATION_MS` |
| 卡片接入、共享状态与模式切换 | `src/App.tsx` 的 `cardConfigs`、`renderCard` 等 |
| 移动端和平板端布局、工具栏 | `src/H5.tsx` |
| 桌面随机布局、卡片定位动画、工具栏 | `src/PC.tsx` |
| 三档断点（767px / 1024px） | `src/hooks/useBreakpoint.ts` |
| 主题色与响应式样式 | `src/App.css` |

H5 和 PC 通过 props 接收背景、卡片渲染函数和交互回调，共享状态由 App 管理。新增卡片时，同时接入 `renderCard`、`cardConfigs`、`CARD_SIZES` 和 `COMPACT_CARD_ORDER`，并按需补充样式。

位置按钮的“中国 | 北京”文案目前写在 `App.tsx` 的 `renderCard` 中，不属于 `contentConfig`。主题设置由 ThemeProvider 和主题面板管理，预设选项位于 `src/components/ThemeToggle/ThemeToggle.tsx`。

插件行为与输出格式见 [plugins/README.md](../../plugins/README.md)，项目使用方式见 [根目录 README](../../README.md)。

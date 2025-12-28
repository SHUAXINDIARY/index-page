# 自定义 Rsbuild 插件

本项目包含两个自定义 Rsbuild 插件，用于在构建时自动生成配置数据。

## 📦 插件概览

| 插件 | 功能 | 输出文件 |
|------|------|----------|
| **FetchBlogPlugin** | 抓取博客最新文章 | `src/config/blog-data.json` |
| **BgmListPlugin** | 扫描 BGM 目录生成音乐列表 | `src/config/bgm-data.json` |

这两个插件都在构建时自动执行，无需手动操作，生成的数据可以直接在应用中使用。

---

## FetchBlogPlugin

一个用于在构建时抓取博客最新文章的 Rsbuild 插件。

### 功能

- 在构建时自动抓取 https://blog.shuaxindiary.cn/ 的最新文章
- 提取文章的标题、日期和链接
- 将数据保存到 JSON 文件中供应用使用

### 使用方法

在 `rsbuild.config.ts` 中引入并使用：

```typescript
import { fetchBlogPlugin } from './plugins/fetch-blog-plugin';

export default defineConfig({
  plugins: [
    pluginReact(),
    fetchBlogPlugin({
      blogUrl: 'https://blog.shuaxindiary.cn/',
      outputPath: './src/config/blog-data.json',
    }),
  ],
});
```

### 配置选项

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `blogUrl` | `string` | `'https://blog.shuaxindiary.cn/'` | 博客首页 URL |
| `outputPath` | `string` | `'./src/config/blog-data.json'` | 输出 JSON 文件路径 |

### 输出格式

插件会生成一个 JSON 文件，格式如下：

```json
{
  "latestPost": {
    "title": "文章标题",
    "date": "2025/11/21",
    "link": "https://blog.shuaxindiary.cn/posts/article-slug"
  },
  "fetchedAt": "2025-12-05T10:30:00.000Z"
}
```

**日期格式说明：**
- 日期统一转换为 `YYYY/MM/DD` 格式
- 支持解析多种日期格式：ISO、英文日期、各种分隔符等
- 如果无法解析日期，会使用当前日期

### 在应用中使用

```typescript
import blogData from './config/blog-data.json';

// 使用最新文章数据
const { latestPost } = blogData;
console.log(latestPost.title); // 文章标题
console.log(latestPost.date);  // 发布日期
console.log(latestPost.link);  // 文章链接
```

### 工作原理

1. 插件在构建开始前（`onBeforeBuild` 钩子）执行
2. 使用 `fetch` 获取博客首页 HTML
3. 使用 `cheerio` 解析 HTML 并提取最新文章信息
4. 使用 `dayjs` 将日期统一格式化为 `YYYY/MM/DD` 格式
5. 将提取的数据写入 JSON 文件
6. 应用可以在运行时读取这个 JSON 文件

### 注意事项

- 插件只在构建时执行，不会在开发服务器热更新时重复执行
- 如果抓取失败，会使用默认数据
- 确保网络连接正常，否则构建可能会失败或使用默认数据

---

## BgmListPlugin

一个用于在构建时自动扫描 `public/bgm` 目录并生成音乐列表的 Rsbuild 插件。

### 功能

- 在构建时自动扫描 `public/bgm` 目录下的音频文件
- 提取文件名（去掉扩展名）作为音乐名称
- 生成相对于 `public` 目录的 URL 路径
- 将数据保存到 JSON 文件中供应用使用

### 使用方法

在 `rsbuild.config.ts` 中引入并使用：

```typescript
import { bgmListPlugin } from './plugins/bgm-list-plugin';

export default defineConfig({
  plugins: [
    pluginReact(),
    bgmListPlugin({
      bgmDir: 'public/bgm',
      outputPath: './src/config/bgm-data.json',
      extensions: ['.wav', '.mp3', '.ogg', '.flac', '.m4a'],
    }),
  ],
});
```

### 配置选项

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `bgmDir` | `string` | `'public/bgm'` | BGM 文件所在目录，相对于项目根目录 |
| `outputPath` | `string` | `'./src/config/bgm-data.json'` | 输出 JSON 文件路径 |
| `extensions` | `string[]` | `['.wav', '.mp3', '.ogg', '.flac', '.m4a']` | 支持的音频文件扩展名 |

### 输出格式

插件会生成一个 JSON 文件，格式如下：

```json
{
  "urlList": [
    {
      "name": "危机合约净罪作战OST",
      "url": "/bgm/危机合约净罪作战OST.m4a"
    },
    {
      "name": "巴别塔OST",
      "url": "/bgm/巴别塔OST.m4a"
    }
  ],
  "generatedAt": "2025-12-05T10:30:00.000Z"
}
```

**说明：**
- `name`：文件名（去掉扩展名）
- `url`：相对于 `public` 目录的路径，部署后可直接访问
- `generatedAt`：生成时间戳

### 在应用中使用

```typescript
import bgmData from './config/bgm-data.json';

// 使用音乐列表数据
const { urlList } = bgmData;
console.log(urlList); // [{ name: '...', url: '...' }, ...]

// 在配置中使用
music: {
  label: '随机播放',
  title: '塞壬唱片',
  progress: 0,
  urlList: bgmData.urlList,
}
```

### 工作原理

1. 插件在构建开始前（`onBeforeBuild` 钩子）执行
2. 扫描指定的 `bgmDir` 目录
3. 过滤出支持的音频文件格式
4. 提取文件名（去掉扩展名）作为音乐名称
5. 生成相对于 `public` 目录的 URL 路径
6. 将数据写入 JSON 文件
7. 应用可以在运行时读取这个 JSON 文件

### 文件命名建议

- 使用有意义的文件名，因为文件名（去掉扩展名）会作为音乐名称显示
- 例如：`危机合约净罪作战OST.m4a` → 显示为 "危机合约净罪作战OST"
- 避免使用特殊字符，建议使用中文、英文、数字、下划线等

### 注意事项

- 插件只在构建时执行，不会在开发服务器热更新时重复执行
- 如果目录不存在或扫描失败，会返回空数组
- 确保音频文件放在 `public/bgm` 目录下（或配置的目录）
- 支持的音频格式可以通过 `extensions` 选项自定义
- 文件路径会转换为相对于 `public` 目录的路径，确保部署后可以正确访问


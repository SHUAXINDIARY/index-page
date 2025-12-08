# 自定义 Rsbuild 插件

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


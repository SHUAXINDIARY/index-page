个人网站设计系统风格指南

> 提取自: https://www.yysuni.com/  
> 提取日期: 2026-02-06

---

## 1. 概述

YYsuni 是一个现代化的个人博客/作品集网站，采用了温暖柔和的设计风格，融合了日式简约美学与现代玻璃态(Glassmorphism)设计理念。整体设计给人一种温馨、友好、专业的感觉。

### 设计关键词
- **温暖柔和** - 暖色调为主
- **玻璃态设计** - 半透明卡片+内阴影
- **大圆角** - 64px 超大圆角
- **可爱插画** - 手绘风格头像和装饰
- **清晰层次** - 通过阴影和透明度建立深度

---

## 2. 设计哲学 (Evidence-based)

### 2.1 视觉层次
网站采用三层视觉结构：
1. **背景层** - 纯色 `#EEEEEE` 淡灰色背景
2. **卡片层** - 半透明白色玻璃态卡片
3. **内容层** - 文字、图片、交互元素

### 2.2 核心设计特征
- **玻璃态卡片** - 使用 `rgba(255, 255, 255, 0.4)` 配合内阴影营造毛玻璃效果
- **超大圆角** - 主要容器使用 64px 圆角，营造柔和友好感
- **温暖配色** - 主色调为棕褐色 `#4E3F42`，配合红色强调色 `#DE4331`
- **精致阴影** - 多层阴影系统，包含外阴影和内阴影

---

## 3. 语义化 Token 系统

### 3.1 颜色 Token

```css
:root {
  /* 品牌色 */
  --color-primary: #4E3F42;        /* 主文字色 - 深棕褐色 */
  --color-secondary: #7B888E;      /* 次要文字 - 灰蓝色 */
  --color-accent: #DE4331;         /* 强调色 - 暖红色 */
  
  /* 背景色 */
  --color-bg: #EEEEEE;             /* 页面背景 - 淡灰色 */
  --color-card: rgba(255, 255, 255, 0.4);  /* 卡片背景 - 半透明白 */
  --color-card-solid: #FFFFFF;     /* 实色白 */
  
  /* 边框色 */
  --color-border: #FFFFFF;         /* 边框 - 纯白 */
  
  /* 阴影色 */
  --color-shadow-outer: rgba(0, 0, 0, 0.05);      /* 外阴影 */
  --color-shadow-warm: rgb(226, 217, 206);        /* 暖色阴影 */
  --color-shadow-inset: rgba(255, 255, 255, 0.25); /* 内阴影 */
}
```

### 3.2 间距 Token

```css
:root {
  --spacing-unit: 0.25rem;  /* 4px 基础单位 */
  --spacing-xs: 6px;
  --spacing-sm: 8px;
  --spacing-md: 12px;
  --spacing-lg: 16px;
  --spacing-xl: 24px;
}
```

### 3.3 圆角 Token

```css
:root {
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 32px;
  --radius-2xl: 64px;     /* 主要卡片 */
  --radius-full: 9999px;  /* 完全圆形/胶囊形 */
}
```

### 3.4 动效 Token

```css
:root {
  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --duration-slow: 500ms;
  --easing-default: cubic-bezier(0.4, 0, 0.2, 1);
  --transition-all: all var(--duration-fast) var(--easing-default);
}
```

---

## 4. 调色板

### 4.1 主要颜色

| Token | HEX | RGB | 用途 |
|-------|-----|-----|------|
| `--color-primary` | #4E3F42 | rgb(78, 63, 66) | 主文字、标题 |
| `--color-secondary` | #7B888E | rgb(123, 136, 142) | 次要文字、描述 |
| `--color-accent` | #DE4331 | rgb(222, 67, 49) | CTA按钮、强调、红色标签 |

### 4.2 中性色

| Token | HEX | RGB | 用途 |
|-------|-----|-----|------|
| `--color-bg` | #EEEEEE | rgb(238, 238, 238) | 页面背景 |
| `--color-white` | #FFFFFF | rgb(255, 255, 255) | 边框、纯白背景 |
| `--color-black` | #070707 | rgb(7, 7, 7) | Github按钮背景 |

### 4.3 功能色

| Token | 值 | 用途 |
|-------|-----|------|
| `--color-card` | rgba(255, 255, 255, 0.4) | 玻璃态卡片背景 |
| `--color-shadow-warm` | rgb(226, 217, 206) | 温暖投影 |

---

## 5. 字体系统

### 5.1 字体家族

```css
:root {
  /* 中文主字体 */
  --font-sans: "PingFang SC", -apple-system, system-ui, "Segoe UI", 
               Roboto, Ubuntu, Cantarell, "Noto Sans", sans-serif,
               "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei", Arial;
  
  /* 英文装饰字体 */
  --font-display: "Averia Gruesa Libre", sans-serif;
  
  /* 等宽字体 */
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 
               "Liberation Mono", "Courier New", monospace;
}
```

### 5.2 字体层级

| 元素 | 字号 | 行高 | 字重 | 字体 | 颜色 |
|------|------|------|------|------|------|
| H1 (Hero) | 24px | 32px | 400 | Averia Gruesa Libre | --color-primary |
| H2 (Section) | 14px | 20px | 400 | --font-sans | --color-secondary |
| H3 (Card Title) | 14px | 20px | 400 | --font-sans | --color-secondary |
| Body | 16px | 20px | 400 | --font-sans | --color-primary |
| Small/Caption | 12px | 16px | 400 | --font-sans | --color-secondary |

### 5.3 特殊字体使用

- **Averia Gruesa Libre** - 用于 Hero 区域的问候语，营造手写风格的亲切感
- 字体来源: Google Fonts

---

## 6. 间距系统

采用 4px 基础单位 (0.25rem)：

| Token | 值 | 使用场景 |
|-------|-----|----------|
| `--spacing-2` | 8px | 卡片内边距(紧凑) |
| `--spacing-3` | 12px | 圆形按钮padding |
| `--spacing-4` | 16px | 按钮水平padding |
| `--spacing-6` | 24px | 卡片内边距(标准) |

---

## 7. 组件规范

### 7.1 玻璃态卡片 (Glass Card)

**核心样式：**
```css
.glass-card {
  background-color: rgba(255, 255, 255, 0.4);
  border: 1px solid #FFFFFF;
  border-radius: 64px;
  padding: 24px;
  box-shadow: 
    /* 外阴影 - 底部漂浮感 */
    rgba(0, 0, 0, 0.05) 0px 40px 50px -32px,
    /* 内阴影 - 玻璃高光 */
    rgba(255, 255, 255, 0.25) 0px 0px 20px 0px inset;
}
```

**状态矩阵：**

| 状态 | 背景 | 边框 | 阴影 |
|------|------|------|------|
| Default | rgba(255,255,255,0.4) | 1px solid #FFF | 外+内阴影 |
| Hover | rgba(255,255,255,0.6) | 1px solid #FFF | 阴影加深 |
| Active | rgba(255,255,255,0.5) | 1px solid #FFF | 阴影略减 |

### 7.2 主要按钮 (CTA Button)

**核心样式：**
```css
.btn-primary {
  background-color: #DE4331;
  color: #FFFFFF;
  border: 1px solid #FFFFFF;
  border-radius: 16px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: rgba(255, 255, 255, 0.4) 0px 0px 12px 0px inset;
  cursor: pointer;
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-primary:hover {
  transform: scale(1.02);
  box-shadow: rgba(255, 255, 255, 0.5) 0px 0px 16px 0px inset;
}
```

### 7.3 次要按钮 (Secondary Button)

**核心样式：**
```css
.btn-secondary {
  background-color: rgba(255, 255, 255, 0.4);
  color: #4E3F42;
  border: 1px solid #FFFFFF;
  border-radius: 12px;
  padding: 6px;
  box-shadow: 
    rgba(0, 0, 0, 0.05) 0px 40px 50px -32px,
    rgba(255, 255, 255, 0.25) 0px 0px 20px 0px inset;
}
```

### 7.4 圆形图标按钮 (Icon Button)

```css
.btn-icon {
  background-color: rgba(255, 255, 255, 0.4);
  border: 1px solid #FFFFFF;
  border-radius: 9999px; /* 完全圆形 */
  padding: 12px;
  box-shadow: 
    rgba(0, 0, 0, 0.05) 0px 40px 50px -32px,
    rgba(255, 255, 255, 0.25) 0px 0px 20px 0px inset;
}
```

### 7.5 社交链接按钮

**Github 按钮：**
```css
.btn-github {
  background-color: #070707;
  color: #FFFFFF;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 16px;
}
```

**稀土掘金按钮：**
```css
.btn-juejin {
  background-color: #FFFFFF;
  color: #4E3F42;
  border-radius: 8px;
  padding: 8px 16px;
}
```

### 7.6 导航链接

```css
.nav-link {
  color: #4E3F42;
  font-size: 16px;
  font-weight: 400;
  text-decoration: none;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.15s ease;
}

.nav-link:hover {
  background-color: rgba(78, 63, 66, 0.1);
}

.nav-link.active {
  background-color: rgba(222, 67, 49, 0.1);
  color: #DE4331;
}
```

### 7.7 内容卡片链接

```css
.card-link {
  display: flex;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  transition: all 0.15s ease;
}

.card-link:hover {
  background-color: rgba(78, 63, 66, 0.05);
}
```

---

## 8. 阴影系统

### 8.1 阴影 Token

```css
:root {
  /* 玻璃态卡片阴影 - 复合阴影 */
  --shadow-glass: 
    rgba(0, 0, 0, 0.05) 0px 40px 50px -32px,
    rgba(255, 255, 255, 0.25) 0px 0px 20px 0px inset;
  
  /* 温暖投影 - 用于图片卡片 */
  --shadow-warm-lg: rgb(226, 217, 206) 0px 16px 32px -5px;
  --shadow-warm-md: rgb(226, 217, 206) 0px 12px 20px -5px;
  
  /* 内阴影 - 按钮高光 */
  --shadow-inset-light: rgba(255, 255, 255, 0.4) 0px 0px 12px 0px inset;
}
```

### 8.2 阴影使用场景

| 阴影 | 使用场景 |
|------|----------|
| `--shadow-glass` | 玻璃态卡片、导航容器 |
| `--shadow-warm-lg` | 大图片卡片 |
| `--shadow-warm-md` | 小图片卡片 |
| `--shadow-inset-light` | CTA按钮内发光 |

---

## 9. 动效规范

### 9.1 过渡时间

| Token | 值 | 使用场景 |
|-------|-----|----------|
| `--duration-fast` | 150ms | hover 状态变化 |
| `--duration-normal` | 300ms | 内容切换 |
| `--duration-slow` | 500ms | 页面过渡 |

### 9.2 缓动函数

```css
:root {
  --easing-default: cubic-bezier(0.4, 0, 0.2, 1); /* ease-out 风格 */
}
```

### 9.3 全局过渡

网站使用了全局 `transition: all` 实现平滑的状态变化，所有交互元素自动应用过渡效果。

---

## 10. 布局系统

### 10.1 网格布局

页面采用不规则的 Bento Grid 布局风格：
- 左侧导航卡片 (固定宽度)
- 右侧内容区域 (弹性布局)
- 卡片之间使用间距分隔

### 10.2 响应式断点

```css
:root {
  --container-sm: 24rem;   /* 384px */
  --container-md: 28rem;   /* 448px */
  --container-3xl: 48rem;  /* 768px */
  --container-5xl: 64rem;  /* 1024px */
  --container-7xl: 80rem;  /* 1280px */
}
```

---

## 11. 复制粘贴示例

### 示例 1: 玻璃态卡片

```html
<div class="glass-card">
  <h2>标题</h2>
  <p>内容描述...</p>
</div>

<style>
.glass-card {
  background-color: rgba(255, 255, 255, 0.4);
  border: 1px solid #FFFFFF;
  border-radius: 64px;
  padding: 24px;
  box-shadow: 
    rgba(0, 0, 0, 0.05) 0px 40px 50px -32px,
    rgba(255, 255, 255, 0.25) 0px 0px 20px 0px inset;
}
</style>
```

### 示例 2: CTA 按钮

```html
<button class="btn-cta">写文章</button>

<style>
.btn-cta {
  background-color: #DE4331;
  color: #FFFFFF;
  border: 1px solid #FFFFFF;
  border-radius: 16px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: rgba(255, 255, 255, 0.4) 0px 0px 12px 0px inset;
  cursor: pointer;
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-cta:hover {
  transform: scale(1.02);
}
</style>
```

### 示例 3: 侧边导航

```html
<nav class="side-nav">
  <a href="/" class="nav-avatar">
    <img src="avatar.png" alt="avatar" />
    <span class="name">YYsuni</span>
    <span class="badge">(开发中)</span>
  </a>
  <div class="nav-section">GENERAL</div>
  <a href="/blog" class="nav-link active">
    <span class="icon">📝</span>
    近期文章
  </a>
  <a href="/projects" class="nav-link">
    <span class="icon">📦</span>
    我的项目
  </a>
</nav>

<style>
.side-nav {
  background-color: rgba(255, 255, 255, 0.4);
  border: 1px solid #FFFFFF;
  border-radius: 64px;
  padding: 24px;
  box-shadow: 
    rgba(0, 0, 0, 0.05) 0px 40px 50px -32px,
    rgba(255, 255, 255, 0.25) 0px 0px 20px 0px inset;
}

.nav-avatar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.nav-avatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.nav-avatar .name {
  font-weight: 500;
  color: #4E3F42;
}

.nav-avatar .badge {
  color: #DE4331;
  font-size: 12px;
}

.nav-section {
  color: #7B888E;
  font-size: 12px;
  margin: 16px 0 8px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 12px;
  color: #4E3F42;
  text-decoration: none;
  transition: all 0.15s ease;
}

.nav-link:hover {
  background-color: rgba(78, 63, 66, 0.05);
}

.nav-link.active {
  background-color: rgba(222, 67, 49, 0.08);
}

.nav-link.active .icon {
  color: #DE4331;
}
</style>
```

### 示例 4: 文章卡片

```html
<a href="/blog/post" class="article-card">
  <img src="cover.jpg" alt="cover" class="cover" />
  <div class="content">
    <h3>3D 与 Blender 笔记</h3>
    <p>遇到一个坑的笔记</p>
    <time>2026/2/5</time>
  </div>
</a>

<style>
.article-card {
  display: flex;
  gap: 12px;
  padding: 8px;
  background-color: rgba(255, 255, 255, 0.4);
  border: 1px solid #FFFFFF;
  border-radius: 64px;
  text-decoration: none;
  box-shadow: 
    rgba(0, 0, 0, 0.05) 0px 40px 50px -32px,
    rgba(255, 255, 255, 0.25) 0px 0px 20px 0px inset;
}

.article-card .cover {
  width: 80px;
  height: 80px;
  border-radius: 56px;
  object-fit: cover;
}

.article-card .content {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.article-card h3 {
  font-size: 16px;
  font-weight: 500;
  color: #4E3F42;
  margin-bottom: 4px;
}

.article-card p {
  font-size: 12px;
  color: #7B888E;
}

.article-card time {
  font-size: 12px;
  color: #7B888E;
}
</style>
```

### 示例 5: 圆形图标按钮

```html
<button class="icon-btn">
  <svg><!-- icon --></svg>
</button>

<style>
.icon-btn {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.4);
  border: 1px solid #FFFFFF;
  border-radius: 50%;
  box-shadow: 
    rgba(0, 0, 0, 0.05) 0px 40px 50px -32px,
    rgba(255, 255, 255, 0.25) 0px 0px 20px 0px inset;
  cursor: pointer;
  transition: all 0.15s ease;
}

.icon-btn:hover {
  background-color: rgba(255, 255, 255, 0.6);
}

.icon-btn svg {
  width: 20px;
  height: 20px;
  color: #4E3F42;
}
</style>
```

### 示例 6: Hero 问候区域

```html
<div class="hero-card">
  <img src="avatar.png" alt="avatar" class="avatar" />
  <h1>Good Morning<br/>I'm <span class="highlight">Suni</span>, Nice to meet you!</h1>
</div>

<style>
.hero-card {
  text-align: center;
  padding: 32px 24px;
  background-color: rgba(255, 255, 255, 0.4);
  border: 1px solid #FFFFFF;
  border-radius: 64px;
  box-shadow: 
    rgba(0, 0, 0, 0.05) 0px 40px 50px -32px,
    rgba(255, 255, 255, 0.25) 0px 0px 20px 0px inset;
}

.hero-card .avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin-bottom: 16px;
}

.hero-card h1 {
  font-family: "Averia Gruesa Libre", sans-serif;
  font-size: 24px;
  line-height: 1.3;
  color: #4E3F42;
  font-weight: 400;
}

.hero-card .highlight {
  color: #DE4331;
}
</style>
```

---

## 12. 技术栈说明

- **框架**: Next.js (基于文件命名和资源路径推断)
- **CSS**: Tailwind CSS v4 (基于 CSS 变量命名和 @layer 规则)
- **字体服务**: Google Fonts (Averia Gruesa Libre)
- **部署**: Vercel + Cloudflare CDN

---

## 13. 证据文件

- `yysuni-evidence/yysuni-hover-state.png` - Hover 状态截图
- `yysuni-evidence/yysuni-button-hover.png` - 按钮 Hover 状态截图
- CSS 源文件: `/_next/static/chunks/3e38e4306f771c4d.css`

---

## 14. 总结

YYsuni 网站的设计系统具有以下显著特点：

1. **玻璃态设计语言** - 半透明卡片 + 多层阴影系统
2. **温暖色调** - 棕褐色主色 + 暖红色强调色
3. **超大圆角** - 64px 圆角营造友好亲切感
4. **手绘风格** - 可爱插画 + 手写风格英文字体
5. **简洁排版** - 清晰的信息层次和留白

适合用于：个人博客、作品集、创意展示类网站。

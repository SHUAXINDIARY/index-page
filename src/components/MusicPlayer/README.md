# MusicPlayer 组件

音乐播放器组件，支持随机播放、暂停和切换下一首。

## 功能特性

### 播放控制

- **播放/暂停** ▶️/⏸️
  - 首次点击：随机选择一首音乐开始播放
  - 播放中：点击暂停
  - 暂停中：点击继续播放
  - 图标自动切换

- **下一首** ⏭️
  - 随机选择新的音乐并播放
  - 自动停止当前播放
  - 无音乐列表时自动禁用

### 显示功能

- **动态标题**
  - 未播放：显示配置的默认标题
  - 播放中：显示当前音乐名称

- **实时进度条**
  - 未播放：显示配置的初始进度
  - 播放中：显示真实播放进度（0-100%）

## 配置示例

```typescript
import { contentConfig } from './config/content';

// 在 content.ts 中配置
music: {
  label: '随机播放',
  title: '塞壬唱片',
  progress: 0,
  urlList: [
    {
      name: '未许之地OST',
      url: 'https://example.com/music1.wav'
    },
    {
      name: 'Little Wish',
      url: 'https://example.com/music2.wav'
    }
  ]
}
```

## 使用方法

```tsx
import { MusicPlayer } from './components/MusicPlayer';
import { contentConfig } from './config/content';

<MusicPlayer config={contentConfig.music} />
```

## 样式定制

主要 CSS 类：

```css
.music-player          /* 容器 */
.music-info           /* 信息区域 */
.music-label          /* 播放模式标签 */
.music-title          /* 音乐标题 */
.music-progress       /* 进度条容器 */
.music-progress-bar   /* 进度条 */
.music-controls       /* 按钮组 */
.music-play-button    /* 播放/暂停按钮 */
.music-next-button    /* 下一首按钮 */
```

## 技术细节

### 状态管理

```typescript
const [isPlaying, setIsPlaying] = useState(false);      // 播放状态
const [progress, setProgress] = useState(0);            // 播放进度
const [currentTrack, setCurrentTrack] = useState(null); // 当前音乐
const audioRef = useRef<HTMLAudioElement | null>(null); // 音频元素
```

### 事件监听

- `timeupdate` - 更新进度条
- `ended` - 播放结束处理
- `error` - 错误处理

### 资源清理

组件卸载时自动：
- 停止播放
- 释放音频资源
- 清理事件监听器

## 注意事项

1. **音频格式**：确保提供的音频 URL 可访问且格式支持
2. **CORS**：跨域音频可能需要服务器支持 CORS
3. **自动播放**：浏览器可能限制自动播放，需要用户交互后才能播放
4. **资源管理**：组件会自动清理资源，无需手动处理

## 扩展功能

可以轻松扩展的功能：

- 播放列表显示
- 顺序播放模式
- 循环播放
- 音量控制
- 播放历史
- 收藏功能


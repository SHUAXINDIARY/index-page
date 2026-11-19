# Hooks 使用与实现说明

本文基于 2026-11-19 的源码静态整理，覆盖 `src/hooks/` 下的全部文件。示例中的 `@/` 对应 `src/`，由项目 `tsconfig.json` 配置。

## 目录总览

| 文件 | Hook | 用途 | 当前调用位置 |
| --- | --- | --- | --- |
| [useBreakpoint.ts](../src/hooks/useBreakpoint.ts) | `useBreakpoint` | 将视口宽度分为手机、平板、桌面三档 | `App.tsx`、`ThemeToggle.tsx` |
| [useIsMobile.ts](../src/hooks/useIsMobile.ts) | `useIsMobile` | 判断视口是否小于 768px | 当前源码没有调用 |
| [useRandomLayout.ts](../src/hooks/useRandomLayout.ts) | `useRandomLayout` | 计算不重叠的随机卡片布局及整体缩放 | `App.tsx` |
| [useModalAccessibility.ts](../src/hooks/useModalAccessibility.ts) | `useModalAccessibility` | 自定义弹层的背景隔离、焦点约束与恢复 | iframe 弹窗、开源项目弹窗、全屏轮播、全屏地图、移动主题面板 |
| [themeContext.ts](../src/hooks/themeContext.ts) | `useTheme` | 读取共享主题状态与修改方法 | 主题面板、世界地图、无限画布 |

`themeContext.ts` 还包含主题类型、持久化常量和工具函数；实际状态由 [ThemeProvider.tsx](../src/providers/ThemeProvider.tsx) 管理。其余布局与弹层辅助函数是文件内部实现，没有导出供外部调用。

## useBreakpoint：三档视口判断

### 使用方式

```ts
import { useBreakpoint } from '@/hooks/useBreakpoint';
import type { Breakpoint } from '@/hooks/useBreakpoint';

// 在函数组件或自定义 Hook 顶层调用。
const breakpoint = useBreakpoint();
const isCompact = breakpoint !== 'desktop';
```

无参数，返回 `Breakpoint`，取值如下：

| 返回值 | 视口宽度 |
| --- | --- |
| `mobile` | ≤ 767px |
| `tablet` | > 767px 且 ≤ 1024px |
| `desktop` | > 1024px |

项目用 `isCompact` 将手机与平板合并为紧凑布局。需要三档布局时优先使用此 Hook，避免各组件重复定义断点。

### 实现过程

1. 模块加载时，通过 `window.innerWidth` 初始化模块级 `cachedBreakpoint`；无 `window` 时使用 1920px。
2. `useSyncExternalStore` 读取缓存快照，并注册 `resize` 订阅。
3. 每次窗口尺寸变化重新计算断点，只有档位改变时才更新缓存并通知当前订阅回调。
4. 组件卸载时移除对应的 `resize` 监听。
5. 服务端快照固定返回 `desktop`。

### 使用边界

- 判断依据是视口宽度，不是设备型号、触摸能力或用户代理。窄桌面窗口同样可能返回 `mobile`。
- 每个调用实例都会注册自己的事件监听，并非一个统一的全局监听。
- 当前多个实例共用缓存，但各自仅在“计算结果与共享缓存不同”时通知。一次跨断点 resize 中，前一个监听更新缓存后，后续监听可能跳过通知，因此多消费者不保证同步更新。这是现有实现的限制。
- 订阅建立时不会主动刷新缓存；若没有任何订阅者期间发生 resize，之后重新挂载可能先读到旧快照。
- 服务端固定桌面快照只是回退，不代表服务端可以准确识别客户端宽度。

## useIsMobile：布尔视口判断

### 使用方式

```ts
import { useIsMobile } from '@/hooks/useIsMobile';

const isMobile = useIsMobile();
```

无参数，返回 `boolean`：视口宽度 `< 768px` 为 `true`，其余为 `false`。它与 `useBreakpoint() === 'mobile'` 的区间一致，但不区分平板与桌面。

### 实现过程

1. 使用 `useState` 惰性初始化，从 `window.innerWidth` 读取首次结果；无 `window` 时返回 `false`。
2. Effect 注册 `resize` 监听，每次触发时重新计算并调用状态更新。
3. 卸载时移除监听。

### 使用边界

- 当前没有业务调用，三档判断已经由 `useBreakpoint` 承担。
- 各实例持有独立状态和监听，不共享结果，也没有节流或防抖。
- Effect 挂载时只注册事件，不主动执行宽度校验。
- 名称中的 “Mobile” 表示窄视口，不表示真实移动设备。
- 首次无 `window` 时的回退不等于完整的服务端渲染适配。

## useRandomLayout：随机卡片布局

### 使用方式

```ts
import { useRandomLayout } from '@/hooks/useRandomLayout';
import type { CardConfig } from '@/hooks/useRandomLayout';

// 模块级常量保持引用稳定；尺寸单位为 CSS 像素。
const cards: CardConfig[] = [
  { id: 'article', size: { width: 280, height: 165 } },
  { id: 'calendar', size: { width: 300, height: 330 } },
];

// 在组件顶层调用，enabled 控制是否计算随机坐标。
const { layout, refreshLayout } = useRandomLayout(cards, true);
```

实际接入见 [App.tsx](../src/App.tsx) 和 [PC.tsx](../src/PC.tsx)。App 的启用条件为 `!isCompact || infiniteCanvasEnabled`：桌面布局或无限画布需要坐标，普通紧凑布局关闭坐标计算。

### 参数与返回值

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `cards` | `CardConfig[]` | 无 | 卡片标识与尺寸列表 |
| `enabled` | `boolean` | `true` | 是否启用随机布局计算 |

导出类型包括 `CardConfig`、`CardPosition`、`LayoutResult`：

| 类型或返回字段 | 结构 | 含义 |
| --- | --- | --- |
| `CardConfig` | `{ id, size: { width, height } }` | 卡片配置；`id` 为字符串，尺寸为数字 |
| `CardPosition` | `{ x, y, width, height }` | 未缩放的卡片坐标与尺寸，均为数字 |
| `layout.positions` | `Record<string, CardPosition>` | 按卡片 ID 索引坐标 |
| `layout.totalWidth` | `number` | 未缩放布局的总宽度 |
| `layout.totalHeight` | `number` | 未缩放布局的总高度 |
| `layout.scale` | `number` | 建议应用于整个布局的缩放比例 |
| `refreshLayout` | `() => void` | 递增内部刷新键，触发重新摆放 |

`CardSize` 与 `BaseLayoutResult` 是内部类型，没有单独导出。

### 布局算法

1. **分类并排序**：按面积将卡片分为大、中、小三组，各组先 Fisher–Yates 洗牌，再按面积降序排列，整体按大、中、小顺序处理。面积 ≥ 60000 为大卡片，≥ 15000 且 < 60000 为中卡片，其余为小卡片。洗牌主要影响相同面积项的先后次序。
2. **生成候选位置**：第一张卡片放在 `(0, 0)`；后续围绕已有卡片的右侧、下方、左侧、上方、边缘及中心对齐位置生成候选点，并补充整体边界周围的位置。
3. **剔除碰撞**：候选矩形必须与全部已放置卡片保持至少 20px 的间隔。
4. **综合评分**：在合法位置中选择分数最低者，综合考虑距离中心、黄金宽高比偏差、按面积加权的视觉重心、填充率、边缘对齐奖励及随机扰动。
5. **兜底放置**：没有合适候选时尝试边界外的位置，最后仍以整体右侧作为兜底。
6. **归一化坐标**：减去最终边界的最小 X、Y，将布局移到以左上角为起点的坐标系，计算总宽高。

综合评分为：

```text
中心距离 × 0.3 × 尺寸权重
+ 黄金比例偏差分 × 0.25
+ 视觉重心偏移分 × 0.2
+ 紧凑度分 × 0.15
+ 对齐奖励
+ 随机扰动
```

尺寸权重分别为大卡片 `0.8`、中卡片 `1`、小卡片 `1.2`。黄金比例目标为 `1.618`，随机扰动范围为 `[-15, 15)`。这是启发式算法，没有最优装箱或每次结果不同的保证。

### 缩放与更新

每个方向预留 80px 视口空间，计算：

```text
可用宽度 = 视口宽度 - 160
可用高度 = 视口高度 - 160
scale = max(0.5, min(可用宽度 / 总宽度, 可用高度 / 总高度, 1))
```

- 基础坐标通过 `useMemo` 缓存，仅在 `cards` 引用、`enabled` 或内部刷新键变化时重新计算。
- resize 通过 `useSyncExternalStore` 更新视口快照，通常只重算缩放；如果调用方同时改变启用状态，也会重新计算基础布局。
- `enabled=false` 时返回空位置映射、总宽高 `0`、缩放 `1`。
- Hook 不操作卡片 DOM、不应用 CSS、不执行坐标动画；PC 布局负责绝对定位、容器缩放和 Motion 动画。
- `refreshLayout` 通过 `useCallback` 保持稳定引用。

### 副作用与注意事项

- 每个实例订阅 `resize`，卸载时移除监听。视口快照在模块级缓存，无浏览器环境时使用 `1920 × 1080`。
- 每个实例还注册全局 `keydown`，拦截 `e.key === 'r'` 且按下 Cmd 或 Ctrl 的组合，调用 `preventDefault()` 后刷新布局，因而会覆盖对应的浏览器刷新行为。
- `enabled=false` 仍保留 resize 和键盘监听；它只关闭基础布局计算。快捷键也不排除输入框。
- 卡片数组应保持稳定引用，不能在每次渲染时无条件创建新数组，否则会反复触发随机排布；更改卡片时应创建新数组，避免原地修改后缓存不更新。
- ID 必须唯一，重复 ID 会覆盖 `positions` 中的条目。尺寸应是有限正数，当前内部没有输入校验。
- 缩放不会低于 `0.5`，极小视口或大量卡片仍可能超出可视区域。
- 布局没有持久化和固定随机种子，刷新页面后可能改变。
- 候选搜索反复检查已有卡片，适合当前少量主页卡片；不要直接当作大规模布局引擎。

## useModalAccessibility：自定义弹层焦点管理

### 使用方式

```ts
import { useRef } from 'react';
import { useModalAccessibility } from '@/hooks/useModalAccessibility';

const modalRef = useRef<HTMLDivElement>(null);
useModalAccessibility({ active: isOpen, containerRef: modalRef });
```

将 `modalRef` 绑定到实际弹层容器。容器应提供 `role="dialog"`、`aria-modal="true"`、可访问名称，以及 `tabIndex={-1}`，让没有可聚焦子控件时的容器焦点回退有效。完整用例见 [IframeModal.tsx](../src/components/IframeModal/IframeModal.tsx)。

| 参数字段 | 类型 | 说明 |
| --- | --- | --- |
| `active` | `boolean` | 是否启用焦点管理与背景隔离 |
| `containerRef` | `RefObject<HTMLElement>` | 指向自定义弹层容器的 Ref |

返回 `void`，不返回关闭函数。参数类型 `ModalAccessibilityOptions` 没有导出。

### 打开时的行为

1. Effect 读取容器；未激活或 Ref 为空时直接退出。
2. 记录打开前的 `document.activeElement`，把容器压入模块级 `modalStack`。
3. 沿容器到 `body` 的祖先链，将每一层的兄弟 HTML 分支设为 `inert`，同时记录它们原有状态。弹层自身不设为 `inert`。
4. 查找按钮、链接、输入框、选择框、文本域、iframe 和显式 `tabindex` 元素；过滤负 Tab 索引、隐藏、位于 inert 或 `aria-hidden="true"` 分支内的元素。
5. 聚焦首个可聚焦元素，没有时聚焦容器，并使用 `preventScroll` 避免初始焦点滚动。

### 打开期间与关闭时的行为

- 监听 `focusin`，最上层弹层发现焦点跑到容器外时将其拉回。
- 监听 Tab：末项按 Tab 回到首项，首项或容器按 Shift+Tab 回到末项；没有可聚焦元素时停留在容器。
- 仅栈顶弹层处理焦点与键盘，供正常嵌套弹层使用。
- 关闭或卸载时移除监听、从栈中移除容器、恢复各背景分支原来的 inert 状态。
- 原焦点节点仍连接在文档中且不处于 inert 分支时，尝试恢复焦点。

### 调用方仍需负责

- Escape、遮罩点击、关闭按钮、动画、Portal、弹窗语义以及页面滚动锁定。
- Ref 容器必须在 Effect 执行时存在。如果 `active` 一直为 `true`，之后才填充 Ref，单纯改变 `ref.current` 不会触发 Effect 重跑。
- 焦点边界在 HTML 文档内工作，不保证覆盖 Shadow DOM 或跨域 iframe 内部的完整导航。
- 嵌套弹层应按后开先关的顺序关闭；各实例独立保存 inert 快照，不应假定任意乱序关闭都能正确恢复背景。
- 这是现有自定义弹层的配套逻辑，不能仅因使用了此 Hook 就认为弹窗已经完成全部无障碍验收。

## useTheme：共享主题状态

### 使用方式

```ts
import { useTheme } from '@/hooks/themeContext';

const { mode, resolvedMode, color, setMode, setColor } = useTheme();

// 在用户操作的事件处理函数中切换主题。
setMode('system');
setColor('forest');
```

必须在 `ThemeProvider` 子树内调用，否则抛出 `useTheme 必须在 ThemeProvider 内使用`。项目入口 [index.tsx](../src/index.tsx) 已包裹 Provider。

### 返回值

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `mode` | `ThemeMode` | 用户选择：`light`、`dark`、`system` |
| `resolvedMode` | `'light' \| 'dark'` | 实际生效模式，绘图等场景应使用此值 |
| `color` | `ThemeColor` | 当前预设配色或自定义配色 |
| `setMode` | `(mode: ThemeMode) => void` | 修改并保存模式，更新实际模式 |
| `setColor` | `(color: ThemeColor) => void` | 修改并保存配色 |
| `customColors` | `CustomThemePalettes` | 浅色、深色两套自定义调色板 |
| `setCustomColors` | `(mode: 'light' \| 'dark', colors: CustomThemeColors) => void` | 替换指定模式的整套自定义颜色并保存 |

`ThemeColor` 支持 `default`、`ocean`、`forest`、`lavender`、`sunset`、`slate`、`linear`、`custom`。

`CustomThemePalettes` 是按 `light`、`dark` 索引的对象，每套 `CustomThemeColors` 包含：

| 字段 | 含义 | 应用到的 CSS 变量 |
| --- | --- | --- |
| `primary` | 主文字色 | `--color-primary` |
| `secondary` | 次要文字色 | `--color-secondary` |
| `accent` | 强调色 | `--color-accent` |
| `background` | 页面背景 | `--color-bg` |
| `card` | 卡片基色 | 混入透明度生成 `--color-card`、`--color-card-hover` |
| `surface` | 实色表面 | `--color-card-solid` |
| `border` | 边框色 | `--color-border` |

### 实现职责划分

`useTheme` 仅执行 `useContext(ThemeContext)` 并校验 Provider 是否存在，不单独维护主题、不监听系统、不直接读写存储。

`ThemeProvider` 的实现负责：

1. 惰性读取保存的模式、配色、自定义颜色，并计算初始实际模式。
2. 通过状态保存主题，用稳定回调提供修改方法。
3. 仅在 `mode='system'` 时订阅系统深色偏好的 `change` 事件，退出该模式或卸载时清理订阅。
4. 主题变化时调用 `applyTheme` 同步根元素属性和自定义 CSS 变量。
5. 用 `useMemo` 构建上下文值，供所有消费者共享。

修改自定义颜色本身不会切换当前配色。需要应用时再调用 `setColor('custom')`；`setCustomColors` 接收完整调色板，不做字段级合并。

### 同文件导出的辅助接口

| 导出项 | 用途与回退 |
| --- | --- |
| `ThemeContext` | `UseThemeReturn \| null` 的上下文，默认 `null` |
| `ThemeMode`、`ThemeColor` | 模式与配色联合类型 |
| `CustomThemeColors`、`CustomThemePalettes`、`UseThemeReturn` | 调色板与 Hook 返回类型 |
| `STORAGE_KEY_MODE` | `theme-mode` |
| `STORAGE_KEY_COLOR` | `theme-color` |
| `STORAGE_KEY_CUSTOM_COLORS` | `theme-custom-colors` |
| `DEFAULT_CUSTOM_COLORS` | 默认浅色、深色自定义调色板 |
| `DARK_MEDIA_QUERY` | `(prefers-color-scheme: dark)` |
| `getSystemMode()` | 读取系统偏好；无 `window` 返回 `light` |
| `getSavedMode()` | 读取并验证模式枚举；缺失、值不合法或无 `window` 返回 `system` |
| `getSavedColor()` | 读取并验证配色枚举；缺失、值不合法或无 `window` 返回 `default` |
| `getSavedCustomColors()` | 读取并解析两套颜色；每个字段必须为六位十六进制颜色；缺失、数据不合法、存储异常或无 `window` 时返回默认调色板 |
| `resolveMode(mode)` | 将 `system` 转为系统偏好，其他模式原样返回 |
| `applyTheme(resolved, color, customColors?)` | 更新 `document.documentElement` 的主题属性、清除旧内联覆盖，并按需写入自定义变量 |

### DOM 与存储行为

- 根元素使用 `data-theme-mode` 和 `data-theme-color` 供 [App.css](../src/App.css) 中的主题选择器匹配。
- 每次应用主题先清理受管理的内联颜色和派生变量，避免切回预设主题后残留自定义颜色。
- 自定义模式将卡片色按 72% 混合透明色，hover 按 90% 混合；主色派生 5%、8%、10%、20%、30%、40% 的透明度变量，强调色派生 8%、20% 变量。
- 自定义颜色存储校验仅接受 `#RRGGBB`，不接受短十六进制、带透明度十六进制或其他 CSS 颜色写法。
- `getSavedMode`、`getSavedColor` 和 Provider 的存储写入没有捕获存储访问异常；只有读取自定义颜色的函数提供 try/catch 回退。禁用存储的环境需留意这一现有边界。
- 不监听 `storage` 事件，因此不会自动同步其他浏览器标签页的主题更改。
- `applyTheme` 直接访问 `document`，是浏览器端工具。部分读取函数有无 `window` 回退，并不表示整个 Provider 支持任意非浏览器环境。

## 维护与验收

- 新增或调整 Hook 时，同步更新本文的参数、返回值、资源清理、调用位置及边界描述。
- 不要将纯读取 Hook 与 Provider 的副作用混为一谈，也不要假定 `enabled` 会停用 Hook 中的所有监听。
- 本文只描述当前实现，没有修改 Hook 源码，也没有修复文中记录的实现限制。
- 本次仅阅读源码与静态核对，未启动服务，未执行构建、测试、类型检查或浏览器验收。

/**
 * 内容配置示例文件
 * 复制此文件并重命名为 content.ts，然后修改为你自己的内容
 */

import type { ContentConfig } from './content';

export const contentConfigExample: ContentConfig = {
    // 用户信息示例
    user: {
        name: '刷新',
        tag: 'Arknights Players | Nikon & Lumix Users | Toys Photograph | console.log tester',
        avatar: 'https://github.com/account',
        menuItems: [
            { icon: 'FileText', label: '技术博客' },
            { icon: 'FolderOpen', label: '开源项目' },
            { icon: 'Info', label: '关于我' },
            { icon: 'Star', label: '我的收藏' },
            { icon: 'Globe', label: '友情链接' },
        ],
    },

    // 欢迎信息示例
    welcome: {
        name: '小明',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=example',
        highlightColor: '#4CAF50',
    },

    // 文章信息示例
    article: {
        title: 'React 18 新特性详解',
        category: '前端开发',
        date: '2025/12/05',
        icon: '📚',
        tag: '推荐阅读',
    },

    // 航司 Wiki 示例
    aircraftLog: {
        tag: '航司 Wiki',
        icon: '✈️',
        title: 'Plane List',
        description: '航司机型资料库 · 机型检索与航司信息',
        url: 'https://aircraftlog.shuaxinjs.cn/',
    },

    // 推荐信息示例
    recommend: {
        name: 'Tech Weekly',
        description: '每周分享最新的技术资讯和开发工具，帮助开发者保持技术敏锐度',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=techweekly',
    },

    // 音乐播放器示例
    music: {
        label: '单曲循环',
        title: '代码之歌',
        progress: 65,
        urlList: [
            {
                name: '音乐1',
                url: 'https://example.com/music1.mp3',
            },
            {
                name: '音乐2',
                url: 'https://example.com/music2.mp3',
            },
        ],
    },

    // 社交链接示例
    socialLinks: [
        {
            icon: 'Github',
            label: 'Github',
            url: 'https://github.com/yourusername',
        },
        {
            icon: 'Juejin',
            label: '掘金',
            url: 'https://juejin.cn/user/yourid',
        },
    ],

    // 图片卡片示例
    images: [
        {
            imageUrl: 'https://api.dicebear.com/7.x/icons/svg?seed=coding',
            alt: 'coding illustration',
        },
    ],
};


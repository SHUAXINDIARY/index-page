/**
 * 页面内容配置文件
 * 所有卡片的数据统一在此管理
 */

export interface UserInfo {
    name: string;
    tag: string;
    avatar: string;
    menuItems: Array<{
        icon: string;
        label: string;
        onClick?: () => void;
        url?: string;
    }>;
}

export interface WelcomeInfo {
    name: string;
    avatar: string;
    highlightColor?: string;
}

export interface ArticleInfo {
    title: string;
    category?: string;
    date: string;
    icon: string;
    link?: string;
    tag: string;
}

export interface RecommendInfo {
    name: string;
    description: string;
    avatar: string;
}

export interface MusicInfo {
    label: string;
    title: string;
    progress: number; // 0-100
}

export interface SocialLink {
    icon: string;
    label: string;
    url?: string;
}

export interface ImageCardInfo {
    imageUrl: string;
    alt: string;
}

export interface ContentConfig {
    user: UserInfo;
    welcome: WelcomeInfo;
    article: ArticleInfo;
    recommend: RecommendInfo;
    music: MusicInfo;
    socialLinks: SocialLink[];
    images: ImageCardInfo[];
}

// 主配置对象
export const contentConfig: ContentConfig = {
    // 用户信息
    user: {
        name: '刷新',
        tag: 'Arknights Players | Nikon & Lumix Users | Toys Photograph | FE',
        avatar: 'https://avatars.githubusercontent.com/u/32100575?v=4',
        menuItems: [
            { icon: 'FileText', label: '技术博客', url: 'https://blog.shuaxindiary.cn/' },
            { icon: 'FolderOpen', label: '开源项目', url: 'https://github.com/SHUAXINDIARY?tab=repositories&q=&type=source&language=&sort=stargazers' },
            { icon: 'Info', label: '关于我', url: 'https://blog.shuaxindiary.cn/about/' },
            // { icon: 'Star', label: '我的收藏', url: 'https://github.com/shuaxin?tab=stars' },
            { icon: 'Globe', label: '友情链接', url: 'https://blog.shuaxindiary.cn/social/' },
        ],
    },

    // 欢迎信息
    welcome: {
        name: '刷新',
        avatar: 'https://avatars.githubusercontent.com/u/32100575?v=4',
        highlightColor: '#ff6b6b',
    },

    // 文章信息
    article: {
        title: '图片懒加载 —— 关于Intersection...',
        date: '2025/11/29',
        icon: '📝',
        tag: '最新文章',
    },

    // 推荐信息
    recommend: {
        name: 'Ai Iman',
        description: '⚙️ Mojo UI，伸宿探笔或者 ⚙️ Magic World，智慧的世界动态',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AiIman',
    },

    // 音乐播放器
    music: {
        label: '随机播放',
        title: '橘凯音乐',
        progress: 40,
    },

    // 社交链接
    socialLinks: [
        {
            icon: 'Github',
            label: 'Github',
            url: 'https://github.com',
        },
        {
            icon: 'Photography',
            label: '摄影',
            url: 'https://gallary.shuaxinjs.cn/',
        },
        {
            icon: 'Red Note',
            label: '小红书',
            url: 'https://www.xiaohongshu.com/user/profile/617ce3ac000000000201bc2c?xsec_token=YBsjmd6g-0EovM4jFgWlCmwGlFM8-HZez2-ON-QymO4VY=&xsec_source=app_share&xhsshare=CopyLink&shareRedId=ODc5Q0g4RUw2NzUyOTgwNjY1OThGSDhM&apptime=1763691500&share_id=9421e4f42cdf430799f860afb9826278'
        }
    ],

    // 图片卡片
    images: [
        {
            imageUrl: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=cat',
            alt: 'cute cat',
        },
    ],
};

// 导出单独的配置项（可选）
export const { user, welcome, article, recommend, music, socialLinks, images } = contentConfig;


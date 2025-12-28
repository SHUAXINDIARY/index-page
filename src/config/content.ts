/**
 * 页面内容配置文件
 * 所有卡片的数据统一在此管理
 */

import bgmData from './bgm-data.json';

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

export interface MusicTrack {
    name: string;
    url: string;
}

export interface MusicInfo {
    label: string;
    title: string;
    progress: number; // 0-100
    urlList?: MusicTrack[];
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

export interface WorldMapMarker {
    name: string;
    lat: number;
    lng: number;
    type: 'travel' | 'residence' | 'wish' | 'airport';
    description?: string;
}

export interface WorldMapLegendItem {
    type: 'travel' | 'residence' | 'wish' | 'airport';
    label: string;
}

export interface WorldMapConfig {
    style?: string; // MapLibre 样式 URL，默认为 demotiles.maplibre.org
    markers?: WorldMapMarker[];
    legend?: WorldMapLegendItem[];
}

export interface ContentConfig {
    user: UserInfo;
    welcome: WelcomeInfo;
    article: ArticleInfo;
    recommend: RecommendInfo;
    music: MusicInfo;
    socialLinks: SocialLink[];
    images: ImageCardInfo[];
    worldMap?: WorldMapConfig;
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

    // 音乐播放器（urlList 从 public/bgm 目录自动生成）
    music: {
        label: '随机播放',
        title: '塞壬唱片',
        progress: 0,
        urlList: bgmData.urlList,
    },

    // 社交链接
    socialLinks: [
        // {
        //     icon: 'Github',
        //     label: 'Github',
        //     url: 'https://github.com',
        // },
        {
            icon: 'Photography',
            label: '摄影',
            url: 'https://gallary.shuaxinjs.cn/',
        },
        {
            icon: 'Red Note',
            label: '小红书',
            url: 'https://www.xiaohongshu.com/user/profile/617ce3ac000000000201bc2c?xsec_token=YBsjmd6g-0EovM4jFgWlCmwGlFM8-HZez2-ON-QymO4VY=&xsec_source=app_share&xhsshare=CopyLink&shareRedId=ODc5Q0g4RUw2NzUyOTgwNjY1OThGSDhM&apptime=1763691500&share_id=9421e4f42cdf430799f860afb9826278'
        },
        {
            icon: 'music',
            label: '抖音',
            url: 'https://www.douyin.com/user/MS4wLjABAAAAtka9uHYCko-H1WT23fHjsVcTDwbAdjP-qfZqm6-Q4-c'
        },
        {
            icon: 'X',
            label: 'X',
            url: 'https://x.com/qq_tf'
        }
    ],

    // 图片卡片
    images: [
        {
            imageUrl: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=cat',
            alt: 'cute cat',
        },
    ],

    // 世界地图配置
    worldMap: {
        // 使用 MapLibre 默认样式，也可以使用其他 MapLibre 兼容的样式 URL
        // style: 'https://demotiles.maplibre.org/style.json',
        markers: [
            // 旅行地点（橙色）
            { name: '北京', lat: 39.9042, lng: 116.4074, type: 'travel', description: '首都北京' },
            { name: '上海', lat: 31.2304, lng: 121.4737, type: 'travel', description: '魔都上海' },
            { name: '东京', lat: 35.6762, lng: 139.6503, type: 'travel', description: '日本东京' },
            { name: '首尔', lat: 37.5665, lng: 126.9780, type: 'travel', description: '韩国首尔' },
            { name: '曼谷', lat: 13.7563, lng: 100.5018, type: 'travel', description: '泰国曼谷' },
            { name: '新加坡', lat: 1.3521, lng: 103.8198, type: 'travel', description: '新加坡' },
            { name: '巴黎', lat: 48.8566, lng: 2.3522, type: 'travel', description: '法国巴黎' },
            { name: '伦敦', lat: 51.5074, lng: -0.1278, type: 'travel', description: '英国伦敦' },
            { name: '纽约', lat: 40.7128, lng: -74.0060, type: 'travel', description: '美国纽约' },
            { name: '洛杉矶', lat: 34.0522, lng: -118.2437, type: 'travel', description: '美国洛杉矶' },
            { name: '悉尼', lat: -33.8688, lng: 151.2093, type: 'travel', description: '澳大利亚悉尼' },
            
            // 居住地点（蓝色）
            { name: '北京', lat: 39.9042, lng: 116.4074, type: 'residence', description: '现居地' },
            { name: '上海', lat: 31.2304, lng: 121.4737, type: 'residence', description: '曾居住' },
            
            // 愿望清单（粉色）
            { name: '冰岛', lat: 64.9631, lng: -19.0208, type: 'wish', description: '极光之旅' },
            { name: '马尔代夫', lat: 3.2028, lng: 73.2207, type: 'wish', description: '度假天堂' },
            { name: '圣托里尼', lat: 36.3932, lng: 25.4615, type: 'wish', description: '希腊圣岛' },
            { name: '京都', lat: 35.0116, lng: 135.7681, type: 'wish', description: '古都京都' },
        ],
        legend: [
            { type: 'travel', label: '旅行' },
            { type: 'residence', label: '居住' },
            { type: 'wish', label: '愿望' },
            { type: 'airport', label: '机场' },
        ],
    },
};

// 导出单独的配置项（可选）
export const { user, welcome, article, recommend, music, socialLinks, images, worldMap } = contentConfig;


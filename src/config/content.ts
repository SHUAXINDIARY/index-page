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
      {
        icon: 'FileText',
        label: '技术博客',
        url: 'https://blog.shuaxindiary.cn/',
      },
      {
        icon: 'FolderOpen',
        label: '开源项目',
        url: 'https://github.com/SHUAXINDIARY?tab=repositories&q=&type=source&language=&sort=stargazers',
      },
      {
        icon: 'Info',
        label: '关于我',
        url: 'https://blog.shuaxindiary.cn/about/',
      },
      {
        icon: 'Globe',
        label: '友情链接',
        url: 'https://blog.shuaxindiary.cn/social/',
      },
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
      url: 'https://www.xiaohongshu.com/user/profile/617ce3ac000000000201bc2c?xsec_token=YBsjmd6g-0EovM4jFgWlCmwGlFM8-HZez2-ON-QymO4VY=&xsec_source=app_share&xhsshare=CopyLink&shareRedId=ODc5Q0g4RUw2NzUyOTgwNjY1OThGSDhM&apptime=1763691500&share_id=9421e4f42cdf430799f860afb9826278',
    },
    {
      icon: 'music',
      label: '抖音',
      url: 'https://www.douyin.com/user/MS4wLjABAAAAtka9uHYCko-H1WT23fHjsVcTDwbAdjP-qfZqm6-Q4-c',
    },
    {
      icon: 'X',
      label: 'X',
      url: 'https://x.com/qq_tf',
    },
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
    style: '/positron.json',
    markers: [
      // 旅行地点（橙色）
      {
        name: '北京',
        lat: 39.9042,
        lng: 116.4074,
        type: 'travel',
        description: '中国北京',
      },
      {
        name: '上海',
        lat: 31.2304,
        lng: 121.4737,
        type: 'travel',
        description: '中国上海',
      },
      {
        name: '秦皇岛',
        lat: 39.9167,
        lng: 119.5833,
        type: 'travel',
        description: '中国秦皇岛',
      },
      {
        name: '天津',
        lat: 39.3434,
        lng: 117.3616,
        type: 'travel',
        description: '中国天津',
      },
      {
        name: '昆明',
        lat: 25.0389,
        lng: 102.7183,
        type: 'travel',
        description: '中国昆明',
      },
      {
        name: '西安',
        lat: 34.3416,
        lng: 108.9398,
        type: 'travel',
        description: '中国西安',
      },
      {
        name: '庆阳',
        lat: 35.7167,
        lng: 107.6333,
        type: 'travel',
        description: '中国庆阳',
      },
      {
        name: '武汉',
        lat: 30.5928,
        lng: 114.3055,
        type: 'travel',
        description: '中国武汉',
      },
      {
        name: '宜昌',
        lat: 30.702,
        lng: 111.2865,
        type: 'travel',
        description: '中国宜昌',
      },
      {
        name: '荆州',
        lat: 30.3167,
        lng: 112.2667,
        type: 'travel',
        description: '中国荆州',
      },
      {
        name: '黄石',
        lat: 30.3333,
        lng: 115.15,
        type: 'travel',
        description: '中国黄石',
      },
      {
        name: '东京',
        lat: 35.6762,
        lng: 139.6503,
        type: 'travel',
        description: '日本东京',
      },
      {
        name: '大阪',
        lat: 34.6937,
        lng: 135.5023,
        type: 'travel',
        description: '日本大阪',
      },
      {
        name: '京都',
        lat: 35.0116,
        lng: 135.7681,
        type: 'travel',
        description: '日本京都',
      },
      {
        name: '神户',
        lat: 34.6901,
        lng: 135.1956,
        type: 'travel',
        description: '日本神户',
      },
      {
        name: '名古屋',
        lat: 35.1815,
        lng: 136.9066,
        type: 'travel',
        description: '日本名古屋',
      },
      {
        name: '横滨',
        lat: 35.4681,
        lng: 139.6216,
        type: 'travel',
        description: '日本横滨',
      },
      {
        name: '川崎',
        lat: 35.5309,
        lng: 139.703,
        type: 'travel',
        description: '日本川崎',
      },
      {
        name: '曼谷',
        lat: 13.7563,
        lng: 100.5018,
        type: 'travel',
        description: '泰国曼谷',
      },
      {
        name: '普吉岛',
        lat: 7.8804,
        lng: 98.3923,
        type: 'travel',
        description: '泰国普吉岛',
      },
      {
        name: '首尔',
        lat: 37.5665,
        lng: 126.978,
        type: 'travel',
        description: '韩国首尔',
      },
      {
        name: '巴塞罗那',
        lat: 41.3851,
        lng: 2.1734,
        type: 'travel',
        description: '西班牙巴塞罗那',
      },
      {
        name: '罗马',
        lat: 41.9028,
        lng: 12.4964,
        type: 'travel',
        description: '意大利罗马',
      },
      {
        name: '巴黎',
        lat: 48.8566,
        lng: 2.3522,
        type: 'travel',
        description: '法国巴黎',
      },
      // 居住地点（蓝色）
      {
        name: '北京',
        lat: 39.9042,
        lng: 116.4074,
        type: 'residence',
        description: '中国北京',
      },
    ],
    legend: [
      { type: 'travel', label: '旅行' },
      { type: 'residence', label: '居住' },
      //   { type: 'wish', label: '愿望' },
      //   { type: 'airport', label: '机场' },
    ],
  },
};

// 导出单独的配置项（可选）
export const {
  user,
  welcome,
  article,
  recommend,
  music,
  socialLinks,
  images,
  worldMap,
} = contentConfig;

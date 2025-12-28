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

export interface CalendarConfig {
  icsUrl?: string; // ICS 文件的 URL 或本地路径
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
  calendar?: CalendarConfig;
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
        lat: 39.929986,
        lng: 116.395645,
        type: 'travel',
        description: '中国北京',
      },
      {
        name: '三亚',
        lat: 18.252847,
        lng: 109.511909,
        type: 'travel',
        description: '中国三亚',
      },
      {
        name: '上海',
        lat: 31.249162,
        lng: 121.487899,
        type: 'travel',
        description: '中国上海',
      },
      {
        name: '秦皇岛',
        lat: 39.935,
        lng: 119.6,
        type: 'travel',
        description: '中国秦皇岛',
      },
      {
        name: '天津',
        lat: 39.143932,
        lng: 117.210813,
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
        lat: 35.709077,
        lng: 107.643631,
        type: 'travel',
        description: '中国庆阳',
      },
      {
        name: '武汉',
        lat: 30.580031,
        lng: 114.30546,
        type: 'travel',
        description: '中国武汉',
      },
      {
        name: '宜昌',
        lat: 30.7144,
        lng: 111.285,
        type: 'travel',
        description: '中国宜昌',
      },
      {
        name: '荆州',
        lat: 30.35028,
        lng: 112.19028,
        type: 'travel',
        description: '中国荆州',
      },
      {
        name: '黄石',
        lat: 30.24706,
        lng: 115.04815,
        type: 'travel',
        description: '中国黄石',
      },
      {
        name: '东京',
        lat: 35.652832,
        lng: 139.839478,
        type: 'travel',
        description: '日本东京',
      },
      {
        name: '大阪',
        lat: 34.672314,
        lng: 135.484802,
        type: 'travel',
        description: '日本大阪',
      },
      {
        name: '京都',
        lat: 35.011665,
        lng: 135.768326,
        type: 'travel',
        description: '日本京都',
      },
      {
        name: '神户',
        lat: 34.689999,
        lng: 135.195557,
        type: 'travel',
        description: '日本神户',
      },
      {
        name: '名古屋',
        lat: 35.183334,
        lng: 136.899994,
        type: 'travel',
        description: '日本名古屋',
      },
      {
        name: '横滨',
        lat: 35.443707,
        lng: 139.638031,
        type: 'travel',
        description: '日本横滨',
      },
      {
        name: '川崎',
        lat: 35.516666,
        lng: 139.699997,
        type: 'travel',
        description: '日本川崎',
      },
      {
        name: '曼谷',
        lat: 13.756331,
        lng: 100.501765,
        type: 'travel',
        description: '泰国曼谷',
      },
      {
        name: '普吉岛',
        lat: 7.89059,
        lng: 98.3981,
        type: 'travel',
        description: '泰国普吉岛',
      },
      {
        name: '首尔',
        lat: 37.566349,
        lng: 126.978,
        type: 'travel',
        description: '韩国首尔',
      },
      {
        name: '巴塞罗那',
        lat: 41.385064,
        lng: 2.173403,
        type: 'travel',
        description: '西班牙巴塞罗那',
      },
      {
        name: '罗马',
        lat: 41.902782,
        lng: 12.496366,
        type: 'travel',
        description: '意大利罗马',
      },
      {
        name: '巴黎',
        lat: 48.856613,
        lng: 2.352222,
        type: 'travel',
        description: '法国巴黎',
      },
      {
        name: '梵蒂冈',
        lat: 41.902542,
        lng: 12.452881,
        type: 'travel',
        description: '梵蒂冈城国',
      },
      {
        name: '杭州',
        lat: 30.248963,
        lng: 120.205234,
        type: 'travel',
        description: '中国杭州',
      },
      {
        name: '灵台县',
        lat: 35.066149,
        lng: 107.616691,
        type: 'travel',
        description: '中国甘肃省平凉市灵台县',
      },
      {
        name: '庆城县',
        lat: 36.016541,
        lng: 107.877158,
        type: 'travel',
        description: '中国甘肃省庆阳市庆城县',
      },
      {
        name: '银川市',
        lat: 38.487193,
        lng: 106.230909,
        type: 'travel',
        description: '中国宁夏回族自治区银川市',
      },
      // 居住地点（蓝色）
      {
        name: '北京',
        lat: 39.929986,
        lng: 116.395645,
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

  // 日历配置
  calendar: {
    icsUrl: '/中国大陆节假日.ics', // 使用 public 目录下的 ICS 文件
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
  calendar,
} = contentConfig;

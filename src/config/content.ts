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

/** 开源项目维护状态 */
export type OpenSourceProjectStatus = 'active' | 'maintained' | 'archived';

/** 单个开源项目的展示信息 */
export interface OpenSourceProject {
  /** 项目名称 */
  name: string;
  /** 项目一句话说明 */
  description: string;
  /** 代码仓库地址 */
  repoUrl: string;
  /** 可访问的线上地址 */
  homepageUrl?: string;
  /** 主要技术栈或语言 */
  language: string;
  /** 项目标签，用于 modal 内快速扫读 */
  tags: string[];
  /** 项目当前维护状态 */
  status: OpenSourceProjectStatus;
  /** 作者在项目中的主要职责 */
  role: string;
  /** 是否作为卡片预览重点展示 */
  featured?: boolean;
}

/** 开源项目卡片与详情弹窗配置 */
export interface OpenSourceInfo {
  /** 卡片角标文案 */
  tag: string;
  /** 卡片标题 */
  title: string;
  /** 卡片描述 */
  description: string;
  /** 卡片行动按钮文案 */
  ctaLabel: string;
  /** 需要在弹窗中完整展示的开源项目列表 */
  projects: OpenSourceProject[];
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
  // 对应标记点的URl
  imgUrl?: string;
}

export interface WorldMapLegendItem {
  type: 'travel' | 'residence' | 'wish' | 'airport';
  label: string;
}

export interface WorldMapRouteConfig {
  /** 航线名称 */
  name: string;
  /** 起点纬度 */
  startLat: number;
  /** 起点经度 */
  startLng: number;
  /** 终点纬度 */
  endLat: number;
  /** 终点经度 */
  endLng: number;
  /** 航迹范围：domestic 实线 / international 虚线 */
  scope: 'domestic' | 'international';
}

export interface WorldMapConfig {
  markers?: WorldMapMarker[];
  /** 可选航迹弧线 */
  routes?: WorldMapRouteConfig[];
  legend?: WorldMapLegendItem[];
}

export interface CalendarConfig {
  icsUrl?: string; // ICS 文件的 URL 或本地路径
}

export interface ContentConfig {
  user: UserInfo;
  welcome: WelcomeInfo;
  article: ArticleInfo;
  /** 开源项目卡片 */
  openSource: OpenSourceInfo;
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
      // {
      //   icon: 'FolderOpen',
      //   label: '开源项目',
      //   url: 'https://github.com/SHUAXINDIARY?tab=repositories&q=&type=source&language=&sort=stargazers',
      // },
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

  // 开源项目
  openSource: {
    tag: 'Open Source',
    title: '开源项目',
    description: '一些玩具。',
    ctaLabel: '查看全部',
    projects: [
      {
        name: 'index-page',
        description:
          '个人主页与卡片式索引页，整合博客、音乐、地图、社交入口和随机布局。',
        repoUrl: 'https://github.com/SHUAXINDIARY/index-page',
        homepageUrl: 'https://shuaxinjs.cn/',
        language: 'TypeScript',
        tags: ['React', 'Rsbuild', 'Design System'],
        status: 'active',
        role: '作者与维护者',
        featured: true,
      },
      {
        name: 'plane-list',
        description:
          '航司机型资料库底图与数据方案，支持旅行足迹和航线展示能力。',
        repoUrl: 'https://github.com/SHUAXINDIARY/plane-list',
        homepageUrl: 'https://aircraftlog.shuaxinjs.cn/',
        language: 'TypeScript',
        tags: ['Canvas', 'Map', 'Aircraft'],
        status: 'active',
        role: '作者与维护者',
        featured: true,
      },
      {
        name: 'arknights-artwork',
        description:
          '明日方舟插画收集与浏览入口，面向同好整理可访问的作品索引。',
        repoUrl: 'https://github.com/SHUAXINDIARY/arknights-artwork',
        homepageUrl: 'https://arknightsartwork.shuaxinjs.cn/',
        language: 'JavaScript',
        tags: ['Gallery', 'Archive', 'Fan Site'],
        status: 'maintained',
        role: '作者与维护者',
      },
      {
        name: 'Arknights',
        description:
          '明日方舟相关素材与数据整理项目，为同好站点和收藏入口提供内容基础。',
        repoUrl: 'https://github.com/SHUAXINDIARY/Arknights',
        homepageUrl: 'https://arknights.shuaxinjs.cn/',
        language: 'JavaScript',
        tags: ['Arknights', 'Archive', 'Data'],
        status: 'maintained',
        role: '作者与维护者',
      },
      {
        name: 'ArknightsLive2d-Web',
        description:
          '明日方舟 Live2D Web 展示项目，用浏览器承载角色动态预览体验。',
        repoUrl: 'https://github.com/SHUAXINDIARY/ArknightsLive2d-Web',
        homepageUrl: 'https://arknightslive2d.shuaxinjs.cn/',
        language: 'JavaScript',
        tags: ['Arknights', 'Live2D', 'Web'],
        status: 'maintained',
        role: '作者与维护者',
      },
      {
        name: 'national-flag-svg',
        description:
          '国家与地区旗帜 SVG 资源集合，适合在网页、地图和资料索引中复用。',
        repoUrl: 'https://github.com/SHUAXINDIARY/national-flag-svg',
        language: 'SVG & Canvas',
        homepageUrl: 'https://national-flag-svg.pages.dev/',
        tags: ['SVG', 'Canvas', 'Flags', 'Assets'],
        status: 'maintained',
        role: '作者与维护者',
      },
      {
        name: 'vue-ganttastic-demo',
        description:
          '基于 Vue 3 与 vue-ganttastic 的多任务并行甘特图可视化示例。',
        repoUrl: 'https://github.com/SHUAXINDIARY/vue-ganttastic-demo',
        homepageUrl: 'https://vue-ganttastic-demo.pages.dev/',
        language: 'Vue / TypeScript',
        tags: ['Vue', 'Gantt', 'Visualization'],
        status: 'maintained',
        role: '作者与维护者',
      },
      {
        name: 'blog',
        description:
          '个人技术博客与长期笔记站点，记录前端工程、影像、旅行和工具实践。',
        repoUrl: 'https://github.com/SHUAXINDIARY/blog',
        homepageUrl: 'https://blog.shuaxindiary.cn/',
        language: 'Markdown',
        tags: ['Blog', 'Notes', 'Frontend'],
        status: 'active',
        role: '作者与维护者',
      },
    ],
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
    {
      icon: 'Github',
      label: 'Github',
      url: 'https://github.com/SHUAXINDIARY',
    },
    {
      icon: 'Photography',
      label: '摄影',
      url: 'https://gallery.shuaxinjs.cn/',
    },
    {
      icon: 'Ark',
      label: '明日方舟插画收集',
      url: 'https://arknightsartwork.shuaxinjs.cn/',
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
      imageUrl: '/cardImg/G82qa1paIAAht99_副本.jpeg',
      alt: 'cute cat',
    },
    {
      imageUrl: '/cardImg/G6_0XmEaUAABt6e_副本.jpeg',
      alt: 'image',
    },
    {
      imageUrl: '/cardImg/G825oGEaQAAUIf5.jpeg',
      alt: 'image',
    },
  ],

  // 世界地图配置（Canvas 底图，见 src/components/WorldMap）
  worldMap: {
    markers: [
      // 居住地点（蓝色）
      {
        name: '北京',
        lat: 39.929986,
        lng: 116.395645,
        type: 'residence',
        description: '中国北京',
      },
      // 旅行地点（橙色）
      {
        name: '北京',
        lat: 39.929986,
        lng: 116.395645,
        type: 'travel',
        description: '中国北京',
        imgUrl: 'https://gallery.shuaxinjs.cn/?tags=daily',
      },
      {
        name: '广州市',
        lat: 23.129163,
        lng: 113.264435,
        type: 'travel',
        description: '中国广东省广州市',
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
        imgUrl: 'https://gallery.shuaxinjs.cn/?tags=tokyo',
      },
      {
        name: '大阪',
        lat: 34.672314,
        lng: 135.484802,
        type: 'travel',
        description: '日本大阪',
        imgUrl: 'https://gallery.shuaxinjs.cn/?tags=osaka',
      },
      {
        name: '京都',
        lat: 35.011665,
        lng: 135.768326,
        type: 'travel',
        description: '日本京都',
        imgUrl: 'https://gallery.shuaxinjs.cn/?tags=kyoto',
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
        imgUrl: 'https://gallery.shuaxinjs.cn/?tags=nagoya',
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
        imgUrl: 'https://gallery.shuaxinjs.cn/?tags=bangkok',
      },
      {
        name: '普吉岛',
        lat: 7.89059,
        lng: 98.3981,
        type: 'travel',
        description: '泰国普吉岛',
        imgUrl: 'https://gallery.shuaxinjs.cn/?tags=phuket',
      },
      {
        name: '首尔',
        lat: 37.566349,
        lng: 126.978,
        type: 'travel',
        description: '韩国首尔',
        imgUrl: 'https://gallery.shuaxinjs.cn/?tags=seoul',
      },
      {
        name: '巴塞罗那',
        lat: 41.385064,
        lng: 2.173403,
        type: 'travel',
        description: '西班牙巴塞罗那',
        imgUrl: 'https://gallery.shuaxinjs.cn/?tags=barcelona',
      },
      {
        name: '罗马',
        lat: 41.902782,
        lng: 12.496366,
        type: 'travel',
        description: '意大利罗马',
        imgUrl: 'https://gallery.shuaxinjs.cn/?tags=roma',
      },
      {
        name: '巴黎',
        lat: 48.856613,
        lng: 2.352222,
        type: 'travel',
        description: '法国巴黎',
        imgUrl: 'https://gallery.shuaxinjs.cn/?tags=paris',
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
      {
        name: '清迈市',
        lat: 18.788343,
        lng: 98.9853,
        type: 'travel',
        description: '泰国清迈府清迈市',
        imgUrl: 'https://gallery.shuaxinjs.cn/?tags=ChiangMai',
      },
      // 机场
      {
        name: '北京大兴国际机场',
        lat: 39.509945,
        lng: 116.41092,
        type: 'airport',
        description: '中国北京市北京大兴国际机场',
      },
      {
        name: '北京首都国际机场',
        lat: 40.079856,
        lng: 116.603112,
        type: 'airport',
        description: '中国北京市北京首都国际机场',
      },
      {
        name: '上海虹桥国际机场',
        lat: 31.197875,
        lng: 121.336319,
        type: 'airport',
        description: '中国上海市上海虹桥国际机场',
      },
      {
        name: '上海浦东国际机场',
        lat: 31.144344,
        lng: 121.808273,
        type: 'airport',
        description: '中国上海市上海浦东国际机场',
      },
      {
        name: '天津滨海国际机场',
        lat: 39.124474,
        lng: 117.346107,
        type: 'airport',
        description: '中国天津市天津滨海国际机场',
      },
      {
        name: '西安咸阳国际机场',
        lat: 34.447119,
        lng: 108.751592,
        type: 'airport',
        description: '中国陕西省西安咸阳国际机场',
      },
      {
        name: '宜昌三峡国际机场',
        lat: 30.55655,
        lng: 111.479988,
        type: 'airport',
        description: '中国湖北省宜昌三峡国际机场',
      },
      {
        name: '杭州萧山国际机场',
        lat: 30.229503,
        lng: 120.434453,
        type: 'airport',
        description: '中国浙江省杭州萧山国际机场',
      },
      {
        name: '东京成田国际机场',
        lat: 35.771986,
        lng: 140.39285,
        type: 'airport',
        description: '日本千叶县东京成田国际机场',
      },
      {
        name: '大阪关西国际机场',
        lat: 34.435446,
        lng: 135.244167,
        type: 'airport',
        description: '日本大阪关西国际机场',
      },
      {
        name: '名古屋中部国际机场',
        lat: 34.858414,
        lng: 136.805408,
        type: 'airport',
        description: '日本名古屋中部国际机场',
      },
      {
        name: '曼谷素万那普国际机场',
        lat: 13.690017,
        lng: 100.750112,
        type: 'airport',
        description: '泰国曼谷素万那普国际机场',
      },
      {
        name: '曼谷廊曼国际机场',
        lat: 13.912583,
        lng: 100.607036,
        type: 'airport',
        description: '泰国曼谷廊曼国际机场',
      },
      {
        name: '普吉国际机场',
        lat: 8.1132,
        lng: 98.316872,
        type: 'airport',
        description: '泰国普吉国际机场',
      },
      {
        name: '巴塞罗那埃尔普拉特机场',
        lat: 41.297445,
        lng: 2.083294,
        type: 'airport',
        description: '西班牙巴塞罗那埃尔普拉特机场',
      },
      {
        name: '罗马菲乌米奇诺机场',
        lat: 41.800278,
        lng: 12.238889,
        type: 'airport',
        description: '意大利罗马菲乌米奇诺机场',
      },
      {
        name: '巴黎奥利机场',
        lat: 48.726243,
        lng: 2.365247,
        type: 'airport',
        description: '法国巴黎奥利机场',
      },
      {
        name: '三亚凤凰国际机场',
        lat: 18.302897,
        lng: 109.412272,
        type: 'airport',
        description: '中国海南省三亚凤凰国际机场',
      },
      {
        name: '卡萨布兰卡穆罕默德五世机场',
        lat: 33.367467,
        lng: -7.58997,
        type: 'airport',
        description: '摩洛哥卡萨布兰卡穆罕默德五世国际机场',
      },
      {
        name: '首尔仁川国际机场',
        lat: 37.460191,
        lng: 126.440696,
        type: 'airport',
        description: '韩国首尔仁川国际机场',
      },
      {
        name: '首尔金浦国际机场',
        lat: 37.558311,
        lng: 126.790586,
        type: 'airport',
        description: '韩国首尔金浦国际机场',
      },
      {
        name: '庆阳机场',
        lat: 35.799702,
        lng: 107.602546,
        type: 'airport',
        description: '中国甘肃省庆阳机场',
      },
      {
        name: '昆明长水国际机场',
        lat: 25.101944,
        lng: 102.929167,
        type: 'airport',
        description: '中国云南省昆明市昆明长水国际机场',
      },
      {
        name: '武汉天河国际机场',
        lat: 30.7838,
        lng: 114.2081,
        type: 'airport',
        description: '中国湖北省武汉市武汉天河国际机场',
      },
      {
        name: '重庆江北国际机场',
        lat: 29.7192,
        lng: 106.641,
        type: 'airport',
        description: '中国重庆市重庆江北国际机场',
      },
      {
        name: '广州白云国际机场',
        lat: 23.392436,
        lng: 113.298786,
        type: 'airport',
        description: '中国广东省广州市广州白云国际机场',
      },
      {
        name: '东京羽田机场',
        lat: 35.549393,
        lng: 139.779839,
        type: 'airport',
        description: '日本东京都东京国际机场（羽田机场）',
      },
      {
        name: '清迈国际机场',
        lat: 18.766847,
        lng: 98.962638,
        type: 'airport',
        description: '泰国清迈府清迈国际机场',
      },
    ],
    legend: [
      { type: 'travel', label: '旅行' },
      { type: 'residence', label: '居住' },
      { type: 'airport', label: '机场' },
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
  openSource,
  recommend,
  music,
  socialLinks,
  images,
  worldMap,
  calendar,
} = contentConfig;

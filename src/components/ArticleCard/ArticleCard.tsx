import { useEffect, useMemo, useState } from 'react';
import { Card } from '../Card';
import { LoadingIndicator } from '../LoadingIndicator/LoadingIndicator';
import './ArticleCard.css';
import type { ArticleInfo } from '../../config/content';

/** 默认博客地址 */
const BLOG_URL = 'https://blog.shuaxindiary.cn/';
/** 运行时请求超时时间（毫秒） */
const FETCH_TIMEOUT_MS = 1000;
/** 运行时博客数据候选路径 */
const BLOG_DATA_PATHS = ['/config/blog-data.json', '/blog-data.json'] as const;
/** 运行时抓取兜底链接黑名单 */
const BLOCKED_LINK_KEYWORDS: readonly string[] = ['/tags', '/categories', '/about', '/search'];
/** 运行时抓取兜底标题黑名单 */
const BLOCKED_TITLES: readonly string[] = ['笔记', '标签', '关于'];

/** 运行时博客文章结构（与插件一致） */
interface RuntimeBlogPost {
  /** 文章标题 */
  title: string;
  /** 发布日期 */
  date: string;
  /** 文章地址 */
  link: string;
}

/** 运行时博客数据结构（与插件一致） */
interface RuntimeBlogData {
  /** 最新文章 */
  latestPost?: RuntimeBlogPost;
  /** 数据更新时间 */
  fetchedAt?: string;
}

/** 按 YYYY/MM/DD 统一格式化日期 */
const formatDate = (dateString: string): string => {
  if (!dateString) {
    return formatDateByObject(new Date());
  }

  const normalized = dateString.replace(/\./g, '/').replace(/-/g, '/').trim();
  const parsedDate = new Date(normalized);
  if (!Number.isNaN(parsedDate.getTime())) {
    return formatDateByObject(parsedDate);
  }

  const fallbackMatch = dateString.match(/(\d{1,2}\s+[a-zA-Z]+,\s+\d{4})/);
  if (fallbackMatch?.[1]) {
    const fallbackDate = new Date(fallbackMatch[1]);
    if (!Number.isNaN(fallbackDate.getTime())) {
      return formatDateByObject(fallbackDate);
    }
  }

  return formatDateByObject(new Date());
};

/** 将 Date 对象转成 YYYY/MM/DD */
const formatDateByObject = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
};

/** 是否是可用的文章链接 */
const isValidArticleLink = (href: string, title: string): boolean => {
  if (!href || !title || title.length < 3) return false;
  if (href.startsWith('#') || href.includes('mailto:')) return false;
  if (href === '/' || href === BLOG_URL) return false;
  if (BLOCKED_TITLES.includes(title)) return false;

  return !BLOCKED_LINK_KEYWORDS.some((keyword) => href.includes(keyword));
};

/** 规范化链接地址 */
const toAbsoluteUrl = (href: string): string => {
  try {
    return href.startsWith('http') ? href : new URL(href, BLOG_URL).href;
  } catch {
    return BLOG_URL;
  }
};

/** 从指定容器中提取文章数据 */
const extractPostFromContainer = (container: ParentNode): RuntimeBlogPost | null => {
  const linkElement = container.querySelector('a');
  if (!linkElement) return null;

  const href = linkElement.getAttribute('href') || '';
  const title = (linkElement.textContent || '').trim();
  if (!isValidArticleLink(href, title)) return null;

  const timeElement = container.querySelector('time');
  const containerText = container.textContent || '';
  const dateText =
    timeElement?.getAttribute('datetime') ||
    timeElement?.textContent?.trim() ||
    containerText.match(/(\d{1,2}\s+[a-zA-Z]+,\s+\d{4})/)?.[1] ||
    '';

  return {
    title,
    date: formatDate(dateText),
    link: toAbsoluteUrl(href),
  };
};

/** 兜底：从博客首页 HTML 中提取最新文章 */
const parseLatestPostFromHtml = (html: string): RuntimeBlogPost | null => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const allElements = Array.from(doc.querySelectorAll('body *'));
  const recentSection = allElements.find((element) =>
    /最近笔记|最近/.test((element.textContent || '').trim()),
  );

  let listItems = Array.from(
    doc.querySelectorAll('ul li, ol li, article, [class*="post"], [class*="note"]'),
  );
  if (recentSection) {
    const scopedItems = Array.from(
      recentSection.querySelectorAll('li, article, [class*="post"], [class*="note"]'),
    );
    if (scopedItems.length > 0) {
      listItems = scopedItems;
    }
  }

  for (const item of listItems) {
    const latestPost = extractPostFromContainer(item);
    if (latestPost) return latestPost;
  }

  const allLinks = Array.from(doc.querySelectorAll('a'));
  for (const link of allLinks) {
    const href = link.getAttribute('href') || '';
    const text = (link.textContent || '').trim();
    if (!href || !text || text.length <= 5) continue;
    if (href.includes('github.com') || href.includes('twitter.com') || href.includes('x.com')) {
      continue;
    }

    const parent = link.parentElement;
    const latestPost = parent ? extractPostFromContainer(parent) : null;
    if (latestPost) return latestPost;
  }

  return null;
};

/** 超时覆盖响应体下载，避免收到响应头后卡片仍无限等待。 */
const fetchTextWithTimeout = async (
  input: RequestInfo | URL,
  init: RequestInit = {},
  timeoutMs = FETCH_TIMEOUT_MS,
): Promise<string | null> => {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    const response = await fetch(input, {
      ...init,
      signal: controller.signal,
    });
    return response.ok ? await response.text() : null;
  } finally {
    window.clearTimeout(timeoutId);
  }
};

/** 运行时 JSON 来自网络，先收窄字段类型再用于卡片展示。 */
const isRuntimeBlogData = (value: unknown): value is RuntimeBlogData => {
  if (typeof value !== 'object' || value === null) return false;
  if ('fetchedAt' in value && typeof value.fetchedAt !== 'string') return false;
  if (!('latestPost' in value)) return true;
  const post = value.latestPost;
  return (
    typeof post === 'object' &&
    post !== null &&
    'title' in post &&
    typeof post.title === 'string' &&
    'date' in post &&
    typeof post.date === 'string' &&
    'link' in post &&
    typeof post.link === 'string'
  );
};

/** 优先读取运行时 JSON（插件同结构） */
const fetchLatestPostFromJson = async (): Promise<RuntimeBlogPost | null> => {
  for (const path of BLOG_DATA_PATHS) {
    try {
      const json = await fetchTextWithTimeout(path, { cache: 'no-store' }, FETCH_TIMEOUT_MS);
      if (!json) continue;

      const data: unknown = JSON.parse(json);
      if (!isRuntimeBlogData(data)) continue;
      if (data.fetchedAt) {
        console.info('[ArticleCard] 运行时博客数据更新时间:', data.fetchedAt);
      }
      if (data.latestPost?.title && data.latestPost?.link) {
        return {
          title: data.latestPost.title,
          date: formatDate(data.latestPost.date),
          link: data.latestPost.link,
        };
      }
    } catch {
      // 继续尝试下一个候选路径
    }
  }

  return null;
};

/** 兜底读取博客首页并在客户端解析 */
const fetchLatestPostFromHtml = async (): Promise<RuntimeBlogPost | null> => {
  try {
    const html = await fetchTextWithTimeout(BLOG_URL, {}, FETCH_TIMEOUT_MS);
    if (!html) return null;

    return parseLatestPostFromHtml(html);
  } catch {
    return null;
  }
};

/** 运行时获取最新文章 */
const fetchLatestPostRuntime = async (): Promise<RuntimeBlogPost | null> => {
  const latestPostFromJson = await fetchLatestPostFromJson();
  if (latestPostFromJson) {
    return latestPostFromJson;
  }

  return fetchLatestPostFromHtml();
};

/** 文章卡片的基础内容 */
interface ArticleCardProps {
  /** 请求失败或无有效数据时展示的配置 */
  config: ArticleInfo;
}

export const ArticleCard = ({ config }: ArticleCardProps) => {
  /** 运行时抓取到的文章数据 */
  const [runtimePost, setRuntimePost] = useState<RuntimeBlogPost | null>(null);
  /** 运行时请求是否仍在加载 */
  const [isLoading, setIsLoading] = useState(true);
  /** 卡片展示的文章数据 */
  const articleData = useMemo<ArticleInfo>(
    () => ({
      ...config,
      ...(runtimePost || {}),
    }),
    [config, runtimePost],
  );

  useEffect(() => {
    let active = true;
    setIsLoading(true);

    const loadLatestPost = async () => {
      let nextRuntimePost: RuntimeBlogPost | null = null;

      try {
        nextRuntimePost = await fetchLatestPostRuntime();
      } catch {
        nextRuntimePost = null;
      }

      if (!active) return;
      // 失败、超时、无数据统一置空，展示 config 兜底
      setRuntimePost(nextRuntimePost ?? null);
      setIsLoading(false);
    };

    void loadLatestPost();
    return () => {
      active = false;
    };
  }, [config]);

  if (isLoading) {
    return (
      <Card className="article-card article-card--loading">
        <div aria-busy="true">
          <LoadingIndicator label="正在加载最新文章…" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="article-card">
      {articleData.link && (
        <a
          className="article-card-link"
          href={articleData.link}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`阅读文章：${articleData.title}（新窗口）`}
        />
      )}
      <div className="article-tag">{articleData.tag}</div>
      <div className="article-icon" aria-hidden="true">{articleData.icon}</div>
      <h4 className="article-title" aria-level={2}>{articleData.title}</h4>
      {articleData.category ? (
        <p className="article-category">{articleData.category}</p>
      ) : null}
      <p className="article-date">{articleData.date}</p>
    </Card>
  );
};


import type { RsbuildPlugin } from '@rsbuild/core';
import * as cheerio from 'cheerio';
import { writeFileSync } from 'fs';
import { join } from 'path';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

interface BlogPost {
  title: string;
  date: string;
  link: string;
}

interface FetchBlogPluginOptions {
  blogUrl?: string;
  outputPath?: string;
}

// 启用自定义格式解析
dayjs.extend(customParseFormat);

/**
 * 格式化日期为 YYYY/MM/DD 格式
 * @param dateString 原始日期字符串
 * @returns 格式化后的日期字符串
 */
const formatDate = (dateString: string): string => {
  if (!dateString) {
    return dayjs().format('YYYY/MM/DD');
  }

  // 尝试多种日期格式解析
  const formats = [
    // ISO 格式
    'YYYY-MM-DDTHH:mm:ss.SSSZ',
    'YYYY-MM-DDTHH:mm:ssZ',
    'YYYY-MM-DD',
    // 常见英文格式
    'D MMM, YYYY',      // "21 Nov, 2025"
    'DD MMM, YYYY',     // "21 Nov, 2025"
    'MMM D, YYYY',      // "Nov 21, 2025"
    'MMMM D, YYYY',     // "November 21, 2025"
    // 其他格式
    'YYYY/MM/DD',
    'DD/MM/YYYY',
    'MM/DD/YYYY',
  ];

  // 尝试解析日期
  for (const format of formats) {
    const parsed = dayjs(dateString, format, true);
    if (parsed.isValid()) {
      return parsed.format('YYYY/MM/DD');
    }
  }

  // 如果所有格式都不匹配，尝试自动解析
  const parsed = dayjs(dateString);
  if (parsed.isValid()) {
    return parsed.format('YYYY/MM/DD');
  }

  // 如果都失败了，返回当前日期
  console.warn(`[FetchBlogPlugin] 无法解析日期: ${dateString}，使用当前日期`);
  return dayjs().format('YYYY/MM/DD');
};

/**
 * 抓取博客最新文章的 Rsbuild 插件
 * 在构建时抓取 https://blog.shuaxindiary.cn/ 的最新文章信息
 */
export const fetchBlogPlugin = (options?: FetchBlogPluginOptions): RsbuildPlugin => {
  const blogUrl = options?.blogUrl || 'https://blog.shuaxindiary.cn/';
  const outputPath = options?.outputPath || join(process.cwd(), 'src/config/blog-data.json');

  const fetchLatestPost = async (): Promise<BlogPost | null> => {
    try {
      console.log(`[FetchBlogPlugin] 正在抓取 ${blogUrl}...`);
      
      const response = await fetch(blogUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      // 查找"最近笔记"部分的第一条笔记
      let latestPost: BlogPost | null = null as BlogPost | null;

      // 首先尝试查找包含"最近笔记"标题的区块
      const $recentSection = $('*:contains("最近笔记"), *:contains("最近")').first();
      
      // 查找列表项，优先查找 ul > li 结构
      let $listItems = $('ul li, ol li, article, [class*="post"], [class*="note"]');
      
      // 如果找到了"最近笔记"区块，在该区块内查找
      if ($recentSection.length > 0) {
        $listItems = $recentSection.find('li, article, [class*="post"], [class*="note"]');
      }

      // 遍历列表项，找到第一个有效的文章链接
      $listItems.each((_, element) => {
        if (latestPost) return false; // 已找到，停止遍历

        const $item = $(element);
        const $link = $item.find('a').first();
        const href = $link.attr('href');
        const title = $link.text().trim();

        // 跳过无效链接
        if (!href || !title || title.length < 3) {
          return; // 继续下一个
        }

        // 跳过导航链接、标签链接等
        if (
          href.includes('/tags') ||
          href.includes('/categories') ||
          href.includes('/about') ||
          href.includes('/search') ||
          href === '/' ||
          href === blogUrl ||
          title === '笔记' ||
          title === '标签' ||
          title === '关于'
        ) {
          return; // 继续下一个
        }

        // 提取日期 - 尝试多种方式
        let dateText = '';
        
        // 查找 time 标签
        const $time = $item.find('time');
        if ($time.length > 0) {
          dateText = $time.attr('datetime') || $time.text().trim();
        }
        
        // 如果没有找到，尝试从文本中提取日期格式
        if (!dateText) {
          const itemText = $item.text();
          // 匹配 "21 Nov, 2025" 格式
          const dateMatch = itemText.match(/(\d{1,2}\s+\w+,\s+\d{4})/);
          if (dateMatch) {
            dateText = dateMatch[1];
          }
        }

        // 处理相对链接
        const fullLink = href.startsWith('http') 
          ? href 
          : new URL(href, blogUrl).href;

        latestPost = {
          title: title,
          date: formatDate(dateText),
          link: fullLink,
        };

        return false; // 停止遍历
      });

      // 如果上面的选择器都没找到，尝试更通用的方法
      if (!latestPost) {
        // 查找所有链接，找到第一个看起来像文章链接的
        $('a').each((_, element) => {
          if (latestPost as BlogPost | null) return false; // 已找到，停止遍历

          const $link = $(element);
          const href = $link.attr('href');
          const text = $link.text().trim();

          // 跳过导航链接、社交链接等
          if (
            href &&
            text &&
            !href.startsWith('#') &&
            !href.includes('mailto:') &&
            !href.includes('github.com') &&
            !href.includes('twitter.com') &&
            !href.includes('x.com') &&
            text.length > 5 // 标题应该有一定长度
          ) {
            const fullLink = href.startsWith('http') 
              ? href 
              : new URL(href, blogUrl).href;

            // 尝试从父元素或兄弟元素找日期
            const $parent = $link.parent();
            const dateText = 
              $parent.find('time').attr('datetime') ||
              $parent.find('time').text().trim() ||
              $parent.text().match(/\d{1,2}\s+\w+,\s+\d{4}/)?.[0] ||
              '';

            latestPost = {
              title: text,
              date: formatDate(dateText),
              link: fullLink,
            };
            return false; // 停止遍历
          }
        });
      }

      if (latestPost !== null) {
        console.log(`[FetchBlogPlugin] 成功抓取最新文章: ${latestPost.title}`);
        return latestPost;
      } else {
        console.warn('[FetchBlogPlugin] 未能找到最新文章，使用默认数据');
        return null;
      }
    } catch (error) {
      console.error('[FetchBlogPlugin] 抓取失败:', error);
      return null;
    }
  };

  return {
    name: 'fetch-blog-plugin',
    setup(build) {
      // 在构建开始前执行
      build.onBeforeBuild(async () => {
        try {
          const latestPost = await fetchLatestPost();
          
          const data = {
            latestPost: latestPost || {
              title: '暂无文章',
              date: formatDate(''),
              link: blogUrl,
            },
            fetchedAt: new Date().toISOString(),
          };

          // 写入 JSON 文件
          writeFileSync(
            outputPath,
            JSON.stringify(data, null, 2),
            'utf-8'
          );

          console.log(`[FetchBlogPlugin] 数据已写入: ${outputPath}`);
        } catch (error) {
          console.error('[FetchBlogPlugin] 插件执行失败:', error);
        }
      });
    },
  };
};

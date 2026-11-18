import { useMemo } from 'react';
import { Card } from '../Card';
import { Carousel } from '../Carousel';
import type { CarouselItem } from '../Carousel';
import './ImageCard.css';

/** 图片项数据 */
interface ImageItem {
  /** 图片 URL */
  imageUrl: string;
  /** 图片描述 */
  alt?: string;
}

/** 图片卡片组件属性 */
interface ImageCardProps {
  /** 图片列表 */
  images: ImageItem[];
  /** 轮播间隔（毫秒），默认 3000ms */
  interval?: number;
  /** 桌面首屏图片的请求优先级；移动端屏外轮播沿用浏览器默认值 */
  firstImagePriority?: 'high';
}

export const ImageCard = ({
  images,
  interval = 3000,
  firstImagePriority,
}: ImageCardProps) => {
  /** 将图片数据转换为轮播项；React 18 通过小写属性透传图片优先级，使用展开语法兼容现有类型定义。 */
  const carouselItems: CarouselItem[] = useMemo(
    () =>
      images.map((image, index) => ({
        key: image.imageUrl,
        content: (
          <img
            src={image.imageUrl}
            alt={image.alt || '展示图片'}
            className="image-card-img"
            loading={index === 0 ? 'eager' : 'lazy'}
            {...{ fetchpriority: index === 0 ? firstImagePriority : 'low' }}
            decoding="async"
            draggable={false}
          />
        ),
        fullscreenContent: (
          <img
            src={image.imageUrl}
            alt={image.alt || '展示图片'}
            className="image-card-fullscreen-img"
            loading="lazy"
            decoding="async"
            draggable={false}
          />
        ),
      })),
    [images, firstImagePriority],
  );

  if (images.length === 0) {
    return null;
  }

  return (
    <Card className="image-card">
      <Carousel
        items={carouselItems}
        interval={interval}
        pauseOnHover={true}
        enableFullscreen={true}
        indicatorClassName="image-card-indicators"
        fullscreenIndicatorClassName="image-card-fullscreen-indicators"
      />
    </Card>
  );
};

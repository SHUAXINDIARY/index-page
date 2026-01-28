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
}

export const ImageCard = ({ images, interval = 3000 }: ImageCardProps) => {
  /** 将图片数据转换为轮播项 */
  const carouselItems: CarouselItem[] = useMemo(
    () =>
      images.map((image) => ({
        key: image.imageUrl,
        content: (
          <img
            src={image.imageUrl}
            alt={image.alt || 'image'}
            className="image-card-img"
            draggable={false}
          />
        ),
        fullscreenContent: (
          <img
            src={image.imageUrl}
            alt={image.alt || 'image'}
            className="image-card-fullscreen-img"
            draggable={false}
          />
        ),
      })),
    [images],
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

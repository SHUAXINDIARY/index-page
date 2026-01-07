import { Card } from '../Card';
import './ImageCard.css';
import { useState, useEffect } from 'react';

interface ImageItem {
  imageUrl: string;
  alt?: string;
}

interface ImageCardProps {
  images: ImageItem[];
  interval?: number; // 轮播间隔（毫秒），默认 3000ms
}

export const ImageCard = ({ images, interval = 3000 }: ImageCardProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [images.length, interval]);

  if (images.length === 0) {
    return null;
  }

  const currentImage = images[currentIndex];

  return (
    <Card className="image-card">
      <img 
        src={currentImage.imageUrl} 
        alt={currentImage.alt || 'image'} 
        className="image-card-img"
      />
      {images.length > 1 && (
        <div className="image-card-indicators">
          {images.map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`显示第 ${index + 1} 张图片`}
            />
          ))}
        </div>
      )}
    </Card>
  );
};


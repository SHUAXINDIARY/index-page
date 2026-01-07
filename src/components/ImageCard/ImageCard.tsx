import { Card } from '../Card';
import './ImageCard.css';
import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragState = useRef({
    startX: 0,
    isDragging: false,
    hasMoved: false,
  });
  const dragThreshold = 40;

  // 自动轮播
  useEffect(() => {
    if (images.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [images.length, interval]);

  // 处理 ESC 键关闭全屏
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    if (isFullscreen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isFullscreen]);

  if (images.length === 0) {
    return null;
  }

  const currentImage = images[currentIndex];

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLImageElement>) => {
    if (images.length <= 1) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    dragState.current = {
      startX: event.clientX,
      isDragging: true,
      hasMoved: false,
    };
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLImageElement>) => {
    if (!dragState.current.isDragging) return;

    const deltaX = event.clientX - dragState.current.startX;
    if (Math.abs(deltaX) > 4) {
      dragState.current.hasMoved = true;
    }
    setDragOffset(deltaX);
  };

  const handlePointerEnd = (event: React.PointerEvent<HTMLImageElement>) => {
    if (!dragState.current.isDragging) return;

    const deltaX = event.clientX - dragState.current.startX;
    const absDeltaX = Math.abs(deltaX);

    dragState.current.isDragging = false;
    dragState.current.hasMoved = absDeltaX >= dragThreshold;
    setIsDragging(false);
    event.currentTarget.releasePointerCapture(event.pointerId);

    if (absDeltaX >= dragThreshold) {
      if (deltaX > 0) {
        goToPrev();
      } else {
        goToNext();
      }
    }
    setDragOffset(0);
  };

  const handlePointerCancel = (event: React.PointerEvent<HTMLImageElement>) => {
    if (!dragState.current.isDragging) return;

    dragState.current.isDragging = false;
    dragState.current.hasMoved = false;
    setIsDragging(false);
    setDragOffset(0);
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  // 处理图片点击 - 进入全屏
  const handleImageClick = () => {
    if (dragState.current.hasMoved) {
      dragState.current.hasMoved = false;
      return;
    }
    setIsFullscreen(true);
  };

  // 关闭全屏
  const handleCloseFullscreen = () => {
    setIsFullscreen(false);
  };

  return (
    <>
      <Card className="image-card">
        <img
          src={currentImage.imageUrl} 
          alt={currentImage.alt || 'image'} 
          className={`image-card-img ${isDragging ? 'is-dragging' : ''}`}
          onClick={handleImageClick}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerCancel}
          style={{ transform: `translateX(${dragOffset}px)` }}
          draggable={false}
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

      {/* 全屏图片查看器 */}
      {isFullscreen && (
        <div className="image-card-fullscreen">
          <button 
            className="image-card-fullscreen-close"
            onClick={handleCloseFullscreen}
            aria-label="关闭全屏"
          >
            <X size={24} />
          </button>
          <img
            src={currentImage.imageUrl} 
            alt={currentImage.alt || 'image'} 
            className={`image-card-fullscreen-img ${isDragging ? 'is-dragging' : ''}`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerEnd}
            onPointerCancel={handlePointerCancel}
            style={{ transform: `translateX(${dragOffset}px)` }}
            draggable={false}
          />
          {images.length > 1 && (
            <div className="image-card-fullscreen-indicators">
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
        </div>
      )}
    </>
  );
};

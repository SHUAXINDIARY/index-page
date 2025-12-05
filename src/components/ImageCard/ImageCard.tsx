import { Card } from '../Card';
import './ImageCard.css';

interface ImageCardProps {
  imageUrl: string;
  alt?: string;
}

export const ImageCard = ({ imageUrl, alt = 'image' }: ImageCardProps) => {
  return (
    <Card className="image-card">
      <img src={imageUrl} alt={alt} />
    </Card>
  );
};


import { Card } from '../Card';
import './ArticleCard.css';
import type { ArticleInfo } from '../../config/content';

interface ArticleCardProps {
  config: ArticleInfo;
}

export const ArticleCard = ({ config }: ArticleCardProps) => {
  return (
    <Card className="article-card" onClick={() => {
      window.open(config.link, '_blank');
    }}>
      <div className="article-tag">{config.tag}</div>
      <div className="article-icon">{config.icon}</div>
      <h4 className="article-title">{config.title}</h4>
      <p className="article-category">{config.category}</p>
      <p className="article-date">{config.date}</p>
    </Card>
  );
};


import { Card } from './Card';
import './ArticleCard.css';
import dayjs from 'dayjs';

interface Article {
  title: string;
  category: string;
  date: string;
}

export const ArticleCard = () => {
  const article: Article = {
    title: '图片懒加载 —— 关于Intersection...',
    category: '技能提升的秘诀',
    date: '2025/11/29',
  };

  return (
    <Card className="article-card">
      <div className="article-tag">最新文章</div>
      <div className="article-icon">📝</div>
      <h4 className="article-title">{article.title}</h4>
      <p className="article-category">{article.category}</p>
      <p className="article-date">{article.date}</p>
    </Card>
  );
};


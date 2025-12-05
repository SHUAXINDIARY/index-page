import { Card } from './Card';
import './RecommendCard.css';

interface Recommendation {
  name: string;
  description: string;
  avatar: string;
}

export const RecommendCard = () => {
  const recommendation: Recommendation = {
    name: 'Ai Iman',
    description: '⚙️ Mojo UI，伸宿探笔或者 ⚙️ Magic World，智慧的世界动态',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AiIman',
  };

  return (
    <Card className="recommend-card">
      <div className="recommend-header">随机推荐</div>
      <div className="recommend-content">
        <div className="recommend-avatar">
          <img src={recommendation.avatar} alt={recommendation.name} />
        </div>
        <div className="recommend-info">
          <h4 className="recommend-name">{recommendation.name}</h4>
          <p className="recommend-description">{recommendation.description}</p>
        </div>
      </div>
    </Card>
  );
};


import { Card } from '../Card';
import './RecommendCard.css';
import type { RecommendInfo } from '../../config/content';

interface RecommendCardProps {
  config: RecommendInfo;
}

export const RecommendCard = ({ config }: RecommendCardProps) => {
  return (
    <Card className="recommend-card">
      <div className="recommend-header">随机推荐</div>
      <div className="recommend-content">
        <div className="recommend-avatar">
          <img src={config.avatar} alt={config.name} />
        </div>
        <div className="recommend-info">
          <h4 className="recommend-name">{config.name}</h4>
          <p className="recommend-description">{config.description}</p>
        </div>
      </div>
    </Card>
  );
};


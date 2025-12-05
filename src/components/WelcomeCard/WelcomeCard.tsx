import { Card } from '../Card';
import './WelcomeCard.css';
import type { WelcomeInfo } from '../../config/content';

interface WelcomeCardProps {
  config: WelcomeInfo;
}

export const WelcomeCard = ({ config }: WelcomeCardProps) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <Card className="welcome-card">
      <div className="welcome-avatar">
        <img src={config.avatar} alt="character" />
      </div>
      <h2 className="welcome-greeting">{getGreeting()}</h2>
      <p className="welcome-text">
        I'm <span className="highlight" style={{ color: config.highlightColor }}>{config.name}</span>, Nice to meet you!
      </p>
    </Card>
  );
};


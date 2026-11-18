import { Card } from '../Card';
import './WelcomeCard.css';
import { user, type WelcomeInfo } from '../../config/content';

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
        <img
          src={config.avatar}
          alt=""
          width={100}
          height={100}
          fetchPriority="high"
        />
      </div>
      <h2 className="welcome-greeting" lang="en">{getGreeting()}</h2>
      <p className="welcome-text" lang="en">About Me</p>
      <p >
        {user?.tag || ''}
      </p>
    </Card>
  );
};


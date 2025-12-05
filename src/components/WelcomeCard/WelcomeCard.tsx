import { Card } from '../Card';
import './WelcomeCard.css';

export const WelcomeCard = () => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <Card className="welcome-card">
      <div className="welcome-avatar">
        <img src="https://api.dicebear.com/7.x/bottts/svg?seed=Suni" alt="character" />
      </div>
      <h2 className="welcome-greeting">{getGreeting()}</h2>
      <p className="welcome-text">
        I'm <span className="highlight">Suni</span>, Nice to meet you!
      </p>
    </Card>
  );
};


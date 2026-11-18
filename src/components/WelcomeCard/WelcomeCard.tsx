import { Card } from '../Card';
import './WelcomeCard.css';
import { user, type WelcomeInfo } from '../../config/content';

/** 欢迎卡片组件属性 */
interface WelcomeCardProps {
  /** 欢迎信息与头像配置 */
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
        {/* React 18 通过小写属性透传图片优先级，使用展开语法兼容现有类型定义。 */}
        <img
          src={config.avatar}
          alt=""
          width={100}
          height={100}
          {...{ fetchpriority: 'high' }}
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


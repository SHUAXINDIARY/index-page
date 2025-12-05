import { FileText, FolderOpen, Info, Star, Globe } from 'lucide-react';
import { Card } from './Card';
import './UserCard.css';

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

export const UserCard = () => {
  const menuItems: MenuItem[] = [
    { icon: <FileText size={18} />, label: '近期文章' },
    { icon: <FolderOpen size={18} />, label: '我的项目' },
    { icon: <Info size={18} />, label: '关于网站' },
    { icon: <Star size={18} />, label: '推荐分享' },
    { icon: <Globe size={18} />, label: '优秀博客' },
  ];

  return (
    <Card className="user-card">
      <div className="user-header">
        <div className="user-avatar">
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=YYsuni" alt="avatar" />
        </div>
        <div className="user-info">
          <h3>YYsuni</h3>
          <span className="user-tag">萨途吧</span>
        </div>
      </div>
      <div className="menu-divider">GENERAL</div>
      <div className="menu-items">
        {menuItems.map((item, index) => (
          <div key={index} className="menu-item" onClick={item.onClick}>
            <span className="menu-icon">{item.icon}</span>
            <span className="menu-label">{item.label}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};


import { Github } from 'lucide-react';
import './SocialLinks.css';

interface SocialLink {
  icon: React.ReactNode;
  label: string;
  url?: string;
}

export const SocialLinks = () => {
  const links: SocialLink[] = [
    {
      icon: <Github size={20} />,
      label: 'Github',
      url: 'https://github.com',
    },
    {
      icon: <span className="juejin-icon">掘</span>,
      label: '掘土聚合',
    },
  ];

  return (
    <div className="social-links">
      {links.map((link, index) => (
        <a
          key={index}
          href={link.url || '#'}
          className="social-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className="social-icon">{link.icon}</div>
          <span className="social-label">{link.label}</span>
        </a>
      ))}
    </div>
  );
};


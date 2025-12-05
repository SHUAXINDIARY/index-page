import { Github } from 'lucide-react';
import './SocialLinks.css';
import type { SocialLink } from '../../config/content';

interface SocialLinksProps {
  links: SocialLink[];
}

export const SocialLinks = ({ links }: SocialLinksProps) => {
  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Github':
        return <Github size={20} />;
      case 'Juejin':
        return <span className="juejin-icon">掘</span>;
      default:
        return <span>{iconName}</span>;
    }
  };

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
          <div className="social-icon">{renderIcon(link.icon)}</div>
          <span className="social-label">{link.label}</span>
        </a>
      ))}
    </div>
  );
};


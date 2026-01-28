import { Camera, Github, Music2, Rss, Twitter } from 'lucide-react';
import './SocialLinks.css';
import { Tooltip } from '../Tooltip';
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
        return <Rss size={20} />
      case 'Photography':
        return <Camera size={20} />
      case 'music':
        return <Music2 size={20} />
      case 'X':
        return <Twitter size={20} />
      case 'Red Note':
        return <span>红</span>;
      default:
        return <span>{iconName}</span>;
    }
  };

  return (
    <div className="social-links">
      {links.map((link, index) => (
        <Tooltip key={index} content={link.label}>
          <a
            href={link.url || '#'}
            className="social-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="social-icon">{renderIcon(link.icon)}</div>
          </a>
        </Tooltip>
      ))}
    </div>
  );
};


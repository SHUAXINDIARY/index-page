import { Camera, Github, Music2, Rss, Twitter } from 'lucide-react';
import { motion } from 'motion/react';
import './SocialLinks.css';
import { Tooltip } from '../Tooltip';
import type { SocialLink } from '../../config/content';

/** 基础动画延迟（秒） */
const BASE_DELAY = 0.3;

/** 每项递增延迟（秒） */
const STAGGER_DELAY = 0.08;

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
          <motion.a
            href={link.url || '#'}
            className="social-link"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 15, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.4,
              delay: BASE_DELAY + index * STAGGER_DELAY,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            whileHover={{ scale: 1.15, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="social-icon">{renderIcon(link.icon)}</div>
          </motion.a>
        </Tooltip>
      ))}
    </div>
  );
};


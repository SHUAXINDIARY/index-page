import { useMemo } from 'react';
import { ArrowUpRight, Plane } from 'lucide-react';
import { Card } from '../Card';
import './AircraftLogCard.css';
import type { AircraftLogInfo } from '../../config/content';

/** AircraftLogCard 组件属性 */
interface AircraftLogCardProps {
  /** 航司 Wiki 卡片配置 */
  config: AircraftLogInfo;
}

/** 从资料库 URL 提取展示用主机名 */
const getSiteHost = (url: string): string => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
};

export const AircraftLogCard = ({ config }: AircraftLogCardProps) => {
  /** 资料库站点主机名，用于页脚展示 */
  const siteHost = useMemo(() => getSiteHost(config.url), [config.url]);

  const openSite = () => {
    if (!config.url) return;
    window.open(config.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card className="aircraft-log-card" onClick={openSite}>
      <span className="aircraft-log-tag">{config.tag}</span>

      <div className="aircraft-log-body">
        <div className="aircraft-log-brand">
          <span className="aircraft-log-icon" aria-hidden="true">
            <Plane size={22} strokeWidth={1.75} />
          </span>
          <div className="aircraft-log-copy">
            <h4 className="aircraft-log-title">{config.title}</h4>
            <p className="aircraft-log-description">{config.description}</p>
          </div>
        </div>
      </div>

      <footer className="aircraft-log-footer">
        {siteHost ? (
          <span className="aircraft-log-site">{siteHost}</span>
        ) : (
          <span className="aircraft-log-site">航司机型资料库</span>
        )}
        <span className="aircraft-log-action">
          打开
          <ArrowUpRight size={14} strokeWidth={2} aria-hidden="true" />
        </span>
      </footer>
    </Card>
  );
};

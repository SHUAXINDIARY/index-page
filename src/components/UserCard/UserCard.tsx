import { useCallback, useState } from 'react';
import { FileText, FolderOpen, Info, Star, Globe } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card } from '../Card';
import { IframeModal } from '../IframeModal';
import './UserCard.css';
import type { UserInfo } from '../../config/content';

interface UserCardProps {
  config: UserInfo;
}

/** 图标映射 */
const iconMap: Record<string, LucideIcon> = {
  FileText,
  FolderOpen,
  Info,
  Star,
  Globe,
};

export const UserCard = ({ config }: UserCardProps) => {
  /** 当前打开的 modal URL */
  const [modalUrl, setModalUrl] = useState<string | null>(null);

  /** 打开 modal */
  const handleMenuClick = useCallback((url: string) => {
    setModalUrl(url);
  }, []);

  /** 关闭 modal */
  const handleCloseModal = useCallback(() => {
    setModalUrl(null);
  }, []);

  return (
    <>
      <Card className="user-card">
        <div className="user-header">
          <div className="user-avatar">
            <img src={config.avatar} alt="avatar" />
          </div>
          <div className="user-info">
            <h3>{config.name}</h3>
            {/* <span className="user-tag">{config.tag}</span> */}
          </div>
        </div>
        <div className="menu-divider">GENERAL</div>
        <div className="menu-items">
          {config.menuItems.map((item, index) => {
            const IconComponent = iconMap[item.icon];
            return (
              <div
                key={index}
                className="menu-item"
                onClick={item.onClick || (() => handleMenuClick(item.url || ''))}
              >
                <span className="menu-icon">
                  {IconComponent && <IconComponent size={18} />}
                </span>
                <span className="menu-label">{item.label}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* iframe Modal */}
      {modalUrl && (
        <IframeModal
          url={modalUrl}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};

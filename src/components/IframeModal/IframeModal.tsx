import { useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ExternalLink } from 'lucide-react';
import './IframeModal.css';

/** IframeModal 组件属性 */
export interface IframeModalProps {
  /** 要加载的 URL */
  url: string;
  /** 关闭回调 */
  onClose: () => void;
  /** iframe 标题，用于无障碍访问 */
  title?: string;
}

export const IframeModal = ({ url, onClose, title = 'External Content' }: IframeModalProps) => {
  /** 在新标签页打开 */
  const handleOpenInNewTab = useCallback(() => {
    window.open(url, '_blank');
  }, [url]);

  // 处理 ESC 键关闭 modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return createPortal(
    <div className="iframe-modal-overlay" onClick={onClose}>
      <div className="iframe-modal" onClick={(e) => e.stopPropagation()}>
        <div className="iframe-modal-header">
          <button
            className="iframe-modal-btn iframe-modal-new-tab"
            onClick={handleOpenInNewTab}
            aria-label="在新标签页打开"
          >
            <ExternalLink size={18} />
            <span>新窗口打开</span>
          </button>
          <button
            className="iframe-modal-btn iframe-modal-close"
            onClick={onClose}
            aria-label="关闭"
          >
            <X size={20} />
          </button>
        </div>
        <iframe
          className="iframe-modal-iframe"
          src={url}
          title={title}
        />
      </div>
    </div>,
    document.body
  );
};

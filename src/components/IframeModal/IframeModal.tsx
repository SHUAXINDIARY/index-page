import { useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
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
    <motion.div
      className="iframe-modal-overlay"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="iframe-modal"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
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
      </motion.div>
    </motion.div>,
    document.body
  );
};

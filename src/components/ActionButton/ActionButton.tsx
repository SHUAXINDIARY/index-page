import { Pencil } from 'lucide-react';
import { motion } from 'motion/react';
import './ActionButton.css';

/** 入场动画延迟（秒） */
const ENTRANCE_DELAY = 0.25;

/** 操作按钮的文字、图标和可选操作 */
interface ActionButtonProps {
  /** 显示名称 */
  label: string;
  /** 装饰图标 */
  icon?: React.ReactNode;
  /** 操作回调；未配置时仅展示信息 */
  onClick?: () => void;
}

export const ActionButton = ({ label, icon, onClick }: ActionButtonProps) => {
  return (
    <motion.button
      type="button"
      aria-disabled={!onClick || undefined}
      tabIndex={onClick ? undefined : -1}
      className="action-button"
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.4,
        delay: ENTRANCE_DELAY,
        ease: [0.25, 1, 0.5, 1],
      }}
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
    >
      {icon || <Pencil size={16} />}
      <span>{label}</span>
    </motion.button>
  );
};


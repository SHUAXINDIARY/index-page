import { Pencil } from 'lucide-react';
import { motion } from 'motion/react';
import './ActionButton.css';

/** 入场动画延迟（秒） */
const ENTRANCE_DELAY = 0.25;

interface ActionButtonProps {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}

export const ActionButton = ({ label, icon, onClick }: ActionButtonProps) => {
  return (
    <motion.button
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


import { Pencil } from 'lucide-react';
import './ActionButton.css';

interface ActionButtonProps {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}

export const ActionButton = ({ label, icon, onClick }: ActionButtonProps) => {
  return (
    <button className="action-button" onClick={onClick}>
      {icon || <Pencil size={16} />}
      <span>{label}</span>
    </button>
  );
};


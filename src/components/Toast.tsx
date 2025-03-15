
import React from 'react';
import { useToast } from '@/hooks/use-toast';
import './Toast.css';

interface ToastProps {
  id: string;
  title?: string;
  description?: string;
  type?: 'default' | 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose?: () => void;
}

const Toast: React.FC<ToastProps> = ({
  id,
  title,
  description,
  type = 'default',
  duration = 5000,
  onClose,
}) => {
  const { removeToast } = useToast();

  React.useEffect(() => {
    const timer = setTimeout(() => {
      removeToast(id);
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, removeToast, onClose]);

  return (
    <div 
      className={`toast toast--${type}`} 
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="toast__content">
        {title && <h3 className="toast__title">{title}</h3>}
        {description && <p className="toast__description">{description}</p>}
      </div>
      <button 
        className="toast__close-button" 
        onClick={() => {
          removeToast(id);
          if (onClose) onClose();
        }}
        aria-label="Close toast"
      >
        &times;
      </button>
    </div>
  );
};

export default Toast;

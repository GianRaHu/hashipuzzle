
import React from 'react';
import { useToast } from '@/hooks/use-toast';
import Toast from './Toast';

export const Toaster: React.FC = () => {
  const { toasts } = useToast();

  return (
    <div className="fixed top-0 right-0 z-50 p-4 space-y-2 w-full max-w-[420px] pointer-events-none flex flex-col items-end">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          title={toast.title}
          description={toast.description}
          type={toast.type}
          duration={toast.duration}
        />
      ))}
    </div>
  );
};

export default Toaster;

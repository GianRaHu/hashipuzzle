import React, { createContext, useContext, useState } from 'react';

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ToastOptions {
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  action?: ToastAction;
}

interface ToastContextValue {
  show: (options: ToastOptions) => void;
  hide: () => void;
}

const ToastContext = createContext<ToastContextValue>({
  show: () => {},
  hide: () => {}
});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastOptions | null>(null);

  const show = (options: ToastOptions) => {
    setToast(options);
    if (options.duration !== 0) {
      setTimeout(() => {
        setToast(null);
      }, options.duration || 3000);
    }
  };

  const hide = () => setToast(null);

  return (
    <ToastContext.Provider value={{ show, hide }}>
      {children}
      {toast && (
        <div className={`toast toast-${toast.type || 'info'}`}>
          <div className="toast-content">
            <h4>{toast.title}</h4>
            <p>{toast.message}</p>
          </div>
          {toast.action && (
            <button onClick={toast.action.onClick}>
              {toast.action.label}
            </button>
          )}
          <button className="toast-close" onClick={hide}>
            ×
          </button>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export const toast = {
  show: (options: ToastOptions) => {
    const context = useContext(ToastContext);
    context.show(

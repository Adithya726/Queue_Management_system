import { useCallback, useMemo, useState } from 'react';
import { ToastContext } from './toastContextValue';
import { CircleCheck, CircleX, X } from 'lucide-react';

let nextId = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    (type, message) => {
      const id = nextId++;
      setToasts((current) => [...current.slice(-3), { id, type, message }]);
      setTimeout(() => dismiss(id), 3500);
    },
    [dismiss]
  );

  const value = useMemo(
    () => ({
      success: (message) => push('success', message),
      error: (message) => push('error', message),
    }),
    [push]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-stack" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            {toast.type === 'success' ? <CircleCheck size={18} /> : <CircleX size={18} />}
            <span>{toast.message}</span>
            <button
              type="button"
              className="toast-close"
              aria-label="Dismiss"
              onClick={() => dismiss(toast.id)}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

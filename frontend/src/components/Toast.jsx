import { useCallback, useState } from 'react';

let toastId = 0;

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((message, type = 'success') => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => dismiss(id), 4000);
    return id;
  }, [dismiss]);

  return { toasts, show, dismiss };
}

export function ToastContainer({ toasts, onDismiss }) {
  if (!toasts.length) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      aria-live="polite"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role="alert"
          className={`animate-fade-in pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg text-sm font-medium ${
            t.type === 'error'
              ? 'bg-error-container border-error/30 text-error'
              : t.type === 'warning'
              ? 'bg-warning-bg border-warning-border text-warning'
              : 'bg-card border-outline text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-xl shrink-0 leading-none">
            {t.type === 'error'
              ? 'error'
              : t.type === 'warning'
              ? 'warning'
              : 'check_circle'}
          </span>
          <p className="flex-1 leading-snug">{t.message}</p>
          <button
            type="button"
            onClick={() => onDismiss(t.id)}
            className="shrink-0 flex items-center justify-center opacity-60 hover:opacity-100"
            aria-label="Đóng"
          >
            <span className="material-symbols-outlined text-base leading-none">close</span>
          </button>
        </div>
      ))}
    </div>
  );
}

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

const ConfirmContext = createContext();

export function ConfirmProvider({ children }) {
  const [dialog, setDialog] = useState(null); // { kind: 'confirm' | 'prompt', message, options }
  const [inputValue, setInputValue] = useState("");
  const resolveRef = useRef(null);
  const inputRef = useRef(null);

  const confirm = useCallback((message, options = {}) => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setDialog({ kind: 'confirm', message, options });
    });
  }, []);

  const promptText = useCallback((message, options = {}) => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setInputValue(options.defaultValue || "");
      setDialog({ kind: 'prompt', message, options });
    });
  }, []);

  const close = useCallback((result) => {
    if (resolveRef.current) resolveRef.current(result);
    resolveRef.current = null;
    setDialog(null);
    setInputValue("");
  }, []);

  useEffect(() => {
    if (dialog?.kind === 'prompt' && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [dialog]);

  const cancelValue = dialog?.kind === 'prompt' ? null : false;
  const confirmValue = dialog?.kind === 'prompt' ? inputValue : true;
  const isDanger = Boolean(dialog?.options?.danger);

  return (
    <ConfirmContext.Provider value={{ confirm, promptText }}>
      {children}
      {dialog && (
        <div className="modal-overlay" onClick={() => close(cancelValue)}>
          <div
            className="modal-panel max-w-sm w-full p-5 md:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm font-medium text-on-surface leading-snug whitespace-pre-line mb-4">
              {dialog.message}
            </p>

            {dialog.kind === 'prompt' && (
              <input
                ref={inputRef}
                type={dialog.options?.password ? 'password' : dialog.options?.inputType || 'text'}
                className="input-field mb-1"
                placeholder={dialog.options?.placeholder || ''}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') close(inputValue);
                  if (e.key === 'Escape') close(null);
                }}
              />
            )}

            <div className="flex gap-3 mt-5">
              <button type="button" className="btn-outline flex-1" onClick={() => close(cancelValue)}>
                {dialog.options?.cancelLabel || 'Hủy'}
              </button>
              <button
                type="button"
                className={isDanger ? 'btn-error flex-1' : 'btn-primary flex-1'}
                onClick={() => close(confirmValue)}
              >
                {dialog.options?.confirmLabel || 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export const useConfirm = () => useContext(ConfirmContext);

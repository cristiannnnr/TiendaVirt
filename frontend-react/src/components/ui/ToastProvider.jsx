import { createContext, useCallback, useContext, useState } from 'react';

const ToastCtx = createContext(null);
export function useToasts(){
  const ctx = useContext(ToastCtx);
  // Retornar objeto con método addToast para compatibilidad
  if (!ctx) {
    return { 
      addToast: () => {}, 
      push: () => {}, 
      dismiss: () => {} 
    };
  }
  return {
    addToast: ctx.push,
    push: ctx.push,
    dismiss: ctx.dismiss
  };
}

let idCounter = 0;
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((message, opts={}) => {
    const id = ++idCounter;
    setToasts(t => [...t, { id, message, type: opts.type||'info', ttl: opts.ttl||3500 }]);
    setTimeout(() => {
      setToasts(t => t.filter(x => x.id !== id));
    }, opts.ttl || 3500);
  }, []);

  const dismiss = useCallback(id => setToasts(t => t.filter(x => x.id !== id)), []);

  return (
    <ToastCtx.Provider value={{ push, dismiss }}>
      {children}
      <div className="toast-stack" aria-live="polite" aria-atomic="true">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast--${t.type}`}> 
            <span>{t.message}</span>
            <button onClick={() => dismiss(t.id)} aria-label="Cerrar">×</button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

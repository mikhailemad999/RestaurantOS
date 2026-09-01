import React, { createContext, useContext, useState } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success', duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto max-w-sm p-3.5 rounded-xl border shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-200 ${
              toast.type === 'success'
                ? 'bg-[#1c1b1b] border-[#4edea3] text-white shadow-emerald'
                : toast.type === 'error'
                ? 'bg-[#1c1b1b] border-[#ff949c] text-white'
                : 'bg-[#1c1b1b] border-[#d4af37] text-white shadow-gold'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-[#4edea3] shrink-0" />}
            {toast.type === 'error' && <AlertTriangle className="w-5 h-5 text-[#ff949c] shrink-0" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-[#d4af37] shrink-0" />}
            <span className="text-xs font-sans font-medium flex-1">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 text-[#99907c] hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

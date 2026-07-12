import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

let toastId = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = ++toastId
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, duration)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
    info: (msg) => addToast(msg, 'info'),
    warning: (msg) => addToast(msg, 'warning'),
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

function ToastContainer({ toasts, onRemove }) {
  const typeStyles = {
    success: 'border-l-4 border-tertiary bg-surface-container',
    error: 'border-l-4 border-error bg-surface-container',
    info: 'border-l-4 border-primary bg-surface-container',
    warning: 'border-l-4 border-secondary-fixed bg-surface-container',
  }
  const typeIcons = {
    success: 'check_circle',
    error: 'error',
    info: 'info',
    warning: 'warning',
  }
  const typeIconColors = {
    success: 'text-tertiary',
    error: 'text-error',
    info: 'text-primary',
    warning: 'text-secondary-fixed',
  }

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`flex items-start gap-3 px-4 py-3 rounded-lg shadow-2xl border border-outline-variant pointer-events-auto animate-slide-down ${typeStyles[t.type]}`}
        >
          <span className={`material-symbols-outlined text-[20px] mt-0.5 flex-shrink-0 ${typeIconColors[t.type]}`}>
            {typeIcons[t.type]}
          </span>
          <p className="text-sm text-on-surface flex-1">{t.message}</p>
          <button
            onClick={() => onRemove(t.id)}
            className="text-on-surface-variant hover:text-on-surface transition-colors flex-shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      ))}
    </div>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

export default ToastContext

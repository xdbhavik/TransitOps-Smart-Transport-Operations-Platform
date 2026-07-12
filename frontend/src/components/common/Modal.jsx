import { useEffect } from 'react'

/**
 * Modal — generic dialog wrapper with Obsidian design system styling.
 * title: string
 * onClose: function
 * size: 'sm' | 'md' | 'lg' | 'xl' (default 'md')
 */
export function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-2xl',
    lg: 'max-w-3xl',
    xl: 'max-w-4xl',
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal-container ${sizeClasses[size]}`} role="dialog" aria-modal="true">
        <div className="modal-header">
          <h2 className="text-xl font-headline font-semibold text-on-surface tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            className="btn-icon rounded-full"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined text-xl leading-none">close</span>
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function ModalBody({ children, className = '' }) {
  return <div className={`modal-body ${className}`}>{children}</div>
}

export function ModalFooter({ children }) {
  return <div className="modal-footer">{children}</div>
}

export default Modal

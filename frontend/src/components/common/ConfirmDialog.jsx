import { Modal, ModalBody, ModalFooter } from './Modal'

/**
 * ConfirmDialog — specialized modal for destructive confirmations.
 * variant: 'danger' | 'warning' (default: 'danger')
 */
export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
}) {
  const variantConfig = {
    danger: {
      icon: 'warning',
      iconColor: 'text-error',
      confirmClass: 'btn-danger',
    },
    warning: {
      icon: 'info',
      iconColor: 'text-secondary-fixed',
      confirmClass: 'btn-primary',
    },
  }

  const config = variantConfig[variant] || variantConfig.danger

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <ModalBody>
        <div className="flex flex-col items-center gap-4 text-center py-4">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center bg-error/10 ${config.iconColor}`}>
            <span className="material-symbols-outlined text-3xl">{config.icon}</span>
          </div>
          {message && (
            <p className="text-on-surface-variant text-sm leading-relaxed">{message}</p>
          )}
        </div>
      </ModalBody>
      <ModalFooter>
        <button onClick={onClose} className="btn-secondary" disabled={loading}>
          {cancelLabel}
        </button>
        <button
          onClick={onConfirm}
          className={config.confirmClass}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
              Processing...
            </>
          ) : confirmLabel}
        </button>
      </ModalFooter>
    </Modal>
  )
}

export default ConfirmDialog

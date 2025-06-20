import { useState, useEffect } from 'react'

interface ToastNotification {
  id: string
  title: string
  message: string
  type: 'success' | 'info' | 'warning' | 'error'
  duration?: number
}

class ToastManager {
  private listeners: Set<(toasts: ToastNotification[]) => void> = new Set()
  private toasts: ToastNotification[] = []

  subscribe(callback: (toasts: ToastNotification[]) => void) {
    this.listeners.add(callback)
    return () => {
      this.listeners.delete(callback)
    }
  }

  private notify() {
    this.listeners.forEach(callback => callback([...this.toasts]))
  }

  show(toast: Omit<ToastNotification, 'id'>) {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: ToastNotification = {
      ...toast,
      id,
      duration: toast.duration || 3000
    }

    this.toasts.push(newToast)
    this.notify()

    // Auto remove after duration
    setTimeout(() => {
      this.remove(id)
    }, newToast.duration)

    return id
  }

  remove(id: string) {
    this.toasts = this.toasts.filter(toast => toast.id !== id)
    this.notify()
  }

  clear() {
    this.toasts = []
    this.notify()
  }
}

const toastManager = new ToastManager()

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastNotification[]>([])

  useEffect(() => {
    return toastManager.subscribe(setToasts)
  }, [])

  return {
    toasts,
    showToast: (toast: Omit<ToastNotification, 'id'>) => toastManager.show(toast),
    removeToast: (id: string) => toastManager.remove(id),
    clearToasts: () => toastManager.clear()
  }
}

export const Toast = ({ toast, onRemove }: { toast: ToastNotification; onRemove: (id: string) => void }) => {
  const bgColor = {
    success: 'bg-green-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500'
  }[toast.type]

  return (
    <div className={`${bgColor} text-white px-4 py-3 rounded-lg shadow-lg mb-2 animate-in slide-in-from-right duration-300`}>
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold text-sm">{toast.title}</h4>
          <p className="text-xs opacity-90">{toast.message}</p>
        </div>
        <button
          onClick={() => onRemove(toast.id)}
          className="ml-4 text-white/80 hover:text-white"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

export const ToastContainer = () => {
  const { toasts, removeToast } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  )
}

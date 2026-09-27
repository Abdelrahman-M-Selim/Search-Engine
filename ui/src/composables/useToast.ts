import { ref } from 'vue'

export interface ToastMessage {
  id: string
  type: 'success' | 'info' | 'warning' | 'error'
  title: string
  message?: string
  duration?: number
}

const toasts = ref<ToastMessage[]>([])

export function useToast() {
  function show(toast: Omit<ToastMessage, 'id'>) {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`
    const duration = toast.duration ?? 4000
    const newToast: ToastMessage = { ...toast, id }

    toasts.value.push(newToast)

    if (duration > 0) {
      setTimeout(() => {
        dismiss(id)
      }, duration)
    }
  }

  function success(title: string, message?: string) {
    show({ type: 'success', title, message })
  }

  function error(title: string, message?: string) {
    show({ type: 'error', title, message })
  }

  function info(title: string, message?: string) {
    show({ type: 'info', title, message })
  }

  function warning(title: string, message?: string) {
    show({ type: 'warning', title, message })
  }

  function dismiss(id: string) {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  return {
    toasts,
    show,
    success,
    error,
    info,
    warning,
    dismiss
  }
}

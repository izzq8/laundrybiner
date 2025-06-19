"use client"

import { useState, useCallback } from "react"

export interface AlertOptions {
  title: string
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  confirmText?: string
  cancelText?: string
  showCancel?: boolean
}

export interface ConfirmOptions extends AlertOptions {
  showCancel: true
}

export interface AlertState extends AlertOptions {
  isOpen: boolean
  onConfirm?: () => void
}

export function useAlert() {
  const [alertState, setAlertState] = useState<AlertState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  })

  const showAlert = useCallback((options: AlertOptions) => {
    setAlertState({
      ...options,
      isOpen: true,
      showCancel: options.showCancel || false
    })
  }, [])

  const showConfirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setAlertState({
        ...options,
        isOpen: true,
        onConfirm: () => resolve(true)
      })
    })
  }, [])

  const hideAlert = useCallback(() => {
    setAlertState(prev => ({ ...prev, isOpen: false }))
  }, [])

  // Convenience methods
  const showSuccess = useCallback((title: string, message: string) => {
    showAlert({ title, message, type: 'success' })
  }, [showAlert])

  const showError = useCallback((title: string, message: string) => {
    showAlert({ title, message, type: 'error' })
  }, [showAlert])

  const showWarning = useCallback((title: string, message: string) => {
    showAlert({ title, message, type: 'warning' })
  }, [showAlert])

  const showInfo = useCallback((title: string, message: string) => {
    showAlert({ title, message, type: 'info' })
  }, [showAlert])

  return {
    alertState,
    showAlert,
    showConfirm,
    hideAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo
  }
}

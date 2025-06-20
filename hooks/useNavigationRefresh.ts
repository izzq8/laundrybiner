import { useEffect, useCallback } from 'react'

class NavigationRefreshEmitter {
  private listeners: Set<() => void> = new Set()

  subscribe(callback: () => void) {
    this.listeners.add(callback)
    return () => {
      this.listeners.delete(callback)
    }
  }

  emit() {
    this.listeners.forEach(callback => callback())
  }
}

const navigationRefreshEmitter = new NavigationRefreshEmitter()

export const useNavigationRefresh = (callback: () => void) => {
  useEffect(() => {
    return navigationRefreshEmitter.subscribe(callback)
  }, [callback])
}

export const triggerNavigationRefresh = () => {
  console.log('🔄 Triggering navigation refresh for all subscribers')
  navigationRefreshEmitter.emit()
}

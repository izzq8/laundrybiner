import { useEffect, useRef } from 'react'

interface PerformanceMetrics {
  cacheHits: number
  cacheMisses: number
  totalFetches: number
  averageResponseTime: number
  lastFetchTime: number
}

class CachePerformanceMonitor {
  private metrics: PerformanceMetrics = {
    cacheHits: 0,
    cacheMisses: 0,
    totalFetches: 0,
    averageResponseTime: 0,
    lastFetchTime: 0
  }

  recordCacheHit() {
    this.metrics.cacheHits++
    this.metrics.totalFetches++
    console.log('📊 Cache hit recorded', this.getStats())
  }

  recordCacheMiss(responseTime?: number) {
    this.metrics.cacheMisses++
    this.metrics.totalFetches++
    this.metrics.lastFetchTime = Date.now()
    
    if (responseTime) {
      // Update average response time
      const currentAvg = this.metrics.averageResponseTime
      const totalMisses = this.metrics.cacheMisses
      this.metrics.averageResponseTime = 
        (currentAvg * (totalMisses - 1) + responseTime) / totalMisses
    }
    
    console.log('📊 Cache miss recorded', this.getStats())
  }

  getStats() {
    const hitRate = this.metrics.totalFetches > 0 
      ? (this.metrics.cacheHits / this.metrics.totalFetches * 100).toFixed(1)
      : '0'
    
    return {
      hitRate: `${hitRate}%`,
      cacheHits: this.metrics.cacheHits,
      cacheMisses: this.metrics.cacheMisses,
      totalFetches: this.metrics.totalFetches,
      averageResponseTime: this.metrics.averageResponseTime.toFixed(0) + 'ms'
    }
  }

  reset() {
    this.metrics = {
      cacheHits: 0,
      cacheMisses: 0,
      totalFetches: 0,
      averageResponseTime: 0,
      lastFetchTime: 0
    }
  }
}

// Global instance
const performanceMonitor = new CachePerformanceMonitor()

export function useCachePerformance() {
  const statsRef = useRef(performanceMonitor.getStats())

  useEffect(() => {
    const interval = setInterval(() => {
      statsRef.current = performanceMonitor.getStats()
    }, 5000) // Update stats every 5 seconds

    return () => clearInterval(interval)
  }, [])

  return {
    recordCacheHit: () => performanceMonitor.recordCacheHit(),
    recordCacheMiss: (responseTime?: number) => performanceMonitor.recordCacheMiss(responseTime),
    getStats: () => performanceMonitor.getStats(),
    resetStats: () => performanceMonitor.reset()
  }
}

// Export the monitor for use in the cache hook
export { performanceMonitor }

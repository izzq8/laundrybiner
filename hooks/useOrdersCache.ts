import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/components/auth-provider'
import { performanceMonitor } from './useCachePerformance'

interface Order {
  id: string
  order_number: string
  status: string
  payment_status: string
  total_amount: number
  pickup_date: string
  pickup_time: string
  customer_name: string
  customer_phone: string
  pickup_address: string
  notes?: string
  weight?: number
  created_at: string
  service_type?: string
  pickup_option?: string
  delivery_option?: string
  delivery_address?: string
  delivery_date?: string
  delivery_time?: string
  service_types?: {
    name: string
    type: string
    price: number
    description: string
  }
}

interface CacheEntry {
  data: Order[]
  timestamp: number
  etag?: string
}

interface UseOrdersCacheOptions {
  limit?: number
  cacheKey?: string
  cacheDuration?: number // in milliseconds
  refetchOnMount?: boolean
  refetchOnFocus?: boolean
}

const DEFAULT_CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
const GLOBAL_CACHE = new Map<string, CacheEntry>()

export function useOrdersCache(options: UseOrdersCacheOptions = {}) {
  const {
    limit,
    cacheKey = limit ? `orders-limit-${limit}` : 'orders-all',
    cacheDuration = DEFAULT_CACHE_DURATION,
    refetchOnMount = false,
    refetchOnFocus = true
  } = options

  const { getAuthToken } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastFetched, setLastFetched] = useState<number | null>(null)
  const isInitialMount = useRef(true)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Check if cache is valid
  const isCacheValid = useCallback((entry: CacheEntry | undefined): boolean => {
    if (!entry) return false
    return Date.now() - entry.timestamp < cacheDuration
  }, [cacheDuration])

  // Get cache entry
  const getCacheEntry = useCallback((): CacheEntry | undefined => {
    return GLOBAL_CACHE.get(cacheKey)
  }, [cacheKey])

  // Set cache entry
  const setCacheEntry = useCallback((data: Order[], etag?: string) => {
    GLOBAL_CACHE.set(cacheKey, {
      data,
      timestamp: Date.now(),
      etag
    })
  }, [cacheKey])

  // Clear cache
  const clearCache = useCallback(() => {
    GLOBAL_CACHE.delete(cacheKey)
  }, [cacheKey])  // Fetch orders from API
  const fetchOrders = useCallback(async (forceRefresh = false): Promise<void> => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    const abortController = new AbortController()
    abortControllerRef.current = abortController

    try {
      setError(null)

      console.log(`🔍 Fetch request for ${cacheKey}: forceRefresh=${forceRefresh}`)

      // Check cache first unless force refresh
      if (!forceRefresh) {
        const cacheEntry = getCacheEntry()
        if (isCacheValid(cacheEntry)) {
          console.log(`📦 Using cached orders data for ${cacheKey}`)
          performanceMonitor.recordCacheHit()
          setOrders(cacheEntry!.data)
          setLastFetched(cacheEntry!.timestamp)
          setLoading(false)
          return
        } else {
          console.log(`🗑️ Cache invalid or missing for ${cacheKey}:`, {
            hasCache: !!cacheEntry,
            isValid: cacheEntry ? isCacheValid(cacheEntry) : false,
            age: cacheEntry ? Date.now() - cacheEntry.timestamp : 'N/A'
          })
        }
      } else {
        console.log(`🔄 Force refresh requested for ${cacheKey}, skipping cache check`)
      }

      // If no valid cache or force refresh, fetch from API
      setLoading(true)
      console.log(`🌐 Fetching fresh orders data for ${cacheKey}`)
      const fetchStartTime = Date.now()

      // Prepare headers
      const headers: HeadersInit = {
        'Cache-Control': 'no-cache'
      }

      // Add conditional request header if we have etag (but not on force refresh)
      const cacheEntry = getCacheEntry()
      if (cacheEntry?.etag && !forceRefresh) {
        headers['If-None-Match'] = cacheEntry.etag
      }

      try {
        const authToken = await getAuthToken()
        if (authToken) {
          headers['Authorization'] = `Bearer ${authToken}`
        }
      } catch (authError) {
        console.log('Could not get auth token:', authError)
      }

      // Build URL with limit if specified
      const url = limit ? `/api/orders?limit=${limit}` : '/api/orders'

      const response = await fetch(url, {
        method: 'GET',
        headers,
        signal: abortController.signal
      })

      // Handle 304 Not Modified
      if (response.status === 304 && cacheEntry) {
        console.log('📦 Server returned 304, using cached data')
        setOrders(cacheEntry.data)
        setLastFetched(cacheEntry.timestamp)
        setLoading(false)
        return
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success && data.orders) {
        const ordersData = data.orders
        const etag = response.headers.get('etag') || undefined
        const fetchTime = Date.now() - fetchStartTime

        // Record cache miss with response time
        performanceMonitor.recordCacheMiss(fetchTime)

        // Update cache
        setCacheEntry(ordersData, etag)
        
        // Update state
        setOrders(ordersData)
        setLastFetched(Date.now())
        
        console.log(`✅ Fetched ${ordersData.length} orders and cached in ${fetchTime}ms`)
      } else {
        console.warn('No orders found or API returned false success')
        setOrders([])
        setLastFetched(Date.now())
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('🚫 Request aborted')
        return
      }

      console.error('Error fetching orders:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch orders')
      
      // Fallback to cache if available
      const cacheEntry = getCacheEntry()
      if (cacheEntry) {
        console.log('📦 Using cached data as fallback')
        setOrders(cacheEntry.data)
        setLastFetched(cacheEntry.timestamp)
      } else {
        setOrders([])
      }
    } finally {
      setLoading(false)
      abortControllerRef.current = null
    }
  }, [limit, getAuthToken, getCacheEntry, isCacheValid, setCacheEntry])

  // Refresh orders (force refresh)
  const refreshOrders = useCallback(() => {
    return fetchOrders(true)
  }, [fetchOrders])

  // Check if we need to refetch
  const shouldRefetch = useCallback(() => {
    const cacheEntry = getCacheEntry()
    return !isCacheValid(cacheEntry)
  }, [getCacheEntry, isCacheValid])  // Initial fetch on mount and when cache key changes
  useEffect(() => {
    // Reset initial mount flag when cache key changes (different page/component)
    console.log('🔄 Cache key changed, resetting initial mount flag for:', cacheKey)
    isInitialMount.current = true
  }, [cacheKey])
  
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      
      console.log(`🚀 Initial mount for ${cacheKey}, refetchOnMount: ${refetchOnMount}`)
      
      if (refetchOnMount) {
        // Force fetch when refetchOnMount is true
        console.log(`🔄 Force fetching fresh data on mount for ${cacheKey} (refetchOnMount: true)`)
        fetchOrders(true)
        return
      }
      
      // Check cache first only if refetchOnMount is false
      const cacheEntry = getCacheEntry()
      const hasValidCache = isCacheValid(cacheEntry)
      
      console.log(`📦 Cache check for ${cacheKey}: hasCache=${!!cacheEntry}, isValid=${hasValidCache}`)
      
      if (hasValidCache) {
        // Use cache if valid
        console.log('📦 Using cached orders data on mount for', cacheKey)
        performanceMonitor.recordCacheHit()
        setOrders(cacheEntry!.data)
        setLastFetched(cacheEntry!.timestamp)
        setLoading(false)
      } else {
        // Fetch fresh data if no valid cache
        console.log(`🔄 No valid cache found, fetching fresh data on mount for ${cacheKey}`)
        fetchOrders(true)
      }
    }
  }, [fetchOrders, refetchOnMount, getCacheEntry, isCacheValid, cacheKey])

  // Refetch on window focus
  useEffect(() => {
    if (!refetchOnFocus) return

    const handleFocus = () => {
      if (shouldRefetch()) {
        console.log('🔄 Window focused, refetching orders')
        fetchOrders()
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [refetchOnFocus, shouldRefetch, fetchOrders])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return {
    orders,
    loading,
    error,
    lastFetched,
    refreshOrders,
    clearCache,
    isCacheValid: () => isCacheValid(getCacheEntry()),
    cacheAge: lastFetched ? Date.now() - lastFetched : null
  }
}

// Global cache invalidation utilities
export const invalidateOrdersCache = (pattern?: string) => {
  console.log('🗑️ Invalidating orders cache with pattern:', pattern)
  
  if (pattern) {
    // Invalidate caches matching pattern
    const keysToDelete: string[] = []
    for (const key of GLOBAL_CACHE.keys()) {
      if (key.includes(pattern)) {
        keysToDelete.push(key)
        GLOBAL_CACHE.delete(key)
      }
    }
    console.log('🗑️ Deleted cache keys:', keysToDelete)
  } else {
    // Clear all orders caches
    const keysToDelete: string[] = []
    for (const key of GLOBAL_CACHE.keys()) {
      if (key.startsWith('orders-')) {
        keysToDelete.push(key)
        GLOBAL_CACHE.delete(key)
      }
    }
    console.log('🗑️ Deleted all orders cache keys:', keysToDelete)
  }
}

export const preloadOrdersCache = async (options: UseOrdersCacheOptions = {}) => {
  const { limit, cacheKey = limit ? `orders-limit-${limit}` : 'orders-all' } = options
  
  try {
    const headers: HeadersInit = {
      'Cache-Control': 'no-cache'
    }

    const url = limit ? `/api/orders?limit=${limit}` : '/api/orders'
    const response = await fetch(url, { headers })
    
    if (response.ok) {
      const data = await response.json()
      if (data.success && data.orders) {
        const etag = response.headers.get('etag') || undefined
        GLOBAL_CACHE.set(cacheKey, {
          data: data.orders,
          timestamp: Date.now(),
          etag
        })
        console.log(`✅ Preloaded ${data.orders.length} orders to cache`)
      }
    }
  } catch (error) {
    console.error('Error preloading orders cache:', error)
  }
}

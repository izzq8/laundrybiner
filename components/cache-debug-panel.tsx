"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCachePerformance } from '@/hooks/useCachePerformance'
import { invalidateOrdersCache } from '@/hooks/useOrdersCache'
import { RefreshCw, Trash2, BarChart3, Eye, EyeOff } from 'lucide-react'

export function CacheDebugPanel() {
  const [isVisible, setIsVisible] = useState(false)
  const [stats, setStats] = useState({ hitRate: '0%', cacheHits: 0, cacheMisses: 0, totalFetches: 0, averageResponseTime: '0ms' })
  const { getStats, resetStats } = useCachePerformance()

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(getStats())
    }, 2000)

    return () => clearInterval(interval)
  }, [getStats])

  // Only show in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsVisible(true)}
          className="bg-white shadow-lg border-2 border-blue-200"
        >
          <BarChart3 className="w-4 h-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card className="shadow-lg border-2 border-blue-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Cache Debug Panel
            </CardTitle>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsVisible(false)}
            >
              <EyeOff className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Performance Stats */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-gray-50 p-2 rounded">
              <div className="font-medium text-gray-600">Hit Rate</div>
              <div className="text-lg font-bold text-green-600">{stats.hitRate}</div>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <div className="font-medium text-gray-600">Avg Response</div>
              <div className="text-lg font-bold text-blue-600">{stats.averageResponseTime}</div>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <div className="font-medium text-gray-600">Cache Hits</div>
              <div className="text-sm font-semibold text-green-700">{stats.cacheHits}</div>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <div className="font-medium text-gray-600">Cache Misses</div>
              <div className="text-sm font-semibold text-red-700">{stats.cacheMisses}</div>
            </div>
          </div>

          {/* Cache Status */}
          <div className="border-t pt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-600">Cache Status</span>
              <Badge variant={stats.totalFetches > 0 ? 'default' : 'secondary'} className="text-xs">
                {stats.totalFetches > 0 ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div className="text-xs text-gray-500">
              Total Fetches: {stats.totalFetches}
            </div>
          </div>

          {/* Actions */}
          <div className="border-t pt-3 flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => invalidateOrdersCache()}
              className="flex-1 text-xs"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Clear Cache
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={resetStats}
              className="flex-1 text-xs"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Reset Stats
            </Button>
          </div>

          {/* Tips */}
          <div className="border-t pt-3">
            <div className="text-xs text-gray-500">
              <div className="font-medium mb-1">Tips:</div>
              <ul className="space-y-1 text-[10px]">
                <li>• High hit rate = good performance</li>
                <li>• Fast response time = efficient caching</li>
                <li>• Use clear cache to test fresh data</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Helper component to show cache age inline
export function CacheAgeIndicator({ cacheAge }: { cacheAge: number | null }) {
  if (cacheAge === null || process.env.NODE_ENV !== 'development') return null

  const ageInSeconds = Math.round(cacheAge / 1000)
  const isStale = ageInSeconds > 60 // Consider stale after 1 minute

  return (
    <Badge 
      variant={isStale ? 'destructive' : 'secondary'} 
      className="text-xs ml-2"
    >
      {ageInSeconds}s old
    </Badge>
  )
}

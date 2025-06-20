import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

interface CacheableData {
  orders?: any[]
  data?: any
  [key: string]: any
}

export function withETagCache(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const response = await handler(req)
    
    // Only add ETag for successful GET requests with JSON data
    if (req.method === 'GET' && response.status === 200) {
      try {
        const responseClone = response.clone()
        const data = await responseClone.json() as CacheableData
        
        // Only add ETag for responses that contain cacheable data
        if (data.success && (data.orders || data.data)) {
          const content = JSON.stringify(data.orders || data.data)
          const etag = `"${crypto.createHash('md5').update(content).digest('hex')}"`
          
          // Check if client sent If-None-Match header
          const clientETag = req.headers.get('if-none-match')
          if (clientETag === etag) {
            // Return 304 Not Modified
            return new NextResponse(null, {
              status: 304,
              headers: {
                'ETag': etag,
                'Cache-Control': 'public, max-age=0, must-revalidate'
              }
            })
          }
          
          // Add ETag to response
          const newResponse = new NextResponse(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers
          })
          
          newResponse.headers.set('ETag', etag)
          newResponse.headers.set('Cache-Control', 'public, max-age=0, must-revalidate')
          
          return newResponse
        }
      } catch (error) {
        console.warn('Failed to add ETag to response:', error)
      }
    }
    
    return response
  }
}

export function generateETag(data: any): string {
  const content = typeof data === 'string' ? data : JSON.stringify(data)
  return `"${crypto.createHash('md5').update(content).digest('hex')}"`
}

export function checkETagMatch(req: NextRequest, data: any): boolean {
  const clientETag = req.headers.get('if-none-match')
  if (!clientETag) return false
  
  const serverETag = generateETag(data)
  return clientETag === serverETag
}

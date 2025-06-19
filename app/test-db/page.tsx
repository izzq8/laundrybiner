"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function CreateSampleDataPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const createSampleData = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/create-sample-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      
      if (response.ok && data.success) {
        setResult(data)
      } else {
        setError(data.message || 'Failed to create sample data')
      }
    } catch (err) {
      setError('Network error occurred')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const testDebugAPI = async () => {
    try {
      const response = await fetch('/api/debug')
      const data = await response.json()
      console.log('Debug API response:', data)
      setResult({ debug: data })
    } catch (err) {
      console.error('Debug API error:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Database Testing Tools</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Button 
                  onClick={createSampleData} 
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? 'Creating...' : 'Create Sample Data'}
                </Button>
                
                <Button 
                  onClick={testDebugAPI} 
                  variant="outline"
                  className="w-full"
                >
                  Test Debug API
                </Button>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800">Error: {error}</p>
                </div>
              )}

              {result && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 mb-2">Success!</p>
                  <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-96">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

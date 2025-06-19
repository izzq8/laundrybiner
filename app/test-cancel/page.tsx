"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useAlert } from "@/hooks/useAlert"
import { AlertDialog } from "@/components/ui/alert-dialog"

export default function TestCancelOrder() {
  const { alertState, hideAlert, showSuccess, showError, showWarning, showInfo } = useAlert()
  const [orderId, setOrderId] = useState('')
  const [reason, setReason] = useState('Test cancellation')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const testCancelSimple = async () => {
    if (!orderId) {
      showError("Input Required", "Please enter an Order ID")
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/orders/cancel-simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          reason
        }),
      })

      const data = await response.json()
      setResult({
        api: 'cancel-simple',
        status: response.status,
        data
      })
      
      console.log('Simple API Result:', data)
    } catch (error) {
      setResult({
        api: 'cancel-simple',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }
  const testCancelOriginal = async () => {
    if (!orderId) {
      showError("Input Required", "Please enter an Order ID")
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/orders/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          reason
        }),
      })

      const data = await response.json()
      setResult({
        api: 'cancel-original',
        status: response.status,
        data
      })
      
      console.log('Original API Result:', data)
    } catch (error) {
      setResult({
        api: 'cancel-original',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Cancel Order API Testing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Order ID:</label>
              <Input
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Enter order UUID"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Reason:</label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Cancellation reason"
                rows={3}
              />
            </div>

            <div className="flex gap-4">
              <Button 
                onClick={testCancelSimple}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? 'Testing...' : 'Test Simple API'}
              </Button>
              
              <Button 
                onClick={testCancelOriginal}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? 'Testing...' : 'Test Original API'}
              </Button>
            </div>

            {result && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">
                    Result from {result.api} API
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}
          </CardContent>        </Card>
      </div>

      <AlertDialog
        isOpen={alertState.isOpen}
        onClose={hideAlert}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
      />
    </div>
  )
}

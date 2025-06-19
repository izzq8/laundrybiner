"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ManualPaymentUpdatePage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [orderId, setOrderId] = useState("")
  const [status, setStatus] = useState("paid")

  const updatePaymentStatus = async () => {
    if (!orderId.trim()) {
      alert("Please enter Order ID")
      return
    }

    setLoading(true)
    setResult(null)

    try {
      console.log(`Updating payment status for order: ${orderId} to status: ${status}`)
      
      const response = await fetch("/api/payment/status/manual-update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: orderId,
          status: status,
        }),
      })

      const data = await response.json()
      console.log("Manual update response:", data)
      
      setResult(data)

      if (data.success) {
        alert(`Payment status updated successfully! Updated ${data.updated_orders} order(s)`)
      } else {
        alert(`Failed to update payment status: ${data.message}`)
      }    } catch (error) {
      console.error("Update error:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      setResult({ error: errorMessage })
      alert(`Error: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Manual Payment Status Update</CardTitle>
          <p className="text-sm text-gray-600">
            Use this tool to manually update payment status for testing purposes.
            Enter the Order ID or Order Number (e.g., LDY-20250619-0003).
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Order ID / Order Number
            </label>
            <Input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="e.g., LDY-20250619-0003 or transaction ID"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Payment Status
            </label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paid">Paid (Success)</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            onClick={updatePaymentStatus} 
            disabled={loading}
            className="w-full"
          >
            {loading ? "Updating..." : "Update Payment Status"}
          </Button>

          {result && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">Update Result:</h3>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 rounded">
            <h4 className="font-medium text-blue-800 mb-2">How to use:</h4>
            <ol className="text-sm text-blue-700 space-y-1">
              <li>1. Go to /orders page and copy the Order Number (e.g., LDY-20250619-0003)</li>
              <li>2. Paste it in the Order ID field above</li>
              <li>3. Select "Paid (Success)" status</li>
              <li>4. Click "Update Payment Status"</li>
              <li>5. Refresh the orders page to see the updated status</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
